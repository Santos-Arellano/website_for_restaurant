// ==========================================
// BURGER CLUB - MOBILE MENU MODULE
// ==========================================

import { ANIMATION_DURATIONS } from '../../utils/constants.js';

export class MobileMenuManager {
    constructor() {
        this.mobileToggle = null;
        this.mobileMenu = null;
        this.mobileOverlay = null;
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        this.mobileToggle = document.getElementById('mobileNavToggle');
        this.mobileMenu = document.getElementById('mobileMenu');
        this.mobileOverlay = document.getElementById('mobileMenuOverlay');
        this.mobileLinks = document.querySelectorAll('.mobile-nav-link');
        
        if (!this.mobileToggle || !this.mobileMenu || !this.mobileOverlay) return;
        
        this.bindEvents();
        
        console.log('📱 Mobile Menu Manager initialized');
    }
    
    bindEvents() {
        // Toggle mobile menu
        this.mobileToggle.addEventListener('click', () => {
            this.toggle();
        });
        
        // Close on overlay click
        this.mobileOverlay.addEventListener('click', () => {
            this.close();
        });
        
        // Mobile nav links
        this.mobileLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleMobileLinkClick(e, link);
            });
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // Close on window resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992 && this.isOpen) {
                this.close();
            }
        });
    }
    
    handleMobileLinkClick(e, link) {
        const href = link.getAttribute('href');
        
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                this.close();
                setTimeout(() => {
                    if (window.BurgerClub?.smoothScrollTo) {
                        window.BurgerClub.smoothScrollTo(target, 80);
                    }
                }, ANIMATION_DURATIONS.normal);
            }
        } else if (href !== '#') {
            // Regular link, just close menu
            this.close();
        } else {
            // Handle special mobile links
            e.preventDefault();
            this.handleSpecialLink(link);
        }
    }
    
    handleSpecialLink(link) {
        this.close();
        
        setTimeout(() => {
            if (link.id === 'mobileCartLink') {
                if (window.BurgerClub?.cart) {
                    window.BurgerClub.cart.openCart();
                }
            } else if (link.id === 'mobileLocationLink') {
                if (window.BurgerClub?.app) {
                    window.BurgerClub.app.showLocationModal();
                }
            }
        }, ANIMATION_DURATIONS.normal);
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        if (this.isOpen) return;
        
        this.mobileMenu.classList.add('active');
        this.mobileOverlay.classList.add('active');
        this.mobileToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        this.isOpen = true;
        
        // Animate menu items
        this.animateMenuItems();
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.mobileMenu.classList.remove('active');
        this.mobileOverlay.classList.remove('active');
        this.mobileToggle.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        this.isOpen = false;
        
        // Reset animations
        this.resetMenuAnimations();
    }
    
    animateMenuItems() {
        const menuItems = this.mobileMenu.querySelectorAll('.mobile-nav-link');
        menuItems.forEach((item, index) => {
            item.style.animation = `fadeInLeft 0.3s ease ${index * 0.1}s forwards`;
        });
    }
    
    resetMenuAnimations() {
        const menuItems = this.mobileMenu.querySelectorAll('.mobile-nav-link');
        menuItems.forEach(item => {
            item.style.animation = '';
        });
    }
    
    // Public methods
    isMenuOpen() {
        return this.isOpen;
    }
    
    forceClose() {
        this.close();
    }
}