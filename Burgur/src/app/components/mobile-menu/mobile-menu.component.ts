import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';

interface MenuItem {
  label: string;
  route: string;
  icon?: string;
  badge?: number;
}

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="mobile-menu-container">
      <!-- Menu Toggle Button -->
      <button 
        class="menu-toggle"
        [class.active]="isMenuOpen"
        (click)="toggleMenu()"
        aria-label="Toggle menu"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>

      <!-- Overlay -->
      <div 
        class="menu-overlay"
        [class.active]="isMenuOpen"
        (click)="closeMenu()"
      ></div>

      <!-- Mobile Menu -->
      <nav 
        class="mobile-menu"
        [class.active]="isMenuOpen"
        (touchstart)="onTouchStart($event)"
        (touchmove)="onTouchMove($event)"
        (touchend)="onTouchEnd($event)"
      >
        <div class="menu-header">
          <div class="logo">
            <img src="/assets/images/logo.png" alt="Burger Club" />
          </div>
          <button class="close-btn" (click)="closeMenu()" aria-label="Cerrar menú">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="menu-content">
          <ul class="menu-items">
            <li *ngFor="let item of menuItems; let i = index" 
                class="menu-item"
                [style.animation-delay]="(i * 0.1) + 's'">
              <a 
                [routerLink]="item.route"
                class="menu-link"
                (click)="closeMenu()"
                routerLinkActive="active"
              >
                <span class="menu-icon" *ngIf="item.icon" [innerHTML]="item.icon"></span>
                <span class="menu-label">{{ item.label }}</span>
                <span class="menu-badge" *ngIf="item.badge && item.badge > 0">{{ item.badge }}</span>
              </a>
            </li>
          </ul>

          <div class="menu-footer">
            <div class="social-links">
              <a href="#" class="social-link" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" class="social-link" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" class="social-link" aria-label="WhatsApp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"/>
                </svg>
              </a>
            </div>
            
            <div class="contact-info">
              <p>📞 +57 300 123 4567</p>
              <p>📍 Calle 123 #45-67, Bogotá</p>
            </div>
          </div>
        </div>
      </nav>
    </div>
  `,
  styles: [`
    .mobile-menu-container {
      position: relative;
      z-index: 1000;
    }

    .menu-toggle {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .menu-toggle:hover {
      background: rgba(255, 107, 53, 0.1);
    }

    .hamburger-line {
      width: 24px;
      height: 2px;
      background: #333;
      margin: 2px 0;
      transition: all 0.3s ease;
      transform-origin: center;
    }

    .menu-toggle.active .hamburger-line:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }

    .menu-toggle.active .hamburger-line:nth-child(2) {
      opacity: 0;
    }

    .menu-toggle.active .hamburger-line:nth-child(3) {
      transform: rotate(-45deg) translate(7px, -6px);
    }

    .menu-overlay {
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

    .menu-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    .mobile-menu {
      position: fixed;
      top: 0;
      right: -100%;
      width: 300px;
      height: 100%;
      background: white;
      box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
      transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1000;
      overflow-y: auto;
    }

    .mobile-menu.active {
      right: 0;
    }

    .menu-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #eee;
      background: #f8f9fa;
    }

    .logo img {
      height: 40px;
    }

    .close-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      color: #666;
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      background: rgba(255, 107, 53, 0.1);
      color: #ff6b35;
    }

    .menu-content {
      padding: 1rem 0;
    }

    .menu-items {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .menu-item {
      opacity: 0;
      transform: translateX(30px);
      animation: slideInRight 0.3s ease forwards;
    }

    .menu-link {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      text-decoration: none;
      color: #333;
      transition: all 0.3s ease;
      position: relative;
    }

    .menu-link:hover,
    .menu-link.active {
      background: rgba(255, 107, 53, 0.1);
      color: #ff6b35;
    }

    .menu-link.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #ff6b35;
    }

    .menu-icon {
      margin-right: 12px;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .menu-label {
      flex: 1;
      font-weight: 500;
    }

    .menu-badge {
      background: #ff6b35;
      color: white;
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 0.75rem;
      font-weight: bold;
      min-width: 20px;
      text-align: center;
    }

    .menu-footer {
      margin-top: 2rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #eee;
    }

    .social-links {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: #f8f9fa;
      border-radius: 50%;
      color: #666;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .social-link:hover {
      background: #ff6b35;
      color: white;
      transform: translateY(-2px);
    }

    .contact-info {
      font-size: 0.875rem;
      color: #666;
      line-height: 1.6;
    }

    .contact-info p {
      margin: 0.5rem 0;
    }

    @keyframes slideInRight {
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @media (min-width: 769px) {
      .mobile-menu-container {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .mobile-menu {
        width: 280px;
      }
    }
  `]
})
export class MobileMenuComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  cartItemCount = 0;
  private cartSubscription?: Subscription;
  private touchStartX = 0;
  private touchCurrentX = 0;
  private isDragging = false;

  menuItems: MenuItem[] = [
    {
      label: 'Inicio',
      route: '/',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9,22 9,12 15,12 15,22"></polyline></svg>'
    },
    {
      label: 'Menú',
      route: '/menu',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>'
    },
    {
      label: 'Carrito',
      route: '/cart',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="m1 1 4 4 14 1-1 7H6"></path></svg>',
      badge: 0
    },
    {
      label: 'Mi Perfil',
      route: '/profile',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
    },
    {
      label: 'Contacto',
      route: '/contact',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>'
    },
    {
      label: 'Iniciar Sesión',
      route: '/login',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10,17 15,12 10,7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>'
    }
  ];

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
      const cartMenuItem = this.menuItems.find(item => item.route === '/cart');
      if (cartMenuItem) {
        cartMenuItem.badge = this.cartItemCount;
      }
    });
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.toggleBodyScroll();
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.toggleBodyScroll();
  }

  private toggleBodyScroll() {
    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.isDragging = true;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;
    
    this.touchCurrentX = event.touches[0].clientX;
    const deltaX = this.touchCurrentX - this.touchStartX;
    
    // If swiping right (closing gesture)
    if (deltaX > 0) {
      const menu = event.currentTarget as HTMLElement;
      const progress = Math.min(deltaX / 200, 1);
      menu.style.transform = `translateX(${deltaX}px)`;
      menu.style.opacity = `${1 - progress * 0.5}`;
    }
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.isDragging) return;
    
    const deltaX = this.touchCurrentX - this.touchStartX;
    const menu = event.currentTarget as HTMLElement;
    
    // Reset styles
    menu.style.transform = '';
    menu.style.opacity = '';
    
    // Close menu if swiped enough
    if (deltaX > 100) {
      this.closeMenu();
    }
    
    this.isDragging = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    // Close menu on desktop resize
    if (window.innerWidth > 768 && this.isMenuOpen) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey() {
    if (this.isMenuOpen) {
      this.closeMenu();
    }
  }
}