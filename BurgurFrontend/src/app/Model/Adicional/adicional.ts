export class Adicional {
    id!: number;
    nombre!: string
    precio!: number;
    activo!: boolean;
    //Categorias
    categorias: string[] = [];
    

    // Constructor con Paráemetros sin id
    constructor(nombre: string, precio: number, activo: boolean, categorias: string[]) {
        this.nombre = nombre;
        this.precio = precio;
        this.activo = activo;
        this.categorias = categorias;
    }

}
