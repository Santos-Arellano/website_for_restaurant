// burger-club/burgur/src/main/resources/static/js/admin-universal.js
// ==========================================
// BURGER CLUB - ADMIN UNIVERSAL MANAGER (MEJORADO - SIN CONFLICTOS)
// ==========================================

class UniversalAdminManager {
    constructor() {
        this.currentSection = this.getCurrentSection();
        this.searchInput = null;
        this.categoryFilter = null;
        this.tableRows = [];
        this.currentItems = [];
        this.isLoading = false;
        this.modalManager = null;
        
        this.init();
    }
    
    init() {
        console.log(`Admin Universal Manager initialized for section: ${this.currentSection}`);
        
        // Limpieza inicial de cualquier overlay existente
        this.removeAllLoadingOverlays();
        
        // Limpieza adicional cuando se carga la página
        window.addEventListener('load', () => {
            this.removeAllLoadingOverlays();
        });
        
        // No inicializar para productos ya que tiene su propio sistema
        if (this.currentSection === 'productos') {
            console.log('Skipping Universal Manager for productos - using dedicated system');
            this.initializeModalManager();
            this.addNotificationStyles();
            return;
        }
        
        this.bindElements();
        this.bindEvents();
        this.initializeAnimations();
        this.setupKeyboardShortcuts();
        this.addNotificationStyles();
        this.initializeModalManager();
    }
    
    initializeModalManager() {
        // Estrategia múltiple para obtener el modal manager
        if (window.globalModalManager) {
            this.modalManager = window.globalModalManager;
            console.log('Modal manager encontrado inmediatamente');
            return;
        }
        
        if (window.AdminModalManager) {
            this.modalManager = new window.AdminModalManager();
            console.log('Modal manager creado desde clase');
            return;
        }
        
        // Reintentar cada 200ms hasta 10 segundos
        let attempts = 0;
        const maxAttempts = 50;
        const checkInterval = setInterval(() => {
            attempts++;
            
            if (window.globalModalManager) {
                this.modalManager = window.globalModalManager;
                console.log(`Modal manager encontrado en intento ${attempts}`);
                clearInterval(checkInterval);
                return;
            }
            
            if (window.AdminModalManager) {
                this.modalManager = new window.AdminModalManager();
                console.log(`Modal manager creado en intento ${attempts}`);
                clearInterval(checkInterval);
                return;
            }
            
            if (attempts >= maxAttempts) {
                console.error('Modal manager no disponible después de', attempts, 'intentos');
                clearInterval(checkInterval);
            }
        }, 200);
    }
    
    getCurrentSection() {
        const path = window.location.pathname;
        if (path.includes('/admin/adicionales')) return 'adicionales';
        if (path.includes('/admin/clientes')) return 'clientes';
        if (path.includes('/admin') || path.includes('/menu/admin')) return 'productos';
        return 'dashboard';
    }
    
    bindElements() {
        // Solo para secciones que no sean productos
        if (this.currentSection === 'productos') return;
        
        this.searchInput = document.getElementById('adminSearchInput');
        this.categoryFilter = document.getElementById('categoryFilter');
        
        // Para el diseño de tabla tradicional (solo clientes y adicionales)
        this.tableRows = document.querySelectorAll('.table-row:not(.table-header)');
        
        if (!this.searchInput) {
            console.warn('Search input not found');
        }
    }
    
    bindEvents() {
        // Solo para secciones que no sean productos
        if (this.currentSection === 'productos') return;
        
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }
        
        // Category filter (no aplicable para clientes/adicionales)
        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', (e) => {
                this.handleCategoryFilter(e.target.value);
            });
        }
    }
    
    // ==========================================
    // SEARCH AND FILTER FUNCTIONALITY (SOLO PARA CLIENTES Y ADICIONALES)
    // ==========================================
    
    handleSearch(searchTerm) {
        // No manejar búsqueda para productos
        if (this.currentSection === 'productos') return;
        
        const normalizedTerm = searchTerm.toLowerCase().trim();
        let visibleCount = 0;
        
        this.tableRows.forEach((row, index) => {
            const matches = this.doesRowMatch(row, normalizedTerm);
            
            if (matches) {
                this.showRow(row, index * 30);
                visibleCount++;
            } else {
                this.hideRow(row);
            }
        });
        
        this.updateSearchResults(searchTerm, visibleCount);
        this.updateEmptyState(visibleCount);
    }
    
    doesRowMatch(row, searchTerm) {
        if (!searchTerm) return true;
        
        switch (this.currentSection) {
            case 'adicionales':
                const adicionalName = this.getTextContent(row, '.adicional-name');
                const categorias = Array.from(row.querySelectorAll('.categoria-badge'))
                    .map(badge => badge.textContent.toLowerCase()).join(' ');
                return adicionalName.toLowerCase().includes(searchTerm) ||
                       categorias.includes(searchTerm);
                       
            case 'clientes':
                const nombre = row.children[0]?.textContent?.toLowerCase() || '';
                const apellido = row.children[1]?.textContent?.toLowerCase() || '';
                const email = row.children[2]?.textContent?.toLowerCase() || '';
                const telefono = row.children[3]?.textContent?.toLowerCase() || '';
                return nombre.includes(searchTerm) ||
                       apellido.includes(searchTerm) ||
                       email.includes(searchTerm) ||
                       telefono.includes(searchTerm);
                       
            default:
                return true;
        }
    }
    
    handleCategoryFilter(selectedCategory) {
        // No aplicable para clientes/adicionales
        return;
    }
    
    showRow(row, delay = 0) {
        setTimeout(() => {
            // Detectar si es una tarjeta de producto o una fila de tabla
            const isProductCard = row.classList.contains('product-card');
            row.style.display = isProductCard ? 'flex' : 'grid';
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px) scale(0.95)';
            
            requestAnimationFrame(() => {
                row.style.transition = 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0) scale(1)';
            });
        }, delay);
    }
    
    hideRow(row) {
        row.style.transition = 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
        row.style.opacity = '0';
        row.style.transform = 'translateY(-15px) scale(0.95)';
        
        setTimeout(() => {
            row.style.display = 'none';
        }, 300);
    }
    
    updateSearchResults(term, count) {
        if (term && count >= 0) {
            const message = count === 0 ? 
                `No se encontraron resultados para "${term}"` :
                `Se encontraron ${count} resultado${count !== 1 ? 's' : ''} para "${term}"`;
            
            this.showTemporaryMessage(message, count === 0 ? 'warning' : 'info');
        }
    }
    
    updateFilterResults(category, count) {
        console.log(`Filter applied: ${category} (${count} items)`);
        
        const message = `Mostrando ${count} elemento${count !== 1 ? 's' : ''} de categoría: ${category}`;
        this.showTemporaryMessage(message, 'info');
    }
    
    showTemporaryMessage(message, type = 'info') {
        // Crear mensaje temporal
        const tempMessage = document.createElement('div');
        tempMessage.className = `temp-message temp-message-${type}`;
        tempMessage.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        // Añadir al DOM
        document.body.appendChild(tempMessage);
        
        // Mostrar con animación
        setTimeout(() => tempMessage.classList.add('show'), 10);
        
        // Auto-ocultar
        setTimeout(() => {
            tempMessage.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(tempMessage)) {
                    document.body.removeChild(tempMessage);
                }
            }, 300);
        }, 3000);
    }
    
    updateEmptyState(visibleCount) {
        let emptyState = document.querySelector('.search-empty-state');
        
        if (visibleCount === 0 && this.tableRows.length > 0) {
            if (!emptyState) {
                emptyState = this.createEmptyState();
                const container = this.getTableContainer();
                if (container) {
                    container.appendChild(emptyState);
                }
            }
            if (emptyState) {
                emptyState.style.display = 'flex';
                emptyState.classList.add('show');
            }
        } else if (emptyState) {
            emptyState.classList.remove('show');
            setTimeout(() => {
                if (emptyState) emptyState.style.display = 'none';
            }, 300);
        }
    }
    
    createEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'search-empty-state';
        emptyState.innerHTML = `
            <div class="empty-content">
                <i class="fas fa-search-minus"></i>
                <h3>No se encontraron resultados</h3>
                <p>Intenta ajustar tus filtros de búsqueda o términos de búsqueda</p>
                <button class="btn-clear-search" onclick="window.universalAdmin.clearSearch()">
                    <i class="fas fa-times"></i>
                    Limpiar búsqueda
                </button>
            </div>
        `;
        return emptyState;
    }
    
    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
            this.handleSearch('');
        }
        if (this.categoryFilter) {
            this.categoryFilter.value = 'TODOS';
            this.handleCategoryFilter('TODOS');
        }
    }
    
    getTableContainer() {
        switch (this.currentSection) {
            case 'adicionales':
                return document.querySelector('.adicionales-table');
            case 'clientes':
                return document.querySelector('.clientes-table');
            default:
                return null;
        }
    }
    
    // ==========================================
    // CRUD OPERATIONS (MEJORADOS)
    // ==========================================
    
    async editItem(itemId) {
        try {
            this.showLoading(true, 'Cargando datos...');
            
            // Usar el modal manager para abrir el modal de edición
            const modalManager = this.getAvailableModalManager();
            
            if (modalManager) {
                switch (this.currentSection) {
                    case 'productos':
                        await modalManager.openProductModal('edit', itemId);
                        break;
                    case 'adicionales':
                        await modalManager.openAdicionalModal('edit', itemId);
                        break;
                    case 'clientes':
                        await modalManager.openClienteModal('edit', itemId);
                        break;
                    default:
                        this.showNotification('Función de edición no disponible', 'warning');
                }
            } else {
                this.showNotification('Sistema de modales no disponible. Recargando...', 'warning');
                setTimeout(() => location.reload(), 2000);
            }
        } catch (error) {
            console.error('Error editing item:', error);
            this.showNotification('Error al cargar el elemento para editar', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async deleteItem(itemId) {
        const itemName = this.getItemName(itemId);
        const confirmed = await this.showConfirmDialog({
            title: 'Confirmar eliminación',
            message: `¿Estás seguro de que deseas eliminar "${itemName}"? Esta acción no se puede deshacer.`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });
        
        if (!confirmed) return;
        
        try {
            this.showLoading(true, 'Eliminando...');
            
            const apiUrl = this.getApiUrl(itemId);
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json().catch(() => ({ success: true }));
            
            if (response.ok) {
                await this.animateRowDeletion(itemId);
                this.showNotification(`"${itemName}" eliminado correctamente`, 'success');
                
                // Actualizar contador si existe
                this.updateItemCount(-1);
                
            } else {
                this.showNotification(result.message || 'Error al eliminar el elemento', 'error');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            this.showNotification('Error de conexión al eliminar', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async addItem() {
        const modalManager = this.getAvailableModalManager();
        
        if (modalManager) {
            switch (this.currentSection) {
                case 'productos':
                    modalManager.openProductModal('add');
                    break;
                case 'adicionales':
                    modalManager.openAdicionalModal('add');
                    break;
                case 'clientes':
                    modalManager.openClienteModal('add');
                    break;
                default:
                    this.showNotification('Función de agregar no disponible', 'warning');
            }
        } else {
            this.showNotification('Sistema de modales no disponible. Recargando...', 'warning');
            setTimeout(() => location.reload(), 2000);
        }
    }
    
    getItemName(itemId) {
        // Use more specific selector to avoid multiple DOM queries
        const row = document.querySelector(`[data-${this.currentSection.slice(0, -1)}-id="${itemId}"], [data-product-id="${itemId}"], [data-adicional-id="${itemId}"], [data-cliente-id="${itemId}"]`);
        
        if (row) {
            // Intentar obtener el nombre del elemento
            const nameElement = row.querySelector('.product-name, .adicional-name, .cliente-name, h3, .name');
            if (nameElement) {
                return nameElement.textContent.trim();
            }
            
            // Si no encuentra nombre específico, usar el primer texto significativo
            const firstCell = row.querySelector('.cell');
            if (firstCell) {
                return firstCell.textContent.trim();
            }
        }
        
        return 'el elemento';
    }
    
    getApiUrl(itemId = null) {
        const baseUrls = {
            productos: '/menu/productos',
            adicionales: '/admin/adicionales/api',
            clientes: '/admin/clientes/api'
        };
        
        const baseUrl = baseUrls[this.currentSection];
        return itemId ? `${baseUrl}/${itemId}` : baseUrl;
    }
    
    async animateRowDeletion(itemId) {
        return new Promise((resolve) => {
            // Use more specific selector to avoid multiple DOM queries
            const row = document.querySelector(`[data-${this.currentSection.slice(0, -1)}-id="${itemId}"], [data-product-id="${itemId}"], [data-adicional-id="${itemId}"], [data-cliente-id="${itemId}"]`);
            
            if (row) {
                // Animación de eliminación mejorada
                row.style.transition = 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)';
                row.style.transform = 'translateX(-100%) scale(0.8)';
                row.style.opacity = '0';
                row.style.filter = 'blur(3px)';
                
                setTimeout(() => {
                    row.remove();
                    resolve();
                }, 500);
            } else {
                resolve();
            }
        });
    }
    
    updateItemCount(delta) {
        const statCards = document.querySelectorAll('.stat-number');
        statCards.forEach(card => {
            const currentCount = parseInt(card.textContent) || 0;
            const newCount = Math.max(0, currentCount + delta);
            
            // Animación del contador
            this.animateCounter(card, currentCount, newCount);
        });
    }
    
    animateCounter(element, from, to) {
        const duration = 500;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentCount = Math.round(from + (to - from) * progress);
            element.textContent = currentCount;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // ==========================================
    // MODAL OPERATIONS (MEJORADO)
    // ==========================================
    
    getAvailableModalManager() {
        if (this.modalManager) {
            return this.modalManager;
        }
        
        if (window.globalModalManager) {
            this.modalManager = window.globalModalManager;
            return this.modalManager;
        }
        
        if (window.AdminModalManager) {
            this.modalManager = new window.AdminModalManager();
            return this.modalManager;
        }
        
        console.error('Modal manager no disponible');
        return null;
    }
    
    // ==========================================
    // UTILITY FUNCTIONS (MEJORADOS)
    // ==========================================
    
    getTextContent(element, selector) {
        const target = element.querySelector(selector);
        return target ? target.textContent.trim() : '';
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
    
    showLoading(show, message = 'Cargando...') {
        if (show) {
            // Limpiar cualquier overlay existente primero
            this.removeAllLoadingOverlays();
            
            const loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'universal-admin-loading-overlay';
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">${message}</div>
                </div>
            `;
            document.body.appendChild(loadingOverlay);
            
            setTimeout(() => {
                loadingOverlay.classList.add('show');
            }, 10);
        } else {
            this.removeAllLoadingOverlays();
        }
    }
    
    removeAllLoadingOverlays() {
        // Limpieza agresiva: remover TODOS los overlays por ID o clase
        const overlaysById = document.querySelectorAll('#universal-admin-loading-overlay, #admin-loading-overlay');
        const overlaysByClass = document.querySelectorAll('.loading-overlay');
        
        [...overlaysById, ...overlaysByClass].forEach(overlay => {
            if (overlay && document.body.contains(overlay)) {
                overlay.classList.remove('show');
                try {
                    document.body.removeChild(overlay);
                } catch (e) {
                    // Elemento ya removido
                    console.log('Overlay ya removido:', e.message);
                }
            }
        });
        
        // Limpieza adicional para elementos huérfanos
        setTimeout(() => {
            const remainingOverlays = document.querySelectorAll('#universal-admin-loading-overlay, #admin-loading-overlay, .loading-overlay');
            remainingOverlays.forEach(overlay => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            });
        }, 100);
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification admin-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                </div>
                <div class="notification-text">
                    <span>${message}</span>
                </div>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            this.closeNotification(notification);
        }, type === 'success' ? 4000 : 6000);
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.closeNotification(notification);
        });
    }
    
    closeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    showConfirmDialog(options) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'admin-confirm-modal show';
            modal.innerHTML = `
                <div class="confirm-modal-content">
                    <div class="confirm-modal-header">
                        <div class="confirm-icon confirm-icon-${options.type}">
                            <i class="fas fa-${this.getNotificationIcon(options.type)}"></i>
                        </div>
                        <h3>${options.title}</h3>
                    </div>
                    <div class="confirm-modal-body">
                        <p>${options.message}</p>
                    </div>
                    <div class="confirm-modal-footer">
                        <button class="btn-cancel-confirm">${options.cancelText}</button>
                        <button class="btn-confirm-action btn-${options.type}">${options.confirmText}</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const cancelBtn = modal.querySelector('.btn-cancel-confirm');
            const confirmBtn = modal.querySelector('.btn-confirm-action');
            
            const closeModal = () => {
                modal.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(modal)) {
                        document.body.removeChild(modal);
                    }
                }, 300);
            };
            
            cancelBtn.addEventListener('click', () => {
                closeModal();
                resolve(false);
            });
            
            confirmBtn.addEventListener('click', () => {
                closeModal();
                resolve(true);
            });
            
            // ESC key
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                    resolve(false);
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        });
    }
    
    setupKeyboardShortcuts() {
        // Solo para secciones que no sean productos
        if (this.currentSection === 'productos') return;
        
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (this.searchInput) {
                    this.searchInput.focus();
                    this.searchInput.select();
                }
            }
            
            // Ctrl/Cmd + N for new item
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.addItem();
            }
            
            // Escape to clear search
            if (e.key === 'Escape' && this.searchInput === document.activeElement) {
                this.clearSearch();
                this.searchInput.blur();
            }
            
            // Ctrl/Cmd + R to refresh (override default)
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.showNotification('Recargando página...', 'info');
                setTimeout(() => location.reload(), 1000);
            }
        });
    }
    
    initializeAnimations() {
        // Solo para secciones que no sean productos
        if (this.currentSection === 'productos') return;
        
        // Animación inicial mejorada
        this.tableRows.forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateY(30px) scale(0.95)';
            
            setTimeout(() => {
                row.style.transition = 'all 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0) scale(1)';
            }, index * 50);
        });
    }
    
    addNotificationStyles() {
        if (document.getElementById('admin-universal-styles')) return;
        
        const link = document.createElement('link');
        link.id = 'admin-universal-styles';
        link.rel = 'stylesheet';
        link.href = '/css/components/admin-universal.css';
        document.head.appendChild(link);
    }
}

// Funciones globales para compatibilidad con handlers inline (SOLO PARA CLIENTES Y ADICIONALES)
window.editProduct = function(productId) {
    if (window.universalAdmin) {
        window.universalAdmin.editItem(productId);
    }
};

window.deleteProduct = function(productId) {
    if (window.universalAdmin) {
        window.universalAdmin.deleteItem(productId);
    }
};

window.editAdicional = function(adicionalId) {
    if (window.universalAdmin) {
        window.universalAdmin.editItem(adicionalId);
    }
};

window.deleteAdicional = function(adicionalId) {
    if (window.universalAdmin) {
        window.universalAdmin.deleteItem(adicionalId);
    }
};

window.editCliente = function(clienteId) {
    if (window.universalAdmin) {
        window.universalAdmin.editItem(clienteId);
    }
};

window.deleteCliente = function(clienteId) {
    if (window.universalAdmin) {
        window.universalAdmin.deleteItem(clienteId);
    }
};

window.openAddProductModal = function() {
    if (window.universalAdmin) {
        window.universalAdmin.addItem();
    }
};

window.openAddAdicionalModal = function() {
    if (window.universalAdmin) {
        window.universalAdmin.addItem();
    }
};

window.openAddClienteModal = function() {
    if (window.universalAdmin) {
        window.universalAdmin.addItem();
    }
};

// Función de emergencia global para limpiar overlays
window.clearAllLoadingOverlays = function() {
    const overlays = document.querySelectorAll('#universal-admin-loading-overlay, #admin-loading-overlay, .loading-overlay');
    overlays.forEach(overlay => {
        if (document.body.contains(overlay)) {
            overlay.classList.remove('show');
            try {
                document.body.removeChild(overlay);
            } catch (e) {
                console.log('Overlay ya removido:', e.message);
            }
        }
    });
    console.log('🧹 Limpieza de emergencia completada');
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.universalAdmin = new UniversalAdminManager();
    
    // Limpieza automática al cargar
    setTimeout(() => {
        if (window.clearAllLoadingOverlays) {
            window.clearAllLoadingOverlays();
        }
    }, 1000);
});