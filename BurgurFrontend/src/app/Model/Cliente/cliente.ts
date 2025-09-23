import { Pedido } from "../Pedido/pedido";

export class Cliente {
    id!: number;
    nombre: string
    apellido: string;
    correo: string;
    contrasena: string;
    telefono: string
    direccion: string;
    pedidos: Pedido[] = [];

    // Constructor con Parámetros sin id
    constructor(nombre: string, apellido: string, correo: string, contrasena: string, telefono: string, direccion: string, pedidos: Pedido[]){
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
        this.contrasena = contrasena;
        this.telefono = telefono;
        this.direccion = direccion;
        this.pedidos = pedidos;
    }
}
