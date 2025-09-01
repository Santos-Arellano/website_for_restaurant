//burger-club/burgur/src/main/resources/static/js/Modules/ui/modals.js
// ==========================================
// BURGER CLUB - MODALS MODULE
// ==========================================

import { formatPrice } from '../../utils/helpers.js';
import { ANIMATION_DURATIONS } from '../../utils/constants.js';

export class CheckoutModal {
    constructor(items, total, cartManager) {
        this.items = items;
        this.total = total;
        this.cartManager = cartManager;
        this.modal = null;
        
        this.create();
    }
    
    create() {
        this.modal = document.createElement('div');
        this.modal.className = 'checkout-modal';
        this.modal.innerHTML = this.generateHTML();
        
        document.body.appendChild(this.modal);
        
        this.bindEvents();
        this.show();
    }
    
    generateHTML() {
        return `
            <div class="checkout-modal-content">
                <div class="checkout-modal-header">
                    <h3>🍔 Finalizar Pedido</h3>
                    <button class="checkout-close">&times;</button>
                </div>
                <div class="checkout-modal-body">
                    <div class="checkout-summary">
                        <h4>Resumen del pedido:</h4>
                        <div class="checkout-items">
                            ${this.items.map(item => `
                                <div class="checkout-item">
                                    <span>${item.name} x${item.quantity}</span>
                                    <span>${formatPrice(item.price * item.quantity)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="checkout-total">
                            <strong>Total: ${formatPrice(this.total)}</strong>
                        </div>
                    </div>
                    
                    <form class="checkout-form" id="checkoutForm">
                        <h4>Información de contacto:</h4>
                        <div class="form-group">
                            <input type="text" id="customerName" name="customerName" placeholder="Nombre completo" required>
                        </div>
                        <div class="form-group">
                            <input type="tel" id="customerPhone" name="customerPhone" placeholder="Teléfono" required>
                        </div>
                        <div class="form-group">
                            <textarea id="customerAddress" name="customerAddress" placeholder="Dirección de entrega" rows="3" required></textarea>
                        </div>
                        <div class="form-group">
                            <textarea id="orderNotes" name="orderNotes" placeholder="Notas adicionales (opcional)" rows="2"></textarea>
                        </div>
                        
                        <div class="payment-methods">
                            <h4>Método de pago:</h4>
                            <label class="payment-option">
                                <input type="radio" name="payment" value="cash" checked>
                                <span>💵 Efectivo</span>
                            </label>
                            <label class="payment-option">
                                <input type="radio" name="payment" value="card">
                                <span>💳 Tarjeta</span>
                            </label>
                            <label class="payment-option">
                                <input type="radio" name="payment" value="transfer">
                                <span>🏦 Transferencia</span>
                            </label>
                        </div>
                        
                        <div class="checkout-actions">
                            <button type="button" class="btn-cancel">
                                Cancelar
                            </button>
                            <button type="submit" class="btn-confirm">
                                Confirmar Pedido
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
    
    bindEvents() {
        // Close button
        const closeBtn = this.modal.querySelector('.checkout-close');
        closeBtn.addEventListener('click', () => this.close());
        
        // Cancel button
        const cancelBtn = this.modal.querySelector('.btn-cancel');
        cancelBtn.addEventListener('click', () => this.close());
        
        // Close on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
        
        // Form submission
        const form = this.modal.querySelector('#checkoutForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Escape key
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }
    
    handleKeydown(e) {
        if (e.key === 'Escape') {
            this.close();
        }
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const orderData = {
            items: this.items,
            total: this.total,
            customer: {
                name: formData.get('customerName'),
                phone: formData.get('customerPhone'),
                address: formData.get('customerAddress'),
                notes: formData.get('orderNotes')
            },
            payment: formData.get('payment'),
            timestamp: new Date().toISOString()
        };
        
        this.processOrder(orderData);
    }
    
    processOrder(orderData) {
        const submitBtn = this.modal.querySelector('.btn-confirm');
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        submitBtn.disabled = true;
        
        // Simulate order processing
        setTimeout(() => {
            this.showOrderSuccess(orderData);
            this.cartManager.clearCart();
            this.close();
            this.cartManager.closeCart();
        }, 2000);
        
        console.log('📦 Order submitted:', orderData);
    }
    
    showOrderSuccess(orderData) {
        const orderNumber = Math.random().toString(36).substr(2, 9).toUpperCase();
        
        if (window.BurgerClub?.showNotification) {
            window.BurgerClub.showNotification(
                `¡Pedido confirmado! #${orderNumber}. Tiempo estimado: 25-35 min 🍔`,
                'success'
            );
        }
        
        new OrderSuccessModal(orderNumber, orderData);
    }
    
    show() {
        setTimeout(() => {
            this.modal.classList.add('active');
        }, 10);
        
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        setTimeout(() => {
            const firstInput = this.modal.querySelector('#customerName');
            if (firstInput) firstInput.focus();
        }, 100);
    }
    
    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        document.removeEventListener('keydown', this.handleKeydown.bind(this));
        
        setTimeout(() => {
            if (document.body.contains(this.modal)) {
                document.body.removeChild(this.modal);
            }
        }, 300);
    }
}

export class OrderSuccessModal {
    constructor(orderNumber, orderData) {
        this.orderNumber = orderNumber;
        this.orderData = orderData;
        this.modal = null;
        
        this.create();
    }
    
    create() {
        this.modal = document.createElement('div');
        this.modal.className = 'order-success-modal';
        this.modal.innerHTML = `
            <div class="order-success-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>¡Pedido Confirmado!</h3>
                <div class="order-details">
                    <p><strong>Número de pedido:</strong> #${this.orderNumber}</p>
                    <p><strong>Total:</strong> ${formatPrice(this.orderData.total)}</p>
                    <p><strong>Tiempo estimado:</strong> 25-35 minutos</p>
                    <p><strong>Entrega en:</strong> ${this.orderData.customer.address}</p>
                </div>
                <div class="success-actions">
                    <button class="btn-track">
                        <i class="fas fa-map-marker-alt"></i>
                        Seguir Pedido
                    </button>
                    <button class="btn-close-success">
                        Continuar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        
        this.bindEvents();
        this.show();
    }
    
    bindEvents() {
        const trackBtn = this.modal.querySelector('.btn-track');
        const closeBtn = this.modal.querySelector('.btn-close-success');
        
        trackBtn.addEventListener('click', () => {
            this.trackOrder();
        });
        
        closeBtn.addEventListener('click', () => {
            this.close();
        });
        
        // Auto close after 10 seconds
        setTimeout(() => {
            this.close();
        }, 10000);
    }
    
    trackOrder() {
        if (window.BurgerClub?.showNotification) {
            window.BurgerClub.showNotification(
                `Seguimiento del pedido #${this.orderNumber} disponible por WhatsApp`,
                'info'
            );
        }
        
        const message = encodeURIComponent(`Hola! Quiero hacer seguimiento de mi pedido #${this.orderNumber}`);
        window.open(`https://wa.me/571234567890?text=${message}`, '_blank');
        
        this.close();
    }
    
