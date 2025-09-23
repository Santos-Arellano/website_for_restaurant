// ==========================================
// BURGER CLUB - HERO CAROUSEL COMPONENT
// ==========================================

import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { ANIMATION_DURATIONS } from '../../constants/app.constants';

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  backgroundImage: string;
  primaryButton?: {
    text: string;
    action: string;
    link?: string;
  };
  secondaryButton?: {
    text: string;
    action: string;
    link?: string;
  };
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hero-carousel" #carouselContainer>
      <!-- Slides -->
      <div class="carousel-slides">
        <div 
          *ngFor="let slide of slides; let i = index"
          class="hero-slide"
          [class.active]="i === currentSlide"
          [style.background-image]="'url(' + slide.backgroundImage + ')'"
        >
          <div class="slide-content">
            <div class="slide-text">
              <h1 class="slide-title" [innerHTML]="slide.title"></h1>
              <p *ngIf="slide.subtitle" class="slide-subtitle">{{ slide.subtitle }}</p>
              <p class="slide-description">{{ slide.description }}</p>
              
              <div class="slide-buttons" *ngIf="slide.primaryButton || slide.secondaryButton">
                <button 
                  *ngIf="slide.primaryButton"
                  class="btn btn-primary slide-btn-primary"
                  (click)="handleButtonClick(slide.primaryButton, i)"
                >
                  {{ slide.primaryButton.text }}
                </button>
                <button 
                  *ngIf="slide.secondaryButton"
                  class="btn btn-secondary slide-btn-secondary"
                  (click)="handleButtonClick(slide.secondaryButton, i)"
                >
                  {{ slide.secondaryButton.text }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- Slide overlay -->
          <div class="slide-overlay"></div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="carousel-navigation" *ngIf="showNavigation && slides.length > 1">
        <button 
          class="carousel-btn carousel-prev" 
          (click)="prevSlide()"
          [disabled]="isTransitioning"
          aria-label="Slide anterior"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <button 
          class="carousel-btn carousel-next" 
          (click)="nextSlide()"
          [disabled]="isTransitioning"
          aria-label="Siguiente slide"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <!-- Indicators -->
      <div class="carousel-indicators" *ngIf="showIndicators && slides.length > 1">
        <button
          *ngFor="let slide of slides; let i = index"
          class="indicator"
          [class.active]="i === currentSlide"
          (click)="goToSlide(i)"
          [attr.aria-label]="'Ir al slide ' + (i + 1)"
        ></button>
      </div>

      <!-- Progress Bar -->
      <div class="carousel-progress" *ngIf="showProgress && autoPlay">
        <div 
          class="progress-bar" 
          [style.width.%]="progressPercentage"
        ></div>
      </div>

      <!-- Autoplay Controls -->
      <div class="carousel-controls" *ngIf="showControls">
        <button 
          class="control-btn"
          (click)="toggleAutoPlay()"
          [attr.aria-label]="isPlaying ? 'Pausar autoplay' : 'Reanudar autoplay'"
        >
          <i [class]="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .hero-carousel {
      position: relative;
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }

    .carousel-slides {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .hero-slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      opacity: 0;
      transform: scale(1.1);
      transition: all 0.8s ease-in-out;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .hero-slide.active {
      opacity: 1;
      transform: scale(1);
    }

    .slide-content {
      position: relative;
      z-index: 2;
      text-align: center;
      color: white;
      max-width: 800px;
      padding: 2rem;
    }

    .slide-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.4);
      z-index: 1;
    }

    .slide-title {
      font-size: 3.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }

    .slide-subtitle {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      opacity: 0.9;
    }

    .slide-description {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .slide-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .carousel-navigation {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 100%;
      display: flex;
      justify-content: space-between;
      padding: 0 2rem;
      z-index: 3;
    }

    .carousel-btn {
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: white;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .carousel-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
      transform: scale(1.1);
    }

    .carousel-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .carousel-indicators {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 0.5rem;
      z-index: 3;
    }

    .indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.5);
      background: transparent;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .indicator.active {
      background: white;
      border-color: white;
    }

    .carousel-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.2);
      z-index: 3;
    }

    .progress-bar {
      height: 100%;
      background: var(--primary-color, #ff6b35);
      transition: width 0.1s linear;
    }

    .carousel-controls {
      position: absolute;
      top: 2rem;
      right: 2rem;
      z-index: 3;
    }

    .control-btn {
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .control-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
    }

    @media (max-width: 768px) {
      .slide-title {
        font-size: 2.5rem;
      }
      
      .slide-subtitle {
        font-size: 1.2rem;
      }
      
      .slide-description {
        font-size: 1rem;
      }
      
      .slide-buttons {
        flex-direction: column;
        align-items: center;
      }
      
      .carousel-navigation {
        padding: 0 1rem;
      }
      
      .carousel-btn {
        width: 40px;
        height: 40px;
      }
    }
  `]
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  @Input() slides: CarouselSlide[] = [];
  @Input() autoPlay = true;
  @Input() autoPlayDuration = 8000;
  @Input() showNavigation = true;
  @Input() showIndicators = true;
  @Input() showProgress = true;
  @Input() showControls = true;
  @Input() pauseOnHover = true;

  @Output() slideChange = new EventEmitter<number>();
  @Output() buttonClick = new EventEmitter<{button: any, slideIndex: number}>();

  @ViewChild('carouselContainer', { static: true }) carouselContainer!: ElementRef;

  currentSlide = 0;
  isPlaying = true;
  isTransitioning = false;
  progressPercentage = 0;

  private autoPlaySubscription?: Subscription;
  private progressSubscription?: Subscription;
  private touchStartX = 0;
  private touchEndX = 0;

  ngOnInit(): void {
    this.setupKeyboardNavigation();
    this.setupTouchNavigation();
    this.setupHoverPause();
    
    if (this.autoPlay) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
    this.stopProgress();
  }

  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prevSlide();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
      } else if (e.key === ' ') {
        e.preventDefault();
        this.toggleAutoPlay();
      }
    });
  }

  private setupTouchNavigation(): void {
    const element = this.carouselContainer.nativeElement;
    
    element.addEventListener('touchstart', (e: TouchEvent) => {
      this.touchStartX = e.touches[0].clientX;
    });

    element.addEventListener('touchend', (e: TouchEvent) => {
      this.touchEndX = e.changedTouches[0].clientX;
      this.handleSwipe();
    });
  }

  private setupHoverPause(): void {
    if (!this.pauseOnHover) return;

    const element = this.carouselContainer.nativeElement;
    
    element.addEventListener('mouseenter', () => {
      if (this.autoPlay && this.isPlaying) {
        this.pauseAutoPlay();
      }
    });

    element.addEventListener('mouseleave', () => {
      if (this.autoPlay && !this.isPlaying) {
        this.resumeAutoPlay();
      }
    });
  }

  private handleSwipe(): void {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    }
  }

  goToSlide(index: number): void {
    if (index === this.currentSlide || this.isTransitioning || index < 0 || index >= this.slides.length) {
      return;
    }

    this.isTransitioning = true;
    this.currentSlide = index;
    this.slideChange.emit(this.currentSlide);
    this.resetProgress();

    setTimeout(() => {
      this.isTransitioning = false;
    }, ANIMATION_DURATIONS.normal);
  }

  nextSlide(): void {
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }

  prevSlide(): void {
    const prevIndex = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
    this.goToSlide(prevIndex);
  }

  startAutoPlay(): void {
    if (!this.autoPlay || this.slides.length <= 1) return;

    this.isPlaying = true;
    this.autoPlaySubscription = interval(this.autoPlayDuration).subscribe(() => {
      this.nextSlide();
    });

    this.startProgress();
  }

  pauseAutoPlay(): void {
    this.isPlaying = false;
    this.autoPlaySubscription?.unsubscribe();
    this.stopProgress();
  }

  resumeAutoPlay(): void {
    if (this.autoPlay) {
      this.startAutoPlay();
    }
  }

  toggleAutoPlay(): void {
    if (this.isPlaying) {
      this.pauseAutoPlay();
    } else {
      this.resumeAutoPlay();
    }
  }

  private stopAutoPlay(): void {
    this.autoPlaySubscription?.unsubscribe();
  }

  private startProgress(): void {
    if (!this.showProgress) return;

    this.progressPercentage = 0;
    const updateInterval = 50; // Update every 50ms
    const increment = (100 * updateInterval) / this.autoPlayDuration;

    this.progressSubscription = interval(updateInterval).subscribe(() => {
      this.progressPercentage += increment;
      if (this.progressPercentage >= 100) {
        this.progressPercentage = 0;
      }
    });
  }

  private stopProgress(): void {
    this.progressSubscription?.unsubscribe();
  }

  private resetProgress(): void {
    this.progressPercentage = 0;
    this.stopProgress();
    if (this.isPlaying && this.showProgress) {
      this.startProgress();
    }
  }

  handleButtonClick(button: any, slideIndex: number): void {
    this.buttonClick.emit({ button, slideIndex });
    
    // Handle default actions
    if (button.link) {
      window.open(button.link, '_blank');
    }
  }
}