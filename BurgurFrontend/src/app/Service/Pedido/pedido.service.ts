import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject, timer } from 'rxjs';
import { map, catchError, tap, switchMap, distinctUntilChanged, takeWhile } from 'rxjs/operators';
import { Pedido, ProductoPedido, EstadoPedido, MetodoPago } from '../../Model/Pedido/pedido';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private pedidosApiUrl = '/api/pedidos';
  private carritoApiUrl = '/api/carrito';
  private carritoSubject = new BehaviorSubject<ProductoPedido[]>([]);
  public carrito$ = this.carritoSubject.asObservable();
  // Resumen del carrito (subtotal, descuento, envío, total y cupón)
  private carritoResumenSubject = new BehaviorSubject<{ subtotal: number; descuento: number; costoEnvio: number; total: number; cuponCodigo?: string | null }>({ subtotal: 0, descuento: 0, costoEnvio: 3000, total: 0, cuponCodigo: null });
  public carritoResumen$ = this.carritoResumenSubject.asObservable();
  private pedidosSubject = new BehaviorSubject<Pedido[]>([]);
  public pedidos$ = this.pedidosSubject.asObservable();
  // Ruta mock para seguimiento del domiciliario (coincide con Bogotá aprox.)
  private trackingPathMock: [number, number][] = [
    [4.653, -74.057],
    [4.654, -74.058],
    [4.655, -74.059],
    [4.656, -74.06],
    [4.657, -74.061],
    [4.658, -74.062],
    [4.659, -74.063],
    [4.66, -74.064],
    [4.661, -74.065],
    [4.662, -74.066]
  ];

  constructor(private http: HttpClient) {
    this.syncCarritoDesdeBackend();
    this.loadPedidos();
  }

  // Cargar pedidos desde localStorage o usar mock data
  private loadPedidos(): void {
    const pedidosGuardados = localStorage.getItem('pedidos');
    if (pedidosGuardados) {
      try {
        const parsed = JSON.parse(pedidosGuardados);
        const pedidos = Array.isArray(parsed) ? parsed : [];
        this.pedidosSubject.next(pedidos);
      } catch (e) {
        console.warn('Error al parsear pedidos en localStorage. Usando mock.', e);
        const mockPedidos = this.getMockPedidos();
        this.savePedidosToStorage(mockPedidos);
        this.pedidosSubject.next(mockPedidos);
      }
    } else {
      const mockPedidos = this.getMockPedidos();
      this.savePedidosToStorage(mockPedidos);
      this.pedidosSubject.next(mockPedidos);
    }
  }

  // Guardar pedidos en localStorage
  private savePedidosToStorage(pedidos: Pedido[]): void {
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    this.pedidosSubject.next(pedidos);
  }

  // Mock data para desarrollo
  private getMockPedidos(): Pedido[] {
    return [
      {
        id: 1,
        fechaCreacion: new Date('2024-01-15T10:30:00'),
        estado: EstadoPedido.ENTREGADO,
        precioTotal: 35000,
        clienteId: 1,
        domiciliarioId: 1,
        productos: [
          { productoId: 1, cantidad: 2, precioUnitario: 15000 },
          { productoId: 2, cantidad: 1, precioUnitario: 5000 }
        ],
        direccionEntrega: 'Calle 123 #45-67',
        metodoPago: MetodoPago.EFECTIVO
      },
      {
        id: 2,
        fechaCreacion: new Date('2024-01-15T14:20:00'),
        estado: EstadoPedido.EN_CAMINO,
        precioTotal: 28000,
        clienteId: 2,
        domiciliarioId: 2,
        productos: [
          { productoId: 1, cantidad: 1, precioUnitario: 15000 },
          { productoId: 3, cantidad: 2, precioUnitario: 6500 }
        ],
        direccionEntrega: 'Carrera 89 #12-34',
        metodoPago: MetodoPago.TARJETA
      },
      {
        id: 3,
        fechaCreacion: new Date('2024-01-15T16:45:00'),
        estado: EstadoPedido.PENDIENTE,
        precioTotal: 42000,
        clienteId: 3,
        productos: [
          { productoId: 1, cantidad: 2, precioUnitario: 15000 },
          { productoId: 2, cantidad: 2, precioUnitario: 6000 }
        ],
        direccionEntrega: 'Avenida 56 #78-90',
        metodoPago: MetodoPago.TRANSFERENCIA
      }
    ];
  }

  // Gestión del carrito (backend)
  agregarAlCarrito(producto: ProductoPedido, clienteId?: number, carritoId?: number): void {
    // Soporte de carrito para invitados: persistencia local sin backend
    if (!this.isUserLoggedIn()) {
      const current = this.carritoSubject.value || [];
      const idx = current.findIndex((it: any) => (
        it.productoId === producto.productoId &&
        this.sonAdicionalesIguales(it.adicionales, producto.adicionales) &&
        ((it.observaciones || '') === (producto.observaciones || ''))
      ));
      if (idx !== -1) {
        const next = current.slice();
        next[idx] = { ...next[idx], cantidad: (next[idx].cantidad || 0) + (producto.cantidad || 0), precioUnitario: producto.precioUnitario };
        this.actualizarCarrito(next);
      } else {
        const newItem = { ...producto, itemId: Date.now() } as any as ProductoPedido;
        this.actualizarCarrito([...current, newItem]);
      }
      return;
    }

    const currentClienteId = clienteId ?? this.getCurrentClienteIdFromStorage();
    if (!currentClienteId) return;

    // Repetir IDs de adicionales según su cantidad
    const adicionalesIds: number[] = [];
    (producto.adicionales || []).forEach(a => {
      const qty = Math.max(1, Number(a?.cantidad ?? 1));
      for (let i = 0; i < qty; i++) adicionalesIds.push(a.adicionalId);
    });

    const params = new HttpParams()
      .set('clienteId', String(currentClienteId))
      .set('productoId', String(producto.productoId))
      .set('cantidad', String(producto.cantidad))
      .set('adicionalesIds', adicionalesIds.join(','));
    const url = `${this.carritoApiUrl}/agregar` + (carritoId ? `?carritoId=${carritoId}` : '');

    this.http.post<any>(url, null, { params }).pipe(
      map((carrito) => this.mapCarritoToFrontend(carrito)),
      catchError((error) => {
        console.warn('agregarAlCarrito failed, keeping local state:', error);
        return of(this.carritoSubject.value);
      })
    ).subscribe((mapped) => {
      this.carritoSubject.next(mapped);
      localStorage.setItem('carrito', JSON.stringify(mapped));
    });
  }

  // Método auxiliar para comparar adicionales
  private sonAdicionalesIguales(adicionales1?: any[], adicionales2?: any[]): boolean {
    if (!adicionales1 && !adicionales2) return true;
    if (!adicionales1 || !adicionales2) return false;
    const toCountMap = (arr: any[]) => {
      const map: Record<string, number> = {};
      arr.forEach(a => {
        const id = String(a?.adicionalId);
        const qty = Math.max(1, Number(a?.cantidad ?? 1));
        if (!id) return;
        map[id] = (map[id] || 0) + qty;
      });
      return map;
    };
    const m1 = toCountMap(adicionales1);
    const m2 = toCountMap(adicionales2);
    const k1 = Object.keys(m1).sort();
    const k2 = Object.keys(m2).sort();
    if (k1.length !== k2.length) return false;
    return k1.every((k, i) => k === k2[i] && m1[k] === m2[k]);
  }

  eliminarDelCarritoPorItemId(itemId: number): void {
    // Soporte invitados: eliminar localmente
    if (!this.isUserLoggedIn()) {
      const current = this.carritoSubject.value || [];
      const next = current.filter((p: any) => (p as any).itemId !== itemId && (p as any).productoId !== itemId);
      this.actualizarCarrito(next);
      return;
    }
    const clienteId = this.getCurrentClienteIdFromStorage();
    if (!clienteId) return;
    const params = new HttpParams().set('clienteId', String(clienteId));
    this.http.delete<any>(`${this.carritoApiUrl}/item/${itemId}`, { params }).pipe(
      map((carrito) => this.mapCarritoToFrontend(carrito)),
      catchError((error) => {
        console.warn('eliminarDelCarritoPorItemId failed:', error);
        return of(this.carritoSubject.value);
      })
    ).subscribe((mapped) => {
      this.carritoSubject.next(mapped);
      localStorage.setItem('carrito', JSON.stringify(mapped));
    });
  }

  actualizarCantidad(itemId: number, cantidad: number): void {
    // Invitados: actualizar localmente
    if (!this.isUserLoggedIn()) {
      const current = this.carritoSubject.value || [];
      const next = current.map((p: any) => {
        const isTarget = ((p as any).itemId === itemId) || ((p as any).productoId === itemId);
        if (!isTarget) return p;
        const newQty = Math.max(0, Number(cantidad || 0));
        if (newQty <= 0) return null as any;
        return { ...p, cantidad: newQty };
      }).filter(Boolean as any);
      this.actualizarCarrito(next as any);
      return;
    }

    // Serializar: eliminar en backend y luego re-agregar con la nueva cantidad
    const clienteId = this.getCurrentClienteIdFromStorage();
    if (!clienteId) return;

    const carritoActual = this.carritoSubject.value;
    const item = carritoActual.find((p: any) => (p as any).itemId === itemId);
    if (!item) return;

    if (cantidad <= 0) {
      this.eliminarDelCarritoPorItemId(itemId);
      return;
    }

    const deleteParams = new HttpParams().set('clienteId', String(clienteId));
    // Repetir IDs de adicionales según su cantidad actual
    const adicionalesIds: number[] = [];
    (item.adicionales || []).forEach((a: any) => {
      const qty = Math.max(1, Number(a?.cantidad ?? 1));
      for (let i = 0; i < qty; i++) adicionalesIds.push(a.adicionalId);
    });
    const addParams = new HttpParams()
      .set('clienteId', String(clienteId))
      .set('productoId', String(item.productoId))
      .set('cantidad', String(cantidad))
      .set('adicionalesIds', adicionalesIds.join(','));

    this.http.delete<any>(`${this.carritoApiUrl}/item/${itemId}`, { params: deleteParams }).pipe(
      map((carrito) => this.mapCarritoToFrontend(carrito)),
      switchMap(() => this.http.post<any>(`${this.carritoApiUrl}/agregar`, null, { params: addParams }).pipe(
        map((carrito) => this.mapCarritoToFrontend(carrito))
      )),
      catchError((error) => {
        console.warn('actualizarCantidad failed, keeping local state:', error);
        return of(this.carritoSubject.value);
      })
    ).subscribe((mapped) => {
      this.carritoSubject.next(mapped);
      localStorage.setItem('carrito', JSON.stringify(mapped));
    });
  }

  limpiarCarrito(): void {
    // Invitados: limpiar localmente
    if (!this.isUserLoggedIn()) {
      this.actualizarCarrito([]);
      return;
    }
    const clienteId = this.getCurrentClienteIdFromStorage();
    if (!clienteId) return;
    const params = new HttpParams().set('clienteId', String(clienteId));
    this.http.post<any>(`${this.carritoApiUrl}/vaciar`, null, { params }).pipe(
      map((carrito) => this.mapCarritoToFrontend(carrito)),
      catchError((error) => {
        console.warn('limpiarCarrito failed:', error);
        return of([] as ProductoPedido[]);
      })
    ).subscribe((mapped) => {
      this.carritoSubject.next(mapped);
      localStorage.setItem('carrito', JSON.stringify(mapped));
    });
  }

  private actualizarCarrito(carrito: ProductoPedido[]): void {
    this.carritoSubject.next(carrito);
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }

  // Resetear carrito local sin llamadas al backend (para logout)
  resetCarrito(): void {
    this.carritoSubject.next([]);
    localStorage.removeItem('carrito');
  }

  // Obtener carrito actual
  getCarrito(): ProductoPedido[] {
    return this.carritoSubject.value;
  }

  // Obtener contador del carrito
  getCarritoCount(): Observable<number> {
    return new Observable(observer => {
      const count = this.carritoSubject.value.reduce((total, item) => total + item.cantidad, 0);
      observer.next(count);
      observer.complete();
    });
  }

  // Calcular total del carrito
  calcularTotal(): number {
    // El backend ya incluye adicionales en el precioUnitario por unidad
    // El total se obtiene multiplicando por la cantidad, sin sumar adicionales aparte
    return this.carritoSubject.value.reduce((total, p) => {
      const unitTotal = p?.precioUnitario || 0;
      const qty = p?.cantidad || 0;
      return total + (unitTotal * qty);
    }, 0);
  }

  // Verificar sesión actual
  private isUserLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  private getCurrentClienteIdFromStorage(): number | null {
    try {
      const current = localStorage.getItem('currentUser');
      if (!current) return null;
      const parsed = JSON.parse(current);
      // Assume parsed has `id`
      return parsed.id || parsed.clienteId || null;
    } catch {
      return null;
    }
  }

  

  // Obtener pedidos del cliente
  getPedidosCliente(clienteId: number): Observable<Pedido[]> {
    return this.http.get<any[]>(`${this.pedidosApiUrl}/cliente/${clienteId}`, { withCredentials: true }).pipe(
      map((apiPedidos) => (Array.isArray(apiPedidos) ? apiPedidos : []).map(p => this.mapPedidoFromApi(p))),
      catchError((error) => {
        this.logHttpError('getPedidosCliente', error);
        return of([] as Pedido[]);
      })
    );
  }

  // Obtener pedido por ID
  getPedidoById(id: number): Observable<Pedido> {
    return this.http.get<any>(`${this.pedidosApiUrl}/${id}`, { withCredentials: true }).pipe(
      map((apiPedido) => this.mapPedidoFromApi(apiPedido)),
      catchError((error) => {
        this.logHttpError(`getPedidoById(${id})`, error);
        const pedidoMock: Pedido = {
          id: id,
          fechaCreacion: new Date(),
          estado: EstadoPedido.PENDIENTE,
          precioTotal: 0,
          clienteId: 0,
          productos: [],
          direccionEntrega: '',
          metodoPago: MetodoPago.EFECTIVO
        };
        return of(pedidoMock);
      })
    );
  }

  // Polling: observar pedido por ID a intervalos
  watchPedidoById(id: number, intervalMs: number = 3000): Observable<Pedido> {
    if (!id || id <= 0) {
      return of({
        id: id || 0,
        fechaCreacion: new Date(),
        estado: EstadoPedido.PENDIENTE,
        precioTotal: 0,
        clienteId: 0,
        productos: [],
        direccionEntrega: '',
        metodoPago: MetodoPago.EFECTIVO
      } as Pedido);
    }
    return timer(0, intervalMs).pipe(
      switchMap(() => this.getPedidoById(id))
    );
  }

  // Polling: observar solo el estado del pedido
  watchEstadoPedido(id: number, intervalMs: number = 3000): Observable<EstadoPedido> {
    return this.watchPedidoById(id, intervalMs).pipe(
      map((p) => p.estado),
      distinctUntilChanged()
    );
  }

  // Mock de ubicación del domiciliario: emite coordenadas a intervalos siguiendo una ruta fija
  watchCourierLocationMock(intervalMs: number = 1500): Observable<{ lat: number; lng: number; index: number; total: number }> {
    const total = this.trackingPathMock.length;
    return timer(0, intervalMs).pipe(
      map((i) => {
        const idx = Math.min(Number(i), total - 1);
        const [lat, lng] = this.trackingPathMock[idx];
        return { lat, lng, index: idx, total };
      }),
      // Completa tras emitir el último punto (inclusive)
      takeWhile((p) => p.index < total - 1, true)
    );
  }

  // Obtener todos los pedidos (para administración)
  getPedidos(): Observable<Pedido[]> {
    return this.http.get<any[]>(`${this.pedidosApiUrl}`, { withCredentials: true }).pipe(
      map((apiPedidos) => apiPedidos.map(p => this.mapPedidoFromApi(p))),
      tap((pedidos) => this.pedidosSubject.next(pedidos)),
      catchError((error) => {
        this.logHttpError('getPedidos', error);
        return this.pedidos$;
      })
    );
  }

  // Obtener pedidos activos (no entregados ni cancelados)
  getPedidosActivos(): Observable<Pedido[]> {
    return this.http.get<any[]>(`${this.pedidosApiUrl}/activos`, { withCredentials: true }).pipe(
      map((apiPedidos) => (Array.isArray(apiPedidos) ? apiPedidos : []).map(p => this.mapPedidoFromApi(p))),
      catchError((error) => {
        this.logHttpError('getPedidosActivos', error);
        return of([] as Pedido[]);
      })
    );
  }

  // Helper centralizado para logs de errores HTTP
  private logHttpError(context: string, error: any): void {
    const status = error?.status;
    const message = error?.message || error?.statusText;
    const body = error?.error;
    console.warn(`[${context}] HTTP error`, { status, message, body });
  }

  // Crear pedido en la base de datos a partir del carrito del cliente
  crearPedido(clienteId: number): Observable<boolean> {
    if (!clienteId || clienteId <= 0) {
      console.warn('crearPedido: clienteId inválido');
      return of(false);
    }
    const params = new HttpParams().set('clienteId', String(clienteId));
    // Backend devuelve texto "Pedido creado exitosamente"; usamos responseType: 'text'
    return this.http.post(`${this.pedidosApiUrl}/crear`, null, {
      params,
      withCredentials: true,
      responseType: 'text'
    }).pipe(
      map(() => true),
      tap(() => {
        // Vaciar el carrito local tras crear el pedido
        this.carritoSubject.next([]);
        // Opcional: refrescar listado de pedidos
        this.getPedidos().subscribe({
          next: (pedidos) => this.pedidosSubject.next(pedidos),
          error: () => {}
        });
      }),
      catchError((error) => {
        console.warn('crearPedido failed:', error);
        return of(false);
      })
    );
  }

  // Atajo: crear pedido para el usuario actual leyendo su id de localStorage
  crearPedidoParaUsuarioActual(): Observable<boolean> {
    const id = this.getCurrentClienteIdFromStorage();
    if (!id) {
      console.warn('No hay cliente actual en almacenamiento para crear pedido');
      return of(false);
    }
    return this.crearPedido(id);
  }

  // Buscar pedidos por término
  searchPedidos(termino: string): Observable<Pedido[]> {
    return new Observable(observer => {
      const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
      const filtered = pedidos.filter((p: Pedido) => 
        p.id.toString().includes(termino) ||
        p.estado.toLowerCase().includes(termino.toLowerCase())
      );
      observer.next(filtered);
      observer.complete();
    });
  }

  // Filtrar pedidos por estado
  getPedidosByEstado(estado: EstadoPedido): Observable<Pedido[]> {
    return new Observable(observer => {
      const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
      const filtered = pedidos.filter((p: Pedido) => p.estado === estado);
      observer.next(filtered);
      observer.complete();
    });
  }

  // Actualizar estado del pedido (para administración)
  updateEstadoPedido(id: number, estado: EstadoPedido): Observable<Pedido> {
    const backendEstado = this.mapEstadoToBackend(estado);
    const params = new HttpParams().set('estado', backendEstado);
    return this.http.post(`${this.pedidosApiUrl}/${id}/estado`, null, {
      params,
      withCredentials: true,
      responseType: 'text'
    }).pipe(
      // El backend retorna texto. Refrescamos el pedido desde la API y lo devolvemos.
      catchError((error) => {
        this.logHttpError(`updateEstadoPedido(${id}, ${estado})`, error);
        throw error;
      }),
      // Tras actualizar, obtener el pedido actualizado
      switchMap(() => this.getPedidoById(id)),
      tap((pedido) => {
        // Actualizar la lista en memoria si existe
        const current = this.pedidosSubject.value || [];
        const idx = current.findIndex(p => p.id === pedido.id);
        if (idx !== -1) {
          const next = current.slice();
          next[idx] = pedido;
          this.pedidosSubject.next(next);
        }
      })
    );
  }

  private mapEstadoToBackend(e: EstadoPedido): string {
    switch (e) {
      case EstadoPedido.PENDIENTE:
        return 'Recibido';
      case EstadoPedido.EN_PREPARACION:
        return 'Cocinando';
      case EstadoPedido.EN_CAMINO:
        return 'Enviado';
      case EstadoPedido.ENTREGADO:
        return 'Entregado';
      case EstadoPedido.CANCELADO:
        return 'Cancelado';
      default:
        return 'Recibido';
    }
  }
  // Asignar domiciliario al pedido (para administración)
  asignarDomiciliario(pedidoId: number, domiciliarioId: number): Observable<Pedido> {
    const params = new HttpParams().set('domiciliarioId', String(domiciliarioId));
    return this.http.post<any>(`${this.pedidosApiUrl}/${pedidoId}/domiciliario`, null, {
      params,
      withCredentials: true
    }).pipe(
      map((apiPedido) => this.mapPedidoFromApi(apiPedido)),
      tap((pedidoActualizado) => {
        // Actualizar la lista en memoria si existe
        const current = this.pedidosSubject.value || [];
        const idx = current.findIndex(p => p.id === pedidoActualizado.id);
        if (idx !== -1) {
          const next = current.slice();
          next[idx] = pedidoActualizado;
          this.pedidosSubject.next(next);
        }
      }),
      catchError((error) => {
        this.logHttpError(`asignarDomiciliario(${pedidoId}, ${domiciliarioId})`, error);
        throw error;
      })
    );
  }

  // Cancelar pedido (para administración)
  cancelarPedido(id: number, motivo?: string): Observable<Pedido> {
    const pedidoCancelado: Pedido = {
      id,
      fechaCreacion: new Date(),
      estado: EstadoPedido.CANCELADO,
      precioTotal: 0,
      clienteId: 0,
      productos: [],
      direccionEntrega: '',
      metodoPago: MetodoPago.EFECTIVO,
      observaciones: motivo
    };
    return of(pedidoCancelado);
  }

  // Obtener estadísticas de pedidos (para administración)
  getEstadisticasPedidos(): Observable<any> {
    return new Observable(observer => {
      const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const pedidosHoy = pedidos.filter((p: Pedido) => {
        const fechaPedido = new Date(p.fechaCreacion);
        fechaPedido.setHours(0, 0, 0, 0);
        return fechaPedido.getTime() === hoy.getTime();
      });

      const stats = {
        totalPedidos: pedidos.length,
        pedidosPendientes: pedidos.filter((p: Pedido) => p.estado === EstadoPedido.PENDIENTE).length,
        pedidosEnCamino: pedidos.filter((p: Pedido) => p.estado === EstadoPedido.EN_CAMINO).length,
        pedidosEntregados: pedidos.filter((p: Pedido) => p.estado === EstadoPedido.ENTREGADO).length,
        pedidosCancelados: pedidos.filter((p: Pedido) => p.estado === EstadoPedido.CANCELADO).length,
        ventasHoy: pedidosHoy.reduce((total: number, p: Pedido) => total + p.precioTotal, 0),
        ventasMes: pedidos.reduce((total: number, p: Pedido) => total + p.precioTotal, 0)
      };
      
      observer.next(stats);
      observer.complete();
    });
  }

  // Buscar pedidos (para administración)
  buscarPedidos(termino: string): Observable<Pedido[]> {
    return this.searchPedidos(termino);
  }

  // Actualizar pedido
  updatePedido(id: number, pedido: Partial<Pedido>): Observable<Pedido> {
    return new Observable(observer => {
      const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
      const index = pedidos.findIndex((p: Pedido) => p.id === id);
      if (index !== -1) {
        pedidos[index] = { ...pedidos[index], ...pedido };
        this.savePedidosToStorage(pedidos);
        observer.next(pedidos[index]);
      } else {
        observer.error('Pedido no encontrado');
      }
      observer.complete();
    });
  }

  // Verificar si el cliente tiene un pedido en progreso (confirmado/listo/en_camino)
  tienePedidoEnProgreso(clienteId: number, excluirPedidoId?: number): Observable<boolean> {
    const enProgresoEstados: EstadoPedido[] = [
      EstadoPedido.CONFIRMADO,
      EstadoPedido.EN_PREPARACION,
      EstadoPedido.LISTO,
      EstadoPedido.EN_CAMINO
    ];
    return this.getPedidosCliente(clienteId).pipe(
      map((pedidos) => pedidos.some(p => (excluirPedidoId ? p.id !== excluirPedidoId : true) && enProgresoEstados.includes(p.estado)))
    );
  }

  // Sync carrito from backend on service init
  private syncCarritoDesdeBackend(): void {
    const clienteId = this.getCurrentClienteIdFromStorage();
    if (!clienteId) {
      // fallback to local storage
      const carritoGuardado = localStorage.getItem('carrito');
      if (carritoGuardado) {
        try {
          const parsed = JSON.parse(carritoGuardado);
          const carrito = Array.isArray(parsed) ? parsed : [];
          this.carritoSubject.next(carrito);
          // Calcular resumen local: subtotal y total con envío base sin descuento
          const subtotal = carrito.reduce((sum, p) => sum + ((p?.precioUnitario || 0) * (p?.cantidad || 0)), 0);
          const costoEnvio = 3000;
          const descuento = 0;
          const total = Math.max(0, subtotal - descuento) + (subtotal > 0 ? costoEnvio : 0);
          this.carritoResumenSubject.next({ subtotal, descuento, costoEnvio: subtotal > 0 ? costoEnvio : 0, total, cuponCodigo: null });
        } catch {
          this.carritoSubject.next([]);
          this.carritoResumenSubject.next({ subtotal: 0, descuento: 0, costoEnvio: 0, total: 0, cuponCodigo: null });
        }
      }
      return;
    }
    this.http.get<any>(`${this.carritoApiUrl}/activo/${clienteId}`).pipe(
      tap((apiCarrito) => {
        const resumen = this.extractResumenFromApi(apiCarrito);
        this.carritoResumenSubject.next(resumen);
      }),
      map((carrito) => this.mapCarritoToFrontend(carrito)),
      catchError((error) => {
        console.warn('syncCarritoDesdeBackend failed, using local storage:', error);
        const carritoGuardado = localStorage.getItem('carrito');
        const parsed = carritoGuardado ? JSON.parse(carritoGuardado) : [];
        const carritoLocal = Array.isArray(parsed) ? parsed : [];
        const subtotal = carritoLocal.reduce((sum, p) => sum + ((p?.precioUnitario || 0) * (p?.cantidad || 0)), 0);
        const costoEnvio = subtotal > 0 ? 3000 : 0;
        const resumenLocal = { subtotal, descuento: 0, costoEnvio, total: Math.max(0, subtotal) + costoEnvio, cuponCodigo: null };
        this.carritoResumenSubject.next(resumenLocal);
        return of(carritoLocal);
      })
    ).subscribe((mapped) => {
      this.carritoSubject.next(mapped);
      localStorage.setItem('carrito', JSON.stringify(mapped));
    });
  }

  // Map backend Carrito payload to frontend ProductoPedido[] with itemId for management
  private mapCarritoToFrontend(apiCarrito: any): ProductoPedido[] {
    const items: any[] = apiCarrito?.carritoItems || [];
    return items.map((it: any) => {
      const raw = Array.isArray(it?.adicionalesPorProducto) ? it.adicionalesPorProducto : [];
      const countMap: Record<number, { adicionalId: number; cantidad: number; precioUnitario: number }> = {};
      raw.forEach((x: any) => {
        const id = Number(x?.adicional?.id || 0);
        const price = Number(x?.adicional?.precio || 0);
        if (!id) return;
        const current = countMap[id] || { adicionalId: id, cantidad: 0, precioUnitario: price };
        current.cantidad += 1;
        current.precioUnitario = price;
        countMap[id] = current;
      });
      const adicionales = Object.values(countMap);
      return {
        productoId: it.producto?.id || 0,
        cantidad: it.cantidad || 1,
        precioUnitario: it.precioUnitario || 0,
        adicionales,
        observaciones: undefined,
        // Attach backend item id for delete/update operations
        ...(it.id ? { ['itemId' as any]: it.id } : {})
      } as any as ProductoPedido;
    });
  }

  // Extrae el resumen del carrito desde el payload del backend
  private extractResumenFromApi(apiCarrito: any): { subtotal: number; descuento: number; costoEnvio: number; total: number; cuponCodigo?: string | null } {
    const items: any[] = apiCarrito?.carritoItems || [];
    const subtotal = items.reduce((sum, it: any) => sum + (Number(it?.precioUnitario || 0) * Number(it?.cantidad || 0)), 0);
    const descuento = Number(apiCarrito?.descuentoAplicado || 0);
    const costoEnvio = Number(apiCarrito?.costoEnvio || 0);
    const total = Number(apiCarrito?.precioTotal || Math.max(0, subtotal - descuento) + costoEnvio);
    const cuponCodigo = apiCarrito?.cuponCodigo ?? null;
    return { subtotal, descuento, costoEnvio, total, cuponCodigo };
  }

  // Aplicar cupón via backend
  aplicarCupon(codigo: string): void {
    const clienteId = this.getCurrentClienteIdFromStorage();
    if (!clienteId) {
      console.warn('aplicarCupon: usuario no logueado, operación ignorada');
      return;
    }
    const params = new HttpParams().set('clienteId', String(clienteId)).set('codigo', (codigo || '').toUpperCase());
    this.http.post<any>(`${this.carritoApiUrl}/cupon/aplicar`, null, { params }).pipe(
      tap((apiCarrito) => {
        const resumen = this.extractResumenFromApi(apiCarrito);
        this.carritoResumenSubject.next(resumen);
      }),
      map((apiCarrito) => this.mapCarritoToFrontend(apiCarrito)),
      catchError((error) => {
        console.error('aplicarCupon failed:', error);
        return of(this.carritoSubject.value);
      })
    ).subscribe((mapped) => {
      this.carritoSubject.next(mapped);
      localStorage.setItem('carrito', JSON.stringify(mapped));
    });
  }

  // Quitar cupón via backend
  quitarCupon(): void {
    const clienteId = this.getCurrentClienteIdFromStorage();
    if (!clienteId) {
      console.warn('quitarCupon: usuario no logueado, operación ignorada');
      return;
    }
    const params = new HttpParams().set('clienteId', String(clienteId));
    this.http.post<any>(`${this.carritoApiUrl}/cupon/quitar`, null, { params }).pipe(
      tap((apiCarrito) => {
        const resumen = this.extractResumenFromApi(apiCarrito);
        this.carritoResumenSubject.next(resumen);
      }),
      map((apiCarrito) => this.mapCarritoToFrontend(apiCarrito)),
      catchError((error) => {
        console.error('quitarCupon failed:', error);
        return of(this.carritoSubject.value);
      })
    ).subscribe((mapped) => {
      this.carritoSubject.next(mapped);
      localStorage.setItem('carrito', JSON.stringify(mapped));
    });
  }

  // Normaliza y mapea pedido desde API backend a modelo frontend
  private mapPedidoFromApi(apiPedido: any): Pedido {
    const estadoMap: Record<string, EstadoPedido> = {
      'RECIBIDO': EstadoPedido.PENDIENTE,
      'COCINANDO': EstadoPedido.EN_PREPARACION,
      'ENVIADO': EstadoPedido.EN_CAMINO,
      'ENTREGADO': EstadoPedido.ENTREGADO,
      'CANCELADO': EstadoPedido.CANCELADO
    };

    const estadoApi = (apiPedido?.estado || '').toString().toUpperCase();
    const estado = estadoMap[estadoApi] || EstadoPedido.PENDIENTE;
    const carrito = apiPedido?.carrito || {};
    const items = Array.isArray(carrito?.carritoItems) ? carrito.carritoItems : [];
    const productos: ProductoPedido[] = items.map((it: any) => ({
      itemId: it?.id,
      productoId: it?.producto?.id ?? 0,
      productoNombre: it?.producto?.nombre ?? undefined,
      cantidad: Number(it?.cantidad ?? 0),
      precioUnitario: Number(it?.precioUnitario ?? 0),
      adicionales: Array.isArray(it?.adicionalesPorProducto) ? (() => {
        const raw = it.adicionalesPorProducto;
        const countMap: Record<number, { adicionalId: number; adicionalNombre?: string; cantidad: number; precioUnitario: number }> = {};
        raw.forEach((a: any) => {
          const id = Number(a?.adicional?.id ?? 0);
          const nombre = a?.adicional?.nombre ?? undefined;
          const price = Number(a?.adicional?.precio ?? 0);
          if (!id) return;
          const current = countMap[id] || { adicionalId: id, adicionalNombre: nombre, cantidad: 0, precioUnitario: price };
          current.cantidad += 1;
          current.precioUnitario = price;
          countMap[id] = current;
        });
        return Object.values(countMap);
      })() : []
    }));

    const precioTotal = Number(carrito?.precioTotal ?? 0);
    const descuentoAplicado = Number(carrito?.descuentoAplicado ?? 0);
    const costoEnvio = Number(carrito?.costoEnvio ?? 0);
    const cuponCodigo = carrito?.cuponCodigo ?? null;

    return {
      id: Number(apiPedido?.id ?? 0),
      fechaCreacion: apiPedido?.fechaCreacion ? new Date(apiPedido.fechaCreacion) : new Date(),
      fechaEntrega: apiPedido?.fechaEntrega ? new Date(apiPedido.fechaEntrega) : undefined,
      estado,
      precioTotal,
      descuentoAplicado,
      costoEnvio,
      cuponCodigo,
      clienteId: carrito?.cliente?.id ?? 0,
      operadorId: apiPedido?.operador?.id,
      domiciliarioId: apiPedido?.domiciliario?.id,
      productos,
      direccionEntrega: apiPedido?.direccionEntrega || '',
      metodoPago: MetodoPago.EFECTIVO,
      observaciones: apiPedido?.observaciones
    };
  }
}
