// ==========================================
// BURGER CLUB - ANGULAR NOTIFICATION SERVICE
// ==========================================

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NOTIFICATION_TYPES } from '../../shared/constants/app.constants';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  duration?: number;
  persistent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private defaultDuration = 4000; // 4 seconds

  constructor() {
    console.log('🔔 Notification Service initialized');
  }

  // ========== PUBLIC METHODS ==========
  show(message: string, type: 'success' | 'warning' | 'danger' | 'info' = 'info', duration?: number, persistent = false): string {
    const notification: Notification = {
      id: this.generateId(),
      message,
      type,
      duration: duration || this.defaultDuration,
      persistent
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    // Auto-remove notification if not persistent
    if (!persistent) {
      setTimeout(() => {
        this.remove(notification.id);
      }, notification.duration);
    }

    return notification.id;
  }

  success(message: string, duration?: number, persistent = false): string {
    return this.show(message, 'success', duration, persistent);
  }

  warning(message: string, duration?: number, persistent = false): string {
    return this.show(message, 'warning', duration, persistent);
  }

  danger(message: string, duration?: number, persistent = false): string {
    return this.show(message, 'danger', duration, persistent);
  }

  info(message: string, duration?: number, persistent = false): string {
    return this.show(message, 'info', duration, persistent);
  }

  remove(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(notification => notification.id !== id);
    this.notificationsSubject.next(updatedNotifications);
  }

  clear(): void {
    this.notificationsSubject.next([]);
  }

  // ========== PRIVATE METHODS ==========
  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ========== UTILITY METHODS ==========
  getNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  hasNotifications(): boolean {
    return this.notificationsSubject.value.length > 0;
  }

  getNotificationsByType(type: 'success' | 'warning' | 'danger' | 'info'): Notification[] {
    return this.notificationsSubject.value.filter(notification => notification.type === type);
  }
}