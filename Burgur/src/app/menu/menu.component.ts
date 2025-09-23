import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { ProductModalComponent } from '../components/product-modal/product-modal.component';
import { CartService } from '../services/cart.service';
import { AuthService, User } from '../services/auth.service';
import { Subscription, Observable } from 'rxjs';

declare let $: any;

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imgURL: string;
  categoria: string;
  ingredientes?: string[];
  nuevo?: boolean;
  popular?: boolean;
  adicionales?: number[];
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent, ProductModalComponent],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscription: Subscription = new Subscription();

  // Mobile menu state
  isMobileMenuOpen = false;

  // Authentication properties
  currentUser$: Observable<User | null>;
  isLoggedIn$: Observable<boolean>;
  isAuthenticated = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.getCurrentUser();
    this.isLoggedIn$ = this.authService.isLoggedIn();
  }

  products: Product[] = [
    {
      id: 1,
      nombre: 'Burger Clásica',
      descripcion: 'Hamburguesa con carne jugosa, lechuga fresca, tomate y queso cheddar',
      precio: 15000,
      imgURL: 'assets/images/menu/BURGER.png',
      categoria: 'hamburguesa',
      ingredientes: ['Carne de res', 'Lechuga', 'Tomate', 'Queso cheddar', 'Pan brioche'],
      popular: true,
      adicionales: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    },
    {
      id: 2,
      nombre: 'Burger BBQ',
      descripcion: 'Hamburguesa con salsa BBQ, cebolla caramelizada y tocino crujiente',
      precio: 18000,
      imgURL: 'assets/images/menu/BBQ-especial.png',
      categoria: 'hamburguesa',
      ingredientes: ['Carne de res', 'Salsa BBQ', 'Cebolla caramelizada', 'Tocino', 'Pan brioche'],
      nuevo: true,
      adicionales: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    },
    {
      id: 3,
      nombre: 'Papas Fritas',
      descripcion: 'Papas fritas crujientes con sal marina',
      precio: 8000,
      imgURL: 'assets/images/menu/Fries.png',
      categoria: 'acompañamiento',
      ingredientes: ['Papas', 'Sal marina', 'Aceite vegetal'],
      adicionales: [9, 10, 11, 12]
    },
    {
      id: 4,
      nombre: 'Perro Especial',
      descripcion: 'Perro caliente con salchicha premium, salsas especiales y vegetales',
      precio: 12000,
      imgURL: 'assets/images/menu/hot-dog.png',
      categoria: 'perro caliente',
      ingredientes: ['Salchicha premium', 'Pan perro', 'Salsas especiales', 'Vegetales frescos']
    },
    {
      id: 5,
      nombre: 'Coca Cola',
      descripcion: 'Bebida refrescante 350ml',
      precio: 4000,
      imgURL: 'assets/images/menu/Coke.png',
      categoria: 'bebida',
      adicionales: []
    },
    {
      id: 6,
      nombre: 'Brownie',
      descripcion: 'Delicioso brownie de chocolate con helado de vainilla',
      precio: 10000,
      imgURL: 'assets/images/menu/Brownie.png',
      categoria: 'postre',
      ingredientes: ['Chocolate', 'Helado de vainilla', 'Nueces']
    }
  ];

  filteredProducts: Product[] = [];
  searchTerm = '';
  selectedCategory = 'all';
  isLoading = true;
  showCart = false;
  cartItems: any[] = [];
  cartTotal = 0;
  cartItemsCount = 0;
  
  // Modal properties
  showModal = false;
  selectedProduct: Product | null = null;
  selectedProductAdicionales: any[] = [];

  ngOnInit() {
    this.initializeMenu();
    this.filterProducts();
    
    // Subscribe to authentication state
    this.subscription.add(
      this.isLoggedIn$.subscribe(isLoggedIn => {
        this.isAuthenticated = isLoggedIn;
        this.cdr.detectChanges();
      })
    );
    
    // Subscribe to cart updates
    this.subscription.add(
      this.cartService.cart$.subscribe(items => {
        this.cartItems = items;
        this.cdr.detectChanges();
      })
    );

    this.subscription.add(
      this.cartService.total$.subscribe(total => {
        this.cartTotal = total;
        this.cdr.detectChanges();
      })
    );

    this.subscription.add(
      this.cartService.count$.subscribe(count => {
        this.cartItemsCount = count;
        this.cdr.detectChanges();
      })
    );
  }

  ngAfterViewInit() {
    // Initialize menu functionality
    this.initializeMenu();
    this.initializeCart();
    this.initializeMobileMenu();
    this.hideLoader();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  initializeMenu() {
    this.filteredProducts = this.products;
    console.log('Menu initialized with products:', this.products.length);
  }

  initializeCart() {
    // Initialize cart modal functionality
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = document.getElementById('cartModal');
    const cartClose = document.getElementById('cartClose');

    if (cartBtn && cartModal) {
      cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleCart();
      });
    }

    if (cartClose && cartModal) {
      cartClose.addEventListener('click', () => {
        this.showCart = false;
      });
    }
  }

  initializeMobileMenu() {
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

    if (mobileNavToggle && mobileMenu && mobileMenuOverlay) {
      mobileNavToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        mobileMenuOverlay.classList.toggle('active');
      });

      mobileMenuOverlay.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
      });
    }
  }

  hideLoader() {
    console.log('hideLoader called - isLoading before:', this.isLoading);
    this.isLoading = false;
    this.cdr.detectChanges(); // Forzar detección de cambios inmediatamente
    console.log('hideLoader - isLoading after:', this.isLoading);
  }

  onSearchChange() {
    this.filterProducts();
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = this.searchTerm === '' || 
        product.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = this.selectedCategory === 'all' || 
        product.categoria.toLowerCase() === this.selectedCategory.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.filterProducts();
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterProducts();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.filterProducts();
  }

  getCategoryDisplayName(category: string): string {
    const categoryNames: Record<string, string> = {
      'hamburguesa': 'Hamburguesas',
      'acompañamiento': 'Acompañamientos',
      'perro caliente': 'Perros Calientes',
      'bebida': 'Bebidas',
      'postre': 'Postres'
    };
    return categoryNames[category] || category;
  }

  formatPrice(price: number): string {
    return price.toFixed(0);
  }

  onImageError(event: any) {
    event.target.src = 'assets/images/placeholder.jpg';
  }

  openProductDetail(product: Product) {
    console.log('Opening product detail for:', product.nombre);
    console.log('Product data:', product);
    console.log('showModal before:', this.showModal);
    this.openProductModal(product);
    console.log('showModal after:', this.showModal);
  }

  openProductModal(product: Product) {
    console.log('openProductModal called with:', product);
    this.selectedProduct = product;
    this.selectedProductAdicionales = this.getAdicionalesForProduct(product);
    this.showModal = true;
    console.log('Modal state set - selectedProduct:', this.selectedProduct);
    console.log('Modal state set - showModal:', this.showModal);
    console.log('Modal state set - adicionales:', this.selectedProductAdicionales);
  }

  closeProductModal() {
    this.showModal = false;
    this.selectedProduct = null;
    this.selectedProductAdicionales = [];
  }

  getAdicionalesForProduct(product: Product): any[] {
    if (!product.adicionales || product.adicionales.length === 0) {
      return [];
    }
    
    // Simulamos obtener adicionales por IDs (en una app real vendría del servicio)
    const allAdicionales = [
      { id: 1, name: 'Queso Cheddar', price: 1.50, category: 'quesos' },
      { id: 2, name: 'Queso Suizo', price: 1.75, category: 'quesos' },
      { id: 3, name: 'Queso Azul', price: 2.00, category: 'quesos' },
      { id: 4, name: 'Carne Extra', price: 3.00, category: 'carnes' },
      { id: 5, name: 'Tocino', price: 2.50, category: 'carnes' },
      { id: 6, name: 'Pollo', price: 2.75, category: 'carnes' },
      { id: 7, name: 'Lechuga', price: 0.50, category: 'vegetales' },
      { id: 8, name: 'Tomate', price: 0.75, category: 'vegetales' },
      { id: 9, name: 'Cebolla', price: 0.50, category: 'vegetales' },
      { id: 10, name: 'Ketchup', price: 0.25, category: 'salsas' },
      { id: 11, name: 'Mostaza', price: 0.25, category: 'salsas' },
      { id: 12, name: 'Mayonesa', price: 0.25, category: 'salsas' }
    ];
    
    return allAdicionales.filter(adicional => product.adicionales!.includes(adicional.id));
  }

  addToCart(product: Product) {
    console.log('Adding product to cart:', product);
    this.cartService.addItem(product);
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  toggleCart() {
    this.showCart = !this.showCart;
    if (this.showCart) {
      this.cartService.openCart();
    } else {
      this.cartService.closeCart();
    }
  }

  decreaseQuantity(itemId: string) {
    this.cartService.decreaseQuantity(itemId);
  }

  increaseQuantity(itemId: string) {
    this.cartService.increaseQuantity(itemId);
  }

  removeFromCart(itemId: string) {
    this.cartService.removeItem(itemId);
  }

  checkout() {
    if (this.cartItems.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }
    
    alert('¡Gracias por tu compra! Redirigiendo al pago...');
    this.toggleCart();
  }

  // Método para manejar clicks en botones de agregar al carrito
  onAddToCartClick(event: Event, product: Product) {
    event.preventDefault();
    event.stopPropagation();
    this.openProductDetail(product);
  }

  // Authentication methods
  logout(): void {
    this.authService.logout();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
