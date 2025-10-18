import { Component, OnInit } from '@angular/core';
import { PedidoService } from '../../../Service/Pedido/pedido.service';
import { DomiciliarioService } from '../../../Service/Domiciliario/domiciliario.service';
import { ToastService } from '../../Shared/toast/toast.service';
import { Pedido, EstadoPedido } from '../../../Model/Pedido/pedido';
import { Domiciliario } from '../../../Model/Domiciliario/domiciliario';
import { ClienteService } from '../../../Service/Cliente/cliente.service';
import { Cliente } from '../../../Model/Cliente/cliente';
import { AdicionalService } from '../../../Service/Adicional/adicional.service';

@Component({
  selector: 'app-admin-pedidos',
  templateUrl: './admin-pedidos.component.html',
  styleUrls: ['./admin-pedidos.component.css']
})
export class AdminPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  loading: boolean = false;
  filtroEstado: EstadoPedido | 'todos' = 'todos';
  EstadoPedido = EstadoPedido;

  estados = [
    EstadoPedido.PENDIENTE,
    EstadoPedido.EN_PREPARACION,
    EstadoPedido.EN_CAMINO,
    EstadoPedido.ENTREGADO
  ];

  domDisponibles: Domiciliario[] = [];
  domSeleccionado: Record<number, number> = {};
  clientesMap: Record<number, Cliente> = {};
  domTodosMap: Record<number, Domiciliario> = {};
  accionEnProgreso: Record<number, boolean> = {};

  adicionalNombreMap: Record<number, string> = {};

  constructor(
    private pedidoService: PedidoService,
    private domiciliarioService: DomiciliarioService,
    private clienteService: ClienteService,
    private adicionalService: AdicionalService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
    this.cargarDomiciliarios();
    this.cargarClientes();
    this.cargarTodosDomiciliarios();
    this.cargarAdicionales();
  }

  cargarPedidos(): void {
    this.loading = true;
    this.pedidoService.getPedidos().subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('No se pudieron cargar los pedidos');
      }
    });
  }

  cargarDomiciliarios(): void {
    this.domiciliarioService.getDomiciliariosDisponibles().subscribe({
      next: (doms) => {
        this.domDisponibles = doms;
      },
      error: () => {
        this.domDisponibles = [];
      }
    });
  }

  cargarClientes(): void {
    this.clienteService.getAllClientes().subscribe({
      next: (clientes) => {
        const map: Record<number, Cliente> = {};
        for (const c of clientes) {
          map[c.id] = c;
        }
        this.clientesMap = map;
      },
      error: () => {
        this.clientesMap = {};
      }
    });
  }

  cargarTodosDomiciliarios(): void {
    this.domiciliarioService.getDomiciliarios().subscribe({
      next: (todos) => {
        const map: Record<number, Domiciliario> = {};
        for (const d of todos) map[d.id] = d;
        this.domTodosMap = map;
      },
      error: () => { this.domTodosMap = {}; }
    });
  }

  cargarAdicionales(): void {
    this.adicionalService.getAdicionales().subscribe({
      next: (ads) => {
        const map: Record<number, string> = {};
        for (const a of ads) map[a.id] = a.nombre;
        this.adicionalNombreMap = map;
      },
      error: () => { this.adicionalNombreMap = {}; }
    });
  }

  clienteNombre(id?: number): string {
    if (id == null) return '—';
    const c = this.clientesMap[id];
    if (!c) return `Cliente #${id}`;
    const nombreCompleto = `${c.nombre ?? ''} ${c.apellido ?? ''}`.trim();
    return nombreCompleto || `Cliente #${id}`;
  }

  domNombre(id?: number): string {
    if (!id) return '-';
    const d = this.domTodosMap[id];
    return d ? d.nombre : `Domiciliario #${id}`;
  }

  getNombreAdicional(id?: number): string {
    if (!id) return '—';
    return this.adicionalNombreMap[id] || `Adicional #${id}`;
  }

  estadoClass(estado?: EstadoPedido): string {
    switch (estado) {
      case EstadoPedido.PENDIENTE: return 'estado-pendiente';
      case EstadoPedido.EN_PREPARACION: return 'estado-preparacion';
      case EstadoPedido.EN_CAMINO: return 'estado-en-camino';
      case EstadoPedido.ENTREGADO: return 'estado-entregado';
      default: return '';
    }
  }

  pedidosFiltrados(): Pedido[] {
    if (this.filtroEstado === 'todos') return this.pedidos;
    return this.pedidos.filter(p => p.estado === this.filtroEstado);
  }

  cambiarEstado(pedido: Pedido, estado: EstadoPedido): void {
    if (pedido.estado === EstadoPedido.ENTREGADO) {
      this.toast.warning('No puedes cambiar el estado de un pedido entregado');
      return;
    }
    // Validar domiciliario antes de enviar
    if (estado === EstadoPedido.EN_CAMINO) {
      const domId = this.domSeleccionado[pedido.id] || pedido.domiciliarioId;
      if (!domId) {
        this.toast.warning('Selecciona un domiciliario antes de marcar como Enviado');
        return;
      }
      this.accionEnProgreso[pedido.id] = true;
      // Primero actualizar a Enviado y luego asignar si hacía falta
      this.pedidoService.updateEstadoPedido(pedido.id!, estado).subscribe({
        next: (pedidoActualizado) => {
           if (pedidoActualizado.estado !== EstadoPedido.EN_CAMINO) {
             this.toast.warning('No se pudo cambiar a Enviado. Intenta de nuevo.');
             this.accionEnProgreso[pedido.id] = false;
             return;
           }
           if (!pedidoActualizado.domiciliarioId && domId) {
             this.domiciliarioService.getDomiciliariosDisponibles().subscribe({
               next: (disponibles) => {
                 const estaDisponible = (disponibles || []).some(d => d.id === domId);
                 if (!estaDisponible) {
                   this.toast.warning('El domiciliario seleccionado no está disponible. Elige otro.');
                   this.cargarDomiciliarios();
                   delete this.domSeleccionado[pedido.id];
                   this.accionEnProgreso[pedido.id] = false;
                   return;
                 }
                 this.pedidoService.asignarDomiciliario(pedido.id!, domId).subscribe({
                   next: () => {
                     this.toast.success(`Pedido ${pedido.id} Enviado y domiciliario asignado`);
                     this.cargarPedidos();
                     this.cargarDomiciliarios();
                     this.accionEnProgreso[pedido.id] = false;
                   },
                   error: (err) => {
                     const msg = typeof err?.error === 'string' ? err.error : 'Pedido Enviado pero fallo al asignar domiciliario';
                     this.toast.error(msg);
                     this.cargarPedidos();
                     this.accionEnProgreso[pedido.id] = false;
                   }
                 });
               },
               error: () => {
                 this.toast.error('No se pudo verificar disponibilidad del domiciliario');
                 this.accionEnProgreso[pedido.id] = false;
               }
             });
           } else {
            this.toast.success(`Estado del pedido ${pedido.id} actualizado a ${estado}`);
            this.cargarPedidos();
            this.accionEnProgreso[pedido.id] = false;
          }
        },
        error: () => {
          this.toast.error('Error al actualizar estado del pedido');
          this.accionEnProgreso[pedido.id] = false;
        }
      });
      return;
    }
    this.accionEnProgreso[pedido.id] = true;
    this.pedidoService.updateEstadoPedido(pedido.id!, estado).subscribe({
      next: () => {
        this.toast.success(`Estado del pedido ${pedido.id} actualizado a ${estado}`);
        this.cargarPedidos();
        this.accionEnProgreso[pedido.id] = false;
      },
      error: () => {
        this.toast.error('Error al actualizar estado del pedido');
        this.accionEnProgreso[pedido.id] = false;
      }
    });
  }

  asignarDomiciliario(pedido: Pedido): void {
    const domId = this.domSeleccionado[pedido.id];
    if (!domId) {
      this.toast.warning('Selecciona un domiciliario disponible');
      return;
    }
    if (pedido.estado !== EstadoPedido.EN_CAMINO) {
      this.toast.warning('Solo puedes asignar domiciliario cuando el pedido está Enviado');
      return;
    }
    this.accionEnProgreso[pedido.id] = true;
    // Verificar disponibilidad en backend antes de asignar
    this.domiciliarioService.getDomiciliariosDisponibles().subscribe({
      next: (disponibles) => {
        const estaDisponible = (disponibles || []).some(d => d.id === domId);
        if (!estaDisponible) {
          this.toast.warning('El domiciliario seleccionado no está disponible. Elige otro.');
          this.cargarDomiciliarios();
          delete this.domSeleccionado[pedido.id];
          this.accionEnProgreso[pedido.id] = false;
          return;
        }
        this.pedidoService.asignarDomiciliario(pedido.id, domId).subscribe({
          next: () => {
            this.toast.success(`Domiciliario ${domId} asignado al pedido ${pedido.id}`);
            this.cargarPedidos();
            this.cargarDomiciliarios();
            this.accionEnProgreso[pedido.id] = false;
          },
          error: (err) => {
            const msg = typeof err?.error === 'string' ? err.error : 'No se pudo asignar el domiciliario';
            this.toast.error(msg);
            this.accionEnProgreso[pedido.id] = false;
          }
        });
      },
      error: () => {
        this.toast.error('No se pudo verificar disponibilidad del domiciliario');
        this.accionEnProgreso[pedido.id] = false;
      }
    });
  }

  // ====== NUEVO: contadores por estado para tarjetas de resumen ======
  countByEstado(estado: EstadoPedido): number {
    return this.pedidos.filter(p => p.estado === estado).length;
  }

  totalPedidos(): number {
    return this.pedidos.length;
  }

  // Interacción: alternar filtro con tarjetas de estado
  toggleFiltroEstado(estado: EstadoPedido): void {
    this.filtroEstado = this.filtroEstado === estado ? 'todos' : estado;
  }

  setFiltroEstado(estado: EstadoPedido | 'todos'): void {
    this.filtroEstado = estado;
  }

  trackByPedidoId(index: number, p: Pedido): number { return p.id; }

  detalleVisible: boolean = false;
  pedidoSeleccionado: Pedido | null = null;
  detalleItems: { producto: string; cantidad: number; precio: number }[] = [];

  abrirDetallePedido(pedido: Pedido): void {
    this.pedidoService.getPedidoById(pedido.id).subscribe({
      next: (p) => {
        this.pedidoSeleccionado = p || pedido;
        this.detalleItems = (this.pedidoSeleccionado.productos || []).map(it => ({
          producto: it.productoNombre || `#${it.productoId}`,
          cantidad: it.cantidad,
          precio: it.precioUnitario
        }));
        this.detalleVisible = true;
      },
      error: (err) => {
        console.error('Error cargando pedido:', err);
        this.pedidoSeleccionado = pedido;
        this.detalleItems = [];
        this.detalleVisible = true;
      }
    });
  }

  cerrarDetallePedido(): void {
    this.detalleVisible = false;
    this.pedidoSeleccionado = null;
    this.detalleItems = [];
  }

  calcularTotalPedido(items: { producto: string; cantidad: number; precio: number }[]): number {
    return items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  }

  calcularTotalPedidoSeleccionado(): number {
    const p = this.pedidoSeleccionado;
    if (!p || !p.productos) return 0;
    return p.productos.reduce((sum, item) => {
      const base = (item.precioUnitario || 0) * (item.cantidad || 0);
      const extras = (item.adicionales || []).reduce((s, a) => s + (a.precioUnitario || 0) * (item.cantidad || 0), 0);
      return sum + base + extras;
    }, 0);
  }

  formatearPrecio(precio: number): string {
    try {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(precio || 0);
    } catch {
      return `$${precio || 0}`;
    }
  }
}