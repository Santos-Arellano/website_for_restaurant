import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PedidoService } from '../../../Service/Pedido/pedido.service';
import { ClienteService } from '../../../Service/Cliente/cliente.service';
import { Pedido } from '../../../Model/Pedido/pedido';
import { Cliente } from '../../../Model/Cliente/cliente';
import { ToastService } from '../../Shared/toast/toast.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit, OnDestroy {
  pedidos: Pedido[] = [];
  currentCliente: Cliente | null = null;
  isLoading = true;
  errorMessage = '';

  private refreshHandler?: () => void;

  constructor(
    private pedidoService: PedidoService,
    private clienteService: ClienteService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCurrentCliente();
    // Escuchar evento global para refrescar pedidos
    this.refreshHandler = () => {
      this.refreshOrders();
      this.toast.info('Pedidos actualizados', 2500);
    };
    document.addEventListener('refreshOrders', this.refreshHandler);
  }

  ngOnDestroy(): void {
    if (this.refreshHandler) {
      document.removeEventListener('refreshOrders', this.refreshHandler);
    }
  }

  private loadCurrentCliente(): void {
    const cliente = this.clienteService.getCurrentCliente();
    if (cliente) {
      this.currentCliente = cliente;
      this.loadPedidos();
    } else {
      this.router.navigate(['/login']);
    }
  }

  private loadPedidos(): void {
    if (!this.currentCliente) return;

    this.isLoading = true;
    this.pedidoService.getPedidosCliente(this.currentCliente.id).subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos.sort((a, b) => 
          new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
        );
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar pedidos:', error);
        this.errorMessage = 'Error al cargar el historial de pedidos';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  viewOrderDetails(pedidoId: number): void {
    this.router.navigate(['/orders', pedidoId]);
  }

  getEstadoClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'estado-pendiente';
      case 'en_preparacion':
        return 'estado-preparacion';
      case 'en_camino':
        return 'estado-camino';
      case 'entregado':
        return 'estado-entregado';
      case 'cancelado':
        return 'estado-cancelado';
      default:
        return 'estado-default';
    }
  }

  getEstadoText(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_preparacion':
        return 'En Preparación';
      case 'en_camino':
        return 'En Camino';
      case 'entregado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  }

  refreshOrders(): void {
    this.loadPedidos();
  }
}
