import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent {
  @Input() isVisible: boolean = false;
  @Input() mode: 'login' | 'register' = 'login';
  @Output() closeModal = new EventEmitter<void>();
  @Output() switchMode = new EventEmitter<'login' | 'register'>();
  @Output() submitForm = new EventEmitter<any>();

  formData = {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  };

  errors: any = {};
  isLoading = false;

  onClose() {
    this.closeModal.emit();
    this.resetForm();
  }

  onSwitchMode() {
    const newMode = this.mode === 'login' ? 'register' : 'login';
    this.switchMode.emit(newMode);
    this.resetForm();
  }

  onSubmit() {
    if (this.validateForm()) {
      this.isLoading = true;
      this.submitForm.emit({
        mode: this.mode,
        data: this.formData
      });
    }
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    // Email validation
    if (!this.formData.email) {
      this.errors.email = 'El correo electrónico es requerido';
      isValid = false;
    } else if (!this.isValidEmail(this.formData.email)) {
      this.errors.email = 'Ingresa un correo electrónico válido';
      isValid = false;
    }

    // Password validation
    if (!this.formData.password) {
      this.errors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (this.formData.password.length < 6) {
      this.errors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    // Register mode validations
    if (this.mode === 'register') {
      if (!this.formData.firstName) {
        this.errors.firstName = 'El nombre es requerido';
        isValid = false;
      }

      if (!this.formData.lastName) {
        this.errors.lastName = 'El apellido es requerido';
        isValid = false;
      }

      if (!this.formData.phone) {
        this.errors.phone = 'El teléfono es requerido';
        isValid = false;
      }

      if (!this.formData.confirmPassword) {
        this.errors.confirmPassword = 'Confirma tu contraseña';
        isValid = false;
      } else if (this.formData.password !== this.formData.confirmPassword) {
        this.errors.confirmPassword = 'Las contraseñas no coinciden';
        isValid = false;
      }
    }

    return isValid;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private resetForm() {
    this.formData = {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: ''
    };
    this.errors = {};
    this.isLoading = false;
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}