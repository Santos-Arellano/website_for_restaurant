import { Component, OnInit } from '@angular/core';
import { Producto, CategoriaProducto } from '../../../Model/Producto/producto';
import { ProductoService } from '../../../Service/Producto/producto.service';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productoSeleccionado: Producto | null = null;
  
  // Estadísticas
  totalProductos: number = 0;
  productosActivos: number = 0;
  totalCategorias: number = 0;
  stockBajo: number = 0;
  
  // Filtros y búsqueda
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedStatus: string = '';
  
  // Estados de UI
  isLoading: boolean = false;
  mostrarModalDetalles: boolean = false;
  mostrarModalEdicion: boolean = false;
  modoEdicion: boolean = false;
  
  // Formulario de producto
  productoForm: Partial<Producto> = {
    nombre: '',
    descripcion: '',
    precio: 0,
    categoria: CategoriaProducto.HAMBURGUESAS,
    disponible: true,
    isPopular: false,
    imagen: ''
  };
  
  // Categorías disponibles
  categorias = Object.values(CategoriaProducto);
  
  constructor(private productoService: ProductoService) {}
  
  ngOnInit(): void {
    this.cargarProductos();
  }
  
  cargarProductos(): void {
    this.isLoading = true;
    this.productoService.getProductos().subscribe({
      next: (productos: Producto[]) => {
        this.productos = productos;
        this.productosFiltrados = productos;
        this.calcularEstadisticas();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar productos:', error);
        this.isLoading = false;
      }
    });
  }
  
  calcularEstadisticas(): void {
    this.totalProductos = this.productos.length;
    this.productosActivos = this.productos.filter(p => p.disponible).length;
    this.totalCategorias = new Set(this.productos.map(p => p.categoria)).size;
    this.stockBajo = this.productos.filter(p => !p.disponible).length; // Simulando stock bajo
  }
  
  filtrarProductos(): void {
    this.productosFiltrados = this.productos.filter(producto => {
      const matchesSearch = !this.searchTerm || 
        producto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = !this.selectedCategory || 
        producto.categoria === this.selectedCategory;
      
      const matchesStatus = !this.selectedStatus || 
        producto.disponible.toString() === this.selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }
  
  abrirModalAgregar(): void {
    this.modoEdicion = false;
    this.productoForm = {
      nombre: '',
      descripcion: '',
      precio: 0,
      categoria: CategoriaProducto.HAMBURGUESAS,
      disponible: true,
      isPopular: false,
      imagen: ''
    };
    this.mostrarModalEdicion = true;
  }
  
  // Métodos para el modal de edición
  abrirModalEdicion(producto?: Producto): void {
    this.mostrarModalEdicion = true;
    if (producto) {
      this.modoEdicion = true;
      this.productoForm = { ...producto };
    } else {
      this.modoEdicion = false;
      this.productoForm = {
        id: 0,
        nombre: '',
        descripcion: '',
        precio: 0,
        categoria: CategoriaProducto.HAMBURGUESAS,
        imagen: '',
        disponible: true,
        isPopular: false,
        fechaCreacion: new Date(),
        ingredientes: [],
        adicionales: []
      };
    }
  }

  cerrarModalEdicion(): void {
    this.mostrarModalEdicion = false;
    this.modoEdicion = false;
    this.productoForm = {
      id: 0,
      nombre: '',
      descripcion: '',
      precio: 0,
      categoria: CategoriaProducto.HAMBURGUESAS,
      imagen: '',
      disponible: true,
      isPopular: false,
      fechaCreacion: new Date(),
      ingredientes: [],
      adicionales: []
    };
  }

  guardarProducto(): void {
    if (!this.productoForm.nombre || !this.productoForm.descripcion || (this.productoForm.precio ?? 0) <= 0) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    this.isLoading = true;

    if (this.modoEdicion && this.productoForm.id && this.productoForm.id > 0) {
      // Actualizar producto existente
      this.productoService.updateProducto(this.productoForm.id, this.productoForm as Producto).subscribe({
        next: (productoActualizado) => {
          const index = this.productos.findIndex(p => p.id === productoActualizado.id);
          if (index !== -1) {
            this.productos[index] = productoActualizado;
            this.filtrarProductos();
          }
          this.cerrarModalEdicion();
          this.isLoading = false;
          alert('Producto actualizado exitosamente');
        },
        error: (error) => {
          console.error('Error al actualizar producto:', error);
          this.isLoading = false;
          alert('Error al actualizar el producto');
        }
      });
    } else {
      // Crear nuevo producto
      const nuevoProducto: Omit<Producto, 'id' | 'fechaCreacion'> = {
        nombre: this.productoForm.nombre || '',
        descripcion: this.productoForm.descripcion || '',
        precio: this.productoForm.precio || 0,
        categoria: this.productoForm.categoria || CategoriaProducto.HAMBURGUESAS,
        imagen: this.productoForm.imagen || '',
        disponible: this.productoForm.disponible ?? true,
        ingredientes: this.productoForm.ingredientes || [],
        isPopular: this.productoForm.isPopular ?? false,
        adicionales: this.productoForm.adicionales || []
      };

      this.productoService.createProducto(nuevoProducto).subscribe({
        next: (productoCreado) => {
          this.productos.push(productoCreado);
          this.filtrarProductos();
          this.cerrarModalEdicion();
          this.isLoading = false;
          alert('Producto creado exitosamente');
        },
        error: (error) => {
          console.error('Error al crear producto:', error);
          this.isLoading = false;
          alert('Error al crear el producto');
        }
      });
    }
  }
  
  eliminarProducto(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.isLoading = true;
      this.productoService.deleteProducto(id).subscribe({
        next: () => {
          this.productos = this.productos.filter(p => p.id !== id);
          this.filtrarProductos();
          this.calcularEstadisticas();
          this.isLoading = false;
          console.log('Producto eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar producto:', error);
          this.isLoading = false;
        }
      });
    }
  }
  
  verDetalles(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.mostrarModalDetalles = true;
  }
  
  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.productoSeleccionado = null;
  }
  
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }
}
