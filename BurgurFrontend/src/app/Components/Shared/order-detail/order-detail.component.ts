import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidoService } from '../../../Service/Pedido/pedido.service';
import { ToastService } from '../../Shared/toast/toast.service';
import { ClienteService } from '../../../Service/Cliente/cliente.service';
import { Pedido, EstadoPedido, ProductoPedido } from '../../../Model/Pedido/pedido';
import { ProductoService } from '../../../Service/Producto/producto.service';
import { Producto } from '../../../Model/Producto/producto';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  pedido: Pedido | null = null;
  isLoading = true;
  errorMessage = '';
  productosIndex: Record<number, Producto> = {};
  placingOrder = false;
  placeOrderError = '';
  placeOrderSuccess = '';
  // Modal de confirmación
  showConfirmModal = false;
  confirmModalConfig: { title: string; message: string; confirmText: string; cancelText: string; danger: boolean; action?: 'confirmar'|'finalizar'|'cancelar' } = {
    title: 'Confirmación',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    danger: false,
    action: 'confirmar'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoService: PedidoService,
    private productoService: ProductoService,
    private toast: ToastService,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : 0;
    if (!id) {
      this.errorMessage = 'ID de pedido inválido';
      this.isLoading = false;
      return;
    }
    this.pedidoService.getPedidoById(id).subscribe({
      next: (p) => {
        this.pedido = p;
        this.isLoading = false;
        this.loadProductosForPedido();
      },
      error: (err) => {
        console.error('Error cargando pedido:', err);
        this.errorMessage = 'No se pudo cargar el pedido';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  private loadProductosForPedido(): void {
    if (!this.pedido || !this.pedido.productos || this.pedido.productos.length === 0) return;
    const ids = Array.from(new Set(this.pedido.productos.map(i => i.productoId))).filter(id => !!id);
    // Cargar listado de productos y crear índice para imágenes y nombres
    this.productoService.getProductos().subscribe({
      next: (productos) => {
        const index: Record<number, Producto> = {};
        for (const p of productos) index[p.id] = p;
        this.productosIndex = index;
      },
      error: () => {
        // En caso de error, dejamos el índice vacío y usaremos imagen por defecto
        this.productosIndex = {};
      }
    });
  }

  getImageUrl(productoId: number): string {
    const p = this.productosIndex[productoId];
    return (p && p.imagen) ? p.imagen : 'assets/Menu/cheeseburger.png';
  }

  getProductoNombre(productoId: number, fallback?: string): string {
    const p = this.productosIndex[productoId];
    return p?.nombre || fallback || `Producto #${productoId}`;
  }

  getEstadoClass(estado: string): string {
    const e = (estado || '').toString().toLowerCase();
    switch (e) {
      case 'pendiente':
        return 'estado-badge pendiente';
      case 'en_preparacion':
        return 'estado-badge preparacion';
      case 'en_camino':
        return 'estado-badge camino';
      case 'entregado':
        return 'estado-badge entregado';
      case 'cancelado':
        return 'estado-badge cancelado';
      default:
        return 'estado-badge default';
    }
  }

  calcSubtotal(item: ProductoPedido): number {
    const base = (item?.cantidad || 0) * (item?.precioUnitario || 0);
    const adicionales = (item?.adicionales || []).reduce((sum, ad) => sum + (ad?.precioUnitario || 0), 0);
    return base + adicionales;
  }

  puedeHacerPedido(): boolean {
    if (!this.pedido) return false;
    // Solo permite si el estado actual es PENDIENTE o EN_PREPARACION
    const estado = this.pedido.estado;
    return estado === EstadoPedido.PENDIENTE || estado === EstadoPedido.EN_PREPARACION;
  }

  hacerPedido(): void {
    if (!this.pedido) return;
    this.placeOrderError = '';
    this.placeOrderSuccess = '';
    this.placingOrder = true;
    const clienteId = this.pedido.clienteId;

    // Verificar autenticación
    const isLogged = !!localStorage.getItem('currentUser');
    if (!isLogged) {
      this.toast.warning('Debes iniciar sesión para hacer un pedido', 4000);
      this.router.navigate(['/login']);
      this.placingOrder = false;
      return;
    }

    // Validar regla: solo un pedido en progreso por cliente
    this.pedidoService.tienePedidoEnProgreso(clienteId, this.pedido.id).pipe(
    ).subscribe({
      next: (hayEnProgreso) => {
        if (hayEnProgreso) {
          this.placeOrderError = 'Ya tienes un pedido en progreso. Finalízalo antes de hacer otro.';
          this.toast.error(this.placeOrderError, 5000);
          this.placingOrder = false;
          return;
        }
        // Actualizar estado a CONFIRMADO
        this.pedidoService.updateEstadoPedido(this.pedido!.id, EstadoPedido.CONFIRMADO).subscribe({
          next: (pedidoActualizado) => {
            this.pedido = pedidoActualizado;
            this.placeOrderSuccess = 'Pedido confirmado. ¡Estamos en ello!';
            this.toast.success(this.placeOrderSuccess, 3500);
            // Notificar al historial para refrescar
            document.dispatchEvent(new Event('refreshOrders'));
            this.placingOrder = false;
          },
          error: (err) => {
            console.error('Error al confirmar pedido:', err);
            // Si el backend responde 409 (conflicto)
            if (err?.status === 409) {
              this.placeOrderError = 'Conflicto: el pedido fue confirmado desde otro dispositivo.';
              // Refrescar el pedido para reflejar el estado actualizado y deshabilitar el botón
              this.pedidoService.getPedidoById(this.pedido!.id).subscribe({
                next: (pedidoActualizado) => {
                  this.pedido = pedidoActualizado;
                  this.toast.info('El pedido se actualizó desde otro dispositivo', 4000);
                  document.dispatchEvent(new Event('refreshOrders'));
                },
                error: () => {
                  // Silencioso: si falla el refresco, mantenemos el mensaje de conflicto
                }
              });
            } else {
              this.placeOrderError = 'No se pudo confirmar el pedido. Intenta más tarde.';
            }
            this.toast.error(this.placeOrderError, 5000);
            this.placingOrder = false;
          }
        });
      },
      error: (err) => {
        console.error('Error validando pedidos en progreso:', err);
        this.placeOrderError = 'No se pudo validar el estado actual. Intenta más tarde.';
        this.toast.error(this.placeOrderError, 5000);
        this.placingOrder = false;
      }
    });
  }

  // Apertura de modal de confirmación para acciones
  openConfirm(action: 'confirmar'|'finalizar'|'cancelar', message: string, danger = false): void {
    this.confirmModalConfig = {
      title: action === 'cancelar' ? 'Cancelar pedido' : action === 'finalizar' ? 'Finalizar entrega' : 'Confirmar pedido',
      message,
      confirmText: action === 'cancelar' ? 'Cancelar' : 'Confirmar',
      cancelText: 'Volver',
      danger,
      action
    };
    this.showConfirmModal = true;
  }

  onConfirmModalConfirm(): void {
    this.showConfirmModal = false;
    const action = this.confirmModalConfig.action;
    if (action === 'confirmar') {
      this.hacerPedido();
    } else if (action === 'finalizar') {
      this.finalizarEntrega();
    } else if (action === 'cancelar') {
      this.cancelarPedido();
    }
  }

  onConfirmModalCancel(): void {
    this.showConfirmModal = false;
  }

  puedeFinalizarEntrega(): boolean {
    if (!this.pedido) return false;
    return this.pedido.estado === EstadoPedido.EN_CAMINO || this.pedido.estado === EstadoPedido.LISTO;
  }

  puedeCancelarPedido(): boolean {
    if (!this.pedido) return false;
    const e = this.pedido.estado;
    return e === EstadoPedido.PENDIENTE || e === EstadoPedido.EN_PREPARACION || e === EstadoPedido.CONFIRMADO;
  }

  finalizarEntrega(): void {
    if (!this.pedido) return;
    const isLogged = !!localStorage.getItem('currentUser');
    if (!isLogged) {
      this.toast.warning('Debes iniciar sesión para finalizar la entrega', 4000);
      this.router.navigate(['/login']);
      return;
    }
    this.pedidoService.updateEstadoPedido(this.pedido.id, EstadoPedido.ENTREGADO).subscribe({
      next: (pedidoActualizado) => {
        this.pedido = pedidoActualizado;
        this.toast.success('Entrega finalizada. ¡Buen provecho!', 3500);
        document.dispatchEvent(new Event('refreshOrders'));
      },
      error: (err) => {
        console.error('Error al finalizar entrega:', err);
        this.toast.error('No se pudo finalizar la entrega. Intenta más tarde.', 5000);
      }
    });
  }

  cancelarPedido(): void {
    if (!this.pedido) return;
    const isLogged = !!localStorage.getItem('currentUser');
    if (!isLogged) {
      this.toast.warning('Debes iniciar sesión para cancelar el pedido', 4000);
      this.router.navigate(['/login']);
      return;
    }
    // Validar que no esté ya en camino o entregado
    if (this.pedido.estado === EstadoPedido.EN_CAMINO || this.pedido.estado === EstadoPedido.ENTREGADO) {
      this.toast.warning('No puedes cancelar un pedido en camino o entregado', 4000);
      return;
    }
    this.pedidoService.updateEstadoPedido(this.pedido.id, EstadoPedido.CANCELADO).subscribe({
      next: (pedidoActualizado) => {
        this.pedido = pedidoActualizado;
        this.toast.success('Pedido cancelado correctamente', 3500);
        document.dispatchEvent(new Event('refreshOrders'));
      },
      error: (err) => {
        console.error('Error al cancelar pedido:', err);
        this.toast.error('No se pudo cancelar el pedido. Intenta más tarde.', 5000);
      }
    });
  }
}
