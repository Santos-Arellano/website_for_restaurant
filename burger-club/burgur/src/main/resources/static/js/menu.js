// ==========================================
// BURGER CLUB - MENU JAVASCRIPT
// ==========================================

// ========== VARIABLES GLOBALES ==========
let currentFilter = 'all';
let menuItems = [];
let filteredItems = [];
let itemsPerPage = 8;
let currentPage = 1;
let isLoading = false;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('menu.html')) {
        initializeMenu();
    }
});

function initializeMenu() {
    initializeMenuItems();
    initializeFilters();
    initializeMenuGrid();
    initializeLoadMore();
    initializeMenuAnimations();
    initializeMenuSearch();

    console.log('🍔 Menu system initialized');
}

// ========== MENU ITEMS DATA ==========
function initializeMenuItems() {
    menuItems = [
        {
            id: 1,
            name: 'New In the Club',
            description: 'Nuestra última creación gourmet con ingredientes premium y sabores únicos',
            price: 25000,
            category: 'burgers',
            image: '../static/images/menu/new-in-the-club.png',
            isNew: true,
            popular: false,
            ingredients: ['Carne premium', 'Queso artesanal', 'Salsa especial', 'Vegetales frescos']
        },
        {
            id: 2,
            name: 'Burger Clásica',
            description: 'La tradicional que todos aman, con carne jugosa y vegetales frescos',
            price: 22000,
            category: 'burgers',
            image: '../static/images/menu/BURGER.png',
            isNew: false,
            popular: true,
            ingredients: ['Carne de res', 'Lechuga', 'Tomate', 'Cebolla', 'Salsa burger']
        },
        {
            id: 3,
            name: 'BBQ Especial',
            description: 'Con salsa BBQ casera, cebolla caramelizada y bacon crujiente',
            price: 26000,
            category: 'burgers',
            image: '../static/images/menu/BBQ-especial.png',
            isNew: false,
            popular: true,
            ingredients: ['Carne premium', 'Salsa BBQ casera', 'Bacon', 'Cebolla caramelizada']
        },
        {
            id: 4,
            name: 'Hot Dog Premium',
            description: 'Salchicha premium con ingredientes gourmet y salsas especiales',
            price: 18000,
            category: 'burgers',
            image: '../static/images/menu/hot-dog.png',
            isNew: false,
            popular: false,
            ingredients: ['Salchicha premium', 'Pan artesanal', 'Salsas gourmet', 'Vegetales']
        },
        {
            id: 5,
            name: 'Papas Fritas',
            description: 'Crujientes y doradas, perfectas para acompañar',
            price: 8000,
            category: 'sides',
            image: '../static/images/menu/fries.png',
            isNew: false,
            popular: true,
            ingredients: ['Papas frescas', 'Sal marina', 'Aceite premium']
        },
        {
            id: 6,
            name: 'Acompañamientos Mix',
            description: 'Variedad de sides perfectos para complementar tu meal',
            price: 12000,
            category: 'sides',
            image: '../static/images/menu/sides.png',
            isNew: false,
            popular: false,
            ingredients: ['Aros de cebolla', 'Nuggets', 'Papas', 'Salsas']
        },
        {
            id: 7,
            name: 'Bebidas',
            description: 'Refrescantes opciones para acompañar tu comida',
            price: 6000,
            category: 'drinks',
            image: '../static/images/menu/drinks.png',
            isNew: false,
            popular: true,
            ingredients: ['Gaseosas', 'Jugos naturales', 'Agua', 'Bebidas especiales']
        },
        {
            id: 8,
            name: 'Postres Deliciosos',
            description: 'Dulce final perfecto para completar tu experiencia',
            price: 10000,
            category: 'desserts',
            image: '../static/images/menu/desserts.png',
            isNew: false,
            popular: false,
            ingredients: ['Brownies', 'Helados', 'Tortas', 'Frutas']
        },
        // Additional items for load more functionality
        {
            id: 9,
            name: 'Cheese Burger',
            description: 'Doble queso derretido con carne jugosa',
            price: 24000,
            category: 'burgers',
            image: '../static/images/menu/cheeseburger.png',
            isNew: false,
            popular: true,
            ingredients: ['Carne doble', 'Queso cheddar', 'Queso suizo', 'Vegetales']
        },
        {
            id: 10,
            name: 'Veggie Burger',
            description: 'Opción vegetariana llena de sabor y nutrientes',
            price: 23000,
            category: 'burgers',
            image: 'images/menu/veggieburger.png',
            isNew: true,
            popular: false,
            ingredients: ['Proteína vegetal', 'Vegetales asados', 'Salsa verde', 'Pan integral']
        }
    ];

    filteredItems = [...menuItems];
}

