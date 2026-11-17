import type { Movimiento } from "@/lib/types";
import { formatearFecha } from "@/lib/format";
import { NOMBRE_TIA } from "@/lib/config";

export function Historial({ movimientos, volver }: { movimientos: Movimiento[]; volver: string }) {
  return (
    <main className="historial">
      <h1>Qué cambió {NOMBRE_TIA}</h1>
      <p>Los últimos cambios en la página, del más nuevo al más viejo.</p>
      {movimientos.length === 0 ? (
        <p className="vacio">Todavía no hubo cambios.</p>
      ) : (
        <ol>
          {movimientos.map((m, i) => (
            <li key={i}>
              <time dateTime={m.fecha}>{formatearFecha(m.fecha)}</time>
              <span>{m.texto}</span>
            </li>
          ))}
        </ol>
      )}
      <a className="boton boton-chico" href={volver}>
        ← Volver
      </a>
    </main>
  );
}
