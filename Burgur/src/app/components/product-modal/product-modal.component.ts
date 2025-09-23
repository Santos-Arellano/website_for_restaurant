import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { HelpersService } from '../../services/helpers.service';
import { Product } from '../../services/product.service';

interface Adicional {
  id: number;
  name: string;
  price: number;
  category: string;
  image?: string;
}

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="product-detail-modal" [class.active]="isVisible" (click)="onOverlayClick($event)">
      <div class="modal-content" (click)="$event.stopPropagation()" *ngIf="product">
        <div class="modal-header">
          <h2><i class="fas fa-hamburger"></i> {{product.nombre}}</h2>
          <button class="modal-close" type="button" (click)="closeModal()">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="product-detail-grid">
            <div class="product-image-section">
              <img [src]="product.imgURL" [alt]="product.nombre" class="product-detail-image" 
                   (error)="onImageError($event)">
              
              <div *ngIf="product.nuevo" class="product-badge nuevo">Nuevo</div>
              <div *ngIf="product.popular && !product.nuevo" class="product-badge popular">Popular</div>
            </div>
            
            <div class="product-info-section">
              <div class="product-category">{{capitalizeFirst(product.categoria)}}</div>
              
              <div *ngIf="product.descripcion" class="product-description">
                <h3>Descripción</h3>
                <p>{{product.descripcion}}</p>
              </div>
              
              <div *ngIf="product.ingredientes && product.ingredientes.length > 0" class="product-ingredients">
                <h3>Ingredientes</h3>
                <div class="ingredients-list">
                  <span *ngFor="let ing of product.ingredientes" class="ingredient-tag">{{ing}}</span>
                </div>
              </div>
              
              <div class="product-price-section">
                <div class="base-price">
                  <span class="price-label">Precio base:</span>
                  <span class="base-price-value">\${{formatPrice(product.precio)}}</span>
                </div>
                <div class="total-price">
                  <span class="total-label">Total:</span>
                  <span class="total-price-value">\${{formatPrice(getTotalPrice())}}</span>
                </div>
              </div>
            </div>
          </div>

          
          <div *ngIf="adicionales.length > 0" class="adicionales-section">
            <h3 class="adicionales-title">
              <i class="fas fa-plus-circle"></i>
              Adicionales Disponibles ({{adicionales.length}})
            </h3>
            <div class="adicionales-grid">
              <div *ngFor="let adicional of adicionales" class="adicional-item" [attr.data-id]="adicional.id">
                <div class="adicional-content">
                  <div class="adicional-info">
                    <span class="adicional-name">{{adicional.name}}</span>
                    <span class="adicional-price">+\${{formatPrice(adicional.price)}}</span>
                  </div>
                  <label class="adicional-checkbox">
                    <input type="checkbox" 
                           [checked]="isAdicionalSelected(adicional.id)"
                           (change)="toggleAdicional(adicional)">
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div *ngIf="adicionales.length === 0" class="no-adicionales">
            <i class="fas fa-info-circle"></i>
            <p>No hay adicionales disponibles para este producto</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="quantity-selector">
            <button type="button" class="qty-btn" (click)="decreaseQuantity()">
              <i class="fas fa-minus"></i>
            </button>
            <span class="quantity-display">{{quantity}}</span>
            <button type="button" class="qty-btn" (click)="increaseQuantity()">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          
          <button class="add-to-cart-btn" (click)="addToCart()" [disabled]="isAddingToCart">
            <i class="fas fa-shopping-cart"></i>
            <span *ngIf="!isAddingToCart">Agregar al Carrito</span>
            <span *ngIf="isAddingToCart">Agregando...</span>
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
      backdrop-filter: blur(5px);
    }

    .product-detail-modal.active {
      opacity: 1;
      visibility: visible;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      max-width: 900px;
      width: 90%;
      max-height: 90vh;
      overflow: hidden;
      position: relative;
      transform: scale(0.9) translateY(20px);
      transition: transform 0.3s ease;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .product-detail-modal.active .modal-content {
      transform: scale(1) translateY(0);
    }

    .modal-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
      color: white;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .modal-close {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 1.5rem;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .modal-close:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    .modal-body {
      padding: 0;
      max-height: calc(90vh - 120px);
      overflow-y: auto;
    }

    .product-detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      min-height: 400px;
    }

    .product-image-section {
      position: relative;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .product-detail-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      min-height: 400px;
    }

    .product-badge {
      position: absolute;
      top: 1rem;
      left: 1rem;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .product-badge.nuevo {
      background: linear-gradient(135deg, #28a745, #20c997);
      color: white;
      animation: pulse 2s infinite;
    }

    .product-badge.popular {
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      color: white;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .product-info-section {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .product-category {
      color: #ff6b35;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.875rem;
      letter-spacing: 1px;
    }

    .product-description h3,
    .product-ingredients h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 0.75rem 0;
    }

    .product-description p {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }

    .ingredients-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .ingredient-tag {
      background: #f8f9fa;
      color: #666;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      border: 1px solid #eee;
    }

    .product-price-section {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 12px;
      border: 2px solid #eee;
    }

    .base-price, .total-price {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .total-price {
      margin-bottom: 0;
      padding-top: 0.5rem;
      border-top: 1px solid #ddd;
    }

    .price-label, .total-label {
      font-weight: 500;
      color: #666;
    }

    .base-price-value {
      color: #333;
      font-weight: 600;
    }

    .total-price-value {
      color: #ff6b35;
      font-weight: bold;
      font-size: 1.1rem;
    }

    .adicionales-section {
      padding: 2rem;
      border-top: 1px solid #eee;
    }

    .adicionales-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 1rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .adicionales-title i {
      color: #ff6b35;
    }

    .adicionales-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    .adicional-item {
      border: 2px solid #eee;
      border-radius: 12px;
      padding: 1rem;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .adicional-item:hover {
      border-color: #ff6b35;
      background: rgba(255, 107, 53, 0.05);
    }

    .adicional-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .adicional-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .adicional-name {
      font-weight: 500;
      color: #333;
    }

    .adicional-price {
      color: #ff6b35;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .adicional-checkbox {
      position: relative;
      cursor: pointer;
    }

    .adicional-checkbox input {
      opacity: 0;
      position: absolute;
    }

    .checkmark {
      display: block;
      width: 20px;
      height: 20px;
      border: 2px solid #ddd;
      border-radius: 4px;
      transition: all 0.3s ease;
      position: relative;
    }

    .adicional-checkbox input:checked + .checkmark {
      background: #ff6b35;
      border-color: #ff6b35;
    }

    .adicional-checkbox input:checked + .checkmark::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-weight: bold;
      font-size: 12px;
    }

    .no-adicionales {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .no-adicionales i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: #ddd;
    }

    .modal-footer {
      padding: 1.5rem 2rem;
      border-top: 1px solid #eee;
      display: flex;
      gap: 1rem;
      align-items: center;
      background: #f8f9fa;
    }

    .quantity-selector {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: white;
      border-radius: 8px;
      padding: 0.5rem;
      border: 1px solid #ddd;
    }

    .qty-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: #f8f9fa;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #666;
    }

    .qty-btn:hover {
      background: #ff6b35;
      color: white;
    }

    .quantity-display {
      min-width: 40px;
      text-align: center;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .add-to-cart-btn {
      flex: 1;
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      color: white;
      border: none;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .add-to-cart-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
    }

    .add-to-cart-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    @media (max-width: 768px) {
      .modal-content {
        width: 95%;
        max-height: 95vh;
      }

      .product-detail-grid {
        grid-template-columns: 1fr;
      }

      .product-detail-image {
        min-height: 250px;
      }

      .product-info-section,
      .adicionales-section {
        padding: 1.5rem;
      }

      .modal-footer {
        flex-direction: column;
        gap: 1rem;
      }

      .quantity-selector {
        align-self: center;
      }

      .add-to-cart-btn {
        width: 100%;
      }
    }
  `]
})
export class ProductModalComponent implements OnInit, OnDestroy {
  @Input() product: Product | null = null;
  @Input() adicionales: Adicional[] = [];
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();

  selectedAdicionales: Adicional[] = [];
  quantity = 1;
  isAddingToCart = false;

  constructor(
    private cartService: CartService,
    private notificationService: NotificationService,
    public helpersService: HelpersService
  ) {}

  ngOnInit() {
    // Listen for escape key
    document.addEventListener('keydown', this.onEscapeKey.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.onEscapeKey.bind(this));
  }

  onEscapeKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isVisible) {
      this.closeModal();
    }
  }

  closeModal() {
    this.isVisible = false;
    this.resetModal();
    this.close.emit();
  }

  resetModal() {
    this.selectedAdicionales = [];
    this.quantity = 1;
    this.isAddingToCart = false;
  }

  getAdicionalesCategories(): string[] {
    const categories = [...new Set(this.adicionales.map(a => a.category))];
    return categories.sort();
  }

  getAdicionalesByCategory(category: string): Adicional[] {
    return this.adicionales.filter(a => a.category === category);
  }

  isAdicionalSelected(adicionalId: number): boolean {
    return this.selectedAdicionales.some(a => a.id === adicionalId);
  }

  toggleAdicional(adicional: Adicional) {
    const index = this.selectedAdicionales.findIndex(a => a.id === adicional.id);
    if (index > -1) {
      this.selectedAdicionales.splice(index, 1);
    } else {
      this.selectedAdicionales.push(adicional);
    }
  }

  getTotalPrice(): number {
    if (!this.product) return 0;
    
    const basePrice = this.product.precio;
    const adicionalesPrice = this.selectedAdicionales.reduce((total, adicional) => total + adicional.price, 0);
    
    return basePrice + adicionalesPrice;
  }

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  async addToCart() {
    if (!this.product || this.isAddingToCart) return;

    this.isAddingToCart = true;

    try {
      const cartItem = {
        id: this.product.id,
        nombre: this.product.nombre,
        precio: this.getTotalPrice(),
        cantidad: this.quantity,
        imgURL: this.product.imgURL,
        adicionales: this.selectedAdicionales.map(a => ({
          id: a.id,
          name: a.name,
          price: a.price
        }))
      };

      await this.cartService.addItem(cartItem);
      this.notificationService.showSuccess(`${this.product.nombre} agregado al carrito`);
      this.closeModal();
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.notificationService.showError('Error al agregar al carrito');
    } finally {
      this.isAddingToCart = false;
    }
  }

  formatPrice(price: number): string {
    return this.helpersService.formatPrice(price);
  }

  capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  onImageError(event: any) {
    event.target.src = 'assets/images/placeholder-food.jpg';
  }

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}