// ========== FILTERS ==========
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter items
            filterMenuItems(category);
            
            // Add click animation
            this.classList.add('animate-pulse');
            setTimeout(() => {
                this.classList.remove('animate-pulse');
            }, 300);
        });

        // Add hover effect
        button.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(-3px)';
            }
        });

        button.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(0)';
            }
        });
    });
}

function filterMenuItems(category) {
    currentFilter = category;
    currentPage = 1;

    if (category === 'all') {
        filteredItems = [...menuItems];
    } else {
        filteredItems = menuItems.filter(item => item.category === category);
    }

    // Show loading state
    showLoadingState();

    setTimeout(() => {
        renderMenuItems();
        updateLoadMoreButton();
        hideLoadingState();

        // Animate filtered items
        const menuCards = document.querySelectorAll('.menu-card');
        menuCards.forEach((card, index) => {
            card.style.animation = `fadeInUp 0.6s ease ${index * 0.1}s forwards`;
        });
    }, 300);
}

// ========== MENU GRID ==========
function initializeMenuGrid() {
    renderMenuItems();
}

function renderMenuItems() {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;

    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    const itemsToShow = filteredItems.slice(startIndex, endIndex);

    menuGrid.innerHTML = itemsToShow.map(item => createMenuCard(item)).join('');

    // Initialize cart buttons for new items
    initializeCartButtons();

    // Initialize item interactions
    initializeMenuItemInteractions();
}

function createMenuCard(item) {
    const badgeHtml = item.isNew ? '<div class="menu-card-badge">Nuevo</div>' : 
                     item.popular ? '<div class="menu-card-badge sale">Popular</div>' : '';

    return `
        <article class="menu-card" data-category="${item.category}" data-price="${item.price}" data-item-id="${item.id}">
            ${badgeHtml}
            <div class="menu-card-image">
                <img src="${item.image}" alt="${item.name}" class="menu-card-img" loading="lazy">
                <div class="menu-card-overlay">
                    <button class="btn-view-details" data-item-id="${item.id}">
                        <i class="fas fa-eye"></i>
                        Ver Detalles
                    </button>
                </div>
            </div>
            <div class="menu-card-content">
                <h3 class="menu-card-name">${item.name}</h3>
                <p class="menu-card-description">${item.description}</p>
                <div class="menu-card-footer">
                    <span class="menu-card-price">${formatPrice(item.price)}</span>
                    <button class="btn-add-cart" 
                            data-product="${item.name}" 
                            data-price="${item.price}" 
                            data-image="${item.image}"
                            data-item-id="${item.id}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        </article>
    `;
}

function initializeMenuItemInteractions() {
    const menuCards = document.querySelectorAll('.menu-card');
    const viewDetailsButtons = document.querySelectorAll('.btn-view-details');

    // Menu card hover effects
    menuCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            
            const overlay = this.querySelector('.menu-card-overlay');
            if (overlay) {
                overlay.style.opacity = '1';
            }
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            
            const overlay = this.querySelector('.menu-card-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
            }
        });
    });

    // View details buttons
    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const itemId = parseInt(this.dataset.itemId);
            showItemDetails(itemId);
        });
    });
}

