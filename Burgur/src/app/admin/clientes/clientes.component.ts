import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

// Interfaces
interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  activo: boolean;
}

interface ClienteStats {
  totalClientes: number;
  clientesActivos: number;
}

interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css'],
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
export class ClientesComponent implements OnInit, AfterViewInit, OnDestroy {
  // Component properties
  clientes: Cliente[] = [
    {
      id: 1,
      nombre: 'Juan',
      apellido: 'Pérez',
      correo: 'juan.perez@email.com',
      telefono: '3001234567',
      activo: true
    },
    {
      id: 2,
      nombre: 'María',
      apellido: 'González',
      correo: 'maria.gonzalez@email.com',
      telefono: '3007654321',
      activo: true
    },
    {
      id: 3,
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      correo: 'carlos.rodriguez@email.com',
      activo: false
    }
  ];

  filteredClientes: Cliente[] = [];
  clienteStats: ClienteStats = {
    totalClientes: 0,
    clientesActivos: 0
  };

  // Search and filter properties
  searchTerm = '';

  // Modal properties
  showModal = false;
  isEditing = false;
  currentCliente: Cliente = this.getEmptyCliente();

  // Notification system
  notifications: Notification[] = [];
  private notificationId = 0;

  constructor() {}

  ngOnInit(): void {
    this.loadClientes();
    this.calculateStats();
    this.filterClientes();
  }

  ngAfterViewInit(): void {
    // Initialize any additional functionality after view init
  }

  ngOnDestroy(): void {
    // Cleanup subscriptions if any
  }

  // Data loading methods
  loadClientes(): void {
    // In a real app, this would be an HTTP call
    this.filteredClientes = [...this.clientes];
  }

  calculateStats(): void {
    this.clienteStats = {
      totalClientes: this.clientes.length,
      clientesActivos: this.clientes.filter(c => c.activo).length
    };
  }

  // Search and filter methods
  filterClientes(): void {
    if (!this.searchTerm.trim()) {
      this.filteredClientes = [...this.clientes];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredClientes = this.clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(term) ||
        cliente.apellido.toLowerCase().includes(term) ||
        cliente.correo.toLowerCase().includes(term) ||
        (cliente.telefono && cliente.telefono.includes(term))
      );
    }
  }

  // Modal methods
  openAddClienteModal(): void {
    this.isEditing = false;
    this.currentCliente = this.getEmptyCliente();
    this.showModal = true;
  }

  editCliente(clienteId: number): void {
    const cliente = this.clientes.find(c => c.id === clienteId);
    if (cliente) {
      this.isEditing = true;
      this.currentCliente = { ...cliente };
      this.showModal = true;
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.currentCliente = this.getEmptyCliente();
  }

  saveCliente(): void {
    if (this.isEditing) {
      // Update existing cliente
      const index = this.clientes.findIndex(c => c.id === this.currentCliente.id);
      if (index !== -1) {
        this.clientes[index] = { ...this.currentCliente };
        this.showNotification('success', 'Cliente actualizado exitosamente');
      }
    } else {
      // Add new cliente
      const newCliente: Cliente = {
        ...this.currentCliente,
        id: Math.max(...this.clientes.map(c => c.id), 0) + 1,
        activo: true
      };
      this.clientes.push(newCliente);
      this.showNotification('success', 'Cliente agregado exitosamente');
    }

    this.calculateStats();
    this.filterClientes();
    this.closeModal();
  }

  deleteCliente(clienteId: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      this.clientes = this.clientes.filter(c => c.id !== clienteId);
      this.calculateStats();
      this.filterClientes();
      this.showNotification('success', 'Cliente eliminado exitosamente');
    }
  }

  // Utility methods
  private getEmptyCliente(): Cliente {
    return {
      id: 0,
      nombre: '',
      apellido: '',
      correo: '',
      telefono: '',
      activo: true
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
