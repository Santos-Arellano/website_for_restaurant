class RegisterManager {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.inputs = {
            nombre: document.getElementById('nombre'),
            apellido: document.getElementById('apellido'),
            email: document.getElementById('email'),
            telefono: document.getElementById('telefono'),
            direccion: document.getElementById('direccion'),
            password: document.getElementById('password'),
            confirmPassword: document.getElementById('confirmPassword')
        };
        this.submitBtn = document.getElementById('registerBtn');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.buttonText = document.getElementById('buttonText');
        this.passwordStrength = document.getElementById('passwordStrength');
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Add event listeners for real-time validation
        Object.keys(this.inputs).forEach(field => {
            this.inputs[field].addEventListener('input', () => {
                this.clearError(field);
                if (field === 'password') {
                    this.updatePasswordStrength();
                }
            });
            this.inputs[field].addEventListener('blur', () => this.validateField(field));
        });
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        const formData = this.getFormData();
        
        if (!this.validateAllFields(formData)) {
            return;
        }
        
        this.setLoading(true);
        
        try {
            const response = await fetch('/auth/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(result.message, 'success');
                setTimeout(() => {
                    window.location.href = '/menu';
                }, 2000);
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Register error:', error);
            this.showNotification('Error de conexión. Por favor intenta de nuevo.', 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    getFormData() {
        return {
            nombre: this.inputs.nombre.value.trim(),
            apellido: this.inputs.apellido.value.trim(),
            email: this.inputs.email.value.trim(),
            telefono: this.inputs.telefono.value.trim(),
            direccion: this.inputs.direccion.value.trim(),
            password: this.inputs.password.value,
            confirmPassword: this.inputs.confirmPassword.value
        };
    }
    
    validateAllFields(data) {
        let valid = true;
        
        if (!data.nombre) {
            this.showError('nombre', 'El nombre es requerido');
            valid = false;
        }
        
        if (!data.apellido) {
            this.showError('apellido', 'El apellido es requerido');
            valid = false;
        }
        
        if (!data.email) {
            this.showError('email', 'El correo electrónico es requerido');
            valid = false;
        } else if (!this.isValidEmail(data.email)) {
            this.showError('email', 'Formato de correo inválido');
            valid = false;
        }
        
        if (data.telefono && !this.isValidPhone(data.telefono)) {
            this.showError('telefono', 'Formato de teléfono inválido');
            valid = false;
        }
        
        if (!data.password) {
            this.showError('password', 'La contraseña es requerida');
            valid = false;
        } else if (!this.isValidPassword(data.password)) {
            this.showError('password', 'La contraseña debe tener al menos 8 caracteres, una letra y un número');
            valid = false;
        }
        
        if (data.password !== data.confirmPassword) {
            this.showError('confirmPassword', 'Las contraseñas no coinciden');
            valid = false;
        }
        
        return valid;
    }
    
    validateField(field) {
        const value = this.inputs[field].value.trim();
        
        switch(field) {
            case 'email':
                if (value && !this.isValidEmail(value)) {
                    this.showError(field, 'Formato de correo inválido');
                }
                break;
            case 'telefono':
                if (value && !this.isValidPhone(value)) {
                    this.showError(field, 'Formato de teléfono inválido');
                }
                break;
            case 'password':
                if (value && !this.isValidPassword(value)) {
                    this.showError(field, 'Mínimo 8 caracteres, una letra y un número');
                }
                break;
            case 'confirmPassword':
                if (value && value !== this.inputs.password.value) {
                    this.showError(field, 'Las contraseñas no coinciden');
                }
                break;
        }
    }
    
    updatePasswordStrength() {
        const password = this.inputs.password.value;
        const strengthBar = this.passwordStrength.querySelector('.strength-bar');
        const strengthText = this.passwordStrength.querySelector('.strength-text');
        
        if (!password) {
            strengthBar.className = 'strength-bar';
            strengthText.textContent = 'Ingresa una contraseña';
            return;
        }
        
        const strength = this.calculatePasswordStrength(password);
        strengthBar.className = `strength-bar strength-${strength.level}`;
        strengthText.textContent = strength.text;
    }
    
    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        if (score < 3) return { level: 'weak', text: 'Contraseña débil' };
        if (score < 4) return { level: 'medium', text: 'Contraseña media' };
        return { level: 'strong', text: 'Contraseña fuerte' };
    }
    
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    isValidPhone(phone) {
        return /^\+?[0-9]{7,15}$/.test(phone.replace(/\s+/g, ''));
    }
    
    isValidPassword(password) {
        return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
    }
    
    showError(field, message) {
        const input = this.inputs[field];
        const errorDiv = document.getElementById(field + 'Error');
        
        input.classList.add('error');
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
    }
    
    clearError(field) {
        const input = this.inputs[field];
        const errorDiv = document.getElementById(field + 'Error');
        
        input.classList.remove('error');
        errorDiv.classList.remove('show');
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.loadingSpinner.style.display = 'inline-block';
            this.buttonText.textContent = 'Creando cuenta...';
            this.submitBtn.disabled = true;
        } else {
            this.loadingSpinner.style.display = 'none';
            this.buttonText.textContent = 'Crear Cuenta';
            this.submitBtn.disabled = false;
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RegisterManager();
});