import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CarouselSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hero-carousel" [class.paused]="isPaused">
      <div class="carousel-container">
        <div class="carousel-track" [style.transform]="'translateX(' + (-currentSlide * 100) + '%)'">
          <div 
            *ngFor="let slide of slides; let i = index" 
            class="carousel-slide"
            [class.active]="i === currentSlide"
          >
            <div class="slide-background" [style.background-image]="'url(' + slide.image + ')'"></div>
            <div class="slide-content">
              <div class="slide-text">
                <h1 class="slide-title" [innerHTML]="slide.title"></h1>
                <p class="slide-subtitle" [innerHTML]="slide.subtitle"></p>
                <p class="slide-description" [innerHTML]="slide.description"></p>
                <a [href]="slide.buttonLink" class="slide-button">{{ slide.buttonText }}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Navigation dots -->
      <div class="carousel-dots">
        <button 
          *ngFor="let slide of slides; let i = index"
          class="dot"
          [class.active]="i === currentSlide"
          (click)="goToSlide(i)"
          [attr.aria-label]="'Ir a slide ' + (i + 1)"
        ></button>
      </div>
      
      <!-- Navigation arrows -->
      <button class="carousel-arrow prev" (click)="previousSlide()" aria-label="Slide anterior">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
      </button>
      <button class="carousel-arrow next" (click)="nextSlide()" aria-label="Siguiente slide">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9,18 15,12 9,6"></polyline>
        </svg>
      </button>
      
      <!-- Progress bar -->
      <div class="progress-bar">
        <div class="progress-fill" [style.width]="progressWidth + '%'"></div>
      </div>
    </div>
  `,
  styles: [`
    .hero-carousel {
      position: relative;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      background: #000;
    }

    .carousel-container {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .carousel-track {
      display: flex;
      width: 100%;
      height: 100%;
      transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .carousel-slide {
      flex: 0 0 100%;
      position: relative;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .slide-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      opacity: 0.8;
      transition: transform 8s ease-out;
    }

    .carousel-slide.active .slide-background {
      transform: scale(1.1);
    }

    .slide-content {
      position: relative;
      z-index: 2;
      text-align: center;
      color: white;
      max-width: 800px;
      padding: 0 2rem;
    }

    .slide-title {
      font-size: 3.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
      opacity: 0;
      transform: translateY(50px);
      animation: slideInUp 1s ease-out 0.3s forwards;
    }

    .slide-subtitle {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      opacity: 0;
      transform: translateY(30px);
      animation: slideInUp 1s ease-out 0.6s forwards;
    }

    .slide-description {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      opacity: 0;
      transform: translateY(30px);
      animation: slideInUp 1s ease-out 0.9s forwards;
    }

    .slide-button {
      display: inline-block;
      padding: 1rem 2rem;
      background: #ff6b35;
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-weight: bold;
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(30px);
      animation: slideInUp 1s ease-out 1.2s forwards;
    }

    .slide-button:hover {
      background: #e55a2b;
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(255, 107, 53, 0.3);
    }

    .carousel-dots {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 0.5rem;
      z-index: 3;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.5);
      background: transparent;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .dot.active {
      background: white;
      border-color: white;
    }

    .carousel-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 3;
      backdrop-filter: blur(10px);
    }

    .carousel-arrow:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-50%) scale(1.1);
    }

    .carousel-arrow.prev {
      left: 2rem;
    }

    .carousel-arrow.next {
      right: 2rem;
    }

    .progress-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.2);
      z-index: 3;
    }

    .progress-fill {
      height: 100%;
      background: #ff6b35;
      transition: width 0.1s linear;
    }

    @keyframes slideInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .hero-carousel.paused .progress-fill {
      animation-play-state: paused;
    }

    @media (max-width: 768px) {
      .slide-title {
        font-size: 2.5rem;
      }
      
      .slide-subtitle {
        font-size: 1.2rem;
      }
      
      .carousel-arrow {
        width: 40px;
        height: 40px;
      }
      
      .carousel-arrow.prev {
        left: 1rem;
      }
      
      .carousel-arrow.next {
        right: 1rem;
      }
    }
  `]
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  slides: CarouselSlide[] = [
    {
      id: 1,
      title: 'Las Mejores <span style="color: #ff6b35;">Hamburguesas</span>',
      subtitle: 'Ingredientes frescos, sabor auténtico',
      description: 'Descubre nuestras hamburguesas gourmet preparadas con los mejores ingredientes y el amor de siempre.',
      image: '/assets/images/hero-burger-1.jpg',
      buttonText: 'Ver Menú',
      buttonLink: '/menu'
    },
    {
      id: 2,
      title: 'Entrega a <span style="color: #ff6b35;">Domicilio</span>',
      subtitle: 'Rápido, caliente y delicioso',
      description: 'Disfruta de nuestras hamburguesas en la comodidad de tu hogar. Entrega en 30 minutos o menos.',
      image: '/assets/images/hero-delivery.jpg',
      buttonText: 'Pedir Ahora',
      buttonLink: '/menu'
    },
    {
      id: 3,
      title: 'Ofertas <span style="color: #ff6b35;">Especiales</span>',
      subtitle: 'Los mejores precios de la ciudad',
      description: 'Aprovecha nuestras promociones especiales y combos únicos. ¡No te los pierdas!',
      image: '/assets/images/hero-offers.jpg',
      buttonText: 'Ver Ofertas',
      buttonLink: '/menu'
    }
  ];

  currentSlide = 0;
  isPaused = false;
  progressWidth = 0;
  private intervalId: any;
  private progressIntervalId: any;
  private readonly slideInterval = 5000; // 5 seconds
  private readonly progressInterval = 50; // Update progress every 50ms

  ngOnInit() {
    this.startAutoSlide();
    this.startProgressBar();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
    this.stopProgressBar();
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      if (!this.isPaused) {
        this.nextSlide();
      }
    }, this.slideInterval);
  }

  stopAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startProgressBar() {
    this.progressWidth = 0;
    this.progressIntervalId = setInterval(() => {
      if (!this.isPaused) {
        this.progressWidth += (100 / (this.slideInterval / this.progressInterval));
        if (this.progressWidth >= 100) {
          this.progressWidth = 0;
        }
      }
    }, this.progressInterval);
  }

  stopProgressBar() {
    if (this.progressIntervalId) {
      clearInterval(this.progressIntervalId);
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.resetProgress();
  }

  previousSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
    this.resetProgress();
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.resetProgress();
  }

  pauseCarousel() {
    this.isPaused = true;
  }

  resumeCarousel() {
    this.isPaused = false;
  }

  private resetProgress() {
    this.progressWidth = 0;
  }
}