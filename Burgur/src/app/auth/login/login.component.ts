import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  validateForm() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return false;
    }

    const formData = this.loginForm.value;
    
    if (!formData.email || !formData.password) {
      this.notificationService.showError('Por favor, completa todos los campos');
      return false;
    }

    return true;
  }

  onSubmit() {
    if (!this.validateForm()) return;

    this.isLoading = true;
    const formData = this.loginForm.value;

    // Simulate login process
    setTimeout(() => {
      console.log('Login attempt:', formData);
      
      // Here you would typically call the auth service
      // For now, we'll just simulate a successful login
      
      this.isLoading = false;
      
      // Redirect to menu page after successful login
      this.router.navigate(['/menu']);
    }, 2000);
  }
}
