// ==========================================
// BURGER CLUB - ANGULAR CART SERVICE
// ==========================================

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HelpersUtil } from '../../shared/utils/helpers.util';
import { CART_CONFIG, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../shared/constants/app.constants';

export interface CartItem {
  id: string;
  productId: number;
  nombre: string;
  precio: number;
  imgURL: string;
  quantity: number;
  adicionales?: Adicional[];
  totalPrice: number;
}

export interface Adicional {
  id: number;
  nombre: string;
  precio: number;
}

export interface Product {
  id: number;
  nombre: string;
  precio: number;
  imgURL: string;
  descripcion?: string;
  categoria?: string;
  nuevo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  private totalSubject = new BehaviorSubject<number>(0);
  private countSubject = new BehaviorSubject<number>(0);
  private isOpenSubject = new BehaviorSubject<boolean>(false);

  public items$ = this.itemsSubject.asObservable();
  public total$ = this.totalSubject.asObservable();
  public count$ = this.countSubject.asObservable();
  public isOpen$ = this.isOpenSubject.asObservable();

  private storageKey = CART_CONFIG.storageKey;

  constructor(private helpersUtil: HelpersUtil) {
    this.loadFromStorage();
    console.log('🛒 Cart Service initialized');
  }

  // ========== PUBLIC METHODS ==========
  addItem(product: Product, adicionales: Adicional[] = []): void {
    const items = this.itemsSubject.value;
    const itemId = this.generateItemId(product.id, adicionales);
    
    const existingItemIndex = items.findIndex(item => item.id === itemId);
    
    if (existingItemIndex > -1) {
      // Update existing item quantity
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].totalPrice = this.calculateItemPrice(
        product.precio, 
        adicionales, 
        updatedItems[existingItemIndex].quantity
      );
      this.updateItems(updatedItems);
    } else {
      // Add new item
      const newItem: CartItem = {
        id: itemId,
        productId: product.id,
        nombre: product.nombre,
        precio: product.precio,
        imgURL: product.imgURL,
        quantity: 1,
        adicionales: adicionales,
        totalPrice: this.calculateItemPrice(product.precio, adicionales, 1)
      };
      
      this.updateItems([...items, newItem]);
    }

    this.showNotification(`${product.nombre} ${SUCCESS_MESSAGES.itemAdded}`, 'success');
  }

  removeItem(itemId: string): void {
    const items = this.itemsSubject.value;
    const itemToRemove = items.find(item => item.id === itemId);
    
    if (itemToRemove) {
      const updatedItems = items.filter(item => item.id !== itemId);
      this.updateItems(updatedItems);
      this.showNotification(`${itemToRemove.nombre} ${SUCCESS_MESSAGES.itemRemoved}`, 'info');
    }
  }

  updateQuantity(itemId: string, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeItem(itemId);
      return;
    }

    const items = this.itemsSubject.value;
    const itemIndex = items.findIndex(item => item.id === itemId);
    
    if (itemIndex > -1) {
      const updatedItems = [...items];
      updatedItems[itemIndex].quantity = newQuantity;
      updatedItems[itemIndex].totalPrice = this.calculateItemPrice(
        updatedItems[itemIndex].precio,
        updatedItems[itemIndex].adicionales || [],
        newQuantity
      );
      this.updateItems(updatedItems);
    }
  }

  clearCart(): void {
    this.updateItems([]);
    this.showNotification(SUCCESS_MESSAGES.cartCleared, 'info');
  }

  openCart(): void {
    this.isOpenSubject.next(true);
  }

  closeCart(): void {
    this.isOpenSubject.next(false);
  }

  toggleCart(): void {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  // ========== GETTERS ==========
  getItems(): CartItem[] {
    return this.itemsSubject.value;
  }

  getTotal(): number {
    return this.totalSubject.value;
  }

  getItemCount(): number {
    return this.countSubject.value;
  }

  isEmpty(): boolean {
    return this.itemsSubject.value.length === 0;
  }

  // ========== PRIVATE METHODS ==========
  private updateItems(items: CartItem[]): void {
    this.itemsSubject.next(items);
    this.calculateAndUpdateTotals(items);
    this.saveToStorage(items);
  }

  private calculateAndUpdateTotals(items: CartItem[]): void {
    const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    
    this.totalSubject.next(total);
    this.countSubject.next(count);
  }

  private generateItemId(productId: number, adicionales: Adicional[]): string {
    const adicionalesIds = adicionales.map(a => a.id).sort().join('-');
    return `${productId}-${adicionalesIds}`;
  }

  private calculateItemPrice(basePrice: number, adicionales: Adicional[], quantity: number): number {
    const adicionalesPrice = adicionales.reduce((sum, adicional) => sum + adicional.precio, 0);
    return (basePrice + adicionalesPrice) * quantity;
  }

  private saveToStorage(items: CartItem[]): void {
    this.helpersUtil.saveToLocalStorage(this.storageKey, items);
  }

  private loadFromStorage(): void {
    const savedItems = this.helpersUtil.loadFromLocalStorage<CartItem[]>(this.storageKey, []);
    if (savedItems && Array.isArray(savedItems)) {
      this.updateItems(savedItems);
    }
  }

  private showNotification(message: string, type: 'success' | 'info' | 'warning' | 'danger'): void {
    // This will be handled by a notification service
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Emit custom event for components to listen to
    const event = new CustomEvent('cart-notification', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  }

  // ========== CHECKOUT METHODS ==========
  async processCheckout(orderData: any): Promise<boolean> {
    try {
      // Here you would typically make an HTTP request to your backend
      console.log('Processing checkout:', orderData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear cart after successful order
      this.clearCart();
      this.showNotification(SUCCESS_MESSAGES.orderPlaced, 'success');
      
      return true;
    } catch (error) {
      console.error('Checkout error:', error);
      this.showNotification(ERROR_MESSAGES.orderFailed, 'danger');
      return false;
    }
  }

  // ========== UTILITY METHODS ==========
  formatPrice(price: number): string {
    return this.helpersUtil.formatPrice(price);
  }

  // Method to check if two sets of adicionales are the same
  private compareAdicionales(adicionales1: Adicional[], adicionales2: Adicional[]): boolean {
    if (adicionales1.length !== adicionales2.length) return false;
    
    const ids1 = adicionales1.map(a => a.id).sort();
    const ids2 = adicionales2.map(a => a.id).sort();
    
    return ids1.every((id, index) => id === ids2[index]);
  }
}