function initializeCartButtons() {
    const cartButtons = document.querySelectorAll('.btn-add-cart');

    cartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const product = {
                name: this.dataset.product,
                price: parseInt(this.dataset.price),
                image: this.dataset.image
            };
            
            // Add to cart
            if (typeof window.CartManager !== 'undefined') {
                window.CartManager.addItem(product);
            } else {
                console.warn('Cart system not initialized yet');
                showNotification('Sistema de carrito inicializando...', 'info');
                return;
            }
            
            // Visual feedback
            this.classList.add('animate-bounce');
            
            // Create floating animation
            createFloatingIcon(this, product);
            
            setTimeout(() => {
                this.classList.remove('animate-bounce');
            }, 600);
            
            showNotification(`${product.name} agregado al carrito 🍔`, 'success');
        });
    });
}

function createFloatingIcon(button, product) {
    const icon = document.createElement('div');
    icon.className = 'floating-cart-icon';
    icon.innerHTML = '<i class="fas fa-hamburger"></i>';

    const rect = button.getBoundingClientRect();
    const cartBtn = document.getElementById('cartBtn');
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
    addFloatingAnimationStyles();
}

// ========== LOAD MORE ==========
function initializeLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            loadMoreItems();
        });
    }

    updateLoadMoreButton();
}

