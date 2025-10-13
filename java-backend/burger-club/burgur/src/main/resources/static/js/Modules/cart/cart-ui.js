//burger-club/burgur/src/main/resources/static/js/Modules/cart/cart-ui.js
// ==========================================
// BURGER CLUB - CART UI MODULE
// ==========================================

import { formatPrice } from '../../utils/helpers.js';

export class CartUI {
    constructor(cartManager) {
        this.cartManager = cartManager;
        this.init();
    }
    
    init() {
        this.bindCartItemEvents();
        console.log('🎨 Cart UI initialized');
    }
    
    bindCartItemEvents() {
        // Bind events for cart items that are dynamically created
        document.addEventListener('click', (e) => {
            // Handle quantity buttons
            if (e.target.closest('.quantity-btn')) {
                this.handleQuantityChange(e);
            }
            
            // Handle remove item buttons
            if (e.target.closest('.remove-item-btn')) {
                this.handleRemoveItem(e);
            }
        });
    }
    
    handleQuantityChange(e) {
        const button = e.target.closest('.quantity-btn');
        const cartItem = button.closest('.cart-item');
        const itemId = parseInt(cartItem.dataset.id);
        const currentQuantity = parseInt(cartItem.querySelector('.quantity-display').textContent);
        
        let newQuantity = currentQuantity;
        
        if (button.querySelector('.fa-plus')) {
            newQuantity += 1;
        } else if (button.querySelector('.fa-minus')) {
            newQuantity -= 1;
        }
        
        this.cartManager.updateQuantity(itemId, newQuantity);
        
        // Add visual feedback
        this.addButtonClickAnimation(button);
    }
    
    handleRemoveItem(e) {
        const button = e.target.closest('.remove-item-btn');
        const cartItem = button.closest('.cart-item');
        const itemId = parseInt(cartItem.dataset.id);
        
        // Add remove animation
        this.addRemoveAnimation(cartItem);
        
        setTimeout(() => {
            this.cartManager.removeItem(itemId);
        }, 200);
    }
    
    addButtonClickAnimation(button) {
        button.classList.add('animate-pulse');
        setTimeout(() => {
            button.classList.remove('animate-pulse');
        }, 200);
    }
    
    addRemoveAnimation(cartItem) {
        cartItem.style.transition = 'all 0.3s ease';
        cartItem.style.opacity = '0';
        cartItem.style.transform = 'translateX(20px)';
    }
    
    createCartItemElement(item) {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.id = item.id;
        
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-price">${formatPrice(item.price)}</p>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" data-action="decrease">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn" data-action="increase">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <button class="remove-item-btn" title="Eliminar">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        return cartItem;
    }
    
    updateCartItemQuantity(itemId, newQuantity) {
        const cartItem = document.querySelector(`[data-id="${itemId}"]`);
        if (cartItem) {
            const quantityDisplay = cartItem.querySelector('.quantity-display');
            quantityDisplay.textContent = newQuantity;
            
            // Add update animation
            quantityDisplay.classList.add('animate-pulse');
            setTimeout(() => {
                quantityDisplay.classList.remove('animate-pulse');
            }, 300);
        }
    }
    
    removeCartItemElement(itemId) {
        const cartItem = document.querySelector(`[data-id="${itemId}"]`);
        if (cartItem) {
            this.addRemoveAnimation(cartItem);
            setTimeout(() => {
                cartItem.remove();
            }, 300);
        }
    }
    
    showEmptyState() {
        const cartItems = document.getElementById('cartItems');
        if (cartItems) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Tu carrito está vacío</p>
                    <small>Agrega algunos productos deliciosos</small>
                </div>
            `;
        }
    }
    
    animateCartOpen() {
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.classList.add('opening');
            setTimeout(() => {
                cartModal.classList.remove('opening');
            }, 300);
        }
    }
    
    animateItemAdd(item) {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = 'cart-add-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <img src="${item.image}" alt="${item.name}">
                <span>${item.name} agregado al carrito</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
        
        this.addCartNotificationStyles();
    }
    
    addCartNotificationStyles() {
        if (document.getElementById('cart-ui-styles')) return;
        
        const link = document.createElement('link');
        link.id = 'cart-ui-styles';
        link.rel = 'stylesheet';
        link.href = '/css/components/cart-ui.css';
        document.head.appendChild(link);
    }
}