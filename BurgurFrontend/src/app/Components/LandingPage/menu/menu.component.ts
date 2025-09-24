import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductoService } from '../../../Service/Producto/producto.service';
import { PedidoService } from '../../../Service/Pedido/pedido.service';
import { Producto, CategoriaProducto } from '../../../Model/Producto/producto';
import { ProductoPedido } from '../../../Model/Pedido/pedido';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  searchTerm: string = '';
  selectedCategory: string = 'todos';
  productos: Producto[] = [];
  filteredProducts: Producto[] = [];
  categorias = Object.values(CategoriaProducto);
  carritoCount = 0;
  
  // Modal properties
  selectedProduct: Producto | null = null;
  isModalVisible: boolean = false;
  adicionales: any[] = []; // This would come from a service in a real app

  constructor(
    private productoService: ProductoService,
    private pedidoService: PedidoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clearOldData(); // Limpiar datos antiguos
    this.cargarProductos();
    this.suscribirCarrito();
    this.loadAdicionales();
  }

  // Método para limpiar datos antiguos del localStorage
  private clearOldData(): void {
    const productos = localStorage.getItem('productos');
    if (productos) {
      try {
        const productosArray = JSON.parse(productos);
        let needsUpdate = false;
        
        // Verificar si hay productos con rutas SVG antiguas
        const updatedProductos = productosArray.map((producto: any) => {
          if (producto.imagen && producto.imagen.includes('.svg')) {
            needsUpdate = true;
            // Reemplazar rutas SVG con PNG equivalentes
            if (producto.nombre === 'Hamburguesa Clásica') {
              producto.imagen = 'assets/Menu/cheeseburger.png';
            } else if (producto.nombre === 'Papas Fritas') {
              producto.imagen = 'assets/Menu/Fries.png';
            } else if (producto.nombre === 'Coca Cola') {
              producto.imagen = 'assets/Menu/Coke.png';
            } else {
              producto.imagen = 'assets/Menu/cheeseburger.png'; // Imagen por defecto
            }
          }
          return producto;
        });
        
        if (needsUpdate) {
          localStorage.setItem('productos', JSON.stringify(updatedProductos));
          console.log('Datos del localStorage actualizados para usar PNG en lugar de SVG');
        }
      } catch (error) {
        console.error('Error al procesar datos del localStorage:', error);
        localStorage.removeItem('productos'); // Limpiar datos corruptos
      }
    }
  }

  cargarProductos(): void {
    this.productoService.getProductos().subscribe(productos => {
      this.productos = productos;
      this.filteredProducts = productos;
    });
  }

  suscribirCarrito(): void {
    this.pedidoService.carrito$.subscribe(carrito => {
      this.carritoCount = carrito.reduce((total, item) => total + item.cantidad, 0);
    });
  }

  onSearch(): void {
    this.filterProducts();
  }

  onCategoryFilter(category: string): void {
    this.selectedCategory = category;
    this.filterProducts();
  }

  filterByCategory(category: string | null): void {
    if (category) {
      this.selectedCategory = category;
    } else {
      this.selectedCategory = 'todos';
    }
    this.filterProducts();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'todos';
    this.filterProducts();
  }

  private filterProducts(): void {
    let filtered = this.productos;

    // Filtrar por búsqueda
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(product => 
        product.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (this.selectedCategory !== 'todos') {
      filtered = filtered.filter(product => 
        product.categoria.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }

    this.filteredProducts = filtered;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterProducts();
  }

  addToCart(product: Producto, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    const productoPedido: ProductoPedido = {
      productoId: product.id,
      cantidad: 1,
      precioUnitario: product.precio,
      observaciones: ''
    };
    
    this.pedidoService.agregarAlCarrito(productoPedido);
    
    // Mostrar feedback visual (opcional)
    console.log(`${product.nombre} agregado al carrito`);
  }

  viewProductDetails(product: Producto): void {
    this.router.navigate(['/product', product.id]);
  }

  getSimplifiedIngredients(ingredients: string[]): string {
    return ingredients ? ingredients.slice(0, 3).join(', ') + (ingredients.length > 3 ? '...' : '') : '';
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
  }

  // Modal methods
  openProductModal(product: Producto): void {
    this.selectedProduct = product;
    this.isModalVisible = true;
  }

  closeProductModal(): void {
    this.selectedProduct = null;
    this.isModalVisible = false;
  }

  onProductAdded(event: any): void {
    // Handle product added to cart from modal
    console.log('Product added from modal:', event);
  }

  loadAdicionales(): void {
    // Mock adicionales data - in a real app this would come from a service
    this.adicionales = [
      { id: 1, nombre: 'Queso Extra', precio: 2000 },
      { id: 2, nombre: 'Tocineta', precio: 3000 },
      { id: 3, nombre: 'Aguacate', precio: 2500 },
      { id: 4, nombre: 'Cebolla Caramelizada', precio: 1500 },
      { id: 5, nombre: 'Champiñones', precio: 2000 }
    ];
  }
}
