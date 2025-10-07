import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration?: number; // ms
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();
  private idCounter = 1;

  show(message: string, type: ToastType = 'info', duration = 3000): number {
    const id = this.idCounter++;
    const toast: Toast = { id, message, type, duration };
    const current = this.toastsSubject.getValue();
    this.toastsSubject.next([...current, toast]);

    if (duration && duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
    return id;
  }

  success(message: string, duration = 3000) { return this.show(message, 'success', duration); }
  info(message: string, duration = 3000) { return this.show(message, 'info', duration); }
  warning(message: string, duration = 4000) { return this.show(message, 'warning', duration); }
  error(message: string, duration = 5000) { return this.show(message, 'error', duration); }

  dismiss(id: number) {
    const filtered = this.toastsSubject.getValue().filter(t => t.id !== id);
    this.toastsSubject.next(filtered);
  }

  clear() {
    this.toastsSubject.next([]);
  }
}