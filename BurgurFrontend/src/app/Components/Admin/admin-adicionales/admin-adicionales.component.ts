import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdicionalService } from '../../../Service/Adicional/adicional.service';
import { ProductoService } from '../../../Service/Producto/producto.service';
import { Adicional } from '../../../Model/Adicional/adicional';

@Component({
  selector: 'app-admin-adicionales',
  templateUrl: './admin-adicionales.component.html',
  styleUrls: ['./admin-adicionales.component.css']
})
export class AdminAdicionalesComponent implements OnInit, OnDestroy {
  adicionales: Adicional[] = [];
  filteredAdicionales: Adicional[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Estadísticas
  totalAdicionales: number = 0;
  adicionalesActivos: number = 0;
  
  // Modal states
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  showDeleteModal: boolean = false;
  selectedAdicional: Adicional | null = null;
  
  // Formulario
  adicionalForm: Partial<Adicional> = {
    nombre: '',
    precio: 0,
    activo: true,
    categorias: []
  };
  
  // Categorías disponibles
  categoriasDisponibles: string[] = [
    'hamburguesa',
    'perro caliente',
    'acompañamiento',
    'bebida',
    'postre'
  ];
  
  private subscriptions: Subscription = new Subscription();

  constructor(private adicionalService: AdicionalService, private productoService: ProductoService) { }

  ngOnInit(): void {
    this.loadAdicionales();
    this.loadEstadisticas();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Cargar adicionales
  loadAdicionales(): void {
    this.isLoading = true;
    const sub = this.adicionalService.getAdicionales().subscribe({
      next: (adicionales) => {
        this.adicionales = adicionales;
        this.filteredAdicionales = [...adicionales];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar adicionales';
        this.isLoading = false;
        console.error('Error:', error);
      }
    });
    this.subscriptions.add(sub);
  }

  // Cargar estadísticas
  loadEstadisticas(): void {
    const sub = this.adicionalService.getEstadisticas().subscribe({
      next: (stats) => {
        this.totalAdicionales = stats.totalAdicionales;
        this.adicionalesActivos = stats.adicionalesActivos;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
    this.subscriptions.add(sub);
  }

  // Filtrar adicionales
  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredAdicionales = [...this.adicionales];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredAdicionales = this.adicionales.filter(adicional =>
      adicional.nombre.toLowerCase().includes(term) ||
      adicional.categorias.some(cat => cat.toLowerCase().includes(term))
    );
  }

  // Abrir modal de agregar
  openAddModal(): void {
    this.adicionalForm = {
      nombre: '',
      precio: 0,
      activo: true,
      categorias: []
    };
    this.showAddModal = true;
  }

  // Abrir modal de editar
  openEditModal(adicional: Adicional): void {
    this.selectedAdicional = adicional;
    this.adicionalForm = {
      nombre: adicional.nombre,
      precio: adicional.precio,
      activo: adicional.activo,
      categorias: [...adicional.categorias]
    };
    this.showEditModal = true;
  }

  // Abrir modal de eliminar
  openDeleteModal(adicional: Adicional): void {
    this.selectedAdicional = adicional;
    this.showDeleteModal = true;
  }

  // Cerrar modales
  closeModals(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedAdicional = null;
    this.adicionalForm = {
      nombre: '',
      precio: 0,
      activo: true,
      categorias: []
    };
  }

  // Guardar adicional (crear o editar)
  saveAdicional(): void {
    if (!this.adicionalForm.nombre || !this.adicionalForm.precio) {
      this.errorMessage = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.isLoading = true;
    
    if (this.showEditModal && this.selectedAdicional) {
      // Editar
      const sub = this.adicionalService.updateAdicional(
        this.selectedAdicional.id, 
        this.adicionalForm
      ).subscribe({
        next: () => {
          this.loadAdicionales();
          this.loadEstadisticas();
          // Refrescar productos para reflejar cambios en adicionales permitidos
          this.productoService?.getProductos()?.subscribe();
          this.closeModals();
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Error al actualizar adicional';
          this.isLoading = false;
          console.error('Error:', error);
        }
      });
      this.subscriptions.add(sub);
    } else {
      // Crear
      const sub = this.adicionalService.createAdicional(
        this.adicionalForm as Omit<Adicional, 'id'>
      ).subscribe({
        next: () => {
          this.loadAdicionales();
          this.loadEstadisticas();
          // Refrescar productos para reflejar cambios en adicionales permitidos
          this.productoService?.getProductos()?.subscribe();
          this.closeModals();
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Error al crear adicional';
          this.isLoading = false;
          console.error('Error:', error);
        }
      });
      this.subscriptions.add(sub);
    }
  }

  // Eliminar adicional
  deleteAdicional(): void {
    if (!this.selectedAdicional) return;

    this.isLoading = true;
    const sub = this.adicionalService.deleteAdicional(this.selectedAdicional.id).subscribe({
      next: () => {
        this.loadAdicionales();
        this.loadEstadisticas();
        // Refrescar productos para reflejar cambios en adicionales permitidos
        this.productoService?.getProductos()?.subscribe();
        this.closeModals();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al eliminar adicional';
        this.isLoading = false;
        console.error('Error:', error);
      }
    });
    this.subscriptions.add(sub);
  }

  // Toggle categoría
  toggleCategoria(categoria: string): void {
    if (!this.adicionalForm.categorias) {
      this.adicionalForm.categorias = [];
    }

    const index = this.adicionalForm.categorias.indexOf(categoria);
    if (index > -1) {
      this.adicionalForm.categorias.splice(index, 1);
    } else {
      this.adicionalForm.categorias.push(categoria);
    }
  }

  // Verificar si categoría está seleccionada
  isCategoriaSelected(categoria: string): boolean {
    return this.adicionalForm.categorias?.includes(categoria) || false;
  }

  // Formatear precio
  formatPrice(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  trackByAdicionalId(index: number, adicional: Adicional): number {
    return adicional.id || index;
  }
}
