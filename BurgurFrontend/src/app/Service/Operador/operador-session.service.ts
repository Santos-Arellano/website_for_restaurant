import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Operador } from '../../Model/Operador/operador';

interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  operador?: {
    id: number;
    nombre: string;
    cedula: string;
    disponible: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class OperadorSessionService {
  private apiUrl = '/api/operadores';
  private storageKey = 'currentOperador';

  private currentOperadorSubject = new BehaviorSubject<Operador | null>(null);
  public currentOperador$ = this.currentOperadorSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load from storage on init
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && 'id' in parsed) {
          this.currentOperadorSubject.next(parsed as Operador);
        }
      } catch {}
    }
    // Sync with backend session
    this.refreshCurrent().subscribe();
  }

  isAuthenticated(): boolean {
    if (this.currentOperadorSubject.value) return true;
    // Intentar cargar desde localStorage si el sujeto está vacío
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && 'id' in parsed) {
          this.currentOperadorSubject.next(parsed as Operador);
          return true;
        }
      }
    } catch {}
    return false;
  }

  getCurrentOperador(): Operador | null {
    return this.currentOperadorSubject.value;
  }

  login(cedula: string): Observable<Operador | null> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { cedula }, { withCredentials: true }).pipe(
      map(res => {
        if (res.success && res.operador) {
          const op: Operador = {
            id: res.operador.id,
            nombre: res.operador.nombre,
            cedula: res.operador.cedula,
            disponible: res.operador.disponible,
            domiciliarios: [],
            pedidos: []
          };
          if (res.token) {
            try { localStorage.setItem('jwtToken', res.token); } catch {}
          }
          this.setCurrentOperador(op);
          return op;
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }

  logout(): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.clearCurrentOperador()),
      map(() => true),
      catchError(() => {
        this.clearCurrentOperador();
        return of(true);
      })
    );
  }

  refreshCurrent(): Observable<Operador | null> {
    return this.http.get<any>(`${this.apiUrl}/current`, { withCredentials: true }).pipe(
      map((res) => {
        if (res?.authenticated && res?.operador) {
          const operador: Operador = {
            id: res.operador.id,
            nombre: res.operador.nombre,
            cedula: res.operador.cedula,
            disponible: !!res.operador.disponible,
            domiciliarios: [],
            pedidos: []
          };
          this.setCurrentOperador(operador);
          return operador;
        }
        // No borrar la sesión local si el backend no reconoce sesión;
        // esto permite operar con la sesión persistida desde localStorage
        // cuando se usa el fallback de login.
        return this.currentOperadorSubject.value ?? null;
      }),
      catchError(() => {
        // En caso de error de red, mantener la sesión local existente
        return of(this.currentOperadorSubject.value ?? null);
      })
    );
  }

  private setCurrentOperador(operador: Operador): void {
    localStorage.setItem(this.storageKey, JSON.stringify(operador));
    this.currentOperadorSubject.next(operador);
  }

  private clearCurrentOperador(): void {
    localStorage.removeItem(this.storageKey);
    try { localStorage.removeItem('jwtToken'); } catch {}
    // Limpieza defensiva de claves heredadas
    try { localStorage.removeItem('operadorId'); } catch {}
    try { localStorage.removeItem('operadorCedula'); } catch {}
    this.currentOperadorSubject.next(null);
  }
}