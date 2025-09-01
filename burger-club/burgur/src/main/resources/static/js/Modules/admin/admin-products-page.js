/**
 * Admin Products Page JavaScript
 * Funciones para la gestión de productos en el panel de administración
 */

/**
 * Muestra los adicionales de un producto específico
 * @param {number} productId - ID del producto
 */
function showProductAdicionales(productId) {
    console.log('Mostrando adicionales para producto:', productId);
    
    // Aquí iría la lógica para mostrar los adicionales del producto
    // Por ejemplo, abrir un modal o navegar a una página de detalles
    
    // Ejemplo de implementación básica:
    const modal = document.getElementById('product-details-modal');
    if (modal) {
        // Cargar datos del producto
        loadProductDetails(productId);
        modal.classList.add('show');
    }
}

/**
 * Carga los detalles de un producto en el modal
 * @param {number} productId - ID del producto
 */
function loadProductDetails(productId) {
    // Aquí iría la lógica para cargar los detalles del producto
    // desde el servidor o desde datos locales
    console.log('Cargando detalles del producto:', productId);
}

/**
 * Actualiza todos los adicionales de los productos
 * Función que se ejecuta periódicamente para mantener los datos actualizados
 */
function updateAllAdicionales() {
    console.log('Actualizando todos los adicionales...');
    
    // Aquí iría la lógica para actualizar los adicionales
    // Por ejemplo, hacer una petición AJAX al servidor
    
    try {
        // Ejemplo de actualización
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const productId = card.dataset.productId;
            if (productId) {
                // Actualizar información del producto
                updateProductCard(productId, card);
            }
        });
        
        console.log('Adicionales actualizados correctamente');
    } catch (error) {
        console.error('Error al actualizar adicionales:', error);
    }
}

/**
 * Actualiza la información de una tarjeta de producto específica
 * @param {number} productId - ID del producto
 * @param {HTMLElement} card - Elemento DOM de la tarjeta
 */
function updateProductCard(productId, card) {
    // Lógica para actualizar la tarjeta del producto
    console.log('Actualizando tarjeta del producto:', productId);
}

/**
 * Inicializa la página de productos del admin
 */
function initAdminProductsPage() {
    console.log('Inicializando página de productos del admin...');
    
    // Configurar event listeners
    setupEventListeners();
    
    // Actualizar adicionales inicialmente
    updateAllAdicionales();
    
    // Configurar actualización periódica (cada 30 segundos)
    setInterval(updateAllAdicionales, 30000);
}

/**
 * Configura los event listeners de la página
 */
function setupEventListeners() {
    // Event listener para botones de detalles
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-details') || e.target.closest('.btn-details')) {
            const button = e.target.classList.contains('btn-details') ? e.target : e.target.closest('.btn-details');
            const productCard = button.closest('.product-card');
            const productId = productCard ? productCard.dataset.productId : null;
            
            if (productId) {
                showProductAdicionales(parseInt(productId));
            }
        }
    });
    
    // Event listener para cerrar modal
    const modal = document.getElementById('product-details-modal');
    if (modal) {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                modal.classList.remove('show');
            });
        }
        
        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }
    
    // Event listener para búsqueda
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterProducts(e.target.value);
        });
    }
    
    // Event listeners para filtros
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            applyFilters();
        });
    });
}

/**
 * Filtra productos por texto de búsqueda
 * @param {string} searchTerm - Término de búsqueda
 */
function filterProducts(searchTerm) {
    const productCards = document.querySelectorAll('.product-card');
    const term = searchTerm.toLowerCase().trim();
    
    productCards.forEach(card => {
        const productName = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
        const productCategory = card.querySelector('.product-category')?.textContent.toLowerCase() || '';
        
        const matches = productName.includes(term) || productCategory.includes(term);
        card.style.display = matches ? 'block' : 'none';
    });
}

/**
 * Aplica todos los filtros seleccionados
 */
function applyFilters() {
    const categoryFilter = document.querySelector('#category-filter')?.value || 'all';
    const statusFilter = document.querySelector('#status-filter')?.value || 'all';
    const stockFilter = document.querySelector('#stock-filter')?.value || 'all';
    
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        let show = true;
        
        // Filtro por categoría
        if (categoryFilter !== 'all') {
            const category = card.querySelector('.product-category')?.textContent.toLowerCase() || '';
            if (!category.includes(categoryFilter.toLowerCase())) {
                show = false;
            }
        }
        
        // Filtro por estado
        if (statusFilter !== 'all') {
            const hasActiveBadge = card.querySelector('.badge-activo');
            if (statusFilter === 'active' && !hasActiveBadge) {
                show = false;
            } else if (statusFilter === 'inactive' && hasActiveBadge) {
                show = false;
            }
        }
        
        // Filtro por stock
        if (stockFilter !== 'all') {
            const stockValue = card.querySelector('.stock-value');
            if (stockValue) {
                const hasLowStock = stockValue.classList.contains('low');
                const hasMediumStock = stockValue.classList.contains('medium');
                
                if (stockFilter === 'low' && !hasLowStock) {
                    show = false;
                } else if (stockFilter === 'medium' && !hasMediumStock) {
                    show = false;
                } else if (stockFilter === 'high' && (hasLowStock || hasMediumStock)) {
                    show = false;
                }
            }
        }
        
        card.style.display = show ? 'block' : 'none';
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initAdminProductsPage();
});

// Exportar funciones para uso externo si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showProductAdicionales,
        updateAllAdicionales,
        initAdminProductsPage,
        filterProducts,
        applyFilters
    };
}