import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { Cliente, ClienteRegistro, ClienteLogin } from '../../Model/Cliente/cliente';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = '/api/clientes';
  private clientesSubject = new BehaviorSubject<Cliente[]>([]);
  public clientes$ = this.clientesSubject.asObservable();
  
  // Subject para el cliente actual
  private currentClienteSubject = new BehaviorSubject<Cliente | null>(null);
  public currentCliente$ = this.currentClienteSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadClientes();
    // Verificar si hay un usuario logueado al inicializar el servicio
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const cliente = this.getCurrentCliente();
      if (cliente) {
        this.currentClienteSubject.next(cliente);
      }
    }
  }

  // Cargar clientes desde localStorage o usar mock data
  private loadClientes(): void {
    const stored = localStorage.getItem('clientes');
    if (stored) {
      try {
        const clientes = JSON.parse(stored);
        // Si hay datos almacenados, usarlos para inicializar el subject
        this.clientesSubject.next(clientes);
      } catch (e) {
        // Si falla el parseo, inicializar con mock por seguridad
        const mockClientes = this.getMockClientes();
        this.saveClientesToStorage(mockClientes);
      }
    } else {
      // Si no hay datos en storage, inicializar con mock (incluye usuario admin)
      const mockClientes = this.getMockClientes();
      this.saveClientesToStorage(mockClientes);
    }
  }

  // Guardar clientes en localStorage
  private saveClientesToStorage(clientes: Cliente[]): void {
    localStorage.setItem('clientes', JSON.stringify(clientes));
    this.clientesSubject.next(clientes);
  }

  // Registrar nuevo cliente (backend)
  registrarCliente(clienteData: ClienteRegistro): Observable<Cliente> {
    const payload = {
      nombre: clienteData.nombre,
      apellido: clienteData.apellido,
      correo: clienteData.correo,
      contrasena: clienteData.contrasena,
      telefono: clienteData.telefono,
      direccion: clienteData.direccion
    };
    return this.http.post<any>(`${this.apiUrl}`, payload).pipe(
      // El backend devuelve { success, message, cliente }
      // Mapear para retornar el objeto cliente
      // y completar campos opcionales del modelo frontend
      // que el backend no provee (fechaRegistro, pedidos)
      
      // Nota: si el backend cambia el contrato, ajustar aquí
      
      // Aseguramos que siempre devolvemos un Cliente
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map((res: any) => {
        const cli = res?.cliente ?? res;
        const mapped: Cliente = {
          id: cli.id,
          nombre: cli.nombre,
          apellido: cli.apellido,
          correo: cli.correo,
          telefono: cli.telefono,
          direccion: cli.direccion,
          fechaRegistro: cli.fechaRegistro ? new Date(cli.fechaRegistro) : new Date(),
          activo: typeof cli.activo === 'boolean' ? cli.activo : true,
          pedidos: cli.pedidos ?? []
        };
        return mapped;
      })
    );
  }

  // Login de cliente (mantiene localStorage por ahora)
  loginCliente(loginData: ClienteLogin): Observable<Cliente | null> {
    return new Observable(observer => {
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      const cliente = clientes.find((c: Cliente) => 
        c.correo === loginData.correo && 
        c.contrasena === loginData.contrasena && 
        c.activo
      );
      
      if (cliente) {
        // Determinar el tipo de usuario
        const tipoUsuario = cliente.correo === 'admin@burgerclub.com' ? 'admin' : 'cliente';
        
        // Guardar información de sesión
        localStorage.setItem('currentUser', JSON.stringify({
          id: cliente.id,
          nombre: cliente.nombre,
          correo: cliente.correo,
          tipo: tipoUsuario
        }));
        // Actualizar el BehaviorSubject con el cliente actual
        this.currentClienteSubject.next(cliente);
        observer.next(cliente);
      } else {
        observer.next(null);
      }
      observer.complete();
    });
  }

  // Obtener todos los clientes (backend)
  getAllClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/list`).pipe(
      map((lista: any[]) => (Array.isArray(lista) ? lista : []).map((cli: any) => ({
        id: cli.id,
        nombre: cli.nombre,
        apellido: cli.apellido,
        correo: cli.correo,
        telefono: cli.telefono,
        direccion: cli.direccion,
        fechaRegistro: cli.fechaRegistro ? new Date(cli.fechaRegistro) : new Date(),
        activo: typeof cli.activo === 'boolean' ? cli.activo : true,
        pedidos: cli.pedidos ?? []
      } as Cliente)))
      ,
      catchError((err) => {
        console.error('Error en getAllClientes:', err);
        return of([] as Cliente[]);
      })
    );
  }

  // Obtener cliente por ID (backend)
  getClienteById(id: number): Observable<Cliente | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(cli => {
        if (!cli) return undefined;
        const mapped: Cliente = {
          id: cli.id,
          nombre: cli.nombre,
          apellido: cli.apellido,
          correo: cli.correo,
          telefono: cli.telefono,
          direccion: cli.direccion,
          fechaRegistro: cli.fechaRegistro ? new Date(cli.fechaRegistro) : new Date(),
          activo: typeof cli.activo === 'boolean' ? cli.activo : true,
          pedidos: cli.pedidos ?? []
        };
        return mapped;
      })
    );
  }

  // Actualizar cliente (backend)
  updateCliente(id: number, cliente: Partial<Cliente>): Observable<Cliente> {
    const payload = {
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      correo: cliente.correo,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      contrasena: (cliente as any)?.contrasena // opcional
    };
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(
      map((res: any) => {
        const cli = res?.cliente ?? res;
        const mapped: Cliente = {
          id: cli.id,
          nombre: cli.nombre,
          apellido: cli.apellido,
          correo: cli.correo,
          telefono: cli.telefono,
          direccion: cli.direccion,
          fechaRegistro: cli.fechaRegistro ? new Date(cli.fechaRegistro) : new Date(),
          activo: typeof cli.activo === 'boolean' ? cli.activo : true,
          pedidos: cli.pedidos ?? []
        };
        return mapped;
      })
    );
  }

  // Eliminar cliente (backend)
  deleteCliente(id: number): Observable<{ success?: boolean; message?: string }> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Buscar clientes por término
  searchClientes(termino: string): Observable<Cliente[]> {
    return new Observable(observer => {
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      const filtered = clientes.filter((c: Cliente) => 
        c.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        c.correo.toLowerCase().includes(termino.toLowerCase()) ||
        c.telefono.includes(termino)
      );
      observer.next(filtered);
      observer.complete();
    });
  }

  // Obtener estadísticas de clientes (backend)
  getEstadisticas(): Observable<{totalClientes: number, clientesActivos: number, clientesInactivos: number}> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      map((res: any) => {
        const total = typeof res?.total === 'number' ? res.total : 0;
        const activos = typeof res?.activos === 'number' ? res.activos : 0;
        return {
          totalClientes: total,
          clientesActivos: activos,
          clientesInactivos: Math.max(0, total - activos)
        };
      })
    );
  }

  // Métodos de autenticación adicionales
  isLoggedIn(): Observable<boolean> {
    return new Observable(observer => {
      const currentUser = localStorage.getItem('currentUser');
      observer.next(!!currentUser);
      observer.complete();
    });
  }

  getCurrentCliente(): Cliente | null {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      return clientes.find((c: Cliente) => c.id === userData.id) || null;
    }
    return null;
  }

  logout(): Observable<boolean> {
    return new Observable(observer => {
      localStorage.removeItem('currentUser');
      // Actualizar el BehaviorSubject para indicar que no hay cliente logueado
      this.currentClienteSubject.next(null);
      observer.next(true);
      observer.complete();
    });
  }

  // Obtener datos mock de clientes
  private getMockClientes(): Cliente[] {
    return [
      {
        id: 0,
        nombre: 'Admin',
        apellido: 'BurgerClub',
        correo: 'admin@burgerclub.com',
        contrasena: 'admin123',
        telefono: '3000000000',
        direccion: 'Oficina Central',
        fechaRegistro: new Date('2024-01-01'),
        activo: true,
        pedidos: []
      },
      {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        correo: 'juan@email.com',
        contrasena: '123456',
        telefono: '3001234567',
        direccion: 'Calle 123 #45-67',
        fechaRegistro: new Date('2024-01-15'),
        activo: true,
        pedidos: [1, 3, 5]
      },
      {
        id: 2,
        nombre: 'María',
        apellido: 'González',
        correo: 'maria@email.com',
        contrasena: '123456',
        telefono: '3007654321',
        direccion: 'Carrera 45 #12-34',
        fechaRegistro: new Date('2024-02-10'),
        activo: true,
        pedidos: [2, 4]
      },
      {
        id: 3,
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        correo: 'carlos@email.com',
        contrasena: '123456',
        telefono: '3009876543',
        direccion: 'Avenida 80 #23-45',
        fechaRegistro: new Date('2024-03-05'),
        activo: false,
        pedidos: []
      }
    ];
  }
}
