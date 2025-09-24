export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: CategoriaProducto;
    imagen: string;
    disponible: boolean;
    fechaCreacion: Date;
    ingredientes?: string[];
    isNew?: boolean;
    isPopular?: boolean;
    adicionales?: Adicional[];
}

export interface Adicional {
    id: number;
    nombre: string;
    precio: number;
    disponible: boolean;
}

export enum CategoriaProducto {
    HAMBURGUESAS = 'HAMBURGUESAS',
    BEBIDAS = 'BEBIDAS',
    ACOMPAÑAMIENTOS = 'ACOMPAÑAMIENTOS',
    POSTRES = 'POSTRES',
    COMBOS = 'COMBOS'
}
