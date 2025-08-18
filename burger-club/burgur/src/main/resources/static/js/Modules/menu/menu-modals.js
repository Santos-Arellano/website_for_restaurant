// ==========================================
// BURGER CLUB - MENU MODALS MODULE
// ==========================================

import { formatPrice } from '../../utils/helpers.js';

export class ItemDetailsModal {
    constructor(item) {
        this.item = item;
        this.modal = null;
        this.quantity = 1;
        
        this.create();
    }
    
    create() {
        this.modal = document.createElement('div');
        this.modal.className = 'item-details-modal';
        this.modal.innerHTML = this.generateModalHTML();
        
        document.body.appendChild(this.modal);
        
        this.bindEvents();
        this.show();
    }
    
    generateModalHTML() {
        return `
            <div class="item-details-content">
                <button class="item-details-close" aria-label="Cerrar">&times;</button>

                <div class="item-details-body two-col">
                    <!-- Columna IZQUIERDA: título + imagen -->
                    <div class="item-col-left">
                        <h2 class="item-title">${this.item.name}</h2>

                        <div class="item-figure">
                            <img src="${this.item.image}" alt="${this.item.name}">
                            ${this.item.isNew ? '<span class="detail-badge new">Nuevo</span>' : ''}
                            ${this.item.popular ? '<span class="detail-badge popular">Popular</span>' : ''}
                        </div>
                    </div>

                    <!-- Columna DERECHA: texto + ingredientes + precio/acciones -->
                    <div class="item-col-right">
                        <p class="item-details-description">${this.item.description}</p>

                        ${this.item.ingredients && this.item.ingredients.length ? `
                            <div class="item-ingredients">
                                <h4>Ingredientes:</h4>
                                <ul class="ingredients-list">
                                    ${this.item.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}

                        <div class="item-details-footer">
                            <div class="item-price-section">
                                <span class="item-detail-price">${formatPrice(this.item.price)}</span>
                                <small class="price-note">Precio incluye IVA</small>
                            </div>

                            <div class="item-actions">
                                <div class="quantity-selector">
                                    <button class="qty-btn minus">−</button>
                                    <span class="qty-display" id="modalQuantity">1</span>
                                    <button class="qty-btn plus">+</button>
                                </div>

                                <button class="btn-add-to-cart-modal">
                                    <i class="fas fa-shopping-cart"></i>
                                    Agregar al Carrito
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    bindEvents() {
        // Close button
        const closeBtn = this.modal.querySelector('.item-details-close');
        closeBtn.addEventListener('click', () => this.close());
        
        // Close on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
        
        // Quantity controls
        const minusBtn = this.modal.querySelector('.qty-btn.minus');
        const plusBtn = this.modal.querySelector('.qty-btn.plus');
        const quantityDisplay = this.modal.querySelector('#modalQuantity');
        
        minusBtn.addEventListener('click', () => {
            this.changeQuantity(-1);
        });
        
        plusBtn.addEventListener('click', () => {
            this.changeQuantity(1);
        });
        
        // Add to cart button
        const addBtn = this.modal.querySelector('.btn-add-to-cart-modal');
        addBtn.addEventListener('click', () => {
            this.addToCart();
        });
        
        // Keyboard events
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }
    
    handleKeydown(e) {
        if (!this.modal.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                this.close();
                break;
            case 'ArrowUp':
            case '+':
                e.preventDefault();
                this.changeQuantity(1);
                break;
            case 'ArrowDown':
            case '-':
                e.preventDefault();
                this.changeQuantity(-1);
                break;
            case 'Enter':
                e.preventDefault();
                this.addToCart();
                break;
        }
    }
    
    changeQuantity(delta) {
        this.quantity = Math.max(1, Math.min(10, this.quantity + delta));
        
        const quantityDisplay = this.modal.querySelector('#modalQuantity');
        quantityDisplay.textContent = this.quantity;
        
        // Update button states
        const minusBtn = this.modal.querySelector('.qty-btn.minus');
        const plusBtn = this.modal.querySelector('.qty-btn.plus');
        
        minusBtn.disabled = this.quantity <= 1;
        plusBtn.disabled = this.quantity >= 10;
        
        // Add animation
        quantityDisplay.classList.add('animate-pulse');
        setTimeout(() => {
            quantityDisplay.classList.remove('animate-pulse');
        }, 200);
    }
    
    addToCart() {
        if (window.BurgerClub?.cart) {
            // Add items one by one to get proper notifications
            for (let i = 0; i < this.quantity; i++) {
                window.BurgerClub.cart.addItem({
                    name: this.item.name,
                    price: this.item.price,
                    image: this.item.image
                });
            }
            
            if (window.BurgerClub?.showNotification) {
                window.BurgerClub.showNotification(
                    `${this.quantity}x ${this.item.name} agregado al carrito 🍔`, 
                    'success'
                );
            }
            
            // Add visual feedback
            const addBtn = this.modal.querySelector('.btn-add-to-cart-modal');
            this.animateSuccess(addBtn);
            
            // Close modal after adding (optional)
            setTimeout(() => {
                this.close();
            }, 500);
        }
    }
    
    animateSuccess(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Agregado';
        button.style.background = 'var(--color-success)';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
            button.disabled = false;
        }, 1000);
    }
    
    show() {
        // Force reflow
        this.modal.offsetHeight;
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus management
        setTimeout(() => {
            const firstButton = this.modal.querySelector('.qty-btn.plus');
            if (firstButton) {
                firstButton.focus();
            }
        }, 100);
    }
    
    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Remove keyboard listener
        document.removeEventListener('keydown', this.handleKeydown.bind(this));
        
        setTimeout(() => {
            if (document.body.contains(this.modal)) {
                document.body.removeChild(this.modal);
            }
        }, 300);
    }
}

