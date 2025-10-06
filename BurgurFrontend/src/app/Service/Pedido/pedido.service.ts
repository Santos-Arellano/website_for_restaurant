import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Pedido, ProductoPedido, EstadoPedido, MetodoPago } from '../../Model/Pedido/pedido';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = '/api/pedidos';
  private carritoSubject = new BehaviorSubject<ProductoPedido[]>([]);
  public carrito$ = this.carritoSubject.asObservable();
  private pedidosSubject = new BehaviorSubject<Pedido[]>([]);
  public pedidos$ = this.pedidosSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar carrito desde localStorage
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      this.carritoSubject.next(JSON.parse(carritoGuardado));
    }
    this.loadPedidos();
  }

  // Cargar pedidos desde localStorage o usar mock data
  private loadPedidos(): void {
    const pedidosGuardados = localStorage.getItem('pedidos');
    if (pedidosGuardados) {
      const pedidos = JSON.parse(pedidosGuardados);
      this.pedidosSubject.next(pedidos);
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

  // Gestión del carrito
  agregarAlCarrito(producto: ProductoPedido): void {
    const carritoActual = this.carritoSubject.value;
    
    // Buscar si existe un producto con el mismo ID y los mismos adicionales
    const productoExistente = carritoActual.find(p => 
      p.productoId === producto.productoId && 
      this.sonAdicionalesIguales(p.adicionales, producto.adicionales)
    );
    
    if (productoExistente) {
      productoExistente.cantidad += producto.cantidad;
    } else {
      carritoActual.push(producto);
    }
    
    this.actualizarCarrito(carritoActual);
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

  eliminarDelCarrito(productoId: number): void {
    const carritoActual = this.carritoSubject.value;
    const carritoFiltrado = carritoActual.filter(p => p.productoId !== productoId);
    this.actualizarCarrito(carritoFiltrado);
  }

  actualizarCantidad(productoId: number, cantidad: number): void {
    const carritoActual = this.carritoSubject.value;
    const producto = carritoActual.find(p => p.productoId === productoId);
    
    if (producto) {
      if (cantidad <= 0) {
        this.eliminarDelCarrito(productoId);
      } else {
        producto.cantidad = cantidad;
        this.actualizarCarrito(carritoActual);
      }
    }
  }

  limpiarCarrito(): void {
    this.actualizarCarrito([]);
  }

  private actualizarCarrito(carrito: ProductoPedido[]): void {
    this.carritoSubject.next(carrito);
    localStorage.setItem('carrito', JSON.stringify(carrito));
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
      let subtotal = producto.cantidad * producto.precioUnitario;
      
      if (producto.adicionales) {
        const totalAdicionales = producto.adicionales.reduce((sum, adicional) => 
          sum + (adicional.cantidad * adicional.precioUnitario), 0);
        subtotal += totalAdicionales;
      }
      
      return total + subtotal;
    }, 0);
  }

  // Crear pedido
  crearPedido(pedidoData: Omit<Pedido, 'id' | 'fechaCreacion' | 'estado' | 'productos' | 'precioTotal'>): Observable<Pedido> {
    const nuevoPedido: Pedido = {
      id: Date.now(),
      fechaCreacion: new Date(),
      estado: EstadoPedido.PENDIENTE,
      productos: this.getCarrito(),
      precioTotal: this.calcularTotal(),
      ...pedidoData
    };
    
    // Limpiar carrito después de crear el pedido
    this.limpiarCarrito();
    
    return of(nuevoPedido);
  }

  // Obtener pedidos del cliente
  getPedidosCliente(clienteId: number): Observable<Pedido[]> {
    return new Observable(observer => {
      const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
      const pedidosCliente = pedidos.filter((p: Pedido) => p.clienteId === clienteId);
      observer.next(pedidosCliente);
      observer.complete();
    });
  }

  // Obtener pedido por ID
  getPedidoById(id: number): Observable<Pedido> {
    // Mock para desarrollo
    const pedidoMock: Pedido = {
      id: id,
      fechaCreacion: new Date(),
      estado: EstadoPedido.PENDIENTE,
      precioTotal: 25000,
      clienteId: 1,
      productos: [],
      direccionEntrega: 'Dirección demo',
      metodoPago: MetodoPago.EFECTIVO
    };
    
    return of(pedidoMock);
  }

  // Obtener todos los pedidos (para administración)
  getPedidos(): Observable<Pedido[]> {
    return this.pedidos$;
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
    const pedidoActualizado: Pedido = {
      id,
      fechaCreacion: new Date(),
      estado,
      precioTotal: 25000,
      clienteId: 1,
      productos: [],
      direccionEntrega: 'Dirección actualizada',
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
      precioTotal: 25000,
      clienteId: 1,
      domiciliarioId,
      productos: [],
      direccionEntrega: 'Dirección',
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
      precioTotal: 25000,
      clienteId: 1,
      productos: [],
      direccionEntrega: 'Dirección',
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
}
