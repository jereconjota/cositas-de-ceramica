import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { put, get, del } from "@vercel/blob";

// Hay Blob si está el token clásico o el store conectado con OIDC (BLOB_STORE_ID).
// Si no, se guarda en disco (.data/) para poder desarrollar sin configurar nada.
const usaBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
const CARPETA_LOCAL = path.join(process.cwd(), ".data");

if (!usaBlob && process.env.VERCEL) {
  console.error(
    "[storage] No hay Blob conectado: en Vercel andá a Storage → Blob y conectalo al proyecto.",
  );
}

type Acceso = "public" | "private";
let acceso: Promise<Acceso> | null = null;

// Un store de Blob puede ser público o privado y el SDK no lo informa.
// Se prueba una vez por instancia escribiendo un archivito público.
function accesoDelStore(): Promise<Acceso> {
  if (process.env.BLOB_ACCESS === "public" || process.env.BLOB_ACCESS === "private") {
    return Promise.resolve(process.env.BLOB_ACCESS);
  }
  acceso ??= put("_acceso.txt", "ok", {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
  })
    .then((): Acceso => "public")
    .catch((e) => {
      console.warn("[storage] El store no acepta archivos públicos, uso modo privado:", e?.message);
      return "private";
    });
  return acceso;
}

export async function leerJSON<T>(ruta: string): Promise<T | null> {
  if (usaBlob) {
    try {
      const resultado = await get(ruta, { access: await accesoDelStore(), useCache: false });
      if (!resultado || !resultado.stream) return null;
      return JSON.parse(await new Response(resultado.stream).text()) as T;
    } catch (e) {
      if (e instanceof Error && /not.?found/i.test(e.name + e.message)) return null;
      // Un error real de lectura no se puede tratar como "tienda vacía": se perderían datos.
      throw e;
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
      access: await accesoDelStore(),
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
    const modo = await accesoDelStore();
    const blob = await put(nombre, archivo, {
      access: modo,
      contentType: "image/jpeg",
      addRandomSuffix: false,
    });
    // Las fotos privadas se sirven a través de /fotos/...
    return modo === "public" ? blob.url : `/fotos/${nombre}`;
  }
  const destino = path.join(CARPETA_LOCAL, nombre);
  await fs.mkdir(path.dirname(destino), { recursive: true });
  await fs.writeFile(destino, Buffer.from(await archivo.arrayBuffer()));
  return `/fotos/${nombre}`;
}

export async function borrarFoto(url: string) {
  // Las fotos que vienen con el proyecto viven en /public y no se borran.
  if (url.startsWith("/piezas/")) return;
  try {
    const interna = url.startsWith("/fotos/") ? url.slice("/fotos/".length) : null;
    if (usaBlob) {
      await del(interna ?? url);
    } else if (interna) {
      await fs.rm(path.join(CARPETA_LOCAL, interna), { force: true });
    }
  } catch {
    // Si no se pudo borrar una foto vieja no pasa nada grave.
  }
}

// Para /fotos/...: devuelve la foto desde Blob privado o desde disco.
export async function leerFoto(partes: string[]): Promise<ReadableStream | Buffer | null> {
  const nombre = partes.join("/");
  if (!/^real\/fotos\/[\w.-]+\.jpg$/.test(nombre)) return null;
  if (usaBlob) {
    const resultado = await get(nombre, { access: await accesoDelStore() });
    return resultado?.stream ?? null;
  }
  try {
    return await fs.readFile(path.join(CARPETA_LOCAL, nombre));
  } catch {
    return null;
  }
}
