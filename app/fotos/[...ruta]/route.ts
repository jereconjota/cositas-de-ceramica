import { leerFoto } from "@/lib/storage";

// Sirve las fotos cuando no son públicas: en desarrollo (disco) o con un Blob store privado.
// Cada foto tiene un nombre único, así que se puede cachear para siempre.
export async function GET(_: Request, { params }: { params: Promise<{ ruta: string[] }> }) {
  try {
    const foto = await leerFoto((await params).ruta);
    if (!foto) return new Response("No encontrado", { status: 404 });
    return new Response(foto as BodyInit, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    console.error("[fotos]", e);
    return new Response("No encontrado", { status: 404 });
  }
}
