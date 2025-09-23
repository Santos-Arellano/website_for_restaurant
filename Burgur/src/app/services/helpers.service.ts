import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelpersService {

  constructor() { }

  /**
   * Format price to Colombian peso format
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  /**
   * Save data to localStorage with error handling
   */
  saveToLocalStorage(key: string, data: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn(`Error saving to localStorage (${key}):`, error);
      return false;
    }
  }

  /**
   * Load data from localStorage with error handling
   */
  loadFromLocalStorage<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error loading from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeFromLocalStorage(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  }

  /**
   * Debounce function for search and other operations
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Throttle function for scroll and resize events
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, delay);
      }
    };
  }

  /**
   * Generate unique ID
   */
  generateId(prefix = 'id'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (Colombian format)
   */
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+57|57)?[1-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Format phone number to Colombian format
   */
  formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+57 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return phone;
  }

  /**
   * Scroll to element smoothly
   */
  scrollToElement(elementId: string, offset = 0): void {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  /**
   * Check if element is in viewport
   */
  isInViewport(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Get device type based on screen width
   */
  getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 992) return 'tablet';
    return 'desktop';
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn('Error copying to clipboard:', error);
      return false;
    }
  }

  /**
   * Format date to local string
   */
  formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return dateObj.toLocaleDateString('es-CO', { ...defaultOptions, ...options });
  }

  /**
   * Calculate distance between two points (for delivery)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in kilometers
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}