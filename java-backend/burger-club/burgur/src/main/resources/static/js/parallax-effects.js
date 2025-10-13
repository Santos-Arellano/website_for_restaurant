/**
 * Parallax Effects Manager
 * Handles smooth parallax scrolling with performance optimizations
 */

class ParallaxManager {
    constructor() {
        this.parallaxElements = [];
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.rafId = null;
        this.lastScrollY = 0;
        this.ticking = false;
        
        // Performance settings
        this.throttleDelay = 16; // ~60fps
        this.intersectionThreshold = 0.1;
        
        this.init();
    }
    
    init() {
        this.setupParallaxElements();
        this.createIntersectionObserver();
        this.bindEvents();
        this.addParallaxStructure();
        this.setupPerformanceOptimizations();
    }
    
    setupParallaxElements() {
        // Define parallax configurations for different sections
        this.parallaxConfigs = [
            {
                selector: '.hero-section',
                elements: [
                    { class: 'hero-parallax-bg', speed: 0.5, direction: 'up' },
                    { class: 'hero-parallax-overlay', speed: 0.3, direction: 'down' },
                    { class: 'floating-shape', speed: 0.2, direction: 'float' }
                ]
            },
            {
                selector: '.about-section',
                elements: [
                    { class: 'about-parallax-bg', speed: 0.4, direction: 'up' }
                ]
            },
            {
                selector: '.testimonials-section',
                elements: [
                    { class: 'testimonials-parallax-bg', speed: 0.3, direction: 'up' },
                    { class: 'testimonial-shape', speed: 0.2, direction: 'float' }
                ]
            },
            {
                selector: '.menu-section',
                elements: [
                    { class: 'menu-parallax-grid', speed: 0.25, direction: 'up' }
                ]
            },
            {
                selector: '.footer',
                elements: [
                    { class: 'footer-parallax-wave', speed: 0.6, direction: 'up' }
                ]
            }
        ];
        
        this.initializeParallaxElements();
    }
    
    initializeParallaxElements() {
        this.parallaxConfigs.forEach(config => {
            const section = document.querySelector(config.selector);
            if (!section) return;
            
            config.elements.forEach(elementConfig => {
                let elements = section.querySelectorAll(`.${elementConfig.class}`);
                
                // If element doesn't exist, create it
                if (elements.length === 0 && this.shouldCreateElement(elementConfig.class)) {
                    const element = this.createElement(elementConfig.class, section);
                    if (element) {
                        elements = [element];
                    }
                }
                
                elements.forEach(element => {
                    this.parallaxElements.push({
                        element,
                        section,
                        speed: elementConfig.speed,
                        direction: elementConfig.direction,
                        isVisible: false,
                        initialOffset: 0
                    });
                    
                    // Add parallax class for CSS optimizations
                    element.classList.add('parallax-element', 'parallax-optimized');
                });
            });
        });
    }
    
    shouldCreateElement(className) {
        const createableElements = [
            'hero-parallax-bg',
            'hero-parallax-overlay', 
            'hero-floating-elements',
            'about-parallax-bg',
            'testimonials-parallax-bg',
            'testimonials-shapes',
            'menu-parallax-grid',
            'footer-parallax-wave'
        ];
        return createableElements.includes(className);
    }
    
    createElement(className, section) {
        const element = document.createElement('div');
        element.className = className;
        
        // Add specific content based on element type
        switch (className) {
            case 'hero-floating-elements':
                this.createFloatingShapes(element);
                break;
            case 'testimonials-shapes':
                this.createTestimonialShapes(element);
                break;
        }
        
        // Insert at the beginning of the section
        section.insertBefore(element, section.firstChild);
        return element;
    }
    
    createFloatingShapes(container) {
        for (let i = 0; i < 3; i++) {
            const shape = document.createElement('div');
            shape.className = 'floating-shape';
            container.appendChild(shape);
        }
    }
    
