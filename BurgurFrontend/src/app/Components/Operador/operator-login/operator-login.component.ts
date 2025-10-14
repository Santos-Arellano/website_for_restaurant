import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OperadorSessionService } from '../../../Service/Operador/operador-session.service';
import { ToastService } from '../../Shared/toast/toast.service';

@Component({
  selector: 'app-operator-login',
  templateUrl: './operator-login.component.html',
  styleUrls: ['./operator-login.component.css']
})
export class OperatorLoginComponent {
  cedula: string = '';
  loading: boolean = false;

  constructor(
    private operadorSession: OperadorSessionService,
    private router: Router,
    private toast: ToastService
  ) {}

  login(): void {
    if (!this.cedula || this.cedula.trim().length < 3) {
      this.toast.warning('Ingrese una cédula válida');
      return;
    }
    this.loading = true;
    this.operadorSession.login(this.cedula.trim()).subscribe((op) => {
      this.loading = false;
      if (op) {
        this.toast.success(`Bienvenido, ${op.nombre}`);
        this.router.navigateByUrl('/operador/pedidos');
      } else {
        this.toast.error('Credenciales inválidas o operador no encontrado');
      }
    });
  }
}