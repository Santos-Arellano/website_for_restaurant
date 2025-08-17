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
    initializeMenu();
});

function initializeMenu() {
  const grid = document.getElementById('menuGrid');
  const hasServerCards = grid && grid.querySelector('.menu-card');

  if (hasServerCards) {
    // Camino DOM (Thymeleaf)
    initializeFilters();          // filtra las cards ya renderizadas
    initializeCartButtons();      // engancha los botones existentes
    initializeMenuAnimations();   // animaciones iniciales
    initializeMenuSearch();       //  
    initializeMenuItemInteractions()

    // Muestra todo al inicio
    if (typeof filterMenuItems === 'function') {
      // si tu filtro acepta sólo la categoría:
      filterMenuItems('all', grid.querySelectorAll('.menu-card'));
    }

    // Oculta el "Ver Más" porque ya no paginamos por JS
    const loadMoreContainer = document.querySelector('.load-more-container');
    if (loadMoreContainer) loadMoreContainer.style.display = 'none';
    return;
  }

  // Camino anterior (si algún día vuelves a usar menuItems)
  initializeFilters();
  initializeMenuGrid();
  initializeLoadMore();
  initializeMenuAnimations();
  initializeMenuSearch();

  console.log('🍔 Menu system initialized');
}
// ========== FILTERS ==========
function initializeFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach(button => {
    button.addEventListener('click', function () {
      const category = (this.dataset.category || 'all').toLowerCase();

      // visual: activo
      filterButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // filtrar DOM (siempre relee las cards por si cambió el DOM)
      filterMenuItems(category);

      // animación opcional
      this.classList.add('animate-pulse');
      setTimeout(() => this.classList.remove('animate-pulse'), 200);
    });

    // hover opcional
    button.addEventListener('mouseenter', function () {
      if (!this.classList.contains('active')) this.style.transform = 'translateY(-3px)';
    });
    button.addEventListener('mouseleave', function () {
      if (!this.classList.contains('active')) this.style.transform = 'translateY(0)';
    });
  });
}

function filterMenuItems(category = 'all') {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;

  const cards = grid.querySelectorAll('.menu-card');
  const isAll = (category || 'all').toLowerCase() === 'all';
  let shown = 0;

  cards.forEach(card => {
    const itemCat = (card.getAttribute('data-category') || '').toLowerCase();
    const show = isAll || itemCat === category;

    if (show) {
      shown++;
      // mostrar con fade-in
      card.style.display = 'block';
      card.style.opacity = 0;
      requestAnimationFrame(() => {
        card.style.transition = 'opacity 0.25s ease';
        card.style.opacity = 1;
      });
    } else {
      // ocultar con fade-out
      card.style.transition = 'opacity 0.2s ease';
      card.style.opacity = 0;
      setTimeout(() => { card.style.display = 'none'; }, 180);
    }
  });

  // Si usas un estado vacío con id="emptyState"
  const emptyStateEl = document.getElementById('emptyState');
  if (emptyStateEl) emptyStateEl.style.display = shown === 0 ? 'block' : 'none';
}

// ========== MENU GRID ==========
function initializeMenuGrid() {
    renderMenuItems();
}

