import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Domiciliario } from '../../Model/Domiciliario/domiciliario';
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DomiciliarioService {
  private apiUrl = '/api/domiciliarios';
  private domiciliariosSubject = new BehaviorSubject<Domiciliario[]>([]);
  public domiciliarios$ = this.domiciliariosSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadDomiciliarios();
  }

  // Cargar domiciliarios desde localStorage o usar mock data
  private loadDomiciliarios(): void {
    const domiciliariosGuardados = localStorage.getItem('domiciliarios');
    if (domiciliariosGuardados) {
      const domiciliarios = JSON.parse(domiciliariosGuardados);
      this.domiciliariosSubject.next(domiciliarios);
    } else {
      const mockDomiciliarios = this.getMockDomiciliarios();
      this.saveDomiciliariosToStorage(mockDomiciliarios);
      this.domiciliariosSubject.next(mockDomiciliarios);
    }
  }

  // Guardar domiciliarios en localStorage
  private saveDomiciliariosToStorage(domiciliarios: Domiciliario[]): void {
    localStorage.setItem('domiciliarios', JSON.stringify(domiciliarios));
    this.domiciliariosSubject.next(domiciliarios);
  }

  // Obtener todos los domiciliarios
  getDomiciliarios(): Observable<Domiciliario[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, { withCredentials: true }).pipe(
      map((lista: any[]) => (Array.isArray(lista) ? lista : []).map((d: any) => ({
        id: d.id,
        nombre: d.nombre,
        cedula: d.cedula,
        telefono: d.telefono ?? '',
        vehiculo: d.vehiculo ?? '',
        placa: d.placa ?? '',
        activo: typeof d.activo === 'boolean' ? d.activo : true,
        disponible: typeof d.disponible === 'boolean' ? d.disponible : true,
        fechaIngreso: d.fechaIngreso ? new Date(d.fechaIngreso) : new Date(),
        pedidosEntregados: d.pedidosEntregados ?? 0,
        pedidos: d.pedidos ?? []
      } as Domiciliario))),
      tap((doms) => this.domiciliariosSubject.next(doms)),
      catchError(() => {
        const raw = localStorage.getItem('domiciliarios');
        const parsed: Domiciliario[] = raw ? JSON.parse(raw) : [];
        return of(Array.isArray(parsed) ? parsed : []);
      })
    );
  }

  // Obtener domiciliario por ID
  getDomiciliarioById(id: number): Observable<Domiciliario | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { withCredentials: true }).pipe(
      map((d: any) => {
        if (!d) return undefined;
        const mapped: Domiciliario = {
          id: d.id,
          nombre: d.nombre,
          cedula: d.cedula,
          telefono: d.telefono ?? '',
          vehiculo: d.vehiculo ?? '',
          placa: d.placa ?? '',
          activo: typeof d.activo === 'boolean' ? d.activo : true,
          disponible: typeof d.disponible === 'boolean' ? d.disponible : true,
          fechaIngreso: d.fechaIngreso ? new Date(d.fechaIngreso) : new Date(),
          pedidosEntregados: d.pedidosEntregados ?? 0,
          pedidos: d.pedidos ?? []
        };
        return mapped;
      }),
      catchError(() => {
        const almacenados = JSON.parse(localStorage.getItem('domiciliarios') || '[]');
        const encontrado = (Array.isArray(almacenados) ? almacenados : []).find((x: Domiciliario) => x.id === id);
        return of(encontrado);
      })
    );
  }

  // Crear nuevo domiciliario
  createDomiciliario(domiciliario: Omit<Domiciliario, 'id' | 'fechaIngreso' | 'pedidosEntregados'>): Observable<Domiciliario> {
    const payload = {
      nombre: domiciliario.nombre,
      cedula: domiciliario.cedula!,
      disponible: typeof domiciliario.disponible === 'boolean' ? domiciliario.disponible : true,
      telefono: domiciliario.telefono ?? '',
      vehiculo: domiciliario.vehiculo ?? '',
      placa: domiciliario.placa ?? ''
    };

    return this.http.post<any>(`${this.apiUrl}`, payload, { withCredentials: true }).pipe(
      map((d: any) => ({
        id: d.id,
        nombre: d.nombre,
        cedula: d.cedula,
        telefono: d.telefono ?? '',
        vehiculo: d.vehiculo ?? '',
        placa: d.placa ?? '',
        activo: typeof d.activo === 'boolean' ? d.activo : true,
        disponible: typeof d.disponible === 'boolean' ? d.disponible : true,
        fechaIngreso: d.fechaIngreso ? new Date(d.fechaIngreso) : new Date(),
        pedidosEntregados: d.pedidosEntregados ?? 0,
        pedidos: d.pedidos ?? []
      } as Domiciliario)),
      tap(() => {
        // Tras crear, refrescar la lista desde backend
        this.getDomiciliarios().subscribe();
      })
    );
  }

  // Actualizar domiciliario (usar backend)
  updateDomiciliario(id: number, domiciliario: Partial<Domiciliario>): Observable<Domiciliario> {
    const payload = {
      nombre: domiciliario.nombre,
      cedula: domiciliario.cedula,
      disponible: typeof domiciliario.disponible === 'boolean' ? domiciliario.disponible : undefined,
      telefono: domiciliario.telefono ?? undefined,
      vehiculo: domiciliario.vehiculo ?? undefined,
      placa: domiciliario.placa ?? undefined
    };

    return this.http.put<any>(`${this.apiUrl}/${id}`, payload, { withCredentials: true }).pipe(
      map((d: any) => ({
        id: d.id,
        nombre: d.nombre,
        cedula: d.cedula,
        telefono: d.telefono ?? '',
        vehiculo: d.vehiculo ?? '',
        placa: d.placa ?? '',
        activo: typeof d.activo === 'boolean' ? d.activo : true,
        disponible: typeof d.disponible === 'boolean' ? d.disponible : true,
        fechaIngreso: d.fechaIngreso ? new Date(d.fechaIngreso) : new Date(),
        pedidosEntregados: d.pedidosEntregados ?? 0,
        pedidos: d.pedidos ?? []
      } as Domiciliario)),
      tap(() => {
        // Refrescar la lista en memoria tras actualizar
        this.getDomiciliarios().subscribe();
      })
    );
  }

  // Eliminar domiciliario
  deleteDomiciliario(id: number): Observable<boolean> {
    return new Observable(observer => {
      const domiciliarios = JSON.parse(localStorage.getItem('domiciliarios') || '[]');
      const index = domiciliarios.findIndex((d: Domiciliario) => d.id === id);
      if (index !== -1) {
        domiciliarios.splice(index, 1);
        this.saveDomiciliariosToStorage(domiciliarios);
        observer.next(true);
      } else {
        observer.error('Domiciliario no encontrado');
      }
      observer.complete();
    });
  }

  // Alternar estado activo del domiciliario
  toggleDomiciliarioStatus(id: number): Observable<Domiciliario> {
    return new Observable(observer => {
      const domiciliarios = JSON.parse(localStorage.getItem('domiciliarios') || '[]');
      const index = domiciliarios.findIndex((d: Domiciliario) => d.id === id);
      if (index !== -1) {
        domiciliarios[index].activo = !domiciliarios[index].activo;
        this.saveDomiciliariosToStorage(domiciliarios);
        observer.next(domiciliarios[index]);
      } else {
        observer.error('Domiciliario no encontrado');
      }
      observer.complete();
    });
  }

  // Buscar domiciliarios por término
  searchDomiciliarios(termino: string): Observable<Domiciliario[]> {
    return new Observable(observer => {
      const domiciliarios = JSON.parse(localStorage.getItem('domiciliarios') || '[]');
      const filtered = domiciliarios.filter((d: Domiciliario) => 
        d.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        d.telefono.includes(termino) ||
        d.vehiculo.toLowerCase().includes(termino.toLowerCase())
      );
      observer.next(filtered);
      observer.complete();
    });
  }

  // Obtener domiciliarios disponibles
  getDomiciliariosDisponibles(): Observable<Domiciliario[]> {
    return this.http.get<any[]>(`${this.apiUrl}/disponibles`, { withCredentials: true }).pipe(
      map((lista: any[]) => (Array.isArray(lista) ? lista : []).map((d: any) => ({
        id: d.id,
        nombre: d.nombre,
        cedula: d.cedula,
        telefono: d.telefono ?? '',
        vehiculo: d.vehiculo ?? '',
        placa: d.placa ?? '',
        activo: typeof d.activo === 'boolean' ? d.activo : true,
        disponible: typeof d.disponible === 'boolean' ? d.disponible : true,
        fechaIngreso: d.fechaIngreso ? new Date(d.fechaIngreso) : new Date(),
        pedidosEntregados: d.pedidosEntregados ?? 0,
        pedidos: d.pedidos ?? []
      } as Domiciliario))),
      catchError(() => {
        const raw = localStorage.getItem('domiciliarios');
        const parsed: Domiciliario[] = raw ? JSON.parse(raw) : [];
        const disponibles = (Array.isArray(parsed) ? parsed : []).filter((d: Domiciliario) => d.activo && d.disponible);
        return of(disponibles);
      })
    );
  }

  // Obtener estadísticas de domiciliarios
  getEstadisticas(): Observable<{
    totalDomiciliarios: number,
    domiciliariosActivos: number,
    domiciliariosDisponibles: number,
    totalEntregas: number
  }> {
    return new Observable(observer => {
      const domiciliarios = JSON.parse(localStorage.getItem('domiciliarios') || '[]');
      const stats = {
        totalDomiciliarios: domiciliarios.length,
        domiciliariosActivos: domiciliarios.filter((d: Domiciliario) => d.activo).length,
        domiciliariosDisponibles: domiciliarios.filter((d: Domiciliario) => d.activo && d.disponible).length,
        totalEntregas: domiciliarios.reduce((total: number, d: Domiciliario) => total + d.pedidosEntregados, 0)
      };
      observer.next(stats);
      observer.complete();
    });
  }

  // Obtener datos mock de domiciliarios
  private getMockDomiciliarios(): Domiciliario[] {
    return [
      {
        id: 1,
        nombre: 'Carlos Rodríguez',
        cedula: '100000001',
        telefono: '3001234567',
        vehiculo: 'Moto',
        placa: 'ABC123',
        activo: true,
        disponible: true,
        fechaIngreso: new Date('2024-01-10'),
        pedidosEntregados: 45,
        pedidos: []
      },
      {
        id: 2,
        nombre: 'María González',
        cedula: '100000002',
        telefono: '3007654321',
        vehiculo: 'Bicicleta',
        placa: 'BIC001',
        activo: true,
        disponible: false,
        fechaIngreso: new Date('2024-02-15'),
        pedidosEntregados: 32,
        pedidos: []
      },
      {
        id: 3,
        nombre: 'Luis Martínez',
        cedula: '100000003',
        telefono: '3009876543',
        vehiculo: 'Moto',
        placa: 'XYZ789',
        activo: false,
        disponible: false,
        fechaIngreso: new Date('2024-01-20'),
        pedidosEntregados: 28,
        pedidos: []
      },
      {
        id: 4,
        nombre: 'Ana López',
        cedula: '100000004',
        telefono: '3005432109',
        vehiculo: 'Carro',
        placa: 'DEF456',
        activo: true,
        disponible: true,
        fechaIngreso: new Date('2024-03-01'),
        pedidosEntregados: 15,
        pedidos: []
      }
    ];
  }

  // Buscar domiciliarios
  buscarDomiciliarios(termino: string): Observable<Domiciliario[]> {
    return this.searchDomiciliarios(termino);
  }
}