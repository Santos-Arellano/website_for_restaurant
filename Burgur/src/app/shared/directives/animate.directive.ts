// ==========================================
// BURGER CLUB - ANGULAR ANIMATION DIRECTIVE
// ==========================================

import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { ANIMATION_DURATIONS } from '../constants/app.constants';

export type AnimationType = 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 
                           'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 
                           'zoomIn' | 'zoomOut' | 'bounce' | 'pulse' | 'shake';

@Directive({
  selector: '[appAnimate]',
  standalone: true
})
export class AnimateDirective implements OnInit, OnDestroy {
  @Input('appAnimate') animationType: AnimationType = 'fadeIn';
  @Input() animationDelay = 0;
  @Input() animationDuration = ANIMATION_DURATIONS.normal;
  @Input() animationTrigger: 'immediate' | 'scroll' | 'hover' | 'click' = 'scroll';
  @Input() animationThreshold = 0.1;
  @Input() animationOnce = true;

  private observer?: IntersectionObserver;
  private hasAnimated = false;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.setupAnimation();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupAnimation(): void {
    const element = this.elementRef.nativeElement;

    // Add initial styles
    this.addInitialStyles(element);

    switch (this.animationTrigger) {
      case 'immediate':
        this.triggerAnimation();
        break;
      case 'scroll':
        this.setupScrollObserver();
        break;
      case 'hover':
        this.setupHoverAnimation();
        break;
      case 'click':
        this.setupClickAnimation();
        break;
    }
  }

  private addInitialStyles(element: HTMLElement): void {
    // Set initial state based on animation type
    switch (this.animationType) {
      case 'fadeIn':
      case 'fadeInUp':
      case 'fadeInDown':
      case 'fadeInLeft':
      case 'fadeInRight':
        this.renderer.setStyle(element, 'opacity', '0');
        break;
      case 'slideUp':
        this.renderer.setStyle(element, 'transform', 'translateY(30px)');
        this.renderer.setStyle(element, 'opacity', '0');
        break;
      case 'slideDown':
        this.renderer.setStyle(element, 'transform', 'translateY(-30px)');
        this.renderer.setStyle(element, 'opacity', '0');
        break;
      case 'slideLeft':
        this.renderer.setStyle(element, 'transform', 'translateX(30px)');
        this.renderer.setStyle(element, 'opacity', '0');
        break;
      case 'slideRight':
        this.renderer.setStyle(element, 'transform', 'translateX(-30px)');
        this.renderer.setStyle(element, 'opacity', '0');
        break;
      case 'zoomIn':
        this.renderer.setStyle(element, 'transform', 'scale(0.8)');
        this.renderer.setStyle(element, 'opacity', '0');
        break;
      case 'zoomOut':
        this.renderer.setStyle(element, 'transform', 'scale(1.2)');
        this.renderer.setStyle(element, 'opacity', '0');
        break;
    }

    // Set transition
    this.renderer.setStyle(element, 'transition', `all ${this.animationDuration}ms ease`);
  }

  private setupScrollObserver(): void {
    const options = {
      threshold: this.animationThreshold,
      rootMargin: '0px 0px -50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && (!this.animationOnce || !this.hasAnimated)) {
          setTimeout(() => {
            this.triggerAnimation();
          }, this.animationDelay);
        }
      });
    }, options);

    this.observer.observe(this.elementRef.nativeElement);
  }

  private setupHoverAnimation(): void {
    const element = this.elementRef.nativeElement;
    
    this.renderer.listen(element, 'mouseenter', () => {
      if (!this.animationOnce || !this.hasAnimated) {
        setTimeout(() => {
          this.triggerAnimation();
        }, this.animationDelay);
      }
    });
  }

  private setupClickAnimation(): void {
    const element = this.elementRef.nativeElement;
    
    this.renderer.listen(element, 'click', () => {
      if (!this.animationOnce || !this.hasAnimated) {
        setTimeout(() => {
          this.triggerAnimation();
        }, this.animationDelay);
      }
    });
  }

  private triggerAnimation(): void {
    const element = this.elementRef.nativeElement;
    this.hasAnimated = true;

    switch (this.animationType) {
      case 'fadeIn':
        this.renderer.setStyle(element, 'opacity', '1');
        break;
      case 'fadeInUp':
        this.renderer.setStyle(element, 'opacity', '1');
        this.renderer.setStyle(element, 'transform', 'translateY(0)');
        break;
      case 'fadeInDown':
        this.renderer.setStyle(element, 'opacity', '1');
        this.renderer.setStyle(element, 'transform', 'translateY(0)');
        break;
      case 'fadeInLeft':
        this.renderer.setStyle(element, 'opacity', '1');
        this.renderer.setStyle(element, 'transform', 'translateX(0)');
        break;
      case 'fadeInRight':
        this.renderer.setStyle(element, 'opacity', '1');
        this.renderer.setStyle(element, 'transform', 'translateX(0)');
        break;
      case 'slideUp':
      case 'slideDown':
      case 'slideLeft':
      case 'slideRight':
        this.renderer.setStyle(element, 'opacity', '1');
        this.renderer.setStyle(element, 'transform', 'translate(0, 0)');
        break;
      case 'zoomIn':
      case 'zoomOut':
        this.renderer.setStyle(element, 'opacity', '1');
        this.renderer.setStyle(element, 'transform', 'scale(1)');
        break;
      case 'bounce':
        this.animateBounce(element);
        break;
      case 'pulse':
        this.animatePulse(element);
        break;
      case 'shake':
        this.animateShake(element);
        break;
    }
  }

  private animateBounce(element: HTMLElement): void {
    const keyframes = [
      { transform: 'translateY(0)', offset: 0 },
      { transform: 'translateY(-10px)', offset: 0.25 },
      { transform: 'translateY(0)', offset: 0.5 },
      { transform: 'translateY(-5px)', offset: 0.75 },
      { transform: 'translateY(0)', offset: 1 }
    ];

    element.animate(keyframes, {
      duration: this.animationDuration,
      easing: 'ease-out'
    });
  }

  private animatePulse(element: HTMLElement): void {
    const keyframes = [
      { transform: 'scale(1)', offset: 0 },
      { transform: 'scale(1.05)', offset: 0.5 },
      { transform: 'scale(1)', offset: 1 }
    ];

    element.animate(keyframes, {
      duration: this.animationDuration,
      easing: 'ease-in-out'
    });
  }

  private animateShake(element: HTMLElement): void {
    const keyframes = [
      { transform: 'translateX(0)', offset: 0 },
      { transform: 'translateX(-5px)', offset: 0.1 },
      { transform: 'translateX(5px)', offset: 0.2 },
      { transform: 'translateX(-5px)', offset: 0.3 },
      { transform: 'translateX(5px)', offset: 0.4 },
      { transform: 'translateX(-5px)', offset: 0.5 },
      { transform: 'translateX(5px)', offset: 0.6 },
      { transform: 'translateX(-5px)', offset: 0.7 },
      { transform: 'translateX(5px)', offset: 0.8 },
      { transform: 'translateX(-5px)', offset: 0.9 },
      { transform: 'translateX(0)', offset: 1 }
    ];

    element.animate(keyframes, {
      duration: this.animationDuration,
      easing: 'ease-out'
    });
  }

  // Public methods for manual control
  public animate(): void {
    this.triggerAnimation();
  }

  public reset(): void {
    this.hasAnimated = false;
    this.addInitialStyles(this.elementRef.nativeElement);
  }
}