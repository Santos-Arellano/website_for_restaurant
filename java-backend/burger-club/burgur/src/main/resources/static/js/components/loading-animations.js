/**
 * Loading Animations Manager
 * Handles page loading states, transitions, and animations
 */

class LoadingAnimationsManager {
    constructor() {
        this.isLoading = false;
        this.loadingElements = new Map();
        this.transitionInProgress = false;
        this.loadingQueue = [];
        this.observers = new Map();
        
        this.init();
    }

    init() {
        // Removed automatic page loader creation
        this.setupImageLazyLoading();
        this.setupFormLoadingStates();
        this.setupPageTransitions();
        this.setupIntersectionObservers();
        this.bindEvents();
        
        console.log('LoadingAnimationsManager initialized');
    }

    // Page Loader Management
    createPageLoader() {
        if (document.querySelector('.page-loader')) return;

        const loader = document.createElement('div');
        loader.className = 'page-loader';
        loader.innerHTML = `
            <div class="burger-loader">
                <div class="burger-layer"></div>
                <div class="burger-layer"></div>
                <div class="burger-layer"></div>
            </div>
            <div class="loader-spinner"></div>
            <div class="loader-text">Cargando Burger Club</div>
            <div class="loader-subtext">Preparando la mejor experiencia...</div>
            <div class="loader-progress">
                <div class="loader-progress-bar"></div>
            </div>
        `;
        
        document.body.appendChild(loader);
        return loader;
    }

    showPageLoader(text = 'Cargando...', subtext = '') {
        const loader = document.querySelector('.page-loader') || this.createPageLoader();
        const textElement = loader.querySelector('.loader-text');
        const subtextElement = loader.querySelector('.loader-subtext');
        
        if (textElement) textElement.textContent = text;
        if (subtextElement) subtextElement.textContent = subtext;
        
        loader.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        this.isLoading = true;
    }

    hidePageLoader() {
        const loader = document.querySelector('.page-loader');
        if (!loader) return;

        // Delay to ensure smooth transition
        setTimeout(() => {
            loader.classList.add('hidden');
            document.body.style.overflow = '';
            this.isLoading = false;
            
            // Remove after animation
            setTimeout(() => {
                if (loader.classList.contains('hidden')) {
                    loader.remove();
                }
            }, 500);
        }, 100);
    }

    // Content Loading States
    showContentLoading(element, type = 'shimmer') {
        if (!element) return;
        
        const loadingId = this.generateLoadingId();
        this.loadingElements.set(loadingId, element);
        
        switch (type) {
            case 'shimmer':
                element.classList.add('content-loading');
                break;
            case 'skeleton':
                this.createSkeletonLoader(element);
                break;
            case 'pulse':
                element.classList.add('pulse-loading');
                break;
        }
        
        return loadingId;
    }

    hideContentLoading(loadingId) {
        const element = this.loadingElements.get(loadingId);
        if (!element) return;
        
        element.classList.remove('content-loading', 'pulse-loading');
        
        // Remove skeleton if present
        const skeleton = element.querySelector('.skeleton-container');
        if (skeleton) {
            skeleton.remove();
        }
        
        this.loadingElements.delete(loadingId);
    }

    createSkeletonLoader(container) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-container';
        
        // Determine skeleton type based on container
        if (container.classList.contains('card') || container.tagName === 'ARTICLE') {
            skeleton.innerHTML = `
                <div class="skeleton skeleton-card"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
            `;
        } else if (container.classList.contains('profile') || container.classList.contains('user')) {
            skeleton.innerHTML = `
                <div class="skeleton skeleton-avatar"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
            `;
        } else {
            skeleton.innerHTML = `
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
            `;
        }
        
