import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  active: boolean;
  createdAt: Date;
}

interface ProductCategory {
  id: string;
  name: string;
  count: number;
}

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css']
})
export class ProductManagementComponent implements OnInit {

  products: Product[] = [
    {
      id: 'PROD-001',
      name: 'Hamburguesa Clásica',
      description: 'Hamburguesa con carne de res, lechuga, tomate y cebolla',
      price: 15000,
      category: 'Hamburguesas',
      image: 'assets/images/menu/BURGER.png',
      stock: 25,
      active: true,
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'PROD-002',
      name: 'Hamburguesa BBQ',
      description: 'Hamburguesa con salsa BBQ, cebolla caramelizada y tocino',
      price: 18000,
      category: 'Hamburguesas',
      image: 'assets/images/menu/BBQ-especial.png',
      stock: 15,
      active: true,
      createdAt: new Date('2024-01-20')
    },
    {
      id: 'PROD-003',
      name: 'Papas Fritas',
      description: 'Papas fritas crujientes con sal marina',
      price: 8000,
      category: 'Acompañamientos',
      image: 'assets/images/menu/Fries.png',
      stock: 50,
      active: true,
      createdAt: new Date('2024-01-10')
    },
    {
      id: 'PROD-004',
      name: 'Coca Cola',
      description: 'Bebida gaseosa 350ml',
      price: 4000,
      category: 'Bebidas',
      image: 'assets/images/menu/Coke.png',
      stock: 2,
      active: true,
      createdAt: new Date('2024-01-05')
    }
  ];

  categories: ProductCategory[] = [
    { id: 'all', name: 'Todos', count: 0 },
    { id: 'hamburguesas', name: 'Hamburguesas', count: 0 },
    { id: 'acompañamientos', name: 'Acompañamientos', count: 0 },
    { id: 'bebidas', name: 'Bebidas', count: 0 }
  ];

  filteredProducts: Product[] = [];
  selectedCategory = 'all';
  searchTerm = '';
  showAddModal = false;
  showEditModal = false;
  selectedProduct: Product | null = null;

  newProduct: Partial<Product> = {
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    active: true
  };

  ngOnInit() {
    this.updateCategoryCounts();
    this.filterProducts();
  }

  updateCategoryCounts() {
    this.categories.forEach(category => {
      if (category.id === 'all') {
        category.count = this.products.length;
      } else {
        category.count = this.products.filter(p => 
          p.category.toLowerCase() === category.name.toLowerCase()
        ).length;
      }
    });
  }

  filterProducts() {
    let filtered = this.products;

    // Filtrar por categoría
    if (this.selectedCategory !== 'all') {
      const categoryName = this.categories.find(c => c.id === this.selectedCategory)?.name;
      filtered = filtered.filter(p => p.category === categoryName);
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredProducts = filtered;
  }

  onCategoryChange(categoryId: string) {
    this.selectedCategory = categoryId;
    this.filterProducts();
  }

  onSearchChange(term: string) {
    this.searchTerm = term;
    this.filterProducts();
  }

  openAddModal() {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      category: 'Hamburguesas',
      stock: 0,
      active: true
    };
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  openEditModal(product: Product) {
    this.selectedProduct = { ...product };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedProduct = null;
  }

  addProduct() {
    if (this.newProduct.name && this.newProduct.price) {
      const product: Product = {
        id: `PROD-${String(this.products.length + 1).padStart(3, '0')}`,
        name: this.newProduct.name,
        description: this.newProduct.description || '',
        price: this.newProduct.price,
        category: this.newProduct.category || 'Hamburguesas',
        image: '/assets/images/default-product.jpg',
        stock: this.newProduct.stock || 0,
        active: this.newProduct.active || true,
        createdAt: new Date()
      };

      this.products.push(product);
      this.updateCategoryCounts();
      this.filterProducts();
      this.closeAddModal();
      console.log('Producto agregado:', product);
    }
  }

  updateProduct() {
    if (this.selectedProduct) {
      const index = this.products.findIndex(p => p.id === this.selectedProduct!.id);
      if (index !== -1) {
        this.products[index] = { ...this.selectedProduct };
        this.updateCategoryCounts();
        this.filterProducts();
        this.closeEditModal();
        console.log('Producto actualizado:', this.selectedProduct);
      }
    }
  }

  deleteProduct(productId: string) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.products = this.products.filter(p => p.id !== productId);
      this.updateCategoryCounts();
      this.filterProducts();
      console.log('Producto eliminado:', productId);
    }
  }

  toggleProductStatus(productId: string) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      product.active = !product.active;
      console.log('Estado del producto cambiado:', product);
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getStockStatus(stock: number): string {
    if (stock === 0) return 'out-of-stock';
    if (stock <= 5) return 'low-stock';
    return 'in-stock';
  }

  getStockText(stock: number): string {
    if (stock === 0) return 'Agotado';
    if (stock <= 5) return 'Stock Bajo';
    return 'En Stock';
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }
}
