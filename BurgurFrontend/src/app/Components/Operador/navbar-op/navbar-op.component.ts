import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar-op',
  templateUrl: './navbar-op.component.html',
  styleUrls: ['./navbar-op.component.css']
})
export class NavbarOpComponent {

  constructor(private router: Router) {}

  logout(): void {
    // Limpiar datos de sesión del operador
    localStorage.removeItem('operadorId');
    localStorage.removeItem('operadorCedula');
    
    // Redirigir al login de operador
    this.router.navigate(['/operador/login']);
  }
}
