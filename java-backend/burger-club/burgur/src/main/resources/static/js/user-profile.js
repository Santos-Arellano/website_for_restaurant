/* ==========================================
   ARCHIVO: src/main/resources/static/js/user-profile.js
   ========================================== */

class UserProfileManager {
    constructor() {
        this.currentTab = 'info';
        this.init();
    }

    init() {
        this.setupTabNavigation();
        this.setupForms();
        this.setupPasswordStrength();
    }

    // Tab Navigation
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                this.switchTab(tabId, tabButtons, tabContents);
            });
        });
    }

    switchTab(tabId, tabButtons, tabContents) {
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to selected button and content
        const activeButton = document.querySelector(`[data-tab="${tabId}"]`);
        const activeContent = document.getElementById(`${tabId}-tab`);

        if (activeButton && activeContent) {
            activeButton.classList.add('active');
            activeContent.classList.add('active');
            this.currentTab = tabId;
        }
    }

    // Form Setup
    setupForms() {
        // Profile Form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }

        // Password Form
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => this.handlePasswordUpdate(e));
        }

        // Delete Form
        const deleteForm = document.getElementById('deleteForm');
        if (deleteForm) {
            deleteForm.addEventListener('submit', (e) => this.handleAccountDeletion(e));
        }

        // Real-time validation
        this.setupRealTimeValidation();
    }

    setupRealTimeValidation() {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    // Password Strength
    setupPasswordStrength() {
        const passwordInput = document.getElementById('newPassword');
        const strengthIndicator = document.getElementById('passwordStrength');

        if (passwordInput && strengthIndicator) {
            passwordInput.addEventListener('input', () => {
                this.updatePasswordStrength(passwordInput.value, strengthIndicator);
            });
        }
    }

    updatePasswordStrength(password, indicator) {
        const strength = this.calculatePasswordStrength(password);
        const strengthFill = indicator.querySelector('.strength-fill');
        const strengthText = indicator.querySelector('.strength-text');

        // Remove all strength classes
        indicator.classList.remove('weak', 'fair', 'good', 'strong');

        if (password.length === 0) {
            strengthText.textContent = 'Ingresa una nueva contraseña';
            return;
        }

        switch (strength.level) {
            case 1:
                indicator.classList.add('weak');
                strengthText.textContent = 'Contraseña débil';
                break;
            case 2:
                indicator.classList.add('fair');
                strengthText.textContent = 'Contraseña regular';
                break;
            case 3:
                indicator.classList.add('good');
                strengthText.textContent = 'Contraseña buena';
                break;
            case 4:
                indicator.classList.add('strong');
                strengthText.textContent = 'Contraseña fuerte';
                break;
        }
    }

    calculatePasswordStrength(password) {
        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            symbols: /[^\w\s]/.test(password)
        };

        // Calculate score
        Object.values(checks).forEach(check => {
            if (check) score++;
        });

        // Bonus for length
        if (password.length >= 12) score++;

        return {
            score: score,
            level: Math.min(Math.floor(score / 1.5) + 1, 4),
            checks: checks
        };
    }

    // Form Handlers
    async handleProfileUpdate(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate form
        if (!this.validateProfileForm(data)) {
            return;
        }

        const button = document.getElementById('updateProfileBtn');
        const spinner = document.getElementById('profileSpinner');
        const buttonText = document.getElementById('profileButtonText');

        try {
            this.setLoadingState(button, spinner, buttonText, 'Actualizando...');

            const response = await fetch('/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showNotification('success', 'Perfil actualizado', 'Tu información ha sido actualizada correctamente');
            } else {
                throw new Error(result.message || 'Error al actualizar el perfil');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showNotification('error', 'Error', error.message || 'No se pudo actualizar el perfil');
        } finally {
            this.clearLoadingState(button, spinner, buttonText, 'Actualizar Información');
        }
    }

    async handlePasswordUpdate(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate form
        if (!this.validatePasswordForm(data)) {
            return;
        }

        const button = document.getElementById('updatePasswordBtn');
        const spinner = document.getElementById('passwordSpinner');
        const buttonText = document.getElementById('passwordButtonText');

        try {
            this.setLoadingState(button, spinner, buttonText, 'Cambiando...');

            const response = await fetch('/user/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newPassword: data.newPassword })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showNotification('success', 'Contraseña actualizada', 'Tu contraseña ha sido cambiada correctamente');
                form.reset();
                // Reset password strength indicator
                const strengthIndicator = document.getElementById('passwordStrength');
                if (strengthIndicator) {
                    strengthIndicator.classList.remove('weak', 'fair', 'good', 'strong');
                    strengthIndicator.querySelector('.strength-text').textContent = 'Ingresa una nueva contraseña';
                }
            } else {
                throw new Error(result.message || 'Error al cambiar la contraseña');
            }
        } catch (error) {
            console.error('Error updating password:', error);
            this.showNotification('error', 'Error', error.message || 'No se pudo cambiar la contraseña');
        } finally {
            this.clearLoadingState(button, spinner, buttonText, 'Cambiar Contraseña');
        }
    }

    async handleAccountDeletion(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate form
        if (!this.validateDeleteForm(data)) {
            return;
        }

        // Double confirmation
        const confirmed = confirm('¿Estás completamente seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.');
        if (!confirmed) {
            return;
        }

        const button = document.getElementById('deleteAccountBtn');
        const spinner = document.getElementById('deleteSpinner');
        const buttonText = document.getElementById('deleteButtonText');

        try {
            this.setLoadingState(button, spinner, buttonText, 'Eliminando...');

            const response = await fetch('/user/account', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: data.deletePassword })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showNotification('success', 'Cuenta eliminada', 'Tu cuenta ha sido eliminada. Serás redirigido en unos segundos...');
                
                // Redirect to home page after 3 seconds
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
            } else {
                throw new Error(result.message || 'Error al eliminar la cuenta');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            this.showNotification('error', 'Error', error.message || 'No se pudo eliminar la cuenta');
        } finally {
            this.clearLoadingState(button, spinner, buttonText, 'Eliminar Mi Cuenta');
        }
    }

    // Validation Methods
    validateProfileForm(data) {
        let isValid = true;

        // Validate nombre
        if (!data.nombre || data.nombre.trim().length < 2) {
            this.showFieldError('nombre', 'El nombre debe tener al menos 2 caracteres');
            isValid = false;
        }

        // Validate apellido
        if (!data.apellido || data.apellido.trim().length < 2) {
            this.showFieldError('apellido', 'El apellido debe tener al menos 2 caracteres');
            isValid = false;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.correo || !emailRegex.test(data.correo)) {
            this.showFieldError('correo', 'Ingresa un correo electrónico válido');
            isValid = false;
        }

        // Validate telefono (optional but if provided, should be valid)
        if (data.telefono && data.telefono.trim().length > 0) {
            const phoneRegex = /^[+]?[\d\s\-\(\)]{8,}$/;
            if (!phoneRegex.test(data.telefono)) {
                this.showFieldError('telefono', 'Ingresa un número de teléfono válido');
                isValid = false;
            }
        }

        return isValid;
    }

    validatePasswordForm(data) {
        let isValid = true;

        // Validate new password
        if (!data.newPassword || data.newPassword.length < 8) {
            this.showFieldError('newPassword', 'La contraseña debe tener al menos 8 caracteres');
            isValid = false;
        }

        // Validate password confirmation
        if (data.newPassword !== data.confirmNewPassword) {
            this.showFieldError('confirmNewPassword', 'Las contraseñas no coinciden');
            isValid = false;
        }

        return isValid;
    }

    validateDeleteForm(data) {
        let isValid = true;

        // Validate password
        if (!data.deletePassword || data.deletePassword.trim().length === 0) {
            this.showFieldError('deletePassword', 'Debes ingresar tu contraseña actual');
            isValid = false;
        }

        // Validate confirmation checkbox
        const confirmCheckbox = document.getElementById('confirmDelete');
        if (!confirmCheckbox.checked) {
            this.showNotification('warning', 'Confirmación requerida', 'Debes confirmar que entiendes las consecuencias de eliminar tu cuenta');
            isValid = false;
        }

        return isValid;
    }

    validateField(input) {
        const value = input.value.trim();
        const fieldName = input.name;

        switch (fieldName) {
            case 'nombre':
            case 'apellido':
                if (value.length < 2) {
                    this.showFieldError(fieldName, `El ${fieldName} debe tener al menos 2 caracteres`);
                    return false;
                }
                break;
            case 'correo':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    this.showFieldError(fieldName, 'Ingresa un correo electrónico válido');
                    return false;
                }
                break;
            case 'telefono':
                if (value.length > 0) {
                    const phoneRegex = /^[+]?[\d\s\-\(\)]{8,}$/;
                    if (!phoneRegex.test(value)) {
                        this.showFieldError(fieldName, 'Ingresa un número de teléfono válido');
                        return false;
                    }
                }
                break;
        }

        this.clearFieldError(input);
        return true;
    }

    // UI Helper Methods
    showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}Error`);
        
        if (field && errorElement) {
            field.parentElement.classList.add('error');
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    clearFieldError(input) {
        const fieldName = input.name || input.id;
        const errorElement = document.getElementById(`${fieldName}Error`);
        
        if (input.parentElement && errorElement) {
            input.parentElement.classList.remove('error');
            errorElement.classList.remove('show');
            errorElement.textContent = '';
        }
    }

    setLoadingState(button, spinner, buttonText, loadingText) {
        button.disabled = true;
        button.classList.add('loading');
        spinner.style.display = 'block';
        buttonText.textContent = loadingText;
    }

    clearLoadingState(button, spinner, buttonText, originalText) {
        button.disabled = false;
        button.classList.remove('loading');
        spinner.style.display = 'none';
        buttonText.textContent = originalText;
    }

    showNotification(type, title, message) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = this.getNotificationIcon(type);
        
        notification.innerHTML = `
            <i class="${icon}"></i>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <p class="notification-message">${message}</p>
            </div>
        `;

        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fas fa-check-circle';
            case 'error': return 'fas fa-exclamation-circle';
            case 'warning': return 'fas fa-exclamation-triangle';
            default: return 'fas fa-info-circle';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UserProfileManager();
});

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);