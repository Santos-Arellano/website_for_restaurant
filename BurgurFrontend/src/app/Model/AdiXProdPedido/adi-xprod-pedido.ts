import { Adicional } from "../Adicional/adicional";

export class AdiXProdPedido {
    id!: number;
    idProdyAdiPedido: number;
    idAdcional: number;
    cantidad: number;
    precioUnitario: number;

    //Constructor sin Id
    constructor(idProdyAdiPedido: number, idAdcional: number, cantidad: number, precioUnitario: number) {
        this.idProdyAdiPedido = idProdyAdiPedido;
        this.idAdcional = idAdcional;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
    }
}
