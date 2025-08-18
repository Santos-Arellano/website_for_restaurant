// ==========================================
// BURGER CLUB - MAIN APPLICATION
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

// Import modules
import { HeaderManager } from './modules/navigation/header.js';
import { MobileMenuManager } from './modules/navigation/mobile-menu.js';
import { CartManager } from './modules/cart/CartManager.js';
import { MenuManager } from './modules/menu/menu-manager.js';
import { AnimationManager } from './modules/ui/animations.js';
import { NotificationManager } from './modules/ui/notifications.js';

// ========== MAIN APPLICATION CLASS ==========
class BurgerClubApp {
    constructor() {
        this.isLoaded = false;
        this.scrollPosition = 0;
        this.currentPromoIndex = 0;
        
        // Initialize managers
        this.headerManager = null;
        this.mobileMenuManager = null;
        this.cartManager = null;
        this.menuManager = null;
        this.animationManager = null;
        this.notificationManager = null;
        
        this.init();
    }
    
    async init() {
        try {
            this.showLoader();
            
            // Preload critical images
            await this.preloadCriticalAssets();
            
            // Initialize core managers
            this.initializeManagers();
            
            // Initialize components
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
        
        // Initialize menu manager only on menu page
        if (document.getElementById('menuGrid')) {
            this.menuManager = new MenuManager();
        }
        
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
    }
    
    async initializeComponents() {
        // Initialize promo slider
        this.initializePromoSlider();
        
        // Initialize location button
        this.initializeLocationButton();
        
        // Initialize scroll animations
        this.initializeScrollAnimations();
        
        // Initialize counters
        this.initializeCounters();
        
        // Initialize parallax effects
        this.initializeParallax();
        
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
    
    // ========== PROMO SLIDER ==========
    initializePromoSlider() {
        const promoDots = document.querySelectorAll('.promo-dots .dot');
        const promoItems = document.querySelectorAll('.promo-item');
        
        if (promoDots.length === 0 && promoItems.length === 0) return;
        
        // Auto-rotate promos every 5 seconds
        this.promoInterval = setInterval(() => {
            if (!document.hidden) {
                this.nextPromo();
            }
        }, 5000);
        
        // Pause on page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                clearInterval(this.promoInterval);
            } else {
                this.promoInterval = setInterval(() => {
                    this.nextPromo();
                }, 5000);
            }
        });
        
