import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';

// Interfaz para estadísticas
interface ProductStats {
  total: number;
  nuevos: number;
  activos: number;
  stockBajo: number;
}

// Interfaz adaptada para el formulario
interface ProductForm {
  nombre: string;
  categoria: string;
  precio: number;
  descripcion: string;
  imgURL: string;
  ingredientes?: string[];
  nuevo?: boolean;
  popular?: boolean;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  stats: ProductStats = {
    total: 0,
    nuevos: 0,
    activos: 0,
    stockBajo: 0
  };
  
  // Filtros
  searchTerm = '';
  selectedCategory = 'all';
  selectedStatus = 'all';
  categories: string[] = [];
  
  // Modales
  showDetailsModal = false;
  showFormModal = false;
  selectedProduct: Product | null = null;
  isEditing = false;
  
  // Formulario adaptado
  productForm: ProductForm = {
    nombre: '',
    categoria: '',
    precio: 0,
    descripcion: '',
    imgURL: '',
    ingredientes: [],
    nuevo: false,
    popular: false
  };
  
  // Estados
  loading = false;
  
  constructor(private productService: ProductService) {}
  
  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadStats();
  }
  
  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.filteredProducts = products;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.loading = false;
        this.showNotification('Error al cargar productos', 'error');
      }
    });
  }
  
  loadCategories(): void {
    this.categories = this.productService.getCategories();
  }
  
  loadStats(): void {
    // Calcular estadísticas basadas en los productos actuales
    const total = this.products.length;
    const nuevos = this.products.filter(p => p.nuevo).length;
    const activos = this.products.length; // Todos están activos en ProductService
    const stockBajo = 0; // ProductService no maneja stock
    
    this.stats = { total, nuevos, activos, stockBajo };
  }
  
  // Filtrado de productos
  filterProducts(): void {
    let filtered = this.products;
    
    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      filtered = this.productService.searchProducts(this.searchTerm);
    }
    
    // Filtrar por categoría
    if (this.selectedCategory && this.selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.categoria === this.selectedCategory);
    }
    
    this.filteredProducts = filtered;
  }
  
  onSearchChange(): void {
    this.filterProducts();
  }
  
  onCategoryChange(): void {
    this.filterProducts();
  }
  
  onStatusChange(): void {
    this.filterProducts();
  }
  
  // Modales
  openDetailsModal(product: Product): void {
    this.selectedProduct = product;
    this.showDetailsModal = true;
  }
  
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedProduct = null;
  }
  
  openFormModal(product?: Product): void {
    this.isEditing = !!product;
    if (product) {
      this.productForm = {
        nombre: product.nombre,
        categoria: product.categoria,
        precio: product.precio,
        descripcion: product.descripcion,
        imgURL: product.imgURL,
        ingredientes: product.ingredientes || [],
        nuevo: product.nuevo || false,
        popular: product.popular || false
      };
      this.selectedProduct = product;
    } else {
      this.resetForm();
    }
    this.showFormModal = true;
  }
  
  closeFormModal(): void {
    this.showFormModal = false;
    this.selectedProduct = null;
    this.isEditing = false;
    this.resetForm();
  }
  
  resetForm(): void {
    this.productForm = {
      nombre: '',
      categoria: '',
      precio: 0,
      descripcion: '',
      imgURL: '',
      ingredientes: [],
      nuevo: false,
      popular: false
    };
  }
  
  // CRUD Operations
  saveProduct(): void {
    if (!this.validateForm()) {
      return;
    }
    
    if (this.isEditing && this.selectedProduct) {
      // Actualizar producto existente
      const updatedProduct: Partial<Product> = {
        nombre: this.productForm.nombre,
        categoria: this.productForm.categoria,
        precio: this.productForm.precio,
        descripcion: this.productForm.descripcion,
        imgURL: this.productForm.imgURL,
        ingredientes: this.productForm.ingredientes,
        nuevo: this.productForm.nuevo,
        popular: this.productForm.popular
      };
      
      this.productService.updateProduct(this.selectedProduct.id, updatedProduct);
      this.showNotification('Producto actualizado exitosamente', 'success');
    } else {
      // Crear nuevo producto
      const newProduct: Product = {
        id: this.generateNewId(),
        nombre: this.productForm.nombre,
        categoria: this.productForm.categoria,
        precio: this.productForm.precio,
        descripcion: this.productForm.descripcion,
        imgURL: this.productForm.imgURL,
        ingredientes: this.productForm.ingredientes,
        nuevo: this.productForm.nuevo,
        popular: this.productForm.popular
      };
      
      this.productService.addProduct(newProduct);
      this.showNotification('Producto creado exitosamente', 'success');
    }
    
    this.closeFormModal();
    this.loadProducts();
    this.loadStats();
  }
  
  deleteProduct(product: Product): void {
    if (confirm(`¿Estás seguro de que deseas eliminar "${product.nombre}"?`)) {
      this.productService.deleteProduct(product.id);
      this.showNotification('Producto eliminado exitosamente', 'success');
      this.loadProducts();
      this.loadStats();
    }
  }
  
  toggleProductStatus(product: Product): void {
    // En ProductService no hay estado, pero podemos simular con nuevo/popular
    const updatedProduct: Partial<Product> = {
      popular: !product.popular
    };
    
    this.productService.updateProduct(product.id, updatedProduct);
    this.showNotification('Estado del producto actualizado', 'success');
    this.loadProducts();
  }
  
  // Utilidades
  validateForm(): boolean {
    if (!this.productForm.nombre.trim()) {
      this.showNotification('El nombre del producto es requerido', 'error');
      return false;
    }
    
    if (!this.productForm.categoria.trim()) {
      this.showNotification('La categoría es requerida', 'error');
      return false;
    }
    
    if (this.productForm.precio <= 0) {
      this.showNotification('El precio debe ser mayor a 0', 'error');
      return false;
    }
    
    if (!this.productForm.descripcion.trim()) {
      this.showNotification('La descripción es requerida', 'error');
      return false;
    }
    
    return true;
  }
  
  generateNewId(): number {
    return this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
  }
  
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }
  
  getStockClass(stock: number): string {
    if (stock === 0) return 'text-red-600';
    if (stock < 10) return 'text-yellow-600';
    return 'text-green-600';
  }
  
  getStockLabel(stock: number): string {
    if (stock === 0) return 'Sin stock';
    if (stock < 10) return 'Stock bajo';
    return 'En stock';
  }
  
  hasLowStock(product: Product): boolean {
    return false; // ProductService no maneja stock
  }
  
  isOutOfStock(product: Product): boolean {
    return false; // ProductService no maneja stock
  }
  
  getProductBadges(product: Product): string[] {
    const badges: string[] = [];
    
    if (product.nuevo) {
      badges.push('nuevo');
    }
    
    if (product.popular) {
      badges.push('popular');
    }
    
    return badges;
  }
  
  isNewProduct(product: Product): boolean {
    return product.nuevo || false;
  }
  
  showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Implementación simple de notificación
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
  
  // Eventos del teclado
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.showFormModal) {
        this.closeFormModal();
      } else if (this.showDetailsModal) {
        this.closeDetailsModal();
      }
    }
  }
  
  // Actualizar datos
  refreshData(): void {
    this.loadProducts();
    this.loadStats();
  }
  
  // Manejo de errores de imagen
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/menu/default-product.png';
  }
}
