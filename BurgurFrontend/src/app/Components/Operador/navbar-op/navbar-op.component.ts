import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OperadorSessionService } from '../../../Service/Operador/operador-session.service';

@Component({
  selector: 'app-navbar-op',
  templateUrl: './navbar-op.component.html',
  styleUrls: ['./navbar-op.component.css']
})
export class NavbarOpComponent {

  constructor(private router: Router, private operadorSession: OperadorSessionService) {}

  logout(): void {
    // Usar el servicio para cerrar sesión y limpiar almacenamiento de forma consistente
    this.operadorSession.logout().subscribe(() => {
      // Limpieza defensiva de posibles claves usadas en versiones previas
      try {
        localStorage.removeItem('operadorId');
        localStorage.removeItem('operadorCedula');
      } catch {}
      // Redirigir al login de operador
      this.router.navigate(['/operador/login']);
    });
  }
}
