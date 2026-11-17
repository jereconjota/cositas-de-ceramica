import "server-only";
import type { Datos, Pieza, Tienda } from "./types";
import { leerJSON, guardarJSON } from "./storage";
import { HISTORIAL_MAXIMO } from "./config";

const ruta = (tienda: Tienda) => `${tienda}/piezas.json`;

// Piezas con las que arranca la página de Norma, antes de que ella cargue nada.
const INICIALES: [string, number, string][] = [
  ["Cocinita", 10000, "/piezas/cocinita.jpg"],
  ["Niña jardinera", 10000, "/piezas/nena-jardinera.jpg"],
];

function armarPiezas(lista: [string, number, string][], prefijo: string, ahora: string): Pieza[] {
  return lista.map(([titulo, precio, foto], i) => ({
    id: `${prefijo}-${i}`,
    titulo,
    precio,
    foto,
    vendida: false,
    creada: ahora,
  }));
}

function inicial(): Datos {
  const ahora = new Date().toISOString();
  return { piezas: armarPiezas(INICIALES, "inicial", ahora), historial: [], actualizado: ahora };
}

export async function leerTienda(tienda: Tienda): Promise<Datos> {
  return (await leerJSON<Datos>(ruta(tienda))) ?? inicial();
}

export async function modificarTienda(
  tienda: Tienda,
  cambio: (piezas: Pieza[]) => { piezas: Pieza[]; texto: string },
) {
  const datos = await leerTienda(tienda);
  const { piezas, texto } = cambio(datos.piezas);
  const ahora = new Date().toISOString();
  const nuevos: Datos = {
    piezas,
    historial: [{ fecha: ahora, texto }, ...datos.historial].slice(0, HISTORIAL_MAXIMO),
    actualizado: ahora,
  };
  await guardarJSON(ruta(tienda), nuevos);
  return nuevos;
}
