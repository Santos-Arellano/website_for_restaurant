import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProductService, Product } from '../../../services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data properties
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = ['hamburguesa', 'bebida', 'acompañamiento', 'perro caliente', 'postre'];
  
  // Filter properties
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';
  
  // Stats properties
  totalProducts = 0;
  activeProducts = 0;
  lowStockProducts = 0;
  
  // Modal properties
  showProductModal = false;
  editingProduct: Product | null = null;
  productForm: FormGroup;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      categoria: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]],
      descripcion: [''],
      imgURL: [''],
      nuevo: [false],
      popular: [false]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    this.productService.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.products = products;
          this.filteredProducts = [...products];
          this.updateStats();
        },
        error: (error: any) => {
          console.error('Error loading products:', error);
          alert('Error al cargar los productos');
        }
      });
  }

  updateStats(): void {
    this.totalProducts = this.products.length;
    this.activeProducts = this.products.length; // All products are considered active
    this.lowStockProducts = 0; // Placeholder - implement stock logic if needed
  }

  filterProducts(): void {
    let filtered = [...this.products];

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.nombre.toLowerCase().includes(term) ||
        product.categoria.toLowerCase().includes(term) ||
        (product.descripcion && product.descripcion.toLowerCase().includes(term))
      );
    }

    // Filter by category
    if (this.selectedCategory) {
      filtered = filtered.filter(product => 
        product.categoria.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }

    this.filteredProducts = filtered;
  }

  openAddProductModal(): void {
    this.editingProduct = null;
    this.productForm.reset({
      nombre: '',
      categoria: '',
      precio: 0,
      descripcion: '',
      imgURL: '',
      nuevo: false,
      popular: false
    });
    this.showProductModal = true;
  }

  editProduct(product: Product): void {
    this.editingProduct = product;
    this.productForm.patchValue({
      nombre: product.nombre,
      categoria: product.categoria,
      precio: product.precio,
      descripcion: product.descripcion || '',
      imgURL: product.imgURL || '',
      nuevo: product.nuevo || false,
      popular: product.popular || false
    });
    this.showProductModal = true;
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.editingProduct = null;
    this.productForm.reset();
  }

  saveProduct(): void {
    if (this.productForm.valid) {
      const formData = this.productForm.value;
      
      if (this.editingProduct) {
        // Update existing product
        this.productService.updateProduct(this.editingProduct.id, formData);
        alert('Producto actualizado correctamente');
        this.loadProducts();
        this.closeProductModal();
      } else {
        // Create new product
        const newProduct: Product = {
          id: Date.now(), // Simple ID generation
          ...formData
        };
        
        this.productService.addProduct(newProduct);
        alert('Producto creado correctamente');
        this.loadProducts();
        this.closeProductModal();
      }
    }
  }

  deleteProduct(productId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productService.deleteProduct(productId);
      alert('Producto eliminado correctamente');
      this.loadProducts();
    }
  }

  viewProductDetails(product: Product): void {
    // Implement product details view if needed
    console.log('View details for product:', product);
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
}
