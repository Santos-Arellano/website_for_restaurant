// ==========================================
// BURGER CLUB - MENU GRID MODULE (FIXED)
// ==========================================

import { formatPrice } from '../../utils/helpers.js';
import { MENU_CONFIG } from '../../utils/constants.js';

export class MenuGrid {
    constructor() {
        this.menuCards = [];
        this.currentPage = 1;
        this.itemsPerPage = MENU_CONFIG.itemsPerPage;
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        this.menuGrid = document.getElementById('menuGrid');
        this.loadMoreBtn = document.getElementById('loadMoreBtn');
        this.loadMoreContainer = document.querySelector('.load-more-container');
        
        if (!this.menuGrid) return;
        
        this.menuCards = this.menuGrid.querySelectorAll('.menu-card');
        this.bindEvents();
        this.initializeCardInteractions();
        this.updateLoadMoreButton();
        
        console.log('📋 Menu Grid initialized');
    }
    
    bindEvents() {
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => {
                this.loadMoreItems();
            });
        }
        
        // Listen for menu filter events
        document.addEventListener('menuFiltered', (e) => {
            this.handleFilterChange(e.detail);
        });
    }
    
    initializeCardInteractions() {
        this.menuCards.forEach(card => {
            this.setupCardHover(card);
            this.setupCardClick(card);
            // REMOVIDO: Ya no inicializamos botones del carrito aquí
            // this.setupAddToCartButton(card);
        });
    }
    
    setupCardHover(card) {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            const overlay = card.querySelector('.menu-card-overlay');
            if (overlay) {
                overlay.style.opacity = '1';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            const overlay = card.querySelector('.menu-card-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
            }
        });
    }
    
    setupCardClick(card) {
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on add to cart button
            if (e.target.closest('.btn-add-cart')) {
                return;
            }
            
            this.showItemDetails(card);
        });
    }
    
    // REMOVIDO: Ya no manejamos botones del carrito aquí
    // El CartManager los maneja con delegación de eventos
    
    showItemDetails(card) {
        // Extract item data from card
        const itemData = this.extractItemData(card);
        
        // Create simple modal for item details
        this.createItemModal(itemData);
    }
    
    extractItemData(card) {
        const name = card.dataset.name || 
            card.querySelector('.menu-card-name')?.textContent || '';
        const image = card.dataset.image || 
            card.querySelector('.menu-card-img')?.src || '';
        const description = card.dataset.desc || 
            card.querySelector('.menu-card-description')?.textContent || '';
        const price = parseInt(card.dataset.price || 
            card.querySelector('.menu-card-price')?.textContent.replace(/[^\d]/g, '') || '0');
        
        // Parse ingredients
        const ingredientsStr = card.dataset.ingredients || '';
        const ingredients = ingredientsStr 
            ? ingredientsStr.split(/[,;|]/).map(s => s.trim()).filter(Boolean)
            : [];
        
        const isNew = !!card.querySelector('.menu-card-badge');
        
        return {
            id: Date.now(),
            name,
            image,
            description,
            price,
            ingredients,
            isNew,
            popular: false
        };
    }
    
    createItemModal(item) {
        const modal = document.createElement('div');
        modal.className = 'item-details-modal';
        modal.innerHTML = `
            <div class="item-details-content">
                <button class="item-details-close" aria-label="Cerrar">&times;</button>
                <div class="item-details-body two-col">
                    <div class="item-col-left">
                        <h2 class="item-title">${item.name}</h2>
                        <div class="item-figure">
                            <img src="${item.image}" alt="${item.name}">
                            ${item.isNew ? '<span class="detail-badge new">Nuevo</span>' : ''}
                        </div>
                    </div>
                    <div class="item-col-right">
                        <p class="item-details-description">${item.description}</p>
                        ${item.ingredients.length ? `
                            <div class="item-ingredients">
                                <h4>Ingredientes:</h4>
                                <ul class="ingredients-list">
                                    ${item.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        <div class="item-details-footer">
                            <div class="item-price-section">
                                <span class="item-detail-price">${formatPrice(item.price)}</span>
                                <small class="price-note">Precio incluye IVA</small>
                            </div>
                            <div class="item-actions">
                                <div class="quantity-selector">
                                    <button class="qty-btn minus">−</button>
                                    <span class="qty-display" id="modalQuantity">1</span>
                                    <button class="qty-btn plus">+</button>
                                </div>
                                <button class="btn-add-to-cart-modal" 
                                        data-product="${item.name}" 
                                        data-price="${item.price}" 
                                        data-image="${item.image}">
                                    <i class="fas fa-shopping-cart"></i>
                                    Agregar al Carrito
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Bind events
        this.bindModalEvents(modal, item);
        
        // Show modal
        setTimeout(() => modal.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
    }
    
    bindModalEvents(modal, item) {
        let quantity = 1;
        
        // Close button
        const closeBtn = modal.querySelector('.item-details-close');
        closeBtn.addEventListener('click', () => this.closeModal(modal));
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
        
        // Quantity controls
        const minusBtn = modal.querySelector('.qty-btn.minus');
        const plusBtn = modal.querySelector('.qty-btn.plus');
        const quantityDisplay = modal.querySelector('#modalQuantity');
        
        minusBtn.addEventListener('click', () => {
            quantity = Math.max(1, quantity - 1);
            quantityDisplay.textContent = quantity;
            minusBtn.disabled = quantity <= 1;
        });
        
        plusBtn.addEventListener('click', () => {
            quantity = Math.min(10, quantity + 1);
            quantityDisplay.textContent = quantity;
            plusBtn.disabled = quantity >= 10;
        });
        
        // Add to cart button - USAR EL CARTMANAGER
        const addBtn = modal.querySelector('.btn-add-to-cart-modal');
        addBtn.addEventListener('click', () => {
            if (window.BurgerClub?.cart) {
                // Agregar la cantidad seleccionada
                for (let i = 0; i < quantity; i++) {
                    window.BurgerClub.cart.addProductToCart({
                        name: item.name,
                        price: item.price,
                        image: item.image
                    }, addBtn);
                }
                
                // Visual feedback
                const originalHTML = addBtn.innerHTML;
                addBtn.innerHTML = '<i class="fas fa-check"></i> Agregado';
                addBtn.style.background = 'var(--color-success)';
                addBtn.disabled = true;
                
                setTimeout(() => {
                    addBtn.innerHTML = originalHTML;
                    addBtn.style.background = '';
                    addBtn.disabled = false;
                }, 1000);
                
                // Close modal after short delay
                setTimeout(() => {
                    this.closeModal(modal);
                }, 500);
            }
        });
        
        // Keyboard events
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
                document.removeEventListener('keydown', handleKeydown);
            }
        };
        document.addEventListener('keydown', handleKeydown);
    }
    
    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 300);
    }
    
    loadMoreItems() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingState();
        
        // Simulate loading delay
        setTimeout(() => {
            this.currentPage++;
            this.showMoreCards();
            this.updateLoadMoreButton();
            this.hideLoadingState();
            this.isLoading = false;
        }, 1000);
    }
    
    showMoreCards() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = this.currentPage * this.itemsPerPage;
        const cardsToShow = Array.from(this.menuCards).slice(startIndex, endIndex);
        
        cardsToShow.forEach((card, index) => {
            if (card.style.display === 'none') {
                setTimeout(() => {
                    card.style.display = 'block';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(30px)';
                    
                    requestAnimationFrame(() => {
                        card.style.transition = 'all 0.6s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                }, index * 100);
            }
        });
        
        // Scroll to first new item
        if (cardsToShow.length > 0) {
            setTimeout(() => {
                cardsToShow[0].scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 300);
        }
    }
    
    updateLoadMoreButton() {
        if (!this.loadMoreBtn || !this.loadMoreContainer) return;
        
        const visibleCards = Array.from(this.menuCards)
            .filter(card => card.style.display !== 'none');
        const shownCards = this.currentPage * this.itemsPerPage;
        
        if (shownCards >= visibleCards.length) {
            this.loadMoreContainer.style.display = 'none';
        } else {
            this.loadMoreContainer.style.display = 'block';
            const remainingCards = visibleCards.length - shownCards;
            const nextLoadCount = Math.min(this.itemsPerPage, remainingCards);
            
            const span = this.loadMoreBtn.querySelector('span');
            if (span) {
                span.textContent = `Ver ${nextLoadCount} productos más`;
            }
        }
    }
    
    handleFilterChange(filterDetail) {
        // Reset pagination when filter changes
        this.currentPage = 1;
        this.updateLoadMoreButton();
        
        // If no items shown, hide load more button
        if (filterDetail.shownCount === 0) {
            if (this.loadMoreContainer) {
                this.loadMoreContainer.style.display = 'none';
            }
        }
    }
    
    showLoadingState() {
        if (this.loadMoreBtn) {
            this.loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Cargando...</span>';
            this.loadMoreBtn.disabled = true;
        }
    }
    
    hideLoadingState() {
        if (this.loadMoreBtn) {
            this.loadMoreBtn.innerHTML = '<span>Ver Más Productos</span> <i class="fas fa-chevron-down"></i>';
            this.loadMoreBtn.disabled = false;
        }
    }
    
    addFloatingStyles() {
        if (document.getElementById('floating-menu-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'floating-menu-styles';
        style.textContent = `
            @keyframes floatUp {
                0% {
                    transform: translate(0, 0) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translate(0, -50px) scale(0.3);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Public methods
    refreshGrid() {
        this.menuCards = this.menuGrid.querySelectorAll('.menu-card');
        this.currentPage = 1;
        this.initializeCardInteractions();
        this.updateLoadMoreButton();
    }
    
    getVisibleCardCount() {
        return Array.from(this.menuCards)
            .filter(card => card.style.display !== 'none').length;
    }
    
    hideLoadMore() {
        if (this.loadMoreContainer) {
            this.loadMoreContainer.style.display = 'none';
        }
    }
    
    showLoadMore() {
        if (this.loadMoreContainer) {
            this.loadMoreContainer.style.display = 'block';
        }
    }
}