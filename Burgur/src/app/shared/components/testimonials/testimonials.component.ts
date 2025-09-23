// ==========================================
// BURGER CLUB - TESTIMONIALS COMPONENT
// ==========================================

import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { ANIMATION_DURATIONS } from '../../constants/app.constants';

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating: number;
  content: string;
  date?: string;
}

export interface TestimonialStats {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="testimonials-section" #testimonialsSection>
      <!-- Stats Section -->
      <div class="testimonials-stats" *ngIf="stats.length > 0">
        <div class="container">
          <div class="stats-grid">
            <div 
              *ngFor="let stat of stats; let i = index" 
              class="stat-item"
              [class.animated]="statsAnimated"
            >
              <div class="stat-number" [attr.data-target]="stat.value">
                {{ stat.prefix || '' }}{{ animatedStats[i] || 0 }}{{ stat.suffix || '' }}
              </div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Testimonials Carousel -->
      <div class="testimonials-carousel" *ngIf="testimonials.length > 0">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Lo que dicen nuestros clientes</h2>
            <p class="section-subtitle">Experiencias reales de personas que aman Burger Club</p>
          </div>

          <div class="carousel-container" #carouselContainer>
            <div class="testimonials-track" [style.transform]="'translateX(' + trackTransform + '%)'">
              <div 
                *ngFor="let testimonial of testimonials; let i = index"
                class="testimonial-card"
                [class.active]="i === currentSlide"
              >
                <div class="testimonial-content">
                  <div class="testimonial-rating">
                    <i 
                      *ngFor="let star of getStars(testimonial.rating)" 
                      class="fas fa-star"
                      [class.filled]="star <= testimonial.rating"
                    ></i>
                  </div>
                  
                  <blockquote class="testimonial-text">
                    "{{ testimonial.content }}"
                  </blockquote>
                  
                  <div class="testimonial-author">
                    <div class="author-avatar" *ngIf="testimonial.avatar">
                      <img [src]="testimonial.avatar" [alt]="testimonial.name">
                    </div>
                    <div class="author-info">
                      <h4 class="author-name">{{ testimonial.name }}</h4>
                      <p class="author-role" *ngIf="testimonial.role">
                        {{ testimonial.role }}
                        <span *ngIf="testimonial.company"> - {{ testimonial.company }}</span>
                      </p>
                      <p class="testimonial-date" *ngIf="testimonial.date">{{ testimonial.date }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <div class="testimonials-nav" *ngIf="testimonials.length > 1">
            <button 
              class="nav-btn nav-prev"
              (click)="previousSlide()"
              [disabled]="isTransitioning"
              aria-label="Testimonio anterior"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button 
              class="nav-btn nav-next"
              (click)="nextSlide()"
              [disabled]="isTransitioning"
              aria-label="Siguiente testimonio"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>

          <!-- Indicators -->
          <div class="testimonials-indicators" *ngIf="testimonials.length > 1 && showIndicators">
            <button
              *ngFor="let testimonial of testimonials; let i = index"
              class="indicator"
              [class.active]="i === currentSlide"
              (click)="goToSlide(i)"
              [attr.aria-label]="'Ir al testimonio ' + (i + 1)"
            ></button>
          </div>

          <!-- Autoplay Controls -->
          <div class="carousel-controls" *ngIf="autoPlay && showControls">
            <button 
              class="control-btn"
              (click)="toggleAutoplay()"
              [attr.aria-label]="isPlaying ? 'Pausar autoplay' : 'Reanudar autoplay'"
            >
              <i [class]="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .testimonials-section {
      padding: 4rem 0;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      position: relative;
      overflow: hidden;
    }

    .testimonials-stats {
      padding: 2rem 0;
      margin-bottom: 3rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      text-align: center;
    }

    .stat-item {
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.6s ease;
    }

    .stat-item.animated {
      transform: translateY(0);
      opacity: 1;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--primary-color, #ff6b35);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 1rem;
      color: #666;
      font-weight: 500;
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 2.5rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 1rem;
    }

    .section-subtitle {
      font-size: 1.2rem;
      color: #666;
      max-width: 600px;
      margin: 0 auto;
    }

    .carousel-container {
      position: relative;
      overflow: hidden;
      border-radius: 16px;
      margin-bottom: 2rem;
    }

    .testimonials-track {
      display: flex;
      transition: transform 0.6s ease-in-out;
    }

    .testimonial-card {
      flex: 0 0 100%;
      padding: 2rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      margin: 0 1rem;
      opacity: 0.7;
      transform: scale(0.95);
      transition: all 0.6s ease;
    }

    .testimonial-card.active {
      opacity: 1;
      transform: scale(1);
    }

    .testimonial-content {
      text-align: center;
    }

    .testimonial-rating {
      margin-bottom: 1.5rem;
    }

    .testimonial-rating .fas {
      color: #ddd;
      font-size: 1.2rem;
      margin: 0 0.2rem;
    }

    .testimonial-rating .fas.filled {
      color: #ffc107;
    }

    .testimonial-text {
      font-size: 1.3rem;
      line-height: 1.6;
      color: #333;
      font-style: italic;
      margin: 0 0 2rem 0;
      position: relative;
    }

    .testimonial-text::before,
    .testimonial-text::after {
      content: '"';
      font-size: 3rem;
      color: var(--primary-color, #ff6b35);
      position: absolute;
      top: -10px;
    }

    .testimonial-text::before {
      left: -20px;
    }

    .testimonial-text::after {
      right: -20px;
    }

    .testimonial-author {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .author-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid var(--primary-color, #ff6b35);
    }

    .author-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .author-info {
      text-align: left;
    }

    .author-name {
      font-size: 1.1rem;
      font-weight: bold;
      color: #333;
      margin: 0 0 0.25rem 0;
    }

    .author-role {
      font-size: 0.9rem;
      color: #666;
      margin: 0;
    }

    .testimonial-date {
      font-size: 0.8rem;
      color: #999;
      margin: 0.25rem 0 0 0;
    }

    .testimonials-nav {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .nav-btn {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 2px solid var(--primary-color, #ff6b35);
      background: white;
      color: var(--primary-color, #ff6b35);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1.2rem;
    }

    .nav-btn:hover:not(:disabled) {
      background: var(--primary-color, #ff6b35);
      color: white;
      transform: scale(1.1);
    }

    .nav-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .testimonials-indicators {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid var(--primary-color, #ff6b35);
      background: transparent;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .indicator.active {
      background: var(--primary-color, #ff6b35);
    }

    .carousel-controls {
      display: flex;
      justify-content: center;
    }

    .control-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid var(--primary-color, #ff6b35);
      background: white;
      color: var(--primary-color, #ff6b35);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .control-btn:hover {
      background: var(--primary-color, #ff6b35);
      color: white;
    }

    @media (max-width: 768px) {
      .testimonials-section {
        padding: 2rem 0;
      }

      .section-title {
        font-size: 2rem;
      }

      .testimonial-card {
        margin: 0 0.5rem;
        padding: 1.5rem;
      }

      .testimonial-text {
        font-size: 1.1rem;
      }

      .testimonial-text::before,
      .testimonial-text::after {
        display: none;
      }

      .testimonial-author {
        flex-direction: column;
        text-align: center;
      }

      .author-info {
        text-align: center;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .stat-number {
        font-size: 2rem;
      }
    }
  `]
})
export class TestimonialsComponent implements OnInit, OnDestroy {
  @Input() testimonials: Testimonial[] = [];
  @Input() stats: TestimonialStats[] = [];
  @Input() autoPlay = true;
  @Input() autoPlayDelay = 5000;
  @Input() showIndicators = true;
  @Input() showControls = true;

  @ViewChild('testimonialsSection', { static: true }) testimonialsSection!: ElementRef;
  @ViewChild('carouselContainer', { static: false }) carouselContainer?: ElementRef;

  currentSlide = 0;
  isTransitioning = false;
  isPlaying = true;
  trackTransform = 0;
  statsAnimated = false;
  animatedStats: number[] = [];

  private autoplaySubscription?: Subscription;
  private observer?: IntersectionObserver;
  private touchStartX = 0;
  private touchEndX = 0;

  ngOnInit(): void {
    this.setupIntersectionObserver();
    this.setupKeyboardNavigation();
    this.setupTouchNavigation();
    this.initializeStats();
    
    if (this.autoPlay && this.testimonials.length > 1) {
      this.startAutoplay();
    }
  }

  ngOnDestroy(): void {
    this.pauseAutoplay();
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupIntersectionObserver(): void {
    const options = {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.statsAnimated) {
          this.animateStats();
        }
      });
    }, options);

    this.observer.observe(this.testimonialsSection.nativeElement);
  }

  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.previousSlide();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
      } else if (e.key === ' ') {
        e.preventDefault();
        this.toggleAutoplay();
      }
    });
  }

  private setupTouchNavigation(): void {
    if (!this.carouselContainer) return;

    const element = this.carouselContainer.nativeElement;
    
    element.addEventListener('touchstart', (e: TouchEvent) => {
      this.touchStartX = e.touches[0].clientX;
    });

    element.addEventListener('touchend', (e: TouchEvent) => {
      this.touchEndX = e.changedTouches[0].clientX;
      this.handleSwipe();
    });
  }

  private handleSwipe(): void {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.nextSlide();
      } else {
        this.previousSlide();
      }
    }
  }

  private initializeStats(): void {
    this.animatedStats = new Array(this.stats.length).fill(0);
  }

  private animateStats(): void {
    this.statsAnimated = true;
    
    this.stats.forEach((stat, index) => {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = stat.value / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        current += increment;
        step++;
        
        if (step >= steps) {
          current = stat.value;
          clearInterval(timer);
        }
        
        this.animatedStats[index] = Math.floor(current);
      }, duration / steps);
    });
  }

  goToSlide(index: number): void {
    if (index === this.currentSlide || this.isTransitioning || index < 0 || index >= this.testimonials.length) {
      return;
    }

    this.isTransitioning = true;
    this.currentSlide = index;
    this.trackTransform = -index * 100;

    setTimeout(() => {
      this.isTransitioning = false;
    }, ANIMATION_DURATIONS.normal);
  }

  nextSlide(): void {
    const nextIndex = (this.currentSlide + 1) % this.testimonials.length;
    this.goToSlide(nextIndex);
  }

  previousSlide(): void {
    const prevIndex = this.currentSlide === 0 ? this.testimonials.length - 1 : this.currentSlide - 1;
    this.goToSlide(prevIndex);
  }

  startAutoplay(): void {
    if (!this.autoPlay || this.testimonials.length <= 1) return;

    this.isPlaying = true;
    this.autoplaySubscription = interval(this.autoPlayDelay).subscribe(() => {
      this.nextSlide();
    });
  }

  pauseAutoplay(): void {
    this.isPlaying = false;
    this.autoplaySubscription?.unsubscribe();
  }

  toggleAutoplay(): void {
    if (this.isPlaying) {
      this.pauseAutoplay();
    } else {
      this.startAutoplay();
    }
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}