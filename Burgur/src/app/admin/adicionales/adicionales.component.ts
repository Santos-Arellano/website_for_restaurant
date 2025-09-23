import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

interface Adicional {
  id: number;
  nombre: string;
  precio: number;
  categorias: string[];
  activo: boolean;
}

interface AdicionalStats {
  totalAdicionales: number;
  adicionalesActivos: number;
}

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Component({
  selector: 'app-adicionales',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './adicionales.component.html',
  styleUrls: ['./adicionales.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-in', style({ transform: 'translateX(0%)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class AdicionalesComponent implements OnInit, AfterViewInit, OnDestroy {
  // Data properties
  adicionales: Adicional[] = [];
  filteredAdicionales: Adicional[] = [];
  stats: AdicionalStats = {
    totalAdicionales: 0,
    adicionalesActivos: 0
  };

  // Search and filter
  searchTerm = '';

  // Modal properties
  showModal = false;
  showConfirmModal = false;
  isEditing = false;
  currentAdicional: Adicional = this.getEmptyAdicional();
  categoriasString = '';
  adicionalToDelete: number | null = null;

  // Notifications
  notifications: Notification[] = [];
  private notificationId = 0;

  constructor() {}

  ngOnInit(): void {
    this.loadAdicionales();
  }

  ngAfterViewInit(): void {
    // Initialize any DOM-dependent functionality
  }

  ngOnDestroy(): void {
    // Cleanup subscriptions if any
  }

  private getEmptyAdicional(): Adicional {
    return {
      id: 0,
      nombre: '',
      precio: 0,
      categorias: [],
      activo: true
    };
  }

  loadAdicionales(): void {
    // Simulate API call - replace with actual service call
    this.adicionales = [
      {
        id: 1,
        nombre: 'Queso Extra',
        precio: 2000,
        categorias: ['hamburguesa', 'sandwich'],
        activo: true
      },
      {
        id: 2,
        nombre: 'Tocineta',
        precio: 3000,
        categorias: ['hamburguesa', 'pizza'],
        activo: true
      },
      {
        id: 3,
        nombre: 'Aguacate',
        precio: 2500,
        categorias: ['hamburguesa', 'ensalada'],
        activo: true
      }
    ];

    this.filteredAdicionales = [...this.adicionales];
    this.calculateStats();
  }

  calculateStats(): void {
    this.stats.totalAdicionales = this.adicionales.length;
    this.stats.adicionalesActivos = this.adicionales.filter(a => a.activo).length;
  }

  filterAdicionales(): void {
    if (!this.searchTerm.trim()) {
      this.filteredAdicionales = [...this.adicionales];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredAdicionales = this.adicionales.filter(adicional =>
        adicional.nombre.toLowerCase().includes(term) ||
        adicional.categorias.some(cat => cat.toLowerCase().includes(term))
      );
    }
  }

  openAddAdicionalModal(): void {
    this.isEditing = false;
    this.currentAdicional = this.getEmptyAdicional();
    this.categoriasString = '';
    this.showModal = true;
  }

  editAdicional(adicional: Adicional): void {
    this.isEditing = true;
    this.currentAdicional = { ...adicional };
    this.categoriasString = adicional.categorias.join(', ');
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentAdicional = this.getEmptyAdicional();
    this.categoriasString = '';
  }

  saveAdicional(): void {
    // Parse categories from string
    this.currentAdicional.categorias = this.categoriasString
      .split(',')
      .map(cat => cat.trim())
      .filter(cat => cat.length > 0);

    if (this.isEditing) {
      // Update existing adicional
      const index = this.adicionales.findIndex(a => a.id === this.currentAdicional.id);
      if (index !== -1) {
        this.adicionales[index] = { ...this.currentAdicional };
        this.showNotification('Adicional actualizado exitosamente', 'success');
      }
    } else {
      // Add new adicional
      this.currentAdicional.id = Math.max(...this.adicionales.map(a => a.id), 0) + 1;
      this.adicionales.push({ ...this.currentAdicional });
      this.showNotification('Adicional agregado exitosamente', 'success');
    }

    this.filteredAdicionales = [...this.adicionales];
    this.calculateStats();
    this.closeModal();
  }

  deleteAdicional(id: number): void {
    this.adicionalToDelete = id;
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.adicionalToDelete = null;
  }

  confirmDelete(): void {
    if (this.adicionalToDelete !== null) {
      this.adicionales = this.adicionales.filter(a => a.id !== this.adicionalToDelete);
      this.filteredAdicionales = [...this.adicionales];
      this.calculateStats();
      this.showNotification('Adicional eliminado exitosamente', 'success');
    }
    this.closeConfirmModal();
  }

  showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    const notification: Notification = {
      id: ++this.notificationId,
      message,
      type
    };
    
    this.notifications.push(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      this.removeNotification(notification);
    }, 5000);
  }

  removeNotification(notification: Notification): void {
    this.notifications = this.notifications.filter(n => n.id !== notification.id);
  }
}
