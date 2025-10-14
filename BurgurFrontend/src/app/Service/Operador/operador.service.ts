import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Operador } from '../../Model/Operador/operador';

@Injectable({ providedIn: 'root' })
export class OperadorService {
  private apiUrl = '/api/operadores';

  constructor(private http: HttpClient) {}

  // Obtener todos los operadores
  obtenerOperadores(): Observable<Operador[]> {
    return this.http.get<Operador[]>(`${this.apiUrl}`);
  }

  // Restablecer operadores a datos mock
  resetOperadores(): Observable<Operador[]> {
    // Con backend activo, simplemente refresca la lista desde el servidor
    return this.obtenerOperadores();
  }

  // Obtener operador por ID
  obtenerOperadorPorId(id: number): Observable<Operador> {
    return this.http.get<Operador>(`${this.apiUrl}/${id}`);
  }

  // Crear operador
  crearOperador(data: Omit<Operador, 'id'>): Observable<Operador> {
    return this.http.post<Operador>(`${this.apiUrl}`, data);
  }

  // Actualizar operador
  actualizarOperador(id: number, cambios: Partial<Operador>): Observable<Operador> {
    const payload = { ...cambios, id } as Operador;
    return this.http.put<Operador>(`${this.apiUrl}/${id}`, payload);
  }

  // Eliminar operador
  eliminarOperador(id: number): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(map(() => true));
  }

  // Alternar disponibilidad
  alternarDisponibilidad(id: number): Observable<Operador> {
    return this.obtenerOperadorPorId(id as number).pipe(
      switchMap((op: Operador) => {
        const actualizado: Partial<Operador> = {
          nombre: op.nombre,
          cedula: op.cedula,
          disponible: !op.disponible,
          domiciliarios: op.domiciliarios ?? [],
          pedidos: op.pedidos ?? []
        };
        return this.actualizarOperador(id, actualizado);
      })
    );
  }

  // Buscar operadores
  buscarOperadores(termino: string): Observable<Operador[]> {
    const t = termino.toLowerCase();
    return this.obtenerOperadores().pipe(
      map((operadores: Operador[]) =>
        operadores.filter(o =>
          (o.nombre || '').toLowerCase().includes(t) ||
          (o.cedula || '').toLowerCase().includes(t)
        )
      )
    );
  }

  // Estadísticas básicas
  obtenerEstadisticas(): Observable<{ totalOperadores: number; operadoresDisponibles: number; operadoresNoDisponibles: number }> {
    return forkJoin({
      total: this.http.get<number>(`${this.apiUrl}/stats`),
      disponibles: this.http.get<Operador[]>(`${this.apiUrl}/disponibles`)
    }).pipe(
      map(({ total, disponibles }) => ({
        totalOperadores: total ?? 0,
        operadoresDisponibles: (disponibles || []).length,
        operadoresNoDisponibles: (total ?? 0) - (disponibles || []).length
      }))
    );
  }
}