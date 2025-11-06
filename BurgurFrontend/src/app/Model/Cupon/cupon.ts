export interface Cupon {
  id: number;
  codigo: string;
  tipo: 'PERCENT' | 'FLAT' | 'FREE_SHIPPING' | string;
  valor: number | null;
  descripcion?: string;
  activo: boolean;
}

export type CuponCreate = Omit<Cupon, 'id'>;
export type CuponUpdate = Partial<Omit<Cupon, 'id'>>;