import { Operador } from '../Operador/operador';
import { Pedido } from '../Pedido/pedido';
export class Domiciliario {
    id!: number;
    nombre: string
    cedula: string
    disponible: boolean;
    operador:Operador;
    pedidos: Pedido[] = [];

    // Constructor con Parámetros sin id
    constructor(nombre: string, cedula: string, disponible: boolean, pedidos: Pedido[], operador: Operador) {
        this.nombre = nombre;
        this.cedula = cedula;
        this.disponible = disponible;
        this.pedidos = pedidos;
        this.operador = operador;
    }
}
