// ==========================================
// BURGER CLUB - MAIN APPLICATION (MODULAR)
// ==========================================

// Import utilities
import { 
    throttle, 
    debounce, 
    preloadImages, 
    smoothScrollTo,
    formatPrice 
} from './utils/helpers.js';

import { 
    CRITICAL_IMAGES, 
    ANIMATION_DURATIONS, 
    PROMO_IMAGES 
} from './utils/constants.js';

// Import core modules
import { HeaderManager } from './modules/navigation/header.js';
import { MobileMenuManager } from './modules/navigation/mobile-menu.js';
import { CartManager } from './modules/cart/CartManager.js';
import { AnimationManager } from './modules/ui/animations.js';
import { NotificationManager } from './modules/ui/notifications.js';

// Import UI components
import { PromoSlider } from './modules/ui/promo-slider.js';
import { LocationModal } from './modules/ui/location-modal.js';
import { ScrollEffects } from './modules/ui/scroll-effects.js';

// Import menu enhancements (only visual effects, not logic)
import { MenuEnhancements } from './modules/menu/menu-enhancements.js';

// ========== MAIN APPLICATION CLASS ==========
class BurgerClubApp {
    constructor() {
        this.isLoaded = false;
        this.scrollPosition = 0;
        
        // Initialize managers
        this.headerManager = null;
        this.mobileMenuManager = null;
        this.cartManager = null;
        this.animationManager = null;
        this.notificationManager = null;
        
        // Initialize UI components
        this.promoSlider = null;
        this.locationModal = null;
        this.scrollEffects = null;
        this.menuEnhancements = null;
        
        this.init();
    }
    
    async init() {
        try {
            this.showLoader();
            
            // Preload critical images
            await this.preloadCriticalAssets();
            
            // Initialize core managers
            this.initializeManagers();
            
            // Initialize UI components
            await this.initializeComponents();
            
            // Setup global event listeners
            this.setupGlobalEvents();
            
            // Hide loader and show content
            setTimeout(() => {
                this.hideLoader();
                this.triggerInitialAnimations();
                this.isLoaded = true;
                console.log('🍔 Burger Club App initialized successfully!');
            }, ANIMATION_DURATIONS.loader);
            
        } catch (error) {
            console.error('Failed to initialize Burger Club App:', error);
            this.hideLoader();
        }
    }
    
    // ========== INITIALIZATION METHODS ==========
    initializeManagers() {
        this.notificationManager = new NotificationManager();
        this.animationManager = new AnimationManager();
        this.headerManager = new HeaderManager();
        this.mobileMenuManager = new MobileMenuManager();
        this.cartManager = new CartManager();
        
        // Make managers globally available
        window.BurgerClub = {
            app: this,
            cart: this.cartManager,
            notifications: this.notificationManager,
            animations: this.animationManager,
            showNotification: this.notificationManager.show.bind(this.notificationManager),
            smoothScrollTo,
            formatPrice
        };
        
        console.log('🔧 Core managers initialized');
    }
    
    async initializeComponents() {
        // Initialize UI components
        this.promoSlider = new PromoSlider();
        this.locationModal = new LocationModal(this.notificationManager);
        this.scrollEffects = new ScrollEffects();
        
        // Initialize menu enhancements only on menu page
        if (document.getElementById('menuGrid')) {
            this.menuEnhancements = new MenuEnhancements(this.notificationManager);
            console.log('📋 Menu enhancements initialized');
        }
        
        // Initialize counters
        this.initializeCounters();
        
        // Initialize back to top button
        this.initializeBackToTop();
    }
    
    async preloadCriticalAssets() {
        try {
            const results = await preloadImages(CRITICAL_IMAGES);
            const failed = results.filter(result => result.status === 'rejected').length;
            
            if (failed > 0) {
                console.warn(`Failed to preload ${failed} critical images`);
            } else {
                console.log('✅ All critical images preloaded successfully');
            }
        } catch (error) {
            console.warn('Error preloading images:', error);
        }
    }
    
