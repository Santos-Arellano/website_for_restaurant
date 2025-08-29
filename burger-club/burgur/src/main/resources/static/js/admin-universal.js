// burger-club/burgur/src/main/resources/static/js/admin-universal.js
// ==========================================
// BURGER CLUB - ADMIN UNIVERSAL MANAGER (MEJORADO)
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
        this.searchInput = document.getElementById('adminSearchInput');
        this.categoryFilter = document.getElementById('categoryFilter');
        
        // Para el diseño de cuadrícula
        if (this.currentSection === 'productos') {
            this.tableRows = document.querySelectorAll('.product-card[data-product-id]');
        } else {
            // Para el diseño de tabla tradicional
            this.tableRows = document.querySelectorAll('.table-row:not(.table-header)');
        }
        
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
    // SEARCH AND FILTER FUNCTIONALITY (MEJORADO)
    // ==========================================
    
    handleSearch(searchTerm) {
        const normalizedTerm = searchTerm.toLowerCase().trim();
        let visibleCount = 0;
        
        this.tableRows.forEach((row, index) => {
            const matches = this.doesRowMatch(row, normalizedTerm);
            
            if (matches) {
                this.showRow(row, index * 30); // Animación más rápida
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
                // Para el nuevo diseño de cuadrícula
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
            const matches = selectedCategory === 'TODOS' || 
                           category.toLowerCase() === selectedCategory.toLowerCase();
            
            if (matches) {
                this.showRow(row, index * 30);
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
            row.style.display = this.currentSection === 'productos' ? 'block' : 'grid';
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
            
            // Mostrar mensaje temporal en la esquina
            this.showTemporaryMessage(message, count === 0 ? 'warning' : 'info');
        }
    }
    
    updateFilterResults(category, count) {
        console.log(`Filter applied: ${category} (${count} items)`);
        
        const message = `Mostrando ${count} producto${count !== 1 ? 's' : ''} de categoría: ${category}`;
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
            case 'productos':
                return document.querySelector('.products-grid') || document.querySelector('.product-table');
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
            // Intentar obtener el nombre del elemento
            const nameSelectors = ['.product-name', '.adicional-name', '.cliente-name', 'h3', '.name'];
            for (const nameSelector of nameSelectors) {
                const nameElement = row.querySelector(nameSelector);
                if (nameElement) {
                    return nameElement.textContent.trim();
                }
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
            const loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'admin-loading-overlay';
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
            const loadingOverlay = document.getElementById('admin-loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(loadingOverlay)) {
                        document.body.removeChild(loadingOverlay);
                    }
                }, 300);
            }
        }
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
        if (document.getElementById('admin-notification-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'admin-notification-styles';
        style.textContent = `
            /* Loading Overlay */
            #admin-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(18, 55, 42, 0.95);
                backdrop-filter: blur(8px);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            #admin-loading-overlay.show {
                opacity: 1;
                visibility: visible;
            }

            .loading-content {
                text-align: center;
                color: white;
            }

            .loading-spinner {
                width: 60px;
                height: 60px;
                border: 4px solid rgba(251, 181, 181, 0.3);
                border-top: 4px solid #fbb5b5;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }

            .loading-text {
                font-size: 1.1rem;
                font-family: 'Sansita Swashed', cursive;
                font-weight: 600;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Temporary Messages */
            .temp-message {
                position: fixed;
                top: 100px;
                right: 25px;
                background: rgba(18, 55, 42, 0.95);
                border: 2px solid;
                border-radius: 10px;
                padding: 15px 20px;
                z-index: 1500;
                transform: translateX(120%);
                transition: transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                gap: 10px;
                font-family: 'Sansita Swashed', cursive;
                font-size: 14px;
                max-width: 350px;
            }

            .temp-message.show {
                transform: translateX(0);
            }

            .temp-message-info { 
                border-color: #2196f3; 
                color: #2196f3;
            }
            
            .temp-message-warning { 
                border-color: #ff9800; 
                color: #ff9800;
            }

            /* Search Empty State */
            .search-empty-state {
                display: none;
                justify-content: center;
                align-items: center;
                min-height: 300px;
                grid-column: 1 / -1;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                margin: 20px 0;
                backdrop-filter: blur(10px);
                border: 2px dashed rgba(255, 255, 255, 0.2);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .search-empty-state.show {
                opacity: 1;
            }

            .empty-content {
                text-align: center;
                color: white;
            }

            .empty-content i {
                font-size: 4rem;
                color: #fbb5b5;
                margin-bottom: 20px;
                opacity: 0.7;
            }

            .empty-content h3 {
                font-size: 1.5rem;
                margin-bottom: 10px;
                font-family: 'Lexend Zetta', sans-serif;
            }

            .empty-content p {
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: 25px;
                line-height: 1.5;
            }

            .btn-clear-search {
                background: linear-gradient(135deg, #fbb5b5, #e8a3a3);
                color: #12372a;
                border: none;
                padding: 12px 20px;
                border-radius: 25px;
                font-family: 'Sansita Swashed', cursive;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 0 auto;
            }

            .btn-clear-search:hover {
                background: linear-gradient(135deg, #e8a3a3, #d19191);
                transform: translateY(-2px);
            }

            /* Notifications (Enhanced) */
            .admin-notification {
                position: fixed;
                top: 25px;
                right: 25px;
                background: rgba(18, 55, 42, 0.95);
                border: 2px solid;
                border-radius: 12px;
                padding: 18px 22px;
                z-index: 2000;
                transform: translateX(120%);
                transition: transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
                min-width: 350px;
                max-width: 450px;
                box-shadow: 0 10px 35px rgba(0, 0, 0, 0.4);
                backdrop-filter: blur(15px);
                opacity: 0;
                visibility: hidden;
            }
            
            .admin-notification.show {
                transform: translateX(0);
                opacity: 1;
                visibility: visible;
            }
            
            .admin-notification-success { 
                border-color: #4caf50;
                background: linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(18, 55, 42, 0.95));
            }
            
            .admin-notification-error { 
                border-color: #f44336;
                background: linear-gradient(135deg, rgba(244, 67, 54, 0.15), rgba(18, 55, 42, 0.95));
            }
            
            .admin-notification-warning { 
                border-color: #ff9800;
                background: linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(18, 55, 42, 0.95));
            }
            
            .admin-notification-info { 
                border-color: #2196f3;
                background: linear-gradient(135deg, rgba(33, 150, 243, 0.15), rgba(18, 55, 42, 0.95));
            }
            
            .admin-notification .notification-content {
                display: flex;
                align-items: center;
                gap: 15px;
                font-family: 'Sansita Swashed', cursive;
                font-size: 14px;
            }

            .admin-notification .notification-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                flex-shrink: 0;
            }

            .admin-notification-success .notification-icon {
                background: rgba(76, 175, 80, 0.2);
                color: #4caf50;
            }

            .admin-notification-error .notification-icon {
                background: rgba(244, 67, 54, 0.2);
                color: #f44336;
            }

            .admin-notification-warning .notification-icon {
                background: rgba(255, 152, 0, 0.2);
                color: #ff9800;
            }

            .admin-notification-info .notification-icon {
                background: rgba(33, 150, 243, 0.2);
                color: #2196f3;
            }

            .admin-notification .notification-text {
                flex: 1;
                color: white;
                font-weight: 500;
                line-height: 1.4;
            }
            
            .admin-notification .notification-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.7);
                cursor: pointer;
                margin-left: auto;
                font-size: 1.3rem;
                padding: 5px;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
                flex-shrink: 0;
            }

            .admin-notification .notification-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }
            
            /* Confirm Modal (Enhanced) */
            .admin-confirm-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.85);
                z-index: 2000;
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                backdrop-filter: blur(8px);
            }
            
            .admin-confirm-modal.show {
                opacity: 1;
                visibility: visible;
            }
            
            .confirm-modal-content {
                background: #12372a;
                border: 2px solid #fbb5b5;
                border-radius: 15px;
                width: 90%;
                max-width: 450px;
                transform: scale(0.9);
                transition: transform 0.3s ease;
                box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
            }
            
            .admin-confirm-modal.show .confirm-modal-content {
                transform: scale(1);
            }
            
            .confirm-modal-header {
                padding: 30px 30px 20px;
                text-align: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .confirm-icon {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                font-size: 2rem;
            }
            
            .confirm-icon-danger {
                background: rgba(244, 67, 54, 0.2);
                color: #f44336;
                border: 3px solid rgba(244, 67, 54, 0.3);
            }
            
            .confirm-modal-header h3 {
                color: white;
                margin: 0;
                font-family: 'Lexend Zetta', sans-serif;
                font-size: 1.3rem;
            }
            
            .confirm-modal-body {
                padding: 20px 30px;
                text-align: center;
            }
            
            .confirm-modal-body p {
                color: rgba(255, 255, 255, 0.8);
                margin: 0;
                line-height: 1.6;
                font-size: 1rem;
            }
            
            .confirm-modal-footer {
                padding: 20px 30px 30px;
                display: flex;
                gap: 15px;
                justify-content: center;
            }
            
            .btn-cancel-confirm,
            .btn-confirm-action {
                padding: 12px 25px;
                border: none;
                border-radius: 8px;
                font-family: 'Sansita Swashed', cursive;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 14px;
                min-width: 120px;
            }
            
            .btn-cancel-confirm {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 2px solid rgba(255, 255, 255, 0.2);
            }
            
            .btn-cancel-confirm:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-2px);
            }
            
            .btn-confirm-action.btn-danger {
                background: linear-gradient(135deg, #f44336, #d32f2f);
                color: white;
                box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
            }
            
            .btn-confirm-action.btn-danger:hover {
                background: linear-gradient(135deg, #d32f2f, #c62828);
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
            }
            
            /* Mobile Responsive */
            @media (max-width: 768px) {
                .admin-notification,
                .temp-message {
                    right: 15px;
                    left: 15px;
                    min-width: auto;
                    max-width: none;
                }

                .confirm-modal-content {
                    width: 95%;
                    margin: 20px;
                }

                .confirm-modal-header,
                .confirm-modal-body,
                .confirm-modal-footer {
                    padding: 20px;
                }

                .confirm-modal-footer {
                    flex-direction: column;
                    gap: 10px;
                }

                .btn-cancel-confirm,
                .btn-confirm-action {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Funciones globales para compatibilidad con handlers inline
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

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.universalAdmin = new UniversalAdminManager();
});