function loadMoreItems() {
    if (isLoading) return;

    isLoading = true;
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    if (loadMoreBtn) {
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Cargando...</span>';
        loadMoreBtn.disabled = true;
    }

    setTimeout(() => {
        currentPage++;
        renderMenuItems();
        updateLoadMoreButton();

        isLoading = false;

        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '<span>Ver Más Productos</span> <i class="fas fa-chevron-down"></i>';
            loadMoreBtn.disabled = false;
        }

        // Scroll to new items
        const newItems = document.querySelectorAll('.menu-card');
        if (newItems.length > 0) {
            const firstNewItem = newItems[Math.max(0, (currentPage - 1) * itemsPerPage)];
            if (firstNewItem) {
                firstNewItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, 1000);
}

function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadMoreContainer = document.querySelector('.load-more-container');

    if (!loadMoreBtn || !loadMoreContainer) return;

    const totalItems = filteredItems.length;
    const shownItems = currentPage * itemsPerPage;

    if (shownItems >= totalItems) {
        loadMoreContainer.style.display = 'none';
    } else {
        loadMoreContainer.style.display = 'block';
        const remainingItems = totalItems - shownItems;
        const nextLoadCount = Math.min(itemsPerPage, remainingItems);
        loadMoreBtn.querySelector('span').textContent = `Ver ${nextLoadCount} productos más`;
    }
}

// ========== ITEM DETAILS MODAL ==========
function showItemDetails(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    const modal = document.createElement('div');
    modal.className = 'item-details-modal';
    modal.innerHTML = `
        <div class="item-details-content">
            <button class="item-details-close" aria-label="Cerrar">&times;</button>
            <div class="item-details-image">
                <img src="${item.image}" alt="${item.name}">
                ${item.isNew ? '<span class="detail-badge new">Nuevo</span>' : ''}
                ${item.popular ? '<span class="detail-badge popular">Popular</span>' : ''}
            </div>
            <div class="item-details-info">
                <h2 class="item-details-name">${item.name}</h2>
                <p class="item-details-description">${item.description}</p>
                
                <div class="item-ingredients">
                    <h4>Ingredientes:</h4>
                    <ul class="ingredients-list">
                        ${item.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="item-details-footer">
                    <div class="item-price-section">
                        <span class="item-detail-price">${formatPrice(item.price)}</span>
                        <small class="price-note">Precio incluye IVA</small>
                    </div>
                    <div class="item-actions">
                        <div class="quantity-selector">
                            <button class="qty-btn minus" onclick="changeQuantity(-1)">-</button>
                            <span class="qty-display" id="modalQuantity">1</span>
                            <button class="qty-btn plus" onclick="changeQuantity(1)">+</button>
                        </div>
                        <button class="btn-add-to-cart-modal" onclick="addToCartFromModal(${item.id})">
                            <i class="fas fa-shopping-cart"></i>
                            Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    const closeBtn = modal.querySelector('.item-details-close');
    closeBtn.addEventListener('click', () => closeItemDetails(modal));

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeItemDetails(modal);
        }
    });

    // Show modal
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);

    // Add styles
    addItemDetailsStyles();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeItemDetails(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';

    setTimeout(() => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    }, 300);
}

function changeQuantity(delta) {
    const qtyDisplay = document.getElementById('modalQuantity');
    const currentQty = parseInt(qtyDisplay.textContent);
    const newQty = Math.max(1, Math.min(10, currentQty + delta));
    qtyDisplay.textContent = newQty;

    // Update buttons state
    const minusBtn = document.querySelector('.qty-btn.minus');
    const plusBtn = document.querySelector('.qty-btn.plus');

    minusBtn.disabled = newQty <= 1;
    plusBtn.disabled = newQty >= 10;
}

function addToCartFromModal(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    const quantity = parseInt(document.getElementById('modalQuantity').textContent);

    if (item && typeof window.CartManager !== 'undefined') {
        for (let i = 0; i < quantity; i++) {
            window.CartManager.addItem({
                name: item.name,
                price: item.price,
                image: item.image
            });
        }

        showNotification(`${quantity}x ${item.name} agregado al carrito 🍔`, 'success');

        // Close modal
        const modal = document.querySelector('.item-details-modal');
        if (modal) {
            closeItemDetails(modal);
        }
    }
}

// ========== SEARCH FUNCTIONALITY ==========
function initializeMenuSearch() {
    // Create search input
    const menuHeader = document.querySelector('.menu-header');
    if (menuHeader) {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'menu-search-container';
        searchContainer.innerHTML = `
            <div class="search-input-wrapper">
                <input type="text" id="menuSearchInput" placeholder="Buscar productos..." class="menu-search-input">
                <i class="fas fa-search search-icon"></i>
                <button class="search-clear" id="searchClear" style="display: none;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        menuHeader.appendChild(searchContainer);

        const searchInput = document.getElementById('menuSearchInput');
        const searchClear = document.getElementById('searchClear');

        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchClear.addEventListener('click', clearSearch);

        // Add search styles
        addSearchStyles();
    }
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    const searchClear = document.getElementById('searchClear');

    if (searchTerm) {
        searchClear.style.display = 'block';

        // Filter items based on search
        filteredItems = menuItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchTerm))
        );
    } else {
        searchClear.style.display = 'none';

        // Reset to current filter
        if (currentFilter === 'all') {
            filteredItems = [...menuItems];
        } else {
            filteredItems = menuItems.filter(item => item.category === currentFilter);
        }
    }

    currentPage = 1;
    renderMenuItems();
    updateLoadMoreButton();

    // Show search results count
    showSearchResults(searchTerm);
}

function clearSearch() {
    const searchInput = document.getElementById('menuSearchInput');
    const searchClear = document.getElementById('searchClear');

    searchInput.value = '';
    searchClear.style.display = 'none';

    // Reset to current filter
    filterMenuItems(currentFilter);
    hideSearchResults();
}

function showSearchResults(searchTerm) {
    let resultsContainer = document.querySelector('.search-results-info');

    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results-info';

        const menuGrid = document.getElementById('menuGrid');
        menuGrid.parentNode.insertBefore(resultsContainer, menuGrid);
    }

    if (searchTerm) {
        resultsContainer.innerHTML = `
            <p>
                <i class="fas fa-search"></i>
                Mostrando ${filteredItems.length} resultado${filteredItems.length !== 1 ? 's' : ''} para "<strong>${searchTerm}</strong>"
            </p>
        `;
        resultsContainer.style.display = 'block';
    } else {
        resultsContainer.style.display = 'none';
    }
}

function hideSearchResults() {
    const resultsContainer = document.querySelector('.search-results-info');
    if (resultsContainer) {
        resultsContainer.style.display = 'none';
    }
}

