import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Cliente, ClienteRegistro, ClienteLogin } from '../../Model/Cliente/cliente';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = '/api/clientes';
  private authUrl = '/api/auth';
  private clientesSubject = new BehaviorSubject<Cliente[]>([]);
  public clientes$ = this.clientesSubject.asObservable();
  
  // Subject para el cliente actual
  private currentClienteSubject = new BehaviorSubject<Cliente | null>(null);
  public currentCliente$ = this.currentClienteSubject.asObservable();
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {
    // Inicializar desde backend: clientes y sesión actual
    this.getAllClientes().subscribe({
      next: (clientes) => this.clientesSubject.next(clientes),
      error: () => this.clientesSubject.next([])
    });

    // Hidratar sesión desde localStorage inmediatamente (fallback rápido)
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const parsed = JSON.parse(raw);
        const mapped: Cliente = {
          id: parsed.id,
          nombre: parsed.nombre,
          apellido: parsed.apellido,
          correo: parsed.correo ?? parsed.email,
          telefono: parsed.telefono,
          direccion: parsed.direccion,
          fechaRegistro: parsed.fechaRegistro ? new Date(parsed.fechaRegistro) : new Date(),
          activo: typeof parsed.activo === 'boolean' ? parsed.activo : true,
          pedidos: parsed.pedidos ?? []
        };
        this.currentClienteSubject.next(mapped);
      }
    } catch {}

    this.http.get<any>(`${this.authUrl}/current`, { withCredentials: true }).pipe(
      map((cli: any) => {
        const src = cli?.cliente ?? cli?.user ?? cli;
        if (!src) return null;
        const mapped: Cliente = {
          id: src.id,
          nombre: src.nombre,
          apellido: src.apellido,
          correo: src.correo ?? src.email,
          telefono: src.telefono,
          direccion: src.direccion,
          fechaRegistro: src.fechaRegistro ? new Date(src.fechaRegistro) : new Date(),
          activo: typeof src.activo === 'boolean' ? src.activo : true,
          pedidos: src.pedidos ?? []
        };
        return mapped;
      })
    ).subscribe({
      next: (cliente) => {
        this.currentClienteSubject.next(cliente);
        this.isLoggedInSubject.next(!!cliente);
        this.persistCurrentUser(cliente);
      },
      error: () => {
        this.currentClienteSubject.next(null);
        this.isLoggedInSubject.next(false);
        this.persistCurrentUser(null);
      }
    });

    // Mantener sincronizado el estado de autenticación con el subject del cliente
    this.isLoggedInSubject.next(!!this.currentClienteSubject.value);
    this.currentCliente$.subscribe(cli => this.isLoggedInSubject.next(!!cli));
  }

  // Helper seguro para parsear JSON desde localStorage con fallback
  private safeParse<T>(raw: string | null, fallback: T): T {
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw);
      return (parsed !== undefined && parsed !== null) ? parsed as T : fallback;
    } catch {
      return fallback;
    }
  }

  // Obtener clientes almacenados de forma segura
  private getStoredClientes(): any[] {
    const parsed = this.safeParse<any[]>(localStorage.getItem('clientes'), []);
    return Array.isArray(parsed) ? parsed : [];
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
  registrarCliente(clienteData: ClienteRegistro & { confirmPassword?: string }): Observable<Cliente> {
    // Backend espera { nombre, apellido, email, password, confirmPassword, telefono, direccion }
    const payload = {
      nombre: clienteData.nombre,
      apellido: clienteData.apellido,
      email: clienteData.correo,
      password: (clienteData as any).contrasena,
      confirmPassword: (clienteData as any).confirmPassword ?? (clienteData as any).contrasena,
      telefono: clienteData.telefono,
      direccion: clienteData.direccion
    };
    return this.http.post<any>(`${this.authUrl}/register`, payload, { withCredentials: true }).pipe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map((res: any) => {
        const cli = res?.cliente ?? res?.user ?? res;
        const mapped: Cliente = {
          id: cli.id,
          nombre: cli.nombre,
          apellido: cli.apellido,
          correo: cli.correo ?? cli.email,
          telefono: cli.telefono,
          direccion: cli.direccion,
          fechaRegistro: cli.fechaRegistro ? new Date(cli.fechaRegistro) : new Date(),
          activo: typeof cli.activo === 'boolean' ? cli.activo : true,
          pedidos: cli.pedidos ?? []
        };
        return mapped;
      }),
      // Tras registro, refrescar datos completos desde /auth/current para asegurar telefono/direccion
      switchMap((mapped: Cliente) => this.http.get<any>(`${this.authUrl}/current`, { withCredentials: true }).pipe(
        map((cli: any) => {
          const src = cli?.cliente ?? cli?.user ?? cli;
          if (!src) return mapped;
          const full: Cliente = {
            id: src.id,
            nombre: src.nombre,
            apellido: src.apellido,
            correo: src.correo ?? src.email,
            telefono: src.telefono,
            direccion: src.direccion,
            fechaRegistro: src.fechaRegistro ? new Date(src.fechaRegistro) : new Date(),
            activo: typeof src.activo === 'boolean' ? src.activo : true,
            pedidos: src.pedidos ?? []
          };
          return full;
        }),
        catchError(() => of(mapped))
      )),
      tap((finalCliente: Cliente) => {
        this.currentClienteSubject.next(finalCliente);
        this.persistCurrentUser(finalCliente);
      }),
      catchError((err) => {
        // No hacer fallback local en errores de validación (400)
        if (err?.status === 400) {
          return throwError(() => err);
        }
        // Fallback offline sólo para errores de red u otros
        console.error('Error en registrarCliente, usando fallback local:', err);
        const clientes = this.getStoredClientes();
        const nextId = clientes.length ? Math.max(...clientes.map((c: any) => c.id)) + 1 : 1;
        const nuevo = {
          id: nextId,
          nombre: payload.nombre,
          apellido: payload.apellido,
          correo: clienteData.correo,
          contrasena: (clienteData as any).contrasena,
          telefono: payload.telefono,
          direccion: payload.direccion,
          fechaRegistro: new Date(),
          activo: true,
          pedidos: []
        };
        clientes.push(nuevo);
        this.saveClientesToStorage(clientes);
        const mapped: Cliente = {
          id: nuevo.id,
          nombre: nuevo.nombre,
          apellido: nuevo.apellido,
          correo: nuevo.correo,
          telefono: nuevo.telefono,
          direccion: nuevo.direccion,
          fechaRegistro: new Date(nuevo.fechaRegistro),
          activo: true,
          pedidos: []
        };
        this.currentClienteSubject.next(mapped);
        this.persistCurrentUser(mapped);
        return of(mapped);
      })
    );
  }

  // Login de cliente (backend)
  loginCliente(loginData: ClienteLogin): Observable<Cliente | null> {
    // Backend espera { email, password } en lugar de { correo, contrasena }
    const payload = {
      email: loginData.correo,
      password: loginData.contrasena
    };
    return this.http.post<any>(`${this.authUrl}/login`, payload, { withCredentials: true }).pipe(
      map((res: any) => {
        const cli = res?.cliente ?? res?.user ?? res;
        if (!cli) return null;
        const mapped: Cliente = {
          id: cli.id,
          nombre: cli.nombre,
          apellido: cli.apellido,
          correo: cli.correo ?? cli.email,
          telefono: cli.telefono,
          direccion: cli.direccion,
          fechaRegistro: cli.fechaRegistro ? new Date(cli.fechaRegistro) : new Date(),
          activo: typeof cli.activo === 'boolean' ? cli.activo : true,
          pedidos: cli.pedidos ?? []
        };
        return mapped;
      }),
      // Refrescar con /auth/current para obtener teléfono/dirección completas
      switchMap((mapped: Cliente | null) => {
        if (!mapped) return of(null);
        return this.http.get<any>(`${this.authUrl}/current`, { withCredentials: true }).pipe(
          map((cli: any) => {
            const src = cli?.cliente ?? cli?.user ?? cli;
            if (!src) return mapped;
            const full: Cliente = {
              id: src.id,
              nombre: src.nombre,
              apellido: src.apellido,
              correo: src.correo ?? src.email,
              telefono: src.telefono,
              direccion: src.direccion,
              fechaRegistro: src.fechaRegistro ? new Date(src.fechaRegistro) : new Date(),
              activo: typeof src.activo === 'boolean' ? src.activo : true,
              pedidos: src.pedidos ?? []
            };
            return full;
          }),
          catchError(() => of(mapped))
        );
      }),
      tap((finalCliente: Cliente | null) => {
        if (finalCliente) {
          this.currentClienteSubject.next(finalCliente);
          this.persistCurrentUser(finalCliente);
        }
      }),
      catchError((err) => {
        // Mapear errores 400 (credenciales inválidas) a null
        if (err?.status === 400) {
          return of(null);
        }
        // Para otros errores, propagar
        return throwError(() => err);
      })
    );
  }

  // Obtener todos los clientes (backend)
  getAllClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/list`).pipe(
      map((lista: any[]) => (Array.isArray(lista) ? lista : []).map((cli: any) => ({
        id: cli.id,
        nombre: cli.nombre,
        apellido: cli.apellido,
        correo: cli.correo ?? cli.email,
        telefono: cli.telefono,
        direccion: cli.direccion,
        fechaRegistro: cli.fechaRegistro ? new Date(cli.fechaRegistro) : new Date(),
        activo: typeof cli.activo === 'boolean' ? cli.activo : true,
        pedidos: cli.pedidos ?? []
      } as Cliente)))
      ,
      catchError((err) => {
        // Evitar ruido en consola: usar aviso en vez de error y hacer fallback silencioso
        console.warn('Backend no disponible en getAllClientes, usando datos de localStorage.');
        const parsed = this.getStoredClientes();
        let stored: Cliente[] = (Array.isArray(parsed) ? parsed : []).map((cli: any) => ({
          id: cli.id,
          nombre: cli.nombre,
          apellido: cli.apellido,
          correo: cli.correo,
          telefono: cli.telefono,
          direccion: cli.direccion,
          fechaRegistro: cli.fechaRegistro ? new Date(cli.fechaRegistro) : new Date(),
          activo: typeof cli.activo === 'boolean' ? cli.activo : true,
          pedidos: cli.pedidos ?? []
        } as Cliente));
        if (!stored.length) {
          stored = this.getMockClientes();
          this.saveClientesToStorage(stored);
        }
        this.clientesSubject.next(stored);
        return of(stored);
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
          correo: cli.correo ?? cli.email,
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
      // incluir ambas claves para maximizar compatibilidad con backend
      correo: cliente.correo,
      email: cliente.correo,
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
          correo: cli.correo ?? cli.email,
          telefono: cli.telefono,
          direccion: cli.direccion,
          fechaRegistro: cli.fechaRegistro ? new Date(cli.fechaRegistro) : new Date(),
          activo: typeof cli.activo === 'boolean' ? cli.activo : true,
          pedidos: cli.pedidos ?? []
        };
        // Propagar cliente actualizado a toda la app
        this.currentClienteSubject.next(mapped);
        this.persistCurrentUser(mapped);
        // Actualizar almacenamiento local si existe una lista
        const clientes = this.getStoredClientes();
        const idx = clientes.findIndex((c: any) => c.id === mapped.id);
        if (idx !== -1) {
          clientes[idx] = {
            ...clientes[idx],
            nombre: mapped.nombre,
            apellido: mapped.apellido,
            correo: mapped.correo,
            telefono: mapped.telefono,
            direccion: mapped.direccion
          };
          this.saveClientesToStorage(clientes);
        }
        return mapped;
      }),
      catchError((err) => {
        console.error('Error en updateCliente, usando fallback local:', err);
        const clientes = this.getStoredClientes();
        const idx = clientes.findIndex((c: any) => c.id === id);
        if (idx !== -1) {
          const updated = {
            ...clientes[idx],
            nombre: payload.nombre,
            apellido: payload.apellido,
            correo: payload.correo,
            telefono: payload.telefono,
            direccion: payload.direccion
          };
          clientes[idx] = updated;
          this.saveClientesToStorage(clientes);
          const mapped: Cliente = {
            id: updated.id,
            nombre: updated.nombre,
            apellido: updated.apellido,
            correo: updated.correo,
            telefono: updated.telefono,
            direccion: updated.direccion,
            fechaRegistro: updated.fechaRegistro ? new Date(updated.fechaRegistro) : new Date(),
            activo: typeof updated.activo === 'boolean' ? updated.activo : true,
            pedidos: updated.pedidos ?? []
          };
          // Propagar fallback también al estado actual
          this.currentClienteSubject.next(mapped);
          this.persistCurrentUser(mapped);
          return of(mapped);
        }
        return of({
          id,
          nombre: payload.nombre || '',
          apellido: payload.apellido || '',
          correo: (payload as any).correo || (payload as any).email || '',
          telefono: payload.telefono || '',
          direccion: payload.direccion || '',
          fechaRegistro: new Date(),
          activo: true,
          pedidos: []
        } as Cliente);
      })
    );
  }

  // Eliminar cliente (backend)
  deleteCliente(id: number): Observable<{ success?: boolean; message?: string }> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => {
        console.error('Error en deleteCliente, usando fallback local:', err);
        const clientes = this.getStoredClientes();
        const filtrados = clientes.filter((c: any) => c.id !== id);
        this.saveClientesToStorage(filtrados);
        return of({ success: true, message: 'Eliminado localmente' });
      })
    );
  }

  // Buscar clientes por término
  searchClientes(termino: string): Observable<Cliente[]> {
    return new Observable(observer => {
      const clientes = this.getStoredClientes();
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
      }),
      catchError(() => {
        const clientes = this.getStoredClientes();
        const total = clientes.length;
        const activos = clientes.filter((c: any) => c.activo).length;
        return of({
          totalClientes: total,
          clientesActivos: activos,
          clientesInactivos: Math.max(0, total - activos)
        });
      })
    );
  }

  // Métodos de autenticación adicionales
  isLoggedIn(): Observable<boolean> {
    // Evita múltiples llamadas HTTP: deriva del estado actual
    return this.isLoggedIn$;
  }

  getCurrentCliente(): Cliente | null {
    return this.currentClienteSubject.value;
  }

  logout(): Observable<boolean> {
    return this.http.post<any>(`${this.authUrl}/logout`, {}, { withCredentials: true }).pipe(
      map(() => {
        this.currentClienteSubject.next(null);
        this.persistCurrentUser(null);
        return true;
      })
    );
  }

  // Persistencia de sesión en localStorage
  private persistCurrentUser(cliente: Cliente | null): void {
    try {
      if (cliente) {
        const plain = {
          id: cliente.id,
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          correo: cliente.correo,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          fechaRegistro: cliente.fechaRegistro,
          activo: cliente.activo,
          pedidos: cliente.pedidos
        };
        localStorage.setItem('currentUser', JSON.stringify(plain));
      } else {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('carrito');
      }
    } catch {}
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
