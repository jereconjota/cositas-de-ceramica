import { promises as fs } from "node:fs";
import { rutaLocal } from "@/lib/storage";

// Solo se usa en desarrollo, cuando no hay Vercel Blob configurado.
export async function GET(_: Request, { params }: { params: Promise<{ ruta: string[] }> }) {
  const destino = rutaLocal((await params).ruta);
  if (!destino) return new Response("No encontrado", { status: 404 });
  try {
    const archivo = await fs.readFile(destino);
    return new Response(archivo, {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("No encontrado", { status: 404 });
  }
}
