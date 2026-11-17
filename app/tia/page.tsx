import type { Metadata } from "next";
import { esLaTia } from "@/lib/auth";
import { leerTienda } from "@/lib/tienda";
import { Editor } from "@/components/Editor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mi página", robots: { index: false } };

export default async function Tia() {
  if (!(await esLaTia())) {
    return (
      <main className="cerrado">
        <h1>Esta parte es solo para Norma</h1>
        <p>Si sos Norma, abrí la página desde el ícono que tenés en el celular.</p>
      </main>
    );
  }
  const { piezas } = await leerTienda("real");
  return <Editor tienda="real" piezas={piezas} enlacePublico="/" />;
}
