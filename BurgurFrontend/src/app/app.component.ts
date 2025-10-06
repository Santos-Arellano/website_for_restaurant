import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
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
  isAdminRoute = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Escuchar eventos globales para abrir el modal del carrito
    document.addEventListener('openCartModal', () => {
      this.showCartModal = true;
    });

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
  }

  onCloseCartModal(): void {
    this.showCartModal = false;
  }
}
