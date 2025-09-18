import { Producto } from "../Producto/producto";
import { Pedido } from "../Pedido/pedido";
export class ProdyAdiPedido {
    id!: number;
    cantidad: number;
    precioUnitario: number;
    producto: Producto;
    pedido:Pedido;
    // Ó
    // idProducto: number;
    // idPedido: number;

    constructor(cantidad: number, precioUnitario: number, producto: Producto, pedido: Pedido) {
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.producto = producto;
        this.pedido = pedido;
    }
    
}
