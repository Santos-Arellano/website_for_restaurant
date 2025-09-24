import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Cliente, ClienteRegistro, ClienteLogin } from '../../Model/Cliente/cliente';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = 'http://localhost:8080/api/clientes';
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
    // Forzar recarga de datos mock para incluir el usuario admin
    const mockClientes = this.getMockClientes();
    this.saveClientesToStorage(mockClientes);
    this.clientesSubject.next(mockClientes);
  }

  // Guardar clientes en localStorage
  private saveClientesToStorage(clientes: Cliente[]): void {
    localStorage.setItem('clientes', JSON.stringify(clientes));
    this.clientesSubject.next(clientes);
  }

  // Registrar nuevo cliente
  registrarCliente(clienteData: ClienteRegistro): Observable<Cliente> {
    return new Observable(observer => {
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      
      // Verificar si el correo ya existe
      const correoExiste = clientes.some((c: Cliente) => c.correo === clienteData.correo);
      if (correoExiste) {
        observer.error('El correo ya está registrado');
        return;
      }

      const nuevoCliente: Cliente = {
        id: Date.now(),
        nombre: clienteData.nombre,
        apellido: clienteData.apellido,
        correo: clienteData.correo,
        contrasena: clienteData.contrasena,
        telefono: clienteData.telefono,
        direccion: clienteData.direccion,
        fechaRegistro: new Date(),
        activo: true,
        pedidos: []
      };
      
      clientes.push(nuevoCliente);
      this.saveClientesToStorage(clientes);
      
      // Guardar información de sesión automáticamente después del registro
      localStorage.setItem('currentUser', JSON.stringify({
        id: nuevoCliente.id,
        nombre: nuevoCliente.nombre,
        correo: nuevoCliente.correo,
        tipo: 'cliente'
      }));
      
      // Actualizar el BehaviorSubject con el nuevo cliente
      this.currentClienteSubject.next(nuevoCliente);
      
      observer.next(nuevoCliente);
      observer.complete();
    });
  }

  // Login de cliente
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

  // Obtener todos los clientes
  getAllClientes(): Observable<Cliente[]> {
    return this.clientes$;
  }

  // Obtener cliente por ID
  getClienteById(id: number): Observable<Cliente | undefined> {
    return new Observable(observer => {
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      const cliente = clientes.find((c: Cliente) => c.id === id);
      observer.next(cliente);
      observer.complete();
    });
  }

  // Actualizar cliente
  updateCliente(id: number, cliente: Partial<Cliente>): Observable<Cliente> {
    return new Observable(observer => {
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      const index = clientes.findIndex((c: Cliente) => c.id === id);
      if (index !== -1) {
        clientes[index] = { ...clientes[index], ...cliente };
        this.saveClientesToStorage(clientes);
        observer.next(clientes[index]);
      } else {
        observer.error('Cliente no encontrado');
      }
      observer.complete();
    });
  }

  // Alternar estado activo del cliente
  toggleClienteStatus(id: number): Observable<Cliente> {
    return new Observable(observer => {
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      const index = clientes.findIndex((c: Cliente) => c.id === id);
      if (index !== -1) {
        clientes[index].activo = !clientes[index].activo;
        this.saveClientesToStorage(clientes);
        observer.next(clientes[index]);
      } else {
        observer.error('Cliente no encontrado');
      }
      observer.complete();
    });
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

  // Obtener estadísticas de clientes
  getEstadisticas(): Observable<{totalClientes: number, clientesActivos: number, clientesInactivos: number}> {
    return new Observable(observer => {
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      const stats = {
        totalClientes: clientes.length,
        clientesActivos: clientes.filter((c: Cliente) => c.activo).length,
        clientesInactivos: clientes.filter((c: Cliente) => !c.activo).length
      };
      observer.next(stats);
      observer.complete();
    });
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
