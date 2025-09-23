import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  passwordStrength = {
    percentage: 0,
    text: 'Ingresa una contraseña',
    class: ''
  };
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      apellido: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      direccion: ['', [Validators.required, Validators.maxLength(200)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Watch password changes for strength indicator
    this.registerForm.get('password')?.valueChanges.subscribe(password => {
      this.updatePasswordStrength(password);
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    return null;
  }

  onSubmit() {
    if (this.isLoading || this.registerForm.invalid) return;

    this.isLoading = true;

    const formData = this.registerForm.value;

    // Simulate registration process
    setTimeout(() => {
      console.log('Registration attempt:', formData);
      
      // Here you would typically call a registration service
      // For now, we'll just simulate a successful registration
      
      this.isLoading = false;
      
      // Redirect to login page after successful registration
      this.router.navigate(['/auth/login']);
    }, 2000);
  }

  passwordsMatch(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  updatePasswordStrength(password: string) {
    let strength = 0;
    let text = 'Muy débil';
    let className = 'weak';

    if (!password || password.length === 0) {
      this.passwordStrength = {
        percentage: 0,
        text: 'Ingresa una contraseña',
        class: ''
      };
      return;
    }

    // Length check
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;

    // Character variety checks
    if (/[a-z]/.test(password)) strength += 12.5;
    if (/[A-Z]/.test(password)) strength += 12.5;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;

    // Determine strength level
    if (strength < 25) {
      text = 'Muy débil';
      className = 'very-weak';
    } else if (strength < 50) {
      text = 'Débil';
      className = 'weak';
    } else if (strength < 75) {
      text = 'Moderada';
      className = 'moderate';
    } else if (strength < 100) {
      text = 'Fuerte';
      className = 'strong';
    } else {
      text = 'Muy fuerte';
      className = 'very-strong';
    }

    this.passwordStrength = {
      percentage: strength,
      text: text,
      class: className
    };
  }
}
