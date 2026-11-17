import type { Metadata } from "next";
import { esLaTia } from "@/lib/auth";
import { leerTienda } from "@/lib/tienda";
import { Historial } from "@/components/Historial";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Historial", robots: { index: false } };

// Para el sobrino: qué tocó la tía y cuándo. Se abre desde el mismo celu o con la llave.
export default async function PaginaHistorial() {
  if (!(await esLaTia())) {
    return (
      <main className="cerrado">
        <h1>Esta parte es privada</h1>
      </main>
    );
  }
  const { historial } = await leerTienda("real");
  return <Historial movimientos={historial} volver="/tia" />;
}
