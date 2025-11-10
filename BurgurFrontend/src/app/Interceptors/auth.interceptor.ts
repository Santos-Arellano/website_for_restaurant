import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastService } from '../Components/Shared/toast/toast.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private toast: ToastService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isApi = req.url.startsWith('/api');
    let cloned = req;
    if (isApi) {
      const token = (() => { try { return localStorage.getItem('jwtToken'); } catch { return null; } })();
      const headers = token ? req.headers.set('Authorization', `Bearer ${token}`) : req.headers;
      cloned = req.clone({ withCredentials: true, headers });
    }
    return next.handle(cloned).pipe(
      catchError((error: any) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.toast.warning('Sesión expirada. Inicia sesión nuevamente.', 4000);
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}