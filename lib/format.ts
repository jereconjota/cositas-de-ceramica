const pesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatearPrecio(precio: number) {
  return pesos.format(precio).replace(/ /g, " ");
}

export function formatearFecha(iso: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(iso));
}

// "14.000", "$14000", "14 mil" -> 14000
export function leerPrecio(texto: string): number | null {
  const limpio = texto.toLowerCase().trim();
  const mil = /\bmil\b/.test(limpio);
  const digitos = limpio.replace(/[^\d]/g, "");
  if (!digitos) return null;
  let numero = Number(digitos);
  if (mil && numero < 1000) numero *= 1000;
  if (!Number.isFinite(numero) || numero <= 0 || numero > 100_000_000) return null;
  return numero;
}
