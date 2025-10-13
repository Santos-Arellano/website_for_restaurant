/**
 * Lazy Loading Manager
 * Advanced image lazy loading and performance optimization
 */

class LazyLoadingManager {
    constructor(options = {}) {
        this.options = {
            rootMargin: '50px',
            threshold: 0.1,
            enableWebP: true,
            enableProgressiveLoading: true,
            enablePerformanceMonitoring: false,
            retryAttempts: 3,
            retryDelay: 1000,
            fadeInDuration: 600,
            ...options
        };
        
        this.observers = new Map();
        this.loadedImages = new Set();
        this.failedImages = new Set();
        this.performanceMetrics = {
            totalImages: 0,
            loadedImages: 0,
            failedImages: 0,
            averageLoadTime: 0,
            totalLoadTime: 0
        };
        
        this.init();
    }

    init() {
        this.detectWebPSupport();
        this.setupIntersectionObserver();
        this.setupImageObservers();
        this.setupPerformanceMonitoring();
        this.bindEvents();
        
        console.log('LazyLoadingManager initialized');
    }

    // WebP Support Detection
    detectWebPSupport() {
        if (!this.options.enableWebP) return;
        
        const webP = new Image();
        webP.onload = webP.onerror = () => {
            const hasWebP = webP.height === 2;
            document.documentElement.classList.toggle('webp', hasWebP);
            document.documentElement.classList.toggle('no-webp', !hasWebP);
            console.log(`WebP support: ${hasWebP ? 'enabled' : 'disabled'}`);
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    }

    // Intersection Observer Setup
    setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: this.options.rootMargin,
            threshold: this.options.threshold
        };