export class MenuSearchModal {
    constructor() {
        this.modal = null;
        this.searchInput = null;
        this.results = [];
        
        this.create();
    }
    
    create() {
        this.modal = document.createElement('div');
        this.modal.className = 'search-modal';
        this.modal.innerHTML = `
            <div class="search-modal-content">
                <div class="search-modal-header">
                    <h3>🔍 Buscar Productos</h3>
                    <button class="search-close">&times;</button>
                </div>
                <div class="search-modal-body">
                    <div class="search-input-container">
                        <input type="text" 
                               class="search-input" 
                               placeholder="Buscar hamburguesas, bebidas, postres..."
                               autocomplete="off">
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <div class="search-results" id="searchResults">
                        <p class="search-placeholder">Escribe para buscar productos...</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        
        this.bindEvents();
        this.show();
    }
    
    bindEvents() {
        this.searchInput = this.modal.querySelector('.search-input');
        const closeBtn = this.modal.querySelector('.search-close');
        
        // Close button
        closeBtn.addEventListener('click', () => this.close());
        
        // Close on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
        
        // Search input
        this.searchInput.addEventListener('input', this.debounce((e) => {
            this.handleSearch(e.target.value);
        }, 300));
        
        // Keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }
    
    handleSearch(searchTerm) {
        const resultsContainer = this.modal.querySelector('#searchResults');
        
        if (!searchTerm.trim()) {
            resultsContainer.innerHTML = '<p class="search-placeholder">Escribe para buscar productos...</p>';
            return;
        }
        
        // Get all menu cards and filter them
        const menuCards = document.querySelectorAll('.menu-card');
        const results = Array.from(menuCards).filter(card => {
            const name = (card.dataset.name || 
                card.querySelector('.menu-card-name')?.textContent || '').toLowerCase();
            const description = (card.dataset.desc || 
                card.querySelector('.menu-card-description')?.textContent || '').toLowerCase();
            const ingredients = (card.dataset.ingredients || '').toLowerCase();
            
            const term = searchTerm.toLowerCase();
            return name.includes(term) || description.includes(term) || ingredients.includes(term);
        });
        
        this.displayResults(results, searchTerm);
    }
    
    displayResults(results, searchTerm) {
        const resultsContainer = this.modal.querySelector('#searchResults');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No se encontraron productos para "${searchTerm}"</p>
                    <small>Intenta con otros términos de búsqueda</small>
                </div>
            `;
            return;
        }
        
        resultsContainer.innerHTML = `
            <div class="search-results-header">
                <p>Encontrados ${results.length} producto${results.length !== 1 ? 's' : ''} para "${searchTerm}"</p>
            </div>
            <div class="search-results-grid">
                ${results.map(card => this.createResultItem(card)).join('')}
            </div>
        `;
        
