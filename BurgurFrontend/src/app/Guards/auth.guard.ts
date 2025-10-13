import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ClienteService } from '../Service/Cliente/cliente.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private clienteService: ClienteService, private router: Router) {}

  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const isLogged = !!this.clienteService.getCurrentCliente();
    if (isLogged) return true;
    return this.router.parseUrl('/login');
  }
}