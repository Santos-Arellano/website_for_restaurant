import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Operador } from '../../Model/Operador/operador';

@Injectable({ providedIn: 'root' })
export class OperadorService {
  private storageKey = 'operadores';
  private operadoresSubject = new BehaviorSubject<Operador[]>([]);
  public operadores$ = this.operadoresSubject.asObservable();

  constructor() {
    this.loadOperadores();
  }

  // Cargar operadores desde localStorage o usar datos mock
  private loadOperadores(): void {
    const guardados = localStorage.getItem(this.storageKey);
    if (guardados) {
      const operadores = JSON.parse(guardados);
      this.operadoresSubject.next(operadores);
    } else {
      const mock = this.getMockOperadores();
      this.saveOperadoresToStorage(mock);
    }
  }

  // Guardar en localStorage y emitir cambios
  private saveOperadoresToStorage(operadores: Operador[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(operadores));
    this.operadoresSubject.next(operadores);
  }

  // Obtener todos los operadores
  obtenerOperadores(): Observable<Operador[]> {
    return this.operadores$;
  }

  // Obtener operador por ID
  obtenerOperadorPorId(id: number): Observable<Operador | undefined> {
    return new Observable(observer => {
      const operadores: Operador[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const encontrado = operadores.find(o => o.id === id);
      observer.next(encontrado);
      observer.complete();
    });
  }

  // Crear operador
  crearOperador(data: Omit<Operador, 'id'>): Observable<Operador> {
    return new Observable(observer => {
      const operadores: Operador[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const nuevo: Operador = {
        ...data,
        id: Date.now()
      };
      operadores.push(nuevo);
      this.saveOperadoresToStorage(operadores);
      observer.next(nuevo);
      observer.complete();
    });
  }

  // Actualizar operador
  actualizarOperador(id: number, cambios: Partial<Operador>): Observable<Operador> {
    return new Observable(observer => {
      const operadores: Operador[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const idx = operadores.findIndex(o => o.id === id);
      if (idx !== -1) {
        operadores[idx] = { ...operadores[idx], ...cambios };
        this.saveOperadoresToStorage(operadores);
        observer.next(operadores[idx]);
      } else {
        observer.error('Operador no encontrado');
      }
      observer.complete();
    });
  }

  // Eliminar operador
  eliminarOperador(id: number): Observable<boolean> {
    return new Observable(observer => {
      const operadores: Operador[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const idx = operadores.findIndex(o => o.id === id);
      if (idx !== -1) {
        operadores.splice(idx, 1);
        this.saveOperadoresToStorage(operadores);
        observer.next(true);
      } else {
        observer.error('Operador no encontrado');
      }
      observer.complete();
    });
  }

  // Alternar disponibilidad
  alternarDisponibilidad(id: number): Observable<Operador> {
    return new Observable(observer => {
      const operadores: Operador[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const idx = operadores.findIndex(o => o.id === id);
      if (idx !== -1) {
        operadores[idx].disponible = !operadores[idx].disponible;
        this.saveOperadoresToStorage(operadores);
        observer.next(operadores[idx]);
      } else {
        observer.error('Operador no encontrado');
      }
      observer.complete();
    });
  }

  // Buscar operadores
  buscarOperadores(termino: string): Observable<Operador[]> {
    return new Observable(observer => {
      const operadores: Operador[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const t = termino.toLowerCase();
      const filtrados = operadores.filter(o =>
        (o.nombre || '').toLowerCase().includes(t) ||
        (o.cedula || '').toLowerCase().includes(t)
      );
      observer.next(filtrados);
      observer.complete();
    });
  }

  // Estadísticas básicas
  obtenerEstadisticas(): Observable<{ totalOperadores: number; operadoresDisponibles: number; operadoresNoDisponibles: number }> {
    return new Observable(observer => {
      const operadores: Operador[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const stats = {
        totalOperadores: operadores.length,
        operadoresDisponibles: operadores.filter(o => o.disponible).length,
        operadoresNoDisponibles: operadores.filter(o => !o.disponible).length
      };
      observer.next(stats);
      observer.complete();
    });
  }

  // Datos mock
  private getMockOperadores(): Operador[] {
    const base: Operador[] = [
      { id: 1, nombre: 'Laura Gómez', cedula: '1023456789', disponible: true, domiciliarios: [], pedidos: [] },
      { id: 2, nombre: 'Carlos Pérez', cedula: '9876543210', disponible: false, domiciliarios: [], pedidos: [] },
      { id: 3, nombre: 'Ana Rodríguez', cedula: '1122334455', disponible: true, domiciliarios: [], pedidos: [] },
      { id: 4, nombre: 'Pedro García', cedula: '1002003004', disponible: true, domiciliarios: [], pedidos: [] }
    ];
    return base;
  }
}