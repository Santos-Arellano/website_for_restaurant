// ==========================================
// BURGER CLUB - HEADER COMPONENT
// ==========================================

import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';

export interface NavItem {
  label: string;
  route?: string;
  fragment?: string;
  external?: boolean;
  url?: string;
  children?: NavItem[];
  isOpen?: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header 
      class="header" 
      [class.scrolled]="isScrolled"
      [class.mobile-open]="isMobileMenuOpen"
      #headerElement
    >
      <div class="container">
        <div class="header-content">
          <!-- Logo -->
          <div class="logo">
            <a routerLink="/" class="logo-link">
              <img src="assets/images/logo.png" alt="Burger Club" class="logo-img">
              <span class="logo-text">Burger Club</span>
            </a>
          </div>

          <!-- Desktop Navigation -->
          <nav class="desktop-nav" [class.hidden]="isMobileMenuOpen">
            <ul class="nav-list">
              <li 
                *ngFor="let item of navItems" 
                class="nav-item"
                [class.has-dropdown]="item.children && item.children.length > 0"
              >
                <a 
                  *ngIf="!item.children || item.children.length === 0"
                  [routerLink]="item.route || null"
                  [fragment]="item.fragment"
                  [href]="item.external ? item.url : null"
                  [target]="item.external ? '_blank' : undefined"
                  class="nav-link"
                  [class.active]="isActiveRoute(item)"
                  (click)="handleNavClick($event, item)"
                >
                  {{ item.label }}
                </a>
                
                <!-- Dropdown menu -->
                <div *ngIf="item.children && item.children.length > 0" class="dropdown">
                  <button class="nav-link dropdown-toggle" (click)="toggleDropdown(item)">
                    {{ item.label }}
                    <i class="fas fa-chevron-down"></i>
                  </button>
                  <ul class="dropdown-menu" [class.show]="item.isOpen">
                    <li *ngFor="let child of item.children" class="dropdown-item">
                      <a 
                        [routerLink]="child.route || null"
                        [fragment]="child.fragment"
                        [href]="child.external ? child.url : null"
                        [target]="child.external ? '_blank' : undefined"
                        class="dropdown-link"
                        (click)="handleNavClick($event, child)"
                      >
                        {{ child.label }}
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </nav>

          <!-- Header Actions -->
          <div class="header-actions">
            <!-- Cart Button -->
            <button class="cart-btn" (click)="toggleCart()" [class.has-items]="cartItemCount > 0">
              <i class="fas fa-shopping-cart"></i>
              <span class="cart-count" *ngIf="cartItemCount > 0">{{ cartItemCount }}</span>
            </button>

            <!-- User Menu -->
            <div class="user-menu" *ngIf="isLoggedIn">
              <button class="user-btn" (click)="toggleUserMenu()">
                <i class="fas fa-user"></i>
              </button>
              <div class="user-dropdown" [class.show]="isUserMenuOpen">
                <a routerLink="/profile" class="user-link">Mi Perfil</a>
                <a routerLink="/orders" class="user-link">Mis Pedidos</a>
                <button class="user-link logout-btn" (click)="logout()">Cerrar Sesión</button>
              </div>
            </div>

            <!-- Login Button -->
            <a *ngIf="!isLoggedIn" routerLink="/login" class="login-btn">
              <i class="fas fa-sign-in-alt"></i>
              <span class="login-text">Iniciar Sesión</span>
            </a>

            <!-- Mobile Menu Toggle -->
            <button 
              class="mobile-toggle"
              (click)="toggleMobileMenu()"
              [class.active]="isMobileMenuOpen"
              aria-label="Toggle mobile menu"
            >
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div class="mobile-menu" [class.open]="isMobileMenuOpen">
        <div class="mobile-menu-content">
          <nav class="mobile-nav">
            <ul class="mobile-nav-list">
              <li *ngFor="let item of navItems" class="mobile-nav-item">
                <a 
                  *ngIf="!item.children || item.children.length === 0"
                  [routerLink]="item.route || null"
                  [fragment]="item.fragment"
                  [href]="item.external ? item.url : null"
                  [target]="item.external ? '_blank' : undefined"
                  class="mobile-nav-link"
                  [class.active]="isActiveRoute(item)"
                  (click)="handleMobileNavClick($event, item)"
                >
                  {{ item.label }}
                </a>
                
                <!-- Mobile Dropdown -->
                <div *ngIf="item.children && item.children.length > 0" class="mobile-dropdown">
                  <button 
                    class="mobile-nav-link dropdown-toggle"
                    (click)="toggleMobileDropdown(item)"
                    [class.open]="item.isOpen"
                  >
                    {{ item.label }}
                    <i class="fas fa-chevron-down"></i>
                  </button>
                  <ul class="mobile-dropdown-menu" [class.show]="item.isOpen">
                    <li *ngFor="let child of item.children" class="mobile-dropdown-item">
                      <a 
                        [routerLink]="child.route || null"
                        [fragment]="child.fragment"
                        [href]="child.external ? child.url : null"
                        [target]="child.external ? '_blank' : undefined"
                        class="mobile-dropdown-link"
                        (click)="handleMobileNavClick($event, child)"
                      >
                        {{ child.label }}
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </nav>

