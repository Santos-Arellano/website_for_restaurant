import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  role: 'user' | 'admin' | 'domiciliario';
  fechaRegistro: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
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
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);

  // Usuarios de ejemplo para desarrollo
  private users: User[] = [
    {
      id: 1,
      nombre: 'Admin Usuario',
      email: 'admin@burgerclub.com',
      role: 'admin',
      fechaRegistro: new Date('2024-01-01')
    },
    {
      id: 2,
      nombre: 'Juan Pérez',
      email: 'juan@email.com',
      telefono: '123456789',
      direccion: 'Calle 123 #45-67',
      role: 'user',
      fechaRegistro: new Date('2024-02-15')
    },
    {
      id: 3,
      nombre: 'María García',
      email: 'maria@email.com',
      role: 'domiciliario',
      fechaRegistro: new Date('2024-03-01')
    }
  ];

  constructor(private router: Router) {
    this.loadUserFromStorage();
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  login(credentials: LoginCredentials): Observable<{ success: boolean; message: string; user?: User }> {
    // Simulación de login - en producción esto sería una llamada HTTP
    const user = this.users.find(u => u.email === credentials.email);
    
    if (user && credentials.password === 'password123') { // Password simple para desarrollo
      this.setCurrentUser(user);
      return of({ 
        success: true, 
        message: 'Login exitoso', 
        user 
      });
    } else {
      return of({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }
  }

  register(registerData: RegisterData): Observable<{ success: boolean; message: string; user?: User }> {
    // Verificar si el email ya existe
    const existingUser = this.users.find(u => u.email === registerData.email);
    
    if (existingUser) {
      return of({ 
        success: false, 
        message: 'El email ya está registrado' 
      });
    }

    // Crear nuevo usuario
    const newUser: User = {
      id: this.users.length + 1,
      nombre: registerData.nombre,
      email: registerData.email,
      telefono: registerData.telefono,
      direccion: registerData.direccion,
      role: 'user',
      fechaRegistro: new Date()
    };

    this.users.push(newUser);
    this.setCurrentUser(newUser);

    return of({ 
      success: true, 
      message: 'Registro exitoso', 
      user: newUser 
    });
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.removeUserFromStorage();
    this.router.navigate(['/']);
  }

  updateProfile(userData: Partial<User>): Observable<{ success: boolean; message: string; user?: User }> {
    const currentUser = this.currentUserSubject.value;
    
    if (!currentUser) {
      return of({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
    }

    // Actualizar usuario en la lista
    const userIndex = this.users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      const updatedUser = { ...this.users[userIndex], ...userData };
      this.users[userIndex] = updatedUser;
      this.setCurrentUser(updatedUser);
      
      return of({ 
        success: true, 
        message: 'Perfil actualizado exitosamente', 
        user: updatedUser 
      });
    }

    return of({ 
      success: false, 
      message: 'Error al actualizar el perfil' 
    });
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'admin' || false;
  }

  isDomiciliario(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'domiciliario' || false;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role || false;
  }

  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    this.isLoggedInSubject.next(true);
    this.saveUserToStorage(user);
  }

  private saveUserToStorage(user: User): void {
    try {
      localStorage.setItem('burger-club-user', JSON.stringify(user));
    } catch (error) {
      console.warn('No se pudo guardar el usuario en localStorage:', error);
    }
  }

  private loadUserFromStorage(): void {
    try {
      const savedUser = localStorage.getItem('burger-club-user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
      }
    } catch (error) {
      console.warn('No se pudo cargar el usuario desde localStorage:', error);
    }
  }

  private removeUserFromStorage(): void {
    try {
      localStorage.removeItem('burger-club-user');
    } catch (error) {
      console.warn('No se pudo eliminar el usuario de localStorage:', error);
    }
  }

  // Método para obtener todos los usuarios (solo para admin)
  getAllUsers(): Observable<User[]> {
    if (this.isAdmin()) {
      return of([...this.users]);
    }
    return of([]);
  }

  // Método para eliminar usuario (solo para admin)
  deleteUser(userId: number): Observable<{ success: boolean; message: string }> {
    if (!this.isAdmin()) {
      return of({ 
        success: false, 
        message: 'No tienes permisos para esta acción' 
      });
    }

    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users.splice(userIndex, 1);
      return of({ 
        success: true, 
        message: 'Usuario eliminado exitosamente' 
      });
    }

    return of({ 
      success: false, 
      message: 'Usuario no encontrado' 
    });
  }
}
