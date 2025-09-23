import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.router.navigate(['/menu']);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    try {
      this.authService.login({ email, password }).subscribe({
        next: (result) => {
          if (result.success) {
            this.showNotification('Inicio de sesión exitoso', 'success');
            setTimeout(() => {
              this.router.navigate(['/menu']);
            }, 1500);
          } else {
            this.errorMessage = result.message || 'Credenciales inválidas. Por favor verifica tu email y contraseña.';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Login error:', error);
          this.errorMessage = 'Error de conexión. Por favor intenta de nuevo.';
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Login error:', error);
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
    }, 4000);
  }
}
