//burger-club/burgur/src/main/resources/static/js/Modules/ui/promo-slider.js
// ==========================================
// BURGER CLUB - PROMO SLIDER MODULE
// ==========================================

import { PROMO_IMAGES } from '../../utils/constants.js';

export class PromoSlider {
    constructor() {
        this.currentPromoIndex = 0;
        this.promoInterval = null;
        
        this.init();
    }
    
    init() {
        const promoDots = document.querySelectorAll('.promo-dots .dot');
        const promoItems = document.querySelectorAll('.promo-item');
        
        if (promoDots.length === 0 && promoItems.length === 0) return;
        
        console.log('🎬 Promo slider initialized');
        
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
    
    destroy() {
        if (this.promoInterval) {
            clearInterval(this.promoInterval);
        }
    }
}