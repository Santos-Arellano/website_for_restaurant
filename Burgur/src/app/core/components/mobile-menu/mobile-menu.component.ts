// ==========================================
// BURGER CLUB - ANGULAR MOBILE MENU COMPONENT
// ==========================================

import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { ANIMATION_DURATIONS } from '../../../shared/constants/app.constants';

export interface MobileNavItem {
  label: string;
  route?: string;
  fragment?: string;
  external?: boolean;
  url?: string;
  icon?: string;
}

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="mobile-menu-overlay" 
         [class.active]="isOpen" 
         (click)="close()"
         #overlay>
    </div>
    
    <nav class="mobile-menu" 
         [class.active]="isOpen"
         #mobileMenu>
      
      <div class="mobile-menu-header">
        <div class="mobile-menu-logo">
          <img src="assets/images/logo.png" alt="Burger Club" />
        </div>
        <button class="mobile-menu-close" 
                (click)="close()"
                aria-label="Cerrar menú">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="mobile-menu-content">
        <ul class="mobile-nav-list">
          <li *ngFor="let item of navItems; trackBy: trackByLabel" 
              class="mobile-nav-item"
              [class.animate-in]="isOpen">
            
            <a *ngIf="!item.external" 
               [routerLink]="item.route"
               [fragment]="item.fragment"
               class="mobile-nav-link"
               (click)="handleNavClick(item)">
              <i *ngIf="item.icon" [class]="'fas fa-' + item.icon"></i>
              {{ item.label }}
            </a>
            
            <a *ngIf="item.external" 
               [href]="item.url"
               target="_blank"
               rel="noopener noreferrer"
               class="mobile-nav-link external"
               (click)="handleNavClick(item)">
              <i *ngIf="item.icon" [class]="'fas fa-' + item.icon"></i>
              {{ item.label }}
              <i class="fas fa-external-link-alt"></i>
            </a>
          </li>
        </ul>

        <div class="mobile-menu-actions">
          <button class="mobile-cart-btn" 
                  (click)="openCart()"
                  [class.has-items]="cartItemCount > 0">
            <i class="fas fa-shopping-cart"></i>
            <span class="mobile-cart-text">Carrito</span>
            <span *ngIf="cartItemCount > 0" 
                  class="mobile-cart-count">{{ cartItemCount }}</span>
          </button>
          
          <div class="mobile-auth-buttons">
            <button class="mobile-auth-btn login" 
                    (click)="navigateToAuth('login')">
              <i class="fas fa-sign-in-alt"></i>
              Iniciar Sesión
            </button>
            <button class="mobile-auth-btn register" 
                    (click)="navigateToAuth('register')">
              <i class="fas fa-user-plus"></i>
              Registrarse
            </button>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .mobile-menu-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 998;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .mobile-menu-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    .mobile-menu {
      position: fixed;
      top: 0;
      right: -100%;
      width: 280px;
      height: 100%;
      background: #fff;
      z-index: 999;
      transition: right 0.3s ease;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
    }

    .mobile-menu.active {
      right: 0;
    }

    .mobile-menu-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #eee;
      background: #f8f9fa;
    }

    .mobile-menu-logo img {
      height: 40px;
    }

    .mobile-menu-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #666;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .mobile-menu-close:hover {
      background: #e9ecef;
      color: #333;
    }

    .mobile-menu-content {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0;
    }

    .mobile-nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .mobile-nav-item {
      opacity: 0;
      transform: translateX(20px);
      transition: all 0.3s ease;
    }

    .mobile-nav-item.animate-in {
      opacity: 1;
      transform: translateX(0);
    }

    .mobile-nav-link {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      color: #333;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease;
      border-left: 3px solid transparent;
    }

    .mobile-nav-link:hover,
    .mobile-nav-link.active {
      background: #f8f9fa;
      color: #d4a574;
      border-left-color: #d4a574;
    }

    .mobile-nav-link i {
      margin-right: 0.75rem;
      width: 20px;
      text-align: center;
    }

    .mobile-nav-link.external .fa-external-link-alt {
      margin-left: auto;
      margin-right: 0;
      font-size: 0.8rem;
      opacity: 0.6;
    }

    .mobile-menu-actions {
      padding: 1rem;
      border-top: 1px solid #eee;
      background: #f8f9fa;
    }

    .mobile-cart-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem;
      background: #d4a574;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 1rem;
      position: relative;
    }

    .mobile-cart-btn:hover {
      background: #c19660;
      transform: translateY(-1px);
    }

    .mobile-cart-btn i {
      margin-right: 0.5rem;
    }

    .mobile-cart-count {
      position: absolute;
      top: -5px;
      right: -5px;
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

    .mobile-auth-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .mobile-auth-btn {
      flex: 1;
      padding: 0.75rem;
      border: 2px solid #d4a574;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .mobile-auth-btn.login {
      background: transparent;
      color: #d4a574;
    }

    .mobile-auth-btn.login:hover {
      background: #d4a574;
      color: white;
    }

    .mobile-auth-btn.register {
      background: #d4a574;
      color: white;
    }

    .mobile-auth-btn.register:hover {
      background: #c19660;
    }

    @media (max-width: 480px) {
      .mobile-menu {
        width: 100%;
        right: -100%;
      }
    }
  `]
})
export class MobileMenuComponent implements OnInit, OnDestroy {
  @ViewChild('mobileMenu', { static: true }) mobileMenuRef!: ElementRef;
  @ViewChild('overlay', { static: true }) overlayRef!: ElementRef;

  isOpen = false;
  cartItemCount = 0;
  private cartSubscription?: Subscription;

  navItems: MobileNavItem[] = [
    { label: 'Inicio', route: '/', icon: 'home' },
    { label: 'Menú', route: '/menu', icon: 'utensils' },
    { label: 'Promociones', route: '/promociones', icon: 'tags' },
    { label: 'Nosotros', route: '/', fragment: 'about', icon: 'info-circle' },
    { label: 'Contacto', route: '/', fragment: 'contact', icon: 'phone' },
    { label: 'Ubicación', route: '/', fragment: 'location', icon: 'map-marker-alt' }
  ];

  constructor(
    private router: Router,
    private cartService: CartService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.setupCartSubscription();
    this.setupEventListeners();
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isOpen) {
      this.close();
    }
  }

  open(): void {
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
    this.animateMenuItems();
  }

  close(): void {
    this.isOpen = false;
    document.body.style.overflow = '';
  }

  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  handleNavClick(item: MobileNavItem): void {
    this.close();
    
    if (item.external && item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (item.route) {
      if (item.fragment) {
        this.router.navigate([item.route], { fragment: item.fragment });
      } else {
        this.router.navigate([item.route]);
      }
    }
  }

  openCart(): void {
    this.close();
    this.cartService.openCart();
  }

  navigateToAuth(type: 'login' | 'register'): void {
    this.close();
    this.router.navigate([`/${type}`]);
  }

  trackByLabel(index: number, item: MobileNavItem): string {
    return item.label;
  }

  private setupCartSubscription(): void {
    this.cartSubscription = this.cartService.count$.subscribe((count: number) => {
      this.cartItemCount = count;
    });
  }

  private setupEventListeners(): void {
    // Handle clicks outside menu
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  private handleOutsideClick(event: Event): void {
    if (!this.isOpen) return;

    const target = event.target as HTMLElement;
    const mobileMenu = this.mobileMenuRef?.nativeElement;
    const menuToggle = document.querySelector('.mobile-menu-toggle');

    if (mobileMenu && !mobileMenu.contains(target) && !menuToggle?.contains(target)) {
      this.close();
    }
  }

  private animateMenuItems(): void {
    const items = this.elementRef.nativeElement.querySelectorAll('.mobile-nav-item');
    
    items.forEach((item: HTMLElement, index: number) => {
      setTimeout(() => {
        item.classList.add('animate-in');
      }, index * 50);
    });
  }
}