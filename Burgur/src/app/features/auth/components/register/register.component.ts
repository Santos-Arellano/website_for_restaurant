import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Services
import { AuthService, RegisterData } from '../../../../services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">
            <i class="fas fa-hamburger"></i>
            <h1>Burger Club</h1>
          </div>
          <h2>Crear Cuenta</h2>
          <p>Únete a nuestra comunidad de amantes de las hamburguesas</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <!-- Name Fields -->
          <div class="form-row">
            <div class="form-group">
              <label for="nombre">
                <i class="fas fa-user"></i>
                Nombre
              </label>
              <input
                type="text"
                id="nombre"
                formControlName="nombre"
                placeholder="Tu nombre"
                [class.error]="isFieldInvalid('nombre')"
                autocomplete="given-name"
              >
              <div class="field-error" *ngIf="isFieldInvalid('nombre')">
                <ng-container *ngIf="registerForm.get('nombre')?.errors?.['required']">
                  El nombre es requerido
                </ng-container>
                <ng-container *ngIf="registerForm.get('nombre')?.errors?.['minlength']">
                  El nombre debe tener al menos 2 caracteres
                </ng-container>
              </div>
            </div>

            <div class="form-group">
              <label for="apellido">
                <i class="fas fa-user"></i>
                Apellido
              </label>
              <input
                type="text"
                id="apellido"
                formControlName="apellido"
                placeholder="Tu apellido"
                [class.error]="isFieldInvalid('apellido')"
                autocomplete="family-name"
              >
              <div class="field-error" *ngIf="isFieldInvalid('apellido')">
                <ng-container *ngIf="registerForm.get('apellido')?.errors?.['required']">
                  El apellido es requerido
                </ng-container>
                <ng-container *ngIf="registerForm.get('apellido')?.errors?.['minlength']">
                  El apellido debe tener al menos 2 caracteres
                </ng-container>
              </div>
            </div>
          </div>

          <!-- Email Field -->
          <div class="form-group">
            <label for="email">
              <i class="fas fa-envelope"></i>
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="ejemplo@correo.com"
              [class.error]="isFieldInvalid('email')"
              autocomplete="email"
            >
            <div class="field-error" *ngIf="isFieldInvalid('email')">
              <ng-container *ngIf="registerForm.get('email')?.errors?.['required']">
                El correo electrónico es requerido
              </ng-container>
              <ng-container *ngIf="registerForm.get('email')?.errors?.['email']">
                Formato de correo inválido
              </ng-container>
            </div>
          </div>

          <!-- Contact Fields -->
          <div class="form-row">
            <div class="form-group">
              <label for="telefono">
                <i class="fas fa-phone"></i>
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                formControlName="telefono"
                placeholder="300 123 4567"
                [class.error]="isFieldInvalid('telefono')"
                autocomplete="tel"
              >
              <div class="field-error" *ngIf="isFieldInvalid('telefono')">
                <ng-container *ngIf="registerForm.get('telefono')?.errors?.['pattern']">
                  Formato de teléfono inválido
                </ng-container>
              </div>
            </div>

            <div class="form-group">
              <label for="direccion">
                <i class="fas fa-map-marker-alt"></i>
                Dirección
              </label>
              <input
                type="text"
                id="direccion"
                formControlName="direccion"
                placeholder="Calle 123 #45-67"
                autocomplete="street-address"
              >
            </div>
          </div>

          <!-- Password Fields -->
          <div class="form-group">
            <label for="password">
              <i class="fas fa-lock"></i>
              Contraseña
            </label>
            <div class="password-field">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                formControlName="password"
                placeholder="••••••••"
                [class.error]="isFieldInvalid('password')"
                autocomplete="new-password"
                (input)="updatePasswordStrength()"
              >
              <button
                type="button"
                class="password-toggle"
                (click)="togglePassword()"
                [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                <i class="fas" [class.fa-eye]="!showPassword" [class.fa-eye-slash]="showPassword"></i>
              </button>
            </div>
            
            <!-- Password Strength Indicator -->
            <div class="password-strength" *ngIf="registerForm.get('password')?.value">
              <div class="strength-bar">
                <div 
                  class="strength-fill" 
                  [class]="passwordStrength.class"
                  [style.width.%]="passwordStrength.percentage"
                ></div>
              </div>
              <span class="strength-text" [class]="passwordStrength.class">
                {{ passwordStrength.text }}
              </span>
            </div>

            <div class="field-error" *ngIf="isFieldInvalid('password')">
              <ng-container *ngIf="registerForm.get('password')?.errors?.['required']">
                La contraseña es requerida
              </ng-container>
              <ng-container *ngIf="registerForm.get('password')?.errors?.['minlength']">
                La contraseña debe tener al menos 8 caracteres
              </ng-container>
              <ng-container *ngIf="registerForm.get('password')?.errors?.['pattern']">
                La contraseña debe contener al menos una mayúscula, una minúscula y un número
              </ng-container>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">
              <i class="fas fa-lock"></i>
              Confirmar Contraseña
            </label>
            <div class="password-field">
              <input
                [type]="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                formControlName="confirmPassword"
                placeholder="••••••••"
                [class.error]="isFieldInvalid('confirmPassword')"
                autocomplete="new-password"
              >
              <button
                type="button"
                class="password-toggle"
                (click)="toggleConfirmPassword()"
                [attr.aria-label]="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                <i class="fas" [class.fa-eye]="!showConfirmPassword" [class.fa-eye-slash]="showConfirmPassword"></i>
              </button>
            </div>
            <div class="field-error" *ngIf="isFieldInvalid('confirmPassword')">
              <ng-container *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">
                Confirma tu contraseña
              </ng-container>
              <ng-container *ngIf="registerForm.get('confirmPassword')?.errors?.['passwordMismatch']">
                Las contraseñas no coinciden
              </ng-container>
            </div>
          </div>

          <!-- Terms and Conditions -->
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                formControlName="acceptTerms"
              >
              <span class="checkmark"></span>
              Acepto los <a href="/terms" target="_blank">términos y condiciones</a> y la <a href="/privacy" target="_blank">política de privacidad</a>
            </label>
            <div class="field-error" *ngIf="isFieldInvalid('acceptTerms')">
              Debes aceptar los términos y condiciones
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn btn-primary btn-auth"
            [disabled]="registerForm.invalid || isLoading"
          >
            <span class="loading-spinner" *ngIf="isLoading">
              <i class="fas fa-spinner fa-spin"></i>
            </span>
            <span *ngIf="!isLoading">
              <i class="fas fa-user-plus"></i>
              Crear Cuenta
            </span>
            <span *ngIf="isLoading">Creando cuenta...</span>
          </button>

          <!-- Social Registration -->
          <div class="auth-divider">
            <span>o regístrate con</span>
          </div>

          <div class="social-login">
            <button type="button" class="btn btn-social btn-google" (click)="registerWithGoogle()">
              <i class="fab fa-google"></i>
              Google
            </button>
            <button type="button" class="btn btn-social btn-facebook" (click)="registerWithFacebook()">
              <i class="fab fa-facebook-f"></i>
              Facebook
            </button>
          </div>
        </form>

        <!-- Login Link -->
        <div class="auth-footer">
          <p>¿Ya tienes cuenta? <a routerLink="/auth/login">Inicia sesión aquí</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a4a37 0%, #0f2d21 100%);
      padding: 1rem;
    }

    .auth-card {
      background: linear-gradient(135deg, #12372a 0%, #0f2d21 100%);
      border-radius: 16px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      border: 2px solid rgba(74, 222, 128, 0.2);
      width: 100%;
      max-width: 600px;
      overflow: hidden;
      animation: slideUp 0.6s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .auth-header {
      background: linear-gradient(135deg, #0f2d21 0%, #12372a 100%);
      color: white;
      padding: 2rem;
      text-align: center;
      border-bottom: 1px solid rgba(74, 222, 128, 0.2);
    }

    .auth-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .auth-logo i {
      font-size: 2rem;
      color: #4ade80;
    }

    .auth-logo h1 {
      font-family: 'Sansita Swashed', cursive;
      font-size: 1.75rem;
      margin: 0;
      color: #4ade80;
    }

    .auth-header h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #ffffff;
    }

    .auth-header p {
      margin: 0;
      opacity: 0.9;
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .auth-form {
      padding: 2rem;
      background: linear-gradient(135deg, #12372a 0%, #0f2d21 100%);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #ffffff;
      font-size: 0.95rem;
    }

    .form-control {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #4ade80;
      box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.2);
      background: rgba(255, 255, 255, 0.15);
    }

    .form-control::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    .form-control.is-invalid {
      border-color: #dc3545;
      box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.2);
    }

    .invalid-feedback {
      display: block;
      width: 100%;
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: #dc3545;
    }

    .password-strength {
      margin-top: 0.5rem;
    }

    .strength-bar {
      height: 4px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 0.25rem;
    }

    .strength-fill {
      height: 100%;
      width: 0%;
      transition: all 0.3s ease;
      border-radius: 2px;
    }

    .strength-text {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .strength-weak .strength-fill {
      width: 33%;
      background: #ef4444;
    }

    .strength-medium .strength-fill {
      width: 66%;
      background: #f59e0b;
    }

    .strength-strong .strength-fill {
      width: 100%;
      background: #22c55e;
    }

    .form-check {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .form-check input[type="checkbox"] {
      width: auto;
      margin: 0;
      margin-top: 0.125rem;
    }

    .form-check label {
      margin: 0;
      color: rgba(255, 255, 255, 0.8);
      font-weight: normal;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .form-check a {
      color: #4ade80;
      text-decoration: none;
      font-weight: 500;
    }

    .form-check a:hover {
      color: #22c55e;
      text-decoration: underline;
    }

    .btn-primary {
      width: 100%;
      padding: 0.875rem;
      background: #4ade80;
      color: #0f2d21;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 1.5rem;
    }

    .btn-primary:hover:not(:disabled) {
      background: #22c55e;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .divider {
      text-align: center;
      margin: 1.5rem 0;
      position: relative;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(255, 255, 255, 0.2);
    }

    .divider span {
      background: linear-gradient(135deg, #12372a 0%, #0f2d21 100%);
      padding: 0 1rem;
    }

    .social-login {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .btn-social {
      padding: 0.75rem;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-social:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.3);
      color: #ffffff;
      text-decoration: none;
    }

    .btn-google {
      background: rgba(219, 68, 55, 0.2);
      border-color: rgba(219, 68, 55, 0.3);
      color: #ffffff;
    }

    .btn-google:hover {
      background: rgba(219, 68, 55, 0.3);
      border-color: rgba(219, 68, 55, 0.4);
      color: #ffffff;
    }

    .btn-facebook {
      background: rgba(59, 89, 152, 0.2);
      border-color: rgba(59, 89, 152, 0.3);
      color: #ffffff;
    }

    .btn-facebook:hover {
      background: rgba(59, 89, 152, 0.3);
      border-color: rgba(59, 89, 152, 0.4);
      color: #ffffff;
    }

    .auth-footer {
      text-align: center;
      padding: 0 2rem 2rem;
      color: rgba(255, 255, 255, 0.8);
      background: linear-gradient(135deg, #12372a 0%, #0f2d21 100%);
    }

    .auth-footer a {
      color: #4ade80;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .auth-footer a:hover {
      color: #22c55e;
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .auth-container {
        padding: 0.5rem;
      }

      .auth-header,
      .auth-form,
      .auth-footer {
        padding: 1.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .social-login {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  registerForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
    direccion: [''],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    ]],
    confirmPassword: ['', [Validators.required]],
    acceptTerms: [false, [Validators.requiredTrue]]
  }, {
    validators: this.passwordMatchValidator
  });

  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength = {
    percentage: 0,
    text: '',
    class: ''
  };

  ngOnInit(): void {
    // Check if user is already authenticated
    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.router.navigate(['/menu']);
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): Record<string, boolean> | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  updatePasswordStrength(): void {
    const password = this.registerForm.get('password')?.value || '';
    const strength = this.calculatePasswordStrength(password);
    
    if (strength < 30) {
      this.passwordStrength = {
        percentage: strength,
        text: 'Débil',
        class: 'weak'
      };
    } else if (strength < 70) {
      this.passwordStrength = {
        percentage: strength,
        text: 'Media',
        class: 'medium'
      };
    } else {
      this.passwordStrength = {
        percentage: strength,
        text: 'Fuerte',
        class: 'strong'
      };
    }
  }

  private calculatePasswordStrength(password: string): number {
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    
    return Math.min(strength, 100);
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.registerForm.value;
    
    // Combine nombre and apellido for the full name
    const registerData: RegisterData = {
      nombre: `${formData.nombre} ${formData.apellido}`,
      email: formData.email,
      password: formData.password,
      telefono: formData.telefono,
      direccion: formData.direccion
    };

    try {
      const result = await this.authService.register(registerData).toPromise();
      
      if (result && result.success) {
        this.notificationService.show(
          result.message || 'Cuenta creada exitosamente',
          'success'
        );
        
        // Redirect after successful registration
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      } else {
        this.notificationService.show(
          result?.message || 'Error al crear la cuenta',
          'danger'
        );
      }
    } catch (error: any) {
      console.error('Register error:', error);
      this.notificationService.show(
        error.message || 'Error de conexión. Por favor intenta de nuevo.',
        'danger'
      );
    } finally {
      this.isLoading = false;
    }
  }

  async registerWithGoogle(): Promise<void> {
    this.notificationService.show('Registro con Google no disponible en modo demo', 'info');
  }

  async registerWithFacebook(): Promise<void> {
    this.notificationService.show('Registro con Facebook no disponible en modo demo', 'info');
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }
}