// ==========================================
// BURGER CLUB - SCROLL EFFECTS MODULE
// ==========================================

import { throttle } from '../../utils/helpers.js';

export class ScrollEffects {
    constructor() {
        this.init();
    }
    
    init() {
        console.log('📜 Scroll effects initialized');
        
        this.initializeScrollAnimations();
        this.initializeIntersectionObserver();
        this.initializeParallax();
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
                    
                    // Add staggered animation delay for multiple elements
                    const siblings = Array.from(entry.target.parentNode.children);
                    const index = siblings.indexOf(entry.target);
                    
                    setTimeout(() => {
                        entry.target.style.transitionDelay = '0s';
                    }, index * 100);
                    
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
        
        this.addScrollAnimationStyles();
    }
    
    // ========== PARALLAX EFFECTS ==========
    initializeParallax() {
        const parallaxElements = document.querySelectorAll('.hero-burger-img, .deco-ellipse-1, .deco-ellipse-2');
        
        if (parallaxElements.length === 0) return;
        
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
    
    // ========== REVEAL ON SCROLL ==========
    revealOnScroll(selector, options = {}) {
        const elements = document.querySelectorAll(selector);
        
        const defaultOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
            animationClass: 'reveal-animated',
            stagger: 100
        };
        
        const config = { ...defaultOptions, ...options };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add(config.animationClass);
                    }, index * config.stagger);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: config.threshold,
            rootMargin: config.rootMargin
        });
        
        elements.forEach(element => {
            observer.observe(element);
        });
    }
    
    // ========== UTILITY METHODS ==========
    addScrollAnimationStyles() {
        if (document.getElementById('scroll-animation-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'scroll-animation-styles';
        style.textContent = `
            .scroll-animate {
                opacity: 0;
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .scroll-animate-fade-in-up {
                transform: translateY(30px);
            }
            
            .scroll-animate-fade-in-left {
                transform: translateX(-30px);
            }
            
            .scroll-animate-fade-in-right {
                transform: translateX(30px);
            }
            
            .scroll-animate-fade-in-down {
                transform: translateY(-30px);
            }
            
            .scroll-animate-scale-up {
                transform: scale(0.8);
            }
            
            .scroll-animate.in-view {
                opacity: 1;
                transform: translateY(0) translateX(0) scale(1);
            }
            
            .reveal-animated {
                opacity: 1;
                transform: translateY(0) translateX(0) scale(1);
            }
            
            /* Improved animations for specific elements */
            .stat-item {
                opacity: 0;
                transform: translateY(20px) scale(0.9);
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .stat-item.in-view {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            
            .feature-item {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .feature-item.in-view {
                opacity: 1;
                transform: translateY(0);
            }
            
            /* Staggered animations */
            .feature-item:nth-child(1) { transition-delay: 0s; }
            .feature-item:nth-child(2) { transition-delay: 0.1s; }
            .feature-item:nth-child(3) { transition-delay: 0.2s; }
            .feature-item:nth-child(4) { transition-delay: 0.3s; }
            
            /* Reduced motion for accessibility */
            @media (prefers-reduced-motion: reduce) {
                .scroll-animate,
                .stat-item,
                .feature-item {
                    transition: opacity 0.3s ease;
                    transform: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
}