import { Domiciliario } from "../Domiciliario/domiciliario";
import { Pedido } from "../Pedido/pedido";
export class Operador {
    id!: number;
    nombre: string
    cedula: string;
    disponible: boolean;
    domiciliarios: Domiciliario[] = [];
    pedidos: Pedido[] = [];

    // Constructor con Parámetros sin id
    constructor(nombre: string, cedula: string, disponible: boolean, domiciliarios: Domiciliario[], pedidos: Pedido[]) {
        this.nombre = nombre;
        this.cedula = cedula;
        this.disponible = disponible;
        this.domiciliarios = domiciliarios;
        this.pedidos = pedidos;
    }
}
