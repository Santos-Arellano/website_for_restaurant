///Users/santosa/Documents/GitHub/website_for_restaurant/burger-club/burgur/src/main/resources/static/js/app.js
// ==========================================
// BURGER CLUB - MAIN APPLICATION (MODULAR)
// ==========================================

// Import utilities
import { 
    throttle, 
    debounce, 
    preloadImages, 
    formatPrice 
} from './utils/helpers.js';

import { 
    CRITICAL_IMAGES, 
    ANIMATION_DURATIONS, 
    PROMO_IMAGES 
} from './utils/constants.js';

// Import core modules
import { HeaderManager } from './Modules/navigation/header.js';
import { MobileMenuManager } from './Modules/navigation/mobile-menu.js';
import { CartManager } from './Modules/cart/CartManager.js';
import { AnimationManager } from './Modules/ui/animations.js';
import { NotificationManager } from './Modules/ui/notifications.js';

// Import UI components
import { PromoSlider } from './Modules/ui/promo-slider.js';
import { LocationModal } from './Modules/ui/location-modal.js';
import { ScrollEffects } from './Modules/ui/scroll-effects.js';

// Import menu enhancements (only visual effects, not logic)
import { MenuEnhancements } from './Modules/menu/menu-enhancements.js';

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
        if (!counters.length) return;
        
        counters.forEach(counter => {
            counter.style.opacity = '0';
        });
        
        this.setupCounterObserver();
    }
    
    setupCounterObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target.querySelector('[data-count]');
                    if (counter && !counter.dataset.animated) {
                        this.triggerCounterAnimation(counter);
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, { threshold: 0.3, rootMargin: '0px 0px -50px 0px' });
        
        document.querySelectorAll('.stat-item').forEach(item => {
            observer.observe(item);
        });
    }
    
    triggerCounterAnimation(counter) {
        const target = parseInt(counter.dataset.count);
        if (isNaN(target)) return;
        
        counter.dataset.animated = 'true';
        counter.style.opacity = '1';
        
        const duration = 2000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smoother animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(target * easeOutQuart);
            
            counter.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                counter.textContent = target;
            }
        };
        
        requestAnimationFrame(animate);
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
        // Keyboard shortcuts with throttling
        const handleKeydown = throttle((e) => {
            switch (e.key) {
                case 'Escape':
                    this.handleEscapeKey();
                    break;
                case 'C':
                    if (e.ctrlKey && e.shiftKey) {
                        e.preventDefault();
                        this.cartManager?.openCart();
                    }
                    break;
            }
        }, 100);
        
        document.addEventListener('keydown', handleKeydown);
        
        // Optimized error handling
        this.setupErrorHandling();
        
        // Performance monitoring (development only)
        if (window.location.hostname === 'localhost' && 'performance' in window) {
            this.setupPerformanceMonitoring();
        }
    }
    
    handleEscapeKey() {
        const activeModals = document.querySelectorAll('.cart-modal.active, .location-modal.active');
        if (!activeModals.length) return;
        
        activeModals.forEach(modal => {
            if (modal.classList.contains('cart-modal')) {
                this.cartManager?.closeCart();
            } else if (this.locationModal) {
                this.locationModal.close();
            }
        });
    }
    
    setupErrorHandling() {
        let errorCount = 0;
        const maxErrors = 5;
        
        window.addEventListener('error', (e) => {
            console.error('JavaScript Error:', e.error);
            
            if (++errorCount <= maxErrors && e.filename?.includes('burger-club')) {
                this.notificationManager?.show('Algo salió mal. Por favor recarga la página.', 'danger');
            }
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled Promise Rejection:', e.reason);
            e.preventDefault(); // Prevent default browser handling
        });
    }
    
    setupPerformanceMonitoring() {
        window.addEventListener('load', () => {
            requestIdleCallback(() => {
                try {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    const loadTime = perfData.loadEventEnd - perfData.fetchStart;
                    console.log(`⚡ Page load time: ${loadTime}ms`);
                    
                    // Log performance metrics
                    if (loadTime > 3000) {
                        console.warn('⚠️ Slow page load detected');
                    }
                } catch (error) {
                    console.warn('Performance monitoring failed:', error);
                }
            });
        });
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