    createTestimonialShapes(container) {
        for (let i = 0; i < 2; i++) {
            const shape = document.createElement('div');
            shape.className = 'testimonial-shape';
            container.appendChild(shape);
        }
    }
    
    addParallaxStructure() {
        // Add scroll indicator to hero section
        const heroSection = document.querySelector('.hero-section');
        if (heroSection && !heroSection.querySelector('.scroll-indicator')) {
            const scrollIndicator = document.createElement('div');
            scrollIndicator.className = 'scroll-indicator';
            scrollIndicator.innerHTML = `
                <span>Desliza para explorar</span>
                <i class="scroll-arrow fas fa-chevron-down"></i>
            `;
            heroSection.appendChild(scrollIndicator);
            
            // Add click handler for smooth scroll
            scrollIndicator.addEventListener('click', () => {
                const nextSection = heroSection.nextElementSibling;
                if (nextSection) {
                    nextSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }
    
    createIntersectionObserver() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    const parallaxData = this.parallaxElements.find(
                        item => item.section === entry.target
                    );
                    
                    if (parallaxData) {
                        parallaxData.isVisible = entry.isIntersecting;
                        
                        // Update will-change property for performance
                        const elements = this.parallaxElements.filter(
                            item => item.section === entry.target
                        );
                        
                        elements.forEach(item => {
                            if (entry.isIntersecting) {
                                item.element.style.willChange = 'transform';
                                item.section.classList.add('parallax-section', 'in-view');
                                item.section.classList.remove('out-of-view');
                            } else {
                                item.element.style.willChange = 'auto';
                                item.section.classList.add('out-of-view');
                                item.section.classList.remove('in-view');
                            }
                        });
                    }
                });
            },
            {
                threshold: this.intersectionThreshold,
                rootMargin: '50px 0px'
            }
        );
        
