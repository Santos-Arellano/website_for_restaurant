// ==========================================
// BURGER CLUB - ANGULAR HELPER UTILITIES
// ==========================================

import { Injectable } from '@angular/core';
import { ANIMATION_DURATIONS, BREAKPOINTS } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class HelpersUtil {

  // ========== UTILITY FUNCTIONS ==========
  throttle<T extends (...args: unknown[]) => unknown>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    let previous = 0;
    
    return function executedFunction(this: unknown, ...args: Parameters<T>): void {
      const now = Date.now();
      const remaining = wait - (now - previous);
      
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        func.apply(this, args);
      } else if (!timeout) {
        timeout = setTimeout(() => {
          previous = Date.now();
          timeout = null;
          func.apply(this, args);
        }, remaining);
      }
    };
  }

  debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number, immediate = false): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    return function executedFunction(this: unknown, ...args: Parameters<T>): void {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      const callNow = immediate && !timeout;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(this, args);
    };
  }

  // ========== FORMAT FUNCTIONS ==========
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  // ========== DEVICE DETECTION ==========
  isMobile(): boolean {
    return window.innerWidth <= BREAKPOINTS.mobile;
  }

  isTablet(): boolean {
    return window.innerWidth > BREAKPOINTS.mobile && window.innerWidth <= BREAKPOINTS.tablet;
  }

  isDesktop(): boolean {
    return window.innerWidth > BREAKPOINTS.tablet;
  }

  isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  // ========== DOM UTILITIES ==========
  createElement(tag: string, className = '', content = ''): HTMLElement {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.textContent = content;
    return element;
  }

  // ========== STORAGE UTILITIES ==========
  saveToLocalStorage(key: string, data: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Error saving to localStorage:', error);
    }
  }

  loadFromLocalStorage<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Error loading from localStorage:', error);
      return defaultValue;
    }
  }

  // ========== IMAGE UTILITIES ==========
  preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  }

  async preloadImages(srcs: string[]): Promise<void[]> {
    return Promise.all(srcs.map(src => this.preloadImage(src)));
  }

  // ========== ANIMATION UTILITIES ==========
  fadeIn(element: HTMLElement, duration = ANIMATION_DURATIONS.normal): void {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    const start = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      element.style.opacity = progress.toString();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  fadeOut(element: HTMLElement, duration = ANIMATION_DURATIONS.normal): void {
    const start = performance.now();
    const initialOpacity = parseFloat(getComputedStyle(element).opacity);
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      element.style.opacity = (initialOpacity * (1 - progress)).toString();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
      }
    };
    
    requestAnimationFrame(animate);
  }

  // ========== SCROLL UTILITIES ==========
  smoothScrollTo(element: HTMLElement, offset = 0): void {
    const targetPosition = element.offsetTop - offset;
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

  getScrollPercentage(): number {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    return (scrollTop / scrollHeight) * 100;
  }

  // ========== VALIDATION UTILITIES ==========
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // ========== STRING UTILITIES ==========
  capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  // ========== PERFORMANCE UTILITIES ==========
  measurePerformance<T>(fn: () => T, label: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${label} took ${end - start} milliseconds`);
    return result;
  }
}