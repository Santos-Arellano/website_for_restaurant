import { Cliente } from "../Cliente/cliente";
import { Domiciliario } from "../Domiciliario/domiciliario";
import { Operador } from "../Operador/operador";
import { ProdyAdiPedido } from "../ProdyAdiPedido/prody-adi-pedido";

export class Producto {
    id!: number;
    fechaCreacion!: Date;
    fechaEntrega!: Date;
    estado: string;
    precioTotal: number;
    cliente:Cliente;
    operador:Operador;
    domiciliario!: Domiciliario;
    prodyAdiPedido: ProdyAdiPedido[] = [];

    constructor(fechaCreacion: Date, fechaEntrega: Date, estado: string, precioTotal: number, cliente: Cliente, operador: Operador, domiciliario: Domiciliario, prodyAdiPedido: ProdyAdiPedido[]) {
        this.fechaCreacion = fechaCreacion;
        this.fechaEntrega = fechaEntrega;
        this.estado = estado;
        this.precioTotal = precioTotal;
        this.cliente = cliente;
        this.operador = operador;
        this.domiciliario = domiciliario;
        this.prodyAdiPedido = prodyAdiPedido;
    }
}
