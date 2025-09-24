import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Producto, Adicional } from '../../../Model/Producto/producto';
import { ProductoService } from '../../../Service/Producto/producto.service';
import { PedidoService } from '../../../Service/Pedido/pedido.service';
import { ProductoPedido } from '../../../Model/Pedido/pedido';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  producto: Producto | null = null;
  cantidad: number = 1;
  adicionalesSeleccionados: { [key: number]: boolean } = {};
  observaciones: string = '';
  isLoading: boolean = true;
  private subscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      if (productId) {
        this.cargarProducto(productId);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  cargarProducto(id: number): void {
    this.isLoading = true;
    this.productoService.getProductos().subscribe(productos => {
      this.producto = productos.find(p => p.id === id) || null;
      this.isLoading = false;
      
      if (!this.producto) {
        this.router.navigate(['/menu']);
      }
    });
  }

  incrementarCantidad(): void {
    this.cantidad++;
  }

  decrementarCantidad(): void {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  toggleAdicional(adicionalId: number): void {
    this.adicionalesSeleccionados[adicionalId] = !this.adicionalesSeleccionados[adicionalId];
  }

  calcularPrecioTotal(): number {
    if (!this.producto) return 0;
    
    let precioBase = this.producto.precio * this.cantidad;
    let precioAdicionales = 0;
    
    if (this.producto.adicionales) {
      this.producto.adicionales.forEach(adicional => {
        if (this.adicionalesSeleccionados[adicional.id]) {
          precioAdicionales += adicional.precio * this.cantidad;
        }
      });
    }
    
    return precioBase + precioAdicionales;
  }

  agregarAlCarrito(): void {
    if (!this.producto) return;
    
    // Crear array de adicionales seleccionados
    const adicionalesSeleccionados = this.producto.adicionales?.filter(adicional => 
      this.adicionalesSeleccionados[adicional.id]
    ).map(adicional => ({
      adicionalId: adicional.id,
      cantidad: this.cantidad,
      precioUnitario: adicional.precio
    })) || [];
    
    const productoPedido: ProductoPedido = {
      productoId: this.producto.id,
      cantidad: this.cantidad,
      precioUnitario: this.producto.precio, // Precio base del producto
      adicionales: adicionalesSeleccionados.length > 0 ? adicionalesSeleccionados : undefined,
      observaciones: this.observaciones
    };
    
    this.pedidoService.agregarAlCarrito(productoPedido);
    
    // Mostrar mensaje de confirmación
    alert(`${this.producto.nombre} agregado al carrito`);
    
    // Volver al menú
    this.router.navigate(['/menu']);
  }

  volver(): void {
    this.router.navigate(['/menu']);
  }

  onOverlayClick(event: Event): void {
    // Solo cerrar si se hace clic en el overlay, no en el contenido del modal
    if (event.target === event.currentTarget) {
      this.volver();
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }
}