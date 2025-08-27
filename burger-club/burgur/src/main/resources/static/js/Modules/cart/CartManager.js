//burger-club/burgur/src/main/resources/static/js/Modules/cart/CartManager.js
// ==========================================
// BURGER CLUB - CART MANAGER MODULE (FIXED)
// ==========================================

import { formatPrice, saveToLocalStorage, loadFromLocalStorage } from '../../utils/helpers.js';
import { CART_CONFIG, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../utils/constants.js';

export class CartManager {
    constructor() {
        this.items = [];
        this.total = 0;
        this.isOpen = false;
        this.storageKey = CART_CONFIG.storageKey;
        this.cartButtonsInitialized = false; // Evitar duplicados
        
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
        const mobileCartBtn = document.querySelector('#mobileCartLink');
        if (mobileCartBtn) {
            mobileCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCart();
            });
        }
        
        // USAR DELEGACIÓN DE EVENTOS en lugar de inicializar cada botón
        this.initializeCartButtonsDelegation();
    }
    
    // ========== FIXED: USAR DELEGACIÓN DE EVENTOS ==========
    initializeCartButtonsDelegation() {
        if (this.cartButtonsInitialized) return; // Evitar duplicados
        
        // Usar delegación de eventos en el documento
        document.addEventListener('click', (e) => {
            const addButton = e.target.closest('.btn-add-cart');
            if (!addButton) return;
            
            e.stopPropagation();
            
            const product = {
                name: addButton.dataset.product,
                price: parseInt(addButton.dataset.price),
                image: addButton.dataset.image
            };
            
            this.addItem(product);
            
            // Visual feedback
            this.createAddToCartAnimation(addButton, product);
        });
        
        this.cartButtonsInitialized = true;
        console.log('🛒 Cart buttons delegation initialized');
    }
    
    // MÉTODO PÚBLICO para que otros módulos agreguen productos sin duplicar eventos
    addProductToCart(product, sourceButton = null) {
        this.addItem(product);
        
        if (sourceButton) {
            this.createAddToCartAnimation(sourceButton, product);
        }
    }
    
    // ========== CART OPERATIONS ==========
    addItem(product) {
        // Normalizar el objeto producto para manejar diferentes estructuras
        const normalizedProduct = {
            id: product.id || Date.now(),
            name: product.name || product.nombre || 'Producto sin nombre',
            price: product.price || product.precio || 0,
            image: product.image || product.imagen || product.imgURL || 'images/default-burger.png',
            categoria: product.categoria || 'sin categoria',
            adicionales: product.adicionales || []
        };
        
        // Calcular precio total incluyendo adicionales
        const precioTotal = this.calculateItemPrice(normalizedProduct.price, normalizedProduct.adicionales);
        
        // Buscar item existente con el mismo nombre Y adicionales
        const existingItem = this.items.find(item => 
            item.name === normalizedProduct.name && 
            this.compareAdicionales(item.adicionales || [], normalizedProduct.adicionales)
        );
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: Date.now(),
                name: normalizedProduct.name,
                price: normalizedProduct.price,
                image: normalizedProduct.image,
                quantity: 1,
                adicionales: normalizedProduct.adicionales,
                precioBase: normalizedProduct.price,
                precioTotal: precioTotal
            });
        }
        
        this.calculateTotal();
        this.updateDisplay();
        this.saveToStorage();
        this.showAddAnimation();
        
        console.log(`➕ Added to cart: ${normalizedProduct.name}`);
        
        // Show notification
        if (window.BurgerClub?.showNotification) {
            window.BurgerClub.showNotification(
                `${normalizedProduct.name} agregado al carrito`, 
                'success'
            );
        }
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('itemAdded', {
            detail: { product: normalizedProduct, cart: this.items }
        }));
    }

    // Método para comparar adicionales
    compareAdicionales(adicionales1, adicionales2) {
        if (adicionales1.length !== adicionales2.length) return false;
        
        const sorted1 = adicionales1.map(a => a.id || a.nombre).sort();
        const sorted2 = adicionales2.map(a => a.id || a.nombre).sort();
        
        return sorted1.every((item, index) => item === sorted2[index]);
    }

    // Método para calcular precio con adicionales
    calculateItemPrice(basePrice, adicionales) {
        let total = basePrice;
        if (adicionales && adicionales.length > 0) {
            adicionales.forEach(adicional => {
                total += adicional.precio || 0;
            });
        }
        return total;
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
            if (window.BurgerClub?.showNotification) {
                window.BurgerClub.showNotification(
                    `${removedItem.name} eliminado del carrito`, 
                    'info'
                );
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
        
        if (window.BurgerClub?.showNotification) {
            window.BurgerClub.showNotification('Carrito limpiado', 'info');
        }
        
        console.log('🗑️ Cart cleared');
    }
    
    calculateTotal() {
        this.total = this.items.reduce((sum, item) => {
            const itemPrice = item.precioTotal || item.price;
            return sum + (itemPrice * item.quantity);
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
        
        this.cartItems.innerHTML = this.items.map(item => {
            const itemPrice = item.precioTotal || item.price;
            const adicionalesText = item.adicionales && item.adicionales.length > 0
                ? `<div class="cart-item-extras">+ ${item.adicionales.map(a => a.nombre).join(', ')}</div>`
                : '';
                
            return `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}" loading="lazy">
                    </div>
                    <div class="cart-item-details">
                        <h4 class="cart-item-name">${item.name}</h4>
                        ${adicionalesText}
                        <p class="cart-item-price">${formatPrice(itemPrice)}</p>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="window.BurgerClub.cart.updateQuantity(${item.id}, ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="window.BurgerClub.cart.updateQuantity(${item.id}, ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-item-btn" onclick="window.BurgerClub.cart.removeItem(${item.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');
    }
    
    updateCartTotal() {
        if (this.cartTotal) {
            this.cartTotal.textContent = formatPrice(this.total);
        }
        
        // Update checkout button state
        if (this.checkoutBtn) {
            if (this.items.length === 0) {
                this.checkoutBtn.disabled = true;
                this.checkoutBtn.textContent = 'Carrito Vacío';
            } else {
                this.checkoutBtn.disabled = false;
                this.checkoutBtn.textContent = `Proceder al Pago (${formatPrice(this.total)})`;
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
    
    createAddToCartAnimation(button, product) {
        button.classList.add('animate-bounce');
        
        // Create floating animation
        this.createFloatingIcon(button, product);
        
        setTimeout(() => {
            button.classList.remove('animate-bounce');
        }, 600);
    }
    
    createFloatingIcon(button, product) {
        const icon = document.createElement('div');
        icon.className = 'floating-cart-icon';
        icon.innerHTML = '<i class="fas fa-hamburger"></i>';

        const rect = button.getBoundingClientRect();
        const cartBtn = document.getElementById('cartBtn');
        if (!cartBtn) return;
        
        const cartRect = cartBtn.getBoundingClientRect();

        icon.style.cssText = `
            position: fixed;
            top: ${rect.top + rect.height/2}px;
            left: ${rect.left + rect.width/2}px;
            width: 30px;
            height: 30px;
            background: var(--color-cta-stroke);
            color: var(--color-background);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1001;
            pointer-events: none;
            font-size: 14px;
            animation: floatToCart 1s ease-out forwards;
        `;

        document.body.appendChild(icon);

        // Calculate animation path
        const deltaX = cartRect.left + cartRect.width/2 - (rect.left + rect.width/2);
        const deltaY = cartRect.top + cartRect.height/2 - (rect.top + rect.height/2);

        icon.style.setProperty('--deltaX', deltaX + 'px');
        icon.style.setProperty('--deltaY', deltaY + 'px');

        setTimeout(() => {
            icon.remove();
        }, 1000);

        // Add floating animation styles if not exists
        this.addFloatingAnimationStyles();
    }
    
    // ========== CHECKOUT ==========
    checkout() {
        if (this.items.length === 0) {
            if (window.BurgerClub?.showNotification) {
                window.BurgerClub.showNotification('Tu carrito está vacío', 'warning');
            }
            return;
        }
        
        // Simulate checkout process
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
                            ${this.items.map(item => {
                                const itemPrice = item.precioTotal || item.price;
                                const adicionalesText = item.adicionales && item.adicionales.length > 0
                                    ? ` (+ ${item.adicionales.map(a => a.nombre).join(', ')})`
                                    : '';
                                return `
                                    <div class="checkout-item">
                                        <span>${item.name}${adicionalesText} x${item.quantity}</span>
                                        <span>${formatPrice(itemPrice * item.quantity)}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <div class="checkout-total">
                            <strong>Total: ${formatPrice(this.total)}</strong>
                        </div>
                    </div>
                    
                    <form class="checkout-form">
                        <h4>Información de contacto:</h4>
                        <div class="form-group">
                            <input type="text" placeholder="Nombre completo" required>
                        </div>
                        <div class="form-group">
                            <input type="tel" placeholder="Teléfono" required>
                        </div>
                        <div class="form-group">
                            <textarea placeholder="Dirección de entrega" rows="3" required></textarea>
                        </div>
                        
                        <div class="checkout-actions">
                            <button type="button" class="btn-cancel">Cancelar</button>
                            <button type="submit" class="btn-confirm">Confirmar Pedido</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('.checkout-close').addEventListener('click', () => {
            this.closeCheckoutModal(modal);
        });
        
        modal.querySelector('.btn-cancel').addEventListener('click', () => {
            this.closeCheckoutModal(modal);
        });
        
        modal.querySelector('.checkout-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processOrder(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeCheckoutModal(modal);
            }
        });
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }
    
    processOrder(modal) {
        const submitBtn = modal.querySelector('.btn-confirm');
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        submitBtn.disabled = true;
        
        // Simulate order processing
        setTimeout(() => {
            const orderNumber = Math.random().toString(36).substr(2, 9).toUpperCase();
            
            if (window.BurgerClub?.showNotification) {
                window.BurgerClub.showNotification(
                    `¡Pedido confirmado! #${orderNumber}. Tiempo estimado: 25-35 min`,
                    'success'
                );
            }
            
            this.clearCart();
            this.closeCheckoutModal(modal);
            this.closeCart();
        }, 2000);
    }
    
    closeCheckoutModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 300);
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
    
    // ========== UTILITY METHODS ==========
    addFloatingAnimationStyles() {
        if (document.getElementById('floating-animation-styles')) return;

        const style = document.createElement('style');
        style.id = 'floating-animation-styles';
        style.textContent = `
            @keyframes floatToCart {
                0% {
                    transform: translate(0, 0) scale(1);
                    opacity: 1;
                }
                50% {
                    transform: translate(calc(var(--deltaX) * 0.5), calc(var(--deltaY) * 0.3)) scale(1.2);
                    opacity: 0.8;
                }
                100% {
                    transform: translate(var(--deltaX), var(--deltaY)) scale(0.3);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // ========== PUBLIC API ==========
    getItems() {
        return [...this.items];
    }
    
    getTotal() {
        return this.total;
    }
    
    getItemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    isEmpty() {
        return this.items.length === 0;
    }
}