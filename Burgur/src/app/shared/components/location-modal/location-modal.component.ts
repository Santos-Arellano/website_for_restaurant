import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService, RestaurantLocation } from '../../services/location.service';

@Component({
  selector: 'app-location-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="location-modal" [class.active]="isVisible" (click)="onOverlayClick($event)">
      <div class="location-modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2><i class="fas fa-map-marker-alt"></i> {{ restaurantInfo.name }}</h2>
          <button class="close-btn" (click)="onClose()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="location-info">
            <div class="info-item">
              <i class="fas fa-map-marker-alt"></i>
              <div>
                <strong>Dirección:</strong>
                <p>{{ restaurantInfo.address }}</p>
              </div>
            </div>
            
            <div class="info-item">
              <i class="fas fa-phone"></i>
              <div>
                <strong>Teléfono:</strong>
                <p>{{ restaurantInfo.phone }}</p>
              </div>
            </div>
            
            <div class="info-item">
              <i class="fas fa-clock"></i>
              <div>
                <strong>Horarios:</strong>
                <p>{{ restaurantInfo.hours }}</p>
              </div>
            </div>
          </div>
          
          <div class="map-placeholder">
            <i class="fas fa-map"></i>
            <p>Mapa de ubicación</p>
          </div>
          
          <div class="action-buttons">
            <button class="btn btn-primary" (click)="onGetDirections()">
              <i class="fas fa-directions"></i>
              Cómo llegar
            </button>
            
            <button class="btn btn-secondary" (click)="onCall()">
              <i class="fas fa-phone"></i>
              Llamar
            </button>
            
            <button class="btn btn-success" (click)="onWhatsApp()">
              <i class="fab fa-whatsapp"></i>
              WhatsApp
            </button>
            
            <button class="btn btn-info" (click)="onOpenMaps()">
              <i class="fas fa-external-link-alt"></i>
              Ver en Maps
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .location-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      backdrop-filter: blur(8px);
      padding: 20px;
      box-sizing: border-box;
    }

    .location-modal.active {
      opacity: 1;
      visibility: visible;
    }

    .location-modal-content {
      background: linear-gradient(135deg, #1a4a37 0%, #0f2d21 100%);
      border-radius: 20px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    @keyframes modalSlideIn {
      from {
        transform: translateY(-50px) scale(0.9);
        opacity: 0;
      }
      to {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }

    .location-modal-header {
      background: linear-gradient(135deg, #12372a 0%, #0f2d21 100%);
      color: white;
      padding: 25px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
    }

    .location-modal-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
      pointer-events: none;
    }

    .location-modal-header h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
      z-index: 1;
    }

    .location-modal-header h2 i {
      color: #fbb5b5;
      font-size: 1.3rem;
    }

    .location-close {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
    }

    .location-close:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: rotate(90deg);
    }

    .location-modal-body {
      padding: 30px;
      overflow-y: auto;
      flex: 1;
    }

    .location-info {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 30px;
    }

    .location-info-item {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      padding: 15px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      border-left: 4px solid #fbb5b5;
      transition: all 0.3s ease;
    }

    .location-info-item:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateX(5px);
    }

    .location-info-item i {
      color: #fbb5b5;
      font-size: 1.2rem;
      width: 20px;
      text-align: center;
      margin-top: 2px;
    }

    .location-info-item strong {
      color: #fbfada;
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
    }

    .location-info-item p {
      color: #adbc9f;
      margin: 0;
      line-height: 1.4;
    }

    .location-actions {
      display: flex;
      gap: 10px;
      margin-top: 25px;
      flex-wrap: wrap;
    }

    .btn-location,
    .btn-call,
    .btn-whatsapp {
      flex: 1;
      min-width: 120px;
      padding: 12px 15px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-location {
      background: #fbb5b5;
      color: #12372a;
    }

    .btn-location:hover {
      background: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(251, 181, 181, 0.3);
    }

    .btn-call {
      background: #2196f3;
      color: #ffffff;
    }

    .btn-call:hover {
      background: #1976d2;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
    }

    .btn-whatsapp {
      background: #25d366;
      color: #ffffff;
    }

    .btn-whatsapp:hover {
      background: #128c7e;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
    }

    @media (max-width: 768px) {
      .location-modal {
        padding: 10px;
      }

      .location-modal-content {
        width: 95%;
        margin: 20px;
      }

      .location-modal-header,
      .location-modal-body {
        padding: 20px;
      }

      .location-actions {
        flex-direction: column;
      }

      .btn-location,
      .btn-call,
      .btn-whatsapp {
        flex: none;
        width: 100%;
      }
    }
  `]
})
export class LocationModalComponent implements OnInit {
  @Input() isVisible = false;
  @Output() closeModal = new EventEmitter<void>();
  
  restaurantInfo!: RestaurantLocation;

  constructor(private locationService: LocationService) {}

  ngOnInit() {
    this.restaurantInfo = this.locationService.getRestaurantInfo();
  }

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal.emit();
    }
  }

  onClose() {
    this.closeModal.emit();
  }

  onOpenMaps() {
    this.locationService.openGoogleMaps();
  }

  onCall() {
    this.locationService.makePhoneCall();
  }

  onWhatsApp() {
    this.locationService.sendWhatsApp();
  }

  onGetDirections() {
    this.locationService.getDirections();
  }

  openMaps() {
    const address = encodeURIComponent('Carrera 13 #85-32, Bogotá, Colombia');
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(url, '_blank');
  }

  makeCall() {
    window.location.href = 'tel:+571234567890';
  }

  openWhatsApp() {
    const message = encodeURIComponent('Hola! Me gustaría hacer una reserva en Burger Club.');
    const url = `https://wa.me/571234567890?text=${message}`;
    window.open(url, '_blank');
  }
}