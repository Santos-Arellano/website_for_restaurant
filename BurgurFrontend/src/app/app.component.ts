import { Component, OnInit, OnDestroy } from '@angular/core';
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

  ngOnInit(): void {
    // Escuchar eventos globales para abrir el modal del carrito
    document.addEventListener('openCartModal', () => {
      this.showCartModal = true;
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
