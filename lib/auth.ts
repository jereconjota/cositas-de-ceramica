import "server-only";
import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import type { Tienda } from "./types";

export const COOKIE = "llave-tia";

function token() {
  const t = process.env.TIA_TOKEN;
  if (t) return t;
  if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
    throw new Error("Falta configurar TIA_TOKEN");
  }
  return "norma-local";
}

export function tokenValido(valor: string | undefined | null) {
  if (!valor) return false;
  const a = Buffer.from(valor);
  const b = Buffer.from(token());
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function esLaTia() {
  return tokenValido((await cookies()).get(COOKIE)?.value);
}

// La demo la puede tocar cualquiera; la tienda real solo la tía.
export async function puedeEditar(tienda: Tienda) {
  return tienda === "demo" || (await esLaTia());
}
