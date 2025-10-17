import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PedidoService } from '../../../Service/Pedido/pedido.service';
import { OperadorSessionService } from '../../../Service/Operador/operador-session.service';
import { ToastService } from '../../Shared/toast/toast.service';
import { Pedido, EstadoPedido } from '../../../Model/Pedido/pedido';
import { DomiciliarioService } from '../../../Service/Domiciliario/domiciliario.service';
import { Domiciliario } from '../../../Model/Domiciliario/domiciliario';
import { ClienteService } from '../../../Service/Cliente/cliente.service';
import { Cliente } from '../../../Model/Cliente/cliente';

@Component({
  selector: 'app-operator-pedidos',
  templateUrl: './operator-pedidos.component.html',
  styleUrls: ['./operator-pedidos.component.css']
})
export class OperatorPedidosComponent implements OnInit {
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

  domId: Record<number, number> = {};
  domDisponibles: Domiciliario[] = [];
  domSeleccionado: Record<number, number> = {};
  clientesMap: Record<number, Cliente> = {};
  domTodosMap: Record<number, Domiciliario> = {};
  accionEnProgreso: Record<number, boolean> = {};

  constructor(
    private pedidoService: PedidoService,
    private operadorSession: OperadorSessionService,
    private router: Router,
    private toast: ToastService,
    private domiciliarioService: DomiciliarioService,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    if (!this.operadorSession.isAuthenticated()) {
      this.router.navigateByUrl('/operador/login');
      return;
    }
    this.cargarPedidos();
    this.cargarDomiciliarios();
    this.cargarTodosDomiciliarios();
    this.cargarClientes();
  }

  cargarPedidos(): void {
    this.loading = true;
    this.pedidoService.getPedidosActivos().subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('No se pudieron cargar los pedidos activos');
      }
    });
  }

  filtrar(estado: string): void {
    this.filtroEstado = estado as any;
  }

  pedidosFiltrados(): Pedido[] {
    if (this.filtroEstado === 'todos') return this.pedidos;
    return this.pedidos.filter(p => p.estado === this.filtroEstado);
  }

  clienteNombre(id: number): string {
    const c = this.clientesMap[id];
    if (!c) return `Cliente #${id}`;
    const nombreCompleto = `${c.nombre ?? ''} ${c.apellido ?? ''}`.trim();
    return nombreCompleto || `Cliente #${id}`;
  }

  domNombre(id?: number): string {
    if (!id) return 'Sin domiciliario';
    const d = this.domTodosMap[id];
    return d ? d.nombre : `Domiciliario #${id}`;
  }

  cambiarEstado(pedido: Pedido, estado: EstadoPedido): void {
    if (pedido.estado === EstadoPedido.ENTREGADO) {
      this.toast.warning('No puedes cambiar el estado de un pedido entregado');
      return;
    }
    this.accionEnProgreso[pedido.id] = true;
    this.pedidoService.updateEstadoPedido(pedido.id!, estado).subscribe({
      next: (actualizado) => {
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

  cargarDomiciliarios(): void {
    this.domiciliarioService.getDomiciliariosDisponibles().subscribe({
      next: (doms) => { this.domDisponibles = doms; },
      error: () => { this.domDisponibles = []; }
    });
  }

  cargarTodosDomiciliarios(): void {
    this.domiciliarioService.getDomiciliarios().subscribe({
      next: (doms) => {
        const map: Record<number, Domiciliario> = {};
        for (const d of doms) map[d.id] = d;
        this.domTodosMap = map;
      },
      error: () => { this.domTodosMap = {}; }
    });
  }

  cargarClientes(): void {
    this.clienteService.getAllClientes().subscribe({
      next: (clientes) => {
        const map: Record<number, Cliente> = {};
        for (const c of clientes) map[c.id] = c;
        this.clientesMap = map;
      },
      error: () => { this.clientesMap = {}; }
    });
  }

  asignarDomiciliario(pedido: Pedido): void {
    const id = this.domSeleccionado[pedido.id];
    if (!id) {
      this.toast.warning('Selecciona un domiciliario disponible');
      return;
    }
    if (pedido.estado !== EstadoPedido.EN_CAMINO) {
      this.toast.warning('Solo puedes asignar domiciliario cuando el pedido está En Camino');
      return;
    }
    this.accionEnProgreso[pedido.id] = true;
    this.pedidoService.asignarDomiciliario(pedido.id, id).subscribe({
      next: () => {
        this.toast.success(`Domiciliario ${id} asignado al pedido ${pedido.id}`);
        this.cargarPedidos();
        this.cargarDomiciliarios();
        this.accionEnProgreso[pedido.id] = false;
      },
      error: (err) => {
        console.error('Error al asignar domiciliario:', err);
        this.toast.error('No se pudo asignar el domiciliario');
        this.accionEnProgreso[pedido.id] = false;
      }
    });
  }

  logout(): void {
    this.operadorSession.logout().subscribe(() => {
      this.router.navigateByUrl('/operador/login');
    });
  }
}