import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { Producto, CategoriaProducto } from '../../Model/Producto/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = '/api/productos'; // URL del backend via proxy
  private productosSubject = new BehaviorSubject<Producto[]>([]);
  public productos$ = this.productosSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Conversión de categorías entre backend (strings) y frontend (enum)
  private toFrontendCategoria(apiCategoria: any): CategoriaProducto {
    const raw = (apiCategoria ?? '').toString().trim().toLowerCase();
    const map: Record<string, CategoriaProducto> = {
      'hamburguesa': CategoriaProducto.HAMBURGUESAS,
      'bebida': CategoriaProducto.BEBIDAS,
      'acompañamiento': CategoriaProducto.ACOMPAÑAMIENTOS,
      'postre': CategoriaProducto.POSTRES,
      'perro caliente': CategoriaProducto.PERROS_CALIENTES
    };
    return map[raw] ?? CategoriaProducto.HAMBURGUESAS;
  }

  private toBackendCategoria(cat: CategoriaProducto | string): string {
    const val = (cat as string) ?? '';
    const map: Record<string, string> = {
      [CategoriaProducto.HAMBURGUESAS]: 'hamburguesa',
      [CategoriaProducto.BEBIDAS]: 'bebida',
      [CategoriaProducto.ACOMPAÑAMIENTOS]: 'acompañamiento',
      [CategoriaProducto.POSTRES]: 'postre',
      [CategoriaProducto.PERROS_CALIENTES]: 'perro caliente'
    };
    // Si llega directamente el string del enum, usar el mapeo; si es ya backend compatible, devolverlo
    return map[val] ?? val.toString().trim().toLowerCase();
  }

  // Mapeo de producto del backend al modelo frontend
  private mapProducto(apiProducto: any): Producto {
    return {
      id: apiProducto.id,
      nombre: apiProducto.nombre,
      descripcion: apiProducto.descripcion || '',
      precio: apiProducto.precio,
      categoria: this.toFrontendCategoria(apiProducto.categoria),
      imagen: apiProducto.imgURL || 'assets/Menu/cheeseburger.png',
      disponible: apiProducto.activo !== undefined ? apiProducto.activo : true,
      fechaCreacion: apiProducto.fechaCreacion ? new Date(apiProducto.fechaCreacion) : new Date(),
      ingredientes: apiProducto.ingredientes || [],
      isNew: apiProducto.nuevo || false,
      isPopular: apiProducto.popular || false,
      stock: apiProducto.stock,
      adicionales: (apiProducto.adicionales || []).map((a: any) => ({
        id: a.id,
        nombre: a.nombre,
        precio: a.precio,
        disponible: a.activo !== undefined ? a.activo : true
      }))
    };
  }

  // Obtener todos los productos
  getProductos(): Observable<Producto[]> {
    return this.http.get<any[]>(`${this.apiUrl}`).pipe(
      map((items) => items.map((p: any) => this.mapProducto(p))),
      tap((productos) => this.productosSubject.next(productos)),
      catchError((error) => {
        console.warn('getProductos failed, returning empty list:', error);
        const fallback: Producto[] = [];
        this.productosSubject.next(fallback);
        return of(fallback);
      })
    );
  }

  // Obtener producto por ID
  getProductoById(id: number): Observable<Producto | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((resp) => {
        if (!resp) return undefined;
        // El backend retorna { producto, adicionalesPermitidos }
        const apiProducto = resp.producto ?? resp;
        const adicionalesApi = resp.adicionalesPermitidos ?? apiProducto.adicionales ?? [];
        const producto = this.mapProducto(apiProducto);
        // Sobrescribir adicionales con los proporcionados por el backend para este producto
        producto.adicionales = (adicionalesApi || []).map((a: any) => ({
          id: a.id,
          nombre: a.nombre,
          precio: a.precio,
          disponible: a.activo !== undefined ? a.activo : true
        }));
        return producto;
      }),
      catchError((error) => {
        console.warn(`getProductoById(${id}) failed, returning undefined:`, error);
        return of(undefined);
      })
    );
  }

  // Obtener productos por categoría
  getProductosByCategoria(categoria: CategoriaProducto): Observable<Producto[]> {
    const backendCat = this.toBackendCategoria(categoria);
    return this.http.get<any[]>(`${this.apiUrl}/categoria/${backendCat}`).pipe(
      map((items) => items.map((p: any) => this.mapProducto(p))),
      catchError((error) => {
        console.warn(`getProductosByCategoria(${categoria}) failed, returning empty list:`, error);
        return of([] as Producto[]);
      })
    );
  }

  // Buscar productos
  buscarProductos(termino: string): Observable<Producto[]> {
    const params = new HttpParams().set('nombre', termino);
    return this.http.get<any[]>(`${this.apiUrl}/search`, { params }).pipe(
      map((items) => items.map((p: any) => this.mapProducto(p))),
      catchError((error) => {
        console.warn(`buscarProductos('${termino}') failed, returning empty list:`, error);
        return of([] as Producto[]);
      })
    );
  }

  // Crear nuevo producto (para administración)
  createProducto(producto: Omit<Producto, 'id' | 'fechaCreacion'>): Observable<Producto> {
    const payload = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      categoria: this.toBackendCategoria(producto.categoria),
      imgURL: producto.imagen,
      activo: producto.disponible,
      stock: Math.max(0, Number(producto.stock ?? 0)),
      ingredientes: producto.ingredientes || [],
      nuevo: producto.isNew || false,
      popular: producto.isPopular || false
    };
    return this.http.post<any>(`${this.apiUrl}`, payload).pipe(
      // El backend retorna { success, message, producto }
      map((resp) => this.mapProducto(resp?.producto ?? resp)),
      tap((created) => {
        const current = this.productosSubject.value || [];
        this.productosSubject.next([...current, created]);
      }),
      catchError((error) => {
        console.error('createProducto failed:', error);
        throw error;
      })
    );
  }

  // Actualizar producto (para administración)
  updateProducto(id: number, producto: Partial<Producto>): Observable<Producto> {
    const payload: any = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      categoria: producto.categoria !== undefined ? this.toBackendCategoria(producto.categoria as CategoriaProducto) : undefined,
      imgURL: producto.imagen,
      activo: producto.disponible,
      ingredientes: producto.ingredientes,
      nuevo: producto.isNew,
      popular: producto.isPopular,
      stock: Math.max(0, Number(producto.stock ?? 0))
    };
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(
      // El backend retorna { success, message, producto }
      map((resp) => this.mapProducto(resp?.producto ?? resp)),
      tap((updated) => {
        const current = this.productosSubject.value || [];
        const idx = current.findIndex((x) => x.id === updated.id);
        if (idx !== -1) {
          const next = current.slice();
          next[idx] = updated;
          this.productosSubject.next(next);
        } else {
          this.productosSubject.next([...current, updated]);
        }
      }),
      catchError((error) => {
        console.error(`updateProducto(${id}) failed:`, error);
        throw error;
      })
    );
  }

  // Eliminar producto (para administración)
  deleteProducto(id: number): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      tap(() => {
        const current = this.productosSubject.value || [];
        this.productosSubject.next(current.filter((p) => p.id !== id));
      }),
      catchError((error) => {
        console.error(`deleteProducto(${id}) failed:`, error);
        return of(false);
      })
    );
  }

  // Cambiar disponibilidad del producto (para administración)
  toggleDisponibilidad(id: number): Observable<Producto> {
    return this.getProductoById(id).pipe(
      switchMap((p) => {
        const payload: any = {
          activo: !(p?.disponible ?? true),
          nombre: p?.nombre,
          descripcion: p?.descripcion,
          precio: p?.precio,
          categoria: p?.categoria !== undefined ? this.toBackendCategoria(p?.categoria as CategoriaProducto) : undefined,
          imgURL: p?.imagen,
          ingredientes: p?.ingredientes,
          nuevo: p?.isNew,
          popular: p?.isPopular,
          stock: Math.max(0, Number(p?.stock ?? 0))
        };
        return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
      }),
      // El backend retorna { success, message, producto }
      map((resp) => this.mapProducto(resp?.producto ?? resp)),
      tap((updated) => {
        const current = this.productosSubject.value || [];
        const idx = current.findIndex((x) => x.id === updated.id);
        if (idx !== -1) {
          const next = current.slice();
          next[idx] = updated;
          this.productosSubject.next(next);
        } else {
          this.productosSubject.next([...current, updated]);
        }
      }),
      catchError((error) => {
        console.error(`toggleDisponibilidad(${id}) failed:`, error);
        throw error;
      })
    );
  }

  // Obtener estadísticas de productos (para administración)
  getEstadisticas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      catchError((error) => {
        console.warn('getEstadisticas failed, returning empty object:', error);
        return of({});
      })
    );
  }
  
}