        container.appendChild(skeleton);
    }

    // Button Loading States
    setButtonLoading(button, loading = true) {
        if (!button) return;
        
        if (loading) {
            button.classList.add('btn-loading');
            button.disabled = true;
            button.setAttribute('data-original-text', button.textContent);
        } else {
            button.classList.remove('btn-loading');
            button.disabled = false;
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.textContent = originalText;
                button.removeAttribute('data-original-text');
            }
        }
    }

    // Image Loading
    setupImageLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    imageObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        images.forEach(img => {
            img.parentElement?.classList.add('image-loading');
            imageObserver.observe(img);
        });
        
        this.observers.set('images', imageObserver);
    }

    loadImage(img) {
        const container = img.parentElement;
        const src = img.getAttribute('data-src');
        
        if (!src) return;
        
        img.onload = () => {
            container?.classList.add('loaded');
            img.removeAttribute('data-src');
        };
        
        img.onerror = () => {
            container?.classList.add('loaded');
            img.src = '/images/placeholder.jpg'; // Fallback image
        };
        
        img.src = src;
    }

    // Form Loading States
    setupFormLoadingStates() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (!form.matches('form')) return;
            
            const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
            if (submitBtn) {
                this.setButtonLoading(submitBtn, true);
                
                // Auto-remove loading state after timeout
                setTimeout(() => {
                    this.setButtonLoading(submitBtn, false);
                }, 5000);
            }
        });
    }

    // Page Transitions
    setupPageTransitions() {
        // Create transition overlay
        const overlay = document.createElement('div');
        overlay.className = 'page-transition';
        overlay.innerHTML = `
            <div class="page-transition-content">
                <div class="page-transition-spinner"></div>
                <div>Cargando página...</div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Handle navigation links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link || link.getAttribute('href').startsWith('#') || 
                link.getAttribute('href').startsWith('mailto:') ||
                link.getAttribute('href').startsWith('tel:') ||
                link.target === '_blank') {
                return;
            }
            
            e.preventDefault();
            this.transitionToPage(link.href);
        });
    }

    transitionToPage(url) {
        if (this.transitionInProgress) return;
        
        this.transitionInProgress = true;
        const overlay = document.querySelector('.page-transition');
        
        overlay.classList.add('active');
        
        setTimeout(() => {
            window.location.href = url;
        }, 400);
    }

    // Intersection Observers for Animations
    setupIntersectionObservers() {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-enter-active');
                    animationObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '20px'
        });
        
        // Observe elements that should animate on scroll
        const animateElements = document.querySelectorAll(
            '.card, .feature-item, .testimonial-item, .menu-item, .stat-item'
        );
        
        animateElements.forEach(el => {
            el.classList.add('fade-enter');
            animationObserver.observe(el);
        });
        
        this.observers.set('animations', animationObserver);
    }

    // Loading Queue Management
    addToLoadingQueue(task) {
        return new Promise((resolve, reject) => {
            this.loadingQueue.push({ task, resolve, reject });
            this.processLoadingQueue();
        });
    }

    async processLoadingQueue() {
        if (this.loadingQueue.length === 0) return;
        
        const { task, resolve, reject } = this.loadingQueue.shift();
        
        try {
            const result = await task();
            resolve(result);
        } catch (error) {
            reject(error);
        }
        
        // Process next item
        setTimeout(() => this.processLoadingQueue(), 100);
    }

    // Utility Methods
    generateLoadingId() {
        return `loading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    showLoadingDots(container, count = 3) {
        if (!container) return;
        
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'loading-dots';
        
        for (let i = 0; i < count; i++) {
            const dot = document.createElement('div');
            dot.className = 'loading-dot';
            dotsContainer.appendChild(dot);
        }
        
        container.appendChild(dotsContainer);
        return dotsContainer;
    }

    // Event Handlers
    bindEvents() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
        
        // Handle window focus
        window.addEventListener('focus', () => {
            this.resumeAnimations();
        });
        
        window.addEventListener('blur', () => {
            this.pauseAnimations();
        });
        
        // Handle page load completion
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.hidePageLoader();
            }, 500);
        });
        
        // Removed beforeunload event to avoid unwanted loading animation
    }

    pauseAnimations() {
        document.body.classList.add('animations-paused');
    }

    resumeAnimations() {
        document.body.classList.remove('animations-paused');
    }

    // Public API Methods
    async simulateLoading(duration = 2000, callback = null) {
        this.showPageLoader('Procesando...', 'Por favor espere...');
        
        return new Promise((resolve) => {
            setTimeout(async () => {
                if (callback && typeof callback === 'function') {
                    await callback();
                }
                this.hidePageLoader();
                resolve();
            }, duration);
        });
    }

    createCustomLoader(container, options = {}) {
        const {
            type = 'spinner',
            size = 'medium',
            color = 'primary',
            text = ''
        } = options;
        
        const loader = document.createElement('div');
        loader.className = `custom-loader loader-${type} loader-${size} loader-${color}`;
        
        if (type === 'spinner') {
            loader.innerHTML = '<div class="spinner"></div>';
        } else if (type === 'dots') {
            loader.appendChild(this.showLoadingDots(document.createElement('div')));
        } else if (type === 'pulse') {
            loader.innerHTML = '<div class="pulse-indicator"></div>';
        }
        
        if (text) {
            const textElement = document.createElement('div');
            textElement.className = 'loader-text';
            textElement.textContent = text;
            loader.appendChild(textElement);
        }
        
        container.appendChild(loader);
        return loader;
    }

    // Cleanup
    destroy() {
        // Clear all observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        
        // Clear loading elements
        this.loadingElements.clear();
        
        // Remove page loader
        const loader = document.querySelector('.page-loader');
        if (loader) loader.remove();
        
        // Remove transition overlay
        const overlay = document.querySelector('.page-transition');
        if (overlay) overlay.remove();
        
        console.log('LoadingAnimationsManager destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingAnimationsManager;
} else {
    window.LoadingAnimationsManager = LoadingAnimationsManager;
}

// ES6 export for modern imports
export { LoadingAnimationsManager };