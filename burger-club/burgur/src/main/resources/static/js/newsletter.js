/**
 * Newsletter Subscription Manager
 * Handles newsletter signup with validation, API integration, and user experience
 */

class NewsletterManager {
    constructor() {
        this.form = null;
        this.emailInput = null;
        this.nameInput = null;
        this.submitButton = null;
        this.isSubmitting = false;
        this.subscribers = new Set(); // Track subscribed emails locally
        
        // Validation patterns
        this.emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        this.namePattern = /^[a-zA-ZÀ-ÿ\s]{2,50}$/;
        
        // API endpoints (mock for now)
        this.apiEndpoint = '/api/newsletter/subscribe';
        
        this.init();
    }
    
    init() {
        this.createNewsletterSection();
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.loadSubscriberData();
        console.log('📧 Newsletter manager initialized');
    }
    
    createNewsletterSection() {
        // Wait for DOM to be fully loaded before searching for sections
        const findSections = () => {
            const testimonialsSection = document.querySelector('.testimonials-section');
            const footer = document.querySelector('.site-footer');
            
            if (!testimonialsSection || !footer) {
                // Retry after a short delay if sections not found
                setTimeout(findSections, 100);
                return;
            }
            
            this.insertNewsletterSection(testimonialsSection, footer);
        };
        
        findSections();
    }
    
