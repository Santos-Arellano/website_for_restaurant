// burger-club/burgur/src/main/resources/static/js/modules/menu/product-detail.js

class ProductDetailModal {
    constructor() {
        this.currentModal = null;
        this.selectedAdicionales = new Map(); // Map<adicionalId, adicional>
        this.addModalStyles();
    }
    
    async showProductDetail(productId) {
        try {
            const response = await fetch(`/menu/api/productos/${productId}`);
            if (!response.ok) {
                throw new Error('Error al cargar el producto');
            }
            
            const data = await response.json();
            const product = data.producto || data;
            const adicionales = data.adicionalesPermitidos || [];
            
            this.createProductModal(product, adicionales);
        } catch (error) {
            console.error('Error loading product details:', error);
            this.showNotification('Error al cargar los detalles del producto', 'error');
        }
    }
    
    createProductModal(product, adicionales) {
        this.selectedAdicionales.clear();
        
        const modal = document.createElement('div');
        modal.className = 'product-detail-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${product.nombre}</h2>
                    <button class="modal-close" type="button">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="product-detail-grid">
                        <div class="product-image-section">
                            <img src="${product.imgURL}" alt="${product.nombre}" class="product-detail-image" 
                                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect width=%22300%22 height=%22200%22 fill=%22%234ecdc4%22/%3E%3Ctext x=%22150%22 y=%22110%22 font-size=%2240%22 text-anchor=%22middle%22%3E🍔%3C/text%3E%3C/svg%3E'">
                            
                            ${product.nuevo ? '<div class="product-badge nuevo">Nuevo</div>' : ''}
                            ${product.popular && !product.nuevo ? '<div class="product-badge popular">Popular</div>' : ''}
                        </div>
                        
                        <div class="product-info-section">
                            <div class="product-category">${this.capitalizeFirst(product.categoria)}</div>
                            
                            ${product.descripcion ? `
                                <div class="product-description">
                                    <h3>Descripción</h3>
                                    <p>${product.descripcion}</p>
                                </div>
                            ` : ''}
                            
                            ${product.ingredientes && product.ingredientes.length > 0 ? `
                                <div class="product-ingredients">
                                    <h3>Ingredientes</h3>
                                    <div class="ingredients-list">
                                        ${product.ingredientes.map(ing => `<span class="ingredient-tag">${ing}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="product-price-section">
                                <div class="base-price">
                                    <span class="price-label">Precio base:</span>
                                    <span class="base-price-value">$${this.formatPrice(product.precio)}</span>
                                </div>
                                <div class="total-price">
                                    <span class="total-label">Total:</span>
                                    <span class="total-price-value" id="totalPrice">$${this.formatPrice(product.precio)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    ${adicionales.length > 0 ? `
                        <div class="adicionales-section">
                            <h3 class="adicionales-title">
                                <i class="fas fa-plus-circle"></i>
                                Adicionales Disponibles (${adicionales.length})
                            </h3>
                            <div class="adicionales-grid">
                                ${adicionales.map(adicional => `
                                    <div class="adicional-item" data-id="${adicional.id}">
                                        <div class="adicional-content">
                                            <div class="adicional-info">
                                                <span class="adicional-name">${adicional.nombre}</span>
                                                <span class="adicional-price">+$${this.formatPrice(adicional.precio)}</span>
                                            </div>
                                            <label class="adicional-checkbox">
                                                <input type="checkbox" data-id="${adicional.id}" data-name="${adicional.nombre}" data-price="${adicional.precio}">
                                                <span class="checkmark"></span>
                                            </label>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : `
                        <div class="no-adicionales">
                            <i class="fas fa-info-circle"></i>
                            <p>No hay adicionales disponibles para este producto</p>
                        </div>
                    `}
                </div>
                
                <div class="modal-footer">
                    <div class="quantity-selector">
                        <button type="button" class="qty-btn" id="decreaseQty">-</button>
                        <span class="quantity-display" id="quantity">1</span>
                        <button type="button" class="qty-btn" id="increaseQty">+</button>
                    </div>
                    
                    <button class="add-to-cart-btn" id="addToCartBtn" data-product='${JSON.stringify(product)}'>
                        <i class="fas fa-shopping-cart"></i>
                        Agregar al Carrito
                    </button>
                </div>
            </div>
        `;
        
        this.bindModalEvents(modal, product);
        this.showModal(modal);
    }
    
    bindModalEvents(modal, product) {
        const closeBtn = modal.querySelector('.modal-close');
        const addToCartBtn = modal.querySelector('#addToCartBtn');
        const decreaseBtn = modal.querySelector('#decreaseQty');
        const increaseBtn = modal.querySelector('#increaseQty');
        const quantityDisplay = modal.querySelector('#quantity');
        const adicionalCheckboxes = modal.querySelectorAll('input[type="checkbox"]');
        
        let quantity = 1;
        
        // Close modal
        closeBtn.addEventListener('click', () => this.closeModal(modal));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
        
        // Quantity controls
        decreaseBtn.addEventListener('click', () => {
            if (quantity > 1) {
                quantity--;
                quantityDisplay.textContent = quantity;
                this.updateTotalPrice(product.precio);
            }
        });
        
        increaseBtn.addEventListener('click', () => {
            if (quantity < 10) {
                quantity++;
                quantityDisplay.textContent = quantity;
                this.updateTotalPrice(product.precio);
            }
        });
        
        // Adicionales selection
        adicionalCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const adicionalId = parseInt(e.target.dataset.id);
                const adicionalName = e.target.dataset.name;
                const adicionalPrice = parseFloat(e.target.dataset.price);
                
                if (e.target.checked) {
                    this.selectedAdicionales.set(adicionalId, {
                        id: adicionalId,
                        nombre: adicionalName,
                        precio: adicionalPrice
                    });
                } else {
                    this.selectedAdicionales.delete(adicionalId);
                }
                
                this.updateTotalPrice(product.precio);
            });
        });
        
        // Add to cart
        addToCartBtn.addEventListener('click', () => {
            const cartItem = {
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                imagen: product.imgURL,
                categoria: product.categoria,
                cantidad: quantity,
                adicionales: Array.from(this.selectedAdicionales.values()),
                subtotal: this.calculateTotal(product.precio) * quantity
            };
            
            this.addToCart(cartItem);
            this.closeModal(modal);
        });
        
        // ESC key support
        this.escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
            }
        };
        document.addEventListener('keydown', this.escHandler);
    }
    
    updateTotalPrice(basePrice) {
        const quantity = parseInt(document.querySelector('#quantity').textContent);
        const total = this.calculateTotal(basePrice) * quantity;
        document.querySelector('#totalPrice').textContent = `$${this.formatPrice(total)}`;
    }
    
    calculateTotal(basePrice) {
        let total = basePrice;
        this.selectedAdicionales.forEach(adicional => {
            total += adicional.precio;
        });
        return total;
    }
    
    addToCart(item) {
        // Integration with existing cart system
        if (window.BurgerClub && window.BurgerClub.cart) {
            window.BurgerClub.cart.addItem(item);
        } else {
            // Fallback: trigger cart event
            const event = new CustomEvent('addToCart', { detail: item });
            document.dispatchEvent(event);
        }
        
        this.showNotification(`${item.nombre} agregado al carrito`, 'success');
    }
    
    showModal(modal) {
        if (this.currentModal) {
            this.closeModal(this.currentModal);
        }
        
        this.currentModal = modal;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }
    
    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
            if (this.currentModal === modal) {
                this.currentModal = null;
            }
        }, 300);
        
        if (this.escHandler) {
            document.removeEventListener('keydown', this.escHandler);
            this.escHandler = null;
        }
    }
    
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    formatPrice(price) {
        return Math.floor(price).toLocaleString('es-CO');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `detail-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    addModalStyles() {
        if (document.getElementById('product-detail-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'product-detail-styles';
        style.textContent = `
            .product-detail-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 1000;
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .product-detail-modal.active {
                opacity: 1;
                visibility: visible;
            }
            
            .product-detail-modal .modal-content {
                background: #12372a;
                border: 2px solid #fbb5b5;
                border-radius: 12px;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .product-detail-modal.active .modal-content {
                transform: scale(1);
            }
            
            .product-detail-modal .modal-header {
                padding: 25px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: linear-gradient(135deg, rgba(251, 181, 181, 0.2) 0%, rgba(18, 55, 42, 0.8) 100%);
            }
            
            .product-detail-modal .modal-header h2 {
                color: white;
                margin: 0;
                font-family: 'Lexend Zetta', sans-serif;
                font-size: 1.5rem;
            }
            
            .product-detail-modal .modal-close {
                background: none;
                border: none;
                font-size: 2rem;
                color: white;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .product-detail-modal .modal-close:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .product-detail-modal .modal-body {
                padding: 25px;
            }
            
            .product-detail-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 30px;
            }
            
            .product-image-section {
                position: relative;
            }
            
            .product-detail-image {
                width: 100%;
                height: 250px;
                object-fit: cover;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            
            .product-badge {
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .product-badge.nuevo {
                background: rgba(255, 20, 20, 0.9);
                color: white;
            }
            
            .product-badge.popular {
                background: rgba(249, 255, 0, 0.9);
                color: #333;
            }
            
            .product-info-section {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .product-category {
                color: #fbb5b5;
                font-weight: 600;
                text-transform: uppercase;
                font-size: 0.9rem;
                letter-spacing: 1px;
            }
            
            .product-description h3,
            .product-ingredients h3 {
                color: white;
                font-size: 1.1rem;
                margin-bottom: 10px;
                font-family: 'Lexend Zetta', sans-serif;
            }
            
            .product-description p {
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.5;
            }
            
            .ingredients-list {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }
            
            .ingredient-tag {
                background: rgba(251, 181, 181, 0.2);
                color: #fbb5b5;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.8rem;
                font-weight: 500;
            }
            
            .product-price-section {
                background: rgba(255, 255, 255, 0.05);
                padding: 15px;
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .base-price,
            .total-price {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .total-price {
                margin-bottom: 0;
                padding-top: 8px;
                border-top: 1px solid rgba(255, 255, 255, 0.2);
                font-weight: 700;
            }
            
            .price-label,
            .total-label {
                color: rgba(255, 255, 255, 0.8);
            }
            
            .base-price-value,
            .total-price-value {
                color: #fbb5b5;
                font-weight: 700;
                font-size: 1.1rem;
            }
            
            .adicionales-section {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .adicionales-title {
                color: white;
                font-size: 1.2rem;
                margin-bottom: 20px;
                font-family: 'Lexend Zetta', sans-serif;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .adicionales-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 12px;
            }
            
            .adicional-item {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 12px;
                transition: all 0.3s ease;
            }
            
            .adicional-item:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: #fbb5b5;
            }
            
            .adicional-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .adicional-info {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .adicional-name {
                color: white;
                font-weight: 600;
                font-size: 0.95rem;
            }
            
            .adicional-price {
                color: #fbb5b5;
                font-weight: 600;
                font-size: 0.9rem;
            }
            
            .adicional-checkbox {
                cursor: pointer;
                position: relative;
                display: flex;
                align-items: center;
            }
            
            .adicional-checkbox input[type="checkbox"] {
                width: 20px;
                height: 20px;
                margin: 0;
                cursor: pointer;
            }
            
            .no-adicionales {
                text-align: center;
                padding: 30px;
                color: rgba(255, 255, 255, 0.6);
                border: 1px dashed rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                margin-top: 20px;
            }
            
            .no-adicionales i {
                font-size: 2rem;
                margin-bottom: 10px;
                opacity: 0.5;
            }
            
            .modal-footer {
                padding: 25px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(255, 255, 255, 0.02);
            }
            
            .quantity-selector {
                display: flex;
                align-items: center;
                gap: 10px;
                background: rgba(255, 255, 255, 0.1);
                padding: 8px;
                border-radius: 8px;
            }
            
            .qty-btn {
                width: 30px;
                height: 30px;
                border: none;
                background: #fbb5b5;
                color: #12372a;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 700;
                font-size: 1.1rem;
                transition: all 0.3s ease;
            }
            
            .qty-btn:hover {
                background: #e8a3a3;
                transform: scale(1.1);
            }
            
            .quantity-display {
                color: white;
                font-weight: 700;
                font-size: 1.1rem;
                min-width: 20px;
                text-align: center;
            }
            
            .add-to-cart-btn {
                background: #4caf50;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-family: 'Sansita Swashed', cursive;
                font-weight: 700;
                font-size: 1rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
            }
            
            .add-to-cart-btn:hover {
                background: #45a049;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
            }
            
            .detail-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #12372a;
                border: 2px solid;
                border-radius: 8px;
                padding: 15px 20px;
                z-index: 2000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                min-width: 300px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            
            .detail-notification.show {
                transform: translateX(0);
            }
            
            .detail-notification.success {
                border-color: #4caf50;
                color: #4caf50;
            }
            
            .detail-notification.error {
                border-color: #ff6b6b;
                color: #ff6b6b;
            }
            
            .detail-notification .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                font-family: 'Sansita Swashed', cursive;
                font-size: 14px;
            }
            
            @media (max-width: 768px) {
                .product-detail-grid {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
                
                .adicionales-grid {
                    grid-template-columns: 1fr;
                }
                
                .modal-footer {
                    flex-direction: column;
                    gap: 15px;
                }
                
                .add-to-cart-btn {
                    width: 100%;
                    justify-content: center;
                }
            }
            
            @media (max-width: 480px) {
                .product-detail-modal .modal-content {
                    width: 95%;
                    margin: 10px;
                }
                
                .product-detail-modal .modal-header,
                .product-detail-modal .modal-body,
                .product-detail-modal .modal-footer {
                    padding: 20px 15px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize and make globally available
window.ProductDetailModal = ProductDetailModal;

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productDetailModal = new ProductDetailModal();
    
    // Add click handlers to existing menu cards
    const menuCards = document.querySelectorAll('.menu-card');
    menuCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking the add to cart button directly
            if (e.target.closest('.btn-add-cart')) {
                return;
            }
            
            const productId = card.getAttribute('data-id') || 
                            card.getAttribute('data-product-id');
            
            if (productId) {
                window.productDetailModal.showProductDetail(productId);
            }
        });
        
        // Add cursor pointer and hover effect
        card.style.cursor = 'pointer';
        card.title = 'Click para ver detalles y adicionales';
    });
});

export default ProductDetailModal;