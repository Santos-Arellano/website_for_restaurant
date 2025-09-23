// ==========================================
// BURGER CLUB - ANGULAR CONSTANTS
// ==========================================

export interface AppConfig {
  name: string;
  version: string;
  author: string;
}

export interface AnimationDurations {
  fast: number;
  normal: number;
  slow: number;
  loader: number;
}

export interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  large: number;
  extraLarge: number;
}

export interface ZIndex {
  header: number;
  modal: number;
  loader: number;
}

export interface PromoProduct {
  name: string;
  searchTerm: string;
}

export interface NotificationTypes {
  success: string;
  warning: string;
  danger: string;
  info: string;
}

export interface CartConfig {
  storageKey: string;
  maxItems: number;
  autoCloseTimeout: number;
}

export interface MenuConfig {
  itemsPerPage: number;
  searchDebounceDelay: number;
  filterTransitionDelay: number;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  hours: string;
  whatsapp: string;
  deliveryTime: string;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  whatsapp: string;
}

export interface ErrorMessages {
  networkError: string;
  cartEmpty: string;
  itemNotFound: string;
  formInvalid: string;
  orderFailed: string;
}

export interface SuccessMessages {
  itemAdded: string;
  itemRemoved: string;
  cartCleared: string;
  orderPlaced: string;
  formSubmitted: string;
}

export const APP_CONFIG: AppConfig = {
  name: 'Burger Club',
  version: '1.0.0',
  author: 'Burger Club Team'
};

export const ANIMATION_DURATIONS: AnimationDurations = {
  fast: 150,
  normal: 300,
  slow: 600,
  loader: 1500
};

export const BREAKPOINTS: Breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 992,
  large: 1200,
  extraLarge: 1400
};

export const Z_INDEX: ZIndex = {
  header: 1000,
  modal: 2000,
  loader: 9999
};

export const PROMO_IMAGES: string[] = [
  'assets/images/menu/BURGER.png',
  'assets/images/menu/BBQ-especial.png',
  'assets/images/menu/Hot-Dog-Supreme.png',
  'assets/images/menu/Chocolate-milkshake.png'
];

export const PROMO_PRODUCTS: PromoProduct[] = [
  { name: 'Hamburguesa Classic', searchTerm: 'Hamburguesa Classic' },
  { name: 'BBQ Deluxe', searchTerm: 'Hamburguesa BBQ Deluxe' },
  { name: 'Perro Supremo', searchTerm: 'Perro Caliente Supremo' },
  { name: 'Malteada Chocolate', searchTerm: 'Malteada de Chocolate' }
];

export const CRITICAL_IMAGES: string[] = [
  'assets/images/Burger.png',
  'assets/images/Logo.png',
  'assets/images/OurPlace.png',
  ...PROMO_IMAGES
];

export const NOTIFICATION_TYPES: NotificationTypes = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info'
};

export const CART_CONFIG: CartConfig = {
  storageKey: 'burgerclub_cart',
  maxItems: 10,
  autoCloseTimeout: 4000
};

export const MENU_CONFIG: MenuConfig = {
  itemsPerPage: 8,
  searchDebounceDelay: 300,
  filterTransitionDelay: 200
};

export const CONTACT_INFO: ContactInfo = {
  phone: '+57 123 456 7890',
  email: 'info@burgerclub.com',
  address: 'Carrera 13 #85-32, Bogotá, Colombia',
  hours: 'Lun - Dom: 11:00 AM - 11:00 PM',
  whatsapp: '571234567890',
  deliveryTime: '25-35 minutos'
};

export const SOCIAL_LINKS: SocialLinks = {
  facebook: '#',
  instagram: '#',
  twitter: '#',
  whatsapp: `https://wa.me/${CONTACT_INFO.whatsapp}`
};

export const ERROR_MESSAGES: ErrorMessages = {
  networkError: 'Error de conexión. Por favor intenta de nuevo.',
  cartEmpty: 'Tu carrito está vacío',
  itemNotFound: 'Producto no encontrado',
  formInvalid: 'Por favor completa todos los campos requeridos',
  orderFailed: 'Error al procesar el pedido. Intenta de nuevo.'
};

export const SUCCESS_MESSAGES: SuccessMessages = {
  itemAdded: 'agregado al carrito',
  itemRemoved: 'eliminado del carrito',
  cartCleared: 'Carrito limpiado',
  orderPlaced: 'Pedido confirmado',
  formSubmitted: 'Formulario enviado correctamente'
};