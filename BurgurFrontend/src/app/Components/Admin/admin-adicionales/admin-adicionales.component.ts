import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdicionalService } from '../../../Service/Adicional/adicional.service';
import { ProductoService } from '../../../Service/Producto/producto.service';
import { Adicional } from '../../../Model/Adicional/adicional';
import { ToastService } from '../../Shared/toast/toast.service';

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

  constructor(private adicionalService: AdicionalService, private productoService: ProductoService, private toast: ToastService) { }

  ngOnInit(): void {
    this.loadAdicionales();
    // loadEstadisticas() se llama dentro de loadAdicionales()
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
        // Actualizar estadísticas después de cargar adicionales
        this.loadEstadisticas();
        this.toast.info('Adicionales cargados correctamente', 2500);
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar adicionales';
        this.isLoading = false;
        console.error('Error:', error);
        this.toast.error(this.errorMessage, 5000);
      }
    });
    this.subscriptions.add(sub);
  }

  // Cargar estadísticas
  loadEstadisticas(): void {
    // Calcular total desde los adicionales cargados
    this.totalAdicionales = this.adicionales.length;
    
    // Obtener cantidad de activos desde el backend
    const sub = this.adicionalService.getCantidadAdicionalesActivos().subscribe({
      next: (cantidad) => {
        this.adicionalesActivos = cantidad;
        this.toast.info('Estadísticas actualizadas', 2000);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        // Fallback: calcular desde los adicionales cargados
        this.adicionalesActivos = this.adicionales.filter(a => a.activo).length;
        this.toast.error('No se pudieron cargar las estadísticas', 4000);
      }
    });
    this.subscriptions.add(sub);
  }

  // Filtrar adicionales
  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredAdicionales = [...this.adicionales];
      this.toast.info('Búsqueda limpia. Mostrando todos los adicionales', 2500);
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredAdicionales = this.adicionales.filter(adicional =>
      adicional.nombre.toLowerCase().includes(term) ||
      adicional.categorias.some(cat => cat.toLowerCase().includes(term))
    );
    this.toast.info(`Filtrados por: "${this.searchTerm}"`, 2500);
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
    this.toast.info('Abriste el modal de agregar adicional', 2000);
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
    this.toast.info(`Editando adicional: ${adicional.nombre}`, 2000);
  }

  // Abrir modal de eliminar
  openDeleteModal(adicional: Adicional): void {
    this.selectedAdicional = adicional;
    this.showDeleteModal = true;
    this.toast.warning(`Eliminarás: ${adicional.nombre}. Confirma tu acción.`, 3500);
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
    this.toast.info('Cerraste los modales', 2000);
  }

  // Guardar adicional (crear o editar)
  saveAdicional(): void {
    if (!this.adicionalForm.nombre || !this.adicionalForm.precio) {
      this.errorMessage = 'Por favor completa todos los campos requeridos';
      this.toast.warning(this.errorMessage, 4000);
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
          this.loadAdicionales(); // Esto llamará automáticamente a loadEstadisticas()
          // Refrescar productos para reflejar cambios en adicionales permitidos
          this.productoService?.getProductos()?.subscribe();
          this.closeModals();
          this.isLoading = false;
          this.toast.success('Adicional actualizado correctamente', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Error al actualizar adicional';
          this.isLoading = false;
          console.error('Error:', error);
           this.toast.error(this.errorMessage, 5000);
        }
      });
      this.subscriptions.add(sub);
    } else {
      // Crear
      const sub = this.adicionalService.createAdicional(
        this.adicionalForm as Omit<Adicional, 'id'>
      ).subscribe({
        next: () => {
          this.loadAdicionales(); // Esto llamará automáticamente a loadEstadisticas()
          // Refrescar productos para reflejar cambios en adicionales permitidos
          this.productoService?.getProductos()?.subscribe();
          this.closeModals();
          this.isLoading = false;
          this.toast.success('Adicional creado correctamente', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Error al crear adicional';
          this.isLoading = false;
          console.error('Error:', error);
          this.toast.error(this.errorMessage, 5000);
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
        this.loadAdicionales(); // Esto llamará automáticamente a loadEstadisticas()
        // Refrescar productos para reflejar cambios en adicionales permitidos
        this.productoService?.getProductos()?.subscribe();
        this.closeModals();
        this.isLoading = false;
        this.toast.success('Adicional eliminado correctamente', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Error al eliminar adicional';
        this.isLoading = false;
        console.error('Error:', error);
        this.toast.error(this.errorMessage, 5000);
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
