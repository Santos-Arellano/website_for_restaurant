// ==========================================
// BURGER CLUB - ANGULAR PRODUCT DETAIL MODAL COMPONENT
// ==========================================

import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { CartService, Product, Adicional, CartItem } from '../../../../core/services/cart.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { HelpersUtil } from '../../../../shared/utils/helpers.util';
import { ANIMATION_DURATIONS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../../../shared/constants/app.constants';

export interface ProductDetailResponse {
  producto?: Product;
  product?: Product;
  adicionalesPermitidos?: Adicional[];
  adicionales?: Adicional[];
}

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="product-detail-modal" 
         [class.show]="isVisible" 
         (click)="onOverlayClick($event)"
         #modal>
      
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>
            <i class="fas fa-hamburger"></i> 
            {{ product?.nombre }}
          </h2>
          <button class="modal-close" 
                  type="button" 
                  (click)="close()"
                  aria-label="Cerrar modal">
            &times;
          </button>
        </div>
        
        <div class="modal-body" *ngIf="product">
          <div class="product-detail-grid">
            
            <!-- Product Image Section -->
            <div class="product-image-section">
              <img [src]="product.imgURL" 
                   [alt]="product.nombre" 
                   class="product-detail-image"
                   (error)="onImageError($event)">
              
              <div *ngIf="product.nuevo" class="product-badge nuevo">
                Nuevo
              </div>
            </div>
            
            <!-- Product Info Section -->
            <div class="product-info-section">
              <div class="product-description" *ngIf="product.descripcion">
                <p>{{ product.descripcion }}</p>
              </div>
              
              <div class="product-price">
                <span class="price-label">Precio base:</span>
                <span class="price-value">{{ formatPrice(product.precio) }}</span>
              </div>
              
              <!-- Adicionales Section -->
              <div class="adicionales-section" *ngIf="adicionales && adicionales.length > 0">
                <h3>
                  <i class="fas fa-plus-circle"></i>
                  Adicionales disponibles
                </h3>
                
                <div class="adicionales-grid">
                  <div *ngFor="let adicional of adicionales; trackBy: trackByAdicionalId" 
                       class="adicional-item"
                       [class.selected]="isAdicionalSelected(adicional.id)">
                    
                    <label class="adicional-checkbox">
                      <input type="checkbox"
                             [checked]="isAdicionalSelected(adicional.id)"
                             (change)="toggleAdicional(adicional, $event)">
                      <span class="checkmark"></span>
                      
                      <div class="adicional-info">
                        <span class="adicional-name">{{ adicional.nombre }}</span>
                        <span class="adicional-price">+{{ formatPrice(adicional.precio) }}</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              
              <!-- Quantity Section -->
              <div class="quantity-section">
                <label for="quantity">Cantidad:</label>
                <div class="quantity-controls">
                  <button type="button" 
                          class="quantity-btn decrease"
                          (click)="decreaseQuantity()"
                          [disabled]="quantity <= 1">
                    <i class="fas fa-minus"></i>
                  </button>
                  
                  <input type="number" 
                         id="quantity"
                         [(ngModel)]="quantity"
                         [min]="1"
                         [max]="99"
                         class="quantity-input"
                         (change)="onQuantityChange()">
                  
                  <button type="button" 
                          class="quantity-btn increase"
                          (click)="increaseQuantity()"
                          [disabled]="quantity >= 99">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              
              <!-- Total Price -->
              <div class="total-price-section">
                <div class="total-price">
                  <span class="total-label">Total:</span>
                  <span class="total-value">{{ formatPrice(calculateTotal()) }}</span>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="modal-actions">
                <button type="button" 
                        class="btn btn-secondary"
                        (click)="close()">
                  <i class="fas fa-times"></i>
                  Cancelar
                </button>
                
                <button type="button" 
                        class="btn btn-primary add-to-cart-btn"
                        (click)="addToCart()"
                        [disabled]="isAddingToCart">
                  <i class="fas fa-shopping-cart"></i>
                  <span *ngIf="!isAddingToCart">Agregar al Carrito</span>
                  <span *ngIf="isAddingToCart">Agregando...</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Loading State -->
        <div *ngIf="isLoading" class="modal-loading">
          <div class="loading-spinner"></div>
          <p>Cargando detalles del producto...</p>
        </div>
        
        <!-- Error State -->
        <div *ngIf="hasError" class="modal-error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ errorMessage }}</p>
          <button class="btn btn-primary" (click)="retry()">
            Reintentar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-detail-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      padding: 1rem;
    }

    .product-detail-modal.show {
      opacity: 1;
      visibility: visible;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      transform: scale(0.9);
      transition: transform 0.3s ease;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .product-detail-modal.show .modal-content {
      transform: scale(1);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
      background: #f8f9fa;
      border-radius: 12px 12px 0 0;
    }

    .modal-header h2 {
      margin: 0;
      color: #333;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 2rem;
      color: #666;
      cursor: pointer;
      padding: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .modal-close:hover {
      background: #e9ecef;
      color: #333;
    }

    .modal-body {
      padding: 2rem;
    }

    .product-detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: start;
    }

    .product-image-section {
      position: relative;
    }

    .product-detail-image {
      width: 100%;
      height: 300px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .product-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #28a745;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .product-info-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .product-description p {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }

    .product-price {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .price-label {
      font-weight: 600;
      color: #333;
    }

    .price-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #d4a574;
    }

    .adicionales-section h3 {
      margin: 0 0 1rem 0;
      color: #333;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .adicionales-grid {
      display: grid;
      gap: 0.75rem;
    }

    .adicional-item {
      border: 2px solid #eee;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .adicional-item.selected {
      border-color: #d4a574;
      background: #fef9f3;
    }

    .adicional-checkbox {
      display: flex;
      align-items: center;
      padding: 1rem;
      cursor: pointer;
      gap: 0.75rem;
      margin: 0;
    }

    .adicional-checkbox input[type="checkbox"] {
      display: none;
    }

    .checkmark {
      width: 20px;
      height: 20px;
      border: 2px solid #ddd;
      border-radius: 4px;
      position: relative;
      transition: all 0.3s ease;
    }

    .adicional-item.selected .checkmark {
      background: #d4a574;
      border-color: #d4a574;
    }

    .adicional-item.selected .checkmark::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-weight: bold;
      font-size: 12px;
    }

    .adicional-info {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .adicional-name {
      font-weight: 500;
      color: #333;
    }

    .adicional-price {
      font-weight: 600;
      color: #d4a574;
    }

    .quantity-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .quantity-section label {
      font-weight: 600;
      color: #333;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      border: 2px solid #eee;
      border-radius: 8px;
      overflow: hidden;
    }

    .quantity-btn {
      background: #f8f9fa;
      border: none;
      padding: 0.75rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
    }

    .quantity-btn:hover:not(:disabled) {
      background: #e9ecef;
    }

    .quantity-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity-input {
      border: none;
      padding: 0.75rem;
      text-align: center;
      width: 60px;
      font-weight: 600;
    }

    .total-price-section {
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
      border: 2px solid #d4a574;
    }

    .total-price {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .total-label {
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }

    .total-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #d4a574;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    .btn-primary {
      background: #d4a574;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #c19660;
      transform: translateY(-1px);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .modal-loading,
    .modal-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #d4a574;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .modal-error i {
      font-size: 3rem;
      color: #dc3545;
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      .product-detail-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .modal-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ProductDetailModalComponent implements OnInit, OnDestroy {
  @ViewChild('modal', { static: true }) modalRef!: ElementRef;
  
  @Input() productId?: number;
  @Output() closed = new EventEmitter<void>();

  isVisible = false;
  isLoading = false;
  hasError = false;
  errorMessage = '';
  isAddingToCart = false;

  product?: Product;
  adicionales: Adicional[] = [];
  selectedAdicionales = new Map<number, Adicional>();
  quantity = 1;

  private subscriptions: Subscription[] = [];

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private notificationService: NotificationService,
    private helpersUtil: HelpersUtil
  ) {}

  ngOnInit(): void {
    this.setupKeyboardListeners();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    document.body.style.overflow = '';
  }

  async show(productId: number): Promise<void> {
    this.productId = productId;
    this.isVisible = true;
    document.body.style.overflow = 'hidden';
    
    await this.loadProductDetails();
  }

  close(): void {
    this.isVisible = false;
    document.body.style.overflow = '';
    this.resetModal();
    this.closed.emit();
  }

  onOverlayClick(event: Event): void {
    if (event.target === this.modalRef.nativeElement) {
      this.close();
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%234ecdc4'/%3E%3Ctext x='150' y='110' font-size='40' text-anchor='middle'%3E🍔%3C/text%3E%3C/svg%3E";
  }

  toggleAdicional(adicional: Adicional, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    
    if (checkbox.checked) {
      this.selectedAdicionales.set(adicional.id, adicional);
    } else {
      this.selectedAdicionales.delete(adicional.id);
    }
  }

  isAdicionalSelected(adicionalId: number): boolean {
    return this.selectedAdicionales.has(adicionalId);
  }

  increaseQuantity(): void {
    if (this.quantity < 99) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onQuantityChange(): void {
    if (this.quantity < 1) {
      this.quantity = 1;
    } else if (this.quantity > 99) {
      this.quantity = 99;
    }
  }

  calculateTotal(): number {
    if (!this.product) return 0;

    let total = this.product.precio;
    
    // Add adicionales prices
    this.selectedAdicionales.forEach(adicional => {
      total += adicional.precio;
    });

    return total * this.quantity;
  }

  async addToCart(): Promise<void> {
    if (!this.product || this.isAddingToCart) return;

    this.isAddingToCart = true;

    try {
      const adicionales = Array.from(this.selectedAdicionales.values());
      
      // Add each quantity as separate items
      for (let i = 0; i < this.quantity; i++) {
        this.cartService.addItem(this.product, adicionales);
      }

      this.notificationService.show(
        SUCCESS_MESSAGES.itemAdded,
        'success',
        3000
      );

      this.close();
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.notificationService.show(
        ERROR_MESSAGES.orderFailed,
        'danger',
        5000
      );
    } finally {
      this.isAddingToCart = false;
    }
  }

  retry(): void {
    if (this.productId) {
      this.loadProductDetails();
    }
  }

  trackByAdicionalId(index: number, adicional: Adicional): number {
    return adicional.id;
  }

  formatPrice(price: number): string {
    return this.helpersUtil.formatPrice(price);
  }

  private async loadProductDetails(): Promise<void> {
    if (!this.productId) return;

    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    try {
      const response = await this.http.get<ProductDetailResponse>(
        `/menu/productos/${this.productId}`
      ).toPromise();

      if (!response) {
        throw new Error('No response received');
      }

      this.product = response.producto || response.product;
      this.adicionales = response.adicionalesPermitidos || response.adicionales || [];

      if (!this.product) {
        throw new Error('Product not found in response');
      }

      console.log('✅ Product loaded:', this.product.nombre);
      console.log('🍯 Available adicionales:', this.adicionales.length);

    } catch (error) {
      console.error('Error loading product details:', error);
      this.hasError = true;
      this.errorMessage = 'Error al cargar los detalles del producto';
    } finally {
      this.isLoading = false;
    }
  }

  private resetModal(): void {
    this.product = undefined;
    this.adicionales = [];
    this.selectedAdicionales.clear();
    this.quantity = 1;
    this.isLoading = false;
    this.hasError = false;
    this.errorMessage = '';
    this.isAddingToCart = false;
  }

  private setupKeyboardListeners(): void {
    const handleKeydown = (event: KeyboardEvent) => {
      if (!this.isVisible) return;

      if (event.key === 'Escape') {
        this.close();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    
    this.subscriptions.push({
      unsubscribe: () => document.removeEventListener('keydown', handleKeydown)
    } as Subscription);
  }
}