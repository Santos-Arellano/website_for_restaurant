import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';

declare let AnimationManager: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  
  // Carousel state
  currentSlide = 0;
  totalSlides = 4;
  autoPlayTimer: any;
  progressTimer: any;
  progressWidth = 0;
  
  // Testimonials state
  currentTestimonial = 0;
  totalTestimonials = 3;
  
  // Animation manager
  private animationManager: any;
  
  ngOnInit() {
    this.initializeComponent();
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.setupCarousel();
      this.setupTestimonials();
      this.initializeCounters();
      this.initializeAnimations();
    }, 100);
  }
  
  ngOnDestroy() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
    }
  }
  
  initializeComponent() {
    // Initialize carousel
    this.currentSlide = 0;
    this.currentTestimonial = 0;
  }
  
  setupCarousel() {
    // Auto-play carousel
    this.startAutoPlay();
    
    // Setup navigation buttons
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousSlide());
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextSlide());
    }
    
    // Setup indicators
    const indicators = document.querySelectorAll('.carousel-indicator');
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });
  }
  
  setupTestimonials() {
    const prevBtn = document.querySelector('.testimonials-prev');
    const nextBtn = document.querySelector('.testimonials-next');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousTestimonial());
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextTestimonial());
    }
  }
  
  startAutoPlay() {
    this.autoPlayTimer = setInterval(() => {
      this.nextSlide();
    }, 5000);
    
    this.startProgressBar();
  }
  
  startProgressBar() {
    this.progressWidth = 0;
    this.progressTimer = setInterval(() => {
      this.progressWidth += 2;
      const progressBar = document.querySelector('.progress-bar') as HTMLElement;
      if (progressBar) {
        progressBar.style.width = this.progressWidth + '%';
      }
      
      if (this.progressWidth >= 100) {
        this.progressWidth = 0;
      }
    }, 100);
  }
  
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateCarousel();
    this.resetAutoPlay();
  }
  
  previousSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
    this.updateCarousel();
    this.resetAutoPlay();
  }
  
  goToSlide(index: number) {
    this.currentSlide = index;
    this.updateCarousel();
    this.resetAutoPlay();
  }
  
  updateCarousel() {
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    
    // Update slides
    slides.forEach((slide, index) => {
      if (index === this.currentSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
    
    // Update indicators
    indicators.forEach((indicator, index) => {
      if (index === this.currentSlide) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
  }
  
  resetAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
    }
    this.startAutoPlay();
  }
  
  nextTestimonial() {
    this.currentTestimonial = (this.currentTestimonial + 1) % this.totalTestimonials;
    this.updateTestimonials();
  }
  
  previousTestimonial() {
    this.currentTestimonial = this.currentTestimonial === 0 ? this.totalTestimonials - 1 : this.currentTestimonial - 1;
    this.updateTestimonials();
  }
  
  updateTestimonials() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    
    testimonials.forEach((testimonial, index) => {
      if (index === this.currentTestimonial) {
        testimonial.classList.add('active');
      } else {
        testimonial.classList.remove('active');
      }
    });
  }
  
  initializeCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    const observerOptions = {
      threshold: 0.7,
      rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          this.animateCounter(entry.target as HTMLElement);
        }
      });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
  }
  
  animateCounter(element: HTMLElement) {
    const target = parseInt(element.getAttribute('data-count') || '0');
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    element.classList.add('counted');
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current).toString();
    }, 16);
  }
  
  // Navigation methods for buttons
  orderNow(productType?: string) {
    console.log('Ordering:', productType || 'General order');
    // Implement order logic here
  }

  showDeliveryZones() {
    console.log('Showing delivery zones');
    // Implement delivery zones logic here
  }

  // ========== ANIMATION METHODS ==========
  
  initializeAnimations() {
    // Initialize scroll animations for elements
    this.setupScrollAnimations();
    
    // Animate page entrance
    this.animatePageEntrance();
    
    // Setup interactive animations
    this.setupInteractiveAnimations();
  }

  setupScrollAnimations() {
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

    // Observe animated elements
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(element => {
      observer.observe(element);
    });
  }

  animatePageEntrance() {
    // Animate hero section elements
    const heroElements = document.querySelectorAll('.hero-slide-content > *');
    heroElements.forEach((element, index) => {
      setTimeout(() => {
        (element as HTMLElement).style.opacity = '0';
        (element as HTMLElement).style.transform = 'translateY(30px)';
        (element as HTMLElement).style.transition = 'all 0.6s ease';
        
        requestAnimationFrame(() => {
          (element as HTMLElement).style.opacity = '1';
          (element as HTMLElement).style.transform = 'translateY(0)';
        });
      }, index * 200);
    });

    // Animate navigation
    const navItems = document.querySelectorAll('.nav-link');
    navItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('animate-fade-in');
      }, index * 100);
    });
  }

  setupInteractiveAnimations() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-hero-primary, .btn-hero-secondary');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.createRippleEffect(e, button as HTMLElement);
      });
    });

    // Add hover animations to cards
    const cards = document.querySelectorAll('.feature-card, .stat-item');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        (card as HTMLElement).style.transform = 'translateY(-5px) scale(1.02)';
        (card as HTMLElement).style.transition = 'all 0.3s ease';
      });

      card.addEventListener('mouseleave', () => {
        (card as HTMLElement).style.transform = 'translateY(0) scale(1)';
      });
    });
  }

  createRippleEffect(event: Event, element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = (event as MouseEvent).clientX - rect.left - size / 2;
    const y = (event as MouseEvent).clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
}