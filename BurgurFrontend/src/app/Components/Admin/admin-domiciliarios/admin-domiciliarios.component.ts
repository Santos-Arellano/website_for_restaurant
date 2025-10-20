import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomiciliarioService } from '../../../Service/Domiciliario/domiciliario.service';
import { Domiciliario } from '../../../Model/Domiciliario/domiciliario';
import { PedidoService } from '../../../Service/Pedido/pedido.service';

@Component({
  selector: 'app-admin-domiciliarios',
  templateUrl: './admin-domiciliarios.component.html',
  styleUrls: ['./admin-domiciliarios.component.css']
})
export class AdminDomiciliariosComponent implements OnInit, OnDestroy {
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

  // Suscripción a cambios de pedidos y listener global
  private pedidosSub: any;
  private refreshHandler?: () => void;

  constructor(private domiciliarioService: DomiciliarioService, private pedidoService: PedidoService) { }

  ngOnInit(): void {
    this.cargarDomiciliarios();
    this.loadEstadisticas();

    // Refrescar automáticamente cuando haya cambios en pedidos (entregados/asignados)
    this.pedidosSub = this.pedidoService.pedidos$.subscribe(() => {
      this.cargarDomiciliarios();
      this.loadEstadisticas();
    });

    // También escuchar evento global usado por order-detail
    this.refreshHandler = () => {
      this.cargarDomiciliarios();
      this.loadEstadisticas();
    };
    document.addEventListener('refreshOrders', this.refreshHandler);
  }

  ngOnDestroy(): void {
    try { this.pedidosSub?.unsubscribe?.(); } catch {}
    if (this.refreshHandler) {
      try { document.removeEventListener('refreshOrders', this.refreshHandler); } catch {}
    }
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

  // =========================
  // Métodos existentes
  // =========================

  cargarDomiciliarios(): void {
    this.cargando = true;
    this.domiciliarioService.getDomiciliarios().subscribe({
      next: (doms) => {
        this.domiciliarios = doms;
        this.filtrarDomiciliarios();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar domiciliarios:', err);
        this.errorMessage = 'No se pudo cargar la lista de domiciliarios';
        this.cargando = false;
      }
    });
  }

  aplicarFiltro(termino: string): Domiciliario[] {
    const t = (termino || '').trim().toLowerCase();
    if (!t) return this.domiciliarios.slice();
    return this.domiciliarios.filter(d =>
      (d.nombre || '').toLowerCase().includes(t) ||
      (d.cedula || '').toLowerCase().includes(t) ||
      (d.vehiculo || '').toLowerCase().includes(t) ||
      (d.placa || '').toLowerCase().includes(t)
    );
  }

  filtrarDomiciliarios(): void {
    this.domiciliariosFiltrados = this.aplicarFiltro(this.filtroTexto);
  }

  crearDomiciliarioVacio(): Partial<Domiciliario> {
    return {
      nombre: '',
      cedula: '',
      telefono: '',
      vehiculo: '',
      placa: '',
      activo: true,
      disponible: true,
      pedidosEntregados: 0
    };
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.domiciliarioSeleccionado = this.crearDomiciliarioVacio();
    this.modoEdicion = false;
  }

  abrirModalAgregarDomiciliario(): void {
    this.modoEdicion = false;
    this.domiciliarioSeleccionado = this.crearDomiciliarioVacio();
    this.mostrarModal = true;
  }

  editarDomiciliario(domiciliario: Domiciliario): void {
    this.modoEdicion = true;
    this.domiciliarioSeleccionado = { ...domiciliario };
    this.mostrarModal = true;
  }

  guardarDomiciliario(): void {
    const d = this.domiciliarioSeleccionado;
    if (!d || !d.nombre || !d.cedula) {
      this.errorMessage = 'Nombre y cédula son obligatorios';
      return;
    }
    this.cargando = true;
    if (this.modoEdicion && d.id != null) {
      this.domiciliarioService.updateDomiciliario(d.id, d as Domiciliario).subscribe({
        next: () => {
          this.cargarDomiciliarios();
          this.loadEstadisticas();
          this.cerrarModal();
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error actualizando domiciliario:', err);
          this.errorMessage = 'No se pudo actualizar el domiciliario';
          this.cargando = false;
        }
      });
    } else {
      this.domiciliarioService.createDomiciliario(d as any).subscribe({
        next: () => {
          this.cargarDomiciliarios();
          this.loadEstadisticas();
          this.cerrarModal();
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error creando domiciliario:', err);
          this.errorMessage = 'No se pudo crear el domiciliario';
          this.cargando = false;
        }
      });
    }
  }

  eliminarDomiciliario(d: Domiciliario): void {
    // Implementación original/previa si existía
    // Este componente parece no eliminar via backend en el código actual
    // Se podría agregar de ser necesario
  }

  toggleDisponibilidad(d: Domiciliario): void {
    this.cargando = true;
    this.domiciliarioService.toggleDomiciliarioStatus(d.id!).subscribe({
      next: () => {
        this.cargarDomiciliarios();
        this.loadEstadisticas();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al alternar disponibilidad:', err);
        this.errorMessage = 'No se pudo actualizar la disponibilidad';
        this.cargando = false;
      }
    });
  }
  trackByDomiciliarioId(index: number, d: Domiciliario): number { return d.id; }
}
