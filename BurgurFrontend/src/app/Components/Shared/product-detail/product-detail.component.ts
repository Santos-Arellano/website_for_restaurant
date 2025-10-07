import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../Shared/toast/toast.service';
import { Subscription } from 'rxjs';
import { Producto, Adicional } from '../../../Model/Producto/producto';
import { ProductoService } from '../../../Service/Producto/producto.service';
import { PedidoService } from '../../../Service/Pedido/pedido.service';
import { ClienteService } from '../../../Service/Cliente/cliente.service';
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
    private pedidoService: PedidoService,
    private toast: ToastService,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      if (productId) {
        this.cargarProducto(productId);
        document.body.classList.add('no-scroll');
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    document.body.classList.remove('no-scroll');
  }

  cargarProducto(id: number): void {
    this.isLoading = true;
    this.productoService.getProductoById(id).subscribe(prod => {
      this.producto = prod || null;
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
    // Gate de autenticación
    const isLogged = !!localStorage.getItem('currentUser');
    if (!isLogged) {
      this.toast.warning('Inicia sesión para agregar productos al carrito', 4000);
      this.router.navigate(['/login']);
      return;
    }
    
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

    // Animación: volar imagen al botón del carrito
    this.animateFlyToCart();
    
    // Notificación moderna
    this.toast.success(`${this.producto.nombre} agregado al carrito`, 2500);
    
    // Navegar de vuelta tras breve retraso para permitir la animación
    setTimeout(() => {
      this.router.navigate(['/menu']);
    }, 400);
  }

  volver(): void {
    document.body.classList.remove('no-scroll');
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

  // Animación de vuelo de la imagen al carrito en el header
  private animateFlyToCart(): void {
    try {
      const sourceImg = document.querySelector('.detail-image') as HTMLImageElement | null;
      const cartBtn = document.getElementById('cartBtn');
      if (!sourceImg || !cartBtn) {
        return; // Si no hay elementos, salimos sin animar
      }

      const imgRect = sourceImg.getBoundingClientRect();
      const cartRect = cartBtn.getBoundingClientRect();

      const clone = sourceImg.cloneNode(true) as HTMLImageElement;
      clone.classList.add('flying-image');
      clone.style.position = 'fixed';
      clone.style.left = `${imgRect.left}px`;
      clone.style.top = `${imgRect.top}px`;
      clone.style.width = `${imgRect.width}px`;
      clone.style.height = `${imgRect.height}px`;
      clone.style.zIndex = '9999';
      clone.style.pointerEvents = 'none';
      clone.style.transition = 'transform 0.55s ease-in-out, opacity 0.55s ease-in-out';
      clone.style.transform = 'translate(0, 0) scale(1)';
      clone.style.opacity = '1';

      document.body.appendChild(clone);

      const deltaX = cartRect.left + cartRect.width / 2 - (imgRect.left + imgRect.width / 2);
      const deltaY = cartRect.top + cartRect.height / 2 - (imgRect.top + imgRect.height / 2);

      requestAnimationFrame(() => {
        clone.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.2)`;
        clone.style.opacity = '0.2';
      });

      const cleanup = () => {
        clone.removeEventListener('transitionend', cleanup);
        if (clone && clone.parentElement) {
          clone.parentElement.removeChild(clone);
        }
      };

      clone.addEventListener('transitionend', cleanup);
    } catch (e) {
      // Silenciar errores de animación para no afectar el flujo
      console.warn('Fly-to-cart animation skipped:', e);
    }
  }
}