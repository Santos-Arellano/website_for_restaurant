import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  passwordStrength = {
    width: 0,
    text: 'Ingresa una contraseña',
    class: ''
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      apellido: ['', [Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      telefono: ['', [Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      direccion: ['', [Validators.maxLength(200)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.router.navigate(['/menu']);
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      const errors = confirmPassword.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
      }
      return null;
    }
  }

  onPasswordChange(): void {
    const password = this.registerForm.get('password')?.value || '';
    this.updatePasswordStrength(password);
  }

  private updatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = {
        width: 0,
        text: 'Ingresa una contraseña',
        class: ''
      };
      return;
    }

    const strength = this.calculatePasswordStrength(password);
    this.passwordStrength = {
      width: strength.width,
      text: strength.text,
      class: `strength-${strength.level}`
    };
  }

  private calculatePasswordStrength(password: string): { level: string; text: string; width: number } {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score < 3) return { level: 'weak', text: 'Contraseña débil', width: 33 };
    if (score < 4) return { level: 'medium', text: 'Contraseña media', width: 66 };
    return { level: 'strong', text: 'Contraseña fuerte', width: 100 };
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = this.registerForm.value;
    const registerData = {
      nombre: `${formData.nombre} ${formData.apellido || ''}`.trim(),
      email: formData.email,
      password: formData.password,
      telefono: formData.telefono,
      direccion: formData.direccion
    };

    try {
      this.authService.register(registerData).subscribe({
        next: (result) => {
          if (result.success) {
            this.showNotification('Cuenta creada exitosamente', 'success');
            setTimeout(() => {
              this.router.navigate(['/menu']);
            }, 2000);
          } else {
            this.errorMessage = result.message || 'Error al crear la cuenta. Por favor intenta de nuevo.';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Register error:', error);
          this.errorMessage = 'Error de conexión. Por favor intenta de nuevo.';
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      this.errorMessage = 'Error de conexión. Por favor intenta de nuevo.';
      this.isLoading = false;
    }
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Hide and remove notification
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
