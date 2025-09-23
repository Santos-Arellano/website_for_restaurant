import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Services
import { AuthService, User } from '../../../../services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

interface PasswordStrength {
  score: number;
  level: number;
  checks: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    numbers: boolean;
    symbols: boolean;
  };
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <!-- Header -->
    <header class="site-header">
      <div class="container header-container">
        <a routerLink="/" class="logo">
          <div class="logo-icon-wrapper">
            <img src="assets/images/Logo.png" alt="Burger Club Logo" class="logo-icon">
          </div>
          <span class="logo-text">BURGER CLUB</span>
        </a>

        <nav class="main-nav">
          <ul>
            <li><a routerLink="/">Inicio</a></li>
            <li><a routerLink="/menu">Menú</a></li>
            <li><a routerLink="/profile" class="active">Mi Perfil</a></li>
            <li><a (click)="logout()">Cerrar Sesión</a></li>
          </ul>
        </nav>
      </div>
    </header>

    <!-- Profile Section -->
    <section class="profile-section">
      <div class="auth-background"></div>
      
      <div class="profile-container">
        <!-- Profile Header -->
        <div class="profile-header">
          <div class="profile-avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <h1 class="profile-title">Mi Perfil</h1>
          <p class="profile-subtitle">Hola, {{currentUser?.nombre}}! Gestiona tu información personal</p>
        </div>
        
        <!-- Profile Tabs -->
        <div class="profile-tabs">
          <button 
            class="tab-button" 
            [class.active]="currentTab === 'info'" 
            (click)="switchTab('info')"
          >
            Información Personal
          </button>
          <button 
            class="tab-button" 
            [class.active]="currentTab === 'security'" 
            (click)="switchTab('security')"
          >
            Seguridad
          </button>
          <button 
            class="tab-button danger" 
            [class.active]="currentTab === 'delete'" 
            (click)="switchTab('delete')"
          >
            Eliminar Cuenta
          </button>
        </div>

        <!-- Tab Contents -->
        <div class="tab-contents">
          <!-- Personal Information Tab -->
          <div 
            class="tab-content" 
            [class.active]="currentTab === 'info'" 
            id="info-tab"
          >
            <div class="profile-card">
              <div class="card-header">
                <h3><i class="fas fa-user"></i> Información Personal</h3>
                <p>Actualiza tu información de contacto y datos personales</p>
              </div>
              
              <form [formGroup]="profileForm" (ngSubmit)="handleProfileUpdate()" class="profile-form">
                <div class="form-row">
                  <div class="form-group">
                    <label for="nombre">
                      <i class="fas fa-user"></i>
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      formControlName="nombre"
                      placeholder="Tu nombre completo"
                      [class.error]="isFieldInvalid('nombre')"
                    >
                    <div class="error-message" *ngIf="isFieldInvalid('nombre')">
                      <ng-container *ngIf="profileForm.get('nombre')?.errors?.['required']">
                        El nombre es requerido
                      </ng-container>
                      <ng-container *ngIf="profileForm.get('nombre')?.errors?.['minlength']">
                        El nombre debe tener al menos 2 caracteres
                      </ng-container>
                    </div>
                  </div>

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
                    >
                    <div class="error-message" *ngIf="isFieldInvalid('email')">
                      <ng-container *ngIf="profileForm.get('email')?.errors?.['required']">
                        El correo electrónico es requerido
                      </ng-container>
                      <ng-container *ngIf="profileForm.get('email')?.errors?.['email']">
                        Formato de correo inválido
                      </ng-container>
                    </div>
                  </div>
                </div>

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
                    >
                    <div class="error-message" *ngIf="isFieldInvalid('telefono')">
                      <ng-container *ngIf="profileForm.get('telefono')?.errors?.['pattern']">
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
                    >
                  </div>
                </div>

                <button
                  type="submit"
                  class="btn-profile"
                  [disabled]="profileForm.invalid || isProfileLoading"
                >
                  <span class="loading-spinner" *ngIf="isProfileLoading">
                    <i class="fas fa-spinner fa-spin"></i>
                  </span>
                  <span *ngIf="!isProfileLoading">
                    <i class="fas fa-save"></i>
                    Actualizar Información
                  </span>
                  <span *ngIf="isProfileLoading">Actualizando...</span>
                </button>
              </form>
            </div>
          </div>

          <!-- Security Tab -->
          <div 
            class="tab-content" 
            [class.active]="currentTab === 'security'" 
            id="security-tab"
          >
            <div class="profile-card">
              <div class="card-header">
                <h3><i class="fas fa-shield-alt"></i> Seguridad de la Cuenta</h3>
                <p>Cambia tu contraseña para mantener tu cuenta segura</p>
              </div>

              <div class="security-info">
                <i class="fas fa-lock"></i>
                <h3>Cambiar Contraseña</h3>
                <p>Te recomendamos usar una contraseña fuerte y única</p>
              </div>

              <form [formGroup]="passwordForm" (ngSubmit)="handlePasswordUpdate()" class="profile-form">
                <div class="form-group">
                  <label for="currentPassword">
                    <i class="fas fa-key"></i>
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    formControlName="currentPassword"
                    placeholder="Tu contraseña actual"
                    [class.error]="isPasswordFieldInvalid('currentPassword')"
                  >
                  <div class="error-message" *ngIf="isPasswordFieldInvalid('currentPassword')">
                    La contraseña actual es requerida
                  </div>
                </div>

                <div class="form-group">
                  <label for="newPassword">
                    <i class="fas fa-lock"></i>
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    formControlName="newPassword"
                    placeholder="Tu nueva contraseña"
                    [class.error]="isPasswordFieldInvalid('newPassword')"
                    (input)="updatePasswordStrength()"
                  >
                  
                  <!-- Password Strength Indicator -->
                  <div class="password-strength" *ngIf="passwordForm.get('newPassword')?.value" [class]="passwordStrength.class">
                    <div class="strength-bar">
                      <div class="strength-fill" [style.width.%]="passwordStrength.percentage"></div>
                    </div>
                    <span class="strength-text">{{ passwordStrength.text }}</span>
                  </div>

                  <div class="error-message" *ngIf="isPasswordFieldInvalid('newPassword')">
                    <ng-container *ngIf="passwordForm.get('newPassword')?.errors?.['required']">
                      La nueva contraseña es requerida
                    </ng-container>
                    <ng-container *ngIf="passwordForm.get('newPassword')?.errors?.['minlength']">
                      La contraseña debe tener al menos 8 caracteres
                    </ng-container>
                    <ng-container *ngIf="passwordForm.get('newPassword')?.errors?.['pattern']">
                      La contraseña debe contener mayúsculas, minúsculas y números
                    </ng-container>
                  </div>
                </div>

                <div class="form-group">
                  <label for="confirmNewPassword">
                    <i class="fas fa-lock"></i>
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    formControlName="confirmNewPassword"
                    placeholder="Confirma tu nueva contraseña"
                    [class.error]="isPasswordFieldInvalid('confirmNewPassword')"
                  >
                  <div class="error-message" *ngIf="isPasswordFieldInvalid('confirmNewPassword')">
                    <ng-container *ngIf="passwordForm.get('confirmNewPassword')?.errors?.['required']">
                      Confirma tu nueva contraseña
                    </ng-container>
                    <ng-container *ngIf="passwordForm.get('confirmNewPassword')?.errors?.['passwordMismatch']">
                      Las contraseñas no coinciden
                    </ng-container>
                  </div>
                </div>

                <button
                  type="submit"
                  class="btn-profile"
                  [disabled]="passwordForm.invalid || isPasswordLoading"
                >
                  <span class="loading-spinner" *ngIf="isPasswordLoading">
                    <i class="fas fa-spinner fa-spin"></i>
                  </span>
                  <span *ngIf="!isPasswordLoading">
                    <i class="fas fa-key"></i>
                    Cambiar Contraseña
                  </span>
                  <span *ngIf="isPasswordLoading">Cambiando contraseña...</span>
                </button>
              </form>
            </div>
          </div>

          <!-- Delete Account Tab -->
          <div 
            class="tab-content" 
            [class.active]="currentTab === 'delete'" 
            id="delete-tab"
          >
            <div class="profile-card danger-zone">
              <div class="danger-header">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Zona de Peligro</h3>
                <p>Esta acción no se puede deshacer. Procede con precaución.</p>
              </div>

              <div class="danger-content">
                <h4>Eliminar Cuenta</h4>
                <p>Al eliminar tu cuenta, perderás permanentemente:</p>
                <ul>
                  <li>Tu historial de pedidos</li>
                  <li>Tus datos personales</li>
                  <li>Tus preferencias guardadas</li>
                  <li>Acceso a promociones exclusivas</li>
                </ul>

                <form [formGroup]="deleteForm" (ngSubmit)="handleAccountDeletion()" class="delete-form">
                  <div class="form-group">
                    <label for="deletePassword">
                      <i class="fas fa-key"></i>
                      Confirma tu contraseña para continuar
                    </label>
                    <input
                      type="password"
                      id="deletePassword"
                      formControlName="password"
                      placeholder="Tu contraseña actual"
                      [class.error]="isDeleteFieldInvalid('password')"
                    >
                    <div class="error-message" *ngIf="isDeleteFieldInvalid('password')">
                      La contraseña es requerida para eliminar la cuenta
                    </div>
                  </div>

                  <div class="form-group checkbox-group">
                    <label class="checkbox-label">
                      <input
                        type="checkbox"
                        formControlName="confirmDeletion"
                      >
                      <span class="checkmark"></span>
                      Entiendo que esta acción es irreversible y acepto eliminar mi cuenta permanentemente
                    </label>
                    <div class="error-message" *ngIf="isDeleteFieldInvalid('confirmDeletion')">
                      Debes confirmar que entiendes las consecuencias
                    </div>
                  </div>

                  <button
                    type="submit"
                    class="btn-danger"
                    [disabled]="deleteForm.invalid || isDeleteLoading"
                  >
                    <span class="loading-spinner" *ngIf="isDeleteLoading">
                      <i class="fas fa-spinner fa-spin"></i>
                    </span>
                    <span *ngIf="!isDeleteLoading">
                      <i class="fas fa-trash-alt"></i>
                      Eliminar Cuenta Permanentemente
                    </span>
                    <span *ngIf="isDeleteLoading">Eliminando cuenta...</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .profile-section {
      min-height: 100vh;
      position: relative;
      padding: 120px 0 60px;
      background: linear-gradient(135deg, var(--color-background) 0%, rgba(18, 55, 42, 0.8) 100%);
    }

    .auth-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      opacity: 0.1;
      z-index: 1;
    }

    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 20px;
      position: relative;
      z-index: 2;
    }

    .profile-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .profile-avatar {
      margin-bottom: 20px;
    }

    .profile-avatar i {
      font-size: 80px;
      color: var(--accent-color, #fbceb1);
      background: rgba(251, 206, 177, 0.1);
      border-radius: 50%;
      padding: 20px;
      border: 3px solid rgba(251, 206, 177, 0.3);
    }

    .profile-title {
      font-family: 'Sansita Swashed', cursive;
      font-size: 2.5rem;
      color: white;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .profile-subtitle {
      color: rgba(255, 255, 255, 0.8);
      font-size: 1.1rem;
      margin-bottom: 0;
    }

    .profile-tabs {
      display: flex;
      justify-content: center;
      margin-bottom: 40px;
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
      gap: 0;
    }

    .tab-button {
      background: none;
      border: none;
      padding: 15px 25px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      border-bottom: 3px solid transparent;
    }

    .tab-button:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
    }

    .tab-button.active {
      color: var(--accent-color, #fbceb1);
      border-bottom-color: var(--accent-color, #fbceb1);
    }

    .tab-button.danger {
      color: #ff6b6b;
    }

    .tab-button.danger.active {
      color: #ff4757;
      border-bottom-color: #ff4757;
    }

    .tab-contents {
      position: relative;
    }

    .tab-content {
      display: none;
      animation: fadeIn 0.3s ease-in;
    }

    .tab-content.active {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .profile-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
    }

    .card-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .card-header h3 {
      color: var(--primary-color, #12372a);
      font-size: 1.5rem;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .card-header p {
      color: #666;
      margin: 0;
    }

    .profile-form {
      max-width: 600px;
      margin: 0 auto;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
      font-size: 0.9rem;
    }

    .form-group label i {
      color: var(--primary-color, #12372a);
      width: 16px;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
      box-sizing: border-box;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--primary-color, #12372a);
      box-shadow: 0 0 0 3px rgba(18, 55, 42, 0.1);
    }

    .form-group input.error,
    .form-group textarea.error {
      border-color: #f44336;
      box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
    }

    .error-message {
      color: #f44336;
      font-size: 0.8rem;
      margin-top: 5px;
      display: block;
    }

    .password-strength {
      margin-top: 8px;
    }

    .strength-bar {
      height: 4px;
      background: #e0e0e0;
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 5px;
    }

    .strength-fill {
      height: 100%;
      transition: all 0.3s ease;
      border-radius: 2px;
    }

    .strength-text {
      font-size: 0.8rem;
      font-weight: 500;
    }

    .password-strength.weak .strength-fill {
      background: #f44336;
    }

    .password-strength.fair .strength-fill {
      background: #ff9800;
    }

    .password-strength.good .strength-fill {
      background: #4caf50;
    }

    .password-strength.strong .strength-fill {
      background: #2e7d32;
    }

    .password-strength.weak .strength-text {
      color: #f44336;
    }

    .password-strength.fair .strength-text {
      color: #ff9800;
    }

    .password-strength.good .strength-text {
      color: #4caf50;
    }

    .password-strength.strong .strength-text {
      color: #2e7d32;
    }

    .security-info {
      text-align: center;
      padding: 30px;
      background: rgba(18, 55, 42, 0.05);
      border-radius: 12px;
      margin-bottom: 30px;
      border: 1px solid rgba(18, 55, 42, 0.1);
    }

    .security-info i {
      font-size: 2.5rem;
      color: var(--primary-color, #12372a);
      margin-bottom: 15px;
    }

    .security-info h3 {
      color: var(--primary-color, #12372a);
      margin-bottom: 10px;
      font-size: 1.3rem;
    }

    .security-info p {
      color: #666;
      margin: 0;
    }

    .btn-profile {
      width: 100%;
      padding: 15px;
      background: linear-gradient(135deg, var(--primary-color, #12372a) 0%, #0d2a1f 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .btn-profile:hover:not(:disabled) {
      background: linear-gradient(135deg, #0d2a1f 0%, #081a12 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(18, 55, 42, 0.3);
    }

    .btn-profile:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading-spinner i {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .danger-zone {
      background: rgba(244, 67, 54, 0.05);
      border: 2px solid rgba(244, 67, 54, 0.2);
    }

    .danger-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .danger-header i {
      font-size: 3rem;
      color: #f44336;
      margin-bottom: 15px;
    }

    .danger-header h3 {
      color: #f44336;
      font-size: 1.5rem;
      margin-bottom: 10px;
    }

    .danger-header p {
      color: #666;
      margin: 0;
    }

    .danger-content h4 {
      color: #f44336;
      font-size: 1.2rem;
      margin-bottom: 15px;
    }

    .danger-content p {
      color: #666;
      margin-bottom: 15px;
    }

    .danger-content ul {
      color: #666;
      margin-bottom: 30px;
      padding-left: 20px;
    }

    .danger-content li {
      margin-bottom: 5px;
    }

    .checkbox-group {
      margin-bottom: 20px;
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      cursor: pointer;
      font-size: 0.9rem;
      color: #666;
      line-height: 1.4;
    }

    .checkbox-label input[type="checkbox"] {
      width: auto;
      margin: 0;
      margin-top: 2px;
    }

    .btn-danger {
      width: 100%;
      padding: 15px;
      background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .btn-danger:hover:not(:disabled) {
      background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(244, 67, 54, 0.3);
    }

    .btn-danger:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Header Styles */
    .site-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(18, 55, 42, 0.95);
      backdrop-filter: blur(10px);
      z-index: 1000;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(251, 206, 177, 0.2);
    }

    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: var(--accent-color, #fbceb1);
    }

    .logo-icon-wrapper {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(251, 206, 177, 0.1);
    }

    .logo-icon {
      width: 30px;
      height: 30px;
      object-fit: contain;
    }

    .logo-text {
      font-family: 'Sansita Swashed', cursive;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .main-nav ul {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 2rem;
    }

    .main-nav a {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;
      cursor: pointer;
    }

    .main-nav a:hover,
    .main-nav a.active {
      color: var(--accent-color, #fbceb1);
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 0 15px;
      }

      .profile-card {
        padding: 20px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .profile-tabs {
        flex-direction: column;
        gap: 0;
      }

      .tab-button {
        padding: 12px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .tab-button.active {
        border-bottom-color: var(--accent-color, #fbceb1);
      }

      .header-container {
        padding: 0 1rem;
      }

      .main-nav ul {
        gap: 1rem;
      }

      .logo-text {
        font-size: 1.2rem;
      }
    }
  `]
})
export class UserProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  currentTab = 'info';
  currentUser: User | null = null;
  
  isProfileLoading = false;
  isPasswordLoading = false;
  isDeleteLoading = false;

  passwordStrength = {
    percentage: 0,
    text: 'Ingresa una nueva contraseña',
    class: ''
  };

  profileForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
    direccion: ['']
  });

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    ]],
    confirmNewPassword: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  deleteForm: FormGroup = this.fb.group({
    password: ['', [Validators.required]],
    confirmDeletion: [false, [Validators.requiredTrue]]
  });

  ngOnInit(): void {
    this.loadUserProfile();
  }

  passwordMatchValidator(control: AbstractControl): Record<string, boolean> | null {
    const newPassword = control.get('newPassword');
    const confirmNewPassword = control.get('confirmNewPassword');
    
    if (!newPassword || !confirmNewPassword) {
      return null;
    }
    
    if (confirmNewPassword.value && newPassword.value !== confirmNewPassword.value) {
      confirmNewPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      const errors = confirmNewPassword.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        if (Object.keys(errors).length === 0) {
          confirmNewPassword.setErrors(null);
        }
      }
    }
    
    return null;
  }

  loadUserProfile(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user: User | null) => {
        this.currentUser = user;
        if (this.currentUser) {
          this.profileForm.patchValue({
            nombre: this.currentUser.nombre,
            email: this.currentUser.email,
            telefono: this.currentUser.telefono || '',
            direccion: this.currentUser.direccion || ''
          });
        } else {
          // Redirect to login if no user
          this.router.navigate(['/auth/login']);
        }
      },
      error: () => {
        // Redirect to login if error
        this.router.navigate(['/auth/login']);
      }
    });
  }

  switchTab(tabId: string): void {
    this.currentTab = tabId;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isPasswordFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isDeleteFieldInvalid(fieldName: string): boolean {
    const field = this.deleteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  updatePasswordStrength(): void {
    const password = this.passwordForm.get('newPassword')?.value || '';
    const strength = this.calculatePasswordStrength(password);
    
    if (password.length === 0) {
      this.passwordStrength = {
        percentage: 0,
        text: 'Ingresa una nueva contraseña',
        class: ''
      };
      return;
    }

    switch (strength.level) {
      case 1:
        this.passwordStrength = {
          percentage: 25,
          text: 'Contraseña débil',
          class: 'weak'
        };
        break;
      case 2:
        this.passwordStrength = {
          percentage: 50,
          text: 'Contraseña regular',
          class: 'fair'
        };
        break;
      case 3:
        this.passwordStrength = {
          percentage: 75,
          text: 'Contraseña buena',
          class: 'good'
        };
        break;
      case 4:
        this.passwordStrength = {
          percentage: 100,
          text: 'Contraseña fuerte',
          class: 'strong'
        };
        break;
    }
  }

  private calculatePasswordStrength(password: string): PasswordStrength {
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

  async handleProfileUpdate(): Promise<void> {
    if (this.profileForm.invalid) {
      this.markProfileFieldsAsTouched();
      return;
    }

    this.isProfileLoading = true;
    const formData = this.profileForm.value;

    try {
      const result = await this.authService.updateProfile(formData).toPromise();
      
      if (result && result.success) {
        this.notificationService.show(
          result.message || 'Perfil actualizado correctamente',
          'success'
        );
        this.loadUserProfile(); // Reload user data
      } else {
        this.notificationService.show(
          result?.message || 'Error al actualizar el perfil',
          'danger'
        );
      }
    } catch (error: unknown) {
      console.error('Profile update error:', error);
      this.notificationService.show(
        error instanceof Error ? error.message : 'Error de conexión. Por favor intenta de nuevo.',
        'danger'
      );
    } finally {
      this.isProfileLoading = false;
    }
  }

  async handlePasswordUpdate(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.markPasswordFieldsAsTouched();
      return;
    }

    this.isPasswordLoading = true;
    const formData = this.passwordForm.value;

    try {
      // Mock implementation for demo
      this.notificationService.show(
        'Cambio de contraseña no disponible en modo demo',
        'info'
      );
      this.passwordForm.reset();
    } catch (error: any) {
      console.error('Password update error:', error);
      this.notificationService.show(
        error.message || 'Error de conexión. Por favor intenta de nuevo.',
        'danger'
      );
    } finally {
      this.isPasswordLoading = false;
    }
  }

  async handleAccountDeletion(): Promise<void> {
    if (this.deleteForm.invalid) {
      this.markDeleteFieldsAsTouched();
      return;
    }

    // Additional confirmation
    const confirmed = confirm(
      '¿Estás absolutamente seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.'
    );
    
    if (!confirmed) {
      return;
    }

    this.isDeleteLoading = true;
    const password = this.deleteForm.get('password')?.value;

    try {
      // Mock implementation for demo
      this.notificationService.show(
        'Eliminación de cuenta no disponible en modo demo',
        'info'
      );
    } catch (error: any) {
      console.error('Account deletion error:', error);
      this.notificationService.show(
        error.message || 'Error de conexión. Por favor intenta de nuevo.',
        'danger'
      );
    } finally {
      this.isDeleteLoading = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  private markProfileFieldsAsTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      this.profileForm.get(key)?.markAsTouched();
    });
  }

  private markPasswordFieldsAsTouched(): void {
    Object.keys(this.passwordForm.controls).forEach(key => {
      this.passwordForm.get(key)?.markAsTouched();
    });
  }

  private markDeleteFieldsAsTouched(): void {
    Object.keys(this.deleteForm.controls).forEach(key => {
      this.deleteForm.get(key)?.markAsTouched();
    });
  }
}