import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Interfaces
export interface AdminItem {
  id: number;
  [key: string]: any;
}

export interface Product extends AdminItem {
  nombre: string;
  categoria: string;
  precio: number;
  descripcion?: string;
  imagen?: string;
  disponible: boolean;
  destacado?: boolean;
}

export interface Adicional extends AdminItem {
  nombre: string;
  precio: number;
  categoria: string;
  disponible: boolean;
}

export interface Cliente extends AdminItem {
  nombre: string;
  email: string;
  telefono: string;
  direccion?: string;
  fechaRegistro: Date;
}

export interface Domiciliario extends AdminItem {
  nombre: string;
  telefono: string;
  vehiculo: string;
  activo: boolean;
  zona?: string;
}

export interface SearchResult {
  items: AdminItem[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly baseUrl = '/api/admin';
  
  // Subjects for real-time updates
  private refreshSubject = new BehaviorSubject<string>('');
  private searchSubject = new BehaviorSubject<{ term: string; section: string }>({ term: '', section: '' });
  private filterSubject = new BehaviorSubject<{ category: string; section: string }>({ category: '', section: '' });

  // Public observables
  refresh$ = this.refreshSubject.asObservable();
  search$ = this.searchSubject.asObservable();
  filter$ = this.filterSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ==========================================
  // CRUD OPERATIONS
  // ==========================================

  getItems(section: string, page = 1, limit = 50): Observable<SearchResult> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<SearchResult>(`${this.baseUrl}/${section}`, { params })
      .pipe(
        catchError(error => {
          console.error(`Error fetching ${section}:`, error);
          return of({ items: [], total: 0, page: 1, limit: 50 });
        })
      );
  }

  getItem(id: number, section: string): Observable<AdminItem> {
    return this.http.get<AdminItem>(`${this.baseUrl}/${section}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching ${section} item ${id}:`, error);
          throw error;
        })
      );
  }

  createItem(item: Partial<AdminItem>, section: string): Observable<AdminItem> {
    return this.http.post<AdminItem>(`${this.baseUrl}/${section}`, item)
      .pipe(
        catchError(error => {
          console.error(`Error creating ${section} item:`, error);
          throw error;
        })
      );
  }

  updateItem(id: number, item: Partial<AdminItem>, section: string): Observable<AdminItem> {
    return this.http.put<AdminItem>(`${this.baseUrl}/${section}/${id}`, item)
      .pipe(
        catchError(error => {
          console.error(`Error updating ${section} item ${id}:`, error);
          throw error;
        })
      );
  }

  deleteItem(id: number, section: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${section}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error deleting ${section} item ${id}:`, error);
          throw error;
        })
      );
  }

  // ==========================================
  // SEARCH AND FILTER OPERATIONS
  // ==========================================

  searchItems(searchTerm: string, section: string): Observable<AdminItem[]> {
    if (!searchTerm.trim()) {
      return this.getItems(section).pipe(
        map(result => result.items)
      );
    }

    const params = new HttpParams()
      .set('search', searchTerm.trim())
      .set('limit', '100');

    this.searchSubject.next({ term: searchTerm, section });

    return this.http.get<SearchResult>(`${this.baseUrl}/${section}/search`, { params })
      .pipe(
        map(result => result.items),
        catchError(error => {
          console.error(`Error searching ${section}:`, error);
          return of([]);
        })
      );
  }

  filterByCategory(category: string, section: string): Observable<AdminItem[]> {
    if (!category) {
      return this.getItems(section).pipe(
        map(result => result.items)
      );
    }

    const params = new HttpParams()
      .set('category', category)
      .set('limit', '100');

    this.filterSubject.next({ category, section });

    return this.http.get<SearchResult>(`${this.baseUrl}/${section}/filter`, { params })
      .pipe(
        map(result => result.items),
        catchError(error => {
          console.error(`Error filtering ${section} by category:`, error);
          return of([]);
        })
      );
  }

  clearFilters(section: string): void {
    this.searchSubject.next({ term: '', section });
    this.filterSubject.next({ category: '', section });
  }

  // ==========================================
  // SPECIALIZED OPERATIONS
  // ==========================================

  // Products
  getProducts(): Observable<Product[]> {
    return this.getItems('productos').pipe(
      map(result => result.items as Product[])
    );
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.filterByCategory(category, 'productos').pipe(
      map(items => items as Product[])
    );
  }

  toggleProductAvailability(id: number): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/productos/${id}/toggle-availability`, {});
  }

  toggleProductFeatured(id: number): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/productos/${id}/toggle-featured`, {});
  }

  // Adicionales
  getAdicionales(): Observable<Adicional[]> {
    return this.getItems('adicionales').pipe(
      map(result => result.items as Adicional[])
    );
  }

  getAdicionalesByCategory(category: string): Observable<Adicional[]> {
    return this.filterByCategory(category, 'adicionales').pipe(
      map(items => items as Adicional[])
    );
  }

  // Clientes
  getClientes(): Observable<Cliente[]> {
    return this.getItems('clientes').pipe(
      map(result => result.items as Cliente[])
    );
  }

  getClientesByDateRange(startDate: Date, endDate: Date): Observable<Cliente[]> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.get<SearchResult>(`${this.baseUrl}/clientes/date-range`, { params })
      .pipe(
        map(result => result.items as Cliente[])
      );
  }

  // Domiciliarios
  getDomiciliarios(): Observable<Domiciliario[]> {
    return this.getItems('domiciliarios').pipe(
      map(result => result.items as Domiciliario[])
    );
  }

  getActiveDomiciliarios(): Observable<Domiciliario[]> {
    const params = new HttpParams().set('active', 'true');
    
    return this.http.get<SearchResult>(`${this.baseUrl}/domiciliarios`, { params })
      .pipe(
        map(result => result.items as Domiciliario[])
      );
  }

  toggleDomiciliarioStatus(id: number): Observable<Domiciliario> {
    return this.http.patch<Domiciliario>(`${this.baseUrl}/domiciliarios/${id}/toggle-status`, {});
  }

  // ==========================================
  // STATISTICS AND ANALYTICS
  // ==========================================

  getAdminStats(section: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${section}/stats`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching ${section} stats:`, error);
          return of({});
        })
      );
  }

  getDashboardData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard`)
      .pipe(
        catchError(error => {
          console.error('Error fetching dashboard data:', error);
          return of({
            totalProducts: 0,
            totalClientes: 0,
            totalDomiciliarios: 0,
            totalAdicionales: 0,
            recentOrders: [],
            popularProducts: []
          });
        })
      );
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  refreshView(section: string): void {
    this.refreshSubject.next(section);
  }

  // Validation helpers
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Data formatting helpers
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }

  // File upload helper
  uploadImage(file: File, section: string): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('section', section);

    return this.http.post<{ url: string }>(`${this.baseUrl}/upload`, formData)
      .pipe(
        catchError(error => {
          console.error('Error uploading image:', error);
          throw error;
        })
      );
  }
}