        // Bind click events for results
        this.bindResultEvents();
    }
    
    createResultItem(card) {
        const name = card.dataset.name || card.querySelector('.menu-card-name')?.textContent || '';
        const price = card.dataset.price || card.querySelector('.menu-card-price')?.textContent || '';
        const image = card.dataset.image || card.querySelector('.menu-card-img')?.src || '';
        const description = card.dataset.desc || card.querySelector('.menu-card-description')?.textContent || '';
        
        return `
            <div class="search-result-item" data-card-id="${card.dataset.id || Date.now()}">
                <img src="${image}" alt="${name}" class="result-image">
                <div class="result-content">
                    <h4 class="result-name">${name}</h4>
                    <p class="result-description">${description}</p>
                    <div class="result-footer">
                        <span class="result-price">${price}</span>
                        <button class="btn-result-add" 
                                data-name="${name}" 
                                data-price="${card.dataset.price}" 
                                data-image="${image}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    bindResultEvents() {
        const resultItems = this.modal.querySelectorAll('.search-result-item');
        const addButtons = this.modal.querySelectorAll('.btn-result-add');
        
        // Click on result item to view details
        resultItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.btn-result-add')) return;
                
                // Extract item data and show details
                const itemData = this.extractItemDataFromResult(item);
                this.close();
                new ItemDetailsModal(itemData);
            });
        });
        
        // Add to cart buttons
        addButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const product = {
                    name: button.dataset.name,
                    price: parseInt(button.dataset.price),
                    image: button.dataset.image
                };
                
                if (window.BurgerClub?.cart) {
                    window.BurgerClub.cart.addItem(product);
                }
                
                // Visual feedback
                this.animateAddButton(button);
            });
        });
    }
    
    extractItemDataFromResult(resultItem) {
        const name = resultItem.querySelector('.result-name').textContent;
        const description = resultItem.querySelector('.result-description').textContent;
        const price = parseInt(resultItem.querySelector('.result-price').textContent.replace(/[^\d]/g, ''));
        const image = resultItem.querySelector('.result-image').src;
        
        return {
            id: Date.now(),
            name,
            description,
            price,
            image,
            ingredients: [],
            isNew: false,
            popular: false
        };
    }
    
    animateAddButton(button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.style.background = 'var(--color-success)';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
        }, 1000);
    }
    
    show() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus search input
        setTimeout(() => {
            this.searchInput.focus();
        }, 100);
        
        this.addSearchStyles();
    }
    
    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        setTimeout(() => {
            if (document.body.contains(this.modal)) {
                document.body.removeChild(this.modal);
            }
        }, 300);
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    addSearchStyles() {
        if (document.getElementById('search-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'search-modal-styles';
        style.textContent = `
            .search-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 3000;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                padding-top: 50px;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .search-modal.active {
                opacity: 1;
                visibility: visible;
            }
            
            .search-modal-content {
                background: var(--color-background);
                border: 2px solid var(--color-cta-stroke);
                border-radius: var(--border-radius);
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow: hidden;
                transform: translateY(-20px);
                transition: transform 0.3s ease;
            }
            
            .search-modal.active .search-modal-content {
                transform: translateY(0);
            }
            
            .search-modal-header {
                padding: 20px 25px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .search-modal-header h3 {
                color: var(--color-text-primary);
                margin: 0;
            }
            
            .search-close {
                background: none;
                border: none;
                font-size: 2rem;
                color: var(--color-text-primary);
                cursor: pointer;
                transition: color 0.3s ease;
            }
            
            .search-close:hover {
                color: var(--color-danger);
            }
            
            .search-modal-body {
                padding: 25px;
            }
            
            .search-input-container {
                position: relative;
                margin-bottom: 25px;
            }
            
            .search-input {
                width: 100%;
                padding: 15px 50px 15px 20px;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: var(--border-radius-small);
                color: var(--color-text-primary);
                font-size: 1.1rem;
                font-family: var(--font-primary);
                transition: all 0.3s ease;
            }
            
            .search-input:focus {
                outline: none;
                border-color: var(--color-cta-stroke);
                box-shadow: 0 0 0 3px rgba(251, 181, 181, 0.2);
            }
            
            .search-icon {
                position: absolute;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--color-text-secondary);
                font-size: 1.2rem;
            }
            
            .search-results {
                max-height: 400px;
                overflow-y: auto;
            }
            
            .search-placeholder, .no-results {
                text-align: center;
                color: var(--color-text-secondary);
                padding: 40px 20px;
            }
            
            .no-results i {
                font-size: 3rem;
                margin-bottom: 15px;
                opacity: 0.5;
            }
            
            .search-results-header {
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .search-results-header p {
                color: var(--color-text-primary);
                margin: 0;
                font-weight: 600;
            }
            
            .search-results-grid {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .search-result-item {
                display: flex;
                gap: 15px;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: var(--border-radius-small);
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .search-result-item:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-2px);
            }
            
            .result-image {
                width: 60px;
                height: 60px;
                border-radius: var(--border-radius-small);
                object-fit: cover;
                flex-shrink: 0;
            }
            
            .result-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            
            .result-name {
                color: var(--color-text-primary);
                font-size: 1.1rem;
                margin: 0 0 5px 0;
            }
            
            .result-description {
                color: var(--color-text-secondary);
                font-size: 0.9rem;
                margin: 0 0 10px 0;
                line-height: 1.4;
            }
            
            .result-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .result-price {
                color: var(--color-cta-stroke);
                font-weight: 600;
                font-size: 1.1rem;
            }
            
            .btn-result-add {
                width: 35px;
                height: 35px;
                border-radius: 50%;
                background: var(--color-cta-stroke);
                color: var(--color-background);
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }
            
            .btn-result-add:hover {
                background: var(--color-white);
                transform: scale(1.1);
            }
            
            @media (max-width: 768px) {
                .search-modal {
                    padding-top: 20px;
                }
                
                .search-modal-content {
                    width: 95%;
                    margin: 0 10px;
                }
                
                .search-modal-header,
                .search-modal-body {
                    padding: 20px;
                }
                
                .search-result-item {
                    flex-direction: column;
                    text-align: center;
                }
                
                .result-image {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto;
                }
            }
        `;
        document.head.appendChild(style);
    }
}