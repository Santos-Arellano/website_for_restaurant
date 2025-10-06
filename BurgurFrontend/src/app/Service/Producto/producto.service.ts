import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Producto, CategoriaProducto } from '../../Model/Producto/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = '/api/productos'; // URL del backend via proxy
  private productosSubject = new BehaviorSubject<Producto[]>([]);
  public productos$ = this.productosSubject.asObservable();

  constructor(private http: HttpClient) { 
    this.loadProductos();
  }

  // Cargar productos desde localStorage o usar mock data
  private loadProductos(): void {
    const productosGuardados = localStorage.getItem('productos');
    if (productosGuardados) {
      const productos = JSON.parse(productosGuardados);
      this.productosSubject.next(productos);
    } else {
      const mockProductos = this.getMockProductos();
      this.saveProductosToStorage(mockProductos);
      this.productosSubject.next(mockProductos);
    }
  }

  // Guardar productos en localStorage
  private saveProductosToStorage(productos: Producto[]): void {
    localStorage.setItem('productos', JSON.stringify(productos));
    this.productosSubject.next(productos);
  }

  // Obtener todos los productos
  getProductos(): Observable<Producto[]> {
    return this.productos$;
  }

  // Obtener producto por ID
  getProductoById(id: number): Observable<Producto | undefined> {
    return new Observable(observer => {
      const productos = JSON.parse(localStorage.getItem('productos') || '[]');
      const producto = productos.find((p: Producto) => p.id === id);
      observer.next(producto);
      observer.complete();
    });
  }

  // Obtener productos por categoría
  getProductosByCategoria(categoria: CategoriaProducto): Observable<Producto[]> {
    return new Observable(observer => {
      const productos = JSON.parse(localStorage.getItem('productos') || '[]');
      const productosFiltrados = productos.filter((p: Producto) => p.categoria === categoria);
      observer.next(productosFiltrados);
      observer.complete();
    });
  }

  // Buscar productos
  buscarProductos(termino: string): Observable<Producto[]> {
    return new Observable(observer => {
      const productos = JSON.parse(localStorage.getItem('productos') || '[]');
      const productosFiltrados = productos.filter((p: Producto) => 
        p.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(termino.toLowerCase())
      );
      observer.next(productosFiltrados);
      observer.complete();
    });
  }

  // Crear nuevo producto (para administración)
  createProducto(producto: Omit<Producto, 'id' | 'fechaCreacion'>): Observable<Producto> {
    return new Observable(observer => {
      const productos = JSON.parse(localStorage.getItem('productos') || '[]');
      const nuevoProducto: Producto = {
        ...producto,
        id: Date.now(),
        fechaCreacion: new Date()
      };
      productos.push(nuevoProducto);
      this.saveProductosToStorage(productos);
      observer.next(nuevoProducto);
      observer.complete();
    });
  }

  // Actualizar producto (para administración)
  updateProducto(id: number, producto: Partial<Producto>): Observable<Producto> {
    return new Observable(observer => {
      const productos = JSON.parse(localStorage.getItem('productos') || '[]');
      const index = productos.findIndex((p: Producto) => p.id === id);
      if (index !== -1) {
        productos[index] = { ...productos[index], ...producto };
        this.saveProductosToStorage(productos);
        observer.next(productos[index]);
      } else {
        observer.error('Producto no encontrado');
      }
      observer.complete();
    });
  }

  // Eliminar producto (para administración)
  deleteProducto(id: number): Observable<boolean> {
    return new Observable(observer => {
      const productos = JSON.parse(localStorage.getItem('productos') || '[]');
      const index = productos.findIndex((p: Producto) => p.id === id);
      if (index !== -1) {
        productos.splice(index, 1);
        this.saveProductosToStorage(productos);
        observer.next(true);
      } else {
        observer.error('Producto no encontrado');
      }
      observer.complete();
    });
  }

  // Cambiar disponibilidad del producto (para administración)
  toggleDisponibilidad(id: number): Observable<Producto> {
    return new Observable(observer => {
      const productos = JSON.parse(localStorage.getItem('productos') || '[]');
      const index = productos.findIndex((p: Producto) => p.id === id);
      if (index !== -1) {
        productos[index].disponible = !productos[index].disponible;
        this.saveProductosToStorage(productos);
        observer.next(productos[index]);
      } else {
        observer.error('Producto no encontrado');
      }
      observer.complete();
    });
  }

  // Obtener estadísticas de productos (para administración)
  getEstadisticas(): Observable<any> {
    return new Observable(observer => {
      const productos = JSON.parse(localStorage.getItem('productos') || '[]');
      const stats = {
        total: productos.length,
        activos: productos.filter((p: Producto) => p.disponible).length,
        categorias: [...new Set(productos.map((p: Producto) => p.categoria))].length,
        stockBajo: productos.filter((p: Producto) => !p.disponible).length
      };
      observer.next(stats);
      observer.complete();
    });
  }

  // Datos mock para desarrollo
  private getMockProductos(): Producto[] {
    return [
      {
        id: 1,
        nombre: 'Hamburguesa Clásica',
        descripcion: 'Hamburguesa con carne, lechuga, tomate y queso',
        precio: 15000,
        categoria: CategoriaProducto.HAMBURGUESAS,
        imagen: 'assets/Menu/cheeseburger.png',
        disponible: true,
        fechaCreacion: new Date(),
        isPopular: true,
        ingredientes: ['Carne', 'Lechuga', 'Tomate', 'Queso', 'Pan'],
        adicionales: [
          { id: 1, nombre: 'Queso extra', precio: 2000, disponible: true },
          { id: 2, nombre: 'Tocineta', precio: 3000, disponible: true },
          { id: 3, nombre: 'Cebolla caramelizada', precio: 1500, disponible: true }
        ]
      },
      {
        id: 2,
        nombre: 'Papas Fritas',
        descripcion: 'Papas fritas crujientes',
        precio: 8000,
        categoria: CategoriaProducto.ACOMPAÑAMIENTOS,
        imagen: 'assets/Menu/Fries.png',
        disponible: true,
        fechaCreacion: new Date(),
        ingredientes: ['Papas', 'Sal'],
        adicionales: [
          { id: 4, nombre: 'Salsa de ajo', precio: 1000, disponible: true },
          { id: 5, nombre: 'Queso cheddar', precio: 2500, disponible: true }
        ]
      },
      {
        id: 3,
        nombre: 'Coca Cola',
        descripcion: 'Bebida gaseosa 350ml',
        precio: 3000,
        categoria: CategoriaProducto.BEBIDAS,
        imagen: 'assets/Menu/Coke.png',
        disponible: true,
        fechaCreacion: new Date(),
        adicionales: []
      }
    ];
  }
}
