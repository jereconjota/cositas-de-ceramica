"use server";

import { revalidatePath } from "next/cache";
import { puedeEditar } from "@/lib/auth";
import { modificarTienda } from "@/lib/tienda";
import { guardarFoto, borrarFoto } from "@/lib/storage";
import { leerPrecio, formatearPrecio } from "@/lib/format";
import type { Pieza, Tienda } from "@/lib/types";

export type Resultado = { ok: true; mensaje: string } | { ok: false; mensaje: string };

const MAX_FOTO = 6 * 1024 * 1024;

function refrescar(_tienda: Tienda) {
  revalidatePath("/");
  revalidatePath("/tia");
  revalidatePath("/historial");
}

// Error con un mensaje pensado para mostrarle a la tía tal cual.
class Aviso extends Error {}

async function preparar(tienda: unknown): Promise<Tienda> {
  if (tienda !== "real") throw new Aviso("No se encontró la tienda.");
  if (!(await puedeEditar(tienda))) throw new Aviso("No tenés permiso para cambiar esta página.");
  return tienda;
}

function leerTitulo(valor: FormDataEntryValue | null) {
  const titulo = String(valor ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
  return titulo || null;
}

function leerFoto(valor: FormDataEntryValue | null) {
  if (!(valor instanceof File) || valor.size === 0) return null;
  if (!valor.type.startsWith("image/") || valor.size > MAX_FOTO) return null;
  return valor;
}

async function intentar(fn: () => Promise<string>): Promise<Resultado> {
  try {
    return { ok: true, mensaje: await fn() };
  } catch (e) {
    console.error(e);
    const mensaje =
      e instanceof Aviso ? e.message : "No se pudo guardar. Probá de nuevo en un ratito.";
    return { ok: false, mensaje };
  }
}

export async function agregarPieza(tiendaRaw: Tienda, form: FormData): Promise<Resultado> {
  return intentar(async () => {
    const tienda = await preparar(tiendaRaw);
    const foto = leerFoto(form.get("foto"));
    const titulo = leerTitulo(form.get("titulo"));
    const precio = leerPrecio(String(form.get("precio") ?? ""));
    if (!foto) throw new Aviso("Falta la foto de la pieza.");
    if (!titulo) throw new Aviso("Falta el nombre de la pieza.");
    if (!precio) throw new Aviso("Falta el precio, o no se entendió.");
    const url = await guardarFoto(tienda, foto);
    const pieza: Pieza = {
      id: crypto.randomUUID(),
      titulo,
      precio,
      foto: url,
      vendida: false,
      creada: new Date().toISOString(),
    };
    await modificarTienda(tienda, (piezas) => ({
      piezas: [pieza, ...piezas],
      texto: `Agregó «${titulo}» a ${formatearPrecio(precio)}`,
    }));
    refrescar(tienda);
    return `Listo, «${titulo}» ya está en la página.`;
  });
}

export async function editarPieza(
  tiendaRaw: Tienda,
  id: string,
  form: FormData,
): Promise<Resultado> {
  return intentar(async () => {
    const tienda = await preparar(tiendaRaw);
    const titulo = leerTitulo(form.get("titulo"));
    const precio = leerPrecio(String(form.get("precio") ?? ""));
    if (!titulo) throw new Aviso("Falta el nombre de la pieza.");
    if (!precio) throw new Aviso("Falta el precio, o no se entendió.");
    await modificarTienda(tienda, (piezas) => {
      const vieja = piezas.find((p) => p.id === id);
      if (!vieja) throw new Aviso("Esa pieza ya no está. Cerrá y volvé a abrir la página.");
      const cambios: string[] = [];
      if (vieja.titulo !== titulo) cambios.push(`le cambió el nombre a «${titulo}»`);
      if (vieja.precio !== precio)
        cambios.push(`le cambió el precio de ${formatearPrecio(vieja.precio)} a ${formatearPrecio(precio)}`);
      return {
        piezas: piezas.map((p) => (p.id === id ? { ...p, titulo, precio } : p)),
        texto: cambios.length
          ? `A «${vieja.titulo}» ${cambios.join(" y ")}`
          : `Revisó «${vieja.titulo}» sin cambios`,
      };
    });
    refrescar(tienda);
    return "Listo, ya está cambiado.";
  });
}

export async function cambiarFoto(
  tiendaRaw: Tienda,
  id: string,
  form: FormData,
): Promise<Resultado> {
  return intentar(async () => {
    const tienda = await preparar(tiendaRaw);
    const foto = leerFoto(form.get("foto"));
    if (!foto) throw new Aviso("No llegó la foto. Probá de nuevo.");
    const url = await guardarFoto(tienda, foto);
    let anterior = "";
    await modificarTienda(tienda, (piezas) => {
      const pieza = piezas.find((p) => p.id === id);
      if (!pieza) throw new Aviso("Esa pieza ya no está. Cerrá y volvé a abrir la página.");
      anterior = pieza.foto;
      return {
        piezas: piezas.map((p) => (p.id === id ? { ...p, foto: url } : p)),
        texto: `Le cambió la foto a «${pieza.titulo}»`,
      };
    });
    await borrarFoto(anterior);
    refrescar(tienda);
    return "Listo, la foto nueva ya se ve.";
  });
}

export async function marcarVendida(
  tiendaRaw: Tienda,
  id: string,
  vendida: boolean,
): Promise<Resultado> {
  return intentar(async () => {
    const tienda = await preparar(tiendaRaw);
    let titulo = "";
    await modificarTienda(tienda, (piezas) => {
      const pieza = piezas.find((p) => p.id === id);
      if (!pieza) throw new Aviso("Esa pieza ya no está. Cerrá y volvé a abrir la página.");
      titulo = pieza.titulo;
      return {
        piezas: piezas.map((p) => (p.id === id ? { ...p, vendida } : p)),
        texto: vendida
          ? `Marcó «${pieza.titulo}» como vendida`
          : `Volvió a publicar «${pieza.titulo}»`,
      };
    });
    refrescar(tienda);
    return vendida
      ? `«${titulo}» ya no se ve en la página.`
      : `«${titulo}» se ve de nuevo en la página.`;
  });
}
