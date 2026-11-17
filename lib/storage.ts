import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { put, get, del } from "@vercel/blob";

// Si hay token de Vercel Blob se usa Blob; si no, se guarda en disco (.data/)
// para poder desarrollar y probar sin configurar nada.
const usaBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const CARPETA_LOCAL = path.join(process.cwd(), ".data");

export async function leerJSON<T>(ruta: string): Promise<T | null> {
  if (usaBlob) {
    try {
      const resultado = await get(ruta, { access: "public", useCache: false });
      if (!resultado || !resultado.stream) return null;
      return JSON.parse(await new Response(resultado.stream).text()) as T;
    } catch {
      return null;
    }
  }
  try {
    return JSON.parse(await fs.readFile(path.join(CARPETA_LOCAL, ruta), "utf8")) as T;
  } catch {
    return null;
  }
}

export async function guardarJSON(ruta: string, datos: unknown) {
  const contenido = JSON.stringify(datos);
  if (usaBlob) {
    await put(ruta, contenido, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });
    return;
  }
  const destino = path.join(CARPETA_LOCAL, ruta);
  await fs.mkdir(path.dirname(destino), { recursive: true });
  await fs.writeFile(destino, contenido);
}

export async function guardarFoto(carpeta: string, archivo: File): Promise<string> {
  const nombre = `${carpeta}/fotos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  if (usaBlob) {
    const blob = await put(nombre, archivo, {
      access: "public",
      contentType: "image/jpeg",
      addRandomSuffix: false,
    });
    return blob.url;
  }
  const destino = path.join(CARPETA_LOCAL, nombre);
  await fs.mkdir(path.dirname(destino), { recursive: true });
  await fs.writeFile(destino, Buffer.from(await archivo.arrayBuffer()));
  return `/fotos-local/${nombre}`;
}

export async function borrarFoto(url: string) {
  // Las fotos de ejemplo de la demo viven en /public y no se borran.
  if (url.startsWith("/demo/")) return;
  try {
    if (usaBlob) {
      await del(url);
    } else if (url.startsWith("/fotos-local/")) {
      await fs.rm(path.join(CARPETA_LOCAL, url.replace("/fotos-local/", "")), { force: true });
    }
  } catch {
    // Si no se pudo borrar una foto vieja no pasa nada grave.
  }
}

export function rutaLocal(partes: string[]) {
  const destino = path.join(CARPETA_LOCAL, ...partes);
  if (!destino.startsWith(CARPETA_LOCAL + path.sep)) return null;
  return destino;
}