    insertNewsletterSection(testimonialsSection, footer) {
        
        const newsletterSection = document.createElement('section');
        newsletterSection.className = 'newsletter-section';
        newsletterSection.id = 'newsletter';
        
        newsletterSection.innerHTML = `
            <div class="container">
                <div class="newsletter-content">
                    <h2 class="newsletter-title" data-animate="fade-in-up">
                        <i class="fas fa-envelope"></i>
                        ¡Únete a Nuestra Comunidad!
                    </h2>
                    <p class="newsletter-subtitle" data-animate="fade-in-up" data-delay="200">
                        Recibe las mejores ofertas, nuevos productos y noticias exclusivas directamente en tu bandeja de entrada
                    </p>
                    
                    <form class="newsletter-form" id="newsletter-form" data-animate="fade-in-up" data-delay="400">
                        <div class="newsletter-input-group">
                            <label for="newsletter-name" class="newsletter-label">
                                <i class="fas fa-user"></i> Nombre Completo
                            </label>
                            <input 
                                type="text" 
                                id="newsletter-name" 
                                name="name" 
                                class="newsletter-input" 
                                placeholder="Ingresa tu nombre completo"
                                required
                                autocomplete="name"
                                aria-describedby="name-error"
                            >
                            <div class="newsletter-error" id="name-error" role="alert"></div>
                        </div>
                        
                        <div class="newsletter-input-group">
                            <label for="newsletter-email" class="newsletter-label">
                                <i class="fas fa-envelope"></i> Correo Electrónico
                            </label>
                            <input 
                                type="email" 
                                id="newsletter-email" 
                                name="email" 
                                class="newsletter-input" 
                                placeholder="tu@email.com"
                                required
                                autocomplete="email"
                                aria-describedby="email-error"
                            >
                            <div class="newsletter-error" id="email-error" role="alert"></div>
                        </div>
                        
                        <button type="submit" class="newsletter-submit" id="newsletter-submit">
                            <i class="fas fa-paper-plane"></i>
                            Suscribirse Ahora
                        </button>
                        
                        <div class="newsletter-success" id="newsletter-success" role="alert">
                            <i class="fas fa-check-circle"></i>
                            <strong>¡Suscripción exitosa!</strong>
                            <p>Te hemos enviado un email de confirmación. Revisa tu bandeja de entrada.</p>
                        </div>
                        
                        <p class="newsletter-privacy">
                            <i class="fas fa-shield-alt"></i>
                            Al suscribirte, aceptas nuestra 
                            <a href="#privacy" aria-label="Política de privacidad">Política de Privacidad</a>. 
                            Puedes cancelar tu suscripción en cualquier momento.
                        </p>
                    </form>
                    
                    <div class="newsletter-benefits" data-animate="fade-in-up" data-delay="600">
                        <div class="newsletter-benefit">
                            <div class="newsletter-benefit-icon">
                                <i class="fas fa-percentage"></i>
                            </div>
                            <h4 class="newsletter-benefit-title">Ofertas Exclusivas</h4>
                            <p class="newsletter-benefit-description">
                                Descuentos especiales solo para suscriptores
                            </p>
                        </div>
                        
                        <div class="newsletter-benefit">
                            <div class="newsletter-benefit-icon">
                                <i class="fas fa-utensils"></i>
                            </div>
                            <h4 class="newsletter-benefit-title">Nuevos Productos</h4>
                            <p class="newsletter-benefit-description">
                                Sé el primero en conocer nuestras novedades
                            </p>
                        </div>
                        
                        <div class="newsletter-benefit">
                            <div class="newsletter-benefit-icon">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <h4 class="newsletter-benefit-title">Eventos Especiales</h4>
                            <p class="newsletter-benefit-description">
                                Invitaciones a eventos y promociones limitadas
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert before footer
        footer.parentNode.insertBefore(newsletterSection, footer);
        
        // Store references
        this.form = document.getElementById('newsletter-form');
        this.emailInput = document.getElementById('newsletter-email');
        this.nameInput = document.getElementById('newsletter-name');
        this.submitButton = document.getElementById('newsletter-submit');
    }
    
    setupEventListeners() {
        if (!this.form) return;
        
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Real-time validation
        this.emailInput.addEventListener('input', () => {
            this.validateEmail(false);
        });
        
        this.emailInput.addEventListener('blur', () => {
            this.validateEmail(true);
        });
        
        this.nameInput.addEventListener('input', () => {
            this.validateName(false);
        });
        
        this.nameInput.addEventListener('blur', () => {
            this.validateName(true);
        });
        
        // Keyboard navigation
        this.form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.type !== 'submit') {
                e.preventDefault();
                const inputs = Array.from(this.form.querySelectorAll('input'));
                const currentIndex = inputs.indexOf(e.target);
                const nextInput = inputs[currentIndex + 1];
                
                if (nextInput) {
                    nextInput.focus();
                } else {
                    this.submitButton.focus();
                }
            }
        });
        
        // Prevent double submission
        this.submitButton.addEventListener('click', (e) => {
            if (this.isSubmitting) {
                e.preventDefault();
            }
        });
    }
    
    validateEmail(showError = true) {
        const email = this.emailInput.value.trim();
        const errorElement = document.getElementById('email-error');
        
        // Clear previous states
        this.emailInput.classList.remove('error', 'success');
        errorElement.classList.remove('show');
        
        if (!email) {
            if (showError) {
                this.showError(errorElement, 'El correo electrónico es requerido');
                this.emailInput.classList.add('error');
            }
            return false;
        }
        
        if (!this.emailPattern.test(email)) {
            if (showError) {
                this.showError(errorElement, 'Por favor ingresa un correo electrónico válido');
                this.emailInput.classList.add('error');
            }
            return false;
        }
        
        if (this.subscribers.has(email.toLowerCase())) {
            if (showError) {
                this.showError(errorElement, 'Este correo ya está suscrito a nuestro newsletter');
                this.emailInput.classList.add('error');
            }
            return false;
        }
        
        this.emailInput.classList.add('success');
        return true;
    }
    
    validateName(showError = true) {
        const name = this.nameInput.value.trim();
        const errorElement = document.getElementById('name-error');
        
        // Clear previous states
        this.nameInput.classList.remove('error', 'success');
        errorElement.classList.remove('show');
        
        if (!name) {
            if (showError) {
                this.showError(errorElement, 'El nombre es requerido');
                this.nameInput.classList.add('error');
            }
            return false;
        }
        
        if (name.length < 2) {
            if (showError) {
                this.showError(errorElement, 'El nombre debe tener al menos 2 caracteres');
                this.nameInput.classList.add('error');
            }
            return false;
        }
        
        if (name.length > 50) {
            if (showError) {
                this.showError(errorElement, 'El nombre no puede exceder 50 caracteres');
                this.nameInput.classList.add('error');
            }
            return false;
        }
        
        if (!this.namePattern.test(name)) {
            if (showError) {
                this.showError(errorElement, 'El nombre solo puede contener letras y espacios');
                this.nameInput.classList.add('error');
            }
            return false;
        }
        
        this.nameInput.classList.add('success');
        return true;
    }
    
    showError(errorElement, message) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    async handleSubmit() {
        if (this.isSubmitting) return;
        
        // Validate all fields
        const isEmailValid = this.validateEmail(true);
        const isNameValid = this.validateName(true);
        
        if (!isEmailValid || !isNameValid) {
            this.trackEvent('validation_failed');
            return;
        }
        
        this.isSubmitting = true;
        this.setLoadingState(true);
        
        try {
            const formData = {
                name: this.nameInput.value.trim(),
                email: this.emailInput.value.trim().toLowerCase(),
                timestamp: new Date().toISOString(),
                source: 'website_newsletter'
            };
            
            // Simulate API call (replace with actual API integration)
            const success = await this.submitToAPI(formData);
            
            if (success) {
                this.handleSuccess(formData.email);
            } else {
                throw new Error('Subscription failed');
            }
            
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            this.handleError(error);
        } finally {
            this.isSubmitting = false;
            this.setLoadingState(false);
        }
    }
    
    async submitToAPI(formData) {
        // Mock API call - replace with actual implementation
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate 95% success rate to reduce errors
                const success = Math.random() > 0.05;
                resolve(success);
            }, 1500);
        });
        
        // Actual API implementation would look like:
        /*
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('API submission error:', error);
            return false;
        }
        */
    }
    
    handleSuccess(email) {
        // Add to local subscribers set
        this.subscribers.add(email);
        this.saveSubscriberData();
        
        // Show success message
        const successElement = document.getElementById('newsletter-success');
        successElement.classList.add('show');
        
        // Reset form
        this.form.reset();
        this.emailInput.classList.remove('success');
        this.nameInput.classList.remove('success');
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            successElement.classList.remove('show');
        }, 5000);
        
        // Track success
        this.trackEvent('subscription_success');
        
        // Show notification if available
        this.showNotification('¡Suscripción exitosa! Revisa tu email para confirmar.', 'success');
        
        console.log('✅ Newsletter subscription successful');
    }
    
    handleError(error) {
        // Show error notification
        this.showNotification('Error al procesar la suscripción. Por favor intenta nuevamente.', 'error');
        
        // Track error
        this.trackEvent('subscription_error', { error: error.message });
        
        console.error('❌ Newsletter subscription failed:', error);
    }
    
    setLoadingState(loading) {
        if (loading) {
            this.submitButton.classList.add('loading');
            this.submitButton.disabled = true;
            this.submitButton.setAttribute('aria-busy', 'true');
        } else {
            this.submitButton.classList.remove('loading');
            this.submitButton.disabled = false;
            this.submitButton.setAttribute('aria-busy', 'false');
        }
    }
    
    showNotification(message, type = 'info') {
        // Try to use existing notification system
        if (window.app && window.app.notificationManager) {
            window.app.notificationManager.show(message, type);
            return;
        }
        
        // Fallback: create simple notification
        const notification = document.createElement('div');
        notification.className = `newsletter-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
            <span>${message}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
    
    setupIntersectionObserver() {
        const newsletterSection = document.querySelector('.newsletter-section');
        if (!newsletterSection) return;
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateNewsletterElements();
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.2,
                rootMargin: '50px 0px'
            }
        );
        
