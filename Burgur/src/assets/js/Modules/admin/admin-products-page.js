/**
 * Admin Products Page JavaScript (CORREGIDO)
 * Funciones para la gestión de productos en el panel de administración
 */

/**
 * Muestra los adicionales de un producto específico
 * @param {number} productId - ID del producto
 */
function showProductAdicionales(productId) {
    console.log('Mostrando adicionales para producto:', productId);
    
    // Crear modal de detalles del producto
    createProductDetailsModal(productId);
}

/**
 * Crea y muestra el modal de detalles del producto
 * @param {number} productId - ID del producto
 */
async function createProductDetailsModal(productId) {
    // Mostrar loading
    const loadingModal = createLoadingModal();
    document.body.appendChild(loadingModal);
    
    try {
        // Cargar datos del producto
        const response = await fetch(`/menu/productos/${productId}`);
        if (!response.ok) {
            throw new Error('Error al cargar producto');
        }
        
        const data = await response.json();
        const producto = data.producto || data;
        
        // Remover loading
        document.body.removeChild(loadingModal);
        
        // Crear modal de detalles
        const modal = createProductModal(producto);
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
    } catch (error) {
        console.error('Error cargando producto:', error);
        document.body.removeChild(loadingModal);
        
        // Mostrar modal de error
        const errorModal = createErrorModal('Error al cargar los detalles del producto');
        document.body.appendChild(errorModal);
        
        setTimeout(() => {
            errorModal.classList.add('show');
        }, 10);
    }
}

/**
 * Crea el modal de loading
 */
function createLoadingModal() {
    const modal = document.createElement('div');
    modal.className = 'product-details-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-body">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    Cargando detalles del producto...
                </div>
            </div>
        </div>
    `;
    return modal;
}

/**
 * Crea el modal de error
 */
function createErrorModal(message) {
    const modal = document.createElement('div');
    modal.className = 'product-details-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-exclamation-triangle"></i> Error</h3>
                <button class="modal-close" type="button">&times;</button>
            </div>
            <div class="modal-body">
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    ${message}
                </div>
            </div>
        </div>
    `;
    
    // Bind close events
    bindModalCloseEvents(modal);
    return modal;
}

/**
 * Crea el modal de detalles del producto
 */
function createProductModal(producto) {
    const modal = document.createElement('div');
    modal.className = 'product-details-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-info-circle"></i> Detalles del Producto</h3>
                <button class="modal-close" type="button">&times;</button>
            </div>
            <div class="modal-body">
                <div class="product-detail-info">
                    <div class="product-detail-image">
                        ${producto.imgURL 
                            ? `<img src="${producto.imgURL}" alt="${producto.nombre}" />`
                            : `<div style="width: 200px; height: 200px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                                <i class="fas fa-hamburger" style="font-size: 3rem; color: #fbb5b5; opacity: 0.6;"></i>
                               </div>`
                        }
                    </div>
                    <div class="product-detail-content">
                        <h4>${producto.nombre}</h4>
                        <div class="detail-product-category">${producto.categoria}</div>
                        <div class="detail-product-price">${producto.precio ? producto.precio.toLocaleString() : '0'}</div>
                        ${producto.descripcion ? `<div class="detail-product-description">${producto.descripcion}</div>` : ''}
                        
                        <div style="margin: 15px 0;">
                            <strong>Stock disponible:</strong> 
                            <span class="stock-value ${producto.stock < 10 ? 'low' : ''}">${producto.stock}</span>
                        </div>
                        
                        ${producto.ingredientes && producto.ingredientes.length > 0 
                            ? `<div style="margin: 15px 0;">
                                <strong>Ingredientes:</strong> ${producto.ingredientes.join(', ')}
                               </div>`
                            : ''
                        }
                        
                        <div style="margin: 15px 0;">
                            <span class="status-badge ${producto.activo ? 'available' : 'unavailable'}">
                                ${producto.activo ? 'Disponible' : 'No Disponible'}
                            </span>
                            ${producto.nuevo ? '<span class="product-badge badge-nuevo" style="margin-left: 10px;">Nuevo</span>' : ''}
                            ${producto.popular ? '<span class="product-badge badge-popular" style="margin-left: 10px;">Popular</span>' : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Bind close events
    bindModalCloseEvents(modal);
    return modal;
}

/**
 * Vincula los eventos de cierre del modal
 */
function bindModalCloseEvents(modal) {
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeModal(modal);
        });
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    // ESC key
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal(modal);
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

