/**
 * Testimonials Carousel Manager
 * Handles testimonials section functionality with smooth animations
 */

class TestimonialsManager {
    constructor() {
        this.currentSlide = 0;
        this.slides = [];
        this.indicators = [];
        this.autoplayInterval = null;
        this.autoplayDelay = 5000;
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        this.bindElements();
        if (this.carousel) {
            this.setupSlides();
            this.setupNavigation();
            this.setupIndicators();
            this.setupAutoplay();
            this.setupKeyboardNavigation();
            this.setupTouchNavigation();
            this.animateStats();
            this.observeSection();
        }
    }
    
    bindElements() {
        this.section = document.querySelector('.testimonials-section');
        this.carousel = document.querySelector('.testimonials-carousel');
        this.track = document.querySelector('.testimonials-track');
        this.slides = document.querySelectorAll('.testimonial-card');
        this.prevBtn = document.querySelector('.testimonials-nav .nav-btn:first-child');
        this.nextBtn = document.querySelector('.testimonials-nav .nav-btn:last-child');
        this.indicators = document.querySelectorAll('.testimonials-indicators .indicator');
        this.stats = document.querySelectorAll('.stat-number');
    }
    
    setupSlides() {
        if (this.slides.length === 0) return;
        
        // Show first slide
        this.slides[0].classList.add('active');
        
        // Track width is now handled by CSS
    }
    
    setupNavigation() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previousSlide());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
    }
    
    setupIndicators() {
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Set first indicator as active
        if (this.indicators.length > 0) {
            this.indicators[0].classList.add('active');
        }
    }
    
    setupAutoplay() {
        this.startAutoplay();
        
        // Pause on hover
        if (this.carousel) {
            this.carousel.addEventListener('mouseenter', () => this.pauseAutoplay());
            this.carousel.addEventListener('mouseleave', () => this.startAutoplay());
        }
        
        // Pause when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoplay();
            } else {
                this.startAutoplay();
            }
        });
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.isInViewport(this.section)) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case ' ':
                    e.preventDefault();
                    this.toggleAutoplay();
                    break;
            }
        });
    }
    
    setupTouchNavigation() {
        if (!this.carousel) return;
        
        let startX = 0;
        let startY = 0;
        let isDragging = false;
        
        this.carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
            this.pauseAutoplay();
        }, { passive: true });
        
        this.carousel.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = startX - currentX;
            const diffY = startY - currentY;
            
            // Prevent vertical scrolling if horizontal swipe is detected
            if (Math.abs(diffX) > Math.abs(diffY)) {
                e.preventDefault();
            }
        }, { passive: false });
        
        this.carousel.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            const threshold = 50;
            
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            }
            
            isDragging = false;
            this.startAutoplay();
        }, { passive: true });
    }
    
    nextSlide() {
        if (this.isTransitioning || this.slides.length === 0) return;
        
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }
    
    previousSlide() {
        if (this.isTransitioning || this.slides.length === 0) return;
        
        const prevIndex = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
        this.goToSlide(prevIndex);
    }
    
    goToSlide(index) {
        if (this.isTransitioning || index === this.currentSlide || !this.slides[index]) return;
        
        this.isTransitioning = true;
        
        // Remove active class from current slide and indicator
        this.slides[this.currentSlide].classList.remove('active');
        if (this.indicators[this.currentSlide]) {
            this.indicators[this.currentSlide].classList.remove('active');
        }
        
        // Update current slide
        this.currentSlide = index;
        
        // Add active class to new slide and indicator immediately
        this.slides[this.currentSlide].classList.add('active');
        if (this.indicators[this.currentSlide]) {
            this.indicators[this.currentSlide].classList.add('active');
        }
        
        // Trigger slide animations
        this.triggerSlideAnimations(this.currentSlide);
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
    }
    
    triggerSlideAnimations(slideIndex) {
        const slide = this.slides[slideIndex];
        if (!slide) return;
        
        const elements = slide.querySelectorAll('.quote-icon, .testimonial-text, .author-avatar, .author-info, .rating');
        
        elements.forEach((element, index) => {
            element.style.animation = 'none';
            element.offsetHeight; // Trigger reflow
            element.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
        });
    }
    
    startAutoplay() {
        this.pauseAutoplay();
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoplayDelay);
    }
    
    pauseAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
    
    toggleAutoplay() {
        if (this.autoplayInterval) {
            this.pauseAutoplay();
        } else {
            this.startAutoplay();
        }
    }
    
    animateStats() {
        this.stats.forEach((stat, index) => {
            const finalValue = parseInt(stat.textContent);
            const duration = 2000;
            const increment = finalValue / (duration / 16);
            let currentValue = 0;
            
            const animate = () => {
                currentValue += increment;
                if (currentValue >= finalValue) {
                    stat.textContent = finalValue;
                    return;
                }
                stat.textContent = Math.floor(currentValue);
                requestAnimationFrame(animate);
            };
            
            // Start animation with delay
            setTimeout(() => {
                stat.textContent = '0';
                animate();
            }, index * 200);
        });
    }
    
    observeSection() {
        if (!this.section) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Start animations when section comes into view
                    this.section.classList.add('animate');
                    
                    // Animate stats if not already animated
                    if (!this.section.dataset.animated) {
                        setTimeout(() => this.animateStats(), 500);
                        this.section.dataset.animated = 'true';
                    }
                } else {
                    // Pause autoplay when section is not visible
                    this.pauseAutoplay();
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -100px 0px'
        });
        
        observer.observe(this.section);
    }
    
    isInViewport(element) {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    destroy() {
        this.pauseAutoplay();
        
        // Remove event listeners
        if (this.prevBtn) {
            this.prevBtn.removeEventListener('click', this.previousSlide);
        }
        if (this.nextBtn) {
            this.nextBtn.removeEventListener('click', this.nextSlide);
        }
        
        this.indicators.forEach((indicator, index) => {
            indicator.removeEventListener('click', () => this.goToSlide(index));
        });
    }
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new TestimonialsManager();
    });
} else {
    new TestimonialsManager();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestimonialsManager;
}

// ES6 export
export default TestimonialsManager;
export { TestimonialsManager };