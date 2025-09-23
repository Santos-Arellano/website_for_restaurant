// ==========================================
// BURGER CLUB - ANGULAR NOTIFICATION COMPONENT
// ==========================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { ANIMATION_DURATIONS } from '../../constants/app.constants';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container" [class]="'position-' + position">
      <div 
        *ngFor="let notification of notifications; trackBy: trackByFn"
        class="notification"
        [class]="'notification-' + notification.type"
        [attr.data-id]="notification.id"
        [@slideIn]
      >
        <div class="notification-content">
          <div class="notification-icon">
            <i [class]="getIconClass(notification.type)"></i>
          </div>
          <div class="notification-message">
            {{ notification.message }}
          </div>
          <button 
            class="notification-close"
            (click)="removeNotification(notification.id)"
            type="button"
            aria-label="Cerrar notificación"
          >
            &times;
          </button>
        </div>
        <div 
          *ngIf="!notification.persistent"
          class="notification-progress"
          [style.animation-duration]="notification.duration + 'ms'"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      z-index: 10000;
      pointer-events: none;
      max-width: 400px;
      width: 100%;
    }

    .position-top-right {
      top: 20px;
      right: 20px;
    }

    .position-top-left {
      top: 20px;
      left: 20px;
    }

    .position-bottom-right {
      bottom: 20px;
      right: 20px;
    }

    .position-bottom-left {
      bottom: 20px;
      left: 20px;
    }

    .notification {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      margin-bottom: 12px;
      overflow: hidden;
      pointer-events: auto;
      position: relative;
      transform: translateX(100%);
      transition: all 0.3s ease;
      min-height: 60px;
      display: flex;
      flex-direction: column;
    }

    .notification.ng-enter {
      transform: translateX(0);
    }

    .notification-success {
      border-left: 4px solid #28a745;
    }

    .notification-warning {
      border-left: 4px solid #ffc107;
    }

    .notification-danger {
      border-left: 4px solid #dc3545;
    }

    .notification-info {
      border-left: 4px solid #17a2b8;
    }

    .notification-content {
      display: flex;
      align-items: center;
      padding: 16px;
      flex: 1;
    }

    .notification-icon {
      margin-right: 12px;
      font-size: 20px;
      width: 24px;
      text-align: center;
    }

    .notification-success .notification-icon {
      color: #28a745;
    }

    .notification-warning .notification-icon {
      color: #ffc107;
    }

    .notification-danger .notification-icon {
      color: #dc3545;
    }

    .notification-info .notification-icon {
      color: #17a2b8;
    }

    .notification-message {
      flex: 1;
      font-size: 14px;
      line-height: 1.4;
      color: #333;
    }

    .notification-close {
      background: none;
      border: none;
      font-size: 20px;
      color: #999;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 12px;
      transition: color 0.2s ease;
    }

    .notification-close:hover {
      color: #666;
    }

    .notification-progress {
      height: 3px;
      background: linear-gradient(90deg, #007bff, #0056b3);
      animation: progress linear;
      transform-origin: left;
    }

    .notification-success .notification-progress {
      background: linear-gradient(90deg, #28a745, #1e7e34);
    }

    .notification-warning .notification-progress {
      background: linear-gradient(90deg, #ffc107, #e0a800);
    }

    .notification-danger .notification-progress {
      background: linear-gradient(90deg, #dc3545, #c82333);
    }

    @keyframes progress {
      from {
        transform: scaleX(1);
      }
      to {
        transform: scaleX(0);
      }
    }

    @media (max-width: 480px) {
      .notification-container {
        left: 10px;
        right: 10px;
        max-width: none;
      }

      .position-top-right,
      .position-top-left {
        top: 10px;
      }

      .position-bottom-right,
      .position-bottom-left {
        bottom: 10px;
      }
    }
  `],
  animations: []
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  position = 'top-right';
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeNotification(id: string): void {
    this.notificationService.remove(id);
  }

  getIconClass(type: string): string {
    const iconMap = {
      success: 'fas fa-check-circle',
      warning: 'fas fa-exclamation-triangle',
      danger: 'fas fa-times-circle',
      info: 'fas fa-info-circle'
    };
    return iconMap[type as keyof typeof iconMap] || iconMap.info;
  }

  trackByFn(index: number, notification: Notification): string {
    return notification.id;
  }
}