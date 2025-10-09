import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Adicional } from '../../Model/Adicional/adicional';

@Injectable({
  providedIn: 'root'
})
export class AdicionalService {
  private apiUrl = '/api/adicionales';
  private adicionalesSubject = new BehaviorSubject<Adicional[]>([]);
  public adicionales$ = this.adicionalesSubject.asObservable();
  private readonly allowedCategorias = ['hamburguesa', 'acompañamiento', 'bebida', 'postre', 'perro caliente'];

  constructor(private http: HttpClient) {
    // Cargar adicionales iniciales desde backend con fallback seguro
    this.loadAdicionales();
  }

  // Mapear objeto backend -> modelo frontend
  private mapBackendAdicional(adic: any): Adicional {
    // El backend usa campo 'categoria' (List<String>)
    const categorias = Array.isArray(adic?.categoria)
      ? adic.categoria
      : (Array.isArray(adic?.categorias) ? adic.categorias : []);
    const a = new Adicional(adic?.nombre ?? '', adic?.precio ?? 0, !!adic?.activo, categorias);
    a.id = adic?.id ?? Date.now();
    return a;
  }

  // Normalizar categorías de payload
  private normalizeCategorias(raw: any): string[] {
    const arr: any[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.categorias) ? raw.categorias : [];
    const norm = arr
      .filter((c) => typeof c === 'string')
      .map((c) => c.trim().toLowerCase())
      .filter((c) => c.length > 0)
      .filter((c) => this.allowedCategorias.includes(c));
    // eliminar duplicados y ordenar para consistencia
    return Array.from(new Set(norm)).sort();
  }

  private normalizeNombre(nombre: any): string {
    return (typeof nombre === 'string' ? nombre.trim() : '') || '';
  }

  // Cargar adicionales desde backend con fallback a storage
  private loadAdicionales(): void {
    this.http.get<any[]>(`${this.apiUrl}`)
      .pipe(
        map((lista: any[]) => (Array.isArray(lista) ? lista : []).map(adic => this.mapBackendAdicional(adic))),
        tap((adicionales) => {
          this.adicionalesSubject.next(adicionales);
          // Actualizar storage como caché para fallback
          localStorage.setItem('adicionales', JSON.stringify(adicionales));
        }),
        catchError((err) => {
          console.warn('Backend no disponible para adicionales, usando caché local.');
          const storedRaw = localStorage.getItem('adicionales');
          const stored: Adicional[] = storedRaw ? JSON.parse(storedRaw) : [];
          this.adicionalesSubject.next(Array.isArray(stored) ? stored : []);
          return of(Array.isArray(stored) ? stored : []);
        })
      ).subscribe();
  }

  // Guardar adicionales en localStorage y emitir
  private saveAdicionalesToStorage(adicionales: Adicional[]): void {
    localStorage.setItem('adicionales', JSON.stringify(adicionales));
    this.adicionalesSubject.next(adicionales);
  }

  // Obtener todos los adicionales
  getAdicionales(): Observable<Adicional[]> {
    // Preferir datos del subject (actualizados por load/CRUD);
    // si se requiere refresco inmediato, se podría llamar a loadAdicionales aparte
    return this.adicionales$;
  }

