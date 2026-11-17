import type { Metadata } from "next";
import { leerTienda } from "@/lib/tienda";
import { Editor } from "@/components/Editor";
import { BotonReiniciar } from "@/components/BotonReiniciar";
import { DEMO_REINICIO_MINUTOS } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Prueba: modo tía", robots: { index: false } };

export default async function Demo() {
  const { piezas } = await leerTienda("demo");
  return (
    <Editor
      tienda="demo"
      piezas={piezas}
      arriba={
        <div className="cinta-demo">
          <p>
            <strong>Tienda de prueba.</strong> Estás viendo la página como la ve Norma. Tocá lo que
            quieras: se reinicia sola cada {DEMO_REINICIO_MINUTOS} minutos.
          </p>
          <div className="cinta-enlaces">
            <a href="/demo/publica" target="_blank" rel="noreferrer">Ver como cliente</a>
            <a href="/demo/historial">Ver historial</a>
            <BotonReiniciar />
          </div>
        </div>
      }
    />
  );
}
