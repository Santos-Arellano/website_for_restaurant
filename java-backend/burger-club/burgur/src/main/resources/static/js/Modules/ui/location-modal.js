//burger-club/burgur/src/main/resources/static/js/Modules/ui/location-modal.js
// ==========================================
// BURGER CLUB - LOCATION MODAL MODULE
// ==========================================

export class LocationModal {
    constructor(notificationManager) {
        this.notificationManager = notificationManager;
        this.modal = null;
        
        this.init();
    }
    
    init() {
        const locationBtn = document.getElementById('locationBtn');
        
        if (locationBtn) {
            locationBtn.addEventListener('click', () => {
                this.show();
            });
            
            console.log('📍 Location modal initialized');
        }
    }
    
    show() {
        this.modal = document.createElement('div');
        this.modal.className = 'location-modal';
        this.modal.innerHTML = `
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
                        <button class="btn-location" data-action="maps">
                            <i class="fas fa-directions"></i>
                            Ver en Maps
                        </button>
                        <button class="btn-call" data-action="call">
                            <i class="fas fa-phone"></i>
                            Llamar
                        </button>
                        <button class="btn-whatsapp" data-action="whatsapp">
                            <i class="fab fa-whatsapp"></i>
                            WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        
        this.setupEventListeners();
        this.addStyles();
        
        // Show modal with animation
        setTimeout(() => {
            this.modal.classList.add('active');
        }, 10);
    }
    
    setupEventListeners() {
        // Close button
        const closeBtn = this.modal.querySelector('.location-close');
        closeBtn.addEventListener('click', () => {
            this.close();
        });
        
        // Close on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Action buttons
        const actionButtons = this.modal.querySelectorAll('[data-action]');
        actionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                this.handleAction(action);
            });
        });
        
        // Escape key handler
        this.escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        };
        document.addEventListener('keydown', this.escapeHandler);
    }
    
    handleAction(action) {
        switch (action) {
            case 'maps':
                this.openMaps();
                break;
            case 'call':
                this.makeCall();
                break;
            case 'whatsapp':
                this.openWhatsApp();
                break;
        }
    }
    
    openMaps() {
        const address = 'Carrera 13 #85-32, Bogotá, Colombia';
        const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
        window.open(mapsUrl, '_blank');
        this.notificationManager.show('Abriendo Google Maps...', 'info');
        this.close();
    }
    
    makeCall() {
        window.open('tel:+571234567890');
        this.notificationManager.show('Iniciando llamada...', 'info');
        this.close();
    }
    
    openWhatsApp() {
        const message = encodeURIComponent('¡Hola! Me gustaría hacer un pedido en Burger Club 🍔');
        window.open(`https://wa.me/571234567890?text=${message}`, '_blank');
        this.notificationManager.show('Abriendo WhatsApp...', 'info');
        this.close();
    }
    
    close() {
        if (!this.modal) return;
        
        this.modal.classList.remove('active');
        
        // Remove escape key listener
        document.removeEventListener('keydown', this.escapeHandler);
        
        setTimeout(() => {
            if (document.body.contains(this.modal)) {
                document.body.removeChild(this.modal);
            }
            this.modal = null;
        }, 300);
    }
    
    addStyles() {
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
                transition: all 0.3s ease;
            }
            .location-info-item:hover {
                background: rgba(255, 255, 255, 0.08);
                transform: translateX(5px);
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
                box-shadow: 0 4px 12px rgba(251, 181, 181, 0.3);
            }
            .btn-call {
                background: var(--color-info);
                color: var(--color-white);
            }
            .btn-call:hover {
                background: #1976D2;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
            }
            .btn-whatsapp {
                background: #25D366;
                color: var(--color-white);
            }
            .btn-whatsapp:hover {
                background: #128C7E;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
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
}