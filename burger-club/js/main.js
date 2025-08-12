// ==========================================
// BURGER CLUB - MAIN JAVASCRIPT
// ==========================================

// ========== VARIABLES GLOBALES ==========
let isLoaded = false;
let scrollPosition = 0;
let currentPromoIndex = 0;
const promoImages = [
    'images/burger.png',
    'images/promo1.png',
    'images/promo2.png',
    'images/promo3.png',
    'images/promo4.png'
];

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    showLoader();
    
    // Preload critical images
    preloadImages();
    
    setTimeout(() => {
        hideLoader();
        initializeHeader();
        initializeMobileMenu();
        initializeScrollAnimations();
        initializePromoSlider();
        initializeHeroSection();
        initializeLocationButton();
        initializeSmoothScroll();
        initializeBackToTop();
        initializeIntersectionObserver();
        initializeCounters();
        initializeParallax();
        
        isLoaded = true;
        console.log('🍔 Burger Club initialized successfully!');
        
        // Trigger initial animations
        triggerInitialAnimations();
    }, 1500);
}

// ========== LOADER ==========
function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.add('hidden');
        document.body.style.overflow = 'auto';
        
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
}

// ========== HEADER ==========
function initializeHeader() {
    const header = document.getElementById('header');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!header) return;
    
    // Scroll effect
    window.addEventListener('scroll', throttle(() => {
        const scrollTop = window.pageYOffset;
        
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Update active nav link based on scroll position
        updateActiveNavLink();
        
        scrollPosition = scrollTop;
    }, 10));
    
    // Nav links click handlers
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    smoothScrollTo(target, 80);
                }
            }
        });
    });
    
    // Add active class animation
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.classList.add('animate-pulse');
        });
        
        link.addEventListener('mouseleave', function() {
            this.classList.remove('animate-pulse');
        });
    });
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ========== MOBILE MENU ==========
function initializeMobileMenu() {
    const mobileToggle = document.getElementById('mobileNavToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileMenuOverlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    
    if (!mobileToggle || !mobileMenu || !mobileOverlay) return;
    
    // Toggle mobile menu
    mobileToggle.addEventListener('click', toggleMobileMenu);
    mobileOverlay.addEventListener('click', closeMobileMenu);
    
    // Mobile nav links
    mobileLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    closeMobileMenu();
                    setTimeout(() => {
                        smoothScrollTo(target, 80);
                    }, 300);
                }
            } else if (href !== '#') {
                closeMobileMenu();
            } else {
                e.preventDefault();
                // Handle special mobile links
                if (this.id === 'mobileCartLink') {
                    closeMobileMenu();
                    setTimeout(() => {
                        if (window.CartManager) {
                            window.CartManager.openCart();
                        }
                    }, 300);
                } else if (this.id === 'mobileLocationLink') {
                    closeMobileMenu();
                    setTimeout(() => {
                        showLocationModal();
                    }, 300);
                }
            }
        });
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
    
    // Close on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            closeMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    const mobileToggle = document.getElementById('mobileNavToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileMenuOverlay');
    
    if (mobileMenu.classList.contains('active')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const mobileToggle = document.getElementById('mobileNavToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileMenuOverlay');
    
    mobileMenu.classList.add('active');
    mobileOverlay.classList.add('active');
    mobileToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Animate menu items
    const menuItems = mobileMenu.querySelectorAll('.mobile-nav-link');
    menuItems.forEach((item, index) => {
        item.style.animation = `fadeInLeft 0.3s ease ${index * 0.1}s forwards`;
    });
}

function closeMobileMenu() {
    const mobileToggle = document.getElementById('mobileNavToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileMenuOverlay');
    
    mobileMenu.classList.remove('active');
    mobileOverlay.classList.remove('active');
    mobileToggle.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Reset animations
    const menuItems = mobileMenu.querySelectorAll('.mobile-nav-link');
    menuItems.forEach(item => {
        item.style.animation = '';
    });
}

