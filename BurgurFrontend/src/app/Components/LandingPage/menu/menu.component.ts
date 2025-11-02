import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductoService } from '../../../Service/Producto/producto.service';
import { PedidoService } from '../../../Service/Pedido/pedido.service';
import { Producto, CategoriaProducto } from '../../../Model/Producto/producto';
import { ProductoPedido } from '../../../Model/Pedido/pedido';
import { ToastService } from '../../Shared/toast/toast.service';
import { debugLog } from '../../../utils/logger';

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
  // Historial de búsqueda
  searchHistory: string[] = [];
  private readonly SEARCH_HISTORY_KEY = 'menuSearchHistory';
  private readonly MAX_HISTORY_ITEMS = 8;
  // Mostrar historial solo cuando el input está enfocado
  isSearchFocused: boolean = false;
  
  // Modal properties
  selectedProduct: Producto | null = null;
  isModalVisible: boolean = false;
  adicionales: any[] = []; // This would come from a service in a real app

  constructor(
    private productoService: ProductoService,
    private pedidoService: PedidoService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.clearOldData(); // Limpiar datos antiguos
    this.cargarProductos();
    this.suscribirCarrito();
    this.loadAdicionales();
    this.loadSearchHistory();
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
          debugLog('Datos del localStorage actualizados para usar PNG en lugar de SVG');
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
    const term = this.searchTerm?.trim();
    if (term) {
      this.addToSearchHistory(term);
    }
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

  // ===== Historial de búsqueda =====
  private loadSearchHistory(): void {
    try {
      const raw = localStorage.getItem(this.SEARCH_HISTORY_KEY);
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) {
        this.searchHistory = list.filter((v: any) => typeof v === 'string').slice(0, this.MAX_HISTORY_ITEMS);
      }
    } catch (err) {
      console.warn('No se pudo cargar el historial de búsqueda:', err);
      this.searchHistory = [];
    }
  }

  private saveSearchHistory(): void {
    try {
      localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(this.searchHistory));
    } catch (err) {
      console.warn('No se pudo guardar el historial de búsqueda:', err);
    }
  }

  private addToSearchHistory(term: string): void {
    const normalized = term.trim();
    if (!normalized) return;
    // Evitar duplicados (case-insensitive)
    const existsIndex = this.searchHistory.findIndex(t => t.toLowerCase() === normalized.toLowerCase());
    if (existsIndex !== -1) {
      // Mover a la primera posición
      this.searchHistory.splice(existsIndex, 1);
    }
    this.searchHistory.unshift(normalized);
    // Limitar tamaño máximo
    if (this.searchHistory.length > this.MAX_HISTORY_ITEMS) {
      this.searchHistory = this.searchHistory.slice(0, this.MAX_HISTORY_ITEMS);
    }
    this.saveSearchHistory();
  }

  applySearch(term: string): void {
    this.searchTerm = term;
    this.addToSearchHistory(term);
    this.filterProducts();
    // Cerrar el historial tras aplicar búsqueda
    this.isSearchFocused = false;
  }

  clearHistory(): void {
    this.searchHistory = [];
    try {
      localStorage.removeItem(this.SEARCH_HISTORY_KEY);
    } catch {}
  }

  trackByTerm(index: number, term: string): string {
    return term.toLowerCase();
  }

  // Manejo de enfoque/blur del campo de búsqueda
  onSearchFocus(): void {
    this.isSearchFocused = true;
  }

  onSearchBlur(): void {
    // Pequeño retraso para permitir clic en chips antes de ocultar
    setTimeout(() => {
      this.isSearchFocused = false;
    }, 150);
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
    
    // Toast de confirmación
    this.toast.success(`${product.nombre} agregado al carrito`, 2500);
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
    // Convert modal payload to ProductoPedido and add to cart
    if (!event || !event.product) {
      return;
    }

    const adicionalesSeleccionados = (event.adicionales || []).map((adi: any) => ({
      adicionalId: adi.id,
      cantidad: Math.max(1, Number(event.quantity || 1)),
      precioUnitario: Number(adi.precio || 0)
    }));

    const precioUnitario = Math.round((Number(event.totalPrice || 0)) / Math.max(1, Number(event.quantity || 1)));

    const productoPedido: ProductoPedido = {
      productoId: event.product.id,
      cantidad: Math.max(1, Number(event.quantity || 1)),
      precioUnitario: precioUnitario > 0 ? precioUnitario : Number(event.product.precio || 0),
      adicionales: adicionalesSeleccionados.length ? adicionalesSeleccionados : undefined,
      observaciones: ''
    };

    this.pedidoService.agregarAlCarrito(productoPedido);
    this.toast.success(`${event.product.nombre} agregado al carrito`, 2500);
    debugLog('Product added from modal:', productoPedido);
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