          <!-- Mobile Actions -->
          <div class="mobile-actions">
            <a *ngIf="!isLoggedIn" routerLink="/login" class="mobile-action-btn" (click)="closeMobileMenu()">
              <i class="fas fa-sign-in-alt"></i>
              Iniciar Sesión
            </a>
            <a *ngIf="!isLoggedIn" routerLink="/register" class="mobile-action-btn" (click)="closeMobileMenu()">
              <i class="fas fa-user-plus"></i>
              Registrarse
            </a>
            <div *ngIf="isLoggedIn" class="mobile-user-actions">
              <a routerLink="/profile" class="mobile-action-btn" (click)="closeMobileMenu()">
                <i class="fas fa-user"></i>
                Mi Perfil
              </a>
              <a routerLink="/orders" class="mobile-action-btn" (click)="closeMobileMenu()">
                <i class="fas fa-list"></i>
                Mis Pedidos
              </a>
              <button class="mobile-action-btn logout-btn" (click)="logout()">
                <i class="fas fa-sign-out-alt"></i>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Menu Overlay -->
      <div 
        class="mobile-overlay" 
        [class.show]="isMobileMenuOpen"
        (click)="closeMobileMenu()"
      ></div>
    </header>
  `,
  styles: [`
    .header {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      z-index: 1000;
      transition: all 0.3s ease;
    }

    .header.scrolled {
      background: rgba(255, 255, 255, 0.98);
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 0;
      min-height: 70px;
    }

    .logo {
      display: flex;
      align-items: center;
    }

