import { Injectable, ComponentRef, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConstantsService } from './constants.service';

export interface NotificationOptions {
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  icon?: string | undefined;
  position?: string;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: string;
}

export interface Notification {
  id: string;
  message: string;
  type: string;
  options: NotificationOptions;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private activeNotifications = new Map<string, Notification>();
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private maxNotifications = 5;

  constructor(private constants: ConstantsService) {}

  get notifications$(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }

  show(message: string, type: string = this.constants.NOTIFICATION_TYPES.info, options: NotificationOptions = {}): string {
    const {
      duration = this.constants.CART_CONFIG.autoCloseTimeout,
      persistent = false,
      actions = [],
      icon = undefined,
      position = 'top-right'
    } = options;

    // Remove oldest notification if we have too many
    if (this.activeNotifications.size >= this.maxNotifications) {
      this.removeOldest();
    }

    const notification: Notification = {
      id: this.generateId(),
      message,
      type,
      options: { duration, persistent, actions, icon, position },
      timestamp: new Date()
    };

    this.activeNotifications.set(notification.id, notification);
    this.updateNotifications();

    if (!persistent && duration > 0) {
      setTimeout(() => {
        this.hide(notification.id);
      }, duration);
    }

    return notification.id;
  }

  hide(notificationId: string): void {
    if (this.activeNotifications.has(notificationId)) {
      this.activeNotifications.delete(notificationId);
      this.updateNotifications();
    }
  }

  hideAll(): void {
    this.activeNotifications.clear();
    this.updateNotifications();
  }

  showSuccess(message: string, options: NotificationOptions = {}): string {
    return this.show(message, this.constants.NOTIFICATION_TYPES.success, options);
  }

  showError(message: string, options: NotificationOptions = {}): string {
    return this.show(message, this.constants.NOTIFICATION_TYPES.danger, { ...options, persistent: true });
  }

  showWarning(message: string, options: NotificationOptions = {}): string {
    return this.show(message, this.constants.NOTIFICATION_TYPES.warning, options);
  }

  showInfo(message: string, options: NotificationOptions = {}): string {
    return this.show(message, this.constants.NOTIFICATION_TYPES.info, options);
  }

  showLoading(message: string, options: NotificationOptions = {}): string {
    return this.show(message, 'loading', { ...options, persistent: true });
  }

  showCart(message: string, product: any = null, options: NotificationOptions = {}): string {
    const cartMessage = product ? `${product.nombre} ${message}` : message;
    return this.show(cartMessage, 'cart', {
      ...options,
      icon: '🛒',
      actions: [
        {
          label: 'Ver Carrito',
          action: () => {
            // This will be handled by the cart service
            console.log('Open cart');
          }
        }
      ]
    });
  }

  showOrderUpdate(message: string, orderNumber: string, options: NotificationOptions = {}): string {
    return this.show(`Pedido #${orderNumber}: ${message}`, 'order', {
      ...options,
      icon: '📦',
      actions: [
        {
          label: 'Rastrear',
          action: () => this.trackOrder(orderNumber)
        }
      ]
    });
  }

  showPrompt(message: string, options: NotificationOptions & { 
    confirmText?: string, 
    cancelText?: string,
    onConfirm?: () => void,
    onCancel?: () => void 
  } = {}): string {
    const {
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      onConfirm = () => {},
      onCancel = () => {}
    } = options;

    return this.show(message, 'prompt', {
      ...options,
      persistent: true,
      actions: [
        {
          label: confirmText,
          action: () => {
            onConfirm();
            this.hide(options.toString()); // This would need the notification ID
          },
          style: 'primary'
        },
        {
          label: cancelText,
          action: () => {
            onCancel();
            this.hide(options.toString()); // This would need the notification ID
          },
          style: 'secondary'
        }
      ]
    });
  }

  trackOrder(orderNumber: string): void {
    console.log(`Tracking order: ${orderNumber}`);
    // Implementation for order tracking
  }

  getActiveCount(): number {
    return this.activeNotifications.size;
  }

  hasNotification(id: string): boolean {
    return this.activeNotifications.has(id);
  }

  private removeOldest(): void {
    const oldest = Array.from(this.activeNotifications.values())
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0];
    if (oldest) {
      this.hide(oldest.id);
    }
  }

  private updateNotifications(): void {
    const notifications = Array.from(this.activeNotifications.values());
    this.notificationsSubject.next(notifications);
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}