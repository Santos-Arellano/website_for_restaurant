import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Services
import { AuthService } from '../../../../services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">
            <i class="fas fa-hamburger"></i>
            <h1>Burger Club</h1>
          </div>
          <h2>Iniciar Sesión</h2>
          <p>Ingresa a tu cuenta para continuar</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
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
              <ng-container *ngIf="loginForm.get('email')?.errors?.['required']">
                El correo electrónico es requerido
              </ng-container>
              <ng-container *ngIf="loginForm.get('email')?.errors?.['email']">
                Formato de correo inválido
              </ng-container>
            </div>
          </div>

          <!-- Password Field -->
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
                autocomplete="current-password"
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
            <div class="field-error" *ngIf="isFieldInvalid('password')">
              <ng-container *ngIf="loginForm.get('password')?.errors?.['required']">
                La contraseña es requerida
              </ng-container>
              <ng-container *ngIf="loginForm.get('password')?.errors?.['minlength']">
                La contraseña debe tener al menos 6 caracteres
              </ng-container>
            </div>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="form-options">
            <label class="checkbox-label">
              <input
                type="checkbox"
                formControlName="rememberMe"
              >
              <span class="checkmark"></span>
              Recuérdame
            </label>
            <a href="/auth/forgot-password" class="forgot-link">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn btn-primary btn-auth"
            [disabled]="loginForm.invalid || isLoading"
          >
            <span class="loading-spinner" *ngIf="isLoading">
              <i class="fas fa-spinner fa-spin"></i>
            </span>
            <span *ngIf="!isLoading">
              <i class="fas fa-sign-in-alt"></i>
              Iniciar Sesión
            </span>
            <span *ngIf="isLoading">Iniciando sesión...</span>
          </button>

          <!-- Social Login (Optional) -->
          <div class="auth-divider">
            <span>o continúa con</span>
          </div>

          <div class="social-login">
            <button type="button" class="btn btn-social btn-google" (click)="loginWithGoogle()">
              <i class="fab fa-google"></i>
              Google
            </button>
            <button type="button" class="btn btn-social btn-facebook" (click)="loginWithFacebook()">
              <i class="fab fa-facebook-f"></i>
              Facebook
            </button>
          </div>
        </form>

        <!-- Register Link -->
        <div class="auth-footer">
          <p>¿No tienes cuenta? <a routerLink="/auth/register">Regístrate aquí</a></p>
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
      max-width: 450px;
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

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }

    .form-check {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-check input[type="checkbox"] {
      width: auto;
      margin: 0;
    }

    .form-check label {
      margin: 0;
      color: rgba(255, 255, 255, 0.8);
      font-weight: normal;
    }

    .forgot-password {
      color: #4ade80;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    .forgot-password:hover {
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

      .social-login {
        grid-template-columns: 1fr;
      }

      .form-options {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  isLoading = false;
  showPassword = false;

  ngOnInit(): void {
    // Check if user is already authenticated
    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.router.navigate(['/menu']);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    try {
      const result = await this.authService.login({ email, password }).toPromise();
      
      if (result && result.success) {
        this.notificationService.show(result.message || 'Inicio de sesión exitoso', 'success');
        
        // Redirect after successful login
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      } else {
        this.notificationService.show(result?.message || 'Error al iniciar sesión', 'danger');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      this.notificationService.show(
        error.message || 'Error de conexión. Por favor intenta de nuevo.',
        'danger'
      );
    } finally {
      this.isLoading = false;
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      // Mock Google login - in production this would integrate with Google OAuth
      this.notificationService.show('Función de Google login no disponible en modo desarrollo', 'info');
    } catch (error: any) {
      console.error('Google login error:', error);
      this.notificationService.show('Error al iniciar sesión con Google', 'danger');
    }
  }

  async loginWithFacebook(): Promise<void> {
    try {
      // Mock Facebook login - in production this would integrate with Facebook OAuth
      this.notificationService.show('Función de Facebook login no disponible en modo desarrollo', 'info');
    } catch (error: any) {
      console.error('Facebook login error:', error);
      this.notificationService.show('Error al iniciar sesión con Facebook', 'danger');
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }
}