        observer.observe(newsletterSection);
    }
    
    animateNewsletterElements() {
        const animatedElements = document.querySelectorAll('.newsletter-section [data-animate]');
        
        animatedElements.forEach((element, index) => {
            const delay = element.dataset.delay ? parseInt(element.dataset.delay) : index * 100;
            
            setTimeout(() => {
                element.classList.add('animate');
            }, delay);
        });
    }
    
    loadSubscriberData() {
        try {
            const stored = localStorage.getItem('newsletter_subscribers');
            if (stored) {
                const emails = JSON.parse(stored);
                this.subscribers = new Set(emails);
            }
        } catch (error) {
            console.warn('Could not load subscriber data:', error);
        }
    }
    
    saveSubscriberData() {
        try {
            const emails = Array.from(this.subscribers);
            localStorage.setItem('newsletter_subscribers', JSON.stringify(emails));
        } catch (error) {
            console.warn('Could not save subscriber data:', error);
        }
    }
    
    trackEvent(action, data = {}) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: 'newsletter',
                event_label: 'subscription_form',
                ...data
            });
        }
        
        console.log(`📊 Newsletter event tracked: ${action}`, data);
    }
    
    // Public methods
    reset() {
        if (this.form) {
            this.form.reset();
            this.emailInput.classList.remove('error', 'success');
            this.nameInput.classList.remove('error', 'success');
            
            const errorElements = this.form.querySelectorAll('.newsletter-error');
            errorElements.forEach(el => el.classList.remove('show'));
            
            const successElement = document.getElementById('newsletter-success');
            if (successElement) {
                successElement.classList.remove('show');
            }
        }
    }
    
    isSubscribed(email) {
        return this.subscribers.has(email.toLowerCase());
    }
    
    getSubscriberCount() {
        return this.subscribers.size;
    }
    
    destroy() {
        // Clean up event listeners and observers
        const newsletterSection = document.querySelector('.newsletter-section');
        if (newsletterSection && newsletterSection.parentNode) {
            newsletterSection.parentNode.removeChild(newsletterSection);
        }
        
        console.log('🧹 Newsletter manager cleaned up');
    }
}

// Auto-initialize when DOM is loaded
let newsletterManager = null;

// Disabled automatic initialization to prevent duplication
// Newsletter is now initialized only through app.js
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => {
//         newsletterManager = new NewsletterManager();
//     });
// } else {
//     newsletterManager = new NewsletterManager();
// }

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NewsletterManager;
}

// ES6 export
export default NewsletterManager;
export { NewsletterManager };

// Global access
window.NewsletterManager = NewsletterManager;
window.newsletterManager = newsletterManager;