import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LocationModalComponent } from '../../../../components/location-modal/location-modal.component';
import { LocationService } from '../../../../services/location.service';
import { AuthService, User } from '../../../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LocationModalComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('loader', { static: false }) loader!: ElementRef;
  
  // Carousel properties
  private currentSlide = 0;
  private totalSlides = 4;
  private autoplayInterval: any = null;
  private autoplayDelay = 5000;
  private isTransitioning = false;
  
  // Testimonials properties
  private currentTestimonial = 0;
  private totalTestimonials = 3;
  private testimonialsInterval: any = null;
  private testimonialsDelay = 6000;
  
  // Animation properties
  private animatedElements = new Set<Element>();
  private observer!: IntersectionObserver;
  
  // Mobile menu
  private mobileMenuOpen = false;
  
  // Location modal
  public showLocationModal = false;
  
  // Authentication
  public currentUser$: Observable<User | null>;
  public isLoggedIn$: Observable<boolean>;
  
  constructor(private router: Router, private locationService: LocationService, private authService: AuthService) {
    this.currentUser$ = this.authService.getCurrentUser();
    this.isLoggedIn$ = this.authService.isLoggedIn();
  }

  ngOnInit() {
    this.showLoader();
  }

  ngAfterViewInit() {
    // Agregar logs para debugging
    console.log('ngAfterViewInit ejecutado');
    
    setTimeout(() => {
      console.log('Timeout ejecutado, llamando hideLoader');
      this.hideLoader();
      this.initializeCarousel();
      this.initializeTestimonials();
      this.initializeMobileMenu();
      this.initializeScrollAnimations();
      this.initializeSmoothScroll();
      this.initializeStats();
      this.initializeHeader();
    }, 1000); // Reducir tiempo para debugging más rápido
  }

  ngOnDestroy() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
    if (this.testimonialsInterval) {
      clearInterval(this.testimonialsInterval);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private showLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.display = 'flex';
      loader.style.opacity = '1';
    }
  }

  private hideLoader() {
    console.log('hideLoader llamado');
    
    // Ocultar TODOS los elementos con ID loader (hay múltiples)
    const allLoaders = document.querySelectorAll('#loader');
    console.log('Número de elementos con ID loader encontrados:', allLoaders.length);
    
    allLoaders.forEach((loader, index) => {
      console.log(`Ocultando Loader ${index}:`, loader);
      
      // Remover estilos inline que puedan interferir
      (loader as HTMLElement).removeAttribute('style');
      
      // Remover clases que muestran el loader
      loader.classList.remove('show', 'active');
      loader.classList.add('fade-out');
      
      setTimeout(() => {
        loader.classList.add('hidden');
        
        // Forzar el ocultamiento con estilo inline como respaldo
        (loader as HTMLElement).style.display = 'none';
        (loader as HTMLElement).style.opacity = '0';
        (loader as HTMLElement).style.visibility = 'hidden';
        
        console.log(`Loader ${index} estado final:`, {
          display: getComputedStyle(loader as Element).display,
          opacity: getComputedStyle(loader as Element).opacity,
          visibility: getComputedStyle(loader as Element).visibility,
          classes: loader.className
        });
      }, 500);
    });
    
    console.log('Todos los loaders deberían estar ocultos ahora');
  }

  private initializeCarousel() {
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.hero-carousel-indicators .indicator');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const progressBar = document.getElementById('carouselProgress');

    if (slides.length === 0) return;

    // Navigation buttons
    prevBtn?.addEventListener('click', () => this.previousSlide());
    nextBtn?.addEventListener('click', () => this.nextSlide());

    // Indicators
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.previousSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });

    // Touch navigation
    this.setupTouchNavigation();

    // Auto-play
    this.startAutoplay();

    // Pause on hover
    const carousel = document.querySelector('.hero-carousel-section');
    carousel?.addEventListener('mouseenter', () => this.pauseAutoplay());
    carousel?.addEventListener('mouseleave', () => this.startAutoplay());
  }

  private setupTouchNavigation() {
    const carousel = document.querySelector('.hero-carousel-container');
    if (!carousel) return;

    let startX = 0;
    let startY = 0;
    let isDragging = false;

    carousel.addEventListener('touchstart', (e: Event) => {
       const touchEvent = e as TouchEvent;
       startX = touchEvent.touches[0].clientX;
       startY = touchEvent.touches[0].clientY;
       isDragging = true;
     });

     carousel.addEventListener('touchmove', (e: Event) => {
       if (!isDragging) return;
       e.preventDefault();
     });

     carousel.addEventListener('touchend', (e: Event) => {
       if (!isDragging) return;
       isDragging = false;

       const touchEvent = e as TouchEvent;
       const endX = touchEvent.changedTouches[0].clientX;
       const endY = touchEvent.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = startY - endY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          this.nextSlide();
        } else {
          this.previousSlide();
        }
      }
    });
  }

  private nextSlide() {
    if (this.isTransitioning) return;
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateSlide();
  }

  private previousSlide() {
    if (this.isTransitioning) return;
    this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
    this.updateSlide();
  }

  private goToSlide(index: number) {
    if (this.isTransitioning || index === this.currentSlide) return;
    this.currentSlide = index;
    this.updateSlide();
  }

  private updateSlide() {
    this.isTransitioning = true;
    
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

    // Update progress bar
    this.updateProgressBar();

    setTimeout(() => {
      this.isTransitioning = false;
    }, 800);
  }

  private updateProgressBar() {
    const progressBar = document.getElementById('carouselProgress') as HTMLElement;
    if (progressBar) {
      progressBar.style.width = '0%';
      setTimeout(() => {
        progressBar.style.width = '100%';
        progressBar.style.transition = `width ${this.autoplayDelay}ms linear`;
      }, 100);
    }
  }

  private startAutoplay() {
    this.pauseAutoplay();
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoplayDelay);
    this.updateProgressBar();
  }

  private pauseAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  // Testimonials functionality
  private initializeTestimonials() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    const indicators = document.querySelectorAll('.testimonials-indicators .indicator');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');

    if (testimonials.length === 0) return;

    // Navigation buttons
    prevBtn?.addEventListener('click', () => this.previousTestimonial());
    nextBtn?.addEventListener('click', () => this.nextTestimonial());

    // Indicators
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToTestimonial(index));
    });

    // Auto-play
    this.startTestimonialsAutoplay();

    // Pause on hover
    const section = document.querySelector('.testimonials-section');
    section?.addEventListener('mouseenter', () => this.pauseTestimonialsAutoplay());
    section?.addEventListener('mouseleave', () => this.startTestimonialsAutoplay());
  }

  private nextTestimonial() {
    this.currentTestimonial = (this.currentTestimonial + 1) % this.totalTestimonials;
    this.updateTestimonial();
  }

  private previousTestimonial() {
    this.currentTestimonial = this.currentTestimonial === 0 ? this.totalTestimonials - 1 : this.currentTestimonial - 1;
    this.updateTestimonial();
  }

  private goToTestimonial(index: number) {
    if (index === this.currentTestimonial) return;
    this.currentTestimonial = index;
    this.updateTestimonial();
  }

  private updateTestimonial() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    const indicators = document.querySelectorAll('.testimonials-indicators .indicator');
    
    testimonials.forEach((testimonial, index) => {
      testimonial.classList.toggle('active', index === this.currentTestimonial);
    });

    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentTestimonial);
    });
  }

  private startTestimonialsAutoplay() {
    this.pauseTestimonialsAutoplay();
    this.testimonialsInterval = setInterval(() => {
      this.nextTestimonial();
    }, this.testimonialsDelay);
  }

  private pauseTestimonialsAutoplay() {
    if (this.testimonialsInterval) {
      clearInterval(this.testimonialsInterval);
      this.testimonialsInterval = null;
    }
  }

  // Mobile menu functionality
  private initializeMobileMenu() {
    const mobileToggle = document.getElementById('mobileNavToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileMenuOverlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    mobileToggle?.addEventListener('click', () => this.toggleMobileMenu());
    mobileOverlay?.addEventListener('click', () => this.closeMobileMenu());

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => this.closeMobileMenu());
    });
  }

  private toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileMenuOverlay');
    const mobileToggle = document.getElementById('mobileNavToggle');

    if (this.mobileMenuOpen) {
      mobileMenu?.classList.add('active');
      mobileOverlay?.classList.add('active');
      mobileToggle?.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    } else {
      this.closeMobileMenu();
    }
  }

  private closeMobileMenu() {
    this.mobileMenuOpen = false;
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileMenuOverlay');
    const mobileToggle = document.getElementById('mobileNavToggle');

    mobileMenu?.classList.remove('active');
    mobileOverlay?.classList.remove('active');
    mobileToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Scroll animations
  private initializeScrollAnimations() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
          entry.target.classList.add('animate');
          this.animatedElements.add(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(el => this.observer.observe(el));
  }

  // Smooth scroll
  private initializeSmoothScroll() {
    // Solo aplicar smooth scroll a enlaces internos específicos, no a todos los enlaces con #
    const scrollLinks = document.querySelectorAll('a[href="#hero"], a[href="#about"], a[href="#menu"], a[href="#contact"]');
    scrollLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href')?.substring(1);
        if (targetId) {
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  }

  // Stats animation
  private initializeStats() {
    const stats = document.querySelectorAll('.stat-number');
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateNumber(entry.target as HTMLElement);
          statsObserver.unobserve(entry.target);
        }
      });
    });

    stats.forEach(stat => statsObserver.observe(stat));
  }

  private animateNumber(element: HTMLElement) {
    const target = parseInt(element.getAttribute('data-count') || '0');
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current).toString();
    }, 16);
  }

  // Header functionality
  private initializeHeader() {
    const header = document.getElementById('header');
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = document.getElementById('cartModal');
    const cartClose = document.getElementById('cartClose');
    const locationBtn = document.getElementById('locationBtn');

    // Sticky header
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    });

    // Cart modal
    cartBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      cartModal?.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    cartClose?.addEventListener('click', () => {
      cartModal?.classList.remove('active');
      document.body.style.overflow = '';
    });

    cartModal?.addEventListener('click', (e) => {
      if (e.target === cartModal) {
        cartModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    // Location button
    locationBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Location button clicked!'); // Debug log
      console.log('LocationService:', this.locationService); // Debug log
      this.locationService.openLocationModal();
    });
  }

  // Location modal methods
  openLocationModal() {
    console.log('openLocationModal called!'); // Debug log
    console.log('LocationService:', this.locationService); // Debug log
    this.locationService.openLocationModal();
  }

  closeLocationModal() {
    this.locationService.closeLocationModal();
  }

  // Navigation methods
  navigateToMenu(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.router.navigate(['/menu']);
  }

  scrollToAbout() {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  logout() {
    this.authService.logout();
  }

  // Authentication status (placeholder)
  get isAuthenticated(): boolean {
    return false; // This should be connected to your auth service
  }
}