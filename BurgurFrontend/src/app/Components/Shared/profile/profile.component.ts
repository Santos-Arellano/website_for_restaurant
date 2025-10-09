import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClienteService } from '../../../Service/Cliente/cliente.service';
import { Cliente, ClienteRegistro } from '../../../Model/Cliente/cliente';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentCliente: Cliente | null = null;
  isEditing: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Formulario de edición
  editForm: Partial<ClienteRegistro> = {
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    direccion: ''
  };
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private clienteService: ClienteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Primero obtener el cliente actual del localStorage
    const currentCliente = this.clienteService.getCurrentCliente();
    if (currentCliente) {
      this.currentCliente = currentCliente;
      this.editForm = {
        nombre: currentCliente.nombre,
        apellido: currentCliente.apellido,
        correo: currentCliente.correo,
        telefono: currentCliente.telefono,
        direccion: currentCliente.direccion
      };
    }

    // Suscribirse a cambios futuros
    this.subscriptions.add(
      this.clienteService.currentCliente$.subscribe(cliente => {
        this.currentCliente = cliente;
        if (cliente) {
          this.editForm = {
            nombre: cliente.nombre,
            apellido: cliente.apellido,
            correo: cliente.correo,
            telefono: cliente.telefono,
            direccion: cliente.direccion
          };
        }
      })
    );

    // Verificar si el usuario está logueado
    this.subscriptions.add(
      this.clienteService.isLoggedIn().subscribe(loggedIn => {
        if (!loggedIn) {
        this.router.navigate(['/login']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.errorMessage = '';
    this.successMessage = '';
    
    if (!this.isEditing && this.currentCliente) {
      // Restaurar valores originales si se cancela la edición
      this.editForm = {
        nombre: this.currentCliente.nombre,
        apellido: this.currentCliente.apellido,
        correo: this.currentCliente.correo,
        telefono: this.currentCliente.telefono,
        direccion: this.currentCliente.direccion
      };
    }
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateData: Partial<Cliente> = {
      ...this.editForm,
      id: this.currentCliente?.id
    };

    this.clienteService.updateCliente(this.currentCliente!.id, updateData).subscribe({
      next: (clienteActualizado) => {
        this.isLoading = false;
        this.isEditing = false;
        this.successMessage = 'Perfil actualizado correctamente';
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al actualizar el perfil. Inténtalo de nuevo.';
        console.error('Error al actualizar perfil:', error);
      }
    });
  }

  validateForm(): boolean {
    if (!this.editForm.nombre?.trim()) {
      this.errorMessage = 'El nombre es requerido';
      return false;
    }
    
    if (!this.editForm.apellido?.trim()) {
      this.errorMessage = 'El apellido es requerido';
      return false;
    }
    
    if (!this.editForm.correo?.trim()) {
      this.errorMessage = 'El correo es requerido';
      return false;
    }
    
    if (!this.isValidEmail(this.editForm.correo)) {
      this.errorMessage = 'El correo no tiene un formato válido';
      return false;
    }
    
    if (!this.editForm.telefono?.trim()) {
      this.errorMessage = 'El teléfono es requerido';
      return false;
    }
    
    if (!this.editForm.direccion?.trim()) {
      this.errorMessage = 'La dirección es requerida';
      return false;
    }
    
    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    this.clienteService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
