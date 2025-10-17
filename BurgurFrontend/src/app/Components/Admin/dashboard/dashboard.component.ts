import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../../Service/Producto/producto.service';
import { ClienteService } from '../../../Service/Cliente/cliente.service';
import { AdicionalService } from '../../../Service/Adicional/adicional.service';
import { PedidoService } from '../../../Service/Pedido/pedido.service';
import { debugLog } from '../../../utils/logger';
import { Pedido } from '../../../Model/Pedido/pedido';
import { Cliente } from '../../../Model/Cliente/cliente';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Estadísticas del dashboard
  totalProductos: number = 0;
  totalClientes: number = 0;
  totalAdicionales: number = 0;
  totalPedidos: number = 0;
  ventasHoy: number = 0;
  pedidosPendientes: number = 0;
  stockBajo: number = 0;
  clientesActivos: number = 0;
  adicionalesActivos: number = 0;

  // Actividad reciente
  actividadReciente: any[] = [
    { tipo: 'pedido', descripcion: 'Nuevo pedido #1234', tiempo: '2 min ago' },
    { tipo: 'cliente', descripcion: 'Cliente registrado: Juan Pérez', tiempo: '5 min ago' },
    { tipo: 'producto', descripcion: 'Producto actualizado: Hamburguesa Clásica', tiempo: '10 min ago' },
    { tipo: 'pedido', descripcion: 'Pedido completado #1233', tiempo: '15 min ago' }
  ];

  // Pedidos recientes (reales)
  pedidosRecientes: Pedido[] = [];
  // Índice de clientes por id para mostrar nombre en tabla
  clientesIndex: Record<number, Cliente> = {};

  // Top productos (mock)
  topProductos: { nombre: string; ventas: number }[] = [
    { nombre: 'Hamburguesa Clásica', ventas: 120 },
    { nombre: 'Doble Queso', ventas: 95 },
    { nombre: 'BBQ Bacon', ventas: 80 },
    { nombre: 'Vegetariana', ventas: 60 },
    { nombre: 'Papas con Queso', ventas: 150 }
  ];

  // Estado del modal de detalle
  detalleVisible: boolean = false;
  selectedPedido: Pedido | null = null;
  selectedDetalleItems: { producto: string; cantidad: number; precio: number }[] = [];

  // Datos mock de detalle por pedido
  detallePedidosMock: Record<number, { producto: string; cantidad: number; precio: number }[]> = {
    1240: [
      { producto: 'Hamburguesa Clásica', cantidad: 2, precio: 12000 },
      { producto: 'Papas Fritas', cantidad: 1, precio: 8000 },
      { producto: 'Gaseosa', cantidad: 2, precio: 5000 }
    ],
    1239: [
      { producto: 'Doble Queso', cantidad: 1, precio: 18000 },
      { producto: 'Aros de Cebolla', cantidad: 1, precio: 9000 }
    ],
    1238: [
      { producto: 'BBQ Bacon', cantidad: 2, precio: 20000 },
      { producto: 'Papas con Queso', cantidad: 1, precio: 10000 }
    ],
    1237: [
      { producto: 'Vegetariana', cantidad: 1, precio: 16000 }
    ],
    1236: [
      { producto: 'Hamburguesa Clásica', cantidad: 3, precio: 12000 },
      { producto: 'Papas Fritas', cantidad: 2, precio: 8000 }
    ]
  };

  constructor(
    private productoService: ProductoService,
    private clienteService: ClienteService,
    private adicionalService: AdicionalService,
    private pedidoService: PedidoService
  ) { }

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.cargarPedidosRecientes();
  }

  abrirDetallePedido(pedido: Pedido): void {
    this.pedidoService.getPedidoById(pedido.id).subscribe({
      next: (p) => {
        this.selectedPedido = p;
        this.selectedDetalleItems = (p.productos || []).map(it => ({
          producto: it.productoNombre || `#${it.productoId}`,
          cantidad: it.cantidad,
          precio: it.precioUnitario
        }));
        this.detalleVisible = true;
      },
      error: (err) => {
        console.error('Error cargando pedido:', err);
        this.selectedPedido = pedido;
        this.selectedDetalleItems = [];
        this.detalleVisible = true;
      }
    });
  }

  cerrarDetallePedido(): void {
    this.detalleVisible = false;
    this.selectedPedido = null;
    this.selectedDetalleItems = [];
  }

  calcularTotalPedido(items: { producto: string; cantidad: number; precio: number }[]): number {
    return items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  }

  private cargarEstadisticas(): void {
    // Cargar estadísticas de productos
    this.productoService.getProductos().subscribe(productos => {
      this.totalProductos = productos.length;
      this.stockBajo = productos.filter(p => !p.disponible).length;
    });

    // Cargar estadísticas de clientes
    this.clienteService.getAllClientes().subscribe(clientes => {
      this.totalClientes = clientes.length;
      this.clientesActivos = clientes.filter(c => c.activo).length;
      // Construir índice de clientes para mostrar nombres en la tabla
      this.clientesIndex = {};
      for (const c of clientes) {
        this.clientesIndex[c.id] = c;
      }
    });

    // Cargar estadísticas de adicionales
    this.adicionalService.getAdicionales().subscribe(adicionales => {
      this.totalAdicionales = adicionales.length;
      this.adicionalesActivos = adicionales.filter(a => a.activo).length;
    });

    // Estadísticas de pedidos (backend/fallback)
    this.pedidoService.getEstadisticasPedidos().subscribe(stats => {
      this.totalPedidos = stats?.totalPedidos ?? this.totalPedidos;
      this.pedidosPendientes = stats?.pedidosPendientes ?? this.pedidosPendientes;
      this.ventasHoy = stats?.ventasHoy ?? this.ventasHoy;
    });
  }

  private cargarPedidosRecientes(): void {
    this.pedidoService.getPedidos().subscribe(pedidos => {
      const sorted = [...pedidos].sort((a, b) => {
        const ta = new Date(a.fechaCreacion).getTime();
        const tb = new Date(b.fechaCreacion).getTime();
        return tb - ta;
      });
      this.pedidosRecientes = sorted.slice(0, 5);
    });
  }

  formatearPrecio(precio: number): string {
    try {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(precio || 0);
    } catch {
      return `$${precio || 0}`;
    }
  }

  formatearFecha(fecha?: Date | string | null): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    const hoy = new Date();
    const sameDay = d.toDateString() === hoy.toDateString();
    const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return sameDay ? `Hoy ${time}` : d.toLocaleDateString();
  }

  getIconoActividad(tipo: string): string {
    if (tipo === 'pedido') return 'fas fa-receipt';
    if (tipo === 'cliente') return 'fas fa-user-plus';
    if (tipo === 'producto') return 'fas fa-hamburger';
    return 'fas fa-info-circle';
  }

  estadoClase(estado: string): string {
    return String(estado || '').toLowerCase();
  }

  getNombreCliente(id?: number): string {
    if (id == null) return '—';
    const c = this.clientesIndex[id];
    return c ? `${c.nombre} ${c.apellido}` : '—';
  }

  updateAdicionales(): void {
    debugLog('Actualizando relaciones de adicionales...');
    // Recargar estadísticas de adicionales
    this.adicionalService.getEstadisticas().subscribe({
      next: (stats) => {
        this.totalAdicionales = stats.totalAdicionales;
        this.adicionalesActivos = stats.adicionalesActivos;
        debugLog('Relaciones de adicionales actualizadas correctamente');
      },
      error: (error) => {
        console.error('Error al actualizar relaciones de adicionales:', error);
      }
    });
  }

}
