import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { HelpersService } from '../services/helpers.service';
import { AdminStatsComponent } from '../components/admin-stats/admin-stats.component';

interface DashboardStats {
  totalProductos: number;
  totalClientes: number;
  totalAdicionales: number;
  stockBajo: number;
  clientesActivos: number;
  adicionalesActivos: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminStatsComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  isUpdating = false;
  currentTime = '';
  private timeInterval: any;
  private animationFrameId: any;

  dashboardStats: DashboardStats = {
    totalProductos: 25,
    totalClientes: 150,
    totalAdicionales: 12,
    stockBajo: 3,
    clientesActivos: 142,
    adicionalesActivos: 10
  };

  constructor(
    private notificationService: NotificationService,
    private helpersService: HelpersService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.startTimeUpdate();
  }

  ngAfterViewInit(): void {
    this.initializeDashboard();
    this.animateNumbers();
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  loadDashboardData(): void {
    // Simulate loading dashboard statistics
    // In a real app, this would come from a service
    console.log('Loading dashboard data...');
  }

  initializeDashboard(): void {
    // Initialize dashboard functionality
    this.refreshStats();
  }

  refreshStats(): void {
    // Simulate refreshing statistics
    // In a real app, this would make API calls to get current data
  }

  updateAdicionales(): void {
    this.isUpdating = true;
    
    // Simulate updating adicionales relationships
    setTimeout(() => {
      console.log('Adicionales relationships updated');
      this.notificationService.showSuccess('Relaciones de adicionales actualizadas correctamente');
      this.isUpdating = false;
      
      // Refresh stats after update
      this.refreshStats();
    }, 3000);
  }

  startTimeUpdate(): void {
    this.updateTime();
    this.timeInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  updateTime(): void {
    const now = new Date();
    this.currentTime = this.helpersService.formatDate(now);
  }

  animateNumbers(): void {
    const elements = document.querySelectorAll('.stat-number');
    elements.forEach((element: any) => {
      const target = parseInt(element.textContent || '0');
      let current = 0;
      const increment = target / 50;
      
      const animate = () => {
        current += increment;
        if (current < target) {
          element.textContent = Math.floor(current).toString();
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          element.textContent = target.toString();
        }
      };
      
      animate();
    });
  }

  showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    switch (type) {
      case 'success':
        this.notificationService.showSuccess(message);
        break;
      case 'error':
        this.notificationService.showError(message);
        break;
      default:
        this.notificationService.showInfo(message);
    }
  }
}