    // ========== LOADER METHODS ==========
    showLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    
    hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('hidden');
            document.body.style.overflow = 'auto';
            
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    }
    
    // ========== COUNTERS ==========
    initializeCounters() {
        const counters = document.querySelectorAll('[data-count]');
        
        counters.forEach(counter => {
            counter.style.opacity = '0';
        });
        
        // Setup intersection observer for counters
        this.setupCounterObserver();
    }
    
    setupCounterObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target.querySelector('[data-count]');
                    if (counter) {
                        this.triggerCounterAnimation(counter);
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, { threshold: 0.3 });
        
        document.querySelectorAll('.stat-item').forEach(item => {
            observer.observe(item);
        });
    }
    
    triggerCounterAnimation(counter) {
        const target = parseInt(counter.dataset.count);
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        counter.style.opacity = '1';
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 16);
    }
    
    // ========== BACK TO TOP ==========
    initializeBackToTop() {
        const backToTop = document.createElement('button');
        backToTop.className = 'back-to-top';
        backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backToTop.setAttribute('aria-label', 'Volver arriba');
        backToTop.setAttribute('title', 'Volver arriba');
        
        document.body.appendChild(backToTop);
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Add click animation
            backToTop.classList.add('animate-pulse');
            setTimeout(() => {
                backToTop.classList.remove('animate-pulse');
            }, 600);
        });
        
        window.addEventListener('scroll', throttle(() => {
            if (window.pageYOffset > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }, 100));
        
        // Add styles for back to top button
        this.addBackToTopStyles();
    }
    
    // ========== GLOBAL EVENT LISTENERS ==========
    setupGlobalEvents() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // ESC to close modals
            if (e.key === 'Escape') {
                // Close any open modals
                const modals = document.querySelectorAll('.cart-modal.active, .location-modal.active');
                modals.forEach(modal => {
                    if (modal.classList.contains('cart-modal')) {
                        this.cartManager.closeCart();
                    } else if (this.locationModal) {
                        this.locationModal.close();
                    }
                });
            }
            
            // Ctrl+Shift+C to open cart (for power users)
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.cartManager.openCart();
            }
        });
        
        // Error handling
        window.addEventListener('error', (e) => {
            console.error('JavaScript Error:', e.error);
            
            if (e.filename && e.filename.includes('burger-club')) {
                this.notificationManager.show('Algo salió mal. Por favor recarga la página.', 'danger');
            }
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled Promise Rejection:', e.reason);
        });
        
        // Performance monitoring
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    console.log(`⚡ Page load time: ${perfData.loadEventEnd - perfData.fetchStart}ms`);
                }, 0);
            });
        }
    }
    
    // ========== INITIAL ANIMATIONS ==========
    triggerInitialAnimations() {
        // Animate logo
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.classList.add('animate-fade-in');
        }
        
        // Animate navigation
        const navItems = document.querySelectorAll('.nav-link');
        navItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('animate-fade-in-up');
            }, index * 100);
        });
        
        // Animate cart button
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            setTimeout(() => {
                cartBtn.classList.add('animate-bounce');
                setTimeout(() => {
                    cartBtn.classList.remove('animate-bounce');
                }, 1000);
            }, 1000);
        }
    }
    
    // ========== UTILITY METHODS ==========
    addBackToTopStyles() {
        if (document.getElementById('back-to-top-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'back-to-top-styles';
        style.textContent = `
            .back-to-top {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: var(--color-cta-stroke);
                color: var(--color-background);
                border: none;
                cursor: pointer;
                font-size: 1.2rem;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transform: translateY(20px) scale(0.8);
                transition: all 0.3s ease;
                box-shadow: var(--box-shadow);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .back-to-top.visible {
                opacity: 1;
                visibility: visible;
                transform: translateY(0) scale(1);
            }
            .back-to-top:hover {
                background: var(--color-white);
                transform: translateY(-5px) scale(1.1);
                box-shadow: var(--box-shadow-hover);
            }
            .back-to-top:active {
                transform: translateY(-2px) scale(1.05);
            }
            @media (max-width: 768px) {
                .back-to-top {
                    bottom: 20px;
                    right: 20px;
                    width: 45px;
                    height: 45px;
                    font-size: 1.1rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========== INITIALIZE APPLICATION ==========
document.addEventListener('DOMContentLoaded', () => {
    new BurgerClubApp();
});

// Export for potential use in other modules
export { BurgerClubApp };