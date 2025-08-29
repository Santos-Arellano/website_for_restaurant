// burger-club/burgur/src/main/resources/static/js/admin/admin-modal-manager.js
// ==========================================
// BURGER CLUB - ADMIN MODAL MANAGER (COMPLETO)
// ==========================================

class AdminModalManager {
    constructor() {
        this.currentModal = null;
        this.currentSection = this.getCurrentSection();
        this.init();
    }
    
    init() {
        console.log('🎨 Admin Modal Manager initialized for:', this.currentSection);
        this.addModalStyles();
    }
    
    getCurrentSection() {
        const path = window.location.pathname;
        if (path.includes('/admin/adicionales')) return 'adicionales';
        if (path.includes('/admin/clientes')) return 'clientes';
        if (path.includes('/admin') || path.includes('/menu/admin')) return 'productos';
        return 'dashboard';
    }
    
    // ==========================================
    // MODAL DE PRODUCTOS (COMPLETO)
    // ==========================================
    
    async openProductModal(mode, productData = {}) {
        const isEdit = mode === 'edit';
        const title = isEdit ? 'Editar Producto' : 'Agregar Producto';
        
        // Si es edición y no tenemos todos los datos, cargarlos del servidor
        if (isEdit && productData && typeof productData === 'number') {
            try {
                const response = await fetch(`/menu/api/productos/${productData}`);
                if (response.ok) {
                    const data = await response.json();
                    productData = data.producto || data;
                } else {
                    this.showNotification('Error al cargar los datos del producto', 'error');
                    return;
                }
            } catch (error) {
                console.error('Error cargando producto:', error);
                this.showNotification('Error de conexión al cargar el producto', 'error');
                return;
            }
        }
        
        // Asegurar que productData sea un objeto válido
        if (!productData || typeof productData !== 'object') {
            productData = {};
        }
        
        const modal = document.createElement('div');
        modal.className = 'admin-modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-${isEdit ? 'edit' : 'plus'}"></i> ${title}</h3>
                    <button class="modal-close" type="button">&times;</button>
                </div>
                <div class="modal-body">
                    <form class="admin-form" id="productForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="productName">Nombre del Producto *</label>
                                <input type="text" id="productName" name="nombre" 
                                       value="${this.escapeHtml(productData.nombre || '')}" 
                                       required placeholder="Ej: Hamburguesa Classic">
                            </div>
                            <div class="form-group">
                                <label for="productCategory">Categoría *</label>
                                <select id="productCategory" name="categoria" required>
                                    <option value="">Seleccionar categoría</option>
                                    <option value="hamburguesa" ${productData.categoria === 'hamburguesa' ? 'selected' : ''}>Hamburguesa</option>
                                    <option value="acompañamiento" ${productData.categoria === 'acompañamiento' ? 'selected' : ''}>Acompañamiento</option>
                                    <option value="perro caliente" ${productData.categoria === 'perro caliente' ? 'selected' : ''}>Perro Caliente</option>
                                    <option value="bebida" ${productData.categoria === 'bebida' ? 'selected' : ''}>Bebida</option>
                                    <option value="postre" ${productData.categoria === 'postre' ? 'selected' : ''}>Postre</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="productPrice">Precio *</label>
                                <div class="input-with-prefix">
                                    <span class="input-prefix">$</span>
                                    <input type="number" id="productPrice" name="precio" 
                                           value="${productData.precio || ''}" 
                                           min="0" step="100" required placeholder="25000">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="productStock">Stock Disponible *</label>
                                <input type="number" id="productStock" name="stock" 
                                       value="${productData.stock || ''}" 
                                       min="0" required placeholder="50">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="productDescription">Descripción</label>
                            <textarea id="productDescription" name="descripcion" rows="3" 
                                      placeholder="Describe brevemente el producto...">${this.escapeHtml(productData.descripcion || '')}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="productImage">URL de la Imagen (Opcional)</label>
                            <input type="text" id="productImage" name="imgURL" 
                                   value="${this.escapeHtml(productData.imgURL || '')}" 
                                   placeholder="https://ejemplo.com/imagen.jpg">
                            <small class="field-hint">Opcional: Deja vacío para usar imagen por defecto</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="productIngredients">Ingredientes</label>
                            <input type="text" id="productIngredients" name="ingredientes" 
                                   value="${productData.ingredientes ? this.escapeHtml(productData.ingredientes.join(', ')) : ''}" 
                                   placeholder="Ej: Carne, Lechuga, Tomate, Queso">
                            <small class="field-hint">Separa los ingredientes con comas</small>
                        </div>
                        
                        <div class="form-section">
                            <h4 class="section-title"><i class="fas fa-tags"></i> Estado del Producto</h4>
                            <div class="form-row">
                                <div class="form-group checkbox-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="nuevo" ${productData.nuevo ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                        <span class="checkbox-text">
                                            <strong>Producto Nuevo</strong>
                                            <small>Se mostrará con etiqueta "Nuevo"</small>
                                        </span>
                                    </label>
                                </div>
                                <div class="form-group checkbox-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="popular" ${productData.popular ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                        <span class="checkbox-text">
                                            <strong>Producto Popular</strong>
                                            <small>Se destacará como recomendado</small>
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="activo" ${productData.activo !== false ? 'checked' : ''}>
                                    <span class="checkbox-custom"></span>
                                    <span class="checkbox-text">
                                        <strong>Producto Activo</strong>
                                        <small>Visible para los clientes en el menú</small>
                                    </span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-cancel">
                                <i class="fas fa-times"></i>
                                Cancelar
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-${isEdit ? 'save' : 'plus'}"></i>
                                ${isEdit ? 'Actualizar' : 'Crear'} Producto
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        this.bindModalEvents(modal, isEdit, productData.id);
        this.showModal(modal);
    }
    
