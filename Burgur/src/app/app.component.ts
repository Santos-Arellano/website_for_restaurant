import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CartComponent } from './components/cart/cart.component';
import { CartService } from './services/cart.service';
import { Subscription } from 'rxjs';

declare let window: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, CartComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'Burgur';
  
  // Estado de la aplicación
  isLoading = true;
  isMobileMenuOpen = false;
  isCartOpen = false;
  scrollY = 0;
  scrollPosition = 0;
  cartItemCount = 0;
  
  private cartSubscription?: Subscription;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.initializeApp();
    this.setupCartSubscription();
  }
  
  ngAfterViewInit() {
    // Initialize after view is ready
    setTimeout(() => {
      this.hideLoader();
      this.initializeScrollEffects();
      this.initializeCounters();
      this.initializeBackToTop();
    }, 1000);
  }
  
  ngOnDestroy() {
    // Cleanup event listeners
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    
    // Cleanup cart subscription
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
  
  initializeApp() {
    // Show loader initially
    this.showLoader();
    
    // Setup global events
    this.setupGlobalEvents();
    
    // Initialize mobile menu
    this.initializeMobileMenu();
    
    // Initialize cart
    this.initializeCart();
  }
  
  showLoader() {
    this.isLoading = true;
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.classList.add('active');
    }
  }
  
  hideLoader() {
    this.isLoading = false;
    const loader = document.querySelector('.loader') as HTMLElement;
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    }
  }
  
  initializeMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    
    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
    }
    
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', () => this.closeMobileMenu());
    }
    
    if (mobileMenuOverlay) {
      mobileMenuOverlay.addEventListener('click', () => this.closeMobileMenu());
    }
  }
  
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    const mobileMenu = document.querySelector('.mobile-menu');
    const body = document.body;
    
    if (this.isMobileMenuOpen) {
      mobileMenu?.classList.add('active');
      body.classList.add('mobile-menu-open');
    } else {
      mobileMenu?.classList.remove('active');
      body.classList.remove('mobile-menu-open');
    }
  }
  
  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    const mobileMenu = document.querySelector('.mobile-menu');
    const body = document.body;
    
    mobileMenu?.classList.remove('active');
    body.classList.remove('mobile-menu-open');
  }
  
  initializeCart() {
    const cartToggle = document.querySelector('.cart-toggle');
    const cartClose = document.querySelector('.cart-close');
    const cartOverlay = document.querySelector('.cart-overlay');
    
    if (cartToggle) {
      cartToggle.addEventListener('click', () => this.toggleCart());
    }
    
    if (cartClose) {
      cartClose.addEventListener('click', () => this.closeCart());
    }
    
    if (cartOverlay) {
      cartOverlay.addEventListener('click', () => this.closeCart());
    }
  }
  
  toggleCart() {
    this.cartService.openCart();
  }
  
  closeCart() {
    this.isCartOpen = false;
    const cartModal = document.querySelector('.cart-modal');
    const body = document.body;
    
    cartModal?.classList.remove('active');
    body.classList.remove('cart-open');
  }

  // Cart functionality
  openCart(): void {
    this.cartService.openCart();
  }

  addToCart(product: any): void {
    this.cartService.addItem(product);
  }
  
  setupCartSubscription(): void {
    this.cartSubscription = this.cartService.count$.subscribe((count: number) => {
      this.cartItemCount = count;
    });
  }
  
  initializeScrollEffects() {
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Header scroll effect
      if (header) {
        if (scrollTop > 100) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
      
      this.scrollPosition = scrollTop;
    });
  }
  
  initializeCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    const observerOptions = {
      threshold: 0.7,
      rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          this.animateCounter(entry.target as HTMLElement);
        }
      });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
  }
  
  animateCounter(element: HTMLElement) {
    const target = parseInt(element.getAttribute('data-count') || '0');
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    element.classList.add('counted');
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current).toString();
    }, 16);
  }
  
  initializeBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.setAttribute('aria-label', 'Volver arriba');
    document.body.appendChild(backToTopBtn);
    
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });
    
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  setupGlobalEvents() {
    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isMobileMenuOpen) {
          this.closeMobileMenu();
        }
        if (this.isCartOpen) {
          this.closeCart();
        }
      }
    });
    
    // Handle resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.isMobileMenuOpen) {
        this.closeMobileMenu();
      }
    });
  }
  
  // Handle scroll for performance
  handleScroll = () => {
    this.scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // Update header background
    const header = document.querySelector('.header');
    if (header) {
      if (this.scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    
    // Show/hide back to top button
    const backToTopBtn = document.querySelector('.back-to-top');
    if (backToTopBtn) {
      if (this.scrollY > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  }
  
  // Handle resize for performance
  handleResize = () => {
    // Throttled resize handler
  }
}
