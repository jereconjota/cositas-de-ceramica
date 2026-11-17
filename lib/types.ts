export type Tienda = "real";

export type Pieza = {
  id: string;
  titulo: string;
  precio: number;
  foto: string;
  vendida: boolean;
  creada: string;
};

export type Movimiento = {
  fecha: string;
  texto: string;
};

export type Datos = {
  piezas: Pieza[];
  historial: Movimiento[];
  actualizado: string;
};
