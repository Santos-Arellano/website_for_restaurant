import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConstantsService {

  readonly APP_CONFIG = {
    name: 'Burger Club',
    version: '1.0.0',
    author: 'Burger Club Team'
  };

  readonly ANIMATION_DURATIONS = {
    fast: 150,
    normal: 300,
    slow: 600,
    loader: 1500
  };

  readonly BREAKPOINTS = {
    mobile: 480,
    tablet: 768,
    desktop: 992,
    large: 1200,
    extraLarge: 1400
  };

  readonly Z_INDEX = {
    header: 1000,
    modal: 2000,
    loader: 9999
  };

  readonly PROMO_IMAGES = [
    'assets/images/menu/BURGER.png',
    'assets/images/menu/BBQ-especial.png',
    'assets/images/menu/Hot-Dog-Supreme.png',
    'assets/images/menu/Chocolate-milkshake.png'
  ];

  readonly PROMO_PRODUCTS = [
    { name: 'Hamburguesa Classic', searchTerm: 'Hamburguesa Classic' },
    { name: 'BBQ Deluxe', searchTerm: 'Hamburguesa BBQ Deluxe' },
    { name: 'Perro Supremo', searchTerm: 'Perro Caliente Supremo' },
    { name: 'Malteada Chocolate', searchTerm: 'Malteada de Chocolate' }
  ];

  readonly CRITICAL_IMAGES = [
    'assets/images/Burger.png',
    'assets/images/Logo.png',
    'assets/images/OurPlace.png',
    ...this.PROMO_IMAGES
  ];

  readonly NOTIFICATION_TYPES = {
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    info: 'info'
  };

  readonly CART_CONFIG = {
    storageKey: 'burgerclub_cart',
    maxItems: 10,
    autoCloseTimeout: 4000
  };

  readonly MENU_CONFIG = {
    itemsPerPage: 8,
    searchDebounceDelay: 300,
    filterTransitionDelay: 200
  };

  readonly CONTACT_INFO = {
    phone: '+57 123 456 7890',
    email: 'info@burgerclub.com',
    address: 'Carrera 13 #85-32, Bogotá, Colombia',
    hours: 'Lun - Dom: 11:00 AM - 11:00 PM',
    whatsapp: '571234567890',
    deliveryTime: '25-35 minutos'
  };

  readonly SOCIAL_LINKS = {
    facebook: '#',
    instagram: '#',
    twitter: '#',
    whatsapp: `https://wa.me/${this.CONTACT_INFO.whatsapp}`
  };

  readonly ERROR_MESSAGES = {
    networkError: 'Error de conexión. Por favor intenta de nuevo.',
    cartEmpty: 'Tu carrito está vacío',
    itemNotFound: 'Producto no encontrado',
    formInvalid: 'Por favor completa todos los campos requeridos',
    orderFailed: 'Error al procesar el pedido. Intenta de nuevo.'
  };

  readonly SUCCESS_MESSAGES = {
    itemAdded: 'agregado al carrito',
    itemRemoved: 'eliminado del carrito',
    cartCleared: 'Carrito limpiado',
    orderPlaced: 'Pedido confirmado',
    formSubmitted: 'Formulario enviado correctamente'
  };

  constructor() { }
}