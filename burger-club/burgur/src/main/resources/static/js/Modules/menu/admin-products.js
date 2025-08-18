///Users/santosa/Documents/GitHub/website_for_restaurant/burger-club/burgur/src/main/resources/static/js/Modules/menu/admin-products.js
// ==========================================
// BURGER CLUB - ADMIN PRODUCTS MODULE
// ==========================================

class AdminProductsManager {
    constructor() {
        this.searchInput = null;
        this.categoryFilter = null;
        this.tableRows = [];
        this.currentProducts = [];
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        console.log('🔧 Admin Products Manager initialized');
        
        this.bindElements();
        this.bindEvents();
        this.loadProducts();
        this.initializeAnimations();
    }
    
    bindElements() {
        this.searchInput = document.getElementById('adminSearchInput');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.tableRows = document.querySelectorAll('.table-row:not(.table-header)');
        
        if (!this.searchInput || !this.categoryFilter) {
            console.warn('🔧 Admin elements not found');
        }
    }
    
    bindEvents() {
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }
        
        // Category filter
        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', (e) => {
                this.handleCategoryFilter(e.target.value);
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Auto-save functionality
        this.setupAutoSave();
    }
    
    // ==========================================
    // SEARCH AND FILTER FUNCTIONALITY
    // ==========================================
    
    handleSearch(searchTerm) {
        const normalizedTerm = searchTerm.toLowerCase().trim();
        let visibleCount = 0;
        
        this.tableRows.forEach((row, index) => {
            const productName = this.getTextContent(row, '.product-name').toLowerCase();
            const category = this.getTextContent(row, '.product-category').toLowerCase();
            const price = this.getTextContent(row, '.product-price').toLowerCase();
            
            const matches = !normalizedTerm || 
                productName.includes(normalizedTerm) || 
                category.includes(normalizedTerm) || 
                price.includes(normalizedTerm);
            
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
    
    handleCategoryFilter(selectedCategory) {
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
        if (term) {
            this.showNotification(`Encontrados ${count} productos para "${term}"`, 'info');
        }
    }
    
    updateFilterResults(category, count) {
        console.log(`🔧 Filter applied: ${category} (${count} products)`);
    }
    
    updateEmptyState(visibleCount) {
        let emptyState = document.querySelector('.empty-state');
        
        if (visibleCount === 0) {
            if (!emptyState) {
                emptyState = this.createEmptyState();
                const productTable = document.querySelector('.product-table');
                productTable.appendChild(emptyState);
            }
            emptyState.style.display = 'block';
        } else if (emptyState) {
            emptyState.style.display = 'none';
        }
    }
    
    createEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>No se encontraron productos</h3>
            <p>Intenta ajustar tus filtros de búsqueda o agregar nuevos productos</p>
        `;
        return emptyState;
    }
    
    // ==========================================
    // PRODUCT CRUD OPERATIONS
    // ==========================================
    
    async editProduct(productId) {
        try {
            this.showLoading(true);
            
            // Get product data
            const productData = await this.getProductData(productId);
            
            if (!productData) {
                this.showNotification('Error: Producto no encontrado', 'error');
                return;
            }
            
            // Open edit modal
            this.openEditModal(productData);
            
        } catch (error) {
            console.error('Error editing product:', error);
            this.showNotification('Error al cargar el producto', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async deleteProduct(productId) {
        const confirmed = await this.showConfirmDialog({
            title: '¿Eliminar producto?',
            message: '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });
        
        if (!confirmed) return;
        
        try {
            this.showLoading(true);
            
            // Find and remove the row
            const row = document.querySelector(`[data-product-id="${productId}"]`);
            if (row) {
                await this.animateRowDeletion(row);
            }
            
            // Here you would make the actual API call
            // await this.deleteProductAPI(productId);
            
            this.showNotification('Producto eliminado correctamente', 'success');
            
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showNotification('Error al eliminar el producto', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async addProduct() {
        this.openAddModal();
    }
    
    async animateRowDeletion(row) {
        return new Promise((resolve) => {
            row.style.transition = 'all 0.5s ease';
            row.style.transform = 'translateX(-100%)';
            row.style.opacity = '0';
            
            setTimeout(() => {
                row.remove();
                resolve();
            }, 500);
        });
    }
    
    // ==========================================
    // MODAL OPERATIONS
    // ==========================================
    
    openEditModal(productData) {
        const modal = this.createProductModal('edit', productData);
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }
    
    openAddModal() {
        const modal = this.createProductModal('add');
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }
    
    createProductModal(mode, productData = {}) {
        const isEdit = mode === 'edit';
        const title = isEdit ? 'Editar Producto' : 'Agregar Producto';
        
        const modal = document.createElement('div');
        modal.className = 'product-modal';
        modal.innerHTML = `
            <div class="product-modal-content">
                <div class="product-modal-header">
                    <h3>${title}</h3>
                    <button class="product-modal-close">&times;</button>
                </div>
                <div class="product-modal-body">
                    <form class="product-form" id="productForm">
                        <div class="form-group">
                            <label for="productName">Nombre del producto</label>
                            <input type="text" id="productName" name="name" value="${productData.name || ''}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="productCategory">Categoría</label>
                            <select id="productCategory" name="category" required>
                                <option value="">Seleccionar categoría</option>
                                <option value="HAMBURGUESA" ${productData.category === 'HAMBURGUESA' ? 'selected' : ''}>Hamburguesa</option>
                                <option value="ACOMPAÑAMIENTO" ${productData.category === 'ACOMPAÑAMIENTO' ? 'selected' : ''}>Acompañamiento</option>
                                <option value="PERRO CALIENTE" ${productData.category === 'PERRO CALIENTE' ? 'selected' : ''}>Perro Caliente</option>
                                <option value="BEBIDA" ${productData.category === 'BEBIDA' ? 'selected' : ''}>Bebida</option>
                                <option value="POSTRE" ${productData.category === 'POSTRE' ? 'selected' : ''}>Postre</option>
                            </select>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="productPrice">Precio</label>
                                <input type="number" id="productPrice" name="price" value="${productData.price || ''}" min="0" step="1000" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="productStock">Stock</label>
                                <input type="number" id="productStock" name="stock" value="${productData.stock || ''}" min="0" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="productDescription">Descripción</label>
                            <textarea id="productDescription" name="description" rows="3">${productData.description || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="productImage">URL de la imagen</label>
                            <input type="url" id="productImage" name="image" value="${productData.image || ''}" placeholder="https://...">
                        </div>
                        
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="isNew" ${productData.isNew ? 'checked' : ''}>
                                <span class="checkbox-custom"></span>
                                Producto nuevo
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="isPopular" ${productData.isPopular ? 'checked' : ''}>
                                <span class="checkbox-custom"></span>
                                Producto popular
                            </label>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-cancel">Cancelar</button>
                            <button type="submit" class="btn-save">
                                ${isEdit ? 'Actualizar' : 'Guardar'} Producto
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        this.bindModalEvents(modal, isEdit, productData.id);
        this.addModalStyles();
        
        return modal;
    }
    
    bindModalEvents(modal, isEdit, productId) {
        const closeBtn = modal.querySelector('.product-modal-close');
        const cancelBtn = modal.querySelector('.btn-cancel');
        const form = modal.querySelector('#productForm');
        
        closeBtn.addEventListener('click', () => this.closeModal(modal));
        cancelBtn.addEventListener('click', () => this.closeModal(modal));
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(e, modal, isEdit, productId);
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
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
    
    async handleFormSubmit(e, modal, isEdit, productId) {
        const formData = new FormData(e.target);
        const productData = this.extractFormData(formData);
        
        // Validate form
        if (!this.validateForm(productData)) {
            return;
        }
        
        try {
            this.showLoading(true);
            
            if (isEdit) {
                await this.updateProduct(productId, productData);
                this.showNotification('Producto actualizado correctamente', 'success');
            } else {
                await this.createProduct(productData);
                this.showNotification('Producto creado correctamente', 'success');
            }
            
            this.closeModal(modal);
            this.refreshTable();
            
        } catch (error) {
            console.error('Error saving product:', error);
            this.showNotification('Error al guardar el producto', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    extractFormData(formData) {
        return {
            name: formData.get('name'),
            category: formData.get('category'),
            price: parseInt(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            description: formData.get('description'),
            image: formData.get('image'),
            isNew: formData.has('isNew'),
            isPopular: formData.has('isPopular')
        };
    }
    
    validateForm(productData) {
        const errors = [];
        
        if (!productData.name?.trim()) {
            errors.push('El nombre es requerido');
        }
        
        if (!productData.category) {
            errors.push('La categoría es requerida');
        }
        
        if (!productData.price || productData.price <= 0) {
            errors.push('El precio debe ser mayor a 0');
        }
        
        if (!productData.stock || productData.stock < 0) {
            errors.push('El stock debe ser mayor o igual a 0');
        }
        
        if (errors.length > 0) {
            this.showNotification(errors.join(', '), 'error');
            return false;
        }
        
        return true;
    }
    
    validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        
        field.classList.remove('error', 'success');
        
        if (isRequired && !value) {
            field.classList.add('error');
            return false;
        } else if (value) {
            field.classList.add('success');
        }
        
        return true;
    }
    
    // ==========================================
    // API SIMULATION (Replace with real API calls)
    // ==========================================
    
    async getProductData(productId) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: productId,
                    name: 'Producto de ejemplo',
                    category: 'HAMBURGUESA',
                    price: 25000,
                    stock: 15,
                    description: 'Descripción del producto',
                    image: 'https://via.placeholder.com/200x150',
                    isNew: false,
                    isPopular: true
                });
            }, 500);
        });
    }
    
    async updateProduct(productId, productData) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Product updated:', productId, productData);
                resolve();
            }, 1000);
        });
    }
    
    async createProduct(productData) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Product created:', productData);
                resolve();
            }, 1000);
        });
    }
    
    async loadProducts() {
        // Simulate loading products from API
        console.log('🔧 Loading products...');
    }
    
    refreshTable() {
        // Refresh table data
        console.log('🔧 Refreshing table...');
        window.location.reload(); // Simple refresh for now
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
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto close
        setTimeout(() => {
            this.closeNotification(notification);
        }, 5000);
        
        // Close button
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
            modal.className = 'confirm-modal';
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
    
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (this.searchInput) {
                this.searchInput.focus();
            }
        }
        
        // Ctrl/Cmd + N for new product
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.addProduct();
        }
        
        // Escape to clear search
        if (e.key === 'Escape' && this.searchInput === document.activeElement) {
            this.searchInput.value = '';
            this.handleSearch('');
            this.searchInput.blur();
        }
    }
    
    setupAutoSave() {
        // Save filter preferences
        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', (e) => {
                localStorage.setItem('admin-category-filter', e.target.value);
            });
            
            // Restore saved filter
            const savedFilter = localStorage.getItem('admin-category-filter');
            if (savedFilter) {
                this.categoryFilter.value = savedFilter;
                this.handleCategoryFilter(savedFilter);
            }
        }
    }
    
    initializeAnimations() {
        // Animate table rows on load
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
    
    addModalStyles() {
        if (document.getElementById('admin-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'admin-modal-styles';
        style.textContent = `
            .product-modal {
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
            
            .product-modal.active {
                opacity: 1;
                visibility: visible;
            }
            
            .product-modal-content {
                background: var(--bg-color);
                border: 2px solid #fbb5b5;
                border-radius: var(--border-radius);
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .product-modal.active .product-modal-content {
                transform: scale(1);
            }
            
            .product-modal-header {
                padding: 25px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .product-modal-header h3 {
                color: var(--text-white);
                margin: 0;
                font-family: var(--font-secondary);
            }
            
            .product-modal-close {
                background: none;
                border: none;
                font-size: 2rem;
                color: var(--text-white);
                cursor: pointer;
                transition: color 0.3s ease;
            }
            
            .product-modal-close:hover {
                color: var(--color-danger);
            }
            
            .product-modal-body {
                padding: 25px;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                color: var(--text-white);
                font-weight: 600;
                font-size: 0.9rem;
            }
            
            .form-group input,
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: var(--border-radius-small);
                color: var(--text-white);
                font-family: var(--font-primary);
                transition: all 0.3s ease;
            }
            
            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #fbb5b5;
                background: rgba(255, 255, 255, 0.15);
            }
            
            .form-group input.error {
                border-color: var(--color-danger);
            }
            
            .form-group input.success {
                border-color: var(--color-success);
            }
            
            .checkbox-label {
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
            }
            
            .checkbox-label input[type="checkbox"] {
                width: auto;
                margin: 0;
            }
            
            .form-actions {
                display: flex;
                gap: 15px;
                justify-content: flex-end;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .btn-cancel,
            .btn-save {
                padding: 12px 24px;
                border: none;
                border-radius: var(--border-radius-small);
                font-family: var(--font-primary);
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-cancel {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-white);
            }
            
            .btn-cancel:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .btn-save {
                background: var(--color-success);
                color: white;
            }
            
            .btn-save:hover {
                background: #45a049;
                transform: translateY(-2px);
            }
            
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--bg-color);
                border: 2px solid;
                border-radius: var(--border-radius-small);
                padding: 15px 20px;
                z-index: 2000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                min-width: 300px;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-success { border-color: var(--color-success); }
            .notification-error { border-color: var(--color-danger); }
            .notification-warning { border-color: var(--color-warning); }
            .notification-info { border-color: var(--color-info); }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                color: var(--text-white);
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--text-white);
                cursor: pointer;
                margin-left: auto;
                font-size: 1.2rem;
            }
            
            @media (max-width: 768px) {
                .product-modal-content {
                    width: 95%;
                    margin: 20px;
                }
                
                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .form-actions {
                    flex-direction: column;
                }
                
                .notification {
                    right: 10px;
                    left: 10px;
                    min-width: auto;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Global functions for inline event handlers
window.editProduct = function(productId) {
    if (window.adminManager) {
        window.adminManager.editProduct(productId);
    }
};

window.deleteProduct = function(productId) {
    if (window.adminManager) {
        window.adminManager.deleteProduct(productId);
    }
};

window.openAddProductModal = function() {
    if (window.adminManager) {
        window.adminManager.addProduct();
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminProductsManager();
});

export default AdminProductsManager;