import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ProductoService } from '../../../Service/Producto/producto.service';
import { Producto, CategoriaProducto } from '../../../Model/Producto/producto';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent implements OnInit, OnDestroy {
  productosDestacados: Producto[] = [];
  currentSlide = 0;
  totalSlides = 4; // Número fijo de slides
  autoPlayInterval: any;

  // Slides estáticos para el carrusel
  slides = [
    {
      badge: '¡ESTRELLA DE LA CASA!',
      title: 'Burger Clásica',
      subtitle: 'Carne jugosa, lechuga fresca, tomate y nuestra salsa especial',
      priceNew: '$25.000',
      priceOld: '$30.000',
      image: 'assets/images/menu/BURGER.png',
      background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)'
    },
    {
      badge: '¡NUEVO!',
      title: 'BBQ Master',
      subtitle: 'Carne premium con salsa BBQ casera y cebolla caramelizada',
      priceNew: '$28.000',
      priceOld: '$35.000',
      image: 'assets/images/menu/BBQ-especial.png',
      background: 'linear-gradient(135deg, #8b4513 0%, #d2691e 100%)'
    },
    {
      badge: 'ESPECIALIDAD',
      title: 'Hot Dog Supreme',
      subtitle: 'Salchicha premium con ingredientes frescos y salsas especiales',
      priceNew: '$18.000',
      priceOld: '$22.000',
      image: 'assets/images/menu/Hot-Dog-Supreme.png',
      background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
    },
    {
      badge: 'DELIVERY GRATIS',
      title: 'Entrega Rápida',
      subtitle: 'Pedidos mayores a $100.000 - Entrega en 30 minutos',
      priceNew: 'GRATIS',
      priceOld: '',
      image: 'assets/images/menu/Hot-Dog-Supreme.png',
      background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)'
    }
  ];

  constructor(
    private router: Router,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    this.cargarProductosDestacados();
    this.iniciarCarousel();
  }

  ngOnDestroy(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  cargarProductosDestacados(): void {
    this.productoService.getProductos().subscribe(productos => {
      this.productosDestacados = productos.filter(p => p.isPopular).slice(0, 3);
    });
  }

  iniciarCarousel(): void {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Cambiar slide cada 5 segundos
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateSlideClasses();
  }

  prevSlide(): void {
    this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
    this.updateSlideClasses();
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.updateSlideClasses();
  }

  private updateSlideClasses(): void {
    // Actualizar las clases de los slides en el DOM
    const slides = document.querySelectorAll('.hero-slide');
    slides.forEach((slide, index) => {
      slide.classList.remove('active', 'prev');
      if (index === this.currentSlide) {
        slide.classList.add('active');
      }
    });
  }

  verMenu(): void {
    this.router.navigate(['/menu']);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
