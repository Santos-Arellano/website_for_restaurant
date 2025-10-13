/**
 * Interactive Map Manager
 * Handles restaurant location map with directions and contact features
 */

class InteractiveMapManager {
    constructor() {
        this.restaurantLocation = {
            lat: 4.6097,
            lng: -74.0817,
            address: 'Carrera 13 #85-32, Bogotá, Colombia',
            name: 'Burger Club',
            phone: '+57 123 456 7890',
            email: 'info@burgerclub.com'
        };
        
        this.businessHours = {
            monday: { open: '11:00', close: '23:00', isOpen: true },
            tuesday: { open: '11:00', close: '23:00', isOpen: true },
            wednesday: { open: '11:00', close: '23:00', isOpen: true },
            thursday: { open: '11:00', close: '23:00', isOpen: true },
            friday: { open: '11:00', close: '23:00', isOpen: true },
            saturday: { open: '11:00', close: '23:00', isOpen: true },
            sunday: { open: '11:00', close: '23:00', isOpen: true }
        };
        
        this.mapContainer = null;
        this.userLocation = null;
        this.isMapLoaded = false;
        
        this.init();
    }
    
    init() {
        this.createContactSection();
        this.setupEventListeners();
        this.updateBusinessHours();
        this.setupIntersectionObserver();
        console.log('🗺️ Interactive map manager initialized');
    }
    
    createContactSection() {
        // Wait for DOM to be fully loaded before searching for sections
        const findSections = () => {
            const aboutSection = document.querySelector('.about-section');
            const footer = document.querySelector('.site-footer');
            
            if (!aboutSection || !footer) {
                // Retry after a short delay if sections not found
                setTimeout(findSections, 100);
                return;
            }
            
            this.insertContactSection(aboutSection, footer);
        };
        
        findSections();
    }
    
