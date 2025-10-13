//burger-club/burgur/src/main/resources/static/js/Modules/ui/promo-slider.js
// ==========================================
// BURGER CLUB - PROMO SLIDER MODULE
// ==========================================

import { PROMO_IMAGES, PROMO_PRODUCTS } from '../../utils/constants.js';

export class PromoSlider {
    constructor() {
        this.currentPromoIndex = this.getInitialActivePromo();
        this.promoInterval = null;
        
        this.init();
    }
    
    getInitialActivePromo() {
        // Buscar el promo-item que tiene la clase 'active'
        const activePromoItem = document.querySelector('.promo-item.active');
        if (activePromoItem) {
            const promoIndex = parseInt(activePromoItem.getAttribute('data-promo'));
            return isNaN(promoIndex) ? 0 : promoIndex;
        }
        
        // Si no hay ninguno activo, buscar el dot activo
        const activeDot = document.querySelector('.promo-dots .dot.active');
        if (activeDot) {
            const dotIndex = parseInt(activeDot.getAttribute('data-dot'));
            return isNaN(dotIndex) ? 0 : dotIndex;
        }
        
        // Fallback al índice 0
        return 0;
    }
    
    init() {
        const promoDots = document.querySelectorAll('.promo-dots .dot');
        const promoItems = document.querySelectorAll('.promo-item');
        
        if (promoDots.length === 0 && promoItems.length === 0) return;
        

        
        // Sincronizar la vista inicial con el índice actual
        this.updatePromoDisplay();
        
        this.setupAutoRotation();
        this.setupEventListeners();
        this.setupKeyboardNavigation();
    }
    
    setupAutoRotation() {
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
    }
    
    setupEventListeners() {
        // Dot click handlers
        const promoDots = document.querySelectorAll('.promo-dots .dot');
        promoDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToPromo(index);
                this.restartAutoRotation();
            });
        });
        
        // Promo item click handlers
        const promoItems = document.querySelectorAll('.promo-item');
        promoItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                // Cambiar a la promoción seleccionada
                this.goToPromo(index);
                this.restartAutoRotation();
            });
            
            // Add hover effect
            item.addEventListener('mouseenter', () => {
                item.classList.add('animate-pulse');
                this.pauseAutoRotation();
            });
            
            item.addEventListener('mouseleave', () => {
                item.classList.remove('animate-pulse');
                this.resumeAutoRotation();
            });
        });
        
        // Hero CTA button handler
        const heroCta = document.getElementById('hero-cta-btn');
        if (heroCta) {
            heroCta.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCurrentProductModal();
            });
        }
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousPromo();
                this.restartAutoRotation();
            } else if (e.key === 'ArrowRight') {
                this.nextPromo();
                this.restartAutoRotation();
            }
        });
    }
    
    nextPromo() {
        const oldIndex = this.currentPromoIndex;
        this.currentPromoIndex = (this.currentPromoIndex + 1) % PROMO_IMAGES.length;
        console.log('🔄 DEBUG - Promo changed from', oldIndex, 'to', this.currentPromoIndex);
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
    
    pauseAutoRotation() {
        if (this.promoInterval) {
            clearInterval(this.promoInterval);
        }
    }
    
    resumeAutoRotation() {
        this.pauseAutoRotation();
        this.promoInterval = setInterval(() => {
            if (!document.hidden) {
                this.nextPromo();
            }
        }, 5000);
    }
    
    restartAutoRotation() {
        this.pauseAutoRotation();
        setTimeout(() => {
            this.resumeAutoRotation();
        }, 8000); // Wait 8 seconds before resuming auto-rotation
    }
    
    redirectToProduct(index) {
        // Obtener el producto correspondiente a la promoción
        const product = PROMO_PRODUCTS[index];
        if (product && product.searchTerm) {
            // Redirigir al menú con búsqueda específica del producto
            window.location.href = `/menu?search=${encodeURIComponent(product.searchTerm)}`;
        } else {
            // Fallback al menú general si no se encuentra el producto
            window.location.href = '/menu';
        }
    }
    
    openCurrentProductModal() {
        // Debug: mostrar información actual
        console.log('🔍 DEBUG - Current promo index:', this.currentPromoIndex);
        console.log('🔍 DEBUG - Available products:', PROMO_PRODUCTS);
        
        // Obtener el producto de la promoción activa
        const currentProduct = PROMO_PRODUCTS[this.currentPromoIndex];
        console.log('🔍 DEBUG - Selected product:', currentProduct);
        
        if (currentProduct && currentProduct.searchTerm) {
            // Redirigir al menú con búsqueda específica y abrir modal
            const searchTerm = encodeURIComponent(currentProduct.searchTerm);
            console.log('🔍 DEBUG - Redirecting with search term:', searchTerm);
            window.location.href = `/menu?nombre=${searchTerm}`;
        } else {
            // Fallback al menú general
            console.log('🔍 DEBUG - No product found, redirecting to general menu');
            window.location.href = '/menu';
        }
    }

    destroy() {
        if (this.promoInterval) {
            clearInterval(this.promoInterval);
        }
    }
}