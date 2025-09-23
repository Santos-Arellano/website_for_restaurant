import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  adicionales?: any[];
  precioBase?: number;
  precioTotal?: number;
  categoria?: string;
}

export interface Adicional {
  id?: string;
  nombre: string;
  precio: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private totalSubject = new BehaviorSubject<number>(0);
  private countSubject = new BehaviorSubject<number>(0);
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  
  public cart$ = this.cartSubject.asObservable();
  public total$ = this.totalSubject.asObservable();
  public count$ = this.countSubject.asObservable();
  public isOpen$ = this.isOpenSubject.asObservable();
  
  private storageKey = 'burger_club_cart';
  private cartButtonsInitialized = false;

  constructor() {
    this.loadFromStorage();
    this.initializeCartButtonsDelegation();
  }

  addItem(product: any): void {
    // Normalizar el objeto producto para manejar diferentes estructuras
    const normalizedProduct = {
      id: product.id || Date.now().toString(),
      name: product.name || product.nombre || 'Producto sin nombre',
      price: product.price || product.precio || 0,
      image: product.image || product.imagen || product.imgURL || 'assets/images/default-burger.png',
      categoria: product.categoria || 'sin categoria',
      adicionales: product.adicionales || []
    };

    // Calcular precio total incluyendo adicionales
    const precioTotal = this.calculateItemPrice(normalizedProduct.price, normalizedProduct.adicionales);

    // Buscar item existente con el mismo nombre Y adicionales
    const existingItem = this.items.find(item => 
      item.name === normalizedProduct.name && 
      this.compareAdicionales(item.adicionales || [], normalizedProduct.adicionales)
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      const newItem: CartItem = {
        id: Date.now().toString(),
        name: normalizedProduct.name,
        price: normalizedProduct.price,
        quantity: 1,
        image: normalizedProduct.image,
        adicionales: normalizedProduct.adicionales,
        precioBase: normalizedProduct.price,
        precioTotal: precioTotal,
        categoria: normalizedProduct.categoria
      };
      this.items.push(newItem);
    }

    this.updateSubjects();
    this.saveToStorage();
    this.showAddAnimation();
    
    console.log(`➕ Added to cart: ${normalizedProduct.name}`);
    
    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('itemAdded', {
      detail: { product: normalizedProduct, cart: this.items }
    }));
  }

  // Método para comparar adicionales
  private compareAdicionales(adicionales1: any[], adicionales2: any[]): boolean {
    if (adicionales1.length !== adicionales2.length) return false;
    
    const sorted1 = adicionales1.map(a => a.id || a.nombre).sort();
    const sorted2 = adicionales2.map(a => a.id || a.nombre).sort();
    
    return sorted1.every((item, index) => item === sorted2[index]);
  }

  // Método para calcular precio con adicionales
  private calculateItemPrice(basePrice: number, adicionales: any[]): number {
    let total = basePrice;
    if (adicionales && adicionales.length > 0) {
      adicionales.forEach(adicional => {
        total += adicional.precio || 0;
      });
    }
    return total;
  }

  // Método público para que otros módulos agreguen productos
  addProductToCart(product: any, sourceButton?: HTMLElement): void {
    this.addItem(product);
    
    if (sourceButton) {
      this.createAddToCartAnimation(sourceButton, product);
    }
  }

  // Inicializar delegación de eventos para botones del carrito
  private initializeCartButtonsDelegation(): void {
    if (this.cartButtonsInitialized) return;

    // Usar delegación de eventos en el documento
    document.addEventListener('click', (e) => {
      const addButton = (e.target as HTMLElement).closest('.add-to-cart-btn');
      if (!addButton) return;

      e.preventDefault();
      e.stopPropagation();

      const product = {
        id: addButton.getAttribute('data-id') || Date.now().toString(),
        name: addButton.getAttribute('data-name') || 'Producto',
        price: parseFloat(addButton.getAttribute('data-price') || '0'),
        image: addButton.getAttribute('data-image') || 'assets/images/default-burger.png',
        adicionales: [] // Los botones del menú no tienen adicionales
      };

      console.log('🛒 Adding product from menu button:', product);
      
      this.addItem(product);
      
      // Visual feedback
      this.createAddToCartAnimation(addButton as HTMLElement, product);
    });

    this.cartButtonsInitialized = true;
    console.log('🛒 Cart buttons delegation initialized');
  }

  removeItem(itemId: string): void {
    this.items = this.items.filter(item => item.id !== itemId);
    this.updateSubjects();
    this.saveToStorage();
  }

  updateQuantity(itemId: string, newQuantity: number): void {
    const item = this.items.find(item => item.id === itemId);
    if (item) {
      if (newQuantity <= 0) {
        this.removeItem(itemId);
      } else {
        item.quantity = newQuantity;
        this.updateSubjects();
        this.saveToStorage();
      }
    }
  }

  increaseQuantity(itemId: string): void {
    const item = this.items.find(item => item.id === itemId);
    if (item) {
      item.quantity++;
      this.updateSubjects();
      this.saveToStorage();
    }
  }

  decreaseQuantity(itemId: string): void {
    const item = this.items.find(item => item.id === itemId);
    if (item) {
      if (item.quantity > 1) {
        item.quantity--;
        this.updateSubjects();
        this.saveToStorage();
      } else {
        this.removeItem(itemId);
      }
    }
  }

  clearCart(): void {
    this.items = [];
    this.updateSubjects();
    this.saveToStorage();
  }

  openCart(): void {
    this.isOpenSubject.next(true);
    document.body.classList.add('cart-open');
  }

  closeCart(): void {
    this.isOpenSubject.next(false);
    document.body.classList.remove('cart-open');
  }

  private generateItemId(product: any): string {
    let id = `${product.name}_${product.price}`;
    if (product.adicionales && product.adicionales.length > 0) {
      const adicionalesStr = product.adicionales
        .map((a: any) => `${a.name}_${a.price}`)
        .sort()
        .join('_');
      id += `_${adicionalesStr}`;
    }
    return id;
  }

  private calculateTotal(): number {
    return this.items.reduce((total, item) => {
      let itemPrice = item.price;
      if (item.adicionales) {
        itemPrice += item.adicionales.reduce((sum, adicional) => sum + adicional.price, 0);
      }
      return total + (itemPrice * item.quantity);
    }, 0);
  }

  private calculateCount(): number {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  private updateSubjects(): void {
    this.cartSubject.next([...this.items]);
    this.totalSubject.next(this.calculateTotal());
    this.countSubject.next(this.calculateCount());
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.items = JSON.parse(stored);
        this.updateSubjects();
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      this.items = [];
    }
  }

  private showAddAnimation(): void {
    // Crear animación de agregado al carrito
    const cartIcon = document.querySelector('.cart-count');
    if (cartIcon) {
      cartIcon.classList.add('animate-pulse');
      setTimeout(() => {
        cartIcon.classList.remove('animate-pulse');
      }, 600);
    }
  }

  // Crear animación de producto flotando hacia el carrito
  private createAddToCartAnimation(button: HTMLElement, product: any): void {
    const rect = button.getBoundingClientRect();
    const cartButton = document.querySelector('.cart-link');
    
    if (!cartButton) return;
    
    const cartRect = cartButton.getBoundingClientRect();
    
    // Crear elemento flotante
    const floatingIcon = document.createElement('div');
    floatingIcon.className = 'floating-icon';
    floatingIcon.innerHTML = '🍔';
    floatingIcon.style.position = 'fixed';
    floatingIcon.style.left = rect.left + 'px';
    floatingIcon.style.top = rect.top + 'px';
    floatingIcon.style.zIndex = '9999';
    floatingIcon.style.pointerEvents = 'none';
    floatingIcon.style.fontSize = '1.5rem';
    floatingIcon.style.transition = 'all 1s ease-out';
    
    document.body.appendChild(floatingIcon);
    
    // Animar hacia el carrito
    setTimeout(() => {
      floatingIcon.style.left = cartRect.left + 'px';
      floatingIcon.style.top = cartRect.top + 'px';
      floatingIcon.style.opacity = '0';
      floatingIcon.style.transform = 'scale(0.5)';
    }, 50);
    
    // Remover elemento después de la animación
    setTimeout(() => {
      if (floatingIcon.parentNode) {
        floatingIcon.parentNode.removeChild(floatingIcon);
      }
    }, 1100);
    
    // Animar el contador del carrito
    this.showAddAnimation();
  }

  // Public getters for backward compatibility
  getCartItems(): Observable<CartItem[]> {
    return this.cart$;
  }

  getCartItemCount(): number {
    return this.calculateCount();
  }

  getCartTotal(): number {
    return this.calculateTotal();
  }

  getItems(): CartItem[] {
    return [...this.items];
  }

  getTotal(): number {
    return this.calculateTotal();
  }

  getItemCount(): number {
    return this.calculateCount();
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}