    .logo-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: inherit;
    }

    .logo-img {
      height: 40px;
      margin-right: 0.5rem;
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--primary-color, #ff6b35);
    }

    .desktop-nav {
      display: flex;
      align-items: center;
    }

    .nav-list {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 2rem;
    }

    .nav-item {
      position: relative;
    }

    .nav-link {
      text-decoration: none;
      color: #333;
      font-weight: 500;
      padding: 0.5rem 0;
      transition: all 0.3s ease;
      position: relative;
    }

    .nav-link:hover,
    .nav-link.active {
      color: var(--primary-color, #ff6b35);
    }

    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--primary-color, #ff6b35);
      transition: width 0.3s ease;
    }

    .nav-link:hover::after,
    .nav-link.active::after {
      width: 100%;
    }

    .dropdown {
      position: relative;
    }

    .dropdown-toggle {
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      padding: 0.5rem 0;
      min-width: 200px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      list-style: none;
      margin: 0;
    }

    .dropdown-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-link {
      display: block;
      padding: 0.75rem 1rem;
      text-decoration: none;
      color: #333;
      transition: all 0.3s ease;
    }

    .dropdown-link:hover {
      background: #f8f9fa;
      color: var(--primary-color, #ff6b35);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .cart-btn {
      position: relative;
      background: none;
      border: 2px solid var(--primary-color, #ff6b35);
      color: var(--primary-color, #ff6b35);
      width: 45px;
      height: 45px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .cart-btn:hover {
      background: var(--primary-color, #ff6b35);
      color: white;
    }

    .cart-count {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #dc3545;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: bold;
    }

    .user-menu {
      position: relative;
    }

    .user-btn {
      background: none;
      border: 2px solid #6c757d;
      color: #6c757d;
      width: 45px;
      height: 45px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .user-btn:hover {
      background: #6c757d;
      color: white;
    }

    .user-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      padding: 0.5rem 0;
      min-width: 180px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
    }

    .user-dropdown.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .user-link {
      display: block;
      padding: 0.75rem 1rem;
      text-decoration: none;
      color: #333;
      transition: all 0.3s ease;
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
    }

    .user-link:hover {
      background: #f8f9fa;
      color: var(--primary-color, #ff6b35);
    }

    .login-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--primary-color, #ff6b35);
      font-weight: 500;
      padding: 0.5rem 1rem;
      border: 2px solid var(--primary-color, #ff6b35);
      border-radius: 25px;
      transition: all 0.3s ease;
    }

    .login-btn:hover {
      background: var(--primary-color, #ff6b35);
      color: white;
    }

    .mobile-toggle {
      display: none;
      flex-direction: column;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      gap: 4px;
    }

    .hamburger-line {
      width: 25px;
      height: 3px;
      background: #333;
      transition: all 0.3s ease;
    }

    .mobile-toggle.active .hamburger-line:nth-child(1) {
      transform: rotate(45deg) translate(6px, 6px);
    }

    .mobile-toggle.active .hamburger-line:nth-child(2) {
      opacity: 0;
    }

    .mobile-toggle.active .hamburger-line:nth-child(3) {
      transform: rotate(-45deg) translate(6px, -6px);
    }

    .mobile-menu {
      position: fixed;
      top: 100%;
      left: 0;
      width: 100%;
      height: calc(100vh - 70px);
      background: white;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      overflow-y: auto;
    }

    .mobile-menu.open {
      transform: translateX(0);
    }

    .mobile-menu-content {
      padding: 2rem;
    }

    .mobile-nav-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .mobile-nav-item {
      border-bottom: 1px solid #eee;
    }

    .mobile-nav-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 0;
      text-decoration: none;
      color: #333;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .mobile-nav-link.active {
      color: var(--primary-color, #ff6b35);
    }

    .mobile-dropdown-menu {
      list-style: none;
      margin: 0;
      padding: 0;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }

    .mobile-dropdown-menu.show {
      max-height: 300px;
    }

    .mobile-dropdown-link {
      display: block;
      padding: 0.75rem 0 0.75rem 1rem;
      text-decoration: none;
      color: #666;
      font-size: 1rem;
    }

    .mobile-actions {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #eee;
    }

    .mobile-action-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 0;
      text-decoration: none;
      color: #333;
      font-size: 1.1rem;
      font-weight: 500;
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
    }

    .mobile-action-btn:hover {
      color: var(--primary-color, #ff6b35);
    }

    .mobile-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 999;
    }

    .mobile-overlay.show {
      opacity: 1;
      visibility: visible;
    }

    @media (max-width: 768px) {
      .desktop-nav {
        display: none;
      }

      .mobile-toggle {
        display: flex;
      }

      .login-text {
        display: none;
      }

      .header-actions {
        gap: 0.5rem;
      }
    }

    @media (max-width: 480px) {
      .header-content {
        padding: 0.75rem 0;
      }

      .logo-text {
        font-size: 1.25rem;
      }

      .cart-btn,
      .user-btn {
        width: 40px;
        height: 40px;
      }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('headerElement', { static: true }) headerElement!: ElementRef;

  navItems: NavItem[] = [
    { label: 'Inicio', route: '/', fragment: 'hero' },
    { label: 'Menú', route: '/menu' },
    { label: 'Nosotros', route: '/', fragment: 'about' },
    { label: 'Testimonios', route: '/', fragment: 'testimonials' },
    { label: 'Contacto', route: '/', fragment: 'contact' }
  ];

  isScrolled = false;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  isLoggedIn = false;
  cartItemCount = 0;

  private routerSubscription?: Subscription;
  private cartSubscription?: Subscription;

  constructor(
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.setupRouterSubscription();
    this.setupCartSubscription();
    this.checkAuthStatus();
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    this.cartSubscription?.unsubscribe();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    this.isScrolled = window.pageYOffset > 50;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    // Close dropdowns when clicking outside
    if (!target.closest('.dropdown') && !target.closest('.user-menu')) {
      this.closeAllDropdowns();
      this.isUserMenuOpen = false;
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeMobileMenu();
      this.closeAllDropdowns();
      this.isUserMenuOpen = false;
    }
  }

  private setupRouterSubscription(): void {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMobileMenu();
        this.closeAllDropdowns();
      });
  }

  private setupCartSubscription(): void {
    this.cartSubscription = this.cartService.count$.subscribe((count: number) => {
      this.cartItemCount = count;
    });
  }

  private checkAuthStatus(): void {
    // TODO: Implement authentication check
    this.isLoggedIn = false;
  }

  isActiveRoute(item: NavItem): boolean {
    if (item.route) {
      return this.router.url === item.route;
    }
    return false;
  }

  handleNavClick(event: Event, item: NavItem): void {
    if (item.fragment && item.route === '/') {
      event.preventDefault();
      this.scrollToSection(item.fragment);
    }
  }

  handleMobileNavClick(event: Event, item: NavItem): void {
    this.closeMobileMenu();
    this.handleNavClick(event, item);
  }

  private scrollToSection(fragment: string): void {
    const element = document.getElementById(fragment);
    if (element) {
      const headerHeight = this.headerElement.nativeElement.offsetHeight;
      const elementPosition = element.offsetTop - headerHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  }

  toggleDropdown(item: NavItem): void {
    item.isOpen = !item.isOpen;
    
    // Close other dropdowns
    this.navItems.forEach(navItem => {
      if (navItem !== item) {
        navItem.isOpen = false;
      }
    });
  }

  toggleMobileDropdown(item: NavItem): void {
    item.isOpen = !item.isOpen;
  }

  private closeAllDropdowns(): void {
    this.navItems.forEach(item => {
      item.isOpen = false;
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    // Prevent body scroll when menu is open
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  toggleCart(): void {
    // TODO: Implement cart toggle
    console.log('Toggle cart');
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout(): void {
    // TODO: Implement logout
    this.isLoggedIn = false;
    this.isUserMenuOpen = false;
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }
}