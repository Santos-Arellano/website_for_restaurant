export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imgURL: string;
  categoria: string;
  disponible: boolean;
  ingredientes?: string[];
  descuento?: number;
  esNuevo?: boolean;
  esPopular?: boolean;
  valoracion?: number;
  tiempoPreparacion?: number;
  calorias?: number;
  tags?: string[];
}

export interface ProductCategory {
  id: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  orden?: number;
}

export interface ProductFilter {
  categoria?: string;
  precioMin?: number;
  precioMax?: number;
  disponible?: boolean;
  esNuevo?: boolean;
  esPopular?: boolean;
  busqueda?: string;
}