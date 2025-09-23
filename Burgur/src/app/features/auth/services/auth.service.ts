import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

// Interfaces
export interface User {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fechaRegistro?: string;
  activo?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  direccion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = '/auth';
  private readonly TOKEN_KEY = 'burger_club_token';
  private readonly USER_KEY = 'burger_club_user';

  // State management
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Check token validity on service initialization
    this.validateStoredToken();
  }

  // Authentication Methods
  login(email: string, password: string, rememberMe = false): Observable<AuthResponse> {
    const loginData: LoginRequest = { email, password, rememberMe };

    return this.http.post<AuthResponse>(`${this.API_URL}/login`, loginData, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success && response.user && response.token) {
          this.setAuthData(response.user, response.token, rememberMe);
        }
      }),
      catchError(this.handleError)
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success && response.user && response.token) {
          this.setAuthData(response.user, response.token, false);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/logout`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        this.clearAuthData();
      }),
      catchError(() => {
        // Even if logout fails on server, clear local data
        this.clearAuthData();
        return throwError(() => new Error('Logout failed'));
      })
    );
  }

  // Social Authentication
  loginWithGoogle(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.API_URL}/google`).pipe(
      tap(response => {
        if (response.success && response.user && response.token) {
          this.setAuthData(response.user, response.token, false);
        }
      }),
      catchError(this.handleError)
    );
  }

  loginWithFacebook(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.API_URL}/facebook`).pipe(
      tap(response => {
        if (response.success && response.user && response.token) {
          this.setAuthData(response.user, response.token, false);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Password Management
  forgotPassword(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/forgot-password`, { email }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  resetPassword(token: string, newPassword: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/reset-password`, {
      token,
      password: newPassword
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/change-password`, {
      currentPassword,
      newPassword
    }, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Profile Management
  updateProfile(userData: Partial<User>): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.API_URL}/profile`, userData, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success && response.user) {
          this.updateUserData(response.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<{ user: User }>(`${this.API_URL}/current`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.user),
      tap(user => {
        this.updateUserData(user);
      }),
      catchError(this.handleError)
    );
  }

  deleteAccount(): Observable<AuthResponse> {
    return this.http.delete<AuthResponse>(`${this.API_URL}/account`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.clearAuthData();
        }
      }),
      catchError(this.handleError)
    );
  }

  // Token Management
  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.setToken(response.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  // Private Methods
  private setAuthData(user: User, token: string, rememberMe: boolean): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    storage.setItem(this.TOKEN_KEY, token);
    storage.setItem(this.USER_KEY, JSON.stringify(user));
    
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    this.router.navigate(['/auth/login']);
  }

  private updateUserData(user: User): void {
    const storage = this.getToken() ? 
      (localStorage.getItem(this.TOKEN_KEY) ? localStorage : sessionStorage) : 
      sessionStorage;
    
    storage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private setToken(token: string): void {
    const storage = localStorage.getItem(this.TOKEN_KEY) ? localStorage : sessionStorage;
    storage.setItem(this.TOKEN_KEY, token);
  }

  private getUserFromStorage(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Basic token validation (you might want to add JWT validation here)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  private validateStoredToken(): void {
    if (!this.hasValidToken()) {
      this.clearAuthData();
    }
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError = (error: any): Observable<never> => {
    console.error('Auth Service Error:', error);
    
    let errorMessage = 'Ha ocurrido un error inesperado';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 401) {
      errorMessage = 'Credenciales inválidas';
      this.clearAuthData();
    } else if (error.status === 403) {
      errorMessage = 'Acceso denegado';
    } else if (error.status === 404) {
      errorMessage = 'Servicio no encontrado';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor';
    } else if (error.status === 0) {
      errorMessage = 'Error de conexión. Verifica tu conexión a internet';
    }
    
    return throwError(() => new Error(errorMessage));
  };
}