import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Adicional {
  id: number;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
  available: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdicionalesService {
  private adicionales: Adicional[] = [
    // Quesos
    {
      id: 1,
      name: 'Queso Cheddar',
      price: 2000,
      category: 'quesos',
      description: 'Queso cheddar derretido',
      available: true
    },
    {
      id: 2,
      name: 'Queso Mozzarella',
      price: 2500,
      category: 'quesos',
      description: 'Queso mozzarella fresco',
      available: true
    },
    {
      id: 3,
      name: 'Queso Suizo',
      price: 3000,
      category: 'quesos',
      description: 'Queso suizo premium',
      available: true
    },
    
    // Carnes
    {
      id: 4,
      name: 'Tocino',
      price: 3500,
      category: 'carnes',
      description: 'Tocino crujiente',
      available: true
    },
    {
      id: 5,
      name: 'Carne Extra',
      price: 5000,
      category: 'carnes',
      description: 'Porción adicional de carne',
      available: true
    },
    {
      id: 6,
      name: 'Pollo Grillé',
      price: 4000,
      category: 'carnes',
      description: 'Pechuga de pollo a la plancha',
      available: true
    },
    
    // Vegetales
    {
      id: 7,
      name: 'Aguacate',
      price: 2500,
      category: 'vegetales',
      description: 'Aguacate fresco en láminas',
      available: true
    },
    {
      id: 8,
      name: 'Cebolla Caramelizada',
      price: 2000,
      category: 'vegetales',
      description: 'Cebolla dulce caramelizada',
      available: true
    },
    {
      id: 9,
      name: 'Champiñones',
      price: 2500,
      category: 'vegetales',
      description: 'Champiñones salteados',
      available: true
    },
    {
      id: 10,
      name: 'Jalapeños',
      price: 1500,
      category: 'vegetales',
      description: 'Jalapeños en rodajas',
      available: true
    },
    
    // Salsas
    {
      id: 11,
      name: 'Salsa BBQ',
      price: 1000,
      category: 'salsas',
      description: 'Salsa barbacoa casera',
      available: true
    },
    {
      id: 12,
      name: 'Salsa Ranch',
      price: 1000,
      category: 'salsas',
      description: 'Salsa ranch cremosa',
      available: true
    },
    {
      id: 13,
      name: 'Salsa Picante',
      price: 1000,
      category: 'salsas',
      description: 'Salsa picante de la casa',
      available: true
    },
    {
      id: 14,
      name: 'Mayonesa de Ajo',
      price: 1200,
      category: 'salsas',
      description: 'Mayonesa con ajo fresco',
      available: true
    }
  ];

  private adicionalesSubject = new BehaviorSubject<Adicional[]>(this.adicionales);

  constructor() { }

  getAdicionales(): Observable<Adicional[]> {
    return this.adicionalesSubject.asObservable();
  }

  getAdicionalesByCategory(category: string): Adicional[] {
    return this.adicionales.filter(adicional => 
      adicional.category.toLowerCase() === category.toLowerCase() && adicional.available
    );
  }

  getAdicionalesByProduct(productId: number): Adicional[] {
    // Por ahora retornamos todos los adicionales disponibles
    // En una implementación real, esto podría filtrar por tipo de producto
    return this.adicionales.filter(adicional => adicional.available);
  }

  getAdicionalById(id: number): Adicional | undefined {
    return this.adicionales.find(adicional => adicional.id === id);
  }

  getCategories(): string[] {
    const categories = [...new Set(this.adicionales.map(adicional => adicional.category))];
    return categories;
  }

  calculateAdicionalesPrice(selectedAdicionales: Adicional[]): number {
    return selectedAdicionales.reduce((total, adicional) => total + adicional.price, 0);
  }

  isAdicionalAvailable(id: number): boolean {
    const adicional = this.getAdicionalById(id);
    return adicional ? adicional.available : false;
  }

  toggleAdicionalAvailability(id: number): void {
    const adicional = this.adicionales.find(a => a.id === id);
    if (adicional) {
      adicional.available = !adicional.available;
      this.adicionalesSubject.next([...this.adicionales]);
    }
  }

  addAdicional(adicional: Omit<Adicional, 'id'>): void {
    const newId = Math.max(...this.adicionales.map(a => a.id)) + 1;
    const newAdicional = { ...adicional, id: newId };
    this.adicionales.push(newAdicional);
    this.adicionalesSubject.next([...this.adicionales]);
  }

  updateAdicional(id: number, updatedAdicional: Partial<Adicional>): void {
    const index = this.adicionales.findIndex(adicional => adicional.id === id);
    if (index !== -1) {
      this.adicionales[index] = { ...this.adicionales[index], ...updatedAdicional };
      this.adicionalesSubject.next([...this.adicionales]);
    }
  }

  deleteAdicional(id: number): void {
    this.adicionales = this.adicionales.filter(adicional => adicional.id !== id);
    this.adicionalesSubject.next([...this.adicionales]);
  }
}