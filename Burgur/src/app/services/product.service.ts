import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imgURL: string;
  ingredientes?: string[];
  nuevo?: boolean;
  popular?: boolean;
  adicionales?: number[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly STORAGE_KEY = 'restaurant_products';
  private defaultProducts: Product[] = [
    {
      id: 1,
      nombre: 'Burger Clásica',
      descripcion: 'Hamburguesa tradicional con carne, lechuga, tomate y queso',
      precio: 15000,
      categoria: 'hamburguesa',
      imgURL: 'assets/images/menu/BURGER.png',
      ingredientes: ['Carne de res', 'Lechuga', 'Tomate', 'Queso', 'Pan'],
      popular: true
    },
    {
      id: 2,
      nombre: 'Burger BBQ',
      descripcion: 'Hamburguesa con salsa BBQ, cebolla caramelizada y tocino',
      precio: 18000,
      categoria: 'hamburguesa',
      imgURL: 'assets/images/menu/BBQ-especial.png',
      ingredientes: ['Carne de res', 'Salsa BBQ', 'Cebolla', 'Tocino', 'Pan'],
      nuevo: true
    },
    {
      id: 3,
      nombre: 'Burger Vegetariana',
      descripcion: 'Hamburguesa con proteína vegetal, aguacate y vegetales frescos',
      precio: 16000,
      categoria: 'hamburguesa',
      imgURL: 'assets/images/menu/veggieburger.png',
      ingredientes: ['Proteína vegetal', 'Aguacate', 'Lechuga', 'Tomate', 'Pan integral']
    },
    {
      id: 4,
      nombre: 'Papas Fritas',
      descripcion: 'Papas fritas crujientes con sal marina',
      precio: 8000,
      categoria: 'acompañamiento',
      imgURL: 'assets/images/menu/Fries.png',
      ingredientes: ['Papas', 'Sal marina']
    },
    {
      id: 5,
      nombre: 'Aros de Cebolla',
      descripcion: 'Aros de cebolla empanizados y fritos',
      precio: 9000,
      categoria: 'acompañamiento',
      imgURL: 'assets/images/menu/aros-cebolla.png',
      ingredientes: ['Cebolla', 'Harina', 'Especias']
    },
    {
      id: 6,
      nombre: 'Perro Especial',
      descripcion: 'Perro caliente con salsas especiales y vegetales',
      precio: 12000,
      categoria: 'perro caliente',
      imgURL: 'assets/images/menu/hot-dog.png',
      ingredientes: ['Salchicha', 'Pan', 'Salsas', 'Vegetales']
    },
    {
      id: 7,
      nombre: 'Perro Gratinado',
      descripcion: 'Perro caliente con queso gratinado y tocino',
      precio: 14000,
      categoria: 'perro caliente',
      imgURL: 'assets/images/menu/cheese-dog.png',
      ingredientes: ['Salchicha', 'Pan', 'Queso', 'Tocino']
    },
    {
      id: 8,
      nombre: 'Coca Cola',
      descripcion: 'Bebida refrescante 350ml',
      precio: 5000,
      categoria: 'bebida',
      imgURL: 'assets/images/menu/Coke.png'
    },
    {
      id: 9,
      nombre: 'Jugo Natural',
      descripcion: 'Jugo natural de frutas frescas',
      precio: 6000,
      categoria: 'bebida',
      imgURL: 'assets/images/menu/orange-juice.png',
      ingredientes: ['Frutas frescas', 'Agua']
    },
    {
      id: 10,
      nombre: 'Helado de Vainilla',
      descripcion: 'Delicioso helado artesanal de vainilla',
      precio: 7000,
      categoria: 'postre',
      imgURL: 'assets/images/menu/ice-cream-cup.png',
      ingredientes: ['Leche', 'Vainilla', 'Azúcar']
    },
    {
      id: 11,
      nombre: 'Brownie con Helado',
      descripcion: 'Brownie de chocolate caliente con helado de vainilla',
      precio: 9000,
      categoria: 'postre',
      imgURL: 'assets/images/menu/Brownie.png',
      ingredientes: ['Chocolate', 'Harina', 'Helado de vainilla']
    }
  ];

  private products: Product[] = [];
  private productsSubject = new BehaviorSubject<Product[]>([]);

  constructor() { 
    this.loadProducts();
  }

  private loadProducts(): void {
    const storedProducts = localStorage.getItem(this.STORAGE_KEY);
    console.log('🔍 Cargando productos desde localStorage:', storedProducts ? 'Datos encontrados' : 'No hay datos');
    
    if (storedProducts) {
      try {
        this.products = JSON.parse(storedProducts);
        console.log('✅ Productos cargados desde localStorage:', this.products.length, 'productos');
      } catch (error) {
        console.error('❌ Error parsing stored products:', error);
        this.products = [...this.defaultProducts];
        console.log('🔄 Usando productos por defecto debido al error');
      }
    } else {
      this.products = [...this.defaultProducts];
      console.log('🆕 Usando productos por defecto (primera vez)');
    }
    this.productsSubject.next([...this.products]);
  }

  private saveProducts(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products));
      console.log('💾 Productos guardados en localStorage:', this.products.length, 'productos');
    } catch (error) {
      console.error('❌ Error saving products to localStorage:', error);
    }
  }

  getProducts(): Observable<Product[]> {
    return this.productsSubject.asObservable();
  }

  getProductById(id: number): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  getProductsByCategory(category: string): Product[] {
    return this.products.filter(product => 
      product.categoria.toLowerCase() === category.toLowerCase()
    );
  }

  searchProducts(term: string): Product[] {
    const searchTerm = term.toLowerCase();
    return this.products.filter(product =>
      product.nombre.toLowerCase().includes(searchTerm) ||
      product.descripcion.toLowerCase().includes(searchTerm) ||
      (product.ingredientes && product.ingredientes.some(ing => 
        ing.toLowerCase().includes(searchTerm)
      ))
    );
  }

  getCategories(): string[] {
    const categories = [...new Set(this.products.map(product => product.categoria))];
    return categories;
  }

  addProduct(product: Product): void {
    const newId = Math.max(...this.products.map(p => p.id)) + 1;
    const newProduct = { ...product, id: newId };
    this.products.push(newProduct);
    console.log('➕ Producto agregado:', newProduct.nombre, 'ID:', newId);
    this.saveProducts();
    this.productsSubject.next([...this.products]);
  }

  updateProduct(id: number, updatedProduct: Partial<Product>): void {
    const index = this.products.findIndex(product => product.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updatedProduct };
      console.log('✏️ Producto actualizado:', this.products[index].nombre, 'ID:', id);
      this.saveProducts();
      this.productsSubject.next([...this.products]);
    } else {
      console.warn('⚠️ Producto no encontrado para actualizar, ID:', id);
    }
  }

  deleteProduct(id: number): void {
    const productToDelete = this.products.find(p => p.id === id);
    this.products = this.products.filter(product => product.id !== id);
    console.log('🗑️ Producto eliminado:', productToDelete?.nombre || 'Desconocido', 'ID:', id);
    this.saveProducts();
    this.productsSubject.next([...this.products]);
  }
}