    insertContactSection(aboutSection, footer) {
        
        const contactSection = document.createElement('section');
        contactSection.className = 'contact-section';
        contactSection.id = 'contact';
        
        contactSection.innerHTML = `
            <div class="container">
                <h2 data-animate="fade-in-up">Visítanos</h2>
                <p class="section-subtitle" data-animate="fade-in-up" data-delay="200">
                    Te esperamos en nuestro acogedor restaurante para que disfrutes de la mejor experiencia gastronómica
                </p>
                
                <div class="contact-content">
                    <div class="contact-info-section" data-animate="slide-in-left">
                        <h3>Información de Contacto</h3>
                        <div class="contact-details">
                            <div class="contact-item" data-animate="fade-in-up" data-delay="100">
                                <i class="fas fa-map-marker-alt"></i>
                                <div class="contact-item-content">
                                    <div class="contact-item-label">Dirección</div>
                                    <div class="contact-item-value">${this.restaurantLocation.address}</div>
                                </div>
                            </div>
                            
                            <div class="contact-item" data-animate="fade-in-up" data-delay="200">
                                <i class="fas fa-phone"></i>
                                <div class="contact-item-content">
                                    <div class="contact-item-label">Teléfono</div>
                                    <div class="contact-item-value">
                                        <a href="tel:${this.restaurantLocation.phone}">${this.restaurantLocation.phone}</a>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="contact-item" data-animate="fade-in-up" data-delay="300">
                                <i class="fas fa-envelope"></i>
                                <div class="contact-item-content">
                                    <div class="contact-item-label">Email</div>
                                    <div class="contact-item-value">
                                        <a href="mailto:${this.restaurantLocation.email}">${this.restaurantLocation.email}</a>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="contact-item" data-animate="fade-in-up" data-delay="400">
                                <i class="fas fa-clock"></i>
                                <div class="contact-item-content">
                                    <div class="contact-item-label">Estado</div>
                                    <div class="contact-item-value" id="restaurant-status">
                                        <span class="status-indicator"></span>
                                        <span class="status-text">Calculando...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="business-hours" data-animate="fade-in-up" data-delay="500">
                            <h4><i class="fas fa-clock"></i> Horarios de Atención</h4>
                            <div class="hours-grid" id="business-hours-grid">
                                <!-- Hours will be populated by JavaScript -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="map-container" data-animate="slide-in-right">
                        <div class="map-header">
                            <h3><i class="fas fa-map-marker-alt"></i> Nuestra Ubicación</h3>
                            <p>Encuéntranos fácilmente en el corazón de Bogotá</p>
                        </div>
                        
                        <div class="interactive-map" id="restaurant-map">
                            <div class="map-placeholder">
                                <i class="fas fa-map-marked-alt"></i>
                                <h4>Mapa Interactivo</h4>
                                <p>Haz clic en "Ver en Google Maps" para obtener direcciones detalladas</p>
                                <div class="map-loading" style="display: none;">
                                    <div class="spinner"></div>
                                    <p>Cargando mapa...</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="map-actions">
                            <a href="#" class="map-btn" id="directions-btn">
                                <i class="fas fa-directions"></i>
                                Cómo Llegar
                            </a>
                            <a href="#" class="map-btn secondary" id="google-maps-btn">
                                <i class="fab fa-google"></i>
                                Ver en Google Maps
                            </a>
                            <button class="map-btn secondary" id="share-location-btn">
                                <i class="fas fa-share-alt"></i>
                                Compartir Ubicación
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert before footer
        footer.parentNode.insertBefore(contactSection, footer);
        
        // Store reference to map container
        this.mapContainer = contactSection.querySelector('#restaurant-map');
    }
    
    setupEventListeners() {
        // Directions button
        const directionsBtn = document.getElementById('directions-btn');
        if (directionsBtn) {
            directionsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.getDirections();
            });
        }
        
        // Google Maps button
        const googleMapsBtn = document.getElementById('google-maps-btn');
        if (googleMapsBtn) {
            googleMapsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openInGoogleMaps();
            });
        }
        
        // Share location button
        const shareBtn = document.getElementById('share-location-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareLocation();
            });
        }
        
        // Contact items click handlers
        const phoneItem = document.querySelector('a[href^="tel:"]');
        if (phoneItem) {
            phoneItem.addEventListener('click', () => {
                this.trackInteraction('phone_call');
            });
        }
        
        const emailItem = document.querySelector('a[href^="mailto:"]');
        if (emailItem) {
            emailItem.addEventListener('click', () => {
                this.trackInteraction('email_click');
            });
        }
    }
    
    updateBusinessHours() {
        const hoursGrid = document.getElementById('business-hours-grid');
        const statusElement = document.getElementById('restaurant-status');
        
        if (!hoursGrid || !statusElement) return;
        
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const today = new Date().getDay();
        
        // Clear existing hours
        hoursGrid.innerHTML = '';
        
        days.forEach((day, index) => {
            const hours = this.businessHours[day];
            const isToday = index === today;
            
            const hourItem = document.createElement('div');
            hourItem.className = `hours-item ${isToday ? 'today' : ''}`;
            
            hourItem.innerHTML = `
                <span class="hours-day">${dayNames[index]}</span>
                <span class="hours-time">${hours.isOpen ? `${hours.open} - ${hours.close}` : 'Cerrado'}</span>
            `;
            
            hoursGrid.appendChild(hourItem);
        });
        
        // Update restaurant status
        this.updateRestaurantStatus(statusElement);
    }
    
    updateRestaurantStatus(statusElement) {
        const now = new Date();
        const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
        const currentTime = now.getHours() * 100 + now.getMinutes();
        
        const todayHours = this.businessHours[currentDay];
        const openTime = parseInt(todayHours.open.replace(':', ''));
        const closeTime = parseInt(todayHours.close.replace(':', ''));
        
        const indicator = statusElement.querySelector('.status-indicator');
        const text = statusElement.querySelector('.status-text');
        
        if (todayHours.isOpen && currentTime >= openTime && currentTime <= closeTime) {
            indicator.style.backgroundColor = '#10b981';
            text.textContent = 'Abierto ahora';
            text.style.color = '#10b981';
        } else {
            indicator.style.backgroundColor = '#ef4444';
            text.textContent = 'Cerrado';
            text.style.color = '#ef4444';
        }
        
        // Add pulsing animation to indicator
        indicator.style.width = '8px';
        indicator.style.height = '8px';
        indicator.style.borderRadius = '50%';
        indicator.style.display = 'inline-block';
        indicator.style.marginRight = '8px';
        indicator.style.animation = 'pulse 2s infinite';
        
        // Add pulse animation if not exists
        if (!document.querySelector('#pulse-animation')) {
            const style = document.createElement('style');
            style.id = 'pulse-animation';
            style.textContent = `
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    async getDirections() {
        try {
            // Try to get user's current location
            if ('geolocation' in navigator) {
                const position = await this.getCurrentPosition();
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                
                // Open Google Maps with directions
                const directionsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${this.restaurantLocation.lat},${this.restaurantLocation.lng}`;
                window.open(directionsUrl, '_blank');
                
                this.trackInteraction('directions_from_location');
            } else {
                // Fallback: open directions without user location
                this.openInGoogleMaps();
            }
        } catch (error) {
            console.warn('Could not get user location:', error);
            // Fallback: open Google Maps
            this.openInGoogleMaps();
        }
    }
    
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            });
        });
    }
    
    openInGoogleMaps() {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${this.restaurantLocation.lat},${this.restaurantLocation.lng}&query_place_id=${encodeURIComponent(this.restaurantLocation.name)}`;
        window.open(mapsUrl, '_blank');
        this.trackInteraction('google_maps_open');
    }
    
    async shareLocation() {
        const shareData = {
            title: this.restaurantLocation.name,
            text: `Visita ${this.restaurantLocation.name} en ${this.restaurantLocation.address}`,
            url: `https://www.google.com/maps/search/?api=1&query=${this.restaurantLocation.lat},${this.restaurantLocation.lng}`
        };
        
        try {
            if (navigator.share && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                this.trackInteraction('location_shared');
            } else {
                // Fallback: copy to clipboard
                await this.copyToClipboard(`${this.restaurantLocation.name}\n${this.restaurantLocation.address}\nhttps://www.google.com/maps/search/?api=1&query=${this.restaurantLocation.lat},${this.restaurantLocation.lng}`);
                this.showNotification('Ubicación copiada al portapapeles', 'success');
                this.trackInteraction('location_copied');
            }
        } catch (error) {
            console.warn('Error sharing location:', error);
            // Fallback: copy to clipboard
            try {
                await this.copyToClipboard(`${this.restaurantLocation.name}\n${this.restaurantLocation.address}`);
                this.showNotification('Ubicación copiada al portapapeles', 'success');
            } catch (copyError) {
                this.showNotification('No se pudo compartir la ubicación', 'error');
            }
        }
    }
    
    async copyToClipboard(text) {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
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
        notification.className = `map-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    setupIntersectionObserver() {
        const contactSection = document.querySelector('.contact-section');
        if (!contactSection) return;
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateContactElements();
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.2,
                rootMargin: '50px 0px'
            }
        );
        
        observer.observe(contactSection);
    }
    
    animateContactElements() {
        const animatedElements = document.querySelectorAll('.contact-section [data-animate]');
        
        animatedElements.forEach((element, index) => {
            const delay = element.dataset.delay ? parseInt(element.dataset.delay) : index * 100;
            
            setTimeout(() => {
                element.classList.add('animate');
            }, delay);
        });
    }
    
    trackInteraction(action) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: 'map_interaction',
                event_label: 'restaurant_location'
            });
        }
        
        console.log(`📊 Map interaction tracked: ${action}`);
    }
    
    // Public methods
    refresh() {
        this.updateBusinessHours();
    }
    
    updateLocation(newLocation) {
        this.restaurantLocation = { ...this.restaurantLocation, ...newLocation };
        this.refresh();
    }
    
    destroy() {
        // Clean up event listeners and observers
        const contactSection = document.querySelector('.contact-section');
        if (contactSection && contactSection.parentNode) {
            contactSection.parentNode.removeChild(contactSection);
        }
        
        console.log('🧹 Interactive map cleaned up');
    }
}

// Auto-initialize when DOM is loaded
let interactiveMapManager = null;

// Disabled automatic initialization to prevent duplication
// Interactive map is now initialized only through app.js
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => {
//         interactiveMapManager = new InteractiveMapManager();
//     });
// } else {
//     interactiveMapManager = new InteractiveMapManager();
// }

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InteractiveMapManager;
}

// ES6 export
export default InteractiveMapManager;
export { InteractiveMapManager };

// Global access
window.InteractiveMapManager = InteractiveMapManager;
window.interactiveMapManager = interactiveMapManager;