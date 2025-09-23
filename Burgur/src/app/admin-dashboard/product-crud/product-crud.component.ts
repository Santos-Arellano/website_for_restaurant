import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-product-crud',
  templateUrl: './product-crud.component.html',
  styleUrls: ['./product-crud.component.css']
})
export class ProductCrudComponent implements OnInit {
  
  // Propiedades para la gestión de productos
  productos: Product[] = [];
  filteredProducts: Product[] = [];
  
  // Propiedades para el modal
  showModal = false;
  isEditMode = false;
  currentProductId: number | null = null;
  
  // Propiedades para filtros y búsqueda
  searchTerm = '';
  selectedCategory = '';
  
  // Formulario reactivo
  productForm: FormGroup;

  constructor(
    private productService: ProductService,
    private formBuilder: FormBuilder
  ) {
    // Inicializar el formulario
    this.productForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      precio: [0, [Validators.required, Validators.min(1)]],
      categoria: ['', Validators.required],
      imgURL: ['', [Validators.required, Validators.pattern('https?://.+')]],
      stock: [0, [Validators.required, Validators.min(0)]],
      ingredientes: [''],
      nuevo: [false],
      popular: [false],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  // Cargar todos los productos
  loadProducts(): void {
    this.productService.getProducts().subscribe(products => {
      this.productos = products;
      this.filteredProducts = [...this.productos];
    });
  }

  // Filtrar productos por búsqueda y categoría
  filterProducts(): void {
    let filtered = [...this.productos];

    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(producto => 
        producto.nombre.toLowerCase().includes(searchLower) ||
        producto.descripcion.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por categoría
    if (this.selectedCategory) {
      filtered = filtered.filter(producto => 
        producto.categoria.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }

    this.filteredProducts = filtered;
  }

  // Abrir modal para crear producto
  openCreateModal(): void {
    this.isEditMode = false;
    this.currentProductId = null;
    this.resetForm();
    this.showModal = true;
  }

  // Abrir modal para editar producto
  openEditModal(producto: Product): void {
    this.isEditMode = true;
    this.currentProductId = producto.id;
    this.populateForm(producto);
    this.showModal = true;
  }

  // Cerrar modal
  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  // Resetear formulario
  resetForm(): void {
    this.productForm.reset({
      nombre: '',
      descripcion: '',
      precio: 0,
      categoria: '',
      imgURL: '',
      stock: 0,
      ingredientes: '',
      nuevo: false,
      popular: false,
      activo: true
    });
  }

  // Poblar formulario con datos del producto
  populateForm(producto: Product): void {
    this.productForm.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      categoria: producto.categoria,
      imgURL: producto.imgURL,
      stock: 0, // Product interface no tiene stock, usar valor por defecto
      ingredientes: producto.ingredientes ? producto.ingredientes.join(', ') : '',
      nuevo: producto.nuevo || false,
      popular: producto.popular || false,
      activo: true // Valor por defecto
    });
  }

  // Enviar formulario
  onSubmit(): void {
    if (this.productForm.valid) {
      const formData = this.productForm.value;
      
      // Convertir ingredientes de string a array
      const ingredientesArray = formData.ingredientes 
        ? formData.ingredientes.split(',').map((ing: string) => ing.trim()).filter((ing: string) => ing.length > 0)
        : [];

      const productoData: Product = {
        id: this.isEditMode && this.currentProductId !== null ? this.currentProductId : 0,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: formData.precio,
        categoria: formData.categoria,
        imgURL: formData.imgURL,
        ingredientes: ingredientesArray,
        nuevo: formData.nuevo,
        popular: formData.popular
      };

      if (this.isEditMode && this.currentProductId !== null) {
        // Actualizar producto existente
        this.productService.updateProduct(this.currentProductId, productoData);
        console.log('Producto actualizado exitosamente');
        this.loadProducts();
        this.filterProducts();
        this.closeModal();
      } else {
        // Crear nuevo producto
        this.productService.addProduct(productoData);
        console.log('Producto creado exitosamente');
        this.loadProducts();
        this.filterProducts();
        this.closeModal();
      }
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
    }
  }

  // Eliminar producto
  deleteProduct(productId: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productService.deleteProduct(productId);
      console.log('Producto eliminado exitosamente');
      this.loadProducts();
      this.filterProducts();
    }
  }

  // Método auxiliar para obtener errores del formulario
  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} es requerido`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `${fieldName} debe ser mayor a ${field.errors['min'].min}`;
      }
      if (field.errors['pattern']) {
        return `${fieldName} debe tener un formato válido`;
      }
    }
    
    return '';
  }
}
