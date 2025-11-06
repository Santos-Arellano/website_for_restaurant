import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PedidoService } from '../../../Service/Pedido/pedido.service';
import { ClienteService } from '../../../Service/Cliente/cliente.service';
import { ProductoService } from '../../../Service/Producto/producto.service';
import { ProductoPedido } from '../../../Model/Pedido/pedido';
import { Cliente } from '../../../Model/Cliente/cliente';
import { Producto } from '../../../Model/Producto/producto';

@Component({
  selector: 'app-cart-modal',
  templateUrl: './cart-modal.component.html',
  styleUrls: ['./cart-modal.component.css']
})
export class CartModalComponent implements OnInit, OnDestroy {
  @Input() isVisible: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  carrito: ProductoPedido[] = [];
  productos: { [key: number]: Producto } = {}; // Cache de productos
  total: number = 0;
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

    // Cerrar modal con ESC
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isVisible) {
      this.onCloseModal();
    }
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
    if (!this.resumen || typeof this.resumen.subtotal !== 'number') {
      this.total = this.carrito.reduce((sum, item) => {
        return sum + this.getSubtotalItem(item) * 1;
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
    if (this.carrito.length === 0) {
      return;
    }

    if (!this.isLoggedIn) {
      // Mostrar modal de login o redirigir
      this.router.navigate(['/login']);
      this.onCloseModal();
      return;
    }

    this.isLoading = true;

    const clienteId = this.currentCliente?.id || 0;
    this.pedidoService.crearPedido(clienteId).subscribe({
      next: (resp) => {
        this.isLoading = false;
        this.pedidoService.limpiarCarrito();
        // Navegar a Mis Pedidos tras crear el pedido
        this.router.navigate(['/orders']);
        this.onCloseModal();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al crear el pedido:', error);
      }
    });
  }

  onCloseModal(): void {
    this.closeModal.emit();
  }

  onModalClick(event: Event): void {
    // Cerrar modal si se hace clic en el overlay
    if (event.target === event.currentTarget) {
      this.onCloseModal();
    }
  }

  continuarComprando(): void {
    this.router.navigate(['/menu']);
    this.onCloseModal();
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

  getNombreAdicional(adicionalId: number, productoId?: number): string {
    if (!adicionalId) return 'Adicional';
    const producto = productoId ? this.getProducto(productoId) : null;
    const lista = producto?.adicionales || [];
    const encontrado = lista.find(a => a.id === adicionalId);
    return encontrado?.nombre || 'Adicional';
  }

  // Calcula subtotal del item incluyendo adicionales seleccionados
  getSubtotalItem(item: ProductoPedido): number {
    // El precioUnitario que viene del backend ya incluye adicionales por unidad
    // Por coherencia, el subtotal es simplemente precioUnitario * cantidad
    const unitTotal = item?.precioUnitario || 0;
    const qty = item?.cantidad || 1;
    return unitTotal * qty;
  }

  trackByProductId(index: number, item: ProductoPedido): number {
    return (item as any).itemId || item.productoId;
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