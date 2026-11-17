import type { Metadata } from "next";
import { NOMBRE_TIA } from "@/lib/config";
import { leerPrecio } from "@/lib/format";
import { mensajeConsulta } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Escribirle a Norma", robots: { index: false } };

// Simula lo que pasaría al tocar «Escribile» mientras Norma no tenga número cargado.
export default async function Whatsapp({
  searchParams,
}: {
  searchParams: Promise<{ pieza?: string; precio?: string }>;
}) {
  const { pieza, precio } = await searchParams;
  const titulo = (pieza ?? "").slice(0, 80);
  const valor = leerPrecio(precio ?? "");

  return (
    <main className="simulador">
      <h1>Acá se abriría WhatsApp 📱</h1>
      <p>
        Con el mensaje ya escrito para {NOMBRE_TIA}. Solo tendrías que tocar «Enviar».
      </p>
      <div className="chat" aria-label={`Vista previa del chat con ${NOMBRE_TIA}`}>
        <div className="chat-cabecera">{NOMBRE_TIA}</div>
        <div className="chat-cuerpo">
          <p className="burbuja">
            {titulo && valor
              ? mensajeConsulta(titulo, valor)
              : `¡Hola ${NOMBRE_TIA}! Vi tu página y me interesa una pieza.`}
          </p>
        </div>
      </div>
      <p className="nota">
        Es una simulación: cuando {NOMBRE_TIA} quiera, se carga su número y este botón abre su
        WhatsApp de verdad.
      </p>
      <a className="boton boton-chico" href="/">
        ← Volver a las piezas
      </a>
    </main>
  );
}
