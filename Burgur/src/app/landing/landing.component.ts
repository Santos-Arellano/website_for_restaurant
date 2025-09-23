import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { CartService } from '../services/cart.service';
import { LocationService } from '../services/location.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit, OnDestroy, AfterViewInit {
  isLoading = true;
  cartItemsCount = 0;
  private subscription: Subscription = new Subscription();
  
  // Hero Carousel Properties
  private currentSlide = 0;
  private totalSlides = 4;
  private autoPlayInterval: any;
  private progressInterval: any;
  private autoPlayDuration = 5000; // 5 seconds per slide

  constructor(private cartService: CartService, private locationService: LocationService) {}

  ngOnInit() {
    // Component initialization
    // Hide loader after a short delay to show loading animation
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);

    // Subscribe to cart updates
    this.subscription.add(
      this.cartService.cart$.subscribe(items => {
        this.cartItemsCount = this.cartService.getItemCount();
      })
    );
  }

  ngAfterViewInit(): void {
    this.initializeCarousel();
    this.initializeTestimonials();
    this.initializeAnimations();
    this.initializeLocationButton();
    this.initializeScrollAnimations();
    this.initializeParallaxEffects();
  }

  ngOnDestroy() {
    // Cleanup subscriptions and intervals
    this.subscription.unsubscribe();
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  openCart() {
    this.cartService.openCart();
  }

  openLocationModal() {
    this.locationService.openLocationModal();
  }

  private initializeCarousel() {
    // Initialize hero carousel
    setTimeout(() => {
      this.setupCarouselNavigation();
      this.setupCarouselIndicators();
      this.startAutoPlay();
      this.startProgressBar();
    }, 100);
  }

  private setupCarouselNavigation() {
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.previousSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.nextSlide();
      });
    }
  }

  private setupCarouselIndicators() {
    const indicators = document.querySelectorAll('.hero-carousel-indicators .indicator');
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        this.goToSlide(index);
      });
    });
  }

  private nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateCarousel();
    this.restartAutoPlay();
  }

  private previousSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.updateCarousel();
    this.restartAutoPlay();
  }

  private goToSlide(slideIndex: number) {
    this.currentSlide = slideIndex;
    this.updateCarousel();
    this.restartAutoPlay();
  }

  private updateCarousel() {
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.hero-carousel-indicators .indicator');

    // Update slides
    slides.forEach((slide, index) => {
      slide.classList.remove('active', 'prev');
      if (index === this.currentSlide) {
        slide.classList.add('active');
      } else if (index === (this.currentSlide - 1 + this.totalSlides) % this.totalSlides) {
        slide.classList.add('prev');
      }
    });

    // Update indicators
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentSlide);
    });

    // Trigger slide animations
    this.triggerSlideAnimations();
  }

  private triggerSlideAnimations() {
    const activeSlide = document.querySelector('.hero-slide.active');
    if (activeSlide) {
      const textElement = activeSlide.querySelector('.hero-slide-text') as HTMLElement;
      const imageElement = activeSlide.querySelector('.hero-slide-image') as HTMLElement;
      
      if (textElement) {
        textElement.style.animation = 'none';
        setTimeout(() => {
          textElement.style.animation = 'slideInLeft 0.8s ease-out 0.3s both';
        }, 10);
      }
      
      if (imageElement) {
        imageElement.style.animation = 'none';
        setTimeout(() => {
          imageElement.style.animation = 'slideInRight 0.8s ease-out 0.5s both';
        }, 10);
      }
    }
  }

  private startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDuration);
  }

  private restartAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    this.startAutoPlay();
    this.startProgressBar();
  }

  private startProgressBar() {
    const progressBar = document.getElementById('carouselProgress') as HTMLElement;
    if (!progressBar) return;

    let progress = 0;
    const increment = 100 / (this.autoPlayDuration / 100);

    progressBar.style.width = '0%';
    
    this.progressInterval = setInterval(() => {
      progress += increment;
      if (progress >= 100) {
        progress = 0;
      }
      progressBar.style.width = progress + '%';
    }, 100);
  }

  private initializeTestimonials() {
    // Testimonials carousel functionality
    setTimeout(() => {
      this.setupTestimonialsCarousel();
    }, 200);
  }

  private setupTestimonialsCarousel() {
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    const indicators = document.querySelectorAll('.testimonials-indicators .indicator');
    
    let currentTestimonial = 0;
    const totalTestimonials = 3;

    const updateTestimonials = (index: number) => {
      const testimonials = document.querySelectorAll('.testimonial-card');
      const testimonialIndicators = document.querySelectorAll('.testimonials-indicators .indicator');
      
      testimonials.forEach((testimonial, i) => {
        testimonial.classList.toggle('active', i === index);
      });
      
      testimonialIndicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
      });
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentTestimonial = (currentTestimonial - 1 + totalTestimonials) % totalTestimonials;
        updateTestimonials(currentTestimonial);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentTestimonial = (currentTestimonial + 1) % totalTestimonials;
        updateTestimonials(currentTestimonial);
      });
    }

    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        currentTestimonial = index;
        updateTestimonials(currentTestimonial);
      });
    });
  }

  private initializeAnimations() {
    // Initialize scroll animations and other interactive elements
    setTimeout(() => {
      this.setupCounterAnimations();
    }, 300);
  }

  private initializeScrollAnimations(): void {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe all elements with data-animate attribute
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(el => observer.observe(el));

    // Add scroll-triggered animations for specific sections
    this.addScrollTriggers();
  }

  private addScrollTriggers(): void {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Parallax effect for hero section
      const heroSection = document.querySelector('.hero-section') as HTMLElement;
      if (heroSection) {
        heroSection.style.transform = `translateY(${scrollY * 0.5}px)`;
      }

      // Animate welcome section elements
      const welcomeSection = document.querySelector('.welcome-section');
      if (welcomeSection) {
        const rect = welcomeSection.getBoundingClientRect();
        if (rect.top < windowHeight && rect.bottom > 0) {
          const features = welcomeSection.querySelectorAll('.welcome-feature');
          features.forEach((feature, index) => {
            setTimeout(() => {
              feature.classList.add('animate-in');
            }, index * 200);
          });
        }
      }

      // Animate testimonial cards
      const testimonialCards = document.querySelectorAll('.testimonial-card');
      testimonialCards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < windowHeight && rect.bottom > 0) {
          setTimeout(() => {
            card.classList.add('animate-in');
          }, index * 150);
        }
      });

      // Animate stats
      const statsElements = document.querySelectorAll('.stat-item');
      statsElements.forEach((stat, index) => {
        const rect = stat.getBoundingClientRect();
        if (rect.top < windowHeight && rect.bottom > 0) {
          setTimeout(() => {
            stat.classList.add('animate-in');
            this.animateCounter(stat.querySelector('.stat-number') as HTMLElement);
          }, index * 100);
        }
      });
    });
  }

  private animateCounter(element: HTMLElement): void {
    if (!element || element.classList.contains('counted')) return;
    
    element.classList.add('counted');
    const target = parseInt(element.textContent || '0');
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current).toString();
    }, 30);
  }

  private initializeParallaxEffects(): void {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-element');
      
      parallaxElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        const speed = parseFloat(htmlElement.dataset['speed'] || '0.5');
        const yPos = -(scrolled * speed);
        htmlElement.style.transform = `translateY(${yPos}px)`;
      });

      // Floating elements animation
      const floatingElements = document.querySelectorAll('.floating-element');
      floatingElements.forEach((element, index) => {
        const htmlElement = element as HTMLElement;
        const offset = Math.sin(scrolled * 0.01 + index) * 10;
        htmlElement.style.transform = `translateY(${offset}px)`;
      });
    });
  }

  private setupCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    
    const animateCounter = (element: Element) => {
      const target = parseInt(element.getAttribute('data-count') || '0');
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;

      const updateCounter = () => {
        current += increment;
        if (current < target) {
          element.textContent = Math.floor(current).toString();
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target.toString();
        }
      };

      updateCounter();
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
      counterObserver.observe(counter);
    });
  }

  private initializeLocationButton() {
    // Add click event listener to location button
    setTimeout(() => {
      const locationBtn = document.getElementById('locationBtn');
      if (locationBtn) {
        locationBtn.addEventListener('click', () => {
          this.openLocationModal();
        });
      }
    }, 100);
  }
}