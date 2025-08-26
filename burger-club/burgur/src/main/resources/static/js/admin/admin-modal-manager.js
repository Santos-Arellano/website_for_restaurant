// burger-club/burgur/src/main/resources/static/js/admin/admin-modal-manager.js
// ==========================================
// BURGER CLUB - ADMIN MODAL MANAGER (FIXED)
// ==========================================

class AdminModalManager {
    constructor() {
        this.currentModal = null;
        this.init();
    }
    
    init() {
        this.addModalStyles();
        console.log('Admin Modal Manager initialized');
    }
    
    // ==========================================
    // PRODUCT MODALS
    // ==========================================
    
    openProductModal(mode, product = {}) {
        const isEdit = mode === 'edit';
        const title = isEdit ? 'Editar Producto' : 'Agregar Producto';
        
        const modal = this.createModal(`
            <div class="modal-header">
                <h3><i class="fas fa-hamburger"></i> ${title}</h3>
                <button class="modal-close" type="button">&times;</button>
            </div>
            <div class="modal-body">
                <form class="admin-form" id="productForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="productNombre">Nombre del Producto <span class="required">*</span></label>
                            <input type="text" id="productNombre" name="nombre" value="${product.nombre || ''}" required maxlength="100">
                        </div>
                        
                        <div class="form-group">
                            <label for="productCategoria">Categoría <span class="required">*</span></label>
                            <select id="productCategoria" name="categoria" required>
                                <option value="">Seleccionar categoría</option>
                                <option value="hamburguesa" ${product.categoria === 'hamburguesa' ? 'selected' : ''}>Hamburguesa</option>
                                <option value="perro caliente" ${product.categoria === 'perro caliente' ? 'selected' : ''}>Perro Caliente</option>
                                <option value="acompañamiento" ${product.categoria === 'acompañamiento' ? 'selected' : ''}>Acompañamiento</option>
                                <option value="bebida" ${product.categoria === 'bebida' ? 'selected' : ''}>Bebida</option>
                                <option value="postre" ${product.categoria === 'postre' ? 'selected' : ''}>Postre</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="productPrecio">Precio <span class="required">*</span></label>
                            <input type="number" id="productPrecio" name="precio" value="${product.precio || ''}" required min="0" step="100">
                        </div>
                        
                        <div class="form-group">
                            <label for="productStock">Stock <span class="required">*</span></label>
                            <input type="number" id="productStock" name="stock" value="${product.stock || ''}" required min="0">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="productDescripcion">Descripción</label>
                        <textarea id="productDescripcion" name="descripcion" rows="3" maxlength="500" placeholder="Describe el producto...">${product.descripcion || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="productImagen">URL de Imagen</label>
                        <input type="url" id="productImagen" name="imagen" value="${product.imgURL || ''}" placeholder="https://ejemplo.com/imagen.jpg">
                    </div>
                    
                    <div class="form-group">
                        <label for="productIngredientes">Ingredientes (separados por coma)</label>
                        <textarea id="productIngredientes" name="ingredientes" rows="2" placeholder="Carne, lechuga, tomate...">${product.ingredientes ? product.ingredientes.join(', ') : ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="productNuevo" name="isNew" ${product.nuevo ? 'checked' : ''}>
                                <span class="checkmark"></span>
                                Producto Nuevo
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="productPopular" name="isPopular" ${product.popular ? 'checked' : ''}>
                                <span class="checkmark"></span>
                                Producto Popular
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-cancel">Cancelar</button>
                        <button type="submit" class="btn-save">
                            <i class="fas fa-save"></i>
                            ${isEdit ? 'Actualizar' : 'Crear'} Producto
                        </button>
                    </div>
                </form>
            </div>
        `);
        
        this.bindProductFormEvents(modal, isEdit, product.id);
        this.showModal(modal);
    }
    
