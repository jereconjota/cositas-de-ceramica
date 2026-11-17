// Todo lo que se puede personalizar está acá.
export const NOMBRE_TIENDA = "Cositas de Cerámica";
export const NOMBRE_TIA = "Norma";

// Número de WhatsApp de Norma, con código de país y sin "+" (ej: 5491112345678).
// Si no está, el botón "Escribile" abre una página que simula WhatsApp.
export const WHATSAPP_NUMERO = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO?.replace(/\D/g, "") ?? "";

// Cuántos movimientos se guardan en el historial.
export const HISTORIAL_MAXIMO = 100;
