import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Services
import { AdminService } from '../../services/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';

// Interfaces
interface AdminItem {
  id: number;
  [key: string]: any;
}

interface SearchResult {
  term: string;
  count: number;
}

interface FilterResult {
  category: string;
  count: number;
}

@Component({
  selector: 'app-admin-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-manager">
      <!-- Search and Filter Controls -->
      <div class="admin-controls">
        <div class="search-container">
          <input
            type="text"
            id="adminSearchInput"
            class="search-input"
            placeholder="Buscar..."
            [(ngModel)]="searchTerm"
            (input)="onSearchInput($event)"
          >
          <i class="fas fa-search search-icon"></i>
        </div>

        <div class="filter-container" *ngIf="currentSection === 'productos'">
          <select
            id="categoryFilter"
            class="category-filter"
            [(ngModel)]="selectedCategory"
            (change)="onCategoryChange($event)"
          >
            <option value="">Todas las categorías</option>
            <option value="hamburguesa">Hamburguesas</option>
            <option value="acompañamiento">Acompañamientos</option>
            <option value="perro caliente">Perros Calientes</option>
            <option value="bebida">Bebidas</option>
            <option value="postre">Postres</option>
          </select>
        </div>
      </div>

      <!-- Results Info -->
      <div class="results-info" *ngIf="searchResult || filterResult">
        <p *ngIf="searchResult">
          <i class="fas fa-search"></i>
          Mostrando {{ searchResult.count }} resultados para "{{ searchResult.term }}"
        </p>
        <p *ngIf="filterResult">
          <i class="fas fa-filter"></i>
          {{ filterResult.count }} elementos en categoría "{{ filterResult.category }}"
        </p>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="showEmptyState">
        <div class="empty-icon">
          <i class="fas fa-search"></i>
        </div>
        <h3>No se encontraron resultados</h3>
        <p>Intenta con otros términos de búsqueda o filtros</p>
        <button class="btn-clear" (click)="clearFilters()">
          <i class="fas fa-times"></i>
          Limpiar filtros
        </button>
      </div>

      <!-- Loading State -->
      <div class="loading-overlay" *ngIf="isLoading">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>{{ loadingMessage }}</p>
        </div>
      </div>

      <!-- Notification Container -->
      <div class="notification-container" id="notificationContainer"></div>
    </div>
  `,
  styles: [`
    .admin-manager {
      position: relative;
    }

    .admin-controls {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-container {
      position: relative;
      flex: 1;
      min-width: 250px;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 2.5rem 0.75rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary-color, #12372a);
      box-shadow: 0 0 0 3px rgba(18, 55, 42, 0.1);
    }

    .search-icon {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #666;
      pointer-events: none;
    }

    .filter-container {
      min-width: 200px;
    }

    .category-filter {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .category-filter:focus {
      outline: none;
      border-color: var(--primary-color, #12372a);
      box-shadow: 0 0 0 3px rgba(18, 55, 42, 0.1);
    }

    .results-info {
      margin-bottom: 1rem;
      padding: 0.75rem 1rem;
      background: #f8f9fa;
      border-radius: 6px;
      border-left: 4px solid var(--primary-color, #12372a);
    }

    .results-info p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .results-info i {
      margin-right: 0.5rem;
      color: var(--primary-color, #12372a);
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      background: #f8f9fa;
      border-radius: 12px;
      margin: 2rem 0;
    }

    .empty-icon {
      font-size: 3rem;
      color: #ccc;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      color: #666;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #999;
      margin-bottom: 1.5rem;
    }

    .btn-clear {
      background: var(--primary-color, #12372a);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .btn-clear:hover {
      background: var(--primary-dark, #0d2a1f);
      transform: translateY(-1px);
    }

    .btn-clear i {
      margin-right: 0.5rem;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .loading-spinner {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .loading-spinner i {
      font-size: 2rem;
      color: var(--primary-color, #12372a);
      margin-bottom: 1rem;
    }

    .loading-spinner p {
      margin: 0;
      color: #666;
      font-size: 1rem;
    }

    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
    }

    @media (max-width: 768px) {
      .admin-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .search-container,
      .filter-container {
        min-width: auto;
      }

      .empty-state {
        padding: 2rem 1rem;
      }

      .empty-icon {
        font-size: 2rem;
      }
    }
  `]
})
export class AdminManagerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  
  // Injected services
  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Component state
  currentSection = 'dashboard';
  searchTerm = '';
  selectedCategory = '';
  isLoading = false;
  loadingMessage = 'Procesando datos...';
  showEmptyState = false;
  
  // Results tracking
  searchResult: SearchResult | null = null;
  filterResult: FilterResult | null = null;
  visibleItemsCount = 0;
  totalItemsCount = 0;

  ngOnInit(): void {
    this.initializeComponent();
    this.setupSearchDebounce();
    this.setupKeyboardShortcuts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    this.currentSection = this.getCurrentSection();
    console.log(`🔧 Admin Manager initialized for section: ${this.currentSection}`);
  }

  private getCurrentSection(): string {
    const path = this.router.url;
    if (path.includes('/admin/adicionales')) return 'adicionales';
    if (path.includes('/admin/clientes')) return 'clientes';
    if (path.includes('/admin/domiciliarios')) return 'domiciliarios';
    if (path.includes('/admin') || path.includes('/menu/admin')) return 'productos';
    return 'dashboard';
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.handleSearch(searchTerm);
    });
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K para enfocar búsqueda
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('adminSearchInput') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }

      // Escape para limpiar filtros
      if (e.key === 'Escape') {
        this.clearFilters();
      }
    });
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.handleCategoryFilter(target.value);
  }

  private handleSearch(searchTerm: string): void {
    const normalizedTerm = searchTerm.toLowerCase().trim();
    
    // Emit search event for parent components to handle
    this.adminService.searchItems(normalizedTerm, this.currentSection)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results: any[]) => {
          this.visibleItemsCount = results.length;
          this.searchResult = searchTerm ? { term: searchTerm, count: results.length } : null;
          this.updateEmptyState();
        },
        error: (error: any) => {
          console.error('Search error:', error);
          this.showNotification('Error al realizar la búsqueda', 'danger');
        }
      });
  }

  private handleCategoryFilter(selectedCategory: string): void {
    this.adminService.filterByCategory(selectedCategory, this.currentSection)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results: any[]) => {
          this.visibleItemsCount = results.length;
          this.filterResult = selectedCategory ? 
            { category: selectedCategory, count: results.length } : null;
          this.updateEmptyState();
        },
        error: (error: any) => {
          console.error('Filter error:', error);
          this.showNotification('Error al aplicar el filtro', 'danger');
        }
      });
  }

  private updateEmptyState(): void {
    this.showEmptyState = this.visibleItemsCount === 0 && 
                         (this.searchTerm.trim() !== '' || this.selectedCategory !== '');
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.searchResult = null;
    this.filterResult = null;
    this.showEmptyState = false;
    
    // Emit clear filters event
    this.adminService.clearFilters(this.currentSection);
  }

  showLoading(show: boolean, message = 'Procesando datos...'): void {
    this.isLoading = show;
    this.loadingMessage = message;
  }

  private showNotification(message: string, type: 'success' | 'info' | 'warning' | 'danger' = 'info'): void {
    this.notificationService.show(message, type);
  }

  // Public methods for external components to call
  async editItem(itemId: number): Promise<void> {
    try {
      this.showLoading(true, 'Cargando datos...');
      
      const item = await this.adminService.getItem(itemId, this.currentSection).toPromise();
      
      // Navigate to edit route or open modal based on section
      switch (this.currentSection) {
        case 'productos':
          this.router.navigate(['/admin/productos/edit', itemId]);
          break;
        case 'adicionales':
          this.router.navigate(['/admin/adicionales/edit', itemId]);
          break;
        case 'clientes':
          this.router.navigate(['/admin/clientes/edit', itemId]);
          break;
        case 'domiciliarios':
          this.router.navigate(['/admin/domiciliarios/edit', itemId]);
          break;
      }
    } catch (error) {
      console.error('Error loading item for edit:', error);
      this.showNotification('Error al cargar los datos del elemento', 'danger');
    } finally {
      this.showLoading(false);
    }
  }

  async deleteItem(itemId: number): Promise<void> {
    const confirmed = await this.showConfirmDialog({
      title: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este elemento?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      this.showLoading(true, 'Eliminando elemento...');
      
      await this.adminService.deleteItem(itemId, this.currentSection).toPromise();
      
      this.showNotification('Elemento eliminado correctamente', 'success');
      
      // Refresh the current view
      this.refreshCurrentView();
      
    } catch (error) {
      console.error('Error deleting item:', error);
      this.showNotification('Error al eliminar el elemento', 'danger');
    } finally {
      this.showLoading(false);
    }
  }

  async addItem(): Promise<void> {
    // Navigate to add route based on section
    switch (this.currentSection) {
      case 'productos':
        this.router.navigate(['/admin/productos/add']);
        break;
      case 'adicionales':
        this.router.navigate(['/admin/adicionales/add']);
        break;
      case 'clientes':
        this.router.navigate(['/admin/clientes/add']);
        break;
      case 'domiciliarios':
        this.router.navigate(['/admin/domiciliarios/add']);
        break;
    }
  }

  private async showConfirmDialog(options: {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    type: 'danger' | 'warning' | 'info';
  }): Promise<boolean> {
    return new Promise((resolve) => {
      // Create and show confirmation dialog
      const modal = document.createElement('div');
      modal.className = 'confirm-modal active';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header ${options.type}">
            <h3><i class="fas fa-exclamation-triangle"></i> ${options.title}</h3>
          </div>
          <div class="modal-body">
            <p>${options.message}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-cancel" id="cancelBtn">${options.cancelText}</button>
            <button class="btn btn-${options.type}" id="confirmBtn">${options.confirmText}</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const confirmBtn = modal.querySelector('#confirmBtn') as HTMLButtonElement;
      const cancelBtn = modal.querySelector('#cancelBtn') as HTMLButtonElement;

      const cleanup = () => {
        document.body.removeChild(modal);
      };

      confirmBtn.addEventListener('click', () => {
        cleanup();
        resolve(true);
      });

      cancelBtn.addEventListener('click', () => {
        cleanup();
        resolve(false);
      });

      // Close on backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          cleanup();
          resolve(false);
        }
      });
    });
  }

  private refreshCurrentView(): void {
    // Emit refresh event for parent components
    this.adminService.refreshView(this.currentSection);
  }
}