// ========== HERO SECTION ==========
function initializeHeroSection() {
    const heroCta = document.getElementById('addToCartHero');
    const heroImage = document.querySelector('.hero-burger-img');
    
    // Hero CTA button
    if (heroCta) {
        heroCta.addEventListener('click', function() {
            this.classList.add('animate-pulse');
            
            if (typeof window.CartManager !== 'undefined') {
                window.CartManager.addItem({
                    name: 'Burger Especial Hero',
                    price: 25000,
                    image: 'images/burger.png'
                });
                
                showNotification('¡Burger agregada al carrito! 🍔', 'success');
            } else {
                showNotification('Sistema de carrito inicializando...', 'info');
            }
            
            setTimeout(() => {
                this.classList.remove('animate-pulse');
            }, 1000);
        });
        
        // Add ripple effect
        heroCta.addEventListener('click', createRippleEffect);
    }
}

// ========== PROMO SLIDER ==========
function initializePromoSlider() {
    const promoDots = document.querySelectorAll('.promo-dots .dot');
    const promoItems = document.querySelectorAll('.promo-item');
    const heroImage = document.querySelector('.hero-burger-img');
    
    if (promoDots.length === 0 && promoItems.length === 0) return;
    
    // Auto-rotate promos every 5 seconds
    const autoRotate = setInterval(() => {
        if (!document.hidden) {
            nextPromo();
        }
    }, 5000);
    
    // Pause on page visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(autoRotate);
        }
    });
    
    // Dot click handlers
    promoDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToPromo(index);
            clearInterval(autoRotate);
        });
    });
    
    // Promo item click handlers
    promoItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            goToPromo(index);
            clearInterval(autoRotate);
        });
        
        // Add hover effect
        item.addEventListener('mouseenter', () => {
            item.classList.add('animate-pulse');
        });
        
        item.addEventListener('mouseleave', () => {
            item.classList.remove('animate-pulse');
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            previousPromo();
            clearInterval(autoRotate);
        } else if (e.key === 'ArrowRight') {
            nextPromo();
            clearInterval(autoRotate);
        }
    });
}

function nextPromo() {
    currentPromoIndex = (currentPromoIndex + 1) % promoImages.length;
    updatePromoDisplay();
}

function previousPromo() {
    currentPromoIndex = (currentPromoIndex - 1 + promoImages.length) % promoImages.length;
    updatePromoDisplay();
}

function goToPromo(index) {
    currentPromoIndex = index;
    updatePromoDisplay();
}

function updatePromoDisplay() {
    const promoDots = document.querySelectorAll('.promo-dots .dot');
    const promoItems = document.querySelectorAll('.promo-item');
    const heroImage = document.querySelector('.hero-burger-img');
    
    // Update dots
    promoDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentPromoIndex);
    });
    
    // Update promo items
    promoItems.forEach((item, index) => {
        item.classList.toggle('active', index === currentPromoIndex);
    });
    
    // Update hero image with smooth animation
    if (heroImage && promoImages[currentPromoIndex]) {
        heroImage.style.opacity = '0.7';
        heroImage.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            heroImage.src = promoImages[currentPromoIndex];
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

// ========== LOCATION BUTTON ==========
function initializeLocationButton() {
    const locationBtn = document.getElementById('locationBtn');
    
    if (locationBtn) {
        locationBtn.addEventListener('click', function() {
            showLocationModal();
        });
    }
}

function showLocationModal() {
    const modal = document.createElement('div');
    modal.className = 'location-modal';
    modal.innerHTML = `
        <div class="location-modal-content">
            <div class="location-modal-header">
                <h3>🍔 Burger Club</h3>
                <button class="location-close" aria-label="Cerrar modal">&times;</button>
            </div>
            <div class="location-modal-body">
                <div class="location-info-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <div>
                        <strong>Dirección:</strong>
                        <p>Carrera 13 #85-32, Bogotá, Colombia</p>
                    </div>
                </div>
                
                <div class="location-info-item">
                    <i class="fas fa-phone"></i>
                    <div>
                        <strong>Teléfono:</strong>
                        <p>+57 123 456 7890</p>
                    </div>
                </div>
                
                <div class="location-info-item">
                    <i class="fas fa-clock"></i>
                    <div>
                        <strong>Horarios:</strong>
                        <p>Lun - Dom: 11:00 AM - 11:00 PM</p>
                    </div>
                </div>
                
                <div class="location-info-item">
                    <i class="fas fa-motorcycle"></i>
                    <div>
                        <strong>Delivery:</strong>
                        <p>Tiempo estimado: 25-35 minutos</p>
                    </div>
                </div>
                
                <div class="location-actions">
                    <button class="btn-location" onclick="openMaps()">
                        <i class="fas fa-directions"></i>
                        Ver en Maps
                    </button>
                    <button class="btn-call" onclick="makeCall()">
                        <i class="fas fa-phone"></i>
                        Llamar
                    </button>
                    <button class="btn-whatsapp" onclick="openWhatsApp()">
                        <i class="fab fa-whatsapp"></i>
                        WhatsApp
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    const closeBtn = modal.querySelector('.location-close');
    closeBtn.addEventListener('click', () => {
        closeLocationModal(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeLocationModal(modal);
        }
    });
    
    // Escape key handler
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeLocationModal(modal);
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Add styles if not exists
    addLocationModalStyles();
}

function closeLocationModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    }, 300);
}

function openMaps() {
    const address = 'Carrera 13 #85-32, Bogotá, Colombia';
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
    showNotification('Abriendo Google Maps...', 'info');
}

function makeCall() {
    window.open('tel:+571234567890');
    showNotification('Iniciando llamada...', 'info');
}

function openWhatsApp() {
    const message = encodeURIComponent('¡Hola! Me gustaría hacer un pedido en Burger Club 🍔');
    window.open(`https://wa.me/571234567890?text=${message}`, '_blank');
    showNotification('Abriendo WhatsApp...', 'info');
}

// ========== SCROLL ANIMATIONS ==========
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    animatedElements.forEach(element => {
        const animationType = element.dataset.animate;
        element.classList.add('scroll-animate');
        
        if (animationType) {
            element.classList.add(`scroll-animate-${animationType}`);
        }
    });
}

function initializeIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                
                // Trigger specific animations based on element type
                if (entry.target.classList.contains('stat-item')) {
                    triggerCounterAnimation(entry.target);
                }
                
                if (entry.target.classList.contains('menu-card')) {
                    triggerMenuCardAnimation(entry.target);
                }
                
                // Unobserve after animation
                setTimeout(() => {
                    observer.unobserve(entry.target);
                }, 1000);
            }
        });
    }, observerOptions);
    
    const elementsToAnimate = document.querySelectorAll('.scroll-animate, [data-animate], .stat-item, .menu-card, .feature-item');
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
}

function triggerMenuCardAnimation(card) {
    const delay = Array.from(card.parentElement.children).indexOf(card) * 100;
    setTimeout(() => {
        card.classList.add('animate-fade-in-up');
    }, delay);
}

// ========== COUNTERS ==========
function initializeCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    counters.forEach(counter => {
        counter.style.opacity = '0';
    });
}

function triggerCounterAnimation(statItem) {
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

// ========== PARALLAX EFFECTS ==========
function initializeParallax() {
    const parallaxElements = document.querySelectorAll('.hero-burger-img, .deco-ellipse-1, .deco-ellipse-2');
    
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

// ========== SMOOTH SCROLL ==========
function initializeSmoothScroll() {
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#' || href === '#!') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                smoothScrollTo(target);
            }
        });
    });
}

function smoothScrollTo(target, offset = 80) {
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 800;
    let start = null;
    
    function animation(currentTime) {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    requestAnimationFrame(animation);
}

// ========== BACK TO TOP ==========
function initializeBackToTop() {
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.setAttribute('aria-label', 'Volver arriba');
    backToTop.setAttribute('title', 'Volver arriba');
    
    document.body.appendChild(backToTop);
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Add click animation
        backToTop.classList.add('animate-pulse');
        setTimeout(() => {
            backToTop.classList.remove('animate-pulse');
        }, 600);
    });
    
    window.addEventListener('scroll', throttle(() => {
        if (window.pageYOffset > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }, 100));
    
    // Add styles for back to top button
    addBackToTopStyles();
}

// ========== ANIMATIONS ==========
function triggerInitialAnimations() {
    // Animate logo
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.classList.add('animate-fade-in');
    }
    
    // Animate navigation
    const navItems = document.querySelectorAll('.nav-link');
    navItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('animate-fade-in-up');
        }, index * 100);
    });
    
    // Animate cart button
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        setTimeout(() => {
            cartBtn.classList.add('animate-bounce');
            setTimeout(() => {
                cartBtn.classList.remove('animate-bounce');
            }, 1000);
        }, 1000);
    }
}