/**
 * Cierra un modal
 */
function closeModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    }, 300);
}

/**
 * Actualiza todos los adicionales de los productos
 */
function updateAllAdicionales() {
    console.log('Actualizando todos los adicionales...');
    
    try {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const productId = card.dataset.productId;
            if (productId) {
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
 */
function updateProductCard(productId, card) {
    console.log('Actualizando tarjeta del producto:', productId);
}

/**
 * Filtra productos por texto de búsqueda (CORREGIDO)
 */
function filterProducts(searchTerm) {
    const productCards = document.querySelectorAll('.product-card');
    const term = searchTerm.toLowerCase().trim();
    let visibleCount = 0;
    
    productCards.forEach(card => {
        const productName = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
        const productCategory = card.querySelector('.product-category')?.textContent.toLowerCase() || '';
        
        const matches = !term || productName.includes(term) || productCategory.includes(term);
        
        if (matches) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Actualizar empty state
    updateEmptyState(visibleCount);
    
    console.log(`Búsqueda: "${searchTerm}" - ${visibleCount} productos encontrados`);
}

/**
 * Limpia todos los filtros aplicados
 */
function clearAllFilters() {
    // Limpiar filtros de selección
    const categoryFilter = document.querySelector('#categoryFilter');
    const statusFilter = document.querySelector('#statusFilter');
    const searchInput = document.querySelector('#adminSearchInput');
    
    if (categoryFilter) categoryFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    if (searchInput) searchInput.value = '';
    
    // Mostrar todas las tarjetas de productos
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.style.display = 'flex';
    });
    
    // Actualizar empty state
    updateEmptyState(productCards.length);
    
    console.log('Todos los filtros han sido limpiados');
}

/**
 * Aplica todos los filtros seleccionados (CORREGIDO)
 */
function applyFilters() {
    const categoryFilter = document.querySelector('#categoryFilter')?.value || '';
    const statusFilter = document.querySelector('#statusFilter')?.value || '';
    const searchTerm = document.querySelector('#adminSearchInput')?.value.toLowerCase().trim() || '';
    
    const productCards = document.querySelectorAll('.product-card');
    let visibleCount = 0;
    
    console.log('Aplicando filtros:', { categoryFilter, statusFilter, searchTerm });
    
    productCards.forEach(card => {
        let show = true;
        
        // Filtro por búsqueda
        if (searchTerm) {
            const productName = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
            const productCategory = card.querySelector('.product-category')?.textContent.toLowerCase() || '';
            
            if (!productName.includes(searchTerm) && !productCategory.includes(searchTerm)) {
                show = false;
            }
        }
        
        // Filtro por categoría
        if (categoryFilter && show) {
            const category = card.querySelector('.product-category')?.textContent.toLowerCase() || '';
            
            // Mapear nombres de categorías para coincidencia
            const categoryMapping = {
                'hamburguesas': ['hamburguesa', 'hamburguesas'],
                'bebidas': ['bebida', 'bebidas'],
                'acompañamientos': ['acompañamiento', 'acompañamientos'],
                'postres': ['postre', 'postres'],
                'perros calientes': ['perro caliente', 'perros calientes']
            };
            
            const filterCategories = categoryMapping[categoryFilter] || [categoryFilter];
            const matches = filterCategories.some(cat => category.includes(cat));
            
            if (!matches) {
                show = false;
            }
        }
        
        // Filtro por estado
        if (statusFilter && show) {
            const hasActiveBadge = card.querySelector('.badge-activo');
            
            if (statusFilter === 'activo' && !hasActiveBadge) {
                show = false;
            } else if (statusFilter === 'inactivo' && hasActiveBadge) {
                show = false;
            }
        }
        
        // Mostrar/ocultar tarjeta
        if (show) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Actualizar empty state
    updateEmptyState(visibleCount);
    
    console.log(`Filter applied: ${categoryFilter || 'all'} (${visibleCount} items)`);
}

/**
 * Actualiza el estado vacío basado en productos visibles
 */
function updateEmptyState(visibleCount) {
    let emptyState = document.querySelector('.empty-state');
    const productsGrid = document.querySelector('.products-grid');
    
    if (visibleCount === 0) {
        if (!emptyState) {
            emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>No se encontraron productos</h3>
                <p>No hay productos que coincidan con los filtros seleccionados.</p>
            `;
            productsGrid.appendChild(emptyState);
        }
        emptyState.style.display = 'block';
    } else {
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    }
}

/**
 * Inicializa la página de productos del admin (SIN CONFLICTOS)
 */
function initAdminProductsPage() {
    console.log('🚀 Inicializando página de productos del admin...');
    
    // Solo configurar event listeners específicos para productos
    setupProductEventListeners();
    
    // No crear instance de UniversalAdminManager aquí para evitar conflictos
    console.log('✅ Página de productos inicializada correctamente');
}

/**
 * Configura los event listeners específicos para productos (SIN CONFLICTOS)
 */
function setupProductEventListeners() {
    // Prevenir múltiples inicializaciones
    if (window.productListenersInitialized) {
        console.log('⚠️ Event listeners ya inicializados, saltando...');
        return;
    }
    
    // Event listener para búsqueda (con timeout para evitar conflictos)
    const searchInput = document.querySelector('#adminSearchInput');
    if (searchInput) {
        // Remover listeners existentes
        const newSearchInput = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(newSearchInput, searchInput);
        
        newSearchInput.addEventListener('input', function(e) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                applyFilters();
            }, 300);
        });
        console.log('✅ Event listener de búsqueda configurado');
    }
    
    // Event listeners para filtros (con timeout para evitar conflictos)
    const categoryFilter = document.querySelector('#categoryFilter');
    const statusFilter = document.querySelector('#statusFilter');
    
    if (categoryFilter) {
        // Remover listeners existentes
        const newCategoryFilter = categoryFilter.cloneNode(true);
        categoryFilter.parentNode.replaceChild(newCategoryFilter, categoryFilter);
        
        newCategoryFilter.addEventListener('change', function() {
            setTimeout(() => applyFilters(), 50);
        });
        console.log('✅ Event listener de categoría configurado');
    }
    
    if (statusFilter) {
        // Remover listeners existentes  
        const newStatusFilter = statusFilter.cloneNode(true);
        statusFilter.parentNode.replaceChild(newStatusFilter, statusFilter);
        
        newStatusFilter.addEventListener('change', function() {
            setTimeout(() => applyFilters(), 50);
        });
        console.log('✅ Event listener de estado configurado');
    }
    
    // Event listener para botones de detalles usando event delegation (una sola vez)
    if (!window.detailsListenerAdded) {
        document.addEventListener('click', handleProductDetailsClick);
        window.detailsListenerAdded = true;
        console.log('✅ Event listener de detalles configurado');
    }
    
    // Marcar como inicializado
    window.productListenersInitialized = true;
}

/**
 * Maneja los clics en botones de detalles (función separada para evitar duplicados)
 */
function handleProductDetailsClick(e) {
    if (e.target.classList.contains('btn-details') || e.target.closest('.btn-details')) {
        const button = e.target.classList.contains('btn-details') ? e.target : e.target.closest('.btn-details');
        const productId = button.dataset.productId;
        
        if (productId) {
            e.preventDefault();
            e.stopPropagation();
            showProductAdicionales(parseInt(productId));
        }
    }
}

// Exponer funciones globalmente para uso en otros scripts
window.filterProducts = filterProducts;
window.applyFilters = applyFilters;
window.clearAllFilters = clearAllFilters;
window.showProductAdicionales = showProductAdicionales;

// Inicializar cuando el DOM esté listo (CON PRIORIDAD)
document.addEventListener('DOMContentLoaded', function() {
    // Dar prioridad a este script sobre el universal
    setTimeout(() => {
        initAdminProductsPage();
    }, 100);
});

// Exportar funciones para uso externo si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showProductAdicionales,
        initAdminProductsPage,
        filterProducts,
        applyFilters,
        clearAllFilters
    };
}