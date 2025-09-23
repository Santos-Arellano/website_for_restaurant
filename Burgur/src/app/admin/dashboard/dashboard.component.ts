import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface DashboardStats {
  totalProductos: number;
  totalClientes: number;
  totalAdicionales: number;
  stockBajo: number;
  clientesActivos: number;
  adicionalesActivos: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  stats: DashboardStats = {
    totalProductos: 45,
    totalClientes: 128,
    totalAdicionales: 15,
    stockBajo: 3,
    clientesActivos: 89,
    adicionalesActivos: 12
  };

  ngOnInit() {
    this.loadDashboardData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.animateNumbers();
    }, 500);
  }

  loadDashboardData() {
    // Simular carga de datos del servidor
    console.log('Cargando datos del dashboard...');
    // Aquí se implementaría la llamada al servicio para obtener datos reales
  }

  animateNumbers() {
    const numbers = document.querySelectorAll('.stat-number');
    numbers.forEach(number => {
      const target = parseInt((number as HTMLElement).textContent || '0');
      if (isNaN(target)) return;
      
      let current = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          (number as HTMLElement).textContent = target.toString();
          clearInterval(timer);
        } else {
          (number as HTMLElement).textContent = Math.floor(current).toString();
        }
      }, 30);
    });
  }

  async updateAdicionales() {
    try {
      // Simular llamada al servidor
      console.log('Actualizando adicionales...');
      
      // Aquí se implementaría la llamada real al servicio
      // const response = await this.adminService.updateAdicionales();
      
      // Simulación de respuesta exitosa
      setTimeout(() => {
        alert(`Éxito: Adicionales actualizados correctamente\nAdicionales actualizados: ${this.stats.totalAdicionales}`);
        this.loadDashboardData();
      }, 1000);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar adicionales');
    }
  }

  updateTime() {
    const timeElements = document.querySelectorAll('.activity-time');
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    // Solo actualizar elementos que muestran "Inicio"
    timeElements.forEach(el => {
      if ((el as HTMLElement).textContent === 'Inicio') {
        (el as HTMLElement).textContent = timeStr;
      }
    });
  }
}
