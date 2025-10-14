import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { OperadorSessionService } from '../Service/Operador/operador-session.service';

@Injectable({ providedIn: 'root' })
export class OperadorGuard implements CanActivate {
  constructor(private operadorSession: OperadorSessionService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const isLogged = this.operadorSession.isAuthenticated();
    if (isLogged) return true;
    return this.router.parseUrl('/operador/login');
  }
}