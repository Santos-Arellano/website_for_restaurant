import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../../Service/Producto/producto.service';
import { ClienteService } from '../../../Service/Cliente/cliente.service';
import { AdicionalService } from '../../../Service/Adicional/adicional.service';
import { PedidoService } from '../../../Service/Pedido/pedido.service';
import { debugLog } from '../../../utils/logger';

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

  constructor(
    private productoService: ProductoService,
    private clienteService: ClienteService,
    private adicionalService: AdicionalService,
    private pedidoService: PedidoService
  ) { }

  ngOnInit(): void {
    this.cargarEstadisticas();
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
    });

    // Cargar estadísticas de adicionales
    this.adicionalService.getEstadisticas().subscribe(stats => {
      this.totalAdicionales = stats.totalAdicionales;
      this.adicionalesActivos = stats.adicionalesActivos;
    });

    // Cargar estadísticas de pedidos
    this.pedidoService.getEstadisticasPedidos().subscribe(stats => {
      this.totalPedidos = stats.totalPedidos;
      this.pedidosPendientes = stats.pedidosPendientes;
      this.ventasHoy = stats.ventasHoy;
    });
  }

  // Métodos para formatear datos
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  // Método para obtener el icono de actividad
  getIconoActividad(tipo: string): string {
    switch (tipo) {
      case 'pedido': return '📦';
      case 'cliente': return '👤';
      case 'producto': return '🍔';
      default: return '📋';
    }
  }

  // Método para actualizar adicionales
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
