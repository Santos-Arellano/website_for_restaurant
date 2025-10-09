import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ClienteService } from './Service/Cliente/cliente.service';
import { ToastService } from './Components/Shared/toast/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'BurgurFrontend';
  showCartModal = false;
  private cartModalSubscription?: Subscription;
  private openCartHandler?: (ev: Event) => void;
  isAdminRoute = false;

  constructor(private router: Router, private clienteService: ClienteService, private toast: ToastService) {}

  ngOnInit(): void {
    // Escuchar eventos globales para abrir el modal del carrito
    this.openCartHandler = () => {
      const isLogged = !!localStorage.getItem('currentUser');
      if (!isLogged) {
        this.toast.warning('Debes iniciar sesión para abrir el carrito', 4000);
        this.showCartModal = false;
        this.router.navigate(['/login']);
        return;
      }
      this.showCartModal = true;
    };
    document.addEventListener('openCartModal', this.openCartHandler);

    // Detectar rutas admin para mostrar header correcto
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = (event as NavigationEnd).urlAfterRedirects || (event as NavigationEnd).url;
        this.isAdminRoute = url.startsWith('/admin');
      });
  }

  ngOnDestroy(): void {
    if (this.cartModalSubscription) {
      this.cartModalSubscription.unsubscribe();
    }
    if (this.openCartHandler) {
      document.removeEventListener('openCartModal', this.openCartHandler);
    }
  }

  onCloseCartModal(): void {
    this.showCartModal = false;
  }
}