        // Main lazy loading observer
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    lazyObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Animation observer for content
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    animationObserver.unobserve(entry.target);
                }
            });
        }, { ...observerOptions, rootMargin: '20px' });

        this.observers.set('lazy', lazyObserver);
        this.observers.set('animation', animationObserver);
    }

    // Setup Image Observers
    setupImageObservers() {
        // Observe lazy images
        const lazyImages = document.querySelectorAll('img[data-src], img[data-lazy]');
        const lazyObserver = this.observers.get('lazy');
        
        lazyImages.forEach(img => {
            this.prepareImage(img);
            lazyObserver.observe(img);
            this.performanceMetrics.totalImages++;
        });

        // Observe elements for animation
        const animateElements = document.querySelectorAll('.observe-lazy');
        const animationObserver = this.observers.get('animation');
        
        animateElements.forEach(el => {
            animationObserver.observe(el);
        });

        console.log(`Observing ${lazyImages.length} lazy images and ${animateElements.length} animated elements`);
    }

    // Prepare Image for Lazy Loading
    prepareImage(img) {
        const container = img.parentElement;
        
        // Add loading class
        img.classList.add('lazy-image', 'loading');
        container?.classList.add('lazy-container', 'loading');
        
        // Create placeholder if needed
        if (!container?.querySelector('.image-placeholder')) {
            this.createImagePlaceholder(container || img.parentElement);
        }
        
        // Add loading spinner
        this.addLoadingSpinner(container || img.parentElement);
        
        // Set up progressive loading if enabled
        if (this.options.enableProgressiveLoading) {
            this.setupProgressiveLoading(img);
        }
    }

    // Create Image Placeholder
    createImagePlaceholder(container) {
        if (!container || container.querySelector('.image-placeholder')) return;
        
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.setAttribute('aria-label', 'Cargando imagen...');
        
        container.appendChild(placeholder);
    }

    // Add Loading Spinner
    addLoadingSpinner(container) {
        if (!container || container.querySelector('.image-spinner')) return;
        
        const spinner = document.createElement('div');
        spinner.className = 'image-spinner';
        spinner.setAttribute('aria-label', 'Cargando...');
        
        container.appendChild(spinner);
    }

    // Setup Progressive Loading
    setupProgressiveLoading(img) {
        const lowQualitySrc = img.getAttribute('data-lqip');
        if (!lowQualitySrc) return;
        
        const lqip = document.createElement('img');
        lqip.className = 'lqip';
        lqip.src = lowQualitySrc;
        lqip.alt = img.alt || '';
        
        img.parentElement?.insertBefore(lqip, img);
    }

    // Load Image
    async loadImage(img) {
        const startTime = performance.now();
        const src = img.getAttribute('data-src') || img.getAttribute('data-lazy');
        const container = img.parentElement;
        
        if (!src || this.loadedImages.has(img)) return;
        
        try {
            // Determine best image source
            const optimizedSrc = this.getOptimizedImageSrc(src, img);
            
            // Load image with retry logic
            await this.loadImageWithRetry(img, optimizedSrc);
            
            // Handle successful load
            this.handleImageLoad(img, container, startTime);
            
        } catch (error) {
            // Handle failed load
            this.handleImageError(img, container, error);
        }
    }

    // Get Optimized Image Source
    getOptimizedImageSrc(src, img) {
        // Check for WebP support and alternative sources
        if (document.documentElement.classList.contains('webp')) {
            const webpSrc = img.getAttribute('data-webp');
            if (webpSrc) return webpSrc;
            
            // Auto-convert to WebP if supported
            if (src.match(/\.(jpg|jpeg|png)$/i)) {
                return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            }
        }
        
        // Return responsive image based on viewport
        const viewport = this.getViewportSize();
        const responsiveSrc = this.getResponsiveImageSrc(src, viewport, img);
        
        return responsiveSrc || src;
    }

    // Get Responsive Image Source
    getResponsiveImageSrc(src, viewport, img) {
        const srcset = img.getAttribute('data-srcset');
        if (!srcset) return null;
        
        const sources = srcset.split(',').map(s => {
            const [url, descriptor] = s.trim().split(' ');
            const width = parseInt(descriptor?.replace('w', '')) || 0;
            return { url, width };
        });
        
        // Find best match for current viewport
        const bestMatch = sources
            .filter(s => s.width <= viewport.width)
            .sort((a, b) => b.width - a.width)[0];
        
        return bestMatch?.url || src;
    }

    // Load Image with Retry Logic
    loadImageWithRetry(img, src, attempt = 1) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            
            image.onload = () => {
                img.src = src;
                resolve(image);
            };
            
            image.onerror = () => {
                if (attempt < this.options.retryAttempts) {
                    setTimeout(() => {
                        this.loadImageWithRetry(img, src, attempt + 1)
                            .then(resolve)
                            .catch(reject);
                    }, this.options.retryDelay * attempt);
                } else {
                    reject(new Error(`Failed to load image after ${attempt} attempts`));
                }
            };
            
            image.src = src;
        });
    }

    // Handle Successful Image Load
    handleImageLoad(img, container, startTime) {
        const loadTime = performance.now() - startTime;
        
        // Update classes
        img.classList.remove('loading');
        img.classList.add('loaded');
        container?.classList.remove('loading');
        container?.classList.add('loaded');
        
        // Remove loading elements
        this.removeLoadingElements(container);
        
        // Handle LQIP fade out
        const lqip = container?.querySelector('.lqip');
        if (lqip) {
            lqip.classList.add('fade-out');
            setTimeout(() => lqip.remove(), this.options.fadeInDuration);
        }
        
        // Update performance metrics
        this.updatePerformanceMetrics(loadTime, true);
        
        // Mark as loaded
        this.loadedImages.add(img);
        
        // Remove data attributes
        img.removeAttribute('data-src');
        img.removeAttribute('data-lazy');
        
        // Trigger custom event
        this.dispatchImageEvent(img, 'imageLoaded', { loadTime });
        
        console.log(`Image loaded in ${loadTime.toFixed(2)}ms:`, img.src);
    }

    // Handle Image Load Error
    handleImageError(img, container, error) {
        // Update classes
        img.classList.remove('loading');
        img.classList.add('error');
        container?.classList.remove('loading');
        container?.classList.add('error');
        
        // Remove loading elements
        this.removeLoadingElements(container);
        
        // Create error placeholder
        this.createErrorPlaceholder(container, img);
        
        // Update performance metrics
        this.updatePerformanceMetrics(0, false);
        
        // Mark as failed
        this.failedImages.add(img);
        
        // Trigger custom event
        this.dispatchImageEvent(img, 'imageError', { error: error.message });
        
        console.warn('Failed to load image:', img.getAttribute('data-src'), error);
    }

    // Remove Loading Elements
    removeLoadingElements(container) {
        if (!container) return;
        
        const placeholder = container.querySelector('.image-placeholder');
        const spinner = container.querySelector('.image-spinner');
        
        if (placeholder) {
            placeholder.style.opacity = '0';
            setTimeout(() => placeholder.remove(), 300);
        }
        
        if (spinner) {
            spinner.style.opacity = '0';
            setTimeout(() => spinner.remove(), 300);
        }
    }

    // Create Error Placeholder
    createErrorPlaceholder(container, img) {
        if (!container) return;
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'image-error';
        errorDiv.setAttribute('aria-label', 'Error al cargar imagen');
        
        // Try to load fallback image
        const fallback = img.getAttribute('data-fallback');
        if (fallback) {
            const fallbackImg = document.createElement('img');
            fallbackImg.src = fallback;
            fallbackImg.alt = img.alt || 'Imagen de respaldo';
            fallbackImg.style.maxWidth = '100%';
            fallbackImg.style.height = 'auto';
            errorDiv.appendChild(fallbackImg);
        }
        
        container.appendChild(errorDiv);
    }

    // Performance Monitoring
    setupPerformanceMonitoring() {
        if (!this.options.enablePerformanceMonitoring) return;
        
        const monitor = document.createElement('div');
        monitor.className = 'perf-monitor';
        monitor.id = 'lazy-perf-monitor';
        document.body.appendChild(monitor);
        
        // Update monitor every 5 seconds to reduce main thread blocking
        this.performanceInterval = setInterval(() => {
            this.updatePerformanceMonitor();
        }, 5000);
    }

    // Update Performance Metrics
    updatePerformanceMetrics(loadTime, success) {
        if (success) {
            this.performanceMetrics.loadedImages++;
            this.performanceMetrics.totalLoadTime += loadTime;
            this.performanceMetrics.averageLoadTime = 
                this.performanceMetrics.totalLoadTime / this.performanceMetrics.loadedImages;
        } else {
            this.performanceMetrics.failedImages++;
        }
    }

    // Update Performance Monitor
    updatePerformanceMonitor() {
        const monitor = document.getElementById('lazy-perf-monitor');
        if (!monitor) return;
        
        const { totalImages, loadedImages, failedImages, averageLoadTime } = this.performanceMetrics;
        const loadingProgress = ((loadedImages + failedImages) / totalImages * 100).toFixed(1);
        
        monitor.innerHTML = `
            <div>Images: ${loadedImages}/${totalImages} (${loadingProgress}%)</div>
            <div>Failed: ${failedImages}</div>
            <div>Avg Load: ${averageLoadTime.toFixed(0)}ms</div>
            <div>Memory: ${this.getMemoryUsage()}</div>
        `;
        
        monitor.classList.toggle('show', totalImages > 0);
    }

    // Get Memory Usage
    getMemoryUsage() {
        if (performance.memory) {
            const used = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
            return `${used}MB`;
        }
        return 'N/A';
    }

    // Utility Methods
    getViewportSize() {
        return {
            width: window.innerWidth || document.documentElement.clientWidth,
            height: window.innerHeight || document.documentElement.clientHeight
        };
    }

    dispatchImageEvent(img, eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: { image: img, ...detail },
            bubbles: true
        });
        img.dispatchEvent(event);
    }

    // Public API Methods
    loadImagesInContainer(container) {
        const images = container.querySelectorAll('img[data-src], img[data-lazy]');
        const lazyObserver = this.observers.get('lazy');
        
        images.forEach(img => {
            if (!this.loadedImages.has(img)) {
                this.prepareImage(img);
                lazyObserver.observe(img);
                this.performanceMetrics.totalImages++;
            }
        });
        
        console.log(`Added ${images.length} new images to lazy loading`);
    }

    forceLoadImage(img) {
        if (this.loadedImages.has(img)) return;
        
        const lazyObserver = this.observers.get('lazy');
        lazyObserver.unobserve(img);
        this.loadImage(img);
    }

    preloadImages(urls) {
        return Promise.all(urls.map(url => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = url;
            });
        }));
    }

    // Event Handlers
    bindEvents() {
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseLoading();
            } else {
                this.resumeLoading();
            }
        });
        
        // Handle connection change
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.handleConnectionChange();
            });
        }
        
        // Handle resize for responsive images
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }

    pauseLoading() {
        // Pause all observers
        this.observers.forEach(observer => observer.disconnect());
        console.log('Lazy loading paused');
    }

    resumeLoading() {
        // Resume observers
        this.setupImageObservers();
        console.log('Lazy loading resumed');
    }

    handleConnectionChange() {
        const connection = navigator.connection;
        const isSlowConnection = connection.effectiveType === 'slow-2g' || 
                                connection.effectiveType === '2g';
        
        if (isSlowConnection) {
            this.options.rootMargin = '10px'; // Reduce preload distance
            console.log('Slow connection detected, reducing preload distance');
        } else {
            this.options.rootMargin = '50px'; // Normal preload distance
        }
    }

    handleResize() {
        // Re-evaluate responsive images if needed
        const viewport = this.getViewportSize();
        // Reduced logging to improve performance
        if (this.options.enablePerformanceMonitoring) {
            console.log('Viewport resized:', viewport);
        }
    }

    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Get Performance Report
    getPerformanceReport() {
        return {
            ...this.performanceMetrics,
            successRate: (this.performanceMetrics.loadedImages / 
                         this.performanceMetrics.totalImages * 100).toFixed(2) + '%',
            failureRate: (this.performanceMetrics.failedImages / 
                         this.performanceMetrics.totalImages * 100).toFixed(2) + '%'
        };
    }

    // Cleanup
    destroy() {
        // Disconnect all observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        
        // Clear sets
        this.loadedImages.clear();
        this.failedImages.clear();
        
        // Remove performance monitor
        const monitor = document.getElementById('lazy-perf-monitor');
        if (monitor) monitor.remove();
        
        console.log('LazyLoadingManager destroyed');
    }
}

// Export for use in other modules
export default LazyLoadingManager;

// Also make available globally
if (typeof window !== 'undefined') {
    window.LazyLoadingManager = LazyLoadingManager;
}