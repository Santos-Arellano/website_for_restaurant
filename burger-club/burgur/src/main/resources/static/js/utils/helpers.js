// ==========================================
// BURGER CLUB - HELPER FUNCTIONS
// ==========================================

import { ANIMATION_DURATIONS, BREAKPOINTS } from './constants.js';

// ========== UTILITY FUNCTIONS ==========
export function throttle(func, wait) {
    let timeout;
    let previous = 0;
    
    return function executedFunction(...args) {
        const now = Date.now();
        const remaining = wait - (now - previous);
        
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(this, args);
        } else if (!timeout) {
            timeout = setTimeout(() => {
                previous = Date.now();
                timeout = null;
                func.apply(this, args);
            }, remaining);
        }
    };
}

export function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
}

// ========== FORMAT FUNCTIONS ==========
export function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(price);
}

export function formatDate(date) {
    return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

export function formatPhoneNumber(phone) {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
}

// ========== DEVICE DETECTION ==========
export function isMobile() {
    return window.innerWidth <= BREAKPOINTS.mobile;
}

export function isTablet() {
    return window.innerWidth > BREAKPOINTS.mobile && window.innerWidth <= BREAKPOINTS.tablet;
}

export function isDesktop() {
    return window.innerWidth > BREAKPOINTS.desktop;
}

export function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// ========== DOM UTILITIES ==========
export function createElement(tag, className = '', content = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.innerHTML = content;
    return element;
}

export function addClass(element, className) {
    if (element && className) {
        element.classList.add(className);
    }
}

export function removeClass(element, className) {
    if (element && className) {
        element.classList.remove(className);
    }
}

export function toggleClass(element, className) {
    if (element && className) {
        element.classList.toggle(className);
    }
}

export function hasClass(element, className) {
    return element && element.classList.contains(className);
}

// ========== ANIMATION UTILITIES ==========
export function fadeIn(element, duration = ANIMATION_DURATIONS.normal) {
    if (!element) return;
    
    element.style.opacity = '0';
    element.style.display = 'block';
    
    const fade = () => {
        let opacity = parseFloat(element.style.opacity);
        if ((opacity += 0.1) <= 1) {
            element.style.opacity = opacity;
            requestAnimationFrame(fade);
        }
    };
    
    requestAnimationFrame(fade);
}

export function fadeOut(element, duration = ANIMATION_DURATIONS.normal) {
    if (!element) return;
    
    const fade = () => {
        let opacity = parseFloat(element.style.opacity);
        if ((opacity -= 0.1) >= 0) {
            element.style.opacity = opacity;
            requestAnimationFrame(fade);
        } else {
            element.style.display = 'none';
        }
    };
    
    requestAnimationFrame(fade);
}

export function slideDown(element, duration = ANIMATION_DURATIONS.normal) {
    if (!element) return;
    
    element.style.height = '0';
    element.style.overflow = 'hidden';
    element.style.display = 'block';
    
    const targetHeight = element.scrollHeight + 'px';
    element.style.transition = `height ${duration}ms ease`;
    element.style.height = targetHeight;
    
    setTimeout(() => {
        element.style.height = 'auto';
        element.style.overflow = '';
        element.style.transition = '';
    }, duration);
}

export function slideUp(element, duration = ANIMATION_DURATIONS.normal) {
    if (!element) return;
    
    element.style.height = element.offsetHeight + 'px';
    element.style.overflow = 'hidden';
    element.style.transition = `height ${duration}ms ease`;
    
    requestAnimationFrame(() => {
        element.style.height = '0';
    });
    
    setTimeout(() => {
        element.style.display = 'none';
        element.style.height = '';
        element.style.overflow = '';
        element.style.transition = '';
    }, duration);
}

// ========== SCROLL UTILITIES ==========
export function smoothScrollTo(target, offset = 80) {
    if (!target) return;
    
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 800;
    let start = null;
    
    function animation(currentTime) {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    requestAnimationFrame(animation);
}

export function getScrollPosition() {
    return window.pageYOffset || document.documentElement.scrollTop;
}

export function isElementInViewport(element, threshold = 0) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    return (
        rect.top >= -threshold &&
        rect.left >= 0 &&
        rect.bottom <= windowHeight + threshold &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ========== STORAGE UTILITIES ==========
export function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.warn('Could not save to localStorage:', error);
        return false;
    }
}

export function loadFromLocalStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.warn('Could not load from localStorage:', error);
        return defaultValue;
    }
}

export function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.warn('Could not remove from localStorage:', error);
        return false;
    }
}

// ========== URL UTILITIES ==========
export function getUrlParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

export function updateUrlParameter(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.replaceState({}, '', url);
}

// ========== VALIDATION UTILITIES ==========
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function sanitizeString(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ========== RANDOM UTILITIES ==========
export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

export function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ========== PERFORMANCE UTILITIES ==========
export function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
    });
}

export function preloadImages(srcs) {
    return Promise.allSettled(srcs.map(preloadImage));
}

export function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ========== ERROR HANDLING ==========
export function handleError(error, context = '') {
    console.error(`Error ${context}:`, error);
    
    // Log to external service in production
    if (window.location.hostname !== 'localhost') {
        // Send to error tracking service
    }
}

export function createErrorHandler(context) {
    return (error) => handleError(error, context);
}