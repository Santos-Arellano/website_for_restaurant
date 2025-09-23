import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { HelpersService } from '../../services/helpers.service';

interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topSellingProduct: string;
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  completedOrders: number;
}

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-stats-container">
      <div class="stats-header">
        <h2><i class="fas fa-chart-bar"></i> Estadísticas Avanzadas</h2>
        <button class="refresh-btn" (click)="refreshStats()" [disabled]="isLoading">
          <i class="fas fa-sync-alt" [class.fa-spin]="isLoading"></i>
          {{isLoading ? 'Actualizando...' : 'Actualizar'}}
        </button>
      </div>

      <div class="advanced-stats-grid">
        <div class="advanced-stat-card revenue">
          <div class="stat-header">
            <i class="fas fa-dollar-sign"></i>
            <span class="stat-title">Ingresos Totales</span>
          </div>
          <div class="stat-value">{{formatCurrency(stats.totalRevenue)}}</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            <span>+12.5% vs mes anterior</span>
          </div>
        </div>

        <div class="advanced-stat-card orders">
          <div class="stat-header">
            <i class="fas fa-shopping-cart"></i>
            <span class="stat-title">Pedidos Totales</span>
          </div>
          <div class="stat-value">{{stats.totalOrders}}</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            <span>+8.3% vs mes anterior</span>
          </div>
        </div>

        <div class="advanced-stat-card average">
          <div class="stat-header">
            <i class="fas fa-calculator"></i>
            <span class="stat-title">Valor Promedio</span>
          </div>
          <div class="stat-value">{{formatCurrency(stats.averageOrderValue)}}</div>
          <div class="stat-change neutral">
            <i class="fas fa-minus"></i>
            <span>Sin cambios</span>
          </div>
        </div>

        <div class="advanced-stat-card product">
          <div class="stat-header">
            <i class="fas fa-star"></i>
            <span class="stat-title">Más Vendido</span>
          </div>
          <div class="stat-value product-name">{{stats.topSellingProduct}}</div>
          <div class="stat-change positive">
            <i class="fas fa-fire"></i>
            <span>Tendencia</span>
          </div>
        </div>
      </div>

      <div class="daily-stats">
        <h3><i class="fas fa-calendar-day"></i> Estadísticas de Hoy</h3>
        <div class="daily-grid">
          <div class="daily-stat">
            <div class="daily-number">{{stats.ordersToday}}</div>
            <div class="daily-label">Pedidos Hoy</div>
          </div>
          <div class="daily-stat">
            <div class="daily-number">{{formatCurrency(stats.revenueToday)}}</div>
            <div class="daily-label">Ingresos Hoy</div>
          </div>
          <div class="daily-stat">
            <div class="daily-number">{{stats.pendingOrders}}</div>
            <div class="daily-label">Pendientes</div>
          </div>
          <div class="daily-stat">
            <div class="daily-number">{{stats.completedOrders}}</div>
            <div class="daily-label">Completados</div>
          </div>
        </div>
      </div>

      <div class="chart-section">
        <h3><i class="fas fa-chart-line"></i> Tendencias</h3>
        <div class="chart-placeholder">
          <i class="fas fa-chart-area"></i>
          <p>Gráfico de tendencias de ventas</p>
          <small>Integración con biblioteca de gráficos pendiente</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-stats-container {
      background: var(--card-bg);
      border-radius: var(--border-radius);
      padding: 2rem;
      margin: 2rem 0;
      box-shadow: var(--shadow);
    }

    .stats-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid var(--primary-color);
    }

    .stats-header h2 {
      color: var(--text-light);
      font-family: var(--font-primary);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .refresh-btn {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: var(--border-radius);
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .refresh-btn:hover:not(:disabled) {
      background: #e55a2b;
      transform: translateY(-2px);
    }

    .refresh-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .advanced-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .advanced-stat-card {
      background: linear-gradient(135deg, var(--secondary-color) 0%, #34495e 100%);
      border-radius: var(--border-radius);
      padding: 1.5rem;
      border-left: 4px solid var(--primary-color);
      transition: transform 0.3s ease;
    }

    .advanced-stat-card:hover {
      transform: translateY(-3px);
    }

    .stat-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .stat-header i {
      color: var(--primary-color);
      font-size: 1.2rem;
    }

    .stat-title {
      color: var(--text-muted);
      font-size: 0.9rem;
      font-weight: 500;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-light);
      margin-bottom: 0.5rem;
    }

    .stat-value.product-name {
      font-size: 1.2rem;
      font-weight: 600;
    }

    .stat-change {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .stat-change.positive {
      color: var(--success-color);
    }

    .stat-change.neutral {
      color: var(--text-muted);
    }

    .daily-stats {
      margin-bottom: 2rem;
    }

    .daily-stats h3 {
      color: var(--text-light);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .daily-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .daily-stat {
      background: var(--secondary-color);
      padding: 1rem;
      border-radius: var(--border-radius);
      text-align: center;
      border: 2px solid transparent;
      transition: border-color 0.3s ease;
    }

    .daily-stat:hover {
      border-color: var(--primary-color);
    }

    .daily-number {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 0.5rem;
    }

    .daily-label {
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    .chart-section {
      margin-top: 2rem;
    }

    .chart-section h3 {
      color: var(--text-light);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .chart-placeholder {
      background: var(--secondary-color);
      border: 2px dashed var(--text-muted);
      border-radius: var(--border-radius);
      padding: 3rem;
      text-align: center;
      color: var(--text-muted);
    }

    .chart-placeholder i {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: var(--primary-color);
    }

    .chart-placeholder p {
      margin: 0.5rem 0;
      font-size: 1.1rem;
    }

    .chart-placeholder small {
      font-size: 0.85rem;
      opacity: 0.7;
    }

    @media (max-width: 768px) {
      .stats-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .advanced-stats-grid {
        grid-template-columns: 1fr;
      }

      .daily-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class AdminStatsComponent implements OnInit, OnDestroy {
  isLoading = false;
  private refreshInterval: any;

  stats: AdminStats = {
    totalOrders: 1247,
    totalRevenue: 45680.50,
    averageOrderValue: 36.65,
    topSellingProduct: 'Burger Clásica',
    ordersToday: 23,
    revenueToday: 847.30,
    pendingOrders: 5,
    completedOrders: 18
  };

  constructor(
    private productService: ProductService,
    private notificationService: NotificationService,
    private helpersService: HelpersService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadStats(): void {
    // Simulate loading real stats from API
    // In a real application, this would fetch from a backend service
    console.log('Loading admin statistics...');
  }

  refreshStats(): void {
    this.isLoading = true;
    
    setTimeout(() => {
      // Simulate API call with random variations
      this.stats = {
        ...this.stats,
        ordersToday: this.stats.ordersToday + Math.floor(Math.random() * 3),
        revenueToday: this.stats.revenueToday + (Math.random() * 100),
        pendingOrders: Math.max(0, this.stats.pendingOrders + Math.floor(Math.random() * 3) - 1)
      };
      
      this.isLoading = false;
      this.notificationService.showSuccess('Estadísticas actualizadas correctamente');
    }, 1500);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  }

  startAutoRefresh(): void {
    // Auto-refresh stats every 5 minutes
    this.refreshInterval = setInterval(() => {
      this.refreshStats();
    }, 300000);
  }
}