function renderMenuItems() {
  const menuGrid = document.getElementById('menuGrid');
  if (!menuGrid) return;

  const serverCards = menuGrid.querySelectorAll('.menu-card');

  // Si ya hay tarjetas del servidor (Thymeleaf), NO sobreescribas el HTML
  if (serverCards.length > 0) {
    // Solo conecta interacciones y carrito sobre las cards existentes
    initializeCartButtons();
    initializeMenuItemInteractions();
    return;
  }

  // --- Ruta antigua (solo si algún día vuelves a usar menuItems/filteredItems) ---
  const startIndex = 0;
  const endIndex = currentPage * itemsPerPage;
  const itemsToShow = filteredItems.slice(startIndex, endIndex);

  menuGrid.innerHTML = itemsToShow.map(item => createMenuCard(item)).join('');

  initializeCartButtons();
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

  // Hover (igual que tu compa)
  menuCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px)';
      const overlay = this.querySelector('.menu-card-overlay');
      if (overlay) overlay.style.opacity = '1';
    });

    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      const overlay = this.querySelector('.menu-card-overlay');
      if (overlay) overlay.style.opacity = '0';
    });

    // QUE TODA LA TARJETA ABRA EL MODAL (datos desde dataset/DOM)
    card.addEventListener('click', function() {
      showItemDetails(this); // <-- paso el elemento card
    });

    // Evitar que el botón + propague y abra el modal
    const addBtn = card.querySelector('.btn-add-cart');
    if (addBtn) {
      addBtn.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }
  });

  // Botón "ver detalles" (si existe en tus cards renderizadas por JS)
  viewDetailsButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const itemId = parseInt(this.dataset.itemId);
      showItemDetails(itemId); // sigue soportando el camino anterior
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
function showItemDetails(itemIdOrCard) {
  let item = null;

  // 1) Modo antiguo: por id usando menuItems
  if (typeof itemIdOrCard === 'number' && Array.isArray(menuItems) && menuItems.length) {
    item = menuItems.find(i => i.id === itemIdOrCard) || null;
  }

  // 2) Modo Thymeleaf: se pasó una tarjeta del DOM
  if (!item && itemIdOrCard && itemIdOrCard.nodeType === 1) {
    const card = itemIdOrCard;

    const name = card.dataset.name || (card.querySelector('.menu-card-name')?.textContent || '').trim();
    const image = card.dataset.image || (card.querySelector('img')?.getAttribute('src') || '');
    const description = card.dataset.desc || (card.querySelector('.menu-card-description')?.textContent || '').trim();
    const price = parseInt(card.dataset.price || (card.querySelector('.menu-card-price')?.textContent || '0').replace(/[^\d]/g, ''), 10) || 0;

    // ingredientes: de data-ingredients "a,b,c" → array
    const ingredientsStr = (card.dataset.ingredients || '').trim();
    const ingredients = ingredientsStr
      ? ingredientsStr.split(/[,;|]/).map(s => s.trim()).filter(Boolean)
      : [];

    item = {
      id: Date.now(),     // dummy id (no lo usaremos para nada crítico)
      name,
      image,
      description,
      price,
      ingredients,
      isNew: !!card.querySelector('.menu-card-badge'), // aproximación
      popular: false
    };
  }

  if (!item) return;

  const modal = document.createElement('div');
  modal.className = 'item-details-modal';
  modal.innerHTML = `
  <div class="item-details-content">
    <button class="item-details-close" aria-label="Cerrar">&times;</button>

    <div class="item-details-body two-col">
      <!-- Columna IZQUIERDA: título + imagen -->
      <div class="item-col-left">
        <h2 class="item-title">${item.name}</h2>

        <div class="item-figure">
          <img src="${item.image}" alt="${item.name}">
          ${item.isNew ? '<span class="detail-badge new">Nuevo</span>' : ''}
          ${item.popular ? '<span class="detail-badge popular">Popular</span>' : ''}
        </div>
      </div>

      <!-- Columna DERECHA: texto + ingredientes + precio/acciones -->
      <div class="item-col-right">
        <p class="item-details-description">${item.description}</p>

        ${Array.isArray(item.ingredients) && item.ingredients.length ? `
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
              <button class="qty-btn minus" onclick="changeQuantity(-1)">−</button>
              <span class="qty-display" id="modalQuantity">1</span>
              <button class="qty-btn plus" onclick="changeQuantity(1)">+</button>
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

document.body.appendChild(modal);

// Cerrar
const closeBtn = modal.querySelector('.item-details-close');
closeBtn.addEventListener('click', () => closeItemDetails(modal));
modal.addEventListener('click', (e) => { if (e.target === modal) closeItemDetails(modal); });

// Agregar al carrito
const addBtn = modal.querySelector('.btn-add-to-cart-modal');
if (addBtn && window.CartManager) {
  addBtn.addEventListener('click', () => {
    const qty = parseInt(document.getElementById('modalQuantity')?.textContent || '1', 10) || 1;
    for (let i = 0; i < qty; i++) {
      window.CartManager.addItem({ name: item.name, price: item.price, image: item.image });
    }
    showNotification(`${qty}x ${item.name} agregado al carrito 🍔`, 'success');
    closeItemDetails(modal); // cierra después de agregar (si no lo quieres, quita esta línea)
  });
}

// Mostrar
setTimeout(() => modal.classList.add('active'), 10);
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
  const term = (e.target.value || '').toLowerCase().trim();
  const searchClear = document.getElementById('searchClear');
  const grid = document.getElementById('menuGrid');
  if (!grid) return;

  const cards = grid.querySelectorAll('.menu-card');
  const emptyState = document.getElementById('emptyState'); // opcional
  searchClear.style.display = term ? 'block' : 'none';

  let shown = 0;

  cards.forEach(card => {
    // categoría del item (de tu atributo data-category puesto por Thymeleaf)
    const cat = (card.getAttribute('data-category') || '').toLowerCase();

    // textos de búsqueda (usa data-* si los pusiste; si no, lee el DOM)
    const nameText = (card.dataset.name ??
      (card.querySelector('.menu-card-name')?.textContent || '')
    ).toLowerCase();

    const descText = (card.dataset.desc ??
      (card.querySelector('.menu-card-description')?.textContent || '')
    ).toLowerCase();

    const ingText  = (card.dataset.ingredients ?? '').toLowerCase();

    // pasa filtro de categoría + término de búsqueda
    const passesCategory = (currentFilter === 'all') || (cat === currentFilter);
    const passesSearch = !term || nameText.includes(term) || descText.includes(term) || ingText.includes(term);
    const show = passesCategory && passesSearch;

    if (show) {
      shown++;
      card.style.display = 'block';
      card.style.opacity = 0;
      requestAnimationFrame(() => {
        card.style.transition = 'opacity 0.2s ease';
        card.style.opacity = 1;
      });
    } else {
      card.style.transition = 'opacity 0.15s ease';
      card.style.opacity = 0;
      setTimeout(() => { card.style.display = 'none'; }, 120);
    }
  });

  // estado vacío (si tienes un div#emptyState)
  if (emptyState) emptyState.style.display = shown === 0 ? 'block' : 'none';

  // contador de resultados (si usas esta UI)
  if (typeof showSearchResults === 'function') {
    // pásale también la lista para que cuente visibles
    showSearchResults(term, cards);
  }
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