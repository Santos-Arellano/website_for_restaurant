///Users/santosa/Documents/GitHub/website_for_restaurant/burger-club/burgur/src/main/resources/static/js/utils/helpers.js
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

// ========== IMAGE UTILITIES ==========
export function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

export function preloadImages(srcs) {
    return Promise.allSettled(srcs.map(preloadImage));
}