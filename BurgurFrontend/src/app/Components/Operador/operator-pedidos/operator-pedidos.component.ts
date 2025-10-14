import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PedidoService } from '../../../Service/Pedido/pedido.service';
import { OperadorSessionService } from '../../../Service/Operador/operador-session.service';
import { ToastService } from '../../Shared/toast/toast.service';
import { Pedido, EstadoPedido } from '../../../Model/Pedido/pedido';

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
    EstadoPedido.CONFIRMADO,
    EstadoPedido.EN_PREPARACION,
    EstadoPedido.LISTO,
    EstadoPedido.EN_CAMINO,
    EstadoPedido.ENTREGADO,
    EstadoPedido.CANCELADO
  ];

  constructor(
    private pedidoService: PedidoService,
    private operadorSession: OperadorSessionService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    if (!this.operadorSession.isAuthenticated()) {
      this.router.navigateByUrl('/operador/login');
      return;
    }
    this.cargarPedidos();
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

  cambiarEstado(pedido: Pedido, estado: EstadoPedido): void {
    this.pedidoService.updateEstadoPedido(pedido.id!, estado).subscribe({
      next: (actualizado) => {
        this.toast.success(`Estado del pedido ${pedido.id} actualizado a ${estado}`);
        this.cargarPedidos();
      },
      error: () => {
        this.toast.error('Error al actualizar estado del pedido');
      }
    });
  }

  logout(): void {
    this.operadorSession.logout().subscribe(() => {
      this.router.navigateByUrl('/operador/login');
    });
  }
}