//burger-club/burgur/src/main/resources/static/js/Modules/navigation/header.js
// ==========================================
// BURGER CLUB - HEADER MODULE
// ==========================================

import { throttle } from '../../utils/helpers.js';

export class HeaderManager {
    constructor() {
        this.header = null;
        this.scrollPosition = 0;
        this.isScrolled = false;
        
        this.init();
    }
    
    init() {
        this.header = document.getElementById('header');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        if (!this.header) return;
        
        this.bindEvents();
        this.updateActiveNavLink();
        
        console.log('📱 Header Manager initialized');
    }
    
    bindEvents() {
        // Scroll effect
        window.addEventListener('scroll', throttle(() => {
            this.handleScroll();
        }, 10));
        
        // Nav links click handlers
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavClick(e, link);
            });
            
            // Add hover animations
            link.addEventListener('mouseenter', () => {
                link.classList.add('animate-pulse');
            });
            
            link.addEventListener('mouseleave', () => {
                link.classList.remove('animate-pulse');
            });
        });
    }
    
    handleScroll() {
        const scrollTop = window.pageYOffset;
        
        // Update header appearance
        if (scrollTop > 100 && !this.isScrolled) {
            this.header.classList.add('scrolled');
            this.isScrolled = true;
        } else if (scrollTop <= 100 && this.isScrolled) {
            this.header.classList.remove('scrolled');
            this.isScrolled = false;
        }
        
        // Update active nav link
        this.updateActiveNavLink();
        
        this.scrollPosition = scrollTop;
    }
    
    handleNavClick(e, link) {
        const href = link.getAttribute('href');
        
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target && window.BurgerClub?.smoothScrollTo) {
                window.BurgerClub.smoothScrollTo(target, 80);
            }
        }
    }
    
    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.clientHeight;
            
            if (this.scrollPosition >= sectionTop && 
                this.scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Public methods
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    highlightNav(sectionId) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }
}