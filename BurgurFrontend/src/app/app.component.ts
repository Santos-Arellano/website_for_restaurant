import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
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
  isLoggedIn = false;
  isRouteLoading = false;
  private loadingStartTime = 0;
  private minLoaderMs = 700;
  private loaderHideTimeout?: any;
  private isLoggedInSubscription?: Subscription;

  constructor(private router: Router, private clienteService: ClienteService, private toast: ToastService) {}

  ngOnInit(): void {
    // Suscribir estado de sesión
    this.isLoggedInSubscription = this.clienteService.isLoggedIn().subscribe(val => {
      this.isLoggedIn = val;
    });
    // Escuchar eventos globales para abrir el modal del carrito
    this.openCartHandler = () => {
      if (!this.isLoggedIn) {
        this.toast.warning('Debes iniciar sesión para abrir el carrito', 4000);
        this.showCartModal = false;
        this.router.navigate(['/login']);
        return;
      }
      this.showCartModal = true;
    };
    document.addEventListener('openCartModal', this.openCartHandler);

    // Activar loader al inicio para primera carga
    this.isRouteLoading = true;
    this.loadingStartTime = performance.now();

    // Detectar rutas admin y mostrar loader en cambios de navegación
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (this.loaderHideTimeout) { try { clearTimeout(this.loaderHideTimeout); } catch {} }
        this.loadingStartTime = performance.now();
        this.isRouteLoading = true;
      }
      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        const elapsed = performance.now() - this.loadingStartTime;
        const remaining = Math.max(0, this.minLoaderMs - elapsed);
        if (remaining > 0) {
          this.loaderHideTimeout = setTimeout(() => {
            this.isRouteLoading = false;
          }, remaining);
        } else {
          this.isRouteLoading = false;
        }
        const url = (event as NavigationEnd).urlAfterRedirects || (event as NavigationEnd).url || '';
        this.isAdminRoute = url.startsWith('/admin');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.cartModalSubscription) {
      this.cartModalSubscription.unsubscribe();
    }
    if (this.isLoggedInSubscription) {
      this.isLoggedInSubscription.unsubscribe();
    }
    if (this.openCartHandler) {
      document.removeEventListener('openCartModal', this.openCartHandler);
    }
  }

  onCloseCartModal(): void {
    this.showCartModal = false;
  }
}
