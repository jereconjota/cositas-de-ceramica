import "server-only";
import type { Datos, Pieza, Tienda } from "./types";
import { leerJSON, guardarJSON } from "./storage";
import { DEMO_REINICIO_MINUTOS, HISTORIAL_MAXIMO } from "./config";

const ruta = (tienda: Tienda) => `${tienda}/piezas.json`;

const vacia = (): Datos => ({ piezas: [], historial: [], actualizado: new Date().toISOString() });

function ejemplo(): Datos {
  const ahora = new Date().toISOString();
  const piezas: [string, number, string][] = [
    ["Taza celeste con asa grande", 12000, "taza"],
    ["Bowl rosado para el desayuno", 9500, "bowl"],
    ["Florero alto verde agua", 21000, "florero"],
    ["Plato playo con flores", 14000, "plato"],
    ["Jarrita amarilla", 8500, "jarra"],
    ["Maceta lila con platito", 16500, "maceta"],
  ];
  return {
    piezas: piezas.map(([titulo, precio, foto], i) => ({
      id: `ejemplo-${i}`,
      titulo,
      precio,
      foto: `/demo/${foto}.svg`,
      vendida: false,
      creada: ahora,
    })),
    historial: [{ fecha: ahora, texto: "Se cargó la tienda de prueba" }],
    actualizado: ahora,
  };
}

export async function leerTienda(tienda: Tienda): Promise<Datos> {
  const datos = await leerJSON<Datos>(ruta(tienda));
  if (tienda === "demo") {
    const vieja =
      !datos ||
      Date.now() - new Date(datos.actualizado).getTime() > DEMO_REINICIO_MINUTOS * 60_000;
    if (vieja) {
      const nueva = ejemplo();
      await guardarJSON(ruta(tienda), nueva);
      return nueva;
    }
  }
  return datos ?? vacia();
}

export async function reiniciarDemo() {
  await guardarJSON(ruta("demo"), ejemplo());
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
