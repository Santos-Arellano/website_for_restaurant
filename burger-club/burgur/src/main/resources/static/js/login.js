class LoginManager {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.submitBtn = document.getElementById('loginBtn');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.buttonText = document.getElementById('buttonText');
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.emailInput.addEventListener('input', () => this.clearError('email'));
        this.passwordInput.addEventListener('input', () => this.clearError('password'));
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value.trim();
        
        // Validation
        if (!this.validateInputs(email, password)) {
            return;
        }
        
        this.setLoading(true);
        
        try {
            const response = await fetch('/auth/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(result.message, 'success');
                setTimeout(() => {
                    window.location.href = '/menu';
                }, 1500);
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Error de conexión. Por favor intenta de nuevo.', 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    validateInputs(email, password) {
        let valid = true;
        
        if (!email) {
            this.showError('email', 'El correo electrónico es requerido');
            valid = false;
        } else if (!this.isValidEmail(email)) {
            this.showError('email', 'Formato de correo inválido');
            valid = false;
        }
        
        if (!password) {
            this.showError('password', 'La contraseña es requerida');
            valid = false;
        }
        
        return valid;
    }
    
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    showError(field, message) {
        const input = document.getElementById(field);
        const errorDiv = document.getElementById(field + 'Error');
        
        input.classList.add('error');
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
    }
    
    clearError(field) {
        const input = document.getElementById(field);
        const errorDiv = document.getElementById(field + 'Error');
        
        input.classList.remove('error');
        errorDiv.classList.remove('show');
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.loadingSpinner.style.display = 'inline-block';
            this.buttonText.textContent = 'Iniciando sesión...';
            this.submitBtn.disabled = true;
        } else {
            this.loadingSpinner.style.display = 'none';
            this.buttonText.textContent = 'Iniciar Sesión';
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
        }, 4000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});