    bindProductFormEvents(modal, isEdit, productId) {
        const form = modal.querySelector('#productForm');
        const cancelBtn = modal.querySelector('.btn-cancel');
        const closeBtn = modal.querySelector('.modal-close');
        
        cancelBtn.addEventListener('click', () => this.closeModal(modal));
        closeBtn.addEventListener('click', () => this.closeModal(modal));
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleProductSubmit(e, modal, isEdit, productId);
        });
        
        // Real-time validation
        this.setupFormValidation(form);
    }
    
    async handleProductSubmit(e, modal, isEdit, productId) {
        const formData = new FormData(e.target);
        const ingredientes = formData.get('ingredientes');
        
        const productData = {
            nombre: formData.get('nombre'),
            categoria: formData.get('categoria'),
            precio: parseFloat(formData.get('precio')),
            stock: parseInt(formData.get('stock')),
            descripcion: formData.get('descripcion'),
            imagen: formData.get('imagen'),
            ingredientes: ingredientes ? ingredientes.split(',').map(i => i.trim()).filter(i => i) : [],
            isNew: formData.get('isNew') === 'on',
            isPopular: formData.get('isPopular') === 'on'
        };
        
        try {
            const url = isEdit ? `/menu/api/productos/${productId}` : '/menu/api/productos';
            const method = isEdit ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.closeModal(modal);
                this.showSuccessMessage(result.message);
                setTimeout(() => location.reload(), 1000);
            } else {
                this.showErrorMessage(result.message || 'Error al procesar la solicitud');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showErrorMessage('Error de conexión');
        }
    }
    
    // ==========================================
    // CLIENT MODALS
    // ==========================================
    
    openClienteModal(mode, cliente = {}) {
        const isEdit = mode === 'edit';
        const title = isEdit ? 'Editar Cliente' : 'Agregar Cliente';
        
        const modal = this.createModal(`
            <div class="modal-header">
                <h3><i class="fas fa-user"></i> ${title}</h3>
                <button class="modal-close" type="button">&times;</button>
            </div>
            <div class="modal-body">
                <form class="admin-form" id="clienteForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="clienteNombre">Nombre <span class="required">*</span></label>
                            <input type="text" id="clienteNombre" name="nombre" value="${cliente.nombre || ''}" required maxlength="100">
                        </div>
                        
                        <div class="form-group">
                            <label for="clienteApellido">Apellido <span class="required">*</span></label>
                            <input type="text" id="clienteApellido" name="apellido" value="${cliente.apellido || ''}" required maxlength="100">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="clienteCorreo">Correo Electrónico <span class="required">*</span></label>
                        <input type="email" id="clienteCorreo" name="correo" value="${cliente.correo || ''}" required maxlength="150">
                    </div>
                    
                    <div class="form-group">
                        <label for="clienteContrasena">${isEdit ? 'Nueva Contraseña (dejar vacío para mantener actual)' : 'Contraseña'} ${!isEdit ? '<span class="required">*</span>' : ''}</label>
                        <input type="password" id="clienteContrasena" name="contrasena" ${!isEdit ? 'required' : ''} minlength="8" maxlength="64">
                        <small class="form-help">Mínimo 8 caracteres, debe contener al menos una letra y un número</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="clienteTelefono">Teléfono</label>
                        <input type="tel" id="clienteTelefono" name="telefono" value="${cliente.telefono || ''}" placeholder="+57 123 456 7890" pattern="^\\+?[0-9]{7,15}$">
                        <small class="form-help">Formato: +57 1234567890 (7-15 dígitos)</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="clienteDireccion">Dirección</label>
                        <textarea id="clienteDireccion" name="direccion" rows="2" maxlength="200" placeholder="Dirección completa">${cliente.direccion || ''}</textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-cancel">Cancelar</button>
                        <button type="submit" class="btn-save">
                            <i class="fas fa-save"></i>
                            ${isEdit ? 'Actualizar' : 'Crear'} Cliente
                        </button>
                    </div>
                </form>
            </div>
        `);
        
        this.bindClienteFormEvents(modal, isEdit, cliente.id);
        this.showModal(modal);
    }
    
    bindClienteFormEvents(modal, isEdit, clienteId) {
        const form = modal.querySelector('#clienteForm');
        const cancelBtn = modal.querySelector('.btn-cancel');
        const closeBtn = modal.querySelector('.modal-close');
        
        cancelBtn.addEventListener('click', () => this.closeModal(modal));
        closeBtn.addEventListener('click', () => this.closeModal(modal));
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleClienteSubmit(e, modal, isEdit, clienteId);
        });
        
        this.setupFormValidation(form);
    }
    
    async handleClienteSubmit(e, modal, isEdit, clienteId) {
        const formData = new FormData(e.target);
        
        const clienteData = {
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            correo: formData.get('correo'),
            telefono: formData.get('telefono'),
            direccion: formData.get('direccion')
        };
        
        // Only include password if provided
        const password = formData.get('contrasena');
        if (password && password.trim() !== '') {
            clienteData.contrasena = password;
        }
        
        try {
            const url = isEdit ? `/admin/clientes/api/${clienteId}` : '/admin/clientes/api';
            const method = isEdit ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clienteData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.closeModal(modal);
                this.showSuccessMessage(result.message);
                setTimeout(() => location.reload(), 1000);
            } else {
                this.showErrorMessage(result.message || 'Error al procesar la solicitud');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showErrorMessage('Error de conexión');
        }
    }
    
    // ==========================================
    // ADICIONAL MODALS
    // ==========================================
    
    openAdicionalModal(mode, adicional = {}) {
        const isEdit = mode === 'edit';
        const title = isEdit ? 'Editar Adicional' : 'Agregar Adicional';
        
        const modal = this.createModal(`
            <div class="modal-header">
                <h3><i class="fas fa-plus-circle"></i> ${title}</h3>
                <button class="modal-close" type="button">&times;</button>
            </div>
            <div class="modal-body">
                <form class="admin-form" id="adicionalForm">
                    <div class="form-group">
                        <label for="adicionalNombre">Nombre del Adicional <span class="required">*</span></label>
                        <input type="text" id="adicionalNombre" name="nombre" value="${adicional.nombre || ''}" required maxlength="100">
                    </div>
                    
                    <div class="form-group">
                        <label for="adicionalPrecio">Precio <span class="required">*</span></label>
                        <input type="number" id="adicionalPrecio" name="precio" value="${adicional.precio || ''}" required min="0" step="100">
                    </div>
                    
                    <div class="form-group">
                        <label>Categorías Aplicables <span class="required">*</span></label>
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="categoria" value="hamburguesa" ${this.isChecked(adicional.categoria, 'hamburguesa')}>
                                <span class="checkmark"></span>
                                Hamburguesas
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="categoria" value="perro caliente" ${this.isChecked(adicional.categoria, 'perro caliente')}>
                                <span class="checkmark"></span>
                                Perros Calientes
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="categoria" value="acompañamiento" ${this.isChecked(adicional.categoria, 'acompañamiento')}>
                                <span class="checkmark"></span>
                                Acompañamientos
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="categoria" value="bebida" ${this.isChecked(adicional.categoria, 'bebida')}>
                                <span class="checkmark"></span>
                                Bebidas
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="categoria" value="postre" ${this.isChecked(adicional.categoria, 'postre')}>
                                <span class="checkmark"></span>
                                Postres
                            </label>
                        </div>
                        <small class="form-help">Selecciona al menos una categoría</small>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="adicionalActivo" name="activo" ${adicional.activo !== false ? 'checked' : ''}>
                            <span class="checkmark"></span>
                            Adicional Activo
                        </label>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-cancel">Cancelar</button>
                        <button type="submit" class="btn-save">
                            <i class="fas fa-save"></i>
                            ${isEdit ? 'Actualizar' : 'Crear'} Adicional
                        </button>
                    </div>
                </form>
            </div>
        `);
        
        this.bindAdicionalFormEvents(modal, isEdit, adicional.id);
        this.showModal(modal);
    }
    
    bindAdicionalFormEvents(modal, isEdit, adicionalId) {
        const form = modal.querySelector('#adicionalForm');
        const cancelBtn = modal.querySelector('.btn-cancel');
        const closeBtn = modal.querySelector('.modal-close');
        
        cancelBtn.addEventListener('click', () => this.closeModal(modal));
        closeBtn.addEventListener('click', () => this.closeModal(modal));
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAdicionalSubmit(e, modal, isEdit, adicionalId);
        });
        
        this.setupFormValidation(form);
    }
    
    async handleAdicionalSubmit(e, modal, isEdit, adicionalId) {
        const formData = new FormData(e.target);
        const categorias = formData.getAll('categoria');
        
        if (categorias.length === 0) {
            this.showErrorMessage('Debe seleccionar al menos una categoría');
            return;
        }
        
        const adicionalData = {
            nombre: formData.get('nombre'),
            precio: parseFloat(formData.get('precio')),
            categoria: categorias,
            activo: formData.get('activo') === 'on'
        };
        
        try {
            const url = isEdit ? `/admin/adicionales/api/${adicionalId}` : '/admin/adicionales/api';
            const method = isEdit ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(adicionalData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.closeModal(modal);
                this.showSuccessMessage(result.message);
                setTimeout(() => location.reload(), 1000);
            } else {
                this.showErrorMessage(result.message || 'Error al procesar la solicitud');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showErrorMessage('Error de conexión');
        }
    }
    
    // ==========================================
    // UTILITY METHODS
    // ==========================================
    
    createModal(content) {
        const modal = document.createElement('div');
        modal.className = 'admin-modal';
        modal.innerHTML = `
            <div class="modal-content">
                ${content}
            </div>
        `;
        return modal;
    }
    
    showModal(modal) {
        if (this.currentModal) {
            this.closeModal(this.currentModal);
        }
        
        this.currentModal = modal;
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
        
        // Close on ESC key
        this.escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
            }
        };
        document.addEventListener('keydown', this.escapeHandler);
    }
    
    closeModal(modal) {
        modal.classList.remove('active');
        
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
            if (this.currentModal === modal) {
                this.currentModal = null;
            }
        }, 300);
        
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
            this.escapeHandler = null;
        }
    }
    
    isChecked(categorias, categoria) {
        return categorias && categorias.includes(categoria) ? 'checked' : '';
    }
    
    setupFormValidation(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        
        this.clearFieldError(field);
        
        if (isRequired && !value) {
            this.showFieldError(field, 'Este campo es requerido');
            return false;
        }
        
        // Specific validations
        if (field.type === 'email' && value && !this.isValidEmail(value)) {
            this.showFieldError(field, 'Formato de email inválido');
            return false;
        }
        
        if (field.name === 'contrasena' && value && value.length < 8) {
            this.showFieldError(field, 'Mínimo 8 caracteres');
            return false;
        }
        
        if (field.type === 'number' && value && parseFloat(value) < 0) {
            this.showFieldError(field, 'El valor debe ser positivo');
            return false;
        }
        
        return true;
    }
    
    showFieldError(field, message) {
        field.classList.add('error');
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('small');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }
    
    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }
    
    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => this.closeNotification(notification), 5000);
        
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
                background: rgba(0, 0, 0, 0.8);
                z-index: 1000;
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .admin-modal.active {
                opacity: 1;
                visibility: visible;
            }
            
            .modal-content {
                background: #12372a;
                border: 2px solid #fbb5b5;
                border-radius: 8px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .admin-modal.active .modal-content {
                transform: scale(1);
            }
            
            .modal-header {
                padding: 25px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: linear-gradient(135deg, rgba(251, 181, 181, 0.2) 0%, rgba(18, 55, 42, 0.8) 100%);
            }
            
            .modal-header h3 {
                color: white;
                margin: 0;
                font-family: 'Lexend Zetta', sans-serif;
                font-size: 1.2rem;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 2rem;
                color: white;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .modal-close:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .modal-body {
                padding: 25px;
            }
            
            .admin-form {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            
            .form-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .form-group label {
                color: white;
                font-weight: 600;
                font-size: 0.9rem;
                font-family: 'Sansita Swashed', cursive;
            }
            
            .required {
                color: #ff6b6b;
            }
            
            .form-group input,
            .form-group textarea,
            .form-group select {
                padding: 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                color: white;
                font-family: 'Sansita Swashed', cursive;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            
            .form-group input:focus,
            .form-group textarea:focus,
            .form-group select:focus {
                outline: none;
                border-color: #fbb5b5;
                background: rgba(255, 255, 255, 0.15);
            }
            
            .form-group input.error,
            .form-group textarea.error,
            .form-group select.error {
                border-color: #ff6b6b;
            }
            
            .form-group input::placeholder,
            .form-group textarea::placeholder {
                color: rgba(255, 255, 255, 0.5);
            }
            
            .checkbox-group {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }
            
            .checkbox-label {
                display: flex !important;
                flex-direction: row !important;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                padding: 8px;
                border-radius: 4px;
                transition: background 0.3s ease;
            }
            
            .checkbox-label:hover {
                background: rgba(255, 255, 255, 0.05);
            }
            
            .checkbox-label input[type="checkbox"] {
                width: 18px;
                height: 18px;
                margin: 0;
            }
            
            .checkmark {
                font-size: 0.9rem;
                color: rgba(255, 255, 255, 0.8);
            }
            
            .form-help {
                color: rgba(255, 255, 255, 0.6);
                font-size: 0.8rem;
                margin-top: 4px;
            }
            
            .field-error {
                color: #ff6b6b;
                font-size: 0.8rem;
                margin-top: 4px;
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
                border-radius: 6px;
                font-family: 'Sansita Swashed', cursive;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-cancel {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 2px solid rgba(255, 255, 255, 0.2);
            }
            
            .btn-cancel:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.3);
            }
            
            .btn-save {
                background: #4caf50;
                color: white;
                border: 2px solid #4caf50;
            }
            
            .btn-save:hover {
                background: #45a049;
                border-color: #45a049;
                transform: translateY(-2px);
            }
            
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
                opacity: 0;
                visibility: hidden;
            }
            
            .admin-notification.show {
                transform: translateX(0);
                opacity: 1;
                visibility: visible;
            }
            
            .admin-notification.success { border-color: #4caf50; }
            .admin-notification.error { border-color: #ff6b6b; }
            
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
            
            @media (max-width: 768px) {
                .modal-content {
                    width: 95%;
                    margin: 10px;
                }
                
                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .checkbox-group {
                    grid-template-columns: 1fr;
                }
                
                .form-actions {
                    flex-direction: column;
                }
                
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

// CRITICAL: Make AdminModalManager globally available immediately
window.AdminModalManager = AdminModalManager;

// Initialize global instance when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (!window.globalModalManager) {
        window.globalModalManager = new AdminModalManager();
        console.log('Global AdminModalManager initialized');
    }
});