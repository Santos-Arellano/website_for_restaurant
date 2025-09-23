//burger-club/burgur/src/main/resources/static/js/Modules/menu/menu-enhancements.js
// ==========================================
// BURGER CLUB - MENU ENHANCEMENTS MODULE
// Solo efectos visuales - La lógica está en el servidor
// ==========================================

import { throttle } from '../../utils/helpers.js';

export class MenuEnhancements {
    constructor(notificationManager) {
        this.notificationManager = notificationManager;
        
        this.init();
    }
    
    init() {
        console.log('📋 Initializing menu visual enhancements...');
        
        // Enhanced animations for menu cards
        this.enhanceMenuCardAnimations();
        
        // Enhanced filter button interactions
        this.enhanceFilterButtons();
        
        // Enhanced search input interactions
        this.enhanceSearchInput();
        
        // Menu-specific scroll effects
        this.initializeMenuScrollEffects();
    }
    
    // ========== MENU CARD ANIMATIONS ==========
    enhanceMenuCardAnimations() {
        const menuCards = document.querySelectorAll('.menu-card');
        
        menuCards.forEach((card, index) => {
            // Initial animation
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
            
            // Enhanced hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-12px) scale(1.02)';
                card.style.zIndex = '10';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.zIndex = '1';
            });
            
            // Click ripple effect
            card.addEventListener('click', (e) => {
                this.createRippleEffect(e, card);
            });
        });
    }
    
    // ========== FILTER BUTTON ENHANCEMENTS ==========
    enhanceFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach((button, index) => {
            // Initial animation
            button.style.opacity = '0';
            button.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                button.style.transition = 'all 0.4s ease';
                button.style.opacity = '1';
                button.style.transform = 'translateY(0)';
            }, index * 100);
            
            // Enhanced click effect
            button.addEventListener('click', () => {
                // Visual feedback before navigation
                button.style.transform = 'translateY(2px)';
                setTimeout(() => {
                    button.style.transform = 'translateY(0)';
                }, 150);
                
                // Show loading notification
                this.notificationManager.show('Filtrando productos...', 'info', 1000);
            });
            
            // Enhanced hover effect
            button.addEventListener('mouseenter', () => {
                if (!button.classList.contains('active')) {
                    button.style.transform = 'translateY(-3px)';
                }
            });
            
            button.addEventListener('mouseleave', () => {
                if (!button.classList.contains('active')) {
                    button.style.transform = 'translateY(0)';
                }
            });
        });
    }
    
    // ========== SEARCH INPUT ENHANCEMENTS ==========
    enhanceSearchInput() {
        const searchInput = document.querySelector('.menu-search-input');
        const searchIcon = document.querySelector('.search-icon');
        const searchClear = document.querySelector('.search-clear');
        
        if (!searchInput) return;
        
        // Animate search icon on focus
        searchInput.addEventListener('focus', () => {
            if (searchIcon) {
                searchIcon.style.transform = 'scale(1.2)';
                searchIcon.style.color = 'var(--color-cta-stroke)';
            }
            
            // Add focus glow effect
            searchInput.style.boxShadow = '0 0 0 3px rgba(251, 181, 181, 0.3)';
        });
        
        searchInput.addEventListener('blur', () => {
            if (searchIcon) {
                searchIcon.style.transform = 'scale(1)';
                searchIcon.style.color = 'var(--color-text-secondary)';
            }
            
            searchInput.style.boxShadow = 'none';
        });
        
        // Typing indicator
        let typingTimeout;
        searchInput.addEventListener('input', () => {
            searchInput.style.borderColor = 'var(--color-warning)';
            
            // Animate search icon while typing
            if (searchIcon) {
                searchIcon.style.color = 'var(--color-warning)';
            }
            
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                searchInput.style.borderColor = 'var(--color-cta-stroke)';
                if (searchIcon) {
                    searchIcon.style.color = 'var(--color-cta-stroke)';
                }
            }, 1000);
        });
        
        // Enhanced clear button animation
        if (searchClear) {
            searchClear.addEventListener('mouseenter', () => {
                searchClear.style.transform = 'scale(1.2) rotate(90deg)';
            });
            
            searchClear.addEventListener('mouseleave', () => {
                searchClear.style.transform = 'scale(1) rotate(0deg)';
            });
        }
    }
    
    // ========== MENU SCROLL EFFECTS ==========
    initializeMenuScrollEffects() {
        const menuHeader = document.querySelector('.menu-header');
        const menuFilters = document.querySelector('.menu-filters');
        const menuGrid = document.querySelector('.menu-grid');
        
        if (!menuHeader || !menuFilters) return;
        
        window.addEventListener('scroll', throttle(() => {
            const scrolled = window.pageYOffset;
            
            // Parallax effect for menu header
            if (scrolled < window.innerHeight) {
                menuHeader.style.transform = `translateY(${scrolled * 0.3}px)`;
                menuHeader.style.opacity = Math.max(1 - scrolled / 300, 0.5);
            }
            
            // Sticky filters with enhanced effects
            const filtersRect = menuFilters.getBoundingClientRect();
            if (filtersRect.top <= 100) {
                menuFilters.style.background = 'rgba(0, 0, 0, 0.9)';
                menuFilters.style.backdropFilter = 'blur(15px)';
                menuFilters.style.padding = '15px 0';
                menuFilters.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
                menuFilters.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
            } else {
                menuFilters.style.background = 'transparent';
                menuFilters.style.backdropFilter = 'none';
                menuFilters.style.padding = '0';
                menuFilters.style.borderBottom = 'none';
                menuFilters.style.boxShadow = 'none';
            }
            
            // Stagger animation for visible cards on scroll
            if (menuGrid) {
                this.animateVisibleCards();
            }
        }, 10), { passive: true });
    }
    
    // ========== VISIBLE CARDS ANIMATION ==========
    animateVisibleCards() {
        const cards = document.querySelectorAll('.menu-card');
        const viewportHeight = window.innerHeight;
        
        cards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            const isVisible = rect.top < viewportHeight && rect.bottom > 0;
            
            if (isVisible && !card.classList.contains('scroll-animated')) {
                card.classList.add('scroll-animated');
                
                // Add subtle entrance animation
                setTimeout(() => {
                    card.style.transform = 'translateY(0) scale(1)';
                    card.style.opacity = '1';
                }, index * 50);
            }
        });
    }
    
    // ========== RIPPLE EFFECT ==========
    createRippleEffect(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
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
            pointer-events: none;
            z-index: 1000;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
        
        // Add CSS for ripple animation if not exists
        this.addRippleStyles();
    }
    
    // ========== UTILITY METHODS ==========
    addRippleStyles() {
        if (document.getElementById('ripple-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
            
            .scroll-animated {
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }
        `;
        document.head.appendChild(style);
    }
}