import type { Pieza } from "@/lib/types";
import { NOMBRE_TIA, NOMBRE_TIENDA } from "@/lib/config";
import { Tarjeta } from "./Tarjeta";

// Página pública: título, grilla y un botón para escribirle a Norma. Sin carrito.
export function Vitrina({ piezas }: { piezas: Pieza[] }) {
  const visibles = piezas.filter((p) => !p.vendida);
  return (
    <>
      <header className="cabecera">
        <h1>{NOMBRE_TIENDA}</h1>
        <p>Piezas hechas a mano por {NOMBRE_TIA}, una por una.</p>
      </header>
      <main>
        {visibles.length === 0 ? (
          <p className="vacio">Pronto vas a ver piezas nuevas acá.</p>
        ) : (
          <div className="grilla">
            {visibles.map((pieza, i) => (
              <Tarjeta key={pieza.id} pieza={pieza} prioridad={i < 2} />
            ))}
          </div>
        )}
      </main>
      <footer className="pie">
        <p>¿Te gustó alguna? Tocá «💬 Escribile» y le mandás un mensaje a {NOMBRE_TIA}.</p>
      </footer>
    </>
  );
}