function createRippleEffect(e) {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
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
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// ========== NOTIFICATIONS ==========
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                ${getNotificationIcon(type)}
            </div>
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Cerrar notificación">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Auto close after 4 seconds
    const autoCloseTimer = setTimeout(() => {
        closeNotification(notification);
    }, 4000);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Add notification styles if not exists
    addNotificationStyles();
    
    // Return cleanup function
    return () => {
        clearTimeout(autoCloseTimer);
        closeNotification(notification);
    };
}

function getNotificationIcon(type) {
    const icons = {
        success: '<i class="fas fa-check-circle"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>',
        danger: '<i class="fas fa-times-circle"></i>',
        info: '<i class="fas fa-info-circle"></i>'
    };
    return icons[type] || icons.info;
}

function closeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 300);
}

// ========== PERFORMANCE ==========
function preloadImages() {
    const criticalImages = [
        'images/burger.png',
        'images/logo.png',
        'images/promo1.png',
        'images/promo2.png',
        'images/promo3.png',
        'images/promo4.png',
        ...promoImages
    ];
    
    const imagePromises = criticalImages.map(src => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = src;
        });
    });
    
    Promise.allSettled(imagePromises).then(results => {
        const failed = results.filter(result => result.status === 'rejected').length;
        if (failed > 0) {
            console.warn(`Failed to preload ${failed} images`);
        } else {
            console.log('All critical images preloaded successfully');
        }
    });
}

// ========== UTILITY FUNCTIONS ==========
function throttle(func, wait) {
    let timeout;
    let previous = 0;
    
    return function executedFunction(...args) {
        const now = Date.now();
        const remaining = wait - (now - previous);
        
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(this, args);
        } else if (!timeout) {
            timeout = setTimeout(() => {
                previous = Date.now();
                timeout = null;
                func.apply(this, args);
            }, remaining);
        }
    };
}

function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
}

function formatPrice(price) {
    return new Intl.NumberFormat('es-CO').format(price);
}

function isMobile() {
    return window.innerWidth <= 768;
}

function isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
}

function isDesktop() {
    return window.innerWidth > 1024;
}

