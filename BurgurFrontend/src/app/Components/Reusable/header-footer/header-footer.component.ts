import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PedidoService } from '../../../Service/Pedido/pedido.service';
import { ClienteService } from '../../../Service/Cliente/cliente.service';
import { ProductoService } from '../../../Service/Producto/producto.service';
import { AdicionalService } from '../../../Service/Adicional/adicional.service';
import { AuthModalComponent } from '../../Shared/auth-modal/auth-modal.component';
import { ProductoPedido } from '../../../Model/Pedido/pedido';
import { Producto } from '../../../Model/Producto/producto';
import { Adicional } from '../../../Model/Adicional/adicional';
import { ToastService } from '../../Shared/toast/toast.service';

@Component({
  selector: 'app-header-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthModalComponent],
  templateUrl: './header-footer.component.html',
  styleUrls: ['./header-footer.component.css']
})
export class HeaderFooterComponent implements OnInit {
  isLoggedIn = false;
  currentUser: any = null;
  isAuthModalOpen = false;
  isCartModalOpen = false;
  cartItemCount = 0;
  carrito: ProductoPedido[] = [];
  productos: { [key: number]: Producto } = {}; // Cache de productos
  adicionales: { [key: number]: Adicional } = {}; // Cache de adicionales
  
  // Auth modal properties
  showAuthModal = false;
  authMode: 'login' | 'register' = 'login';

  // Location modal properties
  showLocationModal = false;

  constructor(
    private pedidoService: PedidoService,
    private clienteService: ClienteService,
    private productoService: ProductoService,
    private adicionalService: AdicionalService,
    public router: Router,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.checkAuthStatus();
    this.updateCartCount();
    this.cargarProductos();
    this.cargarAdicionales();
  }

  private checkAuthStatus() {
    // Suscribirse al observable del cliente actual
    this.clienteService.currentCliente$.subscribe(cliente => {
      this.isLoggedIn = !!cliente;
      if (cliente) {
        this.currentUser = {
          name: cliente.nombre,
          email: cliente.correo
        };
      } else {
        this.currentUser = null;
      }
    });
  }

  private updateCartCount() {
    // Suscribirse al carrito para actualizar el contador en tiempo real
    this.pedidoService.carrito$.subscribe(carrito => {
      this.carrito = carrito;
      this.cartItemCount = carrito.reduce((total, item) => total + item.cantidad, 0);
    });
  }

  private cargarProductos(): void {
    this.productoService.getProductos().subscribe(productos => {
      productos.forEach(producto => {
        this.productos[producto.id] = producto;
      });
    });
  }

  private cargarAdicionales(): void {
    this.adicionalService.getAdicionales().subscribe(adicionales => {
      adicionales.forEach(adicional => {
        this.adicionales[adicional.id] = adicional;
      });
    });
  }

  getNombreProducto(productoId: number): string {
    return this.productos[productoId]?.nombre || 'Producto no encontrado';
  }

  getImageUrl(productoId: number): string {
    return this.productos[productoId]?.imagen || 'assets/images/default-product.jpg';
  }

  actualizarCantidad(productoId: number, nuevaCantidad: number): void {
    if (nuevaCantidad <= 0) {
      this.eliminarDelCarrito(productoId);
    } else {
      this.pedidoService.actualizarCantidad(productoId, nuevaCantidad);
    }
  }

  eliminarDelCarrito(productoId: number): void {
    this.pedidoService.eliminarDelCarrito(productoId);
  }

  calcularTotalCarrito(): number {
    return this.carrito.reduce((total, item) => {
      let subtotal = (this.productos[item.productoId]?.precio || 0) * item.cantidad;
      
      // Agregar el precio de los adicionales
      if (item.adicionales && item.adicionales.length > 0) {
        const totalAdicionales = item.adicionales.reduce((sum, adicional) => 
          sum + (adicional.precioUnitario * adicional.cantidad), 0);
        subtotal += totalAdicionales;
      }
      
      return total + subtotal;
    }, 0);
  }

  // Método para obtener el nombre de un adicional
  getNombreAdicional(adicionalId: number): string {
    return this.adicionales[adicionalId]?.nombre || 'Adicional no encontrado';
  }

  // Método para obtener los adicionales de un producto del carrito
  getAdicionalesProducto(item: ProductoPedido): string {
    if (!item.adicionales || item.adicionales.length === 0) {
      return '';
    }
    
    return item.adicionales.map(adicional => 
      this.getNombreAdicional(adicional.adicionalId)
    ).join(', ');
  }

  // Auth methods
  // Método para calcular el total de adicionales de un producto
  getAdicionalesTotal(item: ProductoPedido): number {
    if (!item.adicionales || item.adicionales.length === 0) {
      return 0;
    }
    return item.adicionales.reduce((sum, adicional) => sum + (adicional.precioUnitario * adicional.cantidad), 0);
  }

  onLogin() {
    this.router.navigate(['/login']);
  }

  onRegister() {
    this.router.navigate(['/register']);
  }

  onLogout() {
    this.clienteService.logout().subscribe(() => {
      this.isLoggedIn = false;
      this.currentUser = null;
      this.router.navigate(['/']);
    });
  }

  onCartClick() {
    console.log('Intento de abrir carrito (Angular modal)');
    // Exigir sesión antes de abrir el carrito
    if (!this.isLoggedIn) {
      this.toast.warning('Inicia sesión para usar el carrito', 4000);
      this.router.navigate(['/login']);
      return;
    }
    // Dispara el evento global para abrir el CartModal Angular controlado por AppComponent
    document.dispatchEvent(new Event('openCartModal'));
  }

  closeCartModal() {
    this.isCartModalOpen = false;
  }

  onProfile() {
    this.router.navigate(['/profile']);
  }

  onLocationClick() {
    this.showLocationModal = true;
  }

  onCloseLocationModal() {
    this.showLocationModal = false;
  }

  onOpenMaps() {
    const address = 'Carrera 13 #85-32, Bogotá, Colombia';
    const encodedAddress = encodeURIComponent(address);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
    this.showLocationModal = false;
  }

  onCallRestaurant() {
    window.open('tel:+571234567890', '_self');
  }

  onOpenWhatsApp() {
    const phoneNumber = '571234567890';
    const message = encodeURIComponent('¡Hola! Me gustaría hacer un pedido en BurGur.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    this.showLocationModal = false;
  }
}