// ========== ANIMATIONS ==========
function initializeMenuAnimations() {
    // Animate menu cards on load
    const menuCards = document.querySelectorAll('.menu-card');
    menuCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';

        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Animate filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach((button, index) => {
        button.style.opacity = '0';
        button.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            button.style.transition = 'all 0.4s ease';
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

function showLoadingState() {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;

    menuGrid.classList.add('loading-state');

    // Add loading skeleton
    const loadingSkeleton = document.createElement('div');
    loadingSkeleton.className = 'loading-skeleton';
    loadingSkeleton.innerHTML = Array(6).fill().map(() => `
        <div class="skeleton-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-description"></div>
                <div class="skeleton-footer">
                    <div class="skeleton-price"></div>
                    <div class="skeleton-button"></div>
                </div>
            </div>
        </div>
    `).join('');

    menuGrid.appendChild(loadingSkeleton);
}

function hideLoadingState() {
    const menuGrid = document.getElementById('menuGrid');
    const loadingSkeleton = document.querySelector('.loading-skeleton');

    if (menuGrid) {
        menuGrid.classList.remove('loading-state');
    }

    if (loadingSkeleton) {
        loadingSkeleton.remove();
    }
}

// ========== UTILITY FUNCTIONS ==========
function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(price);
}

function debounce(func, wait) {
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

function showNotification(message, type = 'info') {
    if (typeof window.BurgerClub !== 'undefined' && window.BurgerClub.showNotification) {
        window.BurgerClub.showNotification(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// ========== STYLES INJECTION ==========
function addFloatingAnimationStyles() {
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

function addItemDetailsStyles() {
    if (document.getElementById('item-details-styles')) return;

    const style = document.createElement('style');
    style.id = 'item-details-styles';
    style.textContent = `
        .item-details-modal {
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
            backdrop-filter: blur(5px);
        }
        .item-details-modal.active {
            opacity: 1;
            visibility: visible;
        }
        .item-details-content {
            background: var(--color-background);
            border-radius: var(--border-radius);
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            border: 2px solid var(--color-cta-stroke);
            position: relative;
            display: grid;
            grid-template-columns: 1fr 1fr;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }
        .item-details-modal.active .item-details-content {
            transform: scale(1);
        }
        .item-details-close {
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(0, 0, 0, 0.5);
            color: var(--color-white);
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 1.5rem;
            cursor: pointer;
            z-index: 10;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .item-details-close:hover {
            background: var(--color-danger);
            transform: scale(1.1);
        }
        /* Resto de estilos del modal... */
    `;
    document.head.appendChild(style);
}

function addSearchStyles() {
    if (document.getElementById('search-styles')) return;

    const style = document.createElement('style');
    style.id = 'search-styles';
    style.textContent = `
        .menu-search-container {
            margin: 30px 0;
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
        }
        .search-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }
        .menu-search-input {
            width: 100%;
            padding: 15px 50px 15px 50px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: var(--border-radius-large);
            color: var(--color-text-primary);
            font-size: 1rem;
            font-family: var(--font-primary);
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }
        .menu-search-input:focus {
            outline: none;
            border-color: var(--color-cta-stroke);
            box-shadow: 0 0 0 3px rgba(251, 181, 181, 0.2);
            background: rgba(255, 255, 255, 0.15);
        }
        .menu-search-input::placeholder {
            color: var(--color-text-secondary);
        }
        .search-icon {
            position: absolute;
            left: 18px;
            color: var(--color-text-secondary);
            font-size: 1.1rem;
            pointer-events: none;
        }
        .search-clear {
            position: absolute;
            right: 15px;
            background: none;
            border: none;
            color: var(--color-text-secondary);
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
        }
        .search-clear:hover {
            color: var(--color-danger);
            background: rgba(244, 67, 54, 0.1);
        }
    `;
    document.head.appendChild(style);
}

// ========== GLOBAL FUNCTIONS ==========
window.changeQuantity = changeQuantity;
window.addToCartFromModal = addToCartFromModal;