import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Cupon, CuponCreate, CuponUpdate } from '../../Model/Cupon/cupon';

@Injectable({ providedIn: 'root' })
export class CuponService {
  private apiUrl = '/api/cupones';
  private cuponesSubject = new BehaviorSubject<Cupon[]>([]);
  public cupones$ = this.cuponesSubject.asObservable();

  constructor(private http: HttpClient) {}

  listar(): Observable<Cupon[]> {
    return this.http.get<Cupon[]>(`${this.apiUrl}`, { withCredentials: true }).pipe(
      tap((items) => this.cuponesSubject.next(items || [])),
      catchError((err) => {
        console.warn('listar cupones failed:', err);
        this.cuponesSubject.next([]);
        return of([]);
      })
    );
  }

  crear(cupon: CuponCreate): Observable<Cupon> {
    return this.http.post<Cupon>(`${this.apiUrl}`, cupon, { withCredentials: true }).pipe(
      tap((created) => {
        const current = this.cuponesSubject.value;
        this.cuponesSubject.next([created, ...current]);
      })
    );
  }

  actualizar(id: number, cupon: CuponUpdate): Observable<Cupon> {
    return this.http.put<Cupon>(`${this.apiUrl}/${id}`, cupon, { withCredentials: true }).pipe(
      tap((updated) => {
        const current = this.cuponesSubject.value.map((c) => (c.id === id ? updated : c));
        this.cuponesSubject.next(current);
      })
    );
  }

  eliminar(id: number): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true }).pipe(
      map(() => true),
      tap(() => {
        const current = this.cuponesSubject.value.filter((c) => c.id !== id);
        this.cuponesSubject.next(current);
      }),
      catchError((err) => {
        console.warn('eliminar cupon failed:', err);
        return of(false);
      })
    );
  }
}