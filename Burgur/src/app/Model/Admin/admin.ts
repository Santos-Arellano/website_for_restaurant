export class Admin {
    id!: number;
    usuario: string;
    contrasena: string
    
    // Constructor con Paráemetros sin id
    constructor(usuario: string, contrasena: string) {
        this.usuario = usuario;
        this.contrasena = contrasena;
    }
}
