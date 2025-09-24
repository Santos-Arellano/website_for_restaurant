export interface Pedido {
    id: number;
    fechaCreacion: Date;
    fechaEntrega?: Date;
    estado: EstadoPedido;
    precioTotal: number;
    clienteId: number;
    operadorId?: number;
    domiciliarioId?: number;
    productos: ProductoPedido[];
    direccionEntrega: string;
    metodoPago: MetodoPago;
    observaciones?: string;
}

export interface ProductoPedido {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    adicionales?: AdicionalPedido[];
    observaciones?: string;
}

export interface AdicionalPedido {
    adicionalId: number;
    cantidad: number;
    precioUnitario: number;
}

export enum EstadoPedido {
    PENDIENTE = 'PENDIENTE',
    CONFIRMADO = 'CONFIRMADO',
    EN_PREPARACION = 'EN_PREPARACION',
    LISTO = 'LISTO',
    EN_CAMINO = 'EN_CAMINO',
    ENTREGADO = 'ENTREGADO',
    CANCELADO = 'CANCELADO'
}

export enum MetodoPago {
    EFECTIVO = 'EFECTIVO',
    TARJETA = 'TARJETA',
    TRANSFERENCIA = 'TRANSFERENCIA'
}
