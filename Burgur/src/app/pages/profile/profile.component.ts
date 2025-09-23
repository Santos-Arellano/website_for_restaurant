import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  activeTab: 'info' | 'security' | 'delete' = 'info';
  
  // Forms
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  deleteForm!: FormGroup;
  
  // Loading states
  isUpdatingProfile = false;
  isUpdatingPassword = false;
  isDeletingAccount = false;
  
  // Password strength
  passwordStrength = 0;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.setupPasswordStrengthCheck();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeForms(): void {
    // Profile form
    this.profileForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      apellido: ['', [Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      telefono: ['', [Validators.maxLength(20)]],
      direccion: ['', [Validators.maxLength(200)]]
    });

    // Password form
    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Delete form
    this.deleteForm = this.fb.group({
      deletePassword: ['', [Validators.required]],
      confirmDelete: [false, [Validators.requiredTrue]]
    });
  }

  private loadCurrentUser(): void {
    const userSub = this.authService.getCurrentUser().subscribe(
      (user: User | null) => {
        this.currentUser = user;
        if (user) {
          this.profileForm.patchValue({
            nombre: user.nombre,
            apellido: user.nombre.split(' ')[1] || '', // Assuming full name is stored in nombre
            email: user.email,
            telefono: user.telefono || '',
            direccion: user.direccion || ''
          });
        }
      }
    );
    this.subscriptions.push(userSub);
  }

  private setupPasswordStrengthCheck(): void {
    const passwordControl = this.passwordForm.get('newPassword');
    if (passwordControl) {
      const passwordSub = passwordControl.valueChanges.subscribe(
        (password: string) => {
          this.passwordStrength = this.calculatePasswordStrength(password);
        }
      );
      this.subscriptions.push(passwordSub);
    }
  }

  private calculatePasswordStrength(password: string): number {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    
    return Math.min(strength, 100);
  }

  private passwordMatchValidator(control: AbstractControl): Record<string, any> | null {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmNewPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { mismatch: true };
  }

  // Tab management
  setActiveTab(tab: 'info' | 'security' | 'delete'): void {
    this.activeTab = tab;
  }

  // Profile update
  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.isUpdatingProfile = true;
    const formData = this.profileForm.value;
    
    const updateSub = this.authService.updateProfile(formData).subscribe(
      (response) => {
        this.isUpdatingProfile = false;
        if (response.success) {
          this.notificationService.showSuccess('Perfil actualizado correctamente');
          // Reload user data
          this.loadCurrentUser();
        } else {
          this.notificationService.showError(response.message || 'Error al actualizar el perfil');
        }
      },
      (error) => {
        this.isUpdatingProfile = false;
        console.error('Error updating profile:', error);
        this.notificationService.showError('Error al actualizar el perfil');
      }
    );
    this.subscriptions.push(updateSub);
  }

  // Password update
  updatePassword(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    this.isUpdatingPassword = true;
    const newPassword = this.passwordForm.get('newPassword')?.value;
    
    // Simulate password update (replace with actual service call)
    setTimeout(() => {
      this.isUpdatingPassword = false;
      this.notificationService.showSuccess('Contraseña actualizada correctamente');
      this.passwordForm.reset();
      this.passwordStrength = 0;
    }, 2000);
  }

  // Account deletion
  deleteAccount(): void {
    if (this.deleteForm.invalid) {
      this.markFormGroupTouched(this.deleteForm);
      return;
    }

    // Show confirmation dialog
    if (!confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      return;
    }

    this.isDeletingAccount = true;
    const deletePassword = this.deleteForm.get('deletePassword')?.value;
    
    // Simulate account deletion (replace with actual service call)
    setTimeout(() => {
      this.isDeletingAccount = false;
      this.notificationService.showSuccess('Cuenta eliminada correctamente');
      this.authService.logout();
      this.router.navigate(['/']);
    }, 2000);
  }

  // Utility methods
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getPasswordStrengthText(): string {
    if (this.passwordStrength < 30) return 'Muy débil';
    if (this.passwordStrength < 50) return 'Débil';
    if (this.passwordStrength < 70) return 'Regular';
    if (this.passwordStrength < 90) return 'Fuerte';
    return 'Muy fuerte';
  }

  getPasswordStrengthClass(): string {
    if (this.passwordStrength < 30) return 'very-weak';
    if (this.passwordStrength < 50) return 'weak';
    if (this.passwordStrength < 70) return 'fair';
    if (this.passwordStrength < 90) return 'strong';
    return 'very-strong';
  }
}