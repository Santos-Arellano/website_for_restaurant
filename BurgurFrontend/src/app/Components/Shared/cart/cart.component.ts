import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PedidoService } from '../../../Service/Pedido/pedido.service';
import { ClienteService } from '../../../Service/Cliente/cliente.service';
import { ProductoService } from '../../../Service/Producto/producto.service';
import { ProductoPedido } from '../../../Model/Pedido/pedido';
import { Cliente } from '../../../Model/Cliente/cliente';
import { Producto } from '../../../Model/Producto/producto';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  carrito: ProductoPedido[] = [];
  productos: { [key: number]: Producto } = {}; // Cache de productos
  total: number = 0; // subtotal
  isLoggedIn: boolean = false;
  currentCliente: Cliente | null = null;
  isLoading: boolean = false;
  summaryExpanded: boolean = false;
  // Cupón
  couponInput: string = '';
  appliedCoupon: { code: string; description?: string } | null = null;
  discountAmount: number = 0; // from backend resumen
  private resumen: { subtotal: number; descuento: number; costoEnvio: number; total: number; cuponCodigo?: string | null } = { subtotal: 0, descuento: 0, costoEnvio: 3000, total: 0, cuponCodigo: null };
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private pedidoService: PedidoService,
    private clienteService: ClienteService,
    private productoService: ProductoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.pedidoService.carrito$.subscribe(carrito => {
        this.carrito = carrito;
        this.cargarProductos();
        this.calcularTotal();
        this.recomputeSubtotal();
      })
    );

    this.subscriptions.add(
      this.pedidoService.carritoResumen$.subscribe(res => {
        this.resumen = res;
        this.recomputeSubtotal();
        this.discountAmount = res.descuento;
        this.appliedCoupon = res.cuponCodigo ? { code: res.cuponCodigo } : null;
      })
    );

    this.subscriptions.add(
      this.clienteService.isLoggedIn().subscribe(loggedIn => {
        this.isLoggedIn = loggedIn;
      })
    );

    this.subscriptions.add(
      this.clienteService.currentCliente$.subscribe(cliente => {
        this.currentCliente = cliente;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  cargarProductos(): void {
    // Cargar información de productos para mostrar en el carrito
    this.subscriptions.add(
      this.productoService.getProductos().subscribe(productos => {
        productos.forEach(producto => {
          this.productos[producto.id] = producto;
        });
      })
    );
  }

  calcularTotal(): void {
    // Subtotal ya viene del backend al suscribir carritoResumen$.
    // Mantener cálculo como respaldo si no hay resumen aún.
    if (!this.resumen || typeof this.resumen.subtotal !== 'number') {
      this.total = this.carrito.reduce((sum, item) => {
        const unitTotal = item?.precioUnitario || 0;
        const qty = item?.cantidad || 0;
        return sum + (unitTotal * qty);
      }, 0);
    }
  }

  private recomputeSubtotal(): void {
    const localSubtotal = this.carrito.reduce((sum, item) => {
      const unitTotal = item?.precioUnitario || 0;
      const qty = item?.cantidad || 0;
      return sum + (unitTotal * qty);
    }, 0);
    const backendSubtotal = typeof this.resumen?.subtotal === 'number' ? this.resumen.subtotal : 0;
    const hasDiscrepancy = Math.abs((backendSubtotal || 0) - (localSubtotal || 0)) > 1;
    this.total = hasDiscrepancy ? localSubtotal : backendSubtotal;
  }

  actualizarCantidad(itemId: number, nuevaCantidad: number): void {
    if (nuevaCantidad <= 0) {
      this.eliminarDelCarrito(itemId);
      return;
    }
    this.pedidoService.actualizarCantidad(itemId, nuevaCantidad);
  }

  eliminarDelCarrito(itemId: number): void {
    this.pedidoService.eliminarDelCarritoPorItemId(itemId);
  }

  limpiarCarrito(): void {
    this.pedidoService.limpiarCarrito();
  }

  procederAlPago(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.carrito.length === 0) {
      return;
    }

    this.isLoading = true;
    
    // Crear el pedido
    const clienteId = this.currentCliente?.id || 0;
    this.pedidoService.crearPedido(clienteId).subscribe({
      next: (resp) => {
        this.isLoading = false;
        this.limpiarCarrito();
        // Navegar a Mis Pedidos tras crear el pedido
        this.router.navigate(['/orders']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al crear el pedido:', error);
      }
    });
  }

  continuarComprando(): void {
    this.router.navigate(['/menu']);
  }

  toggleSummary(): void {
    this.summaryExpanded = !this.summaryExpanded;
  }

  getProducto(productoId: number): Producto | null {
    return this.productos[productoId] || null;
  }

  getImageUrl(productoId: number): string {
    const producto = this.getProducto(productoId);
    if (!producto || !producto.imagen) {
      return 'assets/Menu/cheeseburger.png';
    }
    return producto.imagen;
  }

  getNombreProducto(productoId: number): string {
    const producto = this.getProducto(productoId);
    return producto?.nombre || 'Producto';
  }

  // ====== CUPONES ======
  applyCoupon(): void {
    const code = (this.couponInput || '').trim().toUpperCase();
    if (!code) {
      this.clearCoupon();
      return;
    }
    this.pedidoService.aplicarCupon(code);
  }

  clearCoupon(): void {
    this.pedidoService.quitarCupon();
  }

  getShipping(): number {
    return this.resumen?.costoEnvio || 0;
  }

  getFinalTotal(): number {
    const localSubtotal = this.total || this.carrito.reduce((sum, item) => {
      const unitTotal = item?.precioUnitario || 0;
      const qty = item?.cantidad || 0;
      return sum + (unitTotal * qty);
    }, 0);
    const backendSubtotal = typeof this.resumen?.subtotal === 'number' ? this.resumen.subtotal : 0;
    const discount = typeof this.resumen?.descuento === 'number' ? this.resumen.descuento : (this.discountAmount || 0);
    const shipping = this.getShipping();
    const expectedBackendTotal = Math.max(0, backendSubtotal - discount) + shipping;
    const hasSubtotalDiscrepancy = Math.abs((backendSubtotal || 0) - (localSubtotal || 0)) > 1;
    const hasTotalMismatch = typeof this.resumen?.total === 'number' && Math.abs(this.resumen.total - expectedBackendTotal) > 1;
    if (!hasSubtotalDiscrepancy && !hasTotalMismatch && typeof this.resumen?.total === 'number') {
      return this.resumen.total;
    }
    return Math.max(0, localSubtotal - discount) + shipping;
  }
}
