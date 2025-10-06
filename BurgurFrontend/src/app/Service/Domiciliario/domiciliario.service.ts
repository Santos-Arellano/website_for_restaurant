import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Domiciliario } from '../../Model/Domiciliario/domiciliario';

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
    return this.domiciliarios$;
  }

  // Obtener domiciliario por ID
  getDomiciliarioById(id: number): Observable<Domiciliario | undefined> {
    return new Observable(observer => {
      const domiciliarios = JSON.parse(localStorage.getItem('domiciliarios') || '[]');
      const domiciliario = domiciliarios.find((d: Domiciliario) => d.id === id);
      observer.next(domiciliario);
      observer.complete();
    });
  }

  // Crear nuevo domiciliario
  createDomiciliario(domiciliario: Omit<Domiciliario, 'id' | 'fechaIngreso' | 'pedidosEntregados'>): Observable<Domiciliario> {
    return new Observable(observer => {
      const domiciliarios = JSON.parse(localStorage.getItem('domiciliarios') || '[]');
      
      // Verificar si el teléfono ya existe
      const telefonoExiste = domiciliarios.some((d: Domiciliario) => d.telefono === domiciliario.telefono);
      if (telefonoExiste) {
        observer.error('El teléfono ya está registrado');
        return;
      }

      const nuevoDomiciliario: Domiciliario = {
        ...domiciliario,
        id: Date.now(),
        fechaIngreso: new Date(),
        pedidosEntregados: 0
      };
      
      domiciliarios.push(nuevoDomiciliario);
      this.saveDomiciliariosToStorage(domiciliarios);
      observer.next(nuevoDomiciliario);
      observer.complete();
    });
  }

  // Actualizar domiciliario
  updateDomiciliario(id: number, domiciliario: Partial<Domiciliario>): Observable<Domiciliario> {
    return new Observable(observer => {
      const domiciliarios = JSON.parse(localStorage.getItem('domiciliarios') || '[]');
      const index = domiciliarios.findIndex((d: Domiciliario) => d.id === id);
      if (index !== -1) {
        domiciliarios[index] = { ...domiciliarios[index], ...domiciliario };
        this.saveDomiciliariosToStorage(domiciliarios);
        observer.next(domiciliarios[index]);
      } else {
        observer.error('Domiciliario no encontrado');
      }
      observer.complete();
    });
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
    return new Observable(observer => {
      const domiciliarios = JSON.parse(localStorage.getItem('domiciliarios') || '[]');
      const disponibles = domiciliarios.filter((d: Domiciliario) => d.activo && d.disponible);
      observer.next(disponibles);
      observer.complete();
    });
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