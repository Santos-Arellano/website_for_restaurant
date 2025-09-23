import { Component, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

interface ProfileData {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  direccion: string;
}

interface PasswordData {
  newPassword: string;
  confirmNewPassword: string;
}

interface DeleteData {
  password: string;
  confirmDelete: boolean;
}

interface PasswordStrength {
  level: string;
  percentage: number;
  text: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements AfterViewInit {
  private router = inject(Router);
  
  activeTab = 'info';
  isLoading = false;

  profileData: ProfileData = {
    nombre: 'Juan',
    apellido: 'Pérez',
    correo: 'juan.perez@email.com',
    telefono: '+57 300 123 4567',
    direccion: 'Calle 123 #45-67, Bogotá'
  };

  passwordData: PasswordData = {
    newPassword: '',
    confirmNewPassword: ''
  };

  deleteData: DeleteData = {
    password: '',
    confirmDelete: false
  };

  passwordStrength: PasswordStrength = {
    level: 'weak',
    percentage: 0,
    text: 'Ingresa una nueva contraseña'
  };

  ngAfterViewInit(): void {
    this.initializeProfile();
  }

  initializeProfile(): void {
    // Initialize profile functionality
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    // Simulate loading user profile data
    // In a real app, this would come from a service
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  updateProfile(): void {
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      console.log('Profile updated:', this.profileData);
      this.showNotification('Perfil actualizado correctamente', 'success');
      this.isLoading = false;
    }, 2000);
  }

  updatePassword(): void {
    if (!this.passwordsMatch()) {
      this.showNotification('Las contraseñas no coinciden', 'error');
      return;
    }

    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      console.log('Password updated');
      this.showNotification('Contraseña actualizada correctamente', 'success');
      this.passwordData = { newPassword: '', confirmNewPassword: '' };
      this.isLoading = false;
    }, 2000);
  }

  deleteAccount(): void {
    if (!this.deleteData.confirmDelete) {
      this.showNotification('Debes confirmar la eliminación de la cuenta', 'error');
      return;
    }

    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      console.log('Account deleted');
      this.showNotification('Cuenta eliminada correctamente', 'success');
      this.logout();
    }, 2000);
  }

  passwordsMatch(): boolean {
    return this.passwordData.newPassword === this.passwordData.confirmNewPassword;
  }

  checkPasswordStrength(): void {
    const password = this.passwordData.newPassword;
    
    if (!password) {
      this.passwordStrength = {
        level: 'weak',
        percentage: 0,
        text: 'Ingresa una nueva contraseña'
      };
      return;
    }

    let score = 0;
    const feedback = [];

    // Length check
    if (password.length >= 8) score += 25;
    else feedback.push('al menos 8 caracteres');

    // Uppercase check
    if (/[A-Z]/.test(password)) score += 25;
    else feedback.push('una mayúscula');

    // Lowercase check
    if (/[a-z]/.test(password)) score += 25;
    else feedback.push('una minúscula');

    // Number or special character check
    if (/[\d\W]/.test(password)) score += 25;
    else feedback.push('un número o símbolo');

    let level = 'weak';
    let text = '';

    if (score < 50) {
      level = 'weak';
      text = `Débil - Necesita: ${feedback.join(', ')}`;
    } else if (score < 75) {
      level = 'medium';
      text = 'Media - Puede mejorar';
    } else {
      level = 'strong';
      text = 'Fuerte - Excelente contraseña';
    }

    this.passwordStrength = {
      level,
      percentage: score,
      text
    };
  }

  logout(): void {
    // Simulate logout
    console.log('Logging out...');
    this.router.navigate(['/login']);
  }

  showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
      </div>
    `;

    // Add to container
    const container = document.getElementById('notificationContainer');
    if (container) {
      container.appendChild(notification);

      // Auto remove after 5 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
    }
  }
}