  // Obtener adicional por ID
  getAdicionalById(id: number): Observable<Adicional | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(adic => adic ? this.mapBackendAdicional(adic) : undefined),
      catchError(() => {
        const adicionales = JSON.parse(localStorage.getItem('adicionales') || '[]');
        const adicional = (Array.isArray(adicionales) ? adicionales : []).find((a: Adicional) => a.id === id);
        return of(adicional);
      })
    );
  }

  // Crear nuevo adicional
  createAdicional(adicional: Omit<Adicional, 'id'>): Observable<Adicional> {
    const payload = {
      nombre: this.normalizeNombre(adicional.nombre),
      precio: Math.max(0, Number(adicional.precio ?? 0)),
      activo: !!adicional.activo,
      categoria: this.normalizeCategorias(adicional.categorias)
    };
    return this.http.post<any>(`${this.apiUrl}`, payload).pipe(
      map((res: any) => {
        const cli = res?.adicional ?? res;
        const mapped = this.mapBackendAdicional(cli);
        const actuales = this.adicionalesSubject.value;
        this.saveAdicionalesToStorage([...actuales, mapped]);
        return mapped;
      }),
      catchError((err) => {
        console.error('Error al crear adicional en backend, fallback local:', err);
        const actualesRaw = localStorage.getItem('adicionales');
        const actuales: Adicional[] = actualesRaw ? JSON.parse(actualesRaw) : [];
        const nuevo: Adicional = { ...adicional, id: Date.now() } as Adicional;
        const next = [...actuales, nuevo];
        this.saveAdicionalesToStorage(next);
        return of(nuevo);
      })
    );
  }

  // Actualizar adicional
  updateAdicional(id: number, adicional: Partial<Adicional>): Observable<Adicional> {
    const payload = {
      nombre: this.normalizeNombre(adicional.nombre),
      precio: Math.max(0, Number(adicional.precio ?? 0)),
      activo: adicional.activo === undefined ? true : !!adicional.activo,
      categoria: this.normalizeCategorias(adicional.categorias)
    };
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(
      map((res: any) => {
        const cli = res?.adicional ?? res;
        const mapped = this.mapBackendAdicional(cli);
        const actuales = this.adicionalesSubject.value;
        const idx = actuales.findIndex(a => a.id === id);
        const next = idx !== -1 ? [...actuales.slice(0, idx), mapped, ...actuales.slice(idx + 1)] : [...actuales, mapped];
        this.saveAdicionalesToStorage(next);
        return mapped;
      }),
      catchError((err) => {
        console.error('Error al actualizar adicional en backend, fallback local:', err);
        const actualesRaw = localStorage.getItem('adicionales');
        const actuales: Adicional[] = actualesRaw ? JSON.parse(actualesRaw) : [];
        const idx = actuales.findIndex((a: Adicional) => a.id === id);
        if (idx !== -1) {
          const updated = { ...actuales[idx], ...adicional } as Adicional;
          const next = [...actuales];
          next[idx] = updated;
          this.saveAdicionalesToStorage(next);
          return of(updated);
        }
        return of({ ...adicional, id } as Adicional);
      })
    );
  }

  // Eliminar adicional
  deleteAdicional(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        const actuales = this.adicionalesSubject.value.filter(a => a.id !== id);
        this.saveAdicionalesToStorage(actuales);
        return true;
      }),
      catchError((err) => {
        console.error('Error al eliminar adicional en backend, fallback local:', err);
        const actualesRaw = localStorage.getItem('adicionales');
        const actuales: Adicional[] = actualesRaw ? JSON.parse(actualesRaw) : [];
        const next = actuales.filter((a: Adicional) => a.id !== id);
        this.saveAdicionalesToStorage(next);
        return of(true);
      })
    );
  }

  // Obtener adicionales por categoría
  getAdicionalesByCategoria(categoria: string): Observable<Adicional[]> {
    return new Observable(observer => {
      const adicionales = this.adicionalesSubject.value;
      const filtered = adicionales.filter((a: Adicional) => Array.isArray(a.categorias) && a.categorias.includes(categoria));
      observer.next(filtered);
      observer.complete();
    });
  }

  // Obtener estadísticas
  getEstadisticas(): Observable<{totalAdicionales: number, adicionalesActivos: number}> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      map((res: any) => {
        const total = typeof res?.total === 'number' ? res.total : 0;
        const activos = typeof res?.activos === 'number' ? res.activos : 0;
        return {
          totalAdicionales: total,
          adicionalesActivos: activos
        };
      }),
      catchError(() => {
        const adicionalesRaw = localStorage.getItem('adicionales');
        const adicionales: Adicional[] = adicionalesRaw ? JSON.parse(adicionalesRaw) : [];
        return of({
          totalAdicionales: adicionales.length,
          adicionalesActivos: adicionales.filter((a: Adicional) => a.activo).length
        });
      })
    );
  }
}
