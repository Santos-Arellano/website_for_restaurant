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
    this.total = this.carrito.reduce((sum, item) => {
      return sum + this.getSubtotalItem(item) * 1; // subtotal ya contempla cantidad
    }, 0);
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
        // Navigate to menu or orders; backend returns success message string
        this.router.navigate(['/menu']);
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
    const base = (item.precioUnitario || 0) * (item.cantidad || 1);
    const extras = (item.adicionales || []).reduce((acc, adi) => {
      const precioAdi = (adi.precioUnitario || 0) * (adi.cantidad || item.cantidad || 1);
      return acc + precioAdi;
    }, 0);
    return base + extras;
  }

  trackByProductId(index: number, item: ProductoPedido): number {
    return (item as any).itemId || item.productoId;
  }
}