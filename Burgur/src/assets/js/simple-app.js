// Simple JavaScript for Burger Club Landing Page
document.addEventListener('DOMContentLoaded', function() {
    
    // Loading Screen
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 2000);
    }
    
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.add('active');
        });
    }
    
    if (mobileMenuClose && mobileMenu) {
        mobileMenuClose.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    }
    
    // Hero Carousel
    let currentSlide = 0;
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.hero-indicators .indicator');
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }
    
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    
    // Auto-play carousel
    setInterval(nextSlide, 5000);
    
    // Testimonials Carousel
    let currentTestimonial = 0;
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const testimonialIndicators = document.querySelectorAll('.testimonials-indicators .indicator');
    const prevTestimonialBtn = document.getElementById('prevTestimonial');
    const nextTestimonialBtn = document.getElementById('nextTestimonial');
    
    function showTestimonial(index) {
        testimonialCards.forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });
        testimonialIndicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
    }
    
    function nextTestimonial() {
        currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
        showTestimonial(currentTestimonial);
    }
    
    function prevTestimonialFunc() {
        currentTestimonial = (currentTestimonial - 1 + testimonialCards.length) % testimonialCards.length;
        showTestimonial(currentTestimonial);
    }
    
    if (nextTestimonialBtn) nextTestimonialBtn.addEventListener('click', nextTestimonial);
    if (prevTestimonialBtn) prevTestimonialBtn.addEventListener('click', prevTestimonialFunc);
    
    // Auto-play testimonials
    setInterval(nextTestimonial, 6000);
    
    // Cart Modal
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = document.getElementById('cartModal');
    const cartClose = document.getElementById('cartClose');
    
    if (cartBtn && cartModal) {
        cartBtn.addEventListener('click', () => {
            cartModal.style.display = 'flex';
        });
    }
    
    if (cartClose && cartModal) {
        cartClose.addEventListener('click', () => {
            cartModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.style.display = 'none';
            }
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Counter animations
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }
    
    // Intersection Observer for counters
    const counters = document.querySelectorAll('.stat-number[data-count]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
    
    // Header scroll effect
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    console.log('Burger Club Landing Page Loaded Successfully!');
});