        // Dot click handlers
        promoDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToPromo(index);
                clearInterval(this.promoInterval);
            });
        });
        
        // Promo item click handlers
        promoItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.goToPromo(index);
                clearInterval(this.promoInterval);
            });
            
            // Add hover effect
            item.addEventListener('mouseenter', () => {
                item.classList.add('animate-pulse');
            });
            
            item.addEventListener('mouseleave', () => {
                item.classList.remove('animate-pulse');
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousPromo();
                clearInterval(this.promoInterval);
            } else if (e.key === 'ArrowRight') {
                this.nextPromo();
                clearInterval(this.promoInterval);
            }
        });
    }
    
    nextPromo() {
        this.currentPromoIndex = (this.currentPromoIndex + 1) % PROMO_IMAGES.length;
        this.updatePromoDisplay();
    }
    
    previousPromo() {
        this.currentPromoIndex = (this.currentPromoIndex - 1 + PROMO_IMAGES.length) % PROMO_IMAGES.length;
        this.updatePromoDisplay();
    }
    
    goToPromo(index) {
        this.currentPromoIndex = index;
        this.updatePromoDisplay();
    }
    
    updatePromoDisplay() {
        const promoDots = document.querySelectorAll('.promo-dots .dot');
        const promoItems = document.querySelectorAll('.promo-item');
        const heroImage = document.querySelector('.hero-burger-img');
        
        // Update dots
        promoDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentPromoIndex);
        });
        
        // Update promo items
        promoItems.forEach((item, index) => {
            item.classList.toggle('active', index === this.currentPromoIndex);
        });
        
        // Update hero image with smooth animation
        if (heroImage && PROMO_IMAGES[this.currentPromoIndex]) {
            heroImage.style.opacity = '0.7';
            heroImage.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                heroImage.src = PROMO_IMAGES[this.currentPromoIndex];
                heroImage.style.opacity = '1';
                heroImage.style.transform = 'scale(1)';
            }, 200);
        }
        
        // Trigger animation for active elements
        const activePromoItem = document.querySelector('.promo-item.active');
        if (activePromoItem) {
            activePromoItem.classList.add('animate-bounce');
            setTimeout(() => {
                activePromoItem.classList.remove('animate-bounce');
            }, 1000);
        }
    }
    
    // ========== LOCATION BUTTON ==========
    initializeLocationButton() {
        const locationBtn = document.getElementById('locationBtn');
        
        if (locationBtn) {
            locationBtn.addEventListener('click', () => {
                this.showLocationModal();
            });
        }
    }
    
    showLocationModal() {
        const modal = document.createElement('div');
        modal.className = 'location-modal';
        modal.innerHTML = `
            <div class="location-modal-content">
                <div class="location-modal-header">
                    <h3>🍔 Burger Club</h3>
                    <button class="location-close" aria-label="Cerrar modal">&times;</button>
                </div>
                <div class="location-modal-body">
                    <div class="location-info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <strong>Dirección:</strong>
                            <p>Carrera 13 #85-32, Bogotá, Colombia</p>
                        </div>
                    </div>
                    
                    <div class="location-info-item">
                        <i class="fas fa-phone"></i>
                        <div>
                            <strong>Teléfono:</strong>
                            <p>+57 123 456 7890</p>
                        </div>
                    </div>
                    
                    <div class="location-info-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <strong>Horarios:</strong>
                            <p>Lun - Dom: 11:00 AM - 11:00 PM</p>
                        </div>
                    </div>
                    
                    <div class="location-info-item">
                        <i class="fas fa-motorcycle"></i>
                        <div>
                            <strong>Delivery:</strong>
                            <p>Tiempo estimado: 25-35 minutos</p>
                        </div>
                    </div>
                    
                    <div class="location-actions">
                        <button class="btn-location" onclick="window.BurgerClub.app.openMaps()">
                            <i class="fas fa-directions"></i>
                            Ver en Maps
                        </button>
                        <button class="btn-call" onclick="window.BurgerClub.app.makeCall()">
                            <i class="fas fa-phone"></i>
                            Llamar
                        </button>
                        <button class="btn-whatsapp" onclick="window.BurgerClub.app.openWhatsApp()">
                            <i class="fab fa-whatsapp"></i>
                            WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        const closeBtn = modal.querySelector('.location-close');
        closeBtn.addEventListener('click', () => {
            this.closeLocationModal(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeLocationModal(modal);
            }
        });
        
        // Escape key handler
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeLocationModal(modal);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Add styles if not exists
        this.addLocationModalStyles();
    }
    
    closeLocationModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 300);
    }
    
    openMaps() {
        const address = 'Carrera 13 #85-32, Bogotá, Colombia';
        const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
        window.open(mapsUrl, '_blank');
        this.notificationManager.show('Abriendo Google Maps...', 'info');
    }
    
    makeCall() {
        window.open('tel:+571234567890');
        this.notificationManager.show('Iniciando llamada...', 'info');
    }
    
    openWhatsApp() {
        const message = encodeURIComponent('¡Hola! Me gustaría hacer un pedido en Burger Club 🍔');
        window.open(`https://wa.me/571234567890?text=${message}`, '_blank');
        this.notificationManager.show('Abriendo WhatsApp...', 'info');
    }
    
    // ========== SCROLL ANIMATIONS ==========
    initializeScrollAnimations() {
        const animatedElements = document.querySelectorAll('[data-animate]');
        
        animatedElements.forEach(element => {
            const animationType = element.dataset.animate;
            element.classList.add('scroll-animate');
            
            if (animationType) {
                element.classList.add(`scroll-animate-${animationType}`);
            }
        });
        
        this.initializeIntersectionObserver();
    }
    
    initializeIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    
                    // Trigger specific animations based on element type
                    if (entry.target.classList.contains('stat-item')) {
                        this.triggerCounterAnimation(entry.target);
                    }
                    
                    // Unobserve after animation
                    setTimeout(() => {
                        observer.unobserve(entry.target);
                    }, 1000);
                }
            });
        }, observerOptions);
        
        const elementsToAnimate = document.querySelectorAll('.scroll-animate, [data-animate], .stat-item, .feature-item');
        elementsToAnimate.forEach(element => {
            observer.observe(element);
        });
    }
    
    // ========== COUNTERS ==========
    initializeCounters() {
        const counters = document.querySelectorAll('[data-count]');
        
        counters.forEach(counter => {
            counter.style.opacity = '0';
        });
    }
    
    triggerCounterAnimation(statItem) {
        const counter = statItem.querySelector('[data-count]');
        if (!counter) return;
        
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
    
    // ========== PARALLAX EFFECTS ==========
    initializeParallax() {
        const parallaxElements = document.querySelectorAll('.hero-burger-img, .deco-ellipse-1, .deco-ellipse-2');
        
        window.addEventListener('scroll', throttle(() => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach((element, index) => {
                const rate = scrolled * (0.1 + index * 0.05);
                const direction = index % 2 === 0 ? -1 : 1;
                
                if (element.classList.contains('hero-burger-img')) {
                    element.style.transform = `translateY(${rate * direction * 0.3}px)`;
                } else {
                    element.style.transform = `translateY(${rate * direction}px)`;
                }
            });
        }, 10));
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
                    } else {
                        this.closeLocationModal(modal);
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
    addLocationModalStyles() {
        if (document.getElementById('location-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'location-modal-styles';
        style.textContent = `
            .location-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 2000;
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                backdrop-filter: blur(5px);
            }
            .location-modal.active {
                opacity: 1;
                visibility: visible;
            }
            .location-modal-content {
                background: var(--color-background);
                border-radius: var(--border-radius);
                width: 90%;
                max-width: 500px;
                border: 2px solid var(--color-cta-stroke);
                transform: scale(0.9);
                transition: transform 0.3s ease;
                box-shadow: var(--box-shadow-hover);
                overflow: hidden;
            }
            .location-modal.active .location-modal-content {
                transform: scale(1);
            }
            .location-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 25px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(255, 255, 255, 0.05);
            }
            .location-modal-header h3 {
                color: var(--color-text-primary);
                margin: 0;
                font-size: 1.5rem;
            }
            .location-close {
                background: none;
                border: none;
                font-size: 2rem;
                color: var(--color-text-primary);
                cursor: pointer;
                transition: all 0.3s ease;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }
            .location-close:hover {
                color: var(--color-danger);
                background: rgba(244, 67, 54, 0.1);
                transform: scale(1.1);
            }
            .location-modal-body {
                padding: 25px;
            }
            .location-info-item {
                display: flex;
                align-items: flex-start;
                gap: 15px;
                margin-bottom: 20px;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: var(--border-radius-small);
                border-left: 4px solid var(--color-cta-stroke);
            }
            .location-info-item i {
                color: var(--color-cta-stroke);
                font-size: 1.2rem;
                width: 20px;
                text-align: center;
                margin-top: 2px;
            }
            .location-info-item strong {
                color: var(--color-text-primary);
                display: block;
                margin-bottom: 5px;
            }
            .location-info-item p {
                color: var(--color-text-secondary);
                margin: 0;
                line-height: 1.4;
            }
            .location-actions {
                display: flex;
                gap: 10px;
                margin-top: 25px;
                flex-wrap: wrap;
            }
            .btn-location,
            .btn-call,
            .btn-whatsapp {
                flex: 1;
                min-width: 120px;
                padding: 12px 15px;
                border: none;
                border-radius: var(--border-radius-small);
                cursor: pointer;
                font-family: var(--font-primary);
                font-weight: 600;
                font-size: 0.9rem;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            .btn-location {
                background: var(--color-cta-stroke);
                color: var(--color-background);
            }
            .btn-location:hover {
                background: var(--color-white);
                transform: translateY(-2px);
            }
            .btn-call {
                background: var(--color-info);
                color: var(--color-white);
            }
            .btn-call:hover {
                background: #1976D2;
                transform: translateY(-2px);
            }
            .btn-whatsapp {
                background: #25D366;
                color: var(--color-white);
            }
            .btn-whatsapp:hover {
                background: #128C7E;
                transform: translateY(-2px);
            }
            @media (max-width: 768px) {
                .location-modal-content {
                    width: 95%;
                    margin: 20px;
                }
                .location-modal-header,
                .location-modal-body {
                    padding: 20px;
                }
                .location-actions {
                    flex-direction: column;
                }
                .btn-location,
                .btn-call,
                .btn-whatsapp {
                    flex: none;
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
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