import { Operador } from '../Operador/operador';
import { Pedido } from '../Pedido/pedido';

export class Domiciliario {
    id!: number;
    nombre: string;
    cedula?: string;
    telefono: string;
    vehiculo: string;
    placa: string;
    activo: boolean;
    disponible: boolean;
    fechaIngreso: Date;
    pedidosEntregados: number;
    operador?: Operador;
    pedidos: Pedido[] = [];

    // Constructor con Parámetros sin id
    constructor(
        nombre: string, 
        telefono: string, 
        vehiculo: string, 
        placa: string, 
        activo: boolean = true, 
        disponible: boolean = true,
        fechaIngreso: Date = new Date(),
        pedidosEntregados: number = 0,
        cedula?: string, 
        pedidos: Pedido[] = [], 
        operador?: Operador
    ) {
        this.nombre = nombre;
        this.telefono = telefono;
        this.vehiculo = vehiculo;
        this.placa = placa;
        this.activo = activo;
        this.disponible = disponible;
        this.fechaIngreso = fechaIngreso;
        this.pedidosEntregados = pedidosEntregados;
        this.cedula = cedula;
        this.pedidos = pedidos;
        this.operador = operador;
    }
}
