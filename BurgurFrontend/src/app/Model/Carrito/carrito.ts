import { Pedido } from "../Pedido/pedido";

export class Carrito {
    id!: number;
    pedido:Pedido;
    // Constructor con Parámetros sin id
    constructor(pedido: Pedido) {
        this.pedido = pedido;
    }
}
