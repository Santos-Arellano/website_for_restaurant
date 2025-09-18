import { Adicional } from "../Adicional/adicional";

export class Producto {
    id!: number;          
    nombre!: string;
    descripcion!: string;
    precio!: number;
    categoria!: string;
    imgURL!: string;
    stock!: number;     
    nuevo!: boolean;
    popular!: boolean;
    activo!: boolean;
    // Ingredientes del Producto
    ingredientes: string[] = [];
    // Adicionales de cada Producto
    //? pq puede que no tenga adicionales
    adicionalesPermitidos?: Adicional[];

    // Constructor con Paráemetros sin id
    constructor(nombre: string, descripcion: string, precio: number, categoria: string, imgURL: string, stock: number, nuevo: boolean, popular: boolean, activo: boolean, ingredientes?: string[]) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.categoria = categoria;
        this.imgURL = imgURL;
        this.stock = stock;
        this.nuevo = nuevo;
        this.popular = popular;
        this.activo = activo;
        // Si no se pasan ingredientes, inicializar con array vacío
        this.ingredientes = ingredientes ?? [];
    }
}