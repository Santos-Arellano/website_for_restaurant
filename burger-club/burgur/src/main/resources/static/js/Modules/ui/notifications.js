// ==========================================
// BURGER CLUB - NOTIFICATIONS MODULE
// ==========================================

import { NOTIFICATION_TYPES, CART_CONFIG } from '../../utils/constants.js';

export class NotificationManager {
    constructor() {
        this.activeNotifications = new Map();
        this.notificationContainer = null;
        this.maxNotifications = 5;
        
        this.init();
    }
    
    init() {
        this.createContainer();
        this.addStyles();
        
        console.log('🔔 Notification Manager initialized');
    }
    
    createContainer() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'notification-container';
        this.notificationContainer.id = 'notificationContainer';
        
        document.body.appendChild(this.notificationContainer);
    }
    
    show(message, type = NOTIFICATION_TYPES.info, options = {}) {
        const {
            duration = CART_CONFIG.autoCloseTimeout,
            persistent = false,
            actions = [],
            icon = null,
            position = 'top-right'
        } = options;
        
        // Remove oldest notification if we have too many
        if (this.activeNotifications.size >= this.maxNotifications) {
            this.removeOldest();
        }
        
        const notification = this.createNotification(message, type, {
            duration,
            persistent,
            actions,
            icon,
            position
        });
        
        this.showNotification(notification, duration, persistent);
        
        return notification.id;
    }
    
    createNotification(message, type, options) {
        const id = 'notification-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.id = id;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        const icon = options.icon || this.getDefaultIcon(type);
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    ${icon}
                </div>
                <div class="notification-body">
                    <span class="notification-message">${message}</span>
                    ${options.actions.length > 0 ? this.createActions(options.actions) : ''}
                </div>
                ${!options.persistent ? '<button class="notification-close" aria-label="Cerrar notificación">&times;</button>' : ''}
            </div>
            <div class="notification-progress" style="display: ${options.persistent ? 'none' : 'block'}"></div>
        `;
        
        // Bind close event
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide(id);
            });
        }
        
        // Bind action events
        const actionButtons = notification.querySelectorAll('.notification-action');
        actionButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                const action = options.actions[index];
                if (action.callback) {
                    action.callback();
                }
                if (action.closeOnClick !== false) {
                    this.hide(id);
                }
            });
        });
        
        return { element: notification, id, type, persistent: options.persistent };
    }
    
    createActions(actions) {
        return `
            <div class="notification-actions">
                ${actions.map(action => `
                    <button class="notification-action notification-action-${action.type || 'primary'}">
                        ${action.icon ? `<i class="${action.icon}"></i>` : ''}
                        ${action.text}
                    </button>
                `).join('')}
            </div>
        `;
    }
    
    showNotification(notification, duration, persistent) {
        this.notificationContainer.appendChild(notification.element);
        this.activeNotifications.set(notification.id, notification);
        
        // Force reflow for animation
        notification.element.offsetHeight;
        
        // Show notification
        requestAnimationFrame(() => {
            notification.element.classList.add('show');
        });
        
        // Start progress bar animation if not persistent
        if (!persistent && duration > 0) {
            this.animateProgress(notification.element, duration);
            
            // Auto hide after duration
            setTimeout(() => {
                this.hide(notification.id);
            }, duration);
        }
        
        // Add click to dismiss (unless persistent)
        if (!persistent) {
            notification.element.addEventListener('click', (e) => {
                if (!e.target.closest('.notification-action, .notification-close')) {
                    this.hide(notification.id);
                }
            });
        }
    }
    
    hide(notificationId) {
        const notification = this.activeNotifications.get(notificationId);
        if (!notification) return;
        
        notification.element.classList.remove('show');
        notification.element.classList.add('hide');
        
        setTimeout(() => {
            if (this.notificationContainer.contains(notification.element)) {
                this.notificationContainer.removeChild(notification.element);
            }
            this.activeNotifications.delete(notificationId);
        }, 300);
    }
    
    hideAll() {
        this.activeNotifications.forEach((notification, id) => {
            this.hide(id);
        });
    }
    
    removeOldest() {
        const oldest = Array.from(this.activeNotifications.entries())[0];
        if (oldest) {
            this.hide(oldest[0]);
        }
    }
    
    animateProgress(element, duration) {
        const progressBar = element.querySelector('.notification-progress');
        if (!progressBar) return;
        
        progressBar.style.transition = `width ${duration}ms linear`;
        progressBar.style.width = '0%';
    }
    
    getDefaultIcon(type) {
        const icons = {
            [NOTIFICATION_TYPES.success]: '<i class="fas fa-check-circle"></i>',
            [NOTIFICATION_TYPES.warning]: '<i class="fas fa-exclamation-triangle"></i>',
            [NOTIFICATION_TYPES.danger]: '<i class="fas fa-times-circle"></i>',
            [NOTIFICATION_TYPES.info]: '<i class="fas fa-info-circle"></i>'
        };
        return icons[type] || icons[NOTIFICATION_TYPES.info];
    }
    
    // ========== SPECIALIZED NOTIFICATIONS ==========
    
    showSuccess(message, options = {}) {
        return this.show(message, NOTIFICATION_TYPES.success, options);
    }
    
    showError(message, options = {}) {
        return this.show(message, NOTIFICATION_TYPES.danger, {
            duration: 6000,
            ...options
        });
    }
    
    showWarning(message, options = {}) {
        return this.show(message, NOTIFICATION_TYPES.warning, {
            duration: 5000,
            ...options
        });
    }
    
    showInfo(message, options = {}) {
        return this.show(message, NOTIFICATION_TYPES.info, options);
    }
    
    showLoading(message, options = {}) {
        return this.show(message, NOTIFICATION_TYPES.info, {
            persistent: true,
            icon: '<i class="fas fa-spinner fa-spin"></i>',
            ...options
        });
    }
    
    showCart(message, product = null, options = {}) {
        const actions = [];
        
        if (product) {
            actions.push({
                text: 'Ver Carrito',
                type: 'primary',
                icon: 'fas fa-shopping-cart',
                callback: () => {
                    if (window.BurgerClub?.cart) {
                        window.BurgerClub.cart.openCart();
                    }
                },
                closeOnClick: true
            });
        }
        
        return this.show(message, NOTIFICATION_TYPES.success, {
            actions,
            ...options
        });
    }
    
    showOrderUpdate(message, orderNumber, options = {}) {
        const actions = [
            {
                text: 'Seguir Pedido',
                type: 'primary',
                icon: 'fas fa-map-marker-alt',
                callback: () => {
                    this.trackOrder(orderNumber);
                },
                closeOnClick: true
            }
        ];
        
        return this.show(message, NOTIFICATION_TYPES.info, {
            actions,
            duration: 8000,
            ...options
        });
    }
    
    showPrompt(message, options = {}) {
        const {
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            onConfirm = () => {},
            onCancel = () => {}
        } = options;
        
        const actions = [
            {
                text: cancelText,
                type: 'secondary',
                callback: onCancel,
                closeOnClick: true
            },
            {
                text: confirmText,
                type: 'primary',
                callback: onConfirm,
                closeOnClick: true
            }
        ];
        
        return this.show(message, NOTIFICATION_TYPES.warning, {
            persistent: true,
            actions,
            ...options
        });
    }
    
    // ========== UTILITY METHODS ==========
    
    trackOrder(orderNumber) {
        const message = encodeURIComponent(`Hola! Quiero hacer seguimiento de mi pedido #${orderNumber}`);
        window.open(`https://wa.me/571234567890?text=${message}`, '_blank');
    }
    
    getActiveCount() {
        return this.activeNotifications.size;
    }
    
    hasNotification(id) {
        return this.activeNotifications.has(id);
    }
    
    updatePosition(position) {
        this.notificationContainer.className = `notification-container position-${position}`;
    }
    
    // ========== STYLES ==========
    
    addStyles() {
        if (document.getElementById('notification-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 2500;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
                min-width: 300px;
            }
            
            .notification {
                background: var(--color-background);
                border: 2px solid;
                border-radius: var(--border-radius-small);
                box-shadow: var(--box-shadow);
                backdrop-filter: blur(10px);
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .notification.show {
                opacity: 1;
                transform: translateX(0);
            }
            
            .notification.hide {
                opacity: 0;
                transform: translateX(100%) scale(0.8);
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
                align-items: flex-start;
                padding: 15px 20px;
                gap: 12px;
            }
            
            .notification-icon {
                font-size: 1.2rem;
                margin-top: 2px;
                flex-shrink: 0;
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
            
            .notification-body {
                flex: 1;
                min-width: 0;
            }
            
            .notification-message {
                color: var(--color-text-primary);
                font-weight: 500;
                line-height: 1.4;
                display: block;
                word-wrap: break-word;
            }
            
            .notification-actions {
                display: flex;
                gap: 8px;
                margin-top: 10px;
                flex-wrap: wrap;
            }
            
            .notification-action {
                background: var(--color-cta-stroke);
                color: var(--color-background);
                border: none;
                padding: 6px 12px;
                border-radius: var(--border-radius-small);
                font-size: 0.85rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .notification-action:hover {
                background: var(--color-white);
                transform: translateY(-1px);
            }
            
            .notification-action-secondary {
                background: rgba(255, 255, 255, 0.1);
                color: var(--color-text-primary);
            }
            
            .notification-action-secondary:hover {
                background: rgba(255, 255, 255, 0.2);
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
                flex-shrink: 0;
                margin-top: -2px;
            }
            
            .notification-close:hover {
                color: var(--color-text-primary);
                background: rgba(255, 255, 255, 0.1);
            }
            
            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                width: 100%;
                background: rgba(255, 255, 255, 0.3);
                transform-origin: left;
            }
            
            .notification-success .notification-progress {
                background: var(--color-success);
            }
            
            .notification-warning .notification-progress {
                background: var(--color-warning);
            }
            
            .notification-danger .notification-progress {
                background: var(--color-danger);
            }
            
            .notification-info .notification-progress {
                background: var(--color-info);
            }
            
            /* Position variants */
            .notification-container.position-top-left {
                top: 20px;
                left: 20px;
                right: auto;
            }
            
            .notification-container.position-top-center {
                top: 20px;
                left: 50%;
                right: auto;
                transform: translateX(-50%);
            }
            
            .notification-container.position-bottom-right {
                top: auto;
                bottom: 20px;
                right: 20px;
            }
            
            .notification-container.position-bottom-left {
                top: auto;
                bottom: 20px;
                left: 20px;
                right: auto;
            }
            
            .notification-container.position-bottom-center {
                top: auto;
                bottom: 20px;
                left: 50%;
                right: auto;
                transform: translateX(-50%);
            }
            
            /* Mobile responsive */
            @media (max-width: 768px) {
                .notification-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                    min-width: auto;
                }
                
                .notification-content {
                    padding: 12px 15px;
                }
                
                .notification-message {
                    font-size: 0.9rem;
                }
                
                .notification-actions {
                    margin-top: 8px;
                }
                
                .notification-action {
                    padding: 5px 10px;
                    font-size: 0.8rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
}