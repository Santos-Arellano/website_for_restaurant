import { Injectable } from '@angular/core';

export interface RestaurantLocation {
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  hours: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private restaurantInfo: RestaurantLocation = {
    name: 'Burger Club',
    address: 'Carrera 13 #85-32, Bogotá, Colombia',
    phone: '+57 123 456 7890',
    whatsapp: '+57 123 456 7890',
    coordinates: {
      lat: 4.6097,
      lng: -74.0817
    },
    hours: 'Lun - Dom: 11:00 AM - 11:00 PM'
  };

  constructor() { }

  getRestaurantInfo(): RestaurantLocation {
    return this.restaurantInfo;
  }

  openGoogleMaps(): void {
    const { lat, lng } = this.restaurantInfo.coordinates;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  }

  makePhoneCall(): void {
    window.open(`tel:${this.restaurantInfo.phone}`, '_self');
  }

  sendWhatsApp(): void {
    const message = encodeURIComponent(`¡Hola! Me gustaría hacer una reserva en ${this.restaurantInfo.name}`);
    const url = `https://wa.me/${this.restaurantInfo.whatsapp.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(url, '_blank');
  }

  getDirections(): void {
    const address = encodeURIComponent(this.restaurantInfo.address);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
    window.open(url, '_blank');
  }
}