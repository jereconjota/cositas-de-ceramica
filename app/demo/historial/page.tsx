import { leerTienda } from "@/lib/tienda";
import { Historial } from "@/components/Historial";

export const dynamic = "force-dynamic";

export default async function DemoHistorial() {
  const { historial } = await leerTienda("demo");
  return <Historial movimientos={historial} volver="/demo" />;
}
