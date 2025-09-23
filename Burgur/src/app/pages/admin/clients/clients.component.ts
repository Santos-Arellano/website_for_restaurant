import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

interface Client {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  activo: boolean;
  fechaRegistro: Date;
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchTerm = '';
  selectedStatus = '';
  
  // Stats
  totalClients = 0;
  activeClients = 0;
  newClientsThisMonth = 0;
  vipClients = 0;
  
  // Modal
  showClientModal = false;
  editingClient: Client | null = null;
  clientForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.clientForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]],
      direccion: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.updateStats();
  }

  loadClients(): void {
    // Datos de ejemplo - en una aplicación real esto vendría de un servicio
    this.clients = [
      {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@email.com',
        telefono: '300 123 4567',
        direccion: 'Calle 123 #45-67',
        activo: true,
        fechaRegistro: new Date('2024-01-15')
      },
      {
        id: 2,
        nombre: 'María García',
        email: 'maria@email.com',
        telefono: '301 234 5678',
        direccion: 'Carrera 45 #12-34',
        activo: true,
        fechaRegistro: new Date('2024-02-20')
      },
      {
        id: 3,
        nombre: 'Carlos López',
        email: 'carlos@email.com',
        telefono: '302 345 6789',
        direccion: 'Avenida 67 #89-01',
        activo: false,
        fechaRegistro: new Date('2024-01-10')
      }
    ];
    
    this.filteredClients = [...this.clients];
  }

  updateStats(): void {
    this.totalClients = this.clients.length;
    this.activeClients = this.clients.filter(c => c.activo).length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    this.newClientsThisMonth = this.clients.filter(c => {
      const clientDate = new Date(c.fechaRegistro);
      return clientDate.getMonth() === currentMonth && clientDate.getFullYear() === currentYear;
    }).length;
    
    // VIP clients (ejemplo: clientes con más de 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    this.vipClients = this.clients.filter(c => 
      new Date(c.fechaRegistro) < sixMonthsAgo && c.activo
    ).length;
  }

  filterClients(): void {
    this.filteredClients = this.clients.filter(client => {
      const matchesSearch = !this.searchTerm || 
        client.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        client.telefono.includes(this.searchTerm);
      
      const matchesStatus = !this.selectedStatus || 
        (this.selectedStatus === 'activo' && client.activo) ||
        (this.selectedStatus === 'inactivo' && !client.activo);
      
      return matchesSearch && matchesStatus;
    });
  }

  openAddClientModal(): void {
    this.editingClient = null;
    this.clientForm.reset({
      nombre: '',
      email: '',
      telefono: '',
      direccion: '',
      activo: true
    });
    this.showClientModal = true;
  }

  editClient(client: Client): void {
    this.editingClient = client;
    this.clientForm.patchValue({
      nombre: client.nombre,
      email: client.email,
      telefono: client.telefono,
      direccion: client.direccion,
      activo: client.activo
    });
    this.showClientModal = true;
  }

  saveClient(): void {
    if (this.clientForm.valid) {
      const formValue = this.clientForm.value;
      
      if (this.editingClient) {
        // Actualizar cliente existente
        const index = this.clients.findIndex(c => c.id === this.editingClient!.id);
        if (index !== -1) {
          this.clients[index] = {
            ...this.editingClient,
            ...formValue
          };
          alert('Cliente actualizado exitosamente');
        }
      } else {
        // Crear nuevo cliente
        const newClient: Client = {
          id: Math.max(...this.clients.map(c => c.id), 0) + 1,
          ...formValue,
          fechaRegistro: new Date()
        };
        this.clients.push(newClient);
        alert('Cliente creado exitosamente');
      }
      
      this.filterClients();
      this.updateStats();
      this.closeClientModal();
    }
  }

  deleteClient(clientId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      this.clients = this.clients.filter(c => c.id !== clientId);
      this.filterClients();
      this.updateStats();
      alert('Cliente eliminado exitosamente');
    }
  }

  viewClientDetails(client: Client): void {
    alert(`Detalles del cliente:\n\nNombre: ${client.nombre}\nEmail: ${client.email}\nTeléfono: ${client.telefono}\nDirección: ${client.direccion}\nEstado: ${client.activo ? 'Activo' : 'Inactivo'}\nFecha de registro: ${client.fechaRegistro.toLocaleDateString()}`);
  }

  closeClientModal(): void {
    this.showClientModal = false;
    this.editingClient = null;
  }

  trackByClientId(index: number, client: Client): number {
    return client.id;
  }
}
