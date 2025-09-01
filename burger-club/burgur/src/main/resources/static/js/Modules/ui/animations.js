//burger-club/burgur/src/main/resources/static/js/Modules/ui/animations.js
// ==========================================
// BURGER CLUB - ANIMATIONS MODULE
// ==========================================

import { ANIMATION_DURATIONS } from '../../utils/constants.js';

export class AnimationManager {
    constructor() {
        this.animationQueue = [];
        this.isRunning = false;
        
        this.init();
    }
    
    init() {
        this.setupGlobalAnimations();
        this.initializeScrollAnimations();
        
        console.log('🎬 Animation Manager initialized');
    }
    
    setupGlobalAnimations() {
        // Add global CSS for animations if not present
        this.addGlobalAnimationStyles();
    }
    
    initializeScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerScrollAnimation(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe elements with animation attributes
        this.observeAnimationElements();
    }
    
    observeAnimationElements() {
        const animatedElements = document.querySelectorAll('[data-animate]');
        
        animatedElements.forEach(element => {
            const animationType = element.dataset.animate;
            element.classList.add('scroll-animate', `scroll-animate-${animationType}`);
            this.scrollObserver.observe(element);
        });
    }
    
    triggerScrollAnimation(element) {
        element.classList.add('in-view');
        
        // Trigger specific animations based on element type
        if (element.classList.contains('stat-item')) {
            this.animateCounter(element);
        }
        
        if (element.classList.contains('feature-item')) {
            this.animateFeatureItem(element);
        }
        
        // Unobserve after animation
        setTimeout(() => {
            this.scrollObserver.unobserve(element);
        }, 1000);
    }
    
    // ========== ANIMATION METHODS ==========
    
