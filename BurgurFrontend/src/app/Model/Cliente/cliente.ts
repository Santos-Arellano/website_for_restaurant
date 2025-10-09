export interface Cliente {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    contrasena?: string; // Opcional para no exponer en frontend
    telefono: string;
    direccion: string;
    fechaRegistro: Date;
    activo: boolean;
    pedidos?: number[]; // Solo IDs de pedidos
}

export interface ClienteRegistro {
    nombre: string;
    apellido: string;
    correo: string;
    contrasena: string;
    confirmPassword?: string;
    telefono: string;
    direccion: string;
}

export interface ClienteLogin {
    correo: string;
    contrasena: string;
}
