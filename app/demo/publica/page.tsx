import type { Metadata } from "next";
import { leerTienda } from "@/lib/tienda";
import { Vitrina } from "@/components/Vitrina";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false } };

export default async function DemoPublica() {
  const { piezas } = await leerTienda("demo");
  return (
    <Vitrina
      piezas={piezas}
      aviso={
        <div className="cinta-demo">
          <p>
            <strong>Tienda de prueba</strong>: así la ven los clientes.{" "}
            <a href="/demo">Volver al modo tía</a>
          </p>
        </div>
      }
    />
  );
}
