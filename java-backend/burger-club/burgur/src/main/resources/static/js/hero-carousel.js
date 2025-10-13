/* ==========================================
   ARCHIVO: js/hero-carousel.js
   DESCRIPCIÓN: Funcionalidad del carrusel hero
   ========================================== */

class HeroCarousel {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.hero-slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.prevBtn = document.getElementById('carouselPrev');
        this.nextBtn = document.getElementById('carouselNext');
        this.progressBar = document.getElementById('carouselProgress');
        this.autoPlayInterval = null;
        this.autoPlayDuration = 8000; // 8 segundos
        this.isPlaying = true;
        this.progressInterval = null;
        
        this.init();
    }

    init() {
        if (this.slides.length === 0) return;
        
        this.bindEvents();
        this.startAutoPlay();
        this.updateProgressBar();
        
        // Pausar autoplay cuando el usuario interactúa
        this.addInteractionListeners();
    }

    bindEvents() {
        // Navegación con botones
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Navegación con indicadores
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });

        // Pausar en hover
        const carouselSection = document.querySelector('.hero-carousel-section');
        if (carouselSection) {
            carouselSection.addEventListener('mouseenter', () => this.pauseAutoPlay());
            carouselSection.addEventListener('mouseleave', () => this.resumeAutoPlay());
        }

        // Touch/Swipe support para móviles
        this.addTouchSupport();
    }

    addTouchSupport() {
        let startX = 0;
        let endX = 0;
        const carouselContainer = document.querySelector('.hero-carousel-container');
        
        if (!carouselContainer) return;

        carouselContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });

        carouselContainer.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            this.handleSwipe(startX, endX);
        }, { passive: true });
    }

    handleSwipe(startX, endX) {
        const threshold = 50; // Mínimo de píxeles para considerar swipe
        const diff = startX - endX;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Swipe left - siguiente slide
                this.nextSlide();
            } else {
                // Swipe right - slide anterior
                this.prevSlide();
            }
        }
    }

    addInteractionListeners() {
        // Pausar autoplay cuando el usuario interactúa
        const interactiveElements = [
            ...document.querySelectorAll('.carousel-btn'),
            ...document.querySelectorAll('.indicator')
        ];

        interactiveElements.forEach(element => {
            element.addEventListener('click', () => {
                this.pauseAutoPlay();
                // Reanudar después de 10 segundos de inactividad
                setTimeout(() => this.resumeAutoPlay(), 10000);
            });
        });

        // Agregar funcionalidad específica a los botones de promoción
        this.addPromotionButtonHandlers();
    }

    addPromotionButtonHandlers() {
        // Obtener todos los slides y sus botones
        const slides = document.querySelectorAll('.hero-slide');
        
        slides.forEach((slide, slideIndex) => {
            const primaryBtn = slide.querySelector('.btn-hero-primary');
            const secondaryBtn = slide.querySelector('.btn-hero-secondary');
            
            if (primaryBtn) {
                primaryBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.pauseAutoPlay();
                    this.handlePrimaryButtonClick(slideIndex);
                });
            }
            
            if (secondaryBtn) {
                secondaryBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.pauseAutoPlay();
                    this.handleSecondaryButtonClick(slideIndex);
                });
            }
        });
    }

    handlePrimaryButtonClick(slideIndex) {
        // Definir productos específicos para cada slide
        const slideProducts = {
            0: 'burger-clasica', // Slide 1: Burger Clásica
            1: 'bbq-master',     // Slide 2: BBQ Master
            2: 'hot-dog-supreme', // Slide 3: Hot Dog Supreme
            3: 'delivery'        // Slide 4: Delivery (redirigir al menú general)
        };
        
        const productSearch = slideProducts[slideIndex];
        
        if (productSearch && productSearch !== 'delivery') {
            // Redirigir al menú con búsqueda específica del producto
            window.location.href = `/menu?search=${encodeURIComponent(productSearch)}&openModal=true`;
        } else {
            // Para delivery o productos no específicos, ir al menú general
            window.location.href = '/menu';
        }
    }

    handleSecondaryButtonClick(slideIndex) {
        // Los botones secundarios siempre van al menú
        if (slideIndex === 3) {
            // Para el slide de delivery, mostrar información de zonas
            window.location.href = '/menu#delivery-info';
        } else {
            window.location.href = '/menu';
        }
    }

    goToSlide(index) {
        if (index === this.currentSlide) return;
        
        // Remover clase active del slide actual
        this.slides[this.currentSlide].classList.remove('active');
        this.indicators[this.currentSlide].classList.remove('active');
        
        // Agregar clase prev si vamos hacia atrás
        if (index < this.currentSlide) {
            this.slides[this.currentSlide].classList.add('prev');
        }
        
        // Actualizar índice
        this.currentSlide = index;
        
        // Activar nuevo slide
        this.slides[this.currentSlide].classList.add('active');
        this.indicators[this.currentSlide].classList.add('active');
        
        // Limpiar clases prev después de la transición
        setTimeout(() => {
            this.slides.forEach(slide => slide.classList.remove('prev'));
        }, 800);
        
        // Reiniciar barra de progreso
        this.resetProgressBar();
        
        // Trigger de animaciones personalizadas
        this.triggerSlideAnimations();
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }

    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }

    startAutoPlay() {
        if (!this.isPlaying) return;
        
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDuration);
    }

    pauseAutoPlay() {
        this.isPlaying = false;
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    resumeAutoPlay() {
        this.isPlaying = true;
        this.startAutoPlay();
        this.updateProgressBar();
    }

    updateProgressBar() {
        if (!this.progressBar || !this.isPlaying) return;
        
        let progress = 0;
        const increment = 100 / (this.autoPlayDuration / 100);
        
        this.progressInterval = setInterval(() => {
            progress += increment;
            this.progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                progress = 0;
                this.progressBar.style.width = '0%';
            }
        }, 100);
    }

    resetProgressBar() {
        if (this.progressBar) {
            this.progressBar.style.width = '0%';
        }
        
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        
        if (this.isPlaying) {
            this.updateProgressBar();
        }
    }

    triggerSlideAnimations() {
        const currentSlideElement = this.slides[this.currentSlide];
        
        // Reiniciar animaciones de elementos flotantes
        const floatingElements = currentSlideElement.querySelectorAll('.floating-star, .floating-heart, .floating-fire');
        floatingElements.forEach(element => {
            element.style.animation = 'none';
            element.offsetHeight; // Trigger reflow
            element.style.animation = null;
        });
        
        // Reiniciar animaciones de efectos especiales
        const effects = currentSlideElement.querySelectorAll('.smoke-effect, .bubbles-effect, .speed-lines');
        effects.forEach(effect => {
            effect.style.animation = 'none';
            effect.offsetHeight; // Trigger reflow
            effect.style.animation = null;
        });
        
        // Animación de entrada para el contenido del slide
        const slideText = currentSlideElement.querySelector('.hero-slide-text');
        const slideImage = currentSlideElement.querySelector('.hero-slide-image');
        
        if (slideText) {
            slideText.style.animation = 'none';
            slideText.offsetHeight;
            slideText.style.animation = 'slideInLeft 0.8s ease-out 0.3s both';
        }
        
        if (slideImage) {
            slideImage.style.animation = 'none';
            slideImage.offsetHeight;
            slideImage.style.animation = 'slideInRight 0.8s ease-out 0.5s both';
        }
    }

    // Método para destruir el carrusel (útil para cleanup)
    destroy() {
        this.pauseAutoPlay();
        
        // Remover event listeners
        if (this.prevBtn) {
            this.prevBtn.removeEventListener('click', () => this.prevSlide());
        }
        
        if (this.nextBtn) {
            this.nextBtn.removeEventListener('click', () => this.nextSlide());
        }
        
        this.indicators.forEach((indicator, index) => {
            indicator.removeEventListener('click', () => this.goToSlide(index));
        });
    }
}

