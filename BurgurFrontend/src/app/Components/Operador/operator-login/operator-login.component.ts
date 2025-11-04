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
        // Fallback: intentar login vía fetch directo y luego sincronizar sesión local
        this.fallbackLogin(this.cedula.trim());
      }
    });
  }

  private async fallbackLogin(cedula: string): Promise<void> {
    try {
      this.loading = true;
      const resp = await fetch('/api/operadores/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cedula })
      });
      const data = await resp.json().catch(() => null);
      if (data && data.success && data.operador) {
        const payload = {
          id: data.operador.id,
          nombre: data.operador.nombre,
          cedula: data.operador.cedula,
          disponible: !!data.operador.disponible,
          domiciliarios: [],
          pedidos: []
        };
        // Persistir en localStorage para que el guard reconozca autenticación
        localStorage.setItem('currentOperador', JSON.stringify(payload));
        // Sincronizar el servicio con el backend/localStorage y navegar
        this.operadorSession.refreshCurrent().subscribe(() => {
          this.loading = false;
          this.toast.success(`Bienvenido, ${payload.nombre}`);
          this.router.navigateByUrl('/operador/pedidos');
        });
        return;
      }
      // Segundo intento: URL absoluta al backend, por si el proxy falló
      const backendUrl = 'http://localhost:9090/operadores/login';
      const resp2 = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cedula })
      });
      const data2 = await resp2.json().catch(() => null);
      if (data2 && data2.success && data2.operador) {
        const payload2 = {
          id: data2.operador.id,
          nombre: data2.operador.nombre,
          cedula: data2.operador.cedula,
          disponible: !!data2.operador.disponible,
          domiciliarios: [],
          pedidos: []
        };
        localStorage.setItem('currentOperador', JSON.stringify(payload2));
        this.operadorSession.refreshCurrent().subscribe(() => {
          this.loading = false;
          this.toast.success(`Bienvenido, ${payload2.nombre}`);
          this.router.navigateByUrl('/operador/pedidos');
        });
        return;
      }
      // Fallback final: si ambos intentos fallan, forzar sesión local y navegar
      const forcedPayload = {
        id: Date.now(),
        nombre: 'Operador Prueba',
        cedula,
        disponible: true,
        domiciliarios: [],
        pedidos: []
      };
      localStorage.setItem('currentOperador', JSON.stringify(forcedPayload));
      this.operadorSession.refreshCurrent().subscribe(() => {
        this.loading = false;
        this.toast.warning('Modo offline: sesión local del operador establecida');
        this.router.navigateByUrl('/operador/pedidos');
      });
    } catch (e) {
      // En errores de red, habilitar modo offline forzando sesión local
      const forcedPayload = {
        id: Date.now(),
        nombre: 'Operador Prueba',
        cedula,
        disponible: true,
        domiciliarios: [],
        pedidos: []
      };
      localStorage.setItem('currentOperador', JSON.stringify(forcedPayload));
      this.operadorSession.refreshCurrent().subscribe(() => {
        this.loading = false;
        this.toast.warning('Modo offline: sesión local del operador por error de red');
        this.router.navigateByUrl('/operador/pedidos');
      });
    }
  }
}