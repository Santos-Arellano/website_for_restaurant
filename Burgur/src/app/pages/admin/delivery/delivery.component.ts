import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

interface DeliveryPerson {
  id: number;
  nombre: string;
  telefono: string;
  vehiculo: string;
  zona: string;
  foto?: string;
  estado: 'disponible' | 'ocupado' | 'descanso';
  calificacion: number;
  entregasHoy: number;
  fechaIngreso: Date;
}

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css']
})
export class DeliveryComponent implements OnInit {
  deliveryPersons: DeliveryPerson[] = [];
  filteredDeliveryPersons: DeliveryPerson[] = [];
  searchTerm = '';
  selectedStatus = '';
  
  // Stats
  totalDeliveryPersons = 0;
  activeDeliveryPersons = 0;
  deliveriesInProgress = 0;
  averageRating = 0;
  
  // Modal
  showDeliveryModal = false;
  editingPerson: DeliveryPerson | null = null;
  deliveryForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.deliveryForm = this.fb.group({
      nombre: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      vehiculo: ['', [Validators.required]],
      zona: ['', [Validators.required]],
      foto: [''],
      estado: ['disponible', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadDeliveryPersons();
    this.updateStats();
  }

  loadDeliveryPersons(): void {
    // Datos de ejemplo - en una aplicación real esto vendría de un servicio
    this.deliveryPersons = [
      {
        id: 1,
        nombre: 'Carlos Rodríguez',
        telefono: '300 123 4567',
        vehiculo: 'Motocicleta',
        zona: 'Norte',
        foto: '',
        estado: 'disponible',
        calificacion: 4.8,
        entregasHoy: 12,
        fechaIngreso: new Date('2024-01-15')
      },
      {
        id: 2,
        nombre: 'Ana Martínez',
        telefono: '301 234 5678',
        vehiculo: 'Bicicleta',
        zona: 'Centro',
        foto: '',
        estado: 'ocupado',
        calificacion: 4.9,
        entregasHoy: 8,
        fechaIngreso: new Date('2024-02-20')
      },
      {
        id: 3,
        nombre: 'Luis García',
        telefono: '302 345 6789',
        vehiculo: 'Motocicleta',
        zona: 'Sur',
        foto: '',
        estado: 'descanso',
        calificacion: 4.5,
        entregasHoy: 15,
        fechaIngreso: new Date('2024-01-10')
      }
    ];
    
    this.filteredDeliveryPersons = [...this.deliveryPersons];
  }

  updateStats(): void {
    this.totalDeliveryPersons = this.deliveryPersons.length;
    this.activeDeliveryPersons = this.deliveryPersons.filter(p => p.estado === 'disponible').length;
    this.deliveriesInProgress = this.deliveryPersons.filter(p => p.estado === 'ocupado').length;
    
    if (this.deliveryPersons.length > 0) {
      const totalRating = this.deliveryPersons.reduce((sum, person) => sum + person.calificacion, 0);
      this.averageRating = Math.round((totalRating / this.deliveryPersons.length) * 10) / 10;
    } else {
      this.averageRating = 0;
    }
  }

  filterDeliveryPersons(): void {
    this.filteredDeliveryPersons = this.deliveryPersons.filter(person => {
      const matchesSearch = person.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           person.telefono.includes(this.searchTerm) ||
                           person.zona.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.selectedStatus === '' || person.estado === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  openAddDeliveryModal(): void {
    this.editingPerson = null;
    this.deliveryForm.reset({
      nombre: '',
      telefono: '',
      vehiculo: '',
      zona: '',
      foto: '',
      estado: 'disponible'
    });
    this.showDeliveryModal = true;
  }

  editDeliveryPerson(person: DeliveryPerson): void {
    this.editingPerson = person;
    this.deliveryForm.patchValue({
      nombre: person.nombre,
      telefono: person.telefono,
      vehiculo: person.vehiculo,
      zona: person.zona,
      foto: person.foto,
      estado: person.estado
    });
    this.showDeliveryModal = true;
  }

  saveDeliveryPerson(): void {
    if (this.deliveryForm.valid) {
      const formValue = this.deliveryForm.value;
      
      if (this.editingPerson) {
        // Actualizar domiciliario existente
        const index = this.deliveryPersons.findIndex(p => p.id === this.editingPerson!.id);
        if (index !== -1) {
          this.deliveryPersons[index] = {
            ...this.editingPerson,
            ...formValue
          };
          alert('Domiciliario actualizado exitosamente');
        }
      } else {
        // Crear nuevo domiciliario
        const newPerson: DeliveryPerson = {
          id: Math.max(...this.deliveryPersons.map(p => p.id), 0) + 1,
          ...formValue,
          calificacion: 5.0,
          entregasHoy: 0,
          fechaIngreso: new Date()
        };
        this.deliveryPersons.push(newPerson);
        alert('Domiciliario creado exitosamente');
      }
      
      this.filterDeliveryPersons();
      this.updateStats();
      this.closeDeliveryModal();
    }
  }

  deleteDeliveryPerson(personId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este domiciliario?')) {
      this.deliveryPersons = this.deliveryPersons.filter(p => p.id !== personId);
      this.filterDeliveryPersons();
      this.updateStats();
      alert('Domiciliario eliminado exitosamente');
    }
  }

  viewPersonDetails(person: DeliveryPerson): void {
    alert(`Detalles del domiciliario:\n\nNombre: ${person.nombre}\nTeléfono: ${person.telefono}\nVehículo: ${person.vehiculo}\nZona: ${person.zona}\nEstado: ${this.getStatusText(person.estado)}\nCalificación: ${person.calificacion}/5\nEntregas hoy: ${person.entregasHoy}\nFecha de ingreso: ${person.fechaIngreso.toLocaleDateString()}`);
  }

  togglePersonStatus(person: DeliveryPerson): void {
    if (person.estado === 'disponible') {
      person.estado = 'ocupado';
    } else {
      person.estado = 'disponible';
    }
    this.updateStats();
    alert(`Estado cambiado a: ${this.getStatusText(person.estado)}`);
  }

  getStatusText(estado: string): string {
    switch (estado) {
      case 'disponible': return 'Disponible';
      case 'ocupado': return 'Ocupado';
      case 'descanso': return 'En Descanso';
      default: return estado;
    }
  }

  closeDeliveryModal(): void {
    this.showDeliveryModal = false;
    this.editingPerson = null;
  }

  trackByPersonId(index: number, person: DeliveryPerson): number {
    return person.id;
  }
}
