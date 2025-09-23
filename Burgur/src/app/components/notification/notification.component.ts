import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container" [class]="'position-' + position">
      <div 
        *ngFor="let notification of notifications; trackBy: trackByNotification"
        class="notification"
        [class]="'notification-' + notification.type"
        [attr.data-id]="notification.id"
      >
        <div class="notification-content">
          <div class="notification-icon" *ngIf="notification.options.icon">
            {{ notification.options.icon }}
          </div>
          <div class="notification-message">
            {{ notification.message }}
          </div>
          <div class="notification-actions" *ngIf="notification.options.actions && notification.options.actions.length > 0">
            <button 
              *ngFor="let action of notification.options.actions"
              class="notification-action"
              [class]="'btn-' + (action.style || 'primary')"
              (click)="executeAction(action)"
            >
              {{ action.label }}
            </button>
          </div>
          <button 
            class="notification-close"
            (click)="closeNotification(notification.id)"
            *ngIf="!notification.options.persistent"
          >
            ×
          </button>
        </div>
        <div 
          class="notification-progress"
          *ngIf="!notification.options.persistent && notification.options.duration"
          [style.animation-duration]="notification.options.duration + 'ms'"
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
      transform: translateX(100%);
      animation: slideIn 0.3s ease-out forwards;
      position: relative;
    }

    .notification-success {
      border-left: 4px solid #28a745;
    }

    .notification-danger {
      border-left: 4px solid #dc3545;
    }

    .notification-warning {
      border-left: 4px solid #ffc107;
    }

    .notification-info {
      border-left: 4px solid #17a2b8;
    }

    .notification-cart {
      border-left: 4px solid #007bff;
    }

    .notification-loading {
      border-left: 4px solid #6c757d;
    }

    .notification-content {
      padding: 16px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .notification-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .notification-message {
      flex: 1;
      font-size: 14px;
      line-height: 1.4;
      color: #333;
    }

    .notification-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .notification-action {
      padding: 4px 12px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background-color: #0056b3;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #545b62;
    }

    .notification-close {
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #999;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-close:hover {
      color: #333;
    }

    .notification-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background-color: rgba(0, 0, 0, 0.2);
      animation: progress linear;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes progress {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }

    @media (max-width: 768px) {
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
  `]
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

  trackByNotification(index: number, notification: Notification): string {
    return notification.id;
  }

  closeNotification(id: string): void {
    this.notificationService.hide(id);
  }

  executeAction(action: any): void {
    if (action.action && typeof action.action === 'function') {
      action.action();
    }
  }
}