    show() {
        setTimeout(() => {
            this.modal.classList.add('active');
        }, 10);
    }
    
    close() {
        this.modal.classList.remove('active');
        
        setTimeout(() => {
            if (document.body.contains(this.modal)) {
                document.body.removeChild(this.modal);
            }
        }, 300);
    }
}

export class ConfirmModal {
    constructor(options = {}) {
        this.options = {
            title: '¿Estás seguro?',
            message: '¿Deseas continuar con esta acción?',
            confirmText: 'Confirmar',
            cancelText: 'Cancelar',
            type: 'warning', // success, warning, danger, info
            onConfirm: () => {},
            onCancel: () => {},
            ...options
        };
        this.modal = null;
        
        this.create();
    }
    
    create() {
        this.modal = document.createElement('div');
        this.modal.className = 'confirm-modal';
        this.modal.innerHTML = `
            <div class="confirm-modal-content">
                <div class="confirm-modal-header">
                    <div class="confirm-icon confirm-icon-${this.options.type}">
                        ${this.getIcon()}
                    </div>
                    <h3>${this.options.title}</h3>
                </div>
                <div class="confirm-modal-body">
                    <p>${this.options.message}</p>
                </div>
                <div class="confirm-modal-footer">
                    <button class="btn-cancel-confirm">
                        ${this.options.cancelText}
                    </button>
                    <button class="btn-confirm-action btn-confirm-${this.options.type}">
                        ${this.options.confirmText}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        
        this.bindEvents();
        this.show();
        this.addStyles();
    }
    
    getIcon() {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            danger: '<i class="fas fa-times-circle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        return icons[this.options.type] || icons.warning;
    }
    
    bindEvents() {
        const cancelBtn = this.modal.querySelector('.btn-cancel-confirm');
        const confirmBtn = this.modal.querySelector('.btn-confirm-action');
        
        cancelBtn.addEventListener('click', () => {
            this.options.onCancel();
            this.close();
        });
        
        confirmBtn.addEventListener('click', () => {
            this.options.onConfirm();
            this.close();
        });
        
        // Close on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.options.onCancel();
                this.close();
            }
        });
        
        // Keyboard events
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }
    
    handleKeydown(e) {
        switch(e.key) {
            case 'Escape':
                this.options.onCancel();
                this.close();
                break;
            case 'Enter':
                this.options.onConfirm();
                this.close();
                break;
        }
    }
    
    show() {
        setTimeout(() => {
            this.modal.classList.add('active');
        }, 10);
        
        document.body.style.overflow = 'hidden';
        
        // Focus confirm button
        setTimeout(() => {
            const confirmBtn = this.modal.querySelector('.btn-confirm-action');
            if (confirmBtn) confirmBtn.focus();
        }, 100);
    }
    
    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        document.removeEventListener('keydown', this.handleKeydown.bind(this));
        
        setTimeout(() => {
            if (document.body.contains(this.modal)) {
                document.body.removeChild(this.modal);
            }
        }, 300);
    }
    
    addStyles() {
        if (document.getElementById('confirm-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'confirm-modal-styles';
        style.textContent = `
            .confirm-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 3000;
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .confirm-modal.active {
                opacity: 1;
                visibility: visible;
            }
            
            .confirm-modal-content {
                background: var(--color-background);
                border: 2px solid var(--color-cta-stroke);
                border-radius: var(--border-radius);
                padding: 30px;
                text-align: center;
                max-width: 400px;
                width: 90%;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .confirm-modal.active .confirm-modal-content {
                transform: scale(1);
            }
            
            .confirm-modal-header {
                margin-bottom: 20px;
            }
            
            .confirm-icon {
                font-size: 3rem;
                margin-bottom: 15px;
            }
            
            .confirm-icon-success { color: var(--color-success); }
            .confirm-icon-warning { color: var(--color-warning); }
            .confirm-icon-danger { color: var(--color-danger); }
            .confirm-icon-info { color: var(--color-info); }
            
            .confirm-modal-header h3 {
                color: var(--color-text-primary);
                margin: 0;
            }
            
            .confirm-modal-body p {
                color: var(--color-text-secondary);
                line-height: 1.5;
                margin-bottom: 25px;
            }
            
            .confirm-modal-footer {
                display: flex;
                gap: 15px;
                justify-content: center;
            }
            
            .btn-cancel-confirm,
            .btn-confirm-action {
                padding: 12px 24px;
                border: none;
                border-radius: var(--border-radius-small);
                font-family: var(--font-primary);
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 100px;
            }
            
            .btn-cancel-confirm {
                background: rgba(255, 255, 255, 0.1);
                color: var(--color-text-primary);
            }
            
            .btn-cancel-confirm:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .btn-confirm-success {
                background: var(--color-success);
                color: white;
            }
            
            .btn-confirm-warning {
                background: var(--color-warning);
                color: white;
            }
            
            .btn-confirm-danger {
                background: var(--color-danger);
                color: white;
            }
            
            .btn-confirm-info {
                background: var(--color-info);
                color: white;
            }
            
            .btn-confirm-action:hover {
                transform: translateY(-2px);
                filter: brightness(1.1);
            }
            
            @media (max-width: 768px) {
                .confirm-modal-content {
                    width: 95%;
                    padding: 25px 20px;
                }
                
                .confirm-modal-footer {
                    flex-direction: column;
                }
                
                .btn-cancel-confirm,
                .btn-confirm-action {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Utility function to show quick confirm dialogs
export function showConfirm(message, options = {}) {
    return new Promise((resolve) => {
        new ConfirmModal({
            message,
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false),
            ...options
        });
    });
}