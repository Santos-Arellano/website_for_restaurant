import { Component, OnInit } from '@angular/core';
import { Operador } from '../../../Model/Operador/operador';
import { OperadorService } from '../../../Service/Operador/operador.service';

@Component({
  selector: 'app-admin-operadores',
  templateUrl: './admin-operadores.component.html',
  styleUrls: ['./admin-operadores.component.css']
})
export class AdminOperadoresComponent implements OnInit {
  // Datos
  operadores: Operador[] = [];
  operadoresFiltrados: Operador[] = [];

  // Estadísticas
  totalOperadores: number = 0;
  operadoresDisponibles: number = 0;

  // UI y estado
  filtroTexto: string = '';
  cargando: boolean = false;

  // Modales y formularios
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  mostrarDeleteModal: boolean = false;
  operadorSeleccionado!: Operador;

  constructor(private operadorService: OperadorService) {}

  ngOnInit(): void {
    this.cargarOperadores();
    this.cargarEstadisticas();
    // Inicializa el operador seleccionado evitando usar 'this' en el inicializador de propiedad
    this.operadorSeleccionado = this.crearOperadorVacio();
  }

  // Cargar lista
  cargarOperadores(): void {
    this.cargando = true;
    this.operadorService.obtenerOperadores().subscribe({
      next: (ops: Operador[]) => {
        this.operadores = ops;
        this.operadoresFiltrados = [...ops];
        this.calcularEstadisticas();
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  // Reset de datos a mock
  resetOperadores(): void {
    this.cargando = true;
    this.operadorService.resetOperadores().subscribe({
      next: (ops: Operador[]) => {
        this.operadores = ops;
        this.operadoresFiltrados = [...ops];
        this.calcularEstadisticas();
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  // Cargar estadísticas
  cargarEstadisticas(): void {
    this.operadorService.obtenerEstadisticas().subscribe({
      next: (stats: { totalOperadores: number; operadoresDisponibles: number; operadoresNoDisponibles: number }) => {
        this.totalOperadores = stats.totalOperadores;
        this.operadoresDisponibles = stats.operadoresDisponibles;
      }
    });
  }

  calcularEstadisticas(): void {
    this.totalOperadores = this.operadores.length;
    this.operadoresDisponibles = this.operadores.filter(o => o.disponible).length;
  }

  // Filtrar
  filtrarOperadores(): void {
    const f = this.filtroTexto.trim().toLowerCase();
    if (!f) {
      this.operadoresFiltrados = [...this.operadores];
      return;
    }
    this.operadoresFiltrados = this.operadores.filter(o =>
      (o.nombre || '').toLowerCase().includes(f) ||
      (o.cedula || '').toLowerCase().includes(f)
    );
  }

  // Modales
  abrirModalAgregarOperador(): void {
    this.modoEdicion = false;
    this.operadorSeleccionado = this.crearOperadorVacio();
    this.mostrarModal = true;
  }

  editarOperador(op: Operador): void {
    this.modoEdicion = true;
    this.operadorSeleccionado = { ...op };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.operadorSeleccionado = this.crearOperadorVacio();
  }

  abrirDeleteModal(op: Operador): void {
    this.operadorSeleccionado = { ...op };
    this.mostrarDeleteModal = true;
  }

  cerrarDeleteModal(): void {
    this.mostrarDeleteModal = false;
    this.operadorSeleccionado = this.crearOperadorVacio();
  }

  // CRUD
  guardarOperador(): void {
    this.cargando = true;
    if (this.modoEdicion) {
      this.operadorService.actualizarOperador(this.operadorSeleccionado.id, this.operadorSeleccionado).subscribe({
        next: () => {
          this.cargarOperadores();
          this.cerrarModal();
          this.cargando = false;
        },
        error: (err: unknown) => {
          console.error('Error al actualizar operador:', err);
          this.cargando = false;
        }
      });
    } else {
      const data = {
        nombre: this.operadorSeleccionado.nombre,
        cedula: this.operadorSeleccionado.cedula,
        disponible: this.operadorSeleccionado.disponible,
        domiciliarios: [],
        pedidos: []
      } as Omit<Operador, 'id'>;

      this.operadorService.crearOperador(data).subscribe({
        next: () => {
          this.cargarOperadores();
          this.cerrarModal();
          this.cargando = false;
        },
        error: (err: unknown) => {
          console.error('Error al crear operador:', err);
          this.cargando = false;
        }
      });
    }
  }

  eliminarOperador(id: number): void {
    this.cargando = true;
    this.operadorService.eliminarOperador(id).subscribe({
      next: () => {
        this.cargarOperadores();
        this.cerrarDeleteModal();
        this.cargando = false;
      },
      error: (err: unknown) => {
        console.error('Error al eliminar operador:', err);
        this.cargando = false;
      }
    });
  }

  alternarDisponibilidad(id: number): void {
    this.cargando = true;
    this.operadorService.alternarDisponibilidad(id).subscribe({
      next: () => {
        this.cargarOperadores();
        this.cargando = false;
      },
      error: (err: unknown) => {
        console.error('Error al cambiar disponibilidad:', err);
        this.cargando = false;
      }
    });
  }

  // Auxiliares
  private crearOperadorVacio(): Operador {
    return {
      id: 0,
      nombre: '',
      cedula: '',
      disponible: true,
      domiciliarios: [],
      pedidos: []
    };
  }

  // trackBy para optimizar *ngFor
  trackByOperadorId(index: number, item: Operador): number {
    return item.id;
  }
}