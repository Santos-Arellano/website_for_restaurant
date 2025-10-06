import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Adicional } from '../../Model/Adicional/adicional';

@Injectable({
  providedIn: 'root'
})
export class AdicionalService {
  private apiUrl = '/api/adicionales';
  private adicionalesSubject = new BehaviorSubject<Adicional[]>([]);
  public adicionales$ = this.adicionalesSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar adicionales iniciales
    this.loadAdicionales();
  }

  // Cargar adicionales desde localStorage o usar mock data
  private loadAdicionales(): void {
    const adicionalesGuardados = localStorage.getItem('adicionales');
    if (adicionalesGuardados) {
      const adicionales = JSON.parse(adicionalesGuardados);
      this.adicionalesSubject.next(adicionales);
    } else {
      const mockAdicionales = this.getMockAdicionales();
      this.saveAdicionalestoStorage(mockAdicionales);
      this.adicionalesSubject.next(mockAdicionales);
    }
  }

  // Guardar adicionales en localStorage
  private saveAdicionalestoStorage(adicionales: Adicional[]): void {
    localStorage.setItem('adicionales', JSON.stringify(adicionales));
    this.adicionalesSubject.next(adicionales);
  }

  // Obtener todos los adicionales
  getAdicionales(): Observable<Adicional[]> {
    return this.adicionales$;
  }

  // Obtener adicional por ID
  getAdicionalById(id: number): Observable<Adicional | undefined> {
    return new Observable(observer => {
      const adicionales = JSON.parse(localStorage.getItem('adicionales') || '[]');
      const adicional = adicionales.find((a: Adicional) => a.id === id);
      observer.next(adicional);
      observer.complete();
    });
  }

  // Crear nuevo adicional
  createAdicional(adicional: Omit<Adicional, 'id'>): Observable<Adicional> {
    return new Observable(observer => {
      const adicionales = JSON.parse(localStorage.getItem('adicionales') || '[]');
      const nuevoAdicional: Adicional = {
        ...adicional,
        id: Date.now()
      };
      adicionales.push(nuevoAdicional);
      this.saveAdicionalestoStorage(adicionales);
      observer.next(nuevoAdicional);
      observer.complete();
    });
  }

  // Actualizar adicional
  updateAdicional(id: number, adicional: Partial<Adicional>): Observable<Adicional> {
    return new Observable(observer => {
      const adicionales = JSON.parse(localStorage.getItem('adicionales') || '[]');
      const index = adicionales.findIndex((a: Adicional) => a.id === id);
      if (index !== -1) {
        adicionales[index] = { ...adicionales[index], ...adicional };
        this.saveAdicionalestoStorage(adicionales);
        observer.next(adicionales[index]);
      } else {
        observer.error('Adicional no encontrado');
      }
      observer.complete();
    });
  }

  // Eliminar adicional
  deleteAdicional(id: number): Observable<boolean> {
    return new Observable(observer => {
      const adicionales = JSON.parse(localStorage.getItem('adicionales') || '[]');
      const index = adicionales.findIndex((a: Adicional) => a.id === id);
      if (index !== -1) {
        adicionales.splice(index, 1);
        this.saveAdicionalestoStorage(adicionales);
        observer.next(true);
      } else {
        observer.error('Adicional no encontrado');
      }
      observer.complete();
    });
  }

  // Obtener adicionales por categoría
  getAdicionalesByCategoria(categoria: string): Observable<Adicional[]> {
    return new Observable(observer => {
      const adicionales = JSON.parse(localStorage.getItem('adicionales') || '[]');
      const filtered = adicionales.filter((a: Adicional) => a.categorias.includes(categoria));
      observer.next(filtered);
      observer.complete();
    });
  }

  // Obtener estadísticas
  getEstadisticas(): Observable<{totalAdicionales: number, adicionalesActivos: number}> {
    return new Observable(observer => {
      const adicionales = JSON.parse(localStorage.getItem('adicionales') || '[]');
      const stats = {
        totalAdicionales: adicionales.length,
        adicionalesActivos: adicionales.filter((a: Adicional) => a.activo).length
      };
      observer.next(stats);
      observer.complete();
    });
  }

  // Datos mock para desarrollo
  private getMockAdicionales(): Adicional[] {
    return [
      new Adicional('Queso Extra', 2000, true, ['hamburguesas', 'hot-dogs']),
      new Adicional('Tocineta', 3000, true, ['hamburguesas', 'ensaladas']),
      new Adicional('Aguacate', 2500, true, ['hamburguesas', 'ensaladas']),
      new Adicional('Cebolla Caramelizada', 1500, true, ['hamburguesas']),
      new Adicional('Salsa BBQ', 1000, true, ['hamburguesas', 'papas']),
      new Adicional('Salsa Ranch', 1000, true, ['ensaladas', 'papas']),
      new Adicional('Pepinillos', 800, true, ['hamburguesas', 'hot-dogs']),
      new Adicional('Jalapeños', 1200, true, ['hamburguesas', 'nachos']),
      new Adicional('Cebolla Morada', 500, true, ['hamburguesas', 'ensaladas']),
      new Adicional('Lechuga Extra', 500, true, ['hamburguesas', 'ensaladas']),
      new Adicional('Tomate Extra', 700, true, ['hamburguesas', 'ensaladas']),
      new Adicional('Salsa Chipotle', 1200, true, ['hamburguesas', 'papas'])
    ].map((adicional, index) => {
      adicional.id = index + 1;
      return adicional;
    });
  }
}
