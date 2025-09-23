import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

// Interfaces
interface Domiciliario {
  id: number;
  nombre: string;
  cedula: string;
  disponible: boolean;
}

interface DomiciliarioStats {
  totalDomiciliarios: number;
  domiciliariosDisponibles: number;
}

interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

@Component({
  selector: 'app-domiciliarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './domiciliarios.component.html',
  styleUrls: ['./domiciliarios.component.css'],
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
export class DomiciliariosComponent implements OnInit, AfterViewInit, OnDestroy {
  // Component properties
  domiciliarios: Domiciliario[] = [
    {
      id: 1,
      nombre: 'Carlos Mendoza',
      cedula: '1234567890',
      disponible: true
    },
    {
      id: 2,
      nombre: 'Luis García',
      cedula: '0987654321',
      disponible: false
    },
    {
      id: 3,
      nombre: 'Ana Rodríguez',
      cedula: '1122334455',
      disponible: true
    }
  ];

  domiciliarioStats: DomiciliarioStats = {
    totalDomiciliarios: 0,
    domiciliariosDisponibles: 0
  };

  // Modal properties
  showModal = false;
  showConfirmModal = false;
  isEditing = false;
  currentDomiciliario: Domiciliario = this.getEmptyDomiciliario();
  domiciliarioToDelete = 0;

  // Notification system
  notifications: Notification[] = [];
  private notificationId = 0;

  constructor() {}

  ngOnInit(): void {
    this.loadDomiciliarios();
    this.calculateStats();
  }

  ngAfterViewInit(): void {
    // Initialize any additional functionality after view init
  }

  ngOnDestroy(): void {
    // Cleanup subscriptions if any
  }

  // Data loading methods
  loadDomiciliarios(): void {
    // In a real app, this would be an HTTP call
    // Data is already loaded in the component initialization
  }

  calculateStats(): void {
    this.domiciliarioStats = {
      totalDomiciliarios: this.domiciliarios.length,
      domiciliariosDisponibles: this.domiciliarios.filter(d => d.disponible).length
    };
  }

  refreshData(): void {
    this.loadDomiciliarios();
    this.calculateStats();
    this.showNotification('info', 'Datos actualizados');
  }

  // Modal methods
  openAddDomiciliarioModal(): void {
    this.isEditing = false;
    this.currentDomiciliario = this.getEmptyDomiciliario();
    this.showModal = true;
  }

  editDomiciliario(domiciliarioId: number): void {
    const domiciliario = this.domiciliarios.find(d => d.id === domiciliarioId);
    if (domiciliario) {
      this.isEditing = true;
      this.currentDomiciliario = { ...domiciliario };
      this.showModal = true;
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.currentDomiciliario = this.getEmptyDomiciliario();
  }

  saveDomiciliario(): void {
    if (this.isEditing) {
      // Update existing domiciliario
      const index = this.domiciliarios.findIndex(d => d.id === this.currentDomiciliario.id);
      if (index !== -1) {
        this.domiciliarios[index] = { ...this.currentDomiciliario };
        this.showNotification('success', 'Domiciliario actualizado exitosamente');
      }
    } else {
      // Add new domiciliario
      const newDomiciliario: Domiciliario = {
        ...this.currentDomiciliario,
        id: Math.max(...this.domiciliarios.map(d => d.id), 0) + 1
      };
      this.domiciliarios.push(newDomiciliario);
      this.showNotification('success', 'Domiciliario agregado exitosamente');
    }

    this.calculateStats();
    this.closeModal();
  }

  deleteDomiciliario(domiciliarioId: number): void {
    this.domiciliarioToDelete = domiciliarioId;
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.domiciliarioToDelete = 0;
  }

  confirmDelete(): void {
    if (this.domiciliarioToDelete > 0) {
      this.domiciliarios = this.domiciliarios.filter(d => d.id !== this.domiciliarioToDelete);
      this.calculateStats();
      this.showNotification('success', 'Domiciliario eliminado exitosamente');
    }
    this.closeConfirmModal();
  }

  toggleStatus(domiciliarioId: number): void {
    const domiciliario = this.domiciliarios.find(d => d.id === domiciliarioId);
    if (domiciliario) {
      domiciliario.disponible = !domiciliario.disponible;
      this.calculateStats();
      const status = domiciliario.disponible ? 'disponible' : 'no disponible';
      this.showNotification('info', `Estado cambiado a ${status}`);
    }
  }

  // Utility methods
  private getEmptyDomiciliario(): Domiciliario {
    return {
      id: 0,
      nombre: '',
      cedula: '',
      disponible: true
    };
  }

  // Notification methods
  showNotification(type: 'success' | 'error' | 'warning' | 'info', message: string): void {
    const notification: Notification = {
      id: ++this.notificationId,
      type,
      message
    };

    this.notifications.push(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 5000);
  }

  removeNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-exclamation-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'info': return 'fas fa-info-circle';
      default: return 'fas fa-info-circle';
    }
  }
}
