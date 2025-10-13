// burger-club/burgur/src/main/resources/static/js/admin/admin-modal-manager.js
// ==========================================
// BURGER CLUB - ADMIN MODAL MANAGER (COMPLETO Y CORREGIDO)
// ==========================================

class AdminModalManager {
    constructor() {
        this.currentModal = null;
        this.currentSection = this.getCurrentSection();
        this.loadingOverlay = null;
        this.init();
        
        // Limpieza inicial de cualquier overlay existente
        this.removeAllLoadingOverlays();
    }
    
    init() {
        console.log('🎨 Admin Modal Manager initialized for:', this.currentSection);
        this.addModalStyles();
        
        // Limpieza adicional cuando se carga la página
        window.addEventListener('load', () => {
            this.removeAllLoadingOverlays();
        });
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
            this.showLoading(true, 'Cargando datos del producto...');
            try {
                const response = await fetch(`/menu/productos/${productData}`);
                if (response.ok) {
                    const data = await response.json();
                    productData = data.producto || data;
                } else {
                    this.hideLoading();
                    this.showNotification('Error al cargar los datos del producto', 'error');
                    return;
                }
            } catch (error) {
                console.error('Error cargando producto:', error);
                this.hideLoading();
                this.showNotification('Error de conexión al cargar el producto', 'error');
                return;
            }
            this.hideLoading();
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
            this.showLoading(true, 'Cargando datos del cliente...');
            try {
                const response = await fetch(`/admin/clientes/${clienteData}`);
                if (response.ok) {
                    const data = await response.json();
                    clienteData = data.cliente || data;
                } else {
                    this.hideLoading();
                    this.showNotification('Error al cargar los datos del cliente', 'error');
                    return;
                }
            } catch (error) {
                console.error('Error cargando cliente:', error);
                this.hideLoading();
                this.showNotification('Error de conexión al cargar el cliente', 'error');
                return;
            }
            this.hideLoading();
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
            this.showLoading(true, 'Cargando datos del adicional...');
            try {
                const response = await fetch(`/adicionales/${adicionalData}`);
                if (response.ok) {
                    const data = await response.json();
                    adicionalData = data.adicional || data;
                } else {
                    this.hideLoading();
                    this.showNotification('Error al cargar los datos del adicional', 'error');
                    return;
                }
            } catch (error) {
                console.error('Error cargando adicional:', error);
                this.hideLoading();
                this.showNotification('Error de conexión al cargar el adicional', 'error');
                return;
            }
            this.hideLoading();
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
        this.showLoading(true, 'Procesando datos...');
        
        // Validar formulario completo
        if (!this.validateForm(form)) {
            this.hideLoading();
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
            this.hideLoading();
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
    // UTILITY METHODS (COMPLETOS Y CORREGIDOS)
    // ==========================================
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    getApiUrl(isEdit, itemId) {
        const baseUrls = {
            productos: '/menu/productos',
            clientes: '/clientes',
            adicionales: '/adicionales'
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
        // Limpiar loading overlay antes de cerrar modal
        this.hideLoading();
        
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
        
        // Limpieza adicional de cualquier overlay residual
        setTimeout(() => {
            this.removeAllLoadingOverlays();
        }, 500);
    }
    
    // ==========================================
    // LOADING METHODS (COMPLETAMENTE CORREGIDOS)
    // ==========================================
    
    showLoading(show, message = 'Procesando datos...') {
        if (show) {
            this.createLoadingOverlay(message);
        } else {
            this.hideLoading();
        }
    }
    
    createLoadingOverlay(message) {
        // Limpiar cualquier overlay existente primero
        this.removeAllLoadingOverlays();
        
        this.loadingOverlay = document.createElement('div');
        this.loadingOverlay.id = 'admin-loading-overlay';
        this.loadingOverlay.className = 'loading-overlay';
        this.loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;
        
        document.body.appendChild(this.loadingOverlay);
        
        // Forzar reflow y mostrar con un microtask
        this.loadingOverlay.offsetHeight; // Trigger reflow
        this.loadingOverlay.classList.add('show');
    }
    
    hideLoading() {
        // Método principal para ocultar loading
        this.removeAllLoadingOverlays();
        this.loadingOverlay = null;
    }
    
    removeAllLoadingOverlays() {
        // Remover por referencia de instancia
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('show');
            if (document.body.contains(this.loadingOverlay)) {
                document.body.removeChild(this.loadingOverlay);
            }
        }
        
        // Limpieza agresiva: remover TODOS los overlays por ID o clase
        const overlaysById = document.querySelectorAll('#admin-loading-overlay');
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
            const remainingOverlays = document.querySelectorAll('#admin-loading-overlay, .loading-overlay');
            remainingOverlays.forEach(overlay => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            });
        }, 100);
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
    // MODAL STYLES (COMPLETOS Y MEJORADOS)
    // ==========================================
    
    addModalStyles() {
        // Evitar duplicar estilos
        if (document.getElementById('admin-modal-styles')) return;
        
        // Cargar archivo CSS externo en lugar de CSS embebido
        const link = document.createElement('link');
        link.id = 'admin-modal-styles';
        link.rel = 'stylesheet';
        link.href = '/css/components/admin-modal-manager.css';
        document.head.appendChild(link);
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

// Función de utilidad para limpiar manualmente overlays desde consola
window.clearAllLoadingOverlays = function() {
    if (window.globalModalManager) {
        window.globalModalManager.removeAllLoadingOverlays();
        console.log('✅ Loading overlays limpiados manualmente');
    } else {
        // Limpieza de emergencia sin el modal manager
        const overlays = document.querySelectorAll('#admin-loading-overlay, .loading-overlay');
        overlays.forEach(overlay => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        });
        console.log('✅ Loading overlays limpiados directamente desde DOM');
    }
};

console.log('Admin Modal Manager loaded successfully');
console.log('💡 Si ves loading overlays stuck, ejecuta: clearAllLoadingOverlays()');