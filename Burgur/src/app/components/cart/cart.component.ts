import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  items: CartItem[] = [];
  total = 0;
  count = 0;
  isOpen = false;
  
  private subscriptions: Subscription[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    // Suscribirse a los cambios del carrito
    this.subscriptions.push(
      this.cartService.cart$.subscribe(items => {
        this.items = items;
      })
    );

    this.subscriptions.push(
      this.cartService.total$.subscribe(total => {
        this.total = total;
      })
    );

    this.subscriptions.push(
      this.cartService.count$.subscribe(count => {
        this.count = count;
      })
    );

    this.subscriptions.push(
      this.cartService.isOpen$.subscribe(isOpen => {
        this.isOpen = isOpen;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  closeCart(): void {
    this.cartService.closeCart();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeCart();
    }
  }

  increaseQuantity(itemId: string): void {
    this.cartService.increaseQuantity(itemId);
  }

  decreaseQuantity(itemId: string): void {
    this.cartService.decreaseQuantity(itemId);
  }

  removeItem(itemId: string): void {
    this.cartService.removeItem(itemId);
  }

  clearCart(): void {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      this.cartService.clearCart();
    }
  }

  getItemTotalPrice(item: CartItem): number {
    let total = item.price * item.quantity;
    if (item.adicionales) {
      total += item.adicionales.reduce((sum, adicional) => sum + adicional.price, 0) * item.quantity;
    }
    return total;
  }

  checkout(): void {
    console.log('Proceder al checkout con items:', this.items);
    // Aquí implementarías la lógica de checkout
  }
}