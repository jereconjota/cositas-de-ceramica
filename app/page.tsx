import { leerTienda } from "@/lib/tienda";
import { Vitrina } from "@/components/Vitrina";

// Página estática: se vuelve a generar solo cuando la tía cambia algo (revalidatePath).
export const dynamic = "force-static";

export default async function Inicio() {
  const { piezas } = await leerTienda("real");
  return <Vitrina piezas={piezas} />;
}
