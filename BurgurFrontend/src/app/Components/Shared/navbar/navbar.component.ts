import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClienteService } from '../../../Service/Cliente/cliente.service';
import { PedidoService } from '../../../Service/Pedido/pedido.service';
import { Cliente } from '../../../Model/Cliente/cliente';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  currentUser: Cliente | null = null;
  carritoCount = 0;
  isMenuOpen = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private clienteService: ClienteService,
    private pedidoService: PedidoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse al estado de autenticación
    const authSub = this.clienteService.isLoggedIn().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.currentUser = this.clienteService.getCurrentCliente();
      } else {
        this.currentUser = null;
      }
    });

    // Suscribirse al contador del carrito
    const cartSub = this.pedidoService.getCarritoCount().subscribe(count => {
      this.carritoCount = count;
    });

    this.subscriptions.push(authSub, cartSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeMenu();
  }

  onLogin(): void {
    this.navigateTo('/login');
  }

  onRegister(): void {
    this.navigateTo('/register');
  }

  onLogout(): void {
    this.clienteService.logout().subscribe(() => {
      this.router.navigate(['/']);
      this.closeMenu();
    });
  }

  onProfile(): void {
    this.navigateTo('/profile');
  }

  irAlPerfil(): void {
    this.router.navigate(['/profile']);
  }

  onOrderHistory(): void {
    this.navigateTo('/orders');
  }

  irAlHistorial(): void {
    this.router.navigate(['/orders']);
  }

  onCart(): void {
    this.navigateTo('/cart');
  }

  irAlCarrito(): void {
    this.router.navigate(['/cart']);
  }

  getUserDisplayName(): string {
    if (this.currentUser) {
      return `${this.currentUser.nombre} ${this.currentUser.apellido}`;
    }
    return '';
  }
}