        // Observe all sections with parallax elements
        const sections = [...new Set(this.parallaxElements.map(item => item.section))];
        sections.forEach(section => {
            this.observer.observe(section);
        });
    }
    
    bindEvents() {
        // Optimized scroll handler
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        
        // Resize handler
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Visibility change handler for performance
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Reduced motion preference
        this.checkReducedMotion();
    }
    
    handleScroll() {
        if (!this.ticking) {
            requestAnimationFrame(this.updateParallax.bind(this));
            this.ticking = true;
        }
    }
    
    updateParallax() {
        const scrollY = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        this.parallaxElements.forEach(item => {
            if (!item.isVisible) return;
            
            const rect = item.section.getBoundingClientRect();
            const sectionTop = rect.top + scrollY;
            const sectionHeight = rect.height;
            
            // Calculate parallax offset
            let offset = 0;
            
            if (rect.bottom >= 0 && rect.top <= windowHeight) {
                const progress = (scrollY - sectionTop + windowHeight) / (sectionHeight + windowHeight);
                
                switch (item.direction) {
                    case 'up':
                        offset = (scrollY - sectionTop) * item.speed;
                        break;
                    case 'down':
                        offset = -(scrollY - sectionTop) * item.speed;
                        break;
                    case 'float':
                        offset = Math.sin(progress * Math.PI * 2) * 20 * item.speed;
                        break;
                }
                
                // Apply transform with hardware acceleration
                this.applyTransform(item.element, offset, item.direction);
            }
        });
        
        this.lastScrollY = scrollY;
        this.ticking = false;
    }
    
    applyTransform(element, offset, direction) {
        let transform = '';
        
        switch (direction) {
            case 'up':
            case 'down':
                transform = `translate3d(0, ${offset}px, 0)`;
                break;
            case 'float':
                transform = `translate3d(0, ${offset}px, 0) rotate(${offset * 0.1}deg)`;
                break;
        }
        
        element.style.transform = transform;
    }
    
    handleResize() {
        // Debounce resize events
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.updateParallax();
        }, 100);
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause parallax when tab is not visible
            this.pauseParallax();
        } else {
            // Resume parallax when tab becomes visible
            this.resumeParallax();
        }
    }
    
    pauseParallax() {
        this.parallaxElements.forEach(item => {
            item.element.style.willChange = 'auto';
        });
    }
    
    resumeParallax() {
        this.parallaxElements.forEach(item => {
            if (item.isVisible) {
                item.element.style.willChange = 'transform';
            }
        });
        this.updateParallax();
    }
    
    checkReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            this.disableParallax();
        }
        
        // Listen for changes in motion preference
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            if (e.matches) {
                this.disableParallax();
            } else {
                this.enableParallax();
            }
        });
    }
    
    disableParallax() {
        this.parallaxElements.forEach(item => {
            item.element.style.transform = 'none';
            item.element.style.willChange = 'auto';
            item.element.classList.add('parallax-disabled');
        });
        
        // Remove scroll listener
        window.removeEventListener('scroll', this.handleScroll);
    }
    
    enableParallax() {
        this.parallaxElements.forEach(item => {
            item.element.classList.remove('parallax-disabled');
        });
        
        // Re-add scroll listener
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        this.updateParallax();
    }
    
    setupPerformanceOptimizations() {
        // Use Intersection Observer for better performance
        if ('IntersectionObserver' in window) {
            console.log('✨ Parallax effects initialized with Intersection Observer');
        } else {
            console.warn('⚠️ Intersection Observer not supported, using fallback');
        }
        
        // Check for hardware acceleration support
        this.checkHardwareAcceleration();
        
        // Monitor performance
        this.setupPerformanceMonitoring();
    }
    
    checkHardwareAcceleration() {
        const testElement = document.createElement('div');
        testElement.style.transform = 'translate3d(0, 0, 0)';
        document.body.appendChild(testElement);
        
        const computedStyle = window.getComputedStyle(testElement);
        const hasHardwareAcceleration = computedStyle.transform !== 'none';
        
        document.body.removeChild(testElement);
        
        if (!hasHardwareAcceleration) {
            console.warn('⚠️ Hardware acceleration may not be available');
        }
    }
    
    setupPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const monitorPerformance = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                if (fps < 30) {
                    console.warn(`⚠️ Low FPS detected: ${fps}fps. Consider reducing parallax effects.`);
                    this.reduceParallaxIntensity();
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            if (this.parallaxElements.some(item => item.isVisible)) {
                requestAnimationFrame(monitorPerformance);
            }
        };
        
        requestAnimationFrame(monitorPerformance);
    }
    
    reduceParallaxIntensity() {
        this.parallaxElements.forEach(item => {
            item.speed *= 0.7; // Reduce speed by 30%
        });
    }
    
    // Public methods
    refresh() {
        this.updateParallax();
    }
    
    destroy() {
        // Clean up event listeners
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Disconnect observer
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // Reset transforms
        this.parallaxElements.forEach(item => {
            item.element.style.transform = 'none';
            item.element.style.willChange = 'auto';
        });
        
        // Clear timeouts
        clearTimeout(this.resizeTimeout);
        
        console.log('🧹 Parallax effects cleaned up');
    }
}

// Auto-initialize disabled to prevent duplication with app.js
// ParallaxManager is now initialized only through app.js
let parallaxManager = null;

// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => {
//         // Only initialize if not on mobile or if user prefers motion
//         const isMobile = window.innerWidth <= 768;
//         const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
//         
//         if (!isMobile && !prefersReducedMotion) {
//             parallaxManager = new ParallaxManager();
//         }
//     });
// } else {
//     const isMobile = window.innerWidth <= 768;
//     const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
//     
//     if (!isMobile && !prefersReducedMotion) {
//         parallaxManager = new ParallaxManager();
//     }
// }

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParallaxManager;
}

// ES6 export
export default ParallaxManager;
export { ParallaxManager };

// Global access
window.ParallaxManager = ParallaxManager;
window.parallaxManager = parallaxManager;