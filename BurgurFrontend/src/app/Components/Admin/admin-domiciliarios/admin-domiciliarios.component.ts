import { Component, OnInit } from '@angular/core';
import { DomiciliarioService } from '../../../Service/Domiciliario/domiciliario.service';
import { Domiciliario } from '../../../Model/Domiciliario/domiciliario';

@Component({
  selector: 'app-admin-domiciliarios',
  templateUrl: './admin-domiciliarios.component.html',
  styleUrls: ['./admin-domiciliarios.component.css']
})
export class AdminDomiciliariosComponent implements OnInit {
  // Propiedades para datos
  domiciliarios: Domiciliario[] = [];
  domiciliariosFiltrados: Domiciliario[] = [];
  
  // Propiedades para estadísticas
  totalDomiciliarios: number = 0;
  domiciliariosActivos: number = 0;
  domiciliariosDisponibles: number = 0;
  totalEntregas: number = 0;
  
  // Propiedades para filtros y búsqueda
  filtroTexto: string = '';
  
  // Propiedades para modal
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  domiciliarioSeleccionado: Partial<Domiciliario> = this.crearDomiciliarioVacio();
  
  // Propiedades para UI
  cargando: boolean = false;
  errorMessage: string = '';

  constructor(private domiciliarioService: DomiciliarioService) { }

  ngOnInit(): void {
    this.cargarDomiciliarios();
    this.loadEstadisticas();
  }

  // Cargar estadísticas
  loadEstadisticas(): void {
    this.domiciliarioService.getEstadisticas().subscribe({
      next: (stats) => {
        this.totalDomiciliarios = stats.totalDomiciliarios;
        this.domiciliariosActivos = stats.domiciliariosActivos;
        this.domiciliariosDisponibles = stats.domiciliariosDisponibles;
        this.totalEntregas = stats.totalEntregas;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  // Filtrar domiciliarios
  filtrarDomiciliarios(): void {
    if (!this.filtroTexto.trim()) {
      this.domiciliariosFiltrados = [...this.domiciliarios];
      return;
    }

    const filtro = this.filtroTexto.toLowerCase();
    this.domiciliariosFiltrados = this.domiciliarios.filter(domiciliario =>
      domiciliario.nombre.toLowerCase().includes(filtro) ||
      (domiciliario.telefono && domiciliario.telefono.includes(filtro)) ||
      (domiciliario.vehiculo && domiciliario.vehiculo.toLowerCase().includes(filtro))
    );
  }

  // Abrir modal para agregar domiciliario
  abrirModalAgregarDomiciliario(): void {
    this.modoEdicion = false;
    this.domiciliarioSeleccionado = this.crearDomiciliarioVacio();
    this.mostrarModal = true;
  }

  // Editar domiciliario
  editarDomiciliario(domiciliario: Domiciliario): void {
    this.modoEdicion = true;
    this.domiciliarioSeleccionado = { ...domiciliario };
    this.mostrarModal = true;
  }

  // Cerrar modal
  cerrarModal(): void {
    this.mostrarModal = false;
    this.modoEdicion = false;
    this.domiciliarioSeleccionado = this.crearDomiciliarioVacio();
  }

  // Cargar domiciliarios usando el servicio
  cargarDomiciliarios(): void {
    this.cargando = true;
    this.errorMessage = '';
    
    this.domiciliarioService.getDomiciliarios().subscribe({
      next: (domiciliarios) => {
        this.domiciliarios = domiciliarios;
        this.domiciliariosFiltrados = [...this.domiciliarios];
        this.cargando = false;
        this.loadEstadisticas();
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los domiciliarios';
        this.cargando = false;
        console.error('Error:', error);
      }
    });
  }

  // Guardar domiciliario (crear o actualizar)
  guardarDomiciliario(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.cargando = true;
    this.errorMessage = '';

    if (this.modoEdicion && this.domiciliarioSeleccionado.id) {
      // Actualizar domiciliario existente
      this.domiciliarioService.updateDomiciliario(this.domiciliarioSeleccionado.id, this.domiciliarioSeleccionado).subscribe({
        next: () => {
          this.cargarDomiciliarios();
          this.cerrarModal();
          this.cargando = false;
        },
        error: (error) => {
          this.errorMessage = 'Error al actualizar el domiciliario';
          this.cargando = false;
          console.error('Error:', error);
        }
      });
    } else {
      // Crear nuevo domiciliario
      const nuevoDomiciliario = {
        nombre: this.domiciliarioSeleccionado.nombre!,
        cedula: this.domiciliarioSeleccionado.cedula!,
        telefono: this.domiciliarioSeleccionado.telefono!,
        vehiculo: this.domiciliarioSeleccionado.vehiculo!,
        placa: this.domiciliarioSeleccionado.placa!,
        activo: this.domiciliarioSeleccionado.activo ?? true,
        disponible: this.domiciliarioSeleccionado.disponible ?? true,
        pedidos: []
      };

      this.domiciliarioService.createDomiciliario(nuevoDomiciliario).subscribe({
        next: () => {
          this.cargarDomiciliarios();
          this.cerrarModal();
          this.cargando = false;
        },
        error: (error) => {
          this.errorMessage = error === 'El teléfono ya está registrado' ? error : 'Error al crear el domiciliario';
          this.cargando = false;
          console.error('Error:', error);
        }
      });
    }
  }

  // Eliminar domiciliario
  eliminarDomiciliario(domiciliario: Domiciliario): void {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${domiciliario.nombre}?`)) {
      this.cargando = true;
      this.errorMessage = '';

      this.domiciliarioService.deleteDomiciliario(domiciliario.id).subscribe({
        next: () => {
          this.cargarDomiciliarios();
          this.cargando = false;
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar el domiciliario';
          this.cargando = false;
          console.error('Error:', error);
        }
      });
    }
  }

  // Alternar disponibilidad
  toggleDisponibilidad(domiciliario: Domiciliario): void {
    this.domiciliarioService.toggleDomiciliarioStatus(domiciliario.id).subscribe({
      next: () => {
        this.cargarDomiciliarios();
      },
      error: (error) => {
        this.errorMessage = 'Error al cambiar el estado del domiciliario';
        console.error('Error:', error);
      }
    });
  }

  // Validar formulario
  private validarFormulario(): boolean {
    if (!this.domiciliarioSeleccionado.nombre?.trim()) {
      this.errorMessage = 'El nombre es requerido';
      return false;
    }
    if (!this.domiciliarioSeleccionado.telefono?.trim()) {
      this.errorMessage = 'El teléfono es requerido';
      return false;
    }
    if (!this.domiciliarioSeleccionado.vehiculo?.trim()) {
      this.errorMessage = 'El vehículo es requerido';
      return false;
    }
    if (!this.domiciliarioSeleccionado.placa?.trim()) {
      this.errorMessage = 'La placa es requerida';
      return false;
    }
    return true;
  }

  // Crear domiciliario vacío
  private crearDomiciliarioVacio(): Partial<Domiciliario> {
    return {
      nombre: '',
      telefono: '',
      vehiculo: '',
      placa: '',
      activo: true,
      disponible: true
    };
  }

  // Track by function para ngFor
  trackByDomiciliarioId(index: number, domiciliario: Domiciliario): number {
    return domiciliario.id;
  }
}
