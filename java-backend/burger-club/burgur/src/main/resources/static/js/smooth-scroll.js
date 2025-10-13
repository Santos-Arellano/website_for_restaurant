// ==========================================
// SMOOTH SCROLL & ENHANCED NAVIGATION
// ==========================================

class SmoothScrollManager {
    constructor() {
        this.scrollOffset = 80; // Offset para el header fijo
        this.scrollDuration = 800; // Duración de la animación en ms
        this.isScrolling = false;
        this.activeSection = null;
        
        this.init();
    }

    init() {
        this.bindScrollEvents();
        this.bindNavigationEvents();
        this.setupIntersectionObserver();
        this.addScrollIndicator();
        console.log('🚀 Smooth scroll manager initialized');
    }

    bindScrollEvents() {
        // Scroll suave para todos los enlaces con anclas
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link && link.getAttribute('href') !== '#') {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            }
        });

        // Scroll suave para botones específicos
        const scrollButtons = document.querySelectorAll('.btn-scroll-down, .scroll-indicator');
        scrollButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const target = button.getAttribute('href') || '#hero';
                const targetId = target.substring(1);
                this.scrollToSection(targetId);
            });
        });
    }

    bindNavigationEvents() {
        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'Home':
                        e.preventDefault();
                        this.scrollToSection('welcome');
                        break;
                    case 'End':
                        e.preventDefault();
                        this.scrollToSection('footer');
                        break;
                }
            }
        });

        // Navegación con rueda del mouse (opcional)
        let wheelTimeout;
        document.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                clearTimeout(wheelTimeout);
                wheelTimeout = setTimeout(() => {
                    const sections = this.getAllSections();
                    const currentIndex = sections.findIndex(section => section.id === this.activeSection);
                    
                    if (e.deltaY > 0 && currentIndex < sections.length - 1) {
                        // Scroll hacia abajo
                        this.scrollToSection(sections[currentIndex + 1].id);
                    } else if (e.deltaY < 0 && currentIndex > 0) {
                        // Scroll hacia arriba
                        this.scrollToSection(sections[currentIndex - 1].id);
                    }
                }, 100);
            }
        }, { passive: true });
    }

    scrollToSection(targetId) {
        if (this.isScrolling) return;
        
        const targetElement = document.getElementById(targetId);
        if (!targetElement) {
            console.warn(`Section with id '${targetId}' not found`);
            return;
        }

        this.isScrolling = true;
        
        // Calcular posición objetivo
        const targetPosition = targetElement.offsetTop - this.scrollOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        
        // Animación de scroll suave con easing
        const startTime = performance.now();
        
        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / this.scrollDuration, 1);
            
            // Easing function (ease-in-out-cubic)
            const easeInOutCubic = progress < 0.5 
                ? 4 * progress * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            const currentPosition = startPosition + (distance * easeInOutCubic);
            window.scrollTo(0, currentPosition);
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                this.isScrolling = false;
                // Actualizar navegación activa
                this.updateActiveNavigation(targetId);
                // Trigger custom event
                this.dispatchScrollEvent(targetId);
            }
        };
        
        requestAnimationFrame(animateScroll);
    }

    setupIntersectionObserver() {
        const sections = this.getAllSections();
        
        const observerOptions = {
            root: null,
            rootMargin: `-${this.scrollOffset}px 0px -50% 0px`,
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.activeSection = entry.target.id;
                    this.updateActiveNavigation(entry.target.id);
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    updateActiveNavigation(activeId) {
        // Actualizar enlaces de navegación principal
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const linkId = href.substring(1);
                if (linkId === activeId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
        });

        // Actualizar enlaces del footer
        const footerLinks = document.querySelectorAll('.footer-links a[href^="#"]');
        footerLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                const linkId = href.substring(1);
                if (linkId === activeId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
        });
    }

    getAllSections() {
        return Array.from(document.querySelectorAll('section[id], main[id]')).filter(section => {
            return section.id && section.offsetHeight > 0;
        });
    }

    addScrollIndicator() {
        // Crear indicador de progreso de scroll
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress-bar';
        progressBar.innerHTML = '<div class="scroll-progress-fill"></div>';
        document.body.appendChild(progressBar);

        // Actualizar progreso en scroll
        let ticking = false;
        const updateScrollProgress = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            const progressFill = progressBar.querySelector('.scroll-progress-fill');
            progressFill.style.width = `${Math.min(scrollPercent, 100)}%`;
            
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollProgress);
                ticking = true;
            }
        }, { passive: true });
    }

    dispatchScrollEvent(sectionId) {
        const event = new CustomEvent('sectionChanged', {
            detail: { sectionId, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }

    // Método público para scroll programático
    scrollTo(sectionId) {
        this.scrollToSection(sectionId);
    }

    // Método para obtener la sección activa actual
    getCurrentSection() {
        return this.activeSection;
    }

    // Método para configurar offset personalizado
    setScrollOffset(offset) {
        this.scrollOffset = offset;
    }

    // Método para configurar duración personalizada
    setScrollDuration(duration) {
        this.scrollDuration = duration;
    }
}

// Estilos CSS para el indicador de progreso
const scrollProgressStyles = `
.scroll-progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
    z-index: 9999;
    pointer-events: none;
}

.scroll-progress-fill {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, var(--color-cta-stroke), var(--color-accent));
    transition: width 0.1s ease;
    box-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
}

/* Mejorar estilos de navegación activa */
.nav-link.active,
.mobile-nav-link.active,
.footer-links a.active {
    color: var(--color-cta-stroke) !important;
    font-weight: 600;
}

.nav-link.active::after {
    width: 100% !important;
}

/* Animación suave para cambios de estado */
.nav-link,
.mobile-nav-link,
.footer-links a {
    transition: all 0.3s ease;
}

/* Indicador visual mejorado */
.scroll-indicator {
    cursor: pointer;
    transition: all 0.3s ease;
}

.scroll-indicator:hover {
    transform: translateY(-2px);
    color: var(--color-cta-stroke);
}

@media (max-width: 768px) {
    .scroll-progress-bar {
        height: 2px;
    }
}
`;

// Inyectar estilos
const styleSheet = document.createElement('style');
styleSheet.textContent = scrollProgressStyles;
document.head.appendChild(styleSheet);

// Exportar la clase
export { SmoothScrollManager };

// Auto-inicialización si no se usa como módulo
if (typeof module === 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.smoothScrollManager = new SmoothScrollManager();
    });
}