    fadeIn(element, duration = ANIMATION_DURATIONS.normal, delay = 0) {
        return new Promise((resolve) => {
            setTimeout(() => {
                element.style.opacity = '0';
                element.style.transition = `opacity ${duration}ms ease`;
                
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                });
                
                setTimeout(resolve, duration);
            }, delay);
        });
    }
    
    fadeOut(element, duration = ANIMATION_DURATIONS.normal, delay = 0) {
        return new Promise((resolve) => {
            setTimeout(() => {
                element.style.transition = `opacity ${duration}ms ease`;
                element.style.opacity = '0';
                
                setTimeout(() => {
                    element.style.display = 'none';
                    resolve();
                }, duration);
            }, delay);
        });
    }
    
    slideDown(element, duration = ANIMATION_DURATIONS.normal) {
        return new Promise((resolve) => {
            element.style.height = '0';
            element.style.overflow = 'hidden';
            element.style.display = 'block';
            
            const targetHeight = element.scrollHeight + 'px';
            element.style.transition = `height ${duration}ms ease`;
            
            requestAnimationFrame(() => {
                element.style.height = targetHeight;
            });
            
            setTimeout(() => {
                element.style.height = 'auto';
                element.style.overflow = '';
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }
    
    slideUp(element, duration = ANIMATION_DURATIONS.normal) {
        return new Promise((resolve) => {
            element.style.height = element.offsetHeight + 'px';
            element.style.overflow = 'hidden';
            element.style.transition = `height ${duration}ms ease`;
            
            requestAnimationFrame(() => {
                element.style.height = '0';
            });
            
            setTimeout(() => {
                element.style.display = 'none';
                element.style.height = '';
                element.style.overflow = '';
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }
    
    bounce(element, duration = 1000) {
        element.classList.add('animate-bounce');
        
        setTimeout(() => {
            element.classList.remove('animate-bounce');
        }, duration);
    }
    
    pulse(element, duration = 2000) {
        element.classList.add('animate-pulse');
        
        setTimeout(() => {
            element.classList.remove('animate-pulse');
        }, duration);
    }
    
    shake(element, duration = 500) {
        element.classList.add('animate-shake');
        
        setTimeout(() => {
            element.classList.remove('animate-shake');
        }, duration);
    }
    
    // ========== SPECIALIZED ANIMATIONS ==========
    
    animateCounter(statItem) {
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
    
    animateFeatureItem(item) {
        const delay = Array.from(item.parentElement.children).indexOf(item) * 100;
        
        setTimeout(() => {
            item.style.transform = 'translateX(0)';
            item.style.opacity = '1';
        }, delay);
    }
    
    createRippleEffect(element, event) {
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            z-index: 1;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    createFloatingText(element, text, options = {}) {
        const floatingText = document.createElement('div');
        floatingText.className = 'floating-text';
        floatingText.textContent = text;
        
        const rect = element.getBoundingClientRect();
        
        floatingText.style.cssText = `
            position: fixed;
            top: ${rect.top}px;
            left: ${rect.left + rect.width / 2}px;
            transform: translateX(-50%);
            color: ${options.color || 'var(--color-success)'};
            font-weight: bold;
            font-size: ${options.fontSize || '1.2rem'};
            z-index: 1001;
            pointer-events: none;
            animation: floatText 2s ease-out forwards;
        `;
        
        document.body.appendChild(floatingText);
        
        setTimeout(() => {
            floatingText.remove();
        }, 2000);
        
        this.addFloatingTextStyles();
    }
    
    // ========== QUEUE SYSTEM ==========
    
    queueAnimation(animationFunction, delay = 0) {
        this.animationQueue.push({ fn: animationFunction, delay });
        
        if (!this.isRunning) {
            this.processQueue();
        }
    }
    
    async processQueue() {
        this.isRunning = true;
        
        while (this.animationQueue.length > 0) {
            const { fn, delay } = this.animationQueue.shift();
            
            if (delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            await fn();
        }
        
        this.isRunning = false;
    }
    
    clearQueue() {
        this.animationQueue = [];
        this.isRunning = false;
    }
    
    // ========== ENTRANCE ANIMATIONS ==========
    
    animatePageEntrance() {
        const elements = document.querySelectorAll('.animate-on-load');
        
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.6s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    animateNavigation() {
        const navItems = document.querySelectorAll('.nav-link');
        
        navItems.forEach((item, index) => {
            this.queueAnimation(() => {
                return this.fadeIn(item, ANIMATION_DURATIONS.normal);
            }, index * 100);
        });
    }
    
    animateHeroSection() {
        const heroElements = [
            '.hero-subtitle',
            '.hero-title',
            '.hero-tagline',
            '.promotions-content',
            '.hero-image-wrapper'
        ];
        
        heroElements.forEach((selector, index) => {
            const element = document.querySelector(selector);
            if (element) {
                this.queueAnimation(() => {
                    element.classList.add('animate-fade-in-up');
                    return Promise.resolve();
                }, index * 200);
            }
        });
    }
    
    // ========== MODAL ANIMATIONS ==========
    
    showModal(modal, options = {}) {
        const { scale = true, fade = true, duration = ANIMATION_DURATIONS.normal } = options;
        
        modal.style.opacity = fade ? '0' : '1';
        modal.style.visibility = 'visible';
        
        if (scale) {
            const content = modal.querySelector('.modal-content, .cart-modal-content, .location-modal-content');
            if (content) {
                content.style.transform = 'scale(0.9)';
            }
        }
        
        requestAnimationFrame(() => {
            modal.style.transition = `opacity ${duration}ms ease`;
            if (fade) modal.style.opacity = '1';
            
            if (scale) {
                const content = modal.querySelector('.modal-content, .cart-modal-content, .location-modal-content');
                if (content) {
                    content.style.transition = `transform ${duration}ms ease`;
                    content.style.transform = 'scale(1)';
                }
            }
        });
    }
    
    hideModal(modal, options = {}) {
        const { scale = true, fade = true, duration = ANIMATION_DURATIONS.normal } = options;
        
        return new Promise((resolve) => {
            modal.style.transition = `opacity ${duration}ms ease`;
            if (fade) modal.style.opacity = '0';
            
            if (scale) {
                const content = modal.querySelector('.modal-content, .cart-modal-content, .location-modal-content');
                if (content) {
                    content.style.transition = `transform ${duration}ms ease`;
                    content.style.transform = 'scale(0.9)';
                }
            }
            
            setTimeout(() => {
                modal.style.visibility = 'hidden';
                resolve();
            }, duration);
        });
    }
    
    // ========== LOADING ANIMATIONS ==========
    
    showLoadingSpinner(element, options = {}) {
        const { size = '40px', color = 'var(--color-cta-stroke)' } = options;
        
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.style.cssText = `
            width: ${size};
            height: ${size};
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top: 3px solid ${color};
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        `;
        
        element.appendChild(spinner);
        return spinner;
    }
    
    hideLoadingSpinner(spinner) {
        if (spinner && spinner.parentNode) {
            spinner.parentNode.removeChild(spinner);
        }
    }
    
    // ========== STYLE INJECTION ==========
    
    addGlobalAnimationStyles() {
        if (document.getElementById('global-animation-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'global-animation-styles';
        style.textContent = `
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            @keyframes floatText {
                0% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                100% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-50px);
                }
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            .scroll-animate {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s ease;
            }
            
            .scroll-animate.in-view {
                opacity: 1;
                transform: translateY(0);
            }
            
            .scroll-animate-left {
                opacity: 0;
                transform: translateX(-30px);
                transition: all 0.6s ease;
            }
            
            .scroll-animate-left.in-view {
                opacity: 1;
                transform: translateX(0);
            }
            
            .scroll-animate-right {
                opacity: 0;
                transform: translateX(30px);
                transition: all 0.6s ease;
            }
            
            .scroll-animate-right.in-view {
                opacity: 1;
                transform: translateX(0);
            }
            
            .scroll-animate-scale {
                opacity: 0;
                transform: scale(0.8);
                transition: all 0.6s ease;
            }
            
            .scroll-animate-scale.in-view {
                opacity: 1;
                transform: scale(1);
            }
        `;
        document.head.appendChild(style);
    }
    
    addFloatingTextStyles() {
        if (document.getElementById('floating-text-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'floating-text-styles';
        style.textContent = `
            .floating-text {
                user-select: none;
                font-family: var(--font-primary);
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
            }
        `;
        document.head.appendChild(style);
    }
    
    // ========== PUBLIC API ==========
    
    refreshObserver() {
        this.observeAnimationElements();
    }
    
    stopAllAnimations() {
        this.clearQueue();
        
        // Remove all animation classes
        const animatedElements = document.querySelectorAll('[class*="animate-"]');
        animatedElements.forEach(element => {
            element.classList.forEach(className => {
                if (className.startsWith('animate-')) {
                    element.classList.remove(className);
                }
            });
        });
    }
    
    // Utility method to check if animations are supported
    supportsAnimations() {
        return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
}