    // ==========================================
    // MODAL DE CLIENTES (COMPLETO)
    // ==========================================
    
    async openClienteModal(mode, clienteData = {}) {
        const isEdit = mode === 'edit';
        const title = isEdit ? 'Editar Cliente' : 'Agregar Cliente';
        
        // Si es edición y solo tenemos ID, cargar datos del servidor
        if (isEdit && clienteData && typeof clienteData === 'number') {
            try {
                const response = await fetch(`/admin/clientes/api/${clienteData}`);
                if (response.ok) {
                    const data = await response.json();
                    clienteData = data.cliente || data;
                } else {
                    this.showNotification('Error al cargar los datos del cliente', 'error');
                    return;
                }
            } catch (error) {
                console.error('Error cargando cliente:', error);
                this.showNotification('Error de conexión al cargar el cliente', 'error');
                return;
            }
        }
        
        if (!clienteData || typeof clienteData !== 'object') {
            clienteData = {};
        }
        
        const modal = document.createElement('div');
        modal.className = 'admin-modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-${isEdit ? 'user-edit' : 'user-plus'}"></i> ${title}</h3>
                    <button class="modal-close" type="button">&times;</button>
                </div>
                <div class="modal-body">
                    <form class="admin-form" id="clienteForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="clienteNombre">Nombre *</label>
                                <input type="text" id="clienteNombre" name="nombre" 
                                       value="${this.escapeHtml(clienteData.nombre || '')}" 
                                       required placeholder="Juan">
                            </div>
                            <div class="form-group">
                                <label for="clienteApellido">Apellido *</label>
                                <input type="text" id="clienteApellido" name="apellido" 
                                       value="${this.escapeHtml(clienteData.apellido || '')}" 
                                       required placeholder="Pérez">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="clienteCorreo">Correo Electrónico *</label>
                            <input type="email" id="clienteCorreo" name="correo" 
                                   value="${this.escapeHtml(clienteData.correo || '')}" 
                                   required placeholder="juan.perez@email.com">
                        </div>
                        
                        <div class="form-group">
                            <label for="clienteContrasena">Contraseña ${isEdit ? '(dejar vacío para mantener actual)' : '*'}</label>
                            <input type="password" id="clienteContrasena" name="contrasena" 
                                   ${!isEdit ? 'required' : ''} minlength="8"
                                   placeholder="${isEdit ? 'Nueva contraseña (opcional)' : 'Mínimo 8 caracteres'}">
                            <small class="field-hint">${isEdit ? 'Solo completa si deseas cambiar la contraseña' : 'Mínimo 8 caracteres'}</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="clienteTelefono">Teléfono</label>
                            <input type="tel" id="clienteTelefono" name="telefono" 
                                   value="${this.escapeHtml(clienteData.telefono || '')}" 
                                   placeholder="+57 300 123 4567">
                        </div>
                        
                        <div class="form-group">
                            <label for="clienteDireccion">Dirección</label>
                            <textarea id="clienteDireccion" name="direccion" rows="2" 
                                      placeholder="Dirección completa del cliente">${this.escapeHtml(clienteData.direccion || '')}</textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-cancel">
                                <i class="fas fa-times"></i>
                                Cancelar
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-${isEdit ? 'save' : 'user-plus'}"></i>
                                ${isEdit ? 'Actualizar' : 'Crear'} Cliente
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        this.bindModalEvents(modal, isEdit, clienteData.id);
        this.showModal(modal);
    }
    
