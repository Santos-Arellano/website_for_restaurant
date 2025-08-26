//burger-club/burgur/src/main/resources/static/js/utils/constants.js
// ==========================================
// BURGER CLUB - CONSTANTS
// ==========================================

export const APP_CONFIG = {
    name: 'Burger Club',
    version: '1.0.0',
    author: 'Burger Club Team'
};

export const ANIMATION_DURATIONS = {
    fast: 150,
    normal: 300,
    slow: 600,
    loader: 1500
};

export const BREAKPOINTS = {
    mobile: 480,
    tablet: 768,
    desktop: 992,
    large: 1200,
    extraLarge: 1400
};

export const Z_INDEX = {
    header: 1000,
    modal: 2000,
    loader: 9999
};

export const PROMO_IMAGES = [
    'images/Promo1.png',
    'images/Promo2.png',
    'images/Promo3.png',
    'images/Promo4.png'
];

export const CRITICAL_IMAGES = [
    'images/burger.png',
    'images/Logo.png',
    'images/OurPlace.png',
    ...PROMO_IMAGES
];

export const NOTIFICATION_TYPES = {
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    info: 'info'
};

export const CART_CONFIG = {
    storageKey: 'burgerclub_cart',
    maxItems: 10,
    autoCloseTimeout: 4000
};

export const MENU_CONFIG = {
    itemsPerPage: 8,
    searchDebounceDelay: 300,
    filterTransitionDelay: 200
};

export const CONTACT_INFO = {
    phone: '+57 123 456 7890',
    email: 'info@burgerclub.com',
    address: 'Carrera 13 #85-32, Bogotá, Colombia',
    hours: 'Lun - Dom: 11:00 AM - 11:00 PM',
    whatsapp: '571234567890',
    deliveryTime: '25-35 minutos'
};

export const SOCIAL_LINKS = {
    facebook: '#',
    instagram: '#',
    twitter: '#',
    whatsapp: `https://wa.me/${CONTACT_INFO.whatsapp}`
};

export const API_ENDPOINTS = {
    menu: '/api/menu',
    orders: '/api/orders',
    contact: '/api/contact'
};

export const ERROR_MESSAGES = {
    networkError: 'Error de conexión. Por favor intenta de nuevo.',
    cartEmpty: 'Tu carrito está vacío',
    itemNotFound: 'Producto no encontrado',
    formInvalid: 'Por favor completa todos los campos requeridos',
    orderFailed: 'Error al procesar el pedido. Intenta de nuevo.'
};

export const SUCCESS_MESSAGES = {
    itemAdded: 'agregado al carrito 🍔',
    itemRemoved: 'eliminado del carrito',
    cartCleared: 'Carrito limpiado',
    orderPlaced: 'Pedido confirmado',
    formSubmitted: 'Formulario enviado correctamente'
};