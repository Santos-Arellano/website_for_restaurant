import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { HelpersService } from '../../services/helpers.service';
import { ConstantsService } from '../../services/constants.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart-modal.component.html',
  styleUrls: ['./cart-modal.component.css']
})
export class CartModalComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  cartTotal = 0;
  isOpen = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private cartService: CartService,
    private helpersService: HelpersService,
    private notificationService: NotificationService,
    private constants: ConstantsService
  ) {}

  ngOnInit(): void {
    // Subscribe to cart items
    this.subscription.add(
      this.cartService.cart$.subscribe((items: CartItem[]) => {
        this.cartItems = items;
      })
    );

    // Subscribe to cart total
    this.subscription.add(
      this.cartService.total$.subscribe((total: number) => {
        this.cartTotal = total;
      })
    );

    // Subscribe to cart open state
    this.subscription.add(
      this.cartService.isOpen$.subscribe((isOpen: boolean) => {
        this.isOpen = isOpen;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  trackByItem(index: number, item: CartItem): string {
    return item.id;
  }

  formatPrice(price: number): string {
    return this.helpersService.formatPrice(price);
  }

  hasAdicionales(item: CartItem): boolean {
    const itemWithAdicionales = item as any;
    return itemWithAdicionales.adicionales && itemWithAdicionales.adicionales.length > 0;
  }

  getAdicionalesText(item: CartItem): string {
    const itemWithAdicionales = item as any;
    const adicionales = itemWithAdicionales.adicionales || [];
    return adicionales.map((a: any) => a.nombre).join(', ');
  }

  getItemTotalPrice(item: CartItem): number {
    const basePrice = item.price;
    const adicionalesPrice = (item as any).adicionales ? 
      (item as any).adicionales.reduce((sum: number, adicional: any) => sum + (adicional.precio || 0), 0) : 0;
    return (basePrice + adicionalesPrice) * item.quantity;
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
    if (confirm('¿Estás seguro de que quieres limpiar el carrito?')) {
      this.cartService.clearCart();
    }
  }

  closeCart(): void {
    this.cartService.closeCart();
  }

  openCart(): void {
    this.cartService.openCart();
  }

  checkout(): void {
    if (this.cartItems.length === 0) {
      this.notificationService.showWarning(this.constants.ERROR_MESSAGES.cartEmpty);
      return;
    }

    // Implement checkout logic
    this.notificationService.showInfo('Redirigiendo al checkout...');
    // Navigate to checkout page or show checkout modal
  }
}