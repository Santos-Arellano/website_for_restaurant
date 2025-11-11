import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ClienteService } from './Service/Cliente/cliente.service';
import { OperadorSessionService } from './Service/Operador/operador-session.service';
import { ToastService } from './Components/Shared/toast/toast.service';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';

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

  constructor(
    private router: Router,
    private clienteService: ClienteService,
    private toast: ToastService,
    private location: Location,
    private operadorSession: OperadorSessionService
  ) {}

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

    // Redirección basada en rol si hay JWT en almacenamiento al iniciar
    try {
      const token = localStorage.getItem('jwtToken');
      const currentUrl = this.router.url || this.location.path() || '';
      if (token) {
        const payload = this.decodeJwt(token);
        const rolesRaw: string = (payload && payload['roles']) || '';
        const roles = rolesRaw ? rolesRaw.split(',') : [];
        if (roles.includes('ADMIN') && !currentUrl.startsWith('/admin')) {
          this.router.navigateByUrl('/admin');
        } else if (roles.includes('OPERADOR') && !currentUrl.startsWith('/operador')) {
          this.router.navigateByUrl('/operador/pedidos');
        } else if (roles.includes('CLIENTE') && currentUrl === '/login') {
          this.router.navigateByUrl('/');
        }
      } else {
        // Fallback: si no hay JWT pero hay sesión de operador, redirigir al portal
        const isOperadorLogged = this.operadorSession.isAuthenticated();
        const currentUrl = this.router.url || this.location.path() || '';
        if (isOperadorLogged && !currentUrl.startsWith('/operador')) {
          this.router.navigateByUrl('/operador/pedidos');
        }
      }
    } catch {}

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

  private decodeJwt(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return decoded;
    } catch {
      return null;
    }
  }
}
