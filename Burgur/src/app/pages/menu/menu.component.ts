import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService, CartItem } from '../../services/cart.service';
import { ProductService, Product } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, OnDestroy {
  // Authentication state
  isAuthenticated = false;
  
  // Mobile menu state
  isMobileMenuOpen = false;
  
  // Cart state
  isCartOpen = false;
  cartItemCount = 0;
  cartItems: CartItem[] = [];
  
  // Location modal state
  isLocationModalOpen = false;
  
  // Product detail modal state
  selectedProduct: Product | null = null;
  
  // Products and filtering
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: string | null = null;
  searchTerm = '';
  
  // Search debouncing
  private searchSubject = new Subject<string>();
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private cartService: CartService,
    private productService: ProductService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
    this.loadProducts();
    this.setupSearchDebouncing();
    this.setupScrollEffects();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeComponent(): void {
    // Subscribe to authentication state
    const authSub = this.authService.isLoggedIn().subscribe(
      (isAuth: boolean) => this.isAuthenticated = isAuth
    );
    this.subscriptions.push(authSub);

    // Subscribe to cart state
    const cartSub = this.cartService.cart$.subscribe(
      (items: CartItem[]) => {
        this.cartItems = items;
        this.cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
      }
    );
    this.subscriptions.push(cartSub);
  }

  private loadProducts(): void {
    const productsSub = this.productService.getProducts().subscribe(
      (products: Product[]) => {
        this.allProducts = products;
        this.filteredProducts = [...products];
      },
      (error: any) => {
        console.error('Error loading products:', error);
        this.notificationService.showError('Error al cargar los productos');
      }
    );
    this.subscriptions.push(productsSub);
  }

  private setupSearchDebouncing(): void {
    const searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
    this.subscriptions.push(searchSub);
  }

  private setupScrollEffects(): void {
    // Add scroll-based animations and effects
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, { threshold: 0.1 });

    // Observe elements with data-animate attribute
    setTimeout(() => {
      const animatedElements = document.querySelectorAll('[data-animate]');
      animatedElements.forEach(el => observer.observe(el));
    }, 100);
  }

  // Mobile menu methods
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    document.body.classList.toggle('mobile-menu-open', this.isMobileMenuOpen);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.classList.remove('mobile-menu-open');
  }

  // Cart methods
  openCart(): void {
    this.cartService.openCart();
  }

  closeCart(): void {
    this.cartService.closeCart();
  }

  addToCart(product: Product, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    this.cartService.addItem(product);
    this.notificationService.showSuccess(`${product.nombre} agregado al carrito`);
  }

  removeFromCart(item: CartItem): void {
    this.cartService.removeItem(item.id);
    this.notificationService.showInfo(`${item.name} eliminado del carrito`);
  }

  increaseQuantity(item: CartItem): void {
    this.cartService.increaseQuantity(item.id);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.decreaseQuantity(item.id);
    } else {
      this.removeFromCart(item);
    }
  }

  getCartTotal(): number {
    return this.cartService.getTotal();
  }

  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      this.notificationService.showWarning('Tu carrito está vacío');
      return;
    }
    
    if (!this.isAuthenticated) {
      this.notificationService.showInfo('Debes iniciar sesión para continuar');
      this.router.navigate(['/auth/login']);
      return;
    }
    
    // Navigate to checkout
    this.router.navigate(['/checkout']);
  }

  // Location modal methods
  openLocationModal(): void {
    this.isLocationModalOpen = true;
  }

  closeLocationModal(): void {
    this.isLocationModalOpen = false;
  }

  // Product detail modal methods
  openProductDetail(product: Product): void {
    this.selectedProduct = product;
  }

  closeProductDetail(): void {
    this.selectedProduct = null;
  }

  // Search and filter methods
  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  searchProducts(): void {
    this.performSearch(this.searchTerm);
  }

  private performSearch(searchTerm: string): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  filterByCategory(category: string | null): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = null;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.allProducts];

    // Apply search filter
    if (this.searchTerm && this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(searchLower) ||
        product.descripcion.toLowerCase().includes(searchLower) ||
        (product.ingredientes && product.ingredientes.some(ing => 
          ing.toLowerCase().includes(searchLower)
        ))
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(product =>
        product.categoria && product.categoria.toLowerCase() === this.selectedCategory!.toLowerCase()
      );
    }

    this.filteredProducts = filtered;
  }

  // Utility methods
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  onImageError(event: any): void {
    // Set fallback image
    event.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect width=%22300%22 height=%22200%22 fill=%22%234ecdc4%22/%3E%3Ctext x=%22150%22 y=%22110%22 font-size=%2240%22 text-anchor=%22middle%22%3E🍔%3C/text%3E%3C/svg%3E';
  }

  // Scroll event listener
  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    const header = document.getElementById('header');
    if (header) {
      if (window.pageYOffset > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }

  // Keyboard event listeners
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(): void {
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
    if (this.isCartOpen) {
      this.closeCart();
    }
    if (this.isLocationModalOpen) {
      this.closeLocationModal();
    }
    if (this.selectedProduct) {
      this.closeProductDetail();
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnterKey(event: KeyboardEvent): void {
    if (event.target && (event.target as HTMLElement).classList.contains('menu-search-input')) {
      this.searchProducts();
    }
  }
}
