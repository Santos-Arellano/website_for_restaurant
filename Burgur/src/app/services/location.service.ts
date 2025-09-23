import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private isLocationModalOpen = new BehaviorSubject<boolean>(false);
  
  // Restaurant information
  private restaurantInfo = {
    name: 'Burgur Restaurant',
    address: 'Calle 123 #45-67, Bogotá, Colombia',
    phone: '+57 1 234 5678',
    email: 'info@burgur.com',
    hours: {
      weekdays: 'Lunes a Viernes: 11:00 AM - 10:00 PM',
      weekends: 'Sábados y Domingos: 12:00 PM - 11:00 PM'
    },
    coordinates: {
      lat: 4.6097,
      lng: -74.0817
    }
  };

  constructor() { }

  // Modal state management
  openLocationModal(): void {
    console.log('LocationService: openLocationModal called');
    console.log('LocationService: Setting modal state to true');
    this.isLocationModalOpen.next(true);
    console.log('LocationService: Current modal state:', this.isLocationModalOpen.value);
  }

  closeLocationModal(): void {
    this.isLocationModalOpen.next(false);
  }

  isLocationModalOpenObservable() {
    return this.isLocationModalOpen.asObservable();
  }

  isLocationModalOpenValue(): boolean {
    return this.isLocationModalOpen.value;
  }

  // Restaurant information getters
  getRestaurantInfo() {
    return this.restaurantInfo;
  }

  getRestaurantAddress(): string {
    return this.restaurantInfo.address;
  }

  getRestaurantPhone(): string {
    return this.restaurantInfo.phone;
  }

  getRestaurantEmail(): string {
    return this.restaurantInfo.email;
  }

  getRestaurantHours() {
    return this.restaurantInfo.hours;
  }

  getRestaurantCoordinates() {
    return this.restaurantInfo.coordinates;
  }

  // Utility methods
  getDirectionsUrl(): string {
    const { lat, lng } = this.restaurantInfo.coordinates;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  getGoogleMapsUrl(): string {
    const { lat, lng } = this.restaurantInfo.coordinates;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  getPhoneCallUrl(): string {
    return `tel:${this.restaurantInfo.phone}`;
  }

  getEmailUrl(): string {
    return `mailto:${this.restaurantInfo.email}`;
  }

  shareLocation(): void {
    if (navigator.share) {
      navigator.share({
        title: this.restaurantInfo.name,
        text: `Visítanos en ${this.restaurantInfo.address}`,
        url: this.getGoogleMapsUrl()
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      const textToCopy = `${this.restaurantInfo.name}\n${this.restaurantInfo.address}\n${this.getGoogleMapsUrl()}`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        console.log('Location copied to clipboard');
      }).catch(console.error);
    }
  }
}