import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { ClienteService } from '../Service/Cliente/cliente.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private clienteService: ClienteService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const current = this.clienteService.getCurrentCliente();
    const isAdmin = this.clienteService.isAdmin(current);
    if (isAdmin) return true;
    return this.router.parseUrl('/login');
  }
}