// Funciones de utilidad para efectos especiales
class CarouselEffects {
    static createParticles(container, type = 'stars') {
        const particleCount = type === 'stars' ? 20 : 10;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = `particle particle-${type}`;
            
            // Posición aleatoria
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            // Delay aleatorio para la animación
            particle.style.animationDelay = Math.random() * 2 + 's';
            
            container.appendChild(particle);
            
            // Remover partícula después de la animación
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 3000);
        }
    }
    
    static addClickEffect(element) {
        element.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple-effect');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }
}

// Inicializar el carrusel cuando el DOM esté listo
// Función para inicializar efectos del carrusel (llamada desde app.js)
function initializeCarouselEffects() {
    // Agregar efectos de click a los botones
    const buttons = document.querySelectorAll('.btn-hero-primary, .btn-hero-secondary, .carousel-btn');
    buttons.forEach(button => {
        CarouselEffects.addClickEffect(button);
    });
    
    // Agregar CSS para el efecto ripple
    const style = document.createElement('style');
    style.textContent = `
        .ripple-effect {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        .particle {
            position: absolute;
            pointer-events: none;
            z-index: 1000;
        }
        
        .particle-stars {
            width: 4px;
            height: 4px;
            background: #fff;
            border-radius: 50%;
            animation: twinkle 2s ease-in-out infinite;
        }
        
        @keyframes twinkle {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}

// Exportar para uso en otros módulos si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HeroCarousel, CarouselEffects };
}

// ES6 Export
export { HeroCarousel, CarouselEffects, initializeCarouselEffects };