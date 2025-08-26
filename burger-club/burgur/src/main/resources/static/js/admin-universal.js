//burger-club/burgur/src/main/resources/static/js/admin-universal.js


// ==========================================
// BURGER CLUB - ADMIN UNIVERSAL MANAGER
// ==========================================

class UniversalAdminManager {
    constructor() {
        this.currentSection = this.getCurrentSection();
        this.searchInput = null;
        this.tableRows = [];
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        console.log(`Admin Universal Manager initialized for section: ${this.currentSection}`);
        
        this.bindElements();
        this.bindEvents();
        this.initializeAnimations();
        this.setupKeyboardShortcuts();
        this.addNotificationStyles();
        
        // Load modal manager if available
        if (typeof AdminModalManager !== 'undefined') {
            this.modalManager = new AdminModalManager();
        }
    }
    
    getCurrentSection() {
        const path = window.location.pathname;
        if (path.includes('/admin/adicionales')) return 'adicionales';
        if (path.includes('/admin/clientes')) return 'clientes';
        if (path.includes('/admin') || path.includes('/menu/admin')) return 'productos';
        return 'dashboard';
    }
    
    bindElements() {
        this.searchInput = document.getElementById('adminSearchInput');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.tableRows = document.querySelectorAll('.table-row:not(.table-header)');
        
        if (!this.searchInput) {
            console.warn('Search input not found');
        }
    }
    
    bindEvents() {
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }
        
        // Category filter (solo para productos)
        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', (e) => {
                this.handleCategoryFilter(e.target.value);
            });
        }
    }
    
    // ==========================================
    // SEARCH AND FILTER FUNCTIONALITY
    // ==========================================
    
    handleSearch(searchTerm) {
        const normalizedTerm = searchTerm.toLowerCase().trim();
        let visibleCount = 0;
        
        this.tableRows.forEach((row, index) => {
            const matches = this.doesRowMatch(row, normalizedTerm);
            
            if (matches) {
                this.showRow(row, index * 50);
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
            case 'productos':
                const productName = this.getTextContent(row, '.product-name');
                const category = this.getTextContent(row, '.product-category');
                const price = this.getTextContent(row, '.product-price');
                return productName.toLowerCase().includes(searchTerm) ||
                       category.toLowerCase().includes(searchTerm) ||
                       price.toLowerCase().includes(searchTerm);
                       
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
        if (this.currentSection !== 'productos') return;
        
        let visibleCount = 0;
        
        this.tableRows.forEach((row, index) => {
            const category = this.getTextContent(row, '.product-category');
            const matches = selectedCategory === 'TODOS' || category === selectedCategory;
            
            if (matches) {
                this.showRow(row, index * 50);
                visibleCount++;
            } else {
                this.hideRow(row);
            }
        });
        
        this.updateFilterResults(selectedCategory, visibleCount);
        this.updateEmptyState(visibleCount);
        
        // Clear search when filter changes
        if (this.searchInput) {
            this.searchInput.value = '';
        }
    }
    
    showRow(row, delay = 0) {
        setTimeout(() => {
            row.style.display = 'grid';
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            
            requestAnimationFrame(() => {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            });
        }, delay);
    }
    
    hideRow(row) {
        row.style.transition = 'all 0.2s ease';
        row.style.opacity = '0';
        row.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            row.style.display = 'none';
        }, 200);
    }
    
    updateSearchResults(term, count) {
        if (term && count >= 0) {
            console.log(`Search results: ${count} items found for "${term}"`);
        }
    }
    
    updateFilterResults(category, count) {
        console.log(`Filter applied: ${category} (${count} items)`);
    }
    
    updateEmptyState(visibleCount) {
        let emptyState = document.querySelector('.empty-state');
        
        if (visibleCount === 0 && this.tableRows.length > 0) {
            if (!emptyState) {
                emptyState = this.createEmptyState();
                const tableContainer = this.getTableContainer();
                if (tableContainer) {
                    tableContainer.appendChild(emptyState);
                }
            }
            if (emptyState) {
                emptyState.style.display = 'block';
            }
        } else if (emptyState) {
            emptyState.style.display = 'none';
        }
    }
    
    createEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>No se encontraron resultados</h3>
            <p>Intenta ajustar tus filtros de búsqueda</p>
        `;
        return emptyState;
    }
    
    getTableContainer() {
        switch (this.currentSection) {
            case 'productos':
                return document.querySelector('.product-table');
            case 'adicionales':
                return document.querySelector('.adicionales-table');
            case 'clientes':
                return document.querySelector('.clientes-table');
            default:
                return null;
        }
    }
    
    // ==========================================
    // CRUD OPERATIONS
    // ==========================================
    
    async editItem(itemId) {
        try {
            this.showLoading(true);
            
            const apiUrl = this.getApiUrl(itemId);
            const response = await fetch(apiUrl);
            
            if (response.ok) {
                const item = await response.json();
                this.openEditModal(item);
            } else {
                this.showNotification('Error al cargar el elemento', 'error');
            }
        } catch (error) {
            console.error('Error editing item:', error);
            this.showNotification('Error al cargar el elemento', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async deleteItem(itemId) {
        const confirmed = await this.showConfirmDialog({
            title: '¿Eliminar elemento?',
            message: '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });
        
        if (!confirmed) return;
        
        try {
            this.showLoading(true);
            
            const apiUrl = this.getApiUrl(itemId);
            const response = await fetch(apiUrl, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await this.animateRowDeletion(itemId);
                this.showNotification('Elemento eliminado correctamente', 'success');
            } else {
                const errorData = await response.json().catch(() => ({}));
                this.showNotification(errorData.message || 'Error al eliminar el elemento', 'error');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            this.showNotification('Error al eliminar el elemento', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async addItem() {
        this.openAddModal();
    }
    
    getApiUrl(itemId = null) {
        const baseUrls = {
            productos: '/menu/api/productos',
            adicionales: '/admin/adicionales/api',
            clientes: '/admin/clientes/api'
        };
        
        const baseUrl = baseUrls[this.currentSection];
        return itemId ? `${baseUrl}/${itemId}` : baseUrl;
    }
    
    async animateRowDeletion(itemId) {
        return new Promise((resolve) => {
            const selectors = [
                `[data-${this.currentSection.slice(0, -1)}-id="${itemId}"]`,
                `[data-product-id="${itemId}"]`,
                `[data-adicional-id="${itemId}"]`,
                `[data-cliente-id="${itemId}"]`
            ];
            
            let row = null;
            for (const selector of selectors) {
                row = document.querySelector(selector);
                if (row) break;
            }
            
            if (row) {
                row.style.transition = 'all 0.5s ease';
                row.style.transform = 'translateX(-100%)';
                row.style.opacity = '0';
                
                setTimeout(() => {
                    row.remove();
                    resolve();
                }, 500);
            } else {
                resolve();
            }
        });
    }
    
    // ==========================================
    // MODAL OPERATIONS
    // ==========================================
    
    openEditModal(item) {
        if (this.modalManager) {
            switch (this.currentSection) {
                case 'productos':
                    this.modalManager.openProductModal('edit', item);
                    break;
                case 'adicionales':
                    this.modalManager.openAdicionalModal('edit', item);
                    break;
                case 'clientes':
                    this.modalManager.openClienteModal('edit', item);
                    break;
                default:
                    this.showNotification('Función de edición pendiente de implementación', 'info');
            }
        } else {
            this.showNotification('Sistema de modales no disponible', 'warning');
        }
    }
    
    openAddModal() {
        if (this.modalManager) {
            switch (this.currentSection) {
                case 'productos':
                    this.modalManager.openProductModal('add');
                    break;
                case 'adicionales':
                    this.modalManager.openAdicionalModal('add');
                    break;
                case 'clientes':
                    this.modalManager.openClienteModal('add');
                    break;
                default:
                    this.showNotification('Función de agregar pendiente de implementación', 'info');
            }
        } else {
            this.showNotification('Sistema de modales no disponible', 'warning');
        }
    }
    
    // ==========================================
    // UTILITY FUNCTIONS
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
    
    showLoading(show) {
        const body = document.body;
        if (show) {
            body.classList.add('loading');
        } else {
            body.classList.remove('loading');
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification admin-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            this.closeNotification(notification);
        }, 5000);
        
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
            modal.className = 'admin-confirm-modal';
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
            
            cancelBtn.addEventListener('click', () => {
                this.closeModal(modal);
                resolve(false);
            });
            
            confirmBtn.addEventListener('click', () => {
                this.closeModal(modal);
                resolve(true);
            });
            
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
        });
    }
    
    closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 300);
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (this.searchInput) {
                    this.searchInput.focus();
                }
            }
            
            // Ctrl/Cmd + N for new item
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.addItem();
            }
            
            // Escape to clear search
            if (e.key === 'Escape' && this.searchInput === document.activeElement) {
                this.searchInput.value = '';
                this.handleSearch('');
                this.searchInput.blur();
            }
        });
    }
    
    initializeAnimations() {
        this.tableRows.forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                row.style.transition = 'all 0.6s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    addNotificationStyles() {
        if (document.getElementById('admin-notification-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'admin-notification-styles';
        style.textContent = `
            .admin-notification {
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
                max-width: 400px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            
            .admin-notification.show {
                transform: translateX(0);
            }
            
            .admin-notification-success { border-color: #4caf50; }
            .admin-notification-error { border-color: #f44336; }
            .admin-notification-warning { border-color: #ff9800; }
            .admin-notification-info { border-color: #2196f3; }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                color: white;
                font-family: 'Sansita Swashed', cursive;
                font-size: 14px;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                margin-left: auto;
                font-size: 1.2rem;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .admin-confirm-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 2000;
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .admin-confirm-modal.active {
                opacity: 1;
                visibility: visible;
            }
            
            .confirm-modal-content {
                background: #12372a;
                border: 2px solid #fbb5b5;
                border-radius: 8px;
                width: 90%;
                max-width: 400px;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .admin-confirm-modal.active .confirm-modal-content {
                transform: scale(1);
            }
            
            .confirm-modal-header {
                padding: 25px;
                text-align: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .confirm-icon {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 15px;
                font-size: 1.5rem;
            }
            
            .confirm-icon-danger {
                background: rgba(244, 67, 54, 0.2);
                color: #f44336;
            }
            
            .confirm-modal-header h3 {
                color: white;
                margin: 0;
                font-family: 'Lexend Zetta', sans-serif;
                font-size: 1.2rem;
            }
            
            .confirm-modal-body {
                padding: 20px 25px;
                text-align: center;
            }
            
            .confirm-modal-body p {
                color: rgba(255, 255, 255, 0.8);
                margin: 0;
                line-height: 1.5;
            }
            
            .confirm-modal-footer {
                padding: 20px 25px;
                display: flex;
                gap: 15px;
                justify-content: center;
            }
            
            .btn-cancel-confirm,
            .btn-confirm-action {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-family: 'Sansita Swashed', cursive;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-cancel-confirm {
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }
            
            .btn-cancel-confirm:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .btn-confirm-action.btn-danger {
                background: #f44336;
                color: white;
            }
            
            .btn-confirm-action.btn-danger:hover {
                background: #d32f2f;
            }
            
            .loading {
                opacity: 0.6;
                pointer-events: none;
                position: relative;
            }
            
            .loading::after {
                content: '';
                position: fixed;
                top: 50%;
                left: 50%;
                width: 40px;
                height: 40px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-top: 3px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                transform: translate(-50%, -50%);
                z-index: 3000;
            }
            
            @keyframes spin {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
            
            @media (max-width: 768px) {
                .admin-notification {
                    right: 10px;
                    left: 10px;
                    min-width: auto;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Global functions for backward compatibility with inline handlers
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.universalAdmin = new UniversalAdminManager();
});

export default UniversalAdminManager;