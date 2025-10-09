import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Pedido, ProductoPedido, EstadoPedido, MetodoPago } from '../../Model/Pedido/pedido';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private pedidosApiUrl = '/api/pedidos';
  private carritoApiUrl = '/api/carrito';
  private carritoSubject = new BehaviorSubject<ProductoPedido[]>([]);
  public carrito$ = this.carritoSubject.asObservable();
  private pedidosSubject = new BehaviorSubject<Pedido[]>([]);
  public pedidos$ = this.pedidosSubject.asObservable();

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
    if (!this.isUserLoggedIn()) return;
    const currentClienteId = clienteId ?? this.getCurrentClienteIdFromStorage();
    if (!currentClienteId) return;

    const adicionalesIds = (producto.adicionales || []).map(a => a.adicionalId);
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
    if (adicionales1.length !== adicionales2.length) return false;
    
    const ids1 = adicionales1.map(a => a.adicionalId).sort();
    const ids2 = adicionales2.map(a => a.adicionalId).sort();
    
    return ids1.every((id, index) => id === ids2[index]);
  }

  eliminarDelCarritoPorItemId(itemId: number): void {
    if (!this.isUserLoggedIn()) return;
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
    // Backend lacks explicit update endpoint; strategy: delete and re-add with new cantidad
    if (!this.isUserLoggedIn()) return;
    const carritoActual = this.carritoSubject.value;
    const item = carritoActual.find((p: any) => (p as any).itemId === itemId);
    if (!item) return;
    if (cantidad <= 0) {
      this.eliminarDelCarritoPorItemId(itemId);
      return;
    }
    // Remove old then re-add
    this.eliminarDelCarritoPorItemId(itemId);
    this.agregarAlCarrito({
      productoId: item.productoId,
      cantidad: cantidad,
      precioUnitario: item.precioUnitario,
      adicionales: item.adicionales
    });
  }

  limpiarCarrito(): void {
    if (!this.isUserLoggedIn()) return;
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
    return this.carritoSubject.value.reduce((total, producto) => {
      let subtotal = (producto.cantidad || 0) * (producto.precioUnitario || 0);
      if (producto.adicionales) {
        const totalAdicionales = producto.adicionales.reduce((sum, adicional) =>
          sum + ((adicional.cantidad || 0) * (adicional.precioUnitario || 0)), 0);
        subtotal += totalAdicionales;
      }
      return total + subtotal;
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

  // Crear pedido
  crearPedido(clienteId?: number): Observable<string> {
    const currentClienteId = clienteId ?? this.getCurrentClienteIdFromStorage();
    if (!currentClienteId) return of('ERROR: cliente no autenticado');
    const params = new HttpParams().set('clienteId', String(currentClienteId));
    return this.http.post(`${this.pedidosApiUrl}/crear`, null, { params, responseType: 'text' }).pipe(
      catchError((error) => {
        console.error('crearPedido failed:', error);
        return of('ERROR: crearPedido');
      })
    );
  }

  // Obtener pedidos del cliente
  getPedidosCliente(clienteId: number): Observable<Pedido[]> {
    // Backend listing
    return this.http.get<Pedido[]>(`${this.pedidosApiUrl}`).pipe(
      catchError((error) => {
        console.warn('getPedidosCliente failed, returning empty list:', error);
        return of([] as Pedido[]);
      })
    );
  }

  // Obtener pedido por ID
  getPedidoById(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.pedidosApiUrl}/${id}`).pipe(
      catchError((error) => {
        console.warn(`getPedidoById(${id}) failed, returning mock:`, error);
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

  // Obtener todos los pedidos (para administración)
  getPedidos(): Observable<Pedido[]> {
    // Prefer backend
    return this.http.get<Pedido[]>(`${this.pedidosApiUrl}`).pipe(
      catchError((error) => {
        console.warn('getPedidos failed, returning local subject:', error);
        return this.pedidos$;
      })
    );
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
    // Placeholder: would be a backend call
    const pedidoActualizado: Pedido = {
      id,
      fechaCreacion: new Date(),
      estado,
      precioTotal: 0,
      clienteId: 0,
      productos: [],
      direccionEntrega: '',
      metodoPago: MetodoPago.EFECTIVO
    };
    return of(pedidoActualizado);
  }

  // Asignar domiciliario al pedido (para administración)
  asignarDomiciliario(pedidoId: number, domiciliarioId: number): Observable<Pedido> {
    const pedidoActualizado: Pedido = {
      id: pedidoId,
      fechaCreacion: new Date(),
      estado: EstadoPedido.EN_CAMINO,
      precioTotal: 0,
      clienteId: 0,
      domiciliarioId,
      productos: [],
      direccionEntrega: '',
      metodoPago: MetodoPago.EFECTIVO
    };
    return of(pedidoActualizado);
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
        } catch {
          this.carritoSubject.next([]);
        }
      }
      return;
    }
    this.http.get<any>(`${this.carritoApiUrl}/activo/${clienteId}`).pipe(
      map((carrito) => this.mapCarritoToFrontend(carrito)),
      catchError((error) => {
        console.warn('syncCarritoDesdeBackend failed, using local storage:', error);
        const carritoGuardado = localStorage.getItem('carrito');
        const parsed = carritoGuardado ? JSON.parse(carritoGuardado) : [];
        return of(Array.isArray(parsed) ? parsed : []);
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
      const adicionales = (it.adicionalesPorProducto || []).map((x: any) => ({
        adicionalId: x.adicional?.id || 0,
        cantidad: 1,
        precioUnitario: x.adicional?.precio || 0
      }));
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
}
