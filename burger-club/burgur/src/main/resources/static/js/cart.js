// ==========================================
// BURGER CLUB - CART JAVASCRIPT
// ==========================================
// ========== CART MANAGER CLASS ==========
class CartManager {
    constructor() {
        this.items = [];
        this.total = 0;
        this.isOpen = false;
        this.storageKey = 'burgerclub_cart';
        
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
        
        console.log('🛒 Cart Manager initialized');
    }
    
    initializeElements() {
        this.cartModal = document.getElementById('cartModal');
        this.cartBtn = document.getElementById('cartBtn');
        this.cartClose = document.getElementById('cartClose');
        this.cartItems = document.getElementById('cartItems');
        this.cartTotal = document.getElementById('cartTotal');
        this.cartCount = document.getElementById('cartCount');
        this.checkoutBtn = document.querySelector('.btn-checkout');
    }
    
    bindEvents() {
        if (this.cartBtn) {
            this.cartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCart();
            });
        }
        
        if (this.cartClose) {
            this.cartClose.addEventListener('click', () => {
                this.closeCart();
            });
        }
        
        if (this.cartModal) {
            this.cartModal.addEventListener('click', (e) => {
                if (e.target === this.cartModal) {
                    this.closeCart();
                }
            });
        }
        
        if (this.checkoutBtn) {
            this.checkoutBtn.addEventListener('click', () => {
                this.checkout();
            });
        }
        
        // Listen for cart updates from other components
        document.addEventListener('cartUpdate', () => {
            this.updateDisplay();
        });
        
        // Mobile cart button
        const mobileCartBtn = document.querySelector('.mobile-nav-link[href="#"]');
        if (mobileCartBtn && mobileCartBtn.textContent.includes('Carrito')) {
            mobileCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCart();
            });
        }
    }
    
    // ========== CART OPERATIONS ==========
    addItem(product) {
        const existingItem = this.items.find(item => item.name === product.name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: Date.now(),
                name: product.name,
                price: product.price,
                image: product.image || 'images/default-burger.png',
                quantity: 1
            });
        }
        
        this.calculateTotal();
        this.updateDisplay();
        this.saveToStorage();
        this.showAddAnimation();
        
        console.log(`➕ Added to cart: ${product.name}`);
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('itemAdded', {
            detail: { product, cart: this.items }
        }));
    }
    
    removeItem(itemId) {
        const itemIndex = this.items.findIndex(item => item.id === itemId);
        
        if (itemIndex > -1) {
            const removedItem = this.items[itemIndex];
            this.items.splice(itemIndex, 1);
            
            this.calculateTotal();
            this.updateDisplay();
            this.saveToStorage();
            
            console.log(`➖ Removed from cart: ${removedItem.name}`);
            
            // Show notification
            if (typeof window.BurgerClub !== 'undefined') {
                window.BurgerClub.showNotification(`${removedItem.name} eliminado del carrito`, 'info');
            }
        }
    }
    
    updateQuantity(itemId, newQuantity) {
        const item = this.items.find(item => item.id === itemId);
        
        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = newQuantity;
                this.calculateTotal();
                this.updateDisplay();
                this.saveToStorage();
                
                console.log(`🔄 Updated quantity: ${item.name} x${newQuantity}`);
            }
        }
    }
    
    clearCart() {
        this.items = [];
        this.total = 0;
        this.updateDisplay();
        this.saveToStorage();
        
        if (typeof window.BurgerClub !== 'undefined') {
            window.BurgerClub.showNotification('Carrito limpiado', 'info');
        }
        
        console.log('🗑️ Cart cleared');
    }
    
    calculateTotal() {
        this.total = this.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
    }
    
    // ========== DISPLAY METHODS ==========
    updateDisplay() {
        this.updateCartCount();
        this.updateCartItems();
        this.updateCartTotal();
    }
    
    updateCartCount() {
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        
        if (this.cartCount) {
            this.cartCount.textContent = totalItems;
            
            if (totalItems > 0) {
                this.cartCount.style.display = 'flex';
                this.cartCount.classList.add('animate-pulse');
                setTimeout(() => {
                    this.cartCount.classList.remove('animate-pulse');
                }, 500);
            } else {
                this.cartCount.style.display = 'none';
            }
        }
    }
    
    updateCartItems() {
        if (!this.cartItems) return;
        
        if (this.items.length === 0) {
            this.cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
            return;
        }
        
        this.cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">${this.formatPrice(item.price)}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="window.CartManager.updateQuantity(${item.id}, ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="window.CartManager.updateQuantity(${item.id}, ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="remove-item-btn" onclick="window.CartManager.removeItem(${item.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        // Add cart item styles
        this.addCartItemStyles();
    }
    
    updateCartTotal() {
        if (this.cartTotal) {
            this.cartTotal.textContent = `${this.formatPrice(this.total)}`;
        }
        
        // Update checkout button state
        if (this.checkoutBtn) {
            if (this.items.length === 0) {
                this.checkoutBtn.disabled = true;
                this.checkoutBtn.textContent = 'Carrito Vacío';
            } else {
                this.checkoutBtn.disabled = false;
                this.checkoutBtn.textContent = `Proceder al Pago (${this.formatPrice(this.total)})`;
            }
        }
    }
    
    // ========== MODAL METHODS ==========
    openCart() {
        if (this.cartModal) {
            this.cartModal.classList.add('active');
            this.isOpen = true;
            document.body.style.overflow = 'hidden';
            
            // Focus management for accessibility
            setTimeout(() => {
                const firstButton = this.cartModal.querySelector('button');
                if (firstButton) {
                    firstButton.focus();
                }
            }, 100);
        }
    }
    
    closeCart() {
        if (this.cartModal) {
            this.cartModal.classList.remove('active');
            this.isOpen = false;
            document.body.style.overflow = 'auto';
        }
    }
    
    // ========== ANIMATIONS ==========
    showAddAnimation() {
        if (this.cartBtn) {
            const cartIcon = this.cartBtn.querySelector('i');
            if (cartIcon) {
                cartIcon.classList.add('animate-bounce');
                setTimeout(() => {
                    cartIcon.classList.remove('animate-bounce');
                }, 1000);
            }
        }
    }
    
    // ========== CHECKOUT ==========
    checkout() {
        if (this.items.length === 0) {
            if (typeof window.BurgerClub !== 'undefined') {
                window.BurgerClub.showNotification('Tu carrito está vacío', 'warning');
            }
            return;
        }
        
        // Show checkout modal
        this.showCheckoutModal();
    }
    
    showCheckoutModal() {
        const modal = document.createElement('div');
        modal.className = 'checkout-modal';
        modal.innerHTML = `
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
                                    <span>${this.formatPrice(item.price * item.quantity)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="checkout-total">
                            <strong>Total: ${this.formatPrice(this.total)}</strong>
                        </div>
                    </div>
                    
                    <form class="checkout-form" onsubmit="window.CartManager.processOrder(event)">
                        <h4>Información de contacto:</h4>
                        <div class="form-group">
                            <input type="text" id="customerName" placeholder="Nombre completo" required>
                        </div>
                        <div class="form-group">
                            <input type="tel" id="customerPhone" placeholder="Teléfono" required>
                        </div>
                        <div class="form-group">
                            <textarea id="customerAddress" placeholder="Dirección de entrega" rows="3" required></textarea>
                        </div>
                        <div class="form-group">
                            <textarea id="orderNotes" placeholder="Notas adicionales (opcional)" rows="2"></textarea>
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
                            <button type="button" class="btn-cancel" onclick="window.CartManager.closeCheckout()">
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
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('.checkout-close').addEventListener('click', () => {
            this.closeCheckout(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeCheckout(modal);
            }
        });
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Add checkout styles
        this.addCheckoutStyles();
    }
    
    processOrder(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const orderData = {
            items: this.items,
            total: this.total,
            customer: {
                name: formData.get('customerName') || document.getElementById('customerName').value,
                phone: formData.get('customerPhone') || document.getElementById('customerPhone').value,
                address: formData.get('customerAddress') || document.getElementById('customerAddress').value,
                notes: formData.get('orderNotes') || document.getElementById('orderNotes').value
            },
            payment: formData.get('payment'),
            timestamp: new Date().toISOString()
        };
        
        // Simulate order processing
        this.submitOrder(orderData);
    }
    
    submitOrder(orderData) {
        // Show loading state
        const submitBtn = document.querySelector('.btn-confirm');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            submitBtn.disabled = true;
        }
        
        // Simulate API call
        setTimeout(() => {
            this.showOrderSuccess(orderData);
            this.clearCart();
            this.closeCheckout();
            this.closeCart();
        }, 2000);
        
        console.log('📦 Order submitted:', orderData);
    }
    
    showOrderSuccess(orderData) {
        const orderNumber = Math.random().toString(36).substr(2, 9).toUpperCase();
        
        if (typeof window.BurgerClub !== 'undefined') {
            window.BurgerClub.showNotification(
                `¡Pedido confirmado! #${orderNumber}. Tiempo estimado: 25-35 min 🍔`,
                'success'
            );
        }
        
        // Create order confirmation modal
        const modal = document.createElement('div');
        modal.className = 'order-success-modal';
        modal.innerHTML = `
            <div class="order-success-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>¡Pedido Confirmado!</h3>
                <div class="order-details">
                    <p><strong>Número de pedido:</strong> #${orderNumber}</p>
                    <p><strong>Total:</strong> ${this.formatPrice(orderData.total)}</p>
                    <p><strong>Tiempo estimado:</strong> 25-35 minutos</p>
                    <p><strong>Entrega en:</strong> ${orderData.customer.address}</p>
                </div>
                <div class="success-actions">
                    <button class="btn-track" onclick="window.CartManager.trackOrder('${orderNumber}')">
                        <i class="fas fa-map-marker-alt"></i>
                        Seguir Pedido
                    </button>
                    <button class="btn-close-success" onclick="window.CartManager.closeOrderSuccess()">
                        Continuar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Auto close after 10 seconds
        setTimeout(() => {
            this.closeOrderSuccess(modal);
        }, 10000);
        
        this.addOrderSuccessStyles();
    }
    
    trackOrder(orderNumber) {
        if (typeof window.BurgerClub !== 'undefined') {
            window.BurgerClub.showNotification(
                `Seguimiento del pedido #${orderNumber} disponible por WhatsApp`,
                'info'
            );
        }
        
        // Open WhatsApp with tracking message
        const message = encodeURIComponent(`Hola! Quiero hacer seguimiento de mi pedido #${orderNumber}`);
        window.open(`https://wa.me/571234567890?text=${message}`, '_blank');
        
        this.closeOrderSuccess();
    }
    
    closeOrderSuccess(modal = null) {
        const successModal = modal || document.querySelector('.order-success-modal');
        if (successModal) {
            successModal.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(successModal)) {
                    document.body.removeChild(successModal);
                }
            }, 300);
        }
    }
    
    closeCheckout(modal = null) {
        const checkoutModal = modal || document.querySelector('.checkout-modal');
        if (checkoutModal) {
            checkoutModal.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(checkoutModal)) {
                    document.body.removeChild(checkoutModal);
                }
            }, 300);
        }
    }
    
    // ========== STORAGE ==========
    saveToStorage() {
        try {
            const cartData = {
                items: this.items,
                total: this.total,
                timestamp: Date.now()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(cartData));
        } catch (error) {
            console.warn('Could not save cart to localStorage:', error);
        }
    }
    
    loadFromStorage() {
        try {
            const savedCart = localStorage.getItem(this.storageKey);
            if (savedCart) {
                const cartData = JSON.parse(savedCart);
                
                // Check if cart is not too old (24 hours)
                const dayInMs = 24 * 60 * 60 * 1000;
                if (Date.now() - cartData.timestamp < dayInMs) {
                    this.items = cartData.items || [];
                    this.calculateTotal();
                    console.log('🔄 Cart loaded from storage');
                }
            }
        } catch (error) {
            console.warn('Could not load cart from localStorage:', error);
            this.items = [];
            this.total = 0;
        }
    }
    
    // ========== UTILITIES ==========
    formatPrice(price) {
   return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(price);
    }

    // ========== STYLES ==========
    addCartItemStyles() {
        if (document.getElementById('cart-item-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'cart-item-styles';
        style.textContent = `
            .cart-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 20px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                animation: fadeInUp 0.3s ease;
            }
            .cart-item:last-child {
                border-bottom: none;
            }
            .cart-item-image {
                width: 60px;
                height: 60px;
                border-radius: var(--border-radius-small);
                overflow: hidden;
                flex-shrink: 0;
            }
            .cart-item-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .cart-item-details {
                flex: 1;
            }
            .cart-item-name {
                color: var(--color-text-primary);
                font-size: 1.1rem;
                margin: 0 0 5px 0;
            }
            .cart-item-price {
                color: var(--color-cta-stroke);
                font-weight: 600;
                margin: 0;
            }
            .cart-item-controls {
                display: flex;
                align-items: center;
                gap: 10px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: var(--border-radius-small);
                padding: 5px;
            }
            .quantity-btn {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: var(--color-cta-stroke);
                color: var(--color-background);
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                transition: all 0.3s ease;
            }
            .quantity-btn:hover {
                background: var(--color-white);
                transform: scale(1.1);
            }
            .quantity-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .quantity-display {
                color: var(--color-text-primary);
                font-weight: 600;
                min-width: 20px;
                text-align: center;
            }
            .remove-item-btn {
                width: 35px;
                height: 35px;
                border-radius: 50%;
                background: var(--color-danger);
                color: var(--color-white);
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.9rem;
                transition: all 0.3s ease;
                flex-shrink: 0;
            }
            .remove-item-btn:hover {
                background: #d32f2f;
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);
    }
    
    addCheckoutStyles() {
        if (document.getElementById('checkout-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'checkout-styles';
        style.textContent = `
            .checkout-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 3000;
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            .checkout-modal.active {
                opacity: 1;
                visibility: visible;
            }
            .checkout-modal-content {
                background: var(--color-background);
                border-radius: var(--border-radius);
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                border: 2px solid var(--color-cta-stroke);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            .checkout-modal.active .checkout-modal-content {
                transform: scale(1);
            }
            .checkout-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 25px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            .checkout-modal-header h3 {
                color: var(--color-text-primary);
                margin: 0;
            }
            .checkout-close {
                background: none;
                border: none;
                font-size: 2rem;
                color: var(--color-text-primary);
                cursor: pointer;
                transition: color 0.3s ease;
            }
            .checkout-close:hover {
                color: var(--color-danger);
            }
            .checkout-modal-body {
                padding: 25px;
            }
            .checkout-summary {
                background: rgba(255, 255, 255, 0.05);
                border-radius: var(--border-radius-small);
                padding: 20px;
                margin-bottom: 25px;
            }
            .checkout-summary h4 {
                color: var(--color-text-primary);
                margin-bottom: 15px;
            }
            .checkout-items {
                margin-bottom: 15px;
            }
            .checkout-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                color: var(--color-text-secondary);
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            .checkout-item:last-child {
                border-bottom: none;
            }
            .checkout-total {
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                color: var(--color-cta-stroke);
                font-size: 1.2rem;
            }
            .checkout-form h4 {
                color: var(--color-text-primary);
                margin-bottom: 15px;
            }
            .form-group {
                margin-bottom: 20px;
            }
            .form-group input,
            .form-group textarea {
                width: 100%;
                padding: 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: var(--border-radius-small);
                color: var(--color-text-primary);
                font-family: var(--font-primary);
                font-size: 1rem;
                transition: all 0.3s ease;
            }
            .form-group input:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: var(--color-cta-stroke);
                box-shadow: 0 0 0 2px rgba(251, 181, 181, 0.2);
            }
            .form-group input::placeholder,
            .form-group textarea::placeholder {
                color: var(--color-text-secondary);
            }
            .payment-methods {
                margin-bottom: 25px;
            }
            .payment-methods h4 {
                margin-bottom: 15px;
            }
            .payment-option {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: var(--border-radius-small);
                margin-bottom: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .payment-option:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            .payment-option input[type="radio"] {
                width: auto;
                margin: 0;
            }
            .payment-option span {
                color: var(--color-text-primary);
                font-size: 1rem;
            }
            .checkout-actions {
                display: flex;
                gap: 15px;
            }
            .btn-cancel,
            .btn-confirm {
                flex: 1;
                padding: 15px;
                border: none;
                border-radius: var(--border-radius-small);
                font-family: var(--font-primary);
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .btn-cancel {
                background: rgba(255, 255, 255, 0.1);
                color: var(--color-text-primary);
            }
            .btn-cancel:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            .btn-confirm {
                background: var(--color-cta-stroke);
                color: var(--color-background);
            }
            .btn-confirm:hover {
                background: var(--color-white);
            }
            .btn-confirm:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
    }
    
    addOrderSuccessStyles() {
        if (document.getElementById('order-success-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'order-success-styles';
        style.textContent = `
            .order-success-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 3500;
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            .order-success-modal.active {
                opacity: 1;
                visibility: visible;
            }
            .order-success-content {
                background: var(--color-background);
                border-radius: var(--border-radius);
                padding: 40px;
                text-align: center;
                max-width: 500px;
                width: 90%;
                border: 2px solid var(--color-success);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            .order-success-modal.active .order-success-content {
                transform: scale(1);
            }
            .success-icon {
                font-size: 4rem;
                color: var(--color-success);
                margin-bottom: 20px;
            }
            .order-success-content h3 {
                color: var(--color-text-primary);
                font-size: 2rem;
                margin-bottom: 25px;
            }
            .order-details {
                background: rgba(255, 255, 255, 0.05);
                border-radius: var(--border-radius-small);
                padding: 20px;
                margin-bottom: 25px;
                text-align: left;
            }
            .order-details p {
                color: var(--color-text-secondary);
                margin-bottom: 10px;
            }
            .order-details strong {
                color: var(--color-text-primary);
            }
            .success-actions {
                display: flex;
                gap: 15px;
            }
            .btn-track,
            .btn-close-success {
                flex: 1;
                padding: 12px 20px;
                border: none;
                border-radius: var(--border-radius-small);
                font-family: var(--font-primary);
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            .btn-track {
                background: var(--color-success);
                color: var(--color-white);
            }
            .btn-track:hover {
                background: #45a049;
            }
            .btn-close-success {
                background: var(--color-cta-stroke);
                color: var(--color-background);
            }
            .btn-close-success:hover {
                background: var(--color-white);
            }
        `;
        document.head.appendChild(style);
    }
}

// ========== INITIALIZE CART MANAGER ==========
document.addEventListener('DOMContentLoaded', function() {
    window.CartManager = new CartManager();
});

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', function(e) {
    // ESC to close cart
    if (e.key === 'Escape' && window.CartManager && window.CartManager.isOpen) {
        window.CartManager.closeCart();
    }
    
    // Ctrl+Shift+C to open cart (for power users)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        if (window.CartManager) {
            window.CartManager.openCart();
        }
    }
});

// ========== EXPORT FOR GLOBAL ACCESS ==========
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}