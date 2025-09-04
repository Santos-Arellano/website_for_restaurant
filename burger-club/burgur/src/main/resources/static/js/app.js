///Users/santosa/Documents/GitHub/website_for_restaurant/burger-club/burgur/src/main/resources/static/js/app.js
// ==========================================
// BURGER CLUB - MAIN APPLICATION (MODULAR)
// ==========================================

// Dynamic imports for better performance
let modules = {};

// Core utilities - load immediately
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

// Async module loader
async function loadModule(path, exportName = 'default') {
    try {
        const module = await import(path);
        return exportName === 'default' ? module.default : module[exportName];
    } catch (error) {
        console.warn(`Failed to load module ${path}:`, error);
        return null;
    }
}

// Load critical modules first
async function loadCriticalModules() {
    const [HeaderManager, MobileMenuManager, CartManager, NotificationManager] = await Promise.all([
        loadModule('./Modules/navigation/header.js', 'HeaderManager'),
        loadModule('./Modules/navigation/mobile-menu.js', 'MobileMenuManager'),
        loadModule('./Modules/cart/CartManager.js', 'CartManager'),
        loadModule('./Modules/ui/notifications.js', 'NotificationManager')
    ]);
    
    return { HeaderManager, MobileMenuManager, CartManager, NotificationManager };
}

// Load secondary modules
async function loadSecondaryModules() {
    const [AnimationManager, ScrollEffects, SmoothScrollManager, LoadingAnimationsManager, LazyLoadingManager] = await Promise.all([
        loadModule('./Modules/ui/animations.js', 'AnimationManager'),
        loadModule('./Modules/ui/scroll-effects.js', 'ScrollEffects'),
        loadModule('./smooth-scroll.js', 'SmoothScrollManager'),
        loadModule('./components/loading-animations.js', 'LoadingAnimationsManager'),
        loadModule('./components/lazy-loading.js')
    ]);
    
    return { AnimationManager, ScrollEffects, SmoothScrollManager, LoadingAnimationsManager, LazyLoadingManager };
}

// Load optional modules (can be deferred)
async function loadOptionalModules() {
    const [PromoSlider, LocationModal, HeroCarousel, initializeCarouselEffects, TestimonialsManager, ParallaxManager, InteractiveMapManager, NewsletterManager, MenuEnhancements] = await Promise.all([
        loadModule('./Modules/ui/promo-slider.js', 'PromoSlider'),
        loadModule('./Modules/ui/location-modal.js', 'LocationModal'),
loadModule('./hero-carousel.js', 'HeroCarousel'),
        loadModule('./hero-carousel.js', 'initializeCarouselEffects'),
        loadModule('./testimonials.js', 'TestimonialsManager'),
        loadModule('./parallax-effects.js', 'ParallaxManager'),
        loadModule('./interactive-map.js', 'InteractiveMapManager'),
        loadModule('./newsletter.js', 'NewsletterManager'),
        loadModule('./Modules/menu/menu-enhancements.js', 'MenuEnhancements')
    ]);
    
    return { PromoSlider, LocationModal, HeroCarousel, initializeCarouselEffects, TestimonialsManager, ParallaxManager, InteractiveMapManager, NewsletterManager, MenuEnhancements };
}

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
        this.heroCarousel = null;
        this.smoothScrollManager = null;
        this.testimonialsManager = null;

        this.parallaxManager = null;
        this.interactiveMapManager = null;
        this.newsletterManager = null;
        this.loadingAnimationsManager = null;
        this.lazyLoadingManager = null;
        
        this.init();
    }
    
    async init() {
        try {
            this.showLoader();
            
            // Load critical modules first (parallel with asset preloading)
            const [criticalModules] = await Promise.all([
                loadCriticalModules(),
                this.preloadCriticalAssets()
            ]);
            
            // Store critical modules
            modules.critical = criticalModules;
            
            // Initialize critical managers immediately
            this.initializeCriticalManagers(criticalModules);
            
            // Load secondary modules in background
            loadSecondaryModules().then(secondaryModules => {
                modules.secondary = secondaryModules;
                this.initializeSecondaryComponents(secondaryModules);
            });
            
            // Setup global event listeners
            this.setupGlobalEvents();
            
            // Show initial content faster
            setTimeout(() => {
                this.hideLoader();
                this.triggerInitialAnimations();
                this.isLoaded = true;
                console.log('🍔 Burger Club App initialized successfully!');
                
                // Load optional modules after initial render
                this.loadOptionalComponentsDeferred();
            }, 300); // Reduced from ANIMATION_DURATIONS.loader
            
        } catch (error) {
            console.error('Failed to initialize Burger Club App:', error);
            this.hideLoader();
        }
    }
    
    // ========== INITIALIZATION METHODS ==========
    initializeCriticalManagers(criticalModules) {
        const { HeaderManager, MobileMenuManager, CartManager, NotificationManager } = criticalModules;
        
        // Initialize only critical managers for fast initial render
        if (HeaderManager) this.headerManager = new HeaderManager();
        if (MobileMenuManager) this.mobileMenuManager = new MobileMenuManager();
        if (CartManager) this.cartManager = new CartManager();
        if (NotificationManager) this.notificationManager = new NotificationManager();
        
        // Make managers globally available
        window.BurgerClub = {
            app: this,
            cart: this.cartManager,
            notifications: this.notificationManager,
            animations: this.animationManager,
            showNotification: this.notificationManager?.show?.bind(this.notificationManager),
            formatPrice
        };
        
        console.log('🔧 Critical managers initialized');
    }
    
    initializeSecondaryComponents(secondaryModules) {
        const { AnimationManager, ScrollEffects, SmoothScrollManager, LoadingAnimationsManager, LazyLoadingManager } = secondaryModules;
        
        // Initialize secondary components
        if (AnimationManager) this.animationManager = new AnimationManager();
        if (ScrollEffects) this.scrollEffects = new ScrollEffects();
        if (SmoothScrollManager) this.smoothScrollManager = new SmoothScrollManager();
        if (LoadingAnimationsManager) this.loadingAnimationsManager = new LoadingAnimationsManager();
        if (LazyLoadingManager) {
            this.lazyLoadingManager = new LazyLoadingManager({
                enablePerformanceMonitoring: false,
                enableWebP: true,
                enableProgressiveLoading: true
            });
        }
        
        // Update global reference for animations
        if (window.BurgerClub && this.animationManager) {
            window.BurgerClub.animations = this.animationManager;
        }
        
        console.log('🔧 Secondary components initialized');
    }
    
    async loadOptionalComponentsDeferred() {
        try {
            const optionalModules = await loadOptionalModules();
            modules.optional = optionalModules;
            
            const { PromoSlider, LocationModal, HeroCarousel, initializeCarouselEffects, TestimonialsManager, ParallaxManager, InteractiveMapManager, NewsletterManager, MenuEnhancements } = optionalModules;
            
            // Initialize optional components
            if (PromoSlider) this.promoSlider = new PromoSlider();
            if (LocationModal) this.locationModal = new LocationModal(this.notificationManager);
            if (ParallaxManager) this.parallaxManager = new ParallaxManager();
            if (InteractiveMapManager) this.interactiveMapManager = new InteractiveMapManager();
            if (NewsletterManager) this.newsletterManager = new NewsletterManager();
            
            // Initialize page-specific components
            if (HeroCarousel && document.querySelector('.hero-carousel-section')) {
                this.heroCarousel = new HeroCarousel();
                if (initializeCarouselEffects) {
                    initializeCarouselEffects();
                }
                console.log('🎠 Hero carousel initialized');
            }
            
            if (TestimonialsManager && document.querySelector('.testimonials-section')) {
                this.testimonialsManager = new TestimonialsManager();
                console.log('💬 Testimonials manager initialized');
            }
            
            if (MenuEnhancements && document.getElementById('menuGrid')) {
                this.menuEnhancements = new MenuEnhancements(this.notificationManager);
                console.log('📋 Menu enhancements initialized');
            }
            
            // Initialize counters and back to top after optional components
            this.initializeCounters();
            this.initializeBackToTop();
            
            console.log('🔧 Optional components loaded');
        } catch (error) {
            console.warn('Some optional components failed to load:', error);
        }
    }
    
    // This method is now replaced by the new async loading system
    // Components are initialized in initializeCriticalManagers, initializeSecondaryComponents, and loadOptionalComponentsDeferred
    
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
        }, 100), { passive: true });
        
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
                    const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.fetchStart;
                    const firstPaint = performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0;
                    
                    console.log(`⚡ Performance metrics:`);
                    console.log(`  - DOM Content Loaded: ${domContentLoaded}ms`);
                    console.log(`  - First Paint: ${firstPaint}ms`);
                    console.log(`  - Total Load Time: ${loadTime}ms`);
                    
                    // Adjusted threshold for better user experience
                    if (loadTime > 5000) {
                        console.warn('⚠️ Slow page load detected (>5s)');
                    } else if (loadTime > 3000) {
                        console.info('ℹ️ Page load time acceptable but could be improved');
                    } else {
                        console.log('✅ Good page load performance');
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