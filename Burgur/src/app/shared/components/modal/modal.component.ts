// ==========================================
// BURGER CLUB - ANGULAR MODAL COMPONENT
// ==========================================

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ANIMATION_DURATIONS } from '../../constants/app.constants';

export interface ModalConfig {
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  backdrop?: boolean;
  keyboard?: boolean;
  centered?: boolean;
  scrollable?: boolean;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="modal-overlay"
      [class.show]="isVisible"
      [class.backdrop-enabled]="config.backdrop !== false"
      (click)="onBackdropClick($event)"
    >
      <div 
        class="modal-dialog"
        [class]="getModalClasses()"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="config.title ? 'modal-title' : null"
      >
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header" *ngIf="config.title || config.closable !== false">
            <h4 class="modal-title" id="modal-title" *ngIf="config.title">
              {{ config.title }}
            </h4>
            <button 
              type="button" 
              class="modal-close"
              *ngIf="config.closable !== false"
              (click)="close()"
              aria-label="Cerrar modal"
            >
              &times;
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body" [class.scrollable]="config.scrollable">
            <ng-content></ng-content>
          </div>

          <!-- Footer -->
          <div class="modal-footer" *ngIf="hasFooterContent">
            <ng-content select="[slot=footer]"></ng-content>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      padding: 20px;
      box-sizing: border-box;
    }

    .modal-overlay.show {
      opacity: 1;
      visibility: visible;
    }

    .modal-dialog {
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      max-width: 100%;
      max-height: 100%;
      transform: scale(0.7) translateY(-50px);
      transition: transform 0.3s ease;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .modal-overlay.show .modal-dialog {
      transform: scale(1) translateY(0);
    }

    .modal-dialog.size-sm {
      width: 300px;
    }

    .modal-dialog.size-md {
      width: 500px;
    }

    .modal-dialog.size-lg {
      width: 800px;
    }

    .modal-dialog.size-xl {
      width: 1140px;
    }

    .modal-dialog.centered {
      margin: auto;
    }

    .modal-content {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid #e9ecef;
      background: #f8f9fa;
      border-radius: 8px 8px 0 0;
    }

    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 28px;
      font-weight: 300;
      color: #999;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .modal-close:hover {
      background: #f8f9fa;
      color: #666;
    }

    .modal-body {
      padding: 24px;
      flex: 1;
      overflow-y: auto;
    }

    .modal-body.scrollable {
      max-height: 60vh;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #e9ecef;
      background: #f8f9fa;
      border-radius: 0 0 8px 8px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .modal-overlay {
        padding: 10px;
      }

      .modal-dialog {
        width: 100% !important;
        max-width: none;
        margin: 0;
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding: 16px;
      }

      .modal-body.scrollable {
        max-height: 50vh;
      }
    }

    @media (max-width: 480px) {
      .modal-overlay {
        padding: 5px;
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding: 12px;
      }
    }
  `]
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() isVisible = false;
  @Input() config: ModalConfig = {};
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();

  hasFooterContent = false;

  constructor() {
    // Set default config
    this.config = {
      size: 'md',
      closable: true,
      backdrop: true,
      keyboard: true,
      centered: true,
      scrollable: false,
      ...this.config
    };
  }

  ngOnInit(): void {
    // Check if footer content is provided
    this.hasFooterContent = this.checkFooterContent();
    
    // Prevent body scroll when modal is open
    if (this.isVisible) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy(): void {
    // Restore body scroll
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.config.keyboard !== false && event.key === 'Escape' && this.isVisible) {
      this.close();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.config.backdrop !== false && event.target === event.currentTarget) {
      this.close();
    }
  }

  close(): void {
    if (this.config.closable !== false) {
      this.isVisible = false;
      this.visibleChange.emit(false);
      this.closed.emit();
      
      // Restore body scroll
      document.body.style.overflow = '';
    }
  }

  open(): void {
    this.isVisible = true;
    this.visibleChange.emit(true);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  getModalClasses(): string {
    const classes = [];
    
    if (this.config.size) {
      classes.push(`size-${this.config.size}`);
    }
    
    if (this.config.centered) {
      classes.push('centered');
    }
    
    return classes.join(' ');
  }

  private checkFooterContent(): boolean {
    // This would need to be implemented based on content projection
    // For now, return false as default
    return false;
  }
}