import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Producto } from '../../../Model/Producto/producto';

export interface Adicional {
  id: number;
  nombre: string;
  precio: number;
}

@Component({
  selector: 'app-product-detail-modal',
  templateUrl: './product-detail-modal.component.html',
  styleUrls: ['./product-detail-modal.component.css']
})
export class ProductDetailModalComponent {
  @Input() product: Producto | null = null;
  @Input() adicionales: Adicional[] = [];
  @Input() isVisible: boolean = false;
  
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() productAdded = new EventEmitter<any>();

  quantity: number = 1;
  selectedAdicionales: { [key: number]: boolean } = {};

  closeModal(): void {
    this.closeModalEvent.emit();
    this.resetModal();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  toggleAdicional(adicionalId: number): void {
    this.selectedAdicionales[adicionalId] = !this.selectedAdicionales[adicionalId];
  }

  getSelectedAdicionales(): Adicional[] {
    return this.adicionales.filter(adicional => this.selectedAdicionales[adicional.id]);
  }

  getTotalPrice(): number {
    if (!this.product) return 0;
    
    const basePrice = this.product.precio * this.quantity;
    const adicionalesPrice = this.getSelectedAdicionales()
      .reduce((total, adicional) => total + (adicional.precio * this.quantity), 0);
    
    return basePrice + adicionalesPrice;
  }

  addToCart(): void {
    if (!this.product) return;

    const cartItem = {
      product: this.product,
      quantity: this.quantity,
      adicionales: this.getSelectedAdicionales(),
      totalPrice: this.getTotalPrice()
    };

    this.productAdded.emit(cartItem);
    this.closeModal();
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
  }

  getSimplifiedIngredients(ingredients: string[]): string {
    return ingredients ? ingredients.slice(0, 3).join(', ') + (ingredients.length > 3 ? '...' : '') : '';
  }

  private resetModal(): void {
    this.quantity = 1;
    this.selectedAdicionales = {};
  }
}