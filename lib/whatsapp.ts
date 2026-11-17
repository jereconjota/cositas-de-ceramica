import type { Pieza } from "./types";
import { NOMBRE_TIA, WHATSAPP_NUMERO } from "./config";
import { formatearPrecio } from "./format";

export function mensajeConsulta(titulo: string, precio: number) {
  return `¡Hola ${NOMBRE_TIA}! Vi en tu página la pieza «${titulo}» (${formatearPrecio(precio).replace(" ", "\u00a0")}) y me interesa.`;
}

// Con número abre WhatsApp con el mensaje ya escrito; sin número, la página que lo simula.
export function enlaceConsulta(pieza: Pieza) {
  const texto = mensajeConsulta(pieza.titulo, pieza.precio);
  if (WHATSAPP_NUMERO) {
    return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
  }
  const params = new URLSearchParams({ pieza: pieza.titulo, precio: String(pieza.precio) });
  return `/whatsapp?${params}`;
}
