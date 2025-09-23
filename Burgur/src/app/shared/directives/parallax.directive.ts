// ==========================================
// BURGER CLUB - PARALLAX DIRECTIVE
// ==========================================

import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2, NgZone } from '@angular/core';

export type ParallaxDirection = 'up' | 'down' | 'left' | 'right' | 'float';

@Directive({
  selector: '[appParallax]',
  standalone: true
})
export class ParallaxDirective implements OnInit, OnDestroy {
  @Input('appParallax') speed = 0.5;
  @Input() direction: ParallaxDirection = 'up';
  @Input() disabled = false;
  @Input() threshold = 0.1;

  private observer?: IntersectionObserver;
  private isVisible = false;
  private rafId?: number;
  private lastScrollY = 0;
  private ticking = false;
  private reducedMotion = false;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.checkReducedMotion();
    
    if (!this.disabled && !this.reducedMotion) {
      this.setupIntersectionObserver();
      this.setupScrollListener();
      this.addHardwareAcceleration();
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private checkReducedMotion(): void {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private setupIntersectionObserver(): void {
    const options = {
      threshold: this.threshold,
      rootMargin: '50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
        
        if (this.isVisible) {
          this.startParallax();
        } else {
          this.stopParallax();
        }
      });
    }, options);

    this.observer.observe(this.elementRef.nativeElement);
  }

  private setupScrollListener(): void {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    });
  }

  private handleScroll(): void {
    if (!this.isVisible || this.ticking) return;

    this.ticking = true;
    this.rafId = requestAnimationFrame(() => {
      this.updateParallax();
      this.ticking = false;
    });
  }

  private updateParallax(): void {
    const scrollY = window.pageYOffset;
    const element = this.elementRef.nativeElement;
    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + scrollY;
    const elementHeight = rect.height;
    const windowHeight = window.innerHeight;

    // Calculate parallax offset
    const scrollProgress = (scrollY + windowHeight - elementTop) / (windowHeight + elementHeight);
    const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
    
    let offset = 0;
    const maxOffset = 100; // Maximum parallax offset in pixels

    switch (this.direction) {
      case 'up':
        offset = -(clampedProgress * maxOffset * this.speed);
        this.applyTransform(`translateY(${offset}px)`);
        break;
      case 'down':
        offset = clampedProgress * maxOffset * this.speed;
        this.applyTransform(`translateY(${offset}px)`);
        break;
      case 'left':
        offset = -(clampedProgress * maxOffset * this.speed);
        this.applyTransform(`translateX(${offset}px)`);
        break;
      case 'right':
        offset = clampedProgress * maxOffset * this.speed;
        this.applyTransform(`translateX(${offset}px)`);
        break;
      case 'float':
        const floatOffset = Math.sin(scrollY * 0.01) * 10 * this.speed;
        this.applyTransform(`translateY(${floatOffset}px)`);
        break;
    }

    this.lastScrollY = scrollY;
  }

  private applyTransform(transform: string): void {
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'transform',
      `translate3d(0, 0, 0) ${transform}`
    );
  }

  private addHardwareAcceleration(): void {
    const element = this.elementRef.nativeElement;
    this.renderer.setStyle(element, 'will-change', 'transform');
    this.renderer.setStyle(element, 'transform', 'translate3d(0, 0, 0)');
  }

  private startParallax(): void {
    if (!this.rafId) {
      this.handleScroll();
    }
  }

  private stopParallax(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
  }

  private cleanup(): void {
    this.stopParallax();
    
    if (this.observer) {
      this.observer.disconnect();
    }

    window.removeEventListener('scroll', this.handleScroll.bind(this));
  }

  // Public methods for manual control
  public enable(): void {
    this.disabled = false;
    if (!this.reducedMotion) {
      this.setupIntersectionObserver();
      this.setupScrollListener();
    }
  }

  public disable(): void {
    this.disabled = true;
    this.cleanup();
    
    // Reset transform
    this.renderer.removeStyle(this.elementRef.nativeElement, 'transform');
  }

  public refresh(): void {
    this.cleanup();
    if (!this.disabled && !this.reducedMotion) {
      this.setupIntersectionObserver();
      this.setupScrollListener();
    }
  }
}