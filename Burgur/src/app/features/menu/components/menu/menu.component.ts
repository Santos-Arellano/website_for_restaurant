import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';
import { ProductModalComponent } from '../../../../components/product-modal/product-modal.component';

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imgURL: string;
  categoria: string;
  disponible: boolean;
  adicionales?: number[];
}

interface User {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductModalComponent],
  template: `
    <div class="menu-container">
      <!-- Background Decorations -->
      <div class="background-decorations">
        <div class="deco-item deco-1">🍔</div>
        <div class="deco-item deco-2">🍟</div>
        <div class="deco-item deco-3">🥤</div>
        <div class="deco-item deco-4">🍰</div>
        <div class="deco-item deco-5">✨</div>
        <div class="deco-item deco-6">💫</div>
      </div>

      <div class="container">
        <!-- Menu Header -->
        <div class="menu-header">
          <h1 class="menu-title">NUESTRO MENÚ</h1>
          <p class="menu-subtitle">Descubre nuestros sabores únicos</p>
        </div>

        <!-- Search Bar -->
        <div class="menu-search-container">
          <form class="menu-search-form" (ngSubmit)="onSearch()">
            <div class="search-input-wrapper">
              <input 
                #searchInput
                type="text" 
                class="menu-search-input" 
                placeholder="Buscar productos..." 
                [(ngModel)]="searchQuery"
                name="search"
                (input)="onSearchInput()"
              />
              <button 
                type="button" 
                class="search-clear" 
                *ngIf="searchQuery"
                (click)="clearSearch()"
                aria-label="Limpiar búsqueda"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            <button type="submit" class="search-btn" aria-label="Buscar">
              <i class="fas fa-search"></i>
            </button>
          </form>
        </div>

        <!-- Category Filter -->
        <div class="category-filter">
          <button 
            *ngFor="let category of categories" 
            class="category-btn"
            [class.active]="selectedCategory === category"
            (click)="filterByCategory(category)"
          >
            {{ category }}
          </button>
        </div>

        <!-- Products Grid -->
        <div class="menu-grid" *ngIf="filteredProducts.length > 0">
          <div 
            *ngFor="let product of filteredProducts" 
            class="menu-card"
            [attr.data-id]="product.id"
            (click)="showProductDetail(product)"
          >
            <div class="card-image">
              <img [src]="product.imgURL" [alt]="product.nombre" />
              <div class="card-overlay">
                <div class="overlay-content">
                  <i class="fas fa-eye"></i>
                  <span>Ver Detalles</span>
                </div>
              </div>
            </div>
            <div class="card-content">
              <h3 class="product-name">{{ product.nombre }}</h3>
              <p class="product-description">{{ product.descripcion }}</p>
              <div class="product-footer">
                <span class="product-price">\${{ product.precio | number:'1.2-2' }}</span>
                <button 
                  class="add-to-cart-btn"
                  [disabled]="!product.disponible"
                  (click)="addToCart(product, $event)"
                >
                  <i class="fas fa-shopping-cart"></i>
                  {{ product.disponible ? 'Agregar' : 'No disponible' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div *ngIf="filteredProducts.length === 0" class="no-results">
          <i class="fas fa-search"></i>
          <h3>No se encontraron productos</h3>
          <p>Intenta con otros términos de búsqueda o explora nuestras categorías.</p>
          <button class="btn btn-primary" (click)="clearSearch()">
            Ver todos los productos
          </button>
        </div>

        <!-- Auth CTA (only shown when not authenticated) -->
        <div *ngIf="!isAuthenticated" class="auth-cta" id="authCta">
          <div class="auth-cta-content">
            <h2>¡Únete para obtener beneficios exclusivos!</h2>
            <p>Regístrate y obtén descuentos especiales, puntos de recompensa y ofertas personalizadas.</p>
            <div class="cta-buttons">
              <button class="btn btn-primary" (click)="navigateToRegister()">
                Registrarse Gratis
              </button>
              <button class="btn btn-outline" (click)="navigateToLogin()">
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Detail Modal -->
      <app-product-modal 
        *ngIf="selectedProduct" 
        [product]="selectedProduct"
        [isVisible]="true"
        (close)="closeProductDetail()"
      ></app-product-modal>

      <!-- Notification -->
      <div 
        *ngIf="notification" 
        class="quick-notification"
        [class]="notification.type"
      >
        <div class="notification-content">
          <i class="fas" [class.fa-check-circle]="notification.type === 'success'" 
                        [class.fa-exclamation-circle]="notification.type === 'error'"></i>
          <span>{{ notification.message }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .menu-container {
      min-height: 100vh;
      background: #1a1a1a;
      color: white;
      position: relative;
      overflow-x: hidden;
    }

    .background-decorations {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    .deco-item {
      position: absolute;
      font-size: 2rem;
      opacity: 0.1;
      animation: float 6s ease-in-out infinite;
    }

    .deco-1 { top: 10%; left: 10%; animation-delay: 0s; }
    .deco-2 { top: 20%; right: 15%; animation-delay: 1s; }
    .deco-3 { top: 60%; left: 5%; animation-delay: 2s; }
    .deco-4 { bottom: 20%; right: 10%; animation-delay: 3s; }
    .deco-5 { top: 40%; left: 80%; animation-delay: 4s; }
    .deco-6 { bottom: 40%; left: 20%; animation-delay: 5s; }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      position: relative;
      z-index: 2;
    }

    .menu-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .menu-title {
      font-size: 3rem;
      font-weight: bold;
      color: #fbb5b5;
      margin-bottom: 1rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }

    .menu-subtitle {
      font-size: 1.2rem;
      opacity: 0.8;
    }

    .menu-search-container {
      max-width: 600px;
      margin: 0 auto 2rem;
    }

    .menu-search-form {
      display: flex;
      gap: 0.5rem;
    }

    .search-input-wrapper {
      flex: 1;
      position: relative;
    }

    .menu-search-input {
      width: 100%;
      padding: 12px 40px 12px 16px;
      border: 2px solid #fbb5b5;
      border-radius: 25px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 1rem;
    }

    .menu-search-input::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    .search-clear {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #fbb5b5;
      cursor: pointer;
      font-size: 1rem;
    }

    .search-btn {
      padding: 12px 20px;
      background: #fbb5b5;
      border: none;
      border-radius: 25px;
      color: white;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .search-btn:hover {
      background: #f8a5a5;
    }

    .category-filter {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 3rem;
      flex-wrap: wrap;
    }

    .category-btn {
      padding: 8px 20px;
      background: transparent;
      border: 2px solid #fbb5b5;
      border-radius: 20px;
      color: #fbb5b5;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .category-btn:hover,
    .category-btn.active {
      background: #fbb5b5;
      color: white;
    }

    .menu-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }

    .menu-card {
      background: #2d2d2d;
      border-radius: 15px;
      overflow: hidden;
      transition: transform 0.3s ease;
      cursor: pointer;
      position: relative;
    }

    .menu-card:hover {
      transform: translateY(-5px);
    }

    .card-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .card-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .menu-card:hover .card-overlay {
      opacity: 1;
    }

    .overlay-content {
      text-align: center;
      color: white;
    }

    .overlay-content i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      display: block;
    }

    .card-content {
      padding: 1.5rem;
    }

    .product-name {
      font-size: 1.3rem;
      margin-bottom: 0.5rem;
      color: #fbb5b5;
    }

    .product-description {
      opacity: 0.8;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .product-price {
      font-size: 1.2rem;
      font-weight: bold;
      color: #4caf50;
    }

    .add-to-cart-btn {
      padding: 8px 16px;
      background: #fbb5b5;
      border: none;
      border-radius: 20px;
      color: white;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.3s ease;
    }

    .add-to-cart-btn:hover:not(:disabled) {
      background: #f8a5a5;
    }

    .add-to-cart-btn:disabled {
      background: #666;
      cursor: not-allowed;
    }

    .no-results {
      text-align: center;
      padding: 4rem 2rem;
    }

    .no-results i {
      font-size: 4rem;
      color: #fbb5b5;
      margin-bottom: 1rem;
    }

    .no-results h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .auth-cta {
      margin-top: 4rem;
      padding: 3rem;
      background: linear-gradient(135deg, #fbb5b5 0%, #f8a5a5 100%);
      border-radius: 20px;
      text-align: center;
    }

    .auth-cta-content h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: white;
    }

    .auth-cta-content p {
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .cta-buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .modal-overlay {
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
    }

    .product-modal {
      background: #2d2d2d;
      border-radius: 20px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
    }

    .modal-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(0, 0, 0, 0.5);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      color: white;
      cursor: pointer;
      z-index: 1001;
    }

    .modal-content {
      display: flex;
      flex-direction: column;
    }

    .modal-image {
      height: 300px;
      overflow: hidden;
    }

    .modal-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .modal-info {
      padding: 2rem;
    }

    .modal-info h2 {
      font-size: 2rem;
      color: #fbb5b5;
      margin-bottom: 1rem;
    }

    .modal-description {
      opacity: 0.8;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .modal-price {
      font-size: 2rem;
      font-weight: bold;
      color: #4caf50;
      margin-bottom: 2rem;
    }

    .modal-actions {
      text-align: center;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 25px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
    }

    .btn-primary {
      background: #fbb5b5;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #f8a5a5;
      transform: translateY(-2px);
    }

    .btn-outline {
      background: transparent;
      color: #fbb5b5;
      border: 2px solid #fbb5b5;
    }

    .btn-outline:hover {
      background: #fbb5b5;
      color: white;
    }

    .btn-large {
      padding: 16px 32px;
      font-size: 1.1rem;
    }

    .quick-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2d2d2d;
      border: 2px solid;
      border-radius: 8px;
      padding: 12px 16px;
      z-index: 1500;
      min-width: 250px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .quick-notification.success {
      border-color: #4caf50;
      color: #4caf50;
    }

    .quick-notification.error {
      border-color: #f44336;
      color: #f44336;
    }

    .notification-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .menu-title {
        font-size: 2rem;
      }

      .menu-grid {
        grid-template-columns: 1fr;
      }

      .category-filter {
        justify-content: flex-start;
        overflow-x: auto;
        padding-bottom: 0.5rem;
      }

      .category-btn {
        white-space: nowrap;
      }

      .cta-buttons {
        flex-direction: column;
        align-items: center;
      }

      .btn {
        width: 200px;
      }

      .modal-content {
        flex-direction: column;
      }

      .modal-image {
        height: 200px;
      }
    }
  `]
})
export class MenuComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;

  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Component state
  isAuthenticated = false;
  currentUser: User | null = null;
  searchQuery = '';
  selectedCategory = 'Todos';
  selectedProduct: Product | null = null;
  notification: { message: string; type: 'success' | 'error' } | null = null;

  // Mock data - replace with actual service calls
  categories = ['Todos', 'Hamburguesas', 'Papas', 'Bebidas', 'Postres'];
  
  products: Product[] = [
    {
      id: 1,
      nombre: 'Burger Clásica',
      descripcion: 'Hamburguesa con carne, lechuga, tomate y queso',
      precio: 8.99,
      imgURL: '/assets/images/menu/BURGER.png',
      categoria: 'Hamburguesas',
      disponible: true,
      adicionales: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    },
    {
      id: 2,
      nombre: 'Burger BBQ',
      descripcion: 'Hamburguesa con salsa BBQ, cebolla caramelizada y bacon',
      precio: 10.99,
      imgURL: '/assets/images/menu/BBQ-especial.png',
      categoria: 'Hamburguesas',
      disponible: true,
      adicionales: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    },
    {
      id: 3,
      nombre: 'Papas Fritas',
      descripcion: 'Papas fritas crujientes con sal marina',
      precio: 4.99,
      imgURL: '/assets/images/menu/Fries.png',
      categoria: 'Papas',
      disponible: true,
      adicionales: [9, 10, 11, 12]
    },
    {
      id: 4,
      nombre: 'Coca Cola',
      descripcion: 'Bebida refrescante 500ml',
      precio: 2.99,
      imgURL: '/assets/images/menu/Coke.png',
      categoria: 'Bebidas',
      disponible: true,
      adicionales: []
    }
  ];

  filteredProducts: Product[] = [];

  ngOnInit(): void {
    this.checkAuthenticationStatus();
    this.setupSearch();
    this.filteredProducts = this.products;
    this.checkForAutoOpenModal();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkAuthenticationStatus(): void {
    this.authService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.isAuthenticated = !!user;
          this.currentUser = user;
        },
        error: (error) => {
          console.log('Authentication check failed:', error);
          this.isAuthenticated = false;
          this.currentUser = null;
        }
      });
  }

  private setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.performSearch();
      });
  }

  private checkForAutoOpenModal(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldOpenModal = urlParams.get('openModal') === 'true';
    if (shouldOpenModal && this.products.length > 0) {
      setTimeout(() => {
        this.showProductDetail(this.products[0]);
        // Clean URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('openModal');
        window.history.replaceState({}, '', newUrl.toString());
      }, 300);
    }
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onSearch(): void {
    this.performSearch();
  }

  private performSearch(): void {
    const query = this.searchQuery.trim().toLowerCase();
    
    let filtered = this.products;

    // Apply category filter
    if (this.selectedCategory !== 'Todos') {
      filtered = filtered.filter(product => product.categoria === this.selectedCategory);
    }

    // Apply search filter
    if (query.length >= 2) {
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(query) ||
        product.descripcion.toLowerCase().includes(query)
      );
    }

    this.filteredProducts = filtered;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.selectedCategory = 'Todos';
    this.filteredProducts = this.products;
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.performSearch();
  }

  showProductDetail(product: Product): void {
    console.log('Opening product detail for:', product.nombre);
    console.log('Product data:', product);
    this.selectedProduct = product;
    console.log('Selected product set:', this.selectedProduct);
    console.log('Modal should be visible now');
  }

  closeProductDetail(): void {
    this.selectedProduct = null;
  }

  addToCart(product: Product, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (!product.disponible) {
      this.showNotification('Producto no disponible', 'error');
      return;
    }

    // Here you would typically call a cart service
    this.showNotification(`${product.nombre} agregado al carrito`, 'success');
    
    // Close modal if open
    if (this.selectedProduct) {
      this.closeProductDetail();
    }
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notification = { message, type };
    
    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }
}