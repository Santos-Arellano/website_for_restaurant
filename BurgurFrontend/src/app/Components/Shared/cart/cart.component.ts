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
    this.total = this.carrito.reduce((sum, item) => {
      const base = (item.precioUnitario || 0) * (item.cantidad || 0);
      const adicionalesTotal = (item.adicionales || []).reduce((acc, ad) => {
        const precio = ad.precioUnitario || 0;
        const cantidad = ad.cantidad || 0;
        return acc + precio * cantidad;
      }, 0);
      return sum + base + adicionalesTotal;
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
}