// ========== STYLES INJECTION ==========
function addLocationModalStyles() {
    if (document.getElementById('location-modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'location-modal-styles';
    style.textContent = `
        .location-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 2000;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
        }
        .location-modal.active {
            opacity: 1;
            visibility: visible;
        }
        .location-modal-content {
            background: var(--color-background);
            border-radius: var(--border-radius);
            width: 90%;
            max-width: 500px;
            border: 2px solid var(--color-cta-stroke);
            transform: scale(0.9);
            transition: transform 0.3s ease;
            box-shadow: var(--box-shadow-hover);
            overflow: hidden;
        }
        .location-modal.active .location-modal-content {
            transform: scale(1);
        }
        .location-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 25px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.05);
        }
        .location-modal-header h3 {
            color: var(--color-text-primary);
            margin: 0;
            font-size: 1.5rem;
        }
        .location-close {
            background: none;
            border: none;
            font-size: 2rem;
            color: var(--color-text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }
        .location-close:hover {
            color: var(--color-danger);
            background: rgba(244, 67, 54, 0.1);
            transform: scale(1.1);
        }
        .location-modal-body {
            padding: 25px;
        }
        .location-info-item {
            display: flex;
            align-items: flex-start;
            gap: 15px;
            margin-bottom: 20px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: var(--border-radius-small);
            border-left: 4px solid var(--color-cta-stroke);
        }
        .location-info-item i {
            color: var(--color-cta-stroke);
            font-size: 1.2rem;
            width: 20px;
            text-align: center;
            margin-top: 2px;
        }
        .location-info-item strong {
            color: var(--color-text-primary);
            display: block;
            margin-bottom: 5px;
        }
        .location-info-item p {
            color: var(--color-text-secondary);
            margin: 0;
            line-height: 1.4;
        }
        .location-actions {
            display: flex;
            gap: 10px;
            margin-top: 25px;
            flex-wrap: wrap;
        }
        .btn-location,
        .btn-call,
        .btn-whatsapp {
            flex: 1;
            min-width: 120px;
            padding: 12px 15px;
            border: none;
            border-radius: var(--border-radius-small);
            cursor: pointer;
            font-family: var(--font-primary);
            font-weight: 600;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .btn-location {
            background: var(--color-cta-stroke);
            color: var(--color-background);
        }
        .btn-location:hover {
            background: var(--color-white);
            transform: translateY(-2px);
        }
        .btn-call {
            background: var(--color-info);
            color: var(--color-white);
        }
        .btn-call:hover {
            background: #1976D2;
            transform: translateY(-2px);
        }
        .btn-whatsapp {
            background: #25D366;
            color: var(--color-white);
        }
        .btn-whatsapp:hover {
            background: #128C7E;
            transform: translateY(-2px);
        }
        @media (max-width: 768px) {
            .location-modal-content {
                width: 95%;
                margin: 20px;
            }
            .location-modal-header,
            .location-modal-body {
                padding: 20px;
            }
            .location-actions {
                flex-direction: column;
            }
            .btn-location,
            .btn-call,
            .btn-whatsapp {
                flex: none;
                width: 100%;
            }
        }
    `;
    document.head.appendChild(style);
}

function addBackToTopStyles() {
    if (document.getElementById('back-to-top-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'back-to-top-styles';
    style.textContent = `
        .back-to-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--color-cta-stroke);
            color: var(--color-background);
            border: none;
            cursor: pointer;
            font-size: 1.2rem;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px) scale(0.8);
            transition: all 0.3s ease;
            box-shadow: var(--box-shadow);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .back-to-top.visible {
            opacity: 1;
            visibility: visible;
            transform: translateY(0) scale(1);
        }
        .back-to-top:hover {
            background: var(--color-white);
            transform: translateY(-5px) scale(1.1);
            box-shadow: var(--box-shadow-hover);
        }
        .back-to-top:active {
            transform: translateY(-2px) scale(1.05);
        }
        @media (max-width: 768px) {
            .back-to-top {
                bottom: 20px;
                right: 20px;
                width: 45px;
                height: 45px;
                font-size: 1.1rem;
            }
        }
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

function addNotificationStyles() {
    if (document.getElementById('notification-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-background);
            border: 2px solid;
            border-radius: var(--border-radius-small);
            padding: 0;
            z-index: 2500;
            max-width: 400px;
            min-width: 300px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            box-shadow: var(--box-shadow);
            backdrop-filter: blur(10px);
        }
        .notification.show {
            opacity: 1;
            transform: translateX(0);
        }
        .notification-success {
            border-color: var(--color-success);
        }
        .notification-warning {
            border-color: var(--color-warning);
        }
        .notification-danger {
            border-color: var(--color-danger);
        }
        .notification-info {
            border-color: var(--color-info);
        }
        .notification-content {
            display: flex;
            align-items: center;
            padding: 15px 20px;
            gap: 12px;
        }
        .notification-icon {
            color: var(--color-cta-stroke);
            font-size: 1.2rem;
        }
        .notification-success .notification-icon {
            color: var(--color-success);
        }
        .notification-warning .notification-icon {
            color: var(--color-warning);
        }
        .notification-danger .notification-icon {
            color: var(--color-danger);
        }
        .notification-info .notification-icon {
            color: var(--color-info);
        }
        .notification-message {
            color: var(--color-text-primary);
            font-weight: 500;
            flex: 1;
            line-height: 1.4;
        }
        .notification-close {
            background: none;
            border: none;
            color: var(--color-text-secondary);
            cursor: pointer;
            font-size: 1.5rem;
            transition: color 0.3s ease;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }
        .notification-close:hover {
            color: var(--color-text-primary);
            background: rgba(255, 255, 255, 0.1);
        }
        @media (max-width: 768px) {
            .notification {
                top: 10px;
                right: 10px;
                left: 10px;
                max-width: none;
                min-width: auto;
            }
        }
    `;
    document.head.appendChild(style);
}

// ========== ERROR HANDLING ==========
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    
    if (e.filename && e.filename.includes('burger-club')) {
        showNotification('Algo salió mal. Por favor recarga la página.', 'danger');
    }
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', e.reason);
});

// ========== PERFORMANCE MONITORING ==========
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log(`Page load time: ${perfData.loadEventEnd - perfData.fetchStart}ms`);
        }, 0);
    });
}

// ========== EXPORT FUNCTIONS ==========
window.BurgerClub = {
    showNotification,
    smoothScrollTo,
    openMaps,
    makeCall,
    openWhatsApp,
    formatPrice,
    isMobile,
    isTablet,
    isDesktop,
    throttle,
    debounce
};