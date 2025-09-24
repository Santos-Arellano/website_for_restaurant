import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ClienteService } from '../../../Service/Cliente/cliente.service';
import { ClienteLogin, ClienteRegistro, Cliente } from '../../../Model/Cliente/cliente';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  isLoginMode = true;
  isLoading = false;
  errorMessage = '';

  // Formulario de login
  loginForm: ClienteLogin = {
    correo: '',
    contrasena: ''
  };

  // Formulario de registro
  registroForm: ClienteRegistro = {
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    telefono: '',
    direccion: ''
  };

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Determinar el modo basado en la ruta
    this.route.url.subscribe(segments => {
      const path = segments[segments.length - 1]?.path;
      this.isLoginMode = path === 'login';
    });
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.resetForms();
    
    // Actualizar la URL
    const newPath = this.isLoginMode ? '/auth/login' : '/auth/register';
    this.router.navigate([newPath]);
  }

  onLogin(): void {
    if (!this.validateLoginForm()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.clienteService.loginCliente(this.loginForm).subscribe({
      next: (cliente: Cliente | null) => {
        this.isLoading = false;
        if (cliente) {
          console.log('Login exitoso:', cliente);
          
          // Verificar si es admin y redirigir apropiadamente
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          if (currentUser.tipo === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        } else {
          this.errorMessage = 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.';
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = 'Error en el sistema. Por favor, intenta de nuevo.';
        console.error('Error en login:', error);
      }
    });
  }

  onRegister(): void {
    if (!this.validateRegistroForm()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.clienteService.registrarCliente(this.registroForm).subscribe({
      next: (cliente: Cliente) => {
        this.isLoading = false;
        console.log('Registro exitoso:', cliente);
        this.router.navigate(['/']);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = 'Error al registrar. Por favor, intenta de nuevo.';
        console.error('Error en registro:', error);
      }
    });
  }

  private validateLoginForm(): boolean {
    if (!this.loginForm.correo || !this.loginForm.contrasena) {
      this.errorMessage = 'Por favor, completa todos los campos.';
      return false;
    }

    if (!this.isValidEmail(this.loginForm.correo)) {
      this.errorMessage = 'Por favor, ingresa un correo válido.';
      return false;
    }

    return true;
  }

  private validateRegistroForm(): boolean {
    const { nombre, apellido, correo, contrasena, telefono, direccion } = this.registroForm;

    if (!nombre || !apellido || !correo || !contrasena || !telefono || !direccion) {
      this.errorMessage = 'Por favor, completa todos los campos.';
      return false;
    }

    if (!this.isValidEmail(correo)) {
      this.errorMessage = 'Por favor, ingresa un correo válido.';
      return false;
    }

    if (contrasena.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private resetForms(): void {
    this.loginForm = { correo: '', contrasena: '' };
    this.registroForm = {
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      telefono: '',
      direccion: ''
    };
  }
}
