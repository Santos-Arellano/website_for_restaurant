// ==========================================
// BURGER CLUB - ANGULAR CART SIDEBAR COMPONENT
// ==========================================

import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../../../../core/services/cart.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { HelpersUtil } from '../../../../shared/utils/helpers.util';
import { ANIMATION_DURATIONS, SUCCESS_MESSAGES } from '../../../../shared/constants/app.constants';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cart-overlay" 
         [class.active]="isOpen" 
         (click)="close()"
         #overlay>
    </div>
    
    <div class="cart-sidebar" 
         [class.active]="isOpen"
         #cartSidebar>
      
      <div class="cart-header">
        <h3>
          <i class="fas fa-shopping-cart"></i>
          Tu Carrito
          <span class="cart-count" *ngIf="itemCount > 0">({{ itemCount }})</span>
        </h3>
        <button class="cart-close" 
                (click)="close()"
                aria-label="Cerrar carrito">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="cart-content">
        <!-- Empty State -->
        <div *ngIf="items.length === 0" class="cart-empty">
          <div class="empty-icon">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <h4>Tu carrito está vacío</h4>
          <p>Agrega algunos productos deliciosos para comenzar</p>
          <button class="btn btn-primary" (click)="goToMenu()">
            <i class="fas fa-utensils"></i>
            Ver Menú
          </button>
        </div>

        <!-- Cart Items -->
        <div *ngIf="items.length > 0" class="cart-items">
          <div *ngFor="let item of items; trackBy: trackByItemId" 
               class="cart-item"
               [attr.data-id]="item.id">
            
            <div class="item-image">
              <img [src]="item.imgURL" 
                   [alt]="item.nombre"
                   (error)="onImageError($event)">
            </div>
            
            <div class="item-details">
              <h4 class="item-name">{{ item.nombre }}</h4>
              
              <div class="item-adicionales" *ngIf="item.adicionales && item.adicionales.length > 0">
                <span class="adicionales-label">Con:</span>
                <span class="adicionales-list">
                  {{ getAdicionalesText(item.adicionales) }}
                </span>
              </div>
              
              <div class="item-price">
                {{ formatPrice(item.precio) }}
                <span *ngIf="item.adicionales && item.adicionales.length > 0" class="base-price">
                  (Base: {{ formatPrice(item.precio - getAdicionalesTotal(item.adicionales)) }})
                </span>
              </div>
            </div>
            
            <div class="item-controls">
              <div class="quantity-controls">
                <button class="quantity-btn decrease"
                        (click)="decreaseQuantity(item)"
                        [disabled]="item.quantity <= 1"
                        aria-label="Disminuir cantidad">
                  <i class="fas fa-minus"></i>
                </button>
                
                <span class="quantity-display">{{ item.quantity }}</span>
                
                <button class="quantity-btn increase"
                        (click)="increaseQuantity(item)"
                        [disabled]="item.quantity >= 99"
                        aria-label="Aumentar cantidad">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              
              <button class="remove-item-btn"
                      (click)="removeItem(item)"
                      aria-label="Eliminar producto">
                <i class="fas fa-trash"></i>
              </button>
            </div>
            
            <div class="item-total">
              {{ formatPrice(item.totalPrice) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Footer -->
      <div *ngIf="items.length > 0" class="cart-footer">
        <div class="cart-summary">
          <div class="summary-row subtotal">
            <span>Subtotal:</span>
            <span>{{ formatPrice(total) }}</span>
          </div>
          
          <div class="summary-row delivery">
            <span>Domicilio:</span>
            <span class="free">Gratis</span>
          </div>
          
          <div class="summary-row total">
            <span>Total:</span>
            <span>{{ formatPrice(total) }}</span>
          </div>
        </div>
        
        <div class="cart-actions">
          <button class="btn btn-secondary clear-cart"
                  (click)="clearCart()"
                  [disabled]="isProcessing">
            <i class="fas fa-trash-alt"></i>
            Limpiar Carrito
          </button>
          
          <button class="btn btn-primary checkout"
                  (click)="proceedToCheckout()"
                  [disabled]="isProcessing">
            <i class="fas fa-credit-card"></i>
            <span *ngIf="!isProcessing">Proceder al Pago</span>
            <span *ngIf="isProcessing">Procesando...</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 998;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .cart-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    .cart-sidebar {
      position: fixed;
      top: 0;
      right: -400px;
      width: 400px;
      height: 100%;
      background: white;
      z-index: 999;
      transition: right 0.3s ease;
      box-shadow: -2px 0 20px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
    }

    .cart-sidebar.active {
      right: 0;
    }

    .cart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
      background: #f8f9fa;
    }

    .cart-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .cart-count {
      background: #d4a574;
      color: white;
      border-radius: 50%;
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .cart-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #666;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .cart-close:hover {
      background: #e9ecef;
      color: #333;
    }

    .cart-content {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
    }

    .cart-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3rem 1rem;
      color: #666;
    }

    .empty-icon {
      font-size: 4rem;
      color: #ddd;
      margin-bottom: 1rem;
    }

    .cart-empty h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .cart-empty p {
      margin: 0 0 2rem 0;
      line-height: 1.5;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 60px 1fr auto auto;
      grid-template-rows: auto auto;
      gap: 0.75rem;
      padding: 1rem;
      border: 1px solid #eee;
      border-radius: 8px;
      transition: all 0.3s ease;
      position: relative;
    }

    .cart-item:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .item-image {
      grid-row: 1 / 3;
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-details {
      grid-column: 2;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .item-name {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 600;
      color: #333;
      line-height: 1.3;
    }

    .item-adicionales {
      font-size: 0.75rem;
      color: #666;
    }

    .adicionales-label {
      font-weight: 500;
    }

    .item-price {
      font-size: 0.85rem;
      font-weight: 600;
      color: #d4a574;
    }

    .base-price {
      font-size: 0.7rem;
      color: #999;
      font-weight: normal;
    }

    .item-controls {
      grid-column: 3;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }

    .quantity-btn {
      background: #f8f9fa;
      border: none;
      padding: 0.25rem 0.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
    }

    .quantity-btn:hover:not(:disabled) {
      background: #e9ecef;
    }

    .quantity-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity-display {
      padding: 0.25rem 0.5rem;
      font-weight: 600;
      font-size: 0.85rem;
      min-width: 30px;
      text-align: center;
    }

    .remove-item-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.8rem;
    }

    .remove-item-btn:hover {
      background: #c82333;
    }

    .item-total {
      grid-column: 4;
      grid-row: 1 / 3;
      display: flex;
      align-items: center;
      font-weight: 700;
      color: #333;
      font-size: 0.9rem;
    }

    .cart-footer {
      border-top: 1px solid #eee;
      padding: 1.5rem;
      background: #f8f9fa;
    }

    .cart-summary {
      margin-bottom: 1.5rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
    }

    .summary-row.subtotal {
      border-bottom: 1px solid #eee;
    }

    .summary-row.total {
      border-top: 2px solid #d4a574;
      font-weight: 700;
      font-size: 1.1rem;
      color: #333;
      margin-top: 0.5rem;
      padding-top: 1rem;
    }

    .free {
      color: #28a745;
      font-weight: 600;
    }

    .cart-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .btn {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      text-decoration: none;
    }

    .btn-primary {
      background: #d4a574;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #c19660;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    @media (max-width: 480px) {
      .cart-sidebar {
        width: 100%;
        right: -100%;
      }
    }

    @media (max-width: 400px) {
      .cart-item {
        grid-template-columns: 50px 1fr auto;
        grid-template-rows: auto auto auto;
      }

      .item-total {
        grid-column: 1 / 4;
        grid-row: 3;
        justify-content: flex-end;
        padding-top: 0.5rem;
        border-top: 1px solid #eee;
      }
    }
  `]
})
export class CartSidebarComponent implements OnInit, OnDestroy {
  @ViewChild('cartSidebar', { static: true }) cartSidebarRef!: ElementRef;
  @ViewChild('overlay', { static: true }) overlayRef!: ElementRef;

  isOpen = false;
  isProcessing = false;
  items: CartItem[] = [];
  total = 0;
  itemCount = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private cartService: CartService,
    private notificationService: NotificationService,
    private helpersUtil: HelpersUtil,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.setupSubscriptions();
    this.setupEventListeners();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isOpen) {
      this.close();
    }
  }

  open(): void {
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this.isOpen = false;
    document.body.style.overflow = '';
  }

  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  increaseQuantity(item: CartItem): void {
    if (item.quantity < 99) {
      this.cartService.updateQuantity(item.id, item.quantity + 1);
      this.addButtonAnimation('.quantity-btn.increase');
    }
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.id, item.quantity - 1);
      this.addButtonAnimation('.quantity-btn.decrease');
    }
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.id);
    this.addRemoveAnimation(item.id);
  }

  clearCart(): void {
    if (confirm('¿Estás seguro de que quieres limpiar el carrito?')) {
      this.cartService.clearCart();
      this.notificationService.show(
        SUCCESS_MESSAGES.cartCleared,
        'info',
        3000
      );
    }
  }

  async proceedToCheckout(): Promise<void> {
    if (this.items.length === 0 || this.isProcessing) return;

    this.isProcessing = true;

    try {
      // Close cart and navigate to checkout
      this.close();
      await this.router.navigate(['/checkout']);
    } catch (error) {
      console.error('Error navigating to checkout:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  goToMenu(): void {
    this.close();
    this.router.navigate(['/menu']);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23f8f9fa'/%3E%3Ctext x='30' y='35' font-size='20' text-anchor='middle'%3E🍔%3C/text%3E%3C/svg%3E";
  }

  trackByItemId(index: number, item: CartItem): string {
    return item.id;
  }

  formatPrice(price: number): string {
    return this.helpersUtil.formatPrice(price);
  }

  getAdicionalesText(adicionales: any[]): string {
    return adicionales.map(a => a.nombre).join(', ');
  }

  getAdicionalesTotal(adicionales: any[]): number {
    return adicionales.reduce((total, a) => total + a.precio, 0);
  }

  private setupSubscriptions(): void {
    // Subscribe to cart state changes
    this.subscriptions.push(
      this.cartService.items$.subscribe(items => {
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
        this.itemCount = count;
      })
    );

    this.subscriptions.push(
      this.cartService.isOpen$.subscribe(isOpen => {
        if (isOpen) {
          this.open();
        } else {
          this.close();
        }
      })
    );
  }

  private setupEventListeners(): void {
    // Handle clicks outside cart
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  private handleOutsideClick(event: Event): void {
    if (!this.isOpen) return;

    const target = event.target as HTMLElement;
    const cartSidebar = this.cartSidebarRef?.nativeElement;
    const cartToggle = document.querySelector('.cart-toggle');

    if (cartSidebar && !cartSidebar.contains(target) && !cartToggle?.contains(target)) {
      this.close();
    }
  }

  private addButtonAnimation(selector: string): void {
    const button = this.elementRef.nativeElement.querySelector(selector);
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, ANIMATION_DURATIONS.fast);
    }
  }

  private addRemoveAnimation(itemId: string): void {
    const cartItem = this.elementRef.nativeElement.querySelector(`[data-id="${itemId}"]`);
    if (cartItem) {
      cartItem.style.transform = 'translateX(100%)';
      cartItem.style.opacity = '0';
    }
  }
}