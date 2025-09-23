import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

interface Additional {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  imagen?: string;
  disponible: boolean;
  popular: boolean;
}

@Component({
  selector: 'app-additionals',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './additionals.component.html',
  styleUrls: ['./additionals.component.css']
})
export class AdditionalsComponent implements OnInit {
  additionals: Additional[] = [
    {
      id: 1,
      nombre: 'Papas Fritas',
      descripcion: 'Papas fritas crujientes y doradas',
      categoria: 'acompañamientos',
      precio: 3500,
      imagen: '/assets/papas-fritas.jpg',
      disponible: true,
      popular: true
    },
    {
      id: 2,
      nombre: 'Coca Cola',
      descripcion: 'Bebida gaseosa 350ml',
      categoria: 'bebidas',
      precio: 2500,
      imagen: '/assets/images/menu/Coke.png',
      disponible: true,
      popular: false
    },
    {
      id: 3,
      nombre: 'Salsa BBQ',
      descripcion: 'Salsa barbacoa casera',
      categoria: 'salsas',
      precio: 1000,
      imagen: '/assets/salsa-bbq.jpg',
      disponible: true,
      popular: true
    },
    {
      id: 4,
      nombre: 'Helado de Vainilla',
      descripcion: 'Helado artesanal de vainilla',
      categoria: 'postres',
      precio: 4000,
      imagen: '/assets/helado-vainilla.jpg',
      disponible: false,
      popular: false
    }
  ];

  filteredAdditionals: Additional[] = [];
  searchTerm = '';
  selectedCategory = '';
  selectedAvailability = '';

  // Stats
  totalAdditionals = 0;
  availableAdditionals = 0;
  popularAdditionals = 0;
  averagePrice = 0;

  // Modal
  showAdditionalModal = false;
  editingAdditional: Additional | null = null;
  additionalForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.additionalForm = this.fb.group({
      nombre: ['', [Validators.required]],
      descripcion: [''],
      categoria: ['', [Validators.required]],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      imagen: [''],
      disponible: [true],
      popular: [false]
    });
  }

  ngOnInit(): void {
    this.loadAdditionals();
    this.updateStats();
  }

  loadAdditionals(): void {
    this.filteredAdditionals = [...this.additionals];
  }

  updateStats(): void {
    this.totalAdditionals = this.additionals.length;
    this.availableAdditionals = this.additionals.filter(a => a.disponible).length;
    this.popularAdditionals = this.additionals.filter(a => a.popular).length;
    this.averagePrice = this.additionals.length > 0 
      ? Math.round(this.additionals.reduce((sum, a) => sum + a.precio, 0) / this.additionals.length)
      : 0;
  }

  filterAdditionals(): void {
    this.filteredAdditionals = this.additionals.filter(additional => {
      const matchesSearch = !this.searchTerm || 
        additional.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        additional.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = !this.selectedCategory || additional.categoria === this.selectedCategory;
      
      const matchesAvailability = !this.selectedAvailability || 
        additional.disponible.toString() === this.selectedAvailability;

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }

  openAddAdditionalModal(): void {
    this.editingAdditional = null;
    this.additionalForm.reset({
      nombre: '',
      descripcion: '',
      categoria: '',
      precio: 0,
      imagen: '',
      disponible: true,
      popular: false
    });
    this.showAdditionalModal = true;
  }

  editAdditional(additional: Additional): void {
    this.editingAdditional = additional;
    this.additionalForm.patchValue(additional);
    this.showAdditionalModal = true;
  }

  closeAdditionalModal(): void {
    this.showAdditionalModal = false;
    this.editingAdditional = null;
    this.additionalForm.reset();
  }

  saveAdditional(): void {
    if (this.additionalForm.valid) {
      const formValue = this.additionalForm.value;
      
      if (this.editingAdditional) {
        // Update existing additional
        const index = this.additionals.findIndex(a => a.id === this.editingAdditional!.id);
        if (index !== -1) {
          this.additionals[index] = { ...this.editingAdditional, ...formValue };
          alert('Adicional actualizado exitosamente');
        }
      } else {
        // Create new additional
        const newAdditional: Additional = {
          id: Math.max(...this.additionals.map(a => a.id), 0) + 1,
          ...formValue
        };
        this.additionals.push(newAdditional);
        alert('Adicional creado exitosamente');
      }
      
      this.loadAdditionals();
      this.updateStats();
      this.filterAdditionals();
      this.closeAdditionalModal();
    }
  }

  deleteAdditional(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este adicional?')) {
      this.additionals = this.additionals.filter(a => a.id !== id);
      this.loadAdditionals();
      this.updateStats();
      this.filterAdditionals();
      alert('Adicional eliminado exitosamente');
    }
  }

  toggleAvailability(additional: Additional): void {
    additional.disponible = !additional.disponible;
    this.updateStats();
    this.filterAdditionals();
    alert(`Adicional ${additional.disponible ? 'marcado como disponible' : 'marcado como no disponible'}`);
  }

  trackByAdditionalId(index: number, additional: Additional): number {
    return additional.id;
  }
}