    // ==========================================
    // MODAL DE ADICIONALES (COMPLETO)
    // ==========================================
    
    async openAdicionalModal(mode, adicionalData = {}) {
        const isEdit = mode === 'edit';
        const title = isEdit ? 'Editar Adicional' : 'Agregar Adicional';
        
        // Si es edición y solo tenemos ID, cargar datos del servidor
        if (isEdit && adicionalData && typeof adicionalData === 'number') {
            try {
                const response = await fetch(`/admin/adicionales/api/${adicionalData}`);
                if (response.ok) {
                    const data = await response.json();
                    adicionalData = data.adicional || data;
                } else {
                    this.showNotification('Error al cargar los datos del adicional', 'error');
                    return;
                }
            } catch (error) {
                console.error('Error cargando adicional:', error);
                this.showNotification('Error de conexión al cargar el adicional', 'error');
                return;
            }
        }
        
        if (!adicionalData || typeof adicionalData !== 'object') {
            adicionalData = {};
        }
        
        // Función helper para verificar si una categoría está seleccionada
        const isCategoriaSelected = (categoria) => {
            if (!adicionalData.categoria) return false;
            return Array.isArray(adicionalData.categoria) && adicionalData.categoria.includes(categoria);
        };
        
        const modal = document.createElement('div');
        modal.className = 'admin-modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-${isEdit ? 'edit' : 'plus-circle'}"></i> ${title}</h3>
                    <button class="modal-close" type="button">&times;</button>
                </div>
                <div class="modal-body">
                    <form class="admin-form" id="adicionalForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="adicionalNombre">Nombre del Adicional *</label>
                                <input type="text" id="adicionalNombre" name="nombre" 
                                       value="${this.escapeHtml(adicionalData.nombre || '')}" 
                                       required placeholder="Ej: Queso Extra">
                            </div>
                            <div class="form-group">
                                <label for="adicionalPrecio">Precio *</label>
                                <div class="input-with-prefix">
                                    <span class="input-prefix">$</span>
                                    <input type="number" id="adicionalPrecio" name="precio" 
                                           value="${adicionalData.precio || ''}" 
                                           min="0" step="100" required placeholder="3000">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h4 class="section-title"><i class="fas fa-tags"></i> Categorías Compatibles *</h4>
                            <p class="section-description">Selecciona las categorías de productos con las que este adicional será compatible</p>
                            <div class="checkbox-grid">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="categoria" value="hamburguesa" ${isCategoriaSelected('hamburguesa') ? 'checked' : ''}>
                                    <span class="checkbox-custom"></span>
                                    <span class="checkbox-text">
                                        <strong>🍔 Hamburguesas</strong>
                                        <small>Compatible con todas las hamburguesas</small>
                                    </span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="categoria" value="perro caliente" ${isCategoriaSelected('perro caliente') ? 'checked' : ''}>
                                    <span class="checkbox-custom"></span>
                                    <span class="checkbox-text">
                                        <strong>🌭 Perros Calientes</strong>
                                        <small>Compatible con perros calientes</small>
                                    </span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="categoria" value="acompañamiento" ${isCategoriaSelected('acompañamiento') ? 'checked' : ''}>
                                    <span class="checkbox-custom"></span>
                                    <span class="checkbox-text">
                                        <strong>🍟 Acompañamientos</strong>
                                        <small>Compatible con papas, aros, etc.</small>
                                    </span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="categoria" value="bebida" ${isCategoriaSelected('bebida') ? 'checked' : ''}>
                                    <span class="checkbox-custom"></span>
                                    <span class="checkbox-text">
                                        <strong>🥤 Bebidas</strong>
                                        <small>Compatible con todas las bebidas</small>
                                    </span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="categoria" value="postre" ${isCategoriaSelected('postre') ? 'checked' : ''}>
                                    <span class="checkbox-custom"></span>
                                    <span class="checkbox-text">
                                        <strong>🍰 Postres</strong>
                                        <small>Compatible con postres y malteadas</small>
                                    </span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-cancel">
                                <i class="fas fa-times"></i>
                                Cancelar
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-${isEdit ? 'save' : 'plus-circle'}"></i>
                                ${isEdit ? 'Actualizar' : 'Crear'} Adicional
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        this.bindModalEvents(modal, isEdit, adicionalData.id);
        this.showModal(modal);
    }
    
    // ==========================================
    // EVENT HANDLERS (COMPLETOS)
    // ==========================================
    
    bindModalEvents(modal, isEdit, itemId) {
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.btn-cancel');
        const form = modal.querySelector('form');
        
        // Close handlers
        closeBtn.addEventListener('click', () => this.closeModal(modal));
        cancelBtn.addEventListener('click', () => this.closeModal(modal));
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
        
        // Form submission con loading y validación mejorada
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(form, modal, isEdit, itemId);
        });
        
        // Validación en tiempo real
        this.setupRealTimeValidation(form);
        
        // ESC key
        this.escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
            }
        };
        document.addEventListener('keydown', this.escHandler);
    }
    
    setupRealTimeValidation(form) {
        const inputs = form.querySelectorAll('input[required], select[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                // Limpiar errores mientras escribe
                input.classList.remove('error');
                const errorMsg = input.parentNode.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
            });
        });
        
        // Validación especial para campos numéricos
        const numberInputs = form.querySelectorAll('input[type="number"]');
        numberInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                if (e.target.value < 0) {
                    e.target.value = 0;
                }
            });
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        
        // Limpiar mensajes de error anteriores
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        field.classList.remove('error', 'success');
        
        if (isRequired && !value) {
            this.showFieldError(field, 'Este campo es requerido');
            return false;
        }
        
        // Validaciones específicas
        if (field.type === 'email' && value && !this.isValidEmail(value)) {
            this.showFieldError(field, 'Ingresa un correo válido');
            return false;
        }
        
        if (field.name === 'imgURL' && value && value.trim() !== '' && !this.isValidUrl(value)) {
            this.showFieldError(field, 'Ingresa una URL válida');
            return false;
        }
        
        if (field.type === 'password' && value && value.length < 8) {
            this.showFieldError(field, 'La contraseña debe tener al menos 8 caracteres');
            return false;
        }
        
        if (field.type === 'number' && value && parseFloat(value) <= 0) {
            this.showFieldError(field, 'Debe ser mayor a 0');
            return false;
        }
        
        if (value) {
            field.classList.add('success');
        }
        
        return true;
    }
    
    showFieldError(field, message) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    isValidUrl(url) {
        // Si la URL está vacía o solo tiene espacios, se considera válida (opcional)
        if (!url || url.trim() === '') {
            return true;
        }
        
        try {
            const urlObj = new URL(url.trim());
            // Verificar que tenga un protocolo válido
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    }
    
    async handleFormSubmit(form, modal, isEdit, itemId) {
        // Mostrar loading
        this.showLoading(true);
        
        // Validar formulario completo
        if (!this.validateForm(form)) {
            this.showLoading(false);
            return;
        }
        
        const formData = new FormData(form);
        let data = {};
        
        // Extract form data based on section
        switch (this.currentSection) {
            case 'productos':
                data = this.extractProductData(formData);
                break;
            case 'clientes':
                data = this.extractClienteData(formData);
                break;
            case 'adicionales':
                data = this.extractAdicionalData(formData);
                break;
        }
        
        try {
            const url = this.getApiUrl(isEdit, itemId);
            const method = isEdit ? 'PUT' : 'POST';
            
            console.log('Enviando datos:', data);
            console.log('URL:', url);
            console.log('Método:', method);
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            console.log('Respuesta del servidor:', result);
            
            if (response.ok && result.success) {
                this.showNotification(result.message || 'Operación exitosa', 'success');
                this.closeModal(modal);
                
                // Recargar página después de un breve delay
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                this.showNotification(result.message || 'Error en la operación', 'error');
            }
            
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error de conexión', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        // Validaciones especiales según el tipo
        if (this.currentSection === 'adicionales') {
            const checkboxes = form.querySelectorAll('input[name="categoria"]:checked');
            if (checkboxes.length === 0) {
                this.showNotification('Debes seleccionar al menos una categoría', 'error');
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    // ==========================================
    // DATA EXTRACTION (COMPLETOS)
    // ==========================================
    
    extractProductData(formData) {
        const ingredientes = formData.get('ingredientes');
        return {
            nombre: formData.get('nombre'),
            categoria: formData.get('categoria'),
            precio: parseFloat(formData.get('precio')),
            stock: parseInt(formData.get('stock')),
            descripcion: formData.get('descripcion') || null,
            imgURL: formData.get('imgURL') || null,
            ingredientes: ingredientes ? ingredientes.split(',').map(i => i.trim()).filter(i => i) : [],
            nuevo: formData.has('nuevo'),
            popular: formData.has('popular'),
            activo: formData.has('activo')
        };
    }
    
    extractClienteData(formData) {
        const data = {
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            correo: formData.get('correo'),
            telefono: formData.get('telefono') || null,
            direccion: formData.get('direccion') || null
        };
        
        // Solo incluir contraseña si no está vacía
        const contrasena = formData.get('contrasena');
        if (contrasena && contrasena.trim()) {
            data.contrasena = contrasena;
        }
        
        return data;
    }
    
    extractAdicionalData(formData) {
        const categorias = formData.getAll('categoria');
        return {
            nombre: formData.get('nombre'),
            precio: parseFloat(formData.get('precio')),
            categoria: categorias,
            activo: true
        };
    }
    
    // ==========================================
    // UTILITY METHODS (COMPLETOS)
    // ==========================================
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    getApiUrl(isEdit, itemId) {
        const baseUrls = {
            productos: '/menu/api/productos',
            clientes: '/admin/clientes/api',
            adicionales: '/admin/adicionales/api'
        };
        
        const baseUrl = baseUrls[this.currentSection];
        return isEdit ? `${baseUrl}/${itemId}` : baseUrl;
    }
    
    showModal(modal) {
        if (this.currentModal) {
            this.closeModal(this.currentModal);
        }
        
        this.currentModal = modal;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
    
    closeModal(modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
            if (this.currentModal === modal) {
                this.currentModal = null;
            }
        }, 300);
        
        if (this.escHandler) {
            document.removeEventListener('keydown', this.escHandler);
            this.escHandler = null;
        }
    }
    
    showLoading(show) {
        const body = document.body;
        if (show) {
            body.classList.add('modal-loading');
        } else {
            body.classList.remove('modal-loading');
        }
    }
    
    showNotification(message, type = 'info') {
        // Crear notificación mejorada
        const notification = document.createElement('div');
        notification.className = `modal-notification modal-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                </div>
                <div class="notification-text">
                    <span class="notification-message">${message}</span>
                </div>
                <button class="notification-close" type="button">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto-close
        const autoCloseTimer = setTimeout(() => {
            this.closeNotification(notification);
        }, type === 'success' ? 4000 : 6000);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            clearTimeout(autoCloseTimer);
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
    
    // ==========================================
    // MODAL STYLES (COMPLETOS)
    // ==========================================
    
    addModalStyles() {
        if (document.getElementById('admin-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'admin-modal-styles';
        style.textContent = `
            .admin-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.85);
                z-index: 1000;
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                backdrop-filter: blur(8px);
            }
            
            .admin-modal.show {
                opacity: 1;
                visibility: visible;
            }
            
            .admin-modal .modal-content {
                background: #12372a;
                border: 2px solid #fbb5b5;
                border-radius: 15px;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                transform: scale(0.9);
                transition: transform 0.3s ease;
                box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
            }
            
            .admin-modal.show .modal-content {
                transform: scale(1);
            }
            
            .admin-modal .modal-header {
                padding: 30px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: linear-gradient(135deg, rgba(251, 181, 181, 0.2) 0%, rgba(18, 55, 42, 0.9) 100%);
                border-radius: 13px 13px 0 0;
            }

            .admin-modal .modal-header h3 {
                color: white;
                margin: 0;
                font-family: 'Lexend Zetta', sans-serif;
                font-size: 1.4rem;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .admin-modal .modal-close {
                background: none;
                border: none;
                font-size: 2rem;
                color: white;
                cursor: pointer;
                padding: 5px;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }

            .admin-modal .modal-close:hover {
                background: rgba(244, 67, 54, 0.2);
                color: #f44336;
                transform: scale(1.1);
            }
            
            .admin-modal .modal-body {
                padding: 35px;
            }

            .admin-form {
                display: flex;
                flex-direction: column;
                gap: 25px;
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 25px;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .form-group label {
                color: white;
                font-weight: 600;
                font-size: 0.95rem;
                font-family: 'Sansita Swashed', cursive;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .form-group input,
            .form-group select,
            .form-group textarea {
                padding: 15px 18px;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                color: white;
                font-family: 'Sansita Swashed', cursive;
                transition: all 0.3s ease;
                font-size: 14px;
            }

            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #fbb5b5;
                background: rgba(255, 255, 255, 0.15);
                box-shadow: 0 0 0 3px rgba(251, 181, 181, 0.3);
                transform: translateY(-1px);
            }

            .form-group input.success {
                border-color: #4caf50;
                background: rgba(76, 175, 80, 0.1);
            }

            .form-group input.error {
                border-color: #f44336;
                background: rgba(244, 67, 54, 0.1);
                animation: shake 0.5s ease-in-out;
            }

            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }

            .error-message {
                color: #f44336;
                font-size: 0.8rem;
                margin-top: 5px;
                font-weight: 500;
            }

            .field-hint {
                color: rgba(255, 255, 255, 0.6);
                font-size: 0.8rem;
                margin-top: 5px;
                font-style: italic;
            }

            .input-with-prefix {
                position: relative;
                display: flex;
                align-items: center;
            }

            .input-prefix {
                position: absolute;
                left: 15px;
                color: #fbb5b5;
                font-weight: 700;
                font-size: 1.1rem;
                z-index: 1;
            }

            .input-with-prefix input {
                padding-left: 35px;
            }

            .form-group input::placeholder,
            .form-group textarea::placeholder {
                color: rgba(255, 255, 255, 0.5);
            }

            .form-group select option {
                background: #12372a;
                color: white;
            }

            .form-section {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 25px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .section-title {
                color: #fbb5b5;
                font-size: 1.1rem;
                margin-bottom: 15px;
                font-family: 'Lexend Zetta', sans-serif;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .section-description {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.9rem;
                margin-bottom: 20px;
                line-height: 1.5;
            }

            .checkbox-group,
            .checkbox-grid {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .checkbox-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
            }

            .checkbox-label {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                cursor: pointer;
                padding: 15px;
                border-radius: 8px;
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(255, 255, 255, 0.05);
            }

            .checkbox-label:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: #fbb5b5;
            }

            .checkbox-label input[type="checkbox"] {
                width: 20px;
                height: 20px;
                margin: 0;
                cursor: pointer;
                accent-color: #fbb5b5;
                flex-shrink: 0;
            }

            .checkbox-text {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .checkbox-text strong {
                color: white;
                font-size: 0.95rem;
            }

            .checkbox-text small {
                color: rgba(255, 255, 255, 0.6);
                font-size: 0.8rem;
            }

            .form-actions {
                display: flex;
                gap: 20px;
                justify-content: flex-end;
                padding-top: 25px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                margin-top: 15px;
            }

            .btn-cancel,
            .btn-primary {
                padding: 15px 25px;
                border: none;
                border-radius: 8px;
                font-family: 'Sansita Swashed', cursive;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 14px;
                min-width: 140px;
                justify-content: center;
            }

            .btn-cancel {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 2px solid rgba(255, 255, 255, 0.2);
            }

            .btn-cancel:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-2px);
                border-color: rgba(255, 255, 255, 0.4);
            }

            .btn-primary {
                background: linear-gradient(135deg, #4caf50, #45a049);
                color: white;
                box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
                border: 2px solid transparent;
            }

            .btn-primary:hover {
                background: linear-gradient(135deg, #45a049, #388e3c);
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(76, 175, 80, 0.5);
            }

            .btn-primary:active,
            .btn-cancel:active {
                transform: translateY(0);
            }

            /* Loading State */
            .modal-loading {
                pointer-events: none;
                position: relative;
            }

            .modal-loading::after {
                content: '';
                position: fixed;
                top: 50%;
                left: 50%;
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top: 4px solid #fbb5b5;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                transform: translate(-50%, -50%);
                z-index: 3000;
            }

            @keyframes spin {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }

            /* Notifications */
            .modal-notification {
                position: fixed;
                top: 25px;
                right: 25px;
                background: #12372a;
                border: 2px solid;
                border-radius: 12px;
                padding: 20px;
                z-index: 2000;
                transform: translateX(120%);
                transition: transform 0.4s ease;
                min-width: 350px;
                max-width: 450px;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
                backdrop-filter: blur(10px);
            }

            .modal-notification.show {
                transform: translateX(0);
            }

            .modal-notification-success { 
                border-color: #4caf50;
                background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), #12372a);
            }
            
            .modal-notification-error { 
                border-color: #f44336; 
                background: linear-gradient(135deg, rgba(244, 67, 54, 0.1), #12372a);
            }
            
            .modal-notification-warning { 
                border-color: #ff9800; 
                background: linear-gradient(135deg, rgba(255, 152, 0, 0.1), #12372a);
            }
            
            .modal-notification-info { 
                border-color: #2196f3; 
                background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), #12372a);
            }

            .modal-notification .notification-content {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .modal-notification .notification-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                flex-shrink: 0;
            }

            .modal-notification-success .notification-icon {
                background: rgba(76, 175, 80, 0.2);
                color: #4caf50;
            }

            .modal-notification-error .notification-icon {
                background: rgba(244, 67, 54, 0.2);
                color: #f44336;
            }

            .modal-notification-warning .notification-icon {
                background: rgba(255, 152, 0, 0.2);
                color: #ff9800;
            }

            .modal-notification-info .notification-icon {
                background: rgba(33, 150, 243, 0.2);
                color: #2196f3;
            }

            .modal-notification .notification-text {
                flex: 1;
            }

            .modal-notification .notification-message {
                color: white;
                font-family: 'Sansita Swashed', cursive;
                font-size: 14px;
                font-weight: 500;
                line-height: 1.4;
            }

            .modal-notification .notification-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.7);
                cursor: pointer;
                font-size: 1.5rem;
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

            .modal-notification .notification-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }

            /* Scrollbar personalizado */
            .admin-modal .modal-content::-webkit-scrollbar {
                width: 8px;
            }

            .admin-modal .modal-content::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
            }

            .admin-modal .modal-content::-webkit-scrollbar-thumb {
                background: #fbb5b5;
                border-radius: 4px;
            }

            .admin-modal .modal-content::-webkit-scrollbar-thumb:hover {
                background: #e8a3a3;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .admin-modal .modal-content {
                    width: 95%;
                    margin: 20px 10px;
                    max-height: 95vh;
                }

                .admin-modal .modal-header,
                .admin-modal .modal-body {
                    padding: 25px 20px;
                }

                .form-row {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }

                .checkbox-grid {
                    grid-template-columns: 1fr;
                }

                .form-actions {
                    flex-direction: column;
                    gap: 15px;
                }

                .btn-cancel,
                .btn-primary {
                    width: 100%;
                    justify-content: center;
                }

                .modal-notification {
                    right: 15px;
                    left: 15px;
                    min-width: auto;
                    max-width: none;
                }
            }

            @media (max-width: 480px) {
                .admin-modal .modal-header h3 {
                    font-size: 1.2rem;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    padding: 12px 15px;
                }

                .section-title {
                    font-size: 1rem;
                }

                .checkbox-label {
                    padding: 12px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Crear instancia global
window.globalModalManager = new AdminModalManager();
window.AdminModalManager = AdminModalManager;

// Funciones globales para compatibilidad
window.openAddProductModal = function() {
    if (window.globalModalManager) {
        window.globalModalManager.openProductModal('add');
    }
};

window.openAddClienteModal = function() {
    if (window.globalModalManager) {
        window.globalModalManager.openClienteModal('add');
    }
};

window.openAddAdicionalModal = function() {
    if (window.globalModalManager) {
        window.globalModalManager.openAdicionalModal('add');
    }
};

// Funciones de edición que cargan los datos automáticamente
window.editProduct = function(productId) {
    if (window.globalModalManager) {
        window.globalModalManager.openProductModal('edit', productId);
    }
};

window.editCliente = function(clienteId) {
    if (window.globalModalManager) {
        window.globalModalManager.openClienteModal('edit', clienteId);
    }
};

window.editAdicional = function(adicionalId) {
    if (window.globalModalManager) {
        window.globalModalManager.openAdicionalModal('edit', adicionalId);
    }
};

console.log('Admin Modal Manager loaded successfully');