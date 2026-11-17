import type { Pieza } from "@/lib/types";
import { NOMBRE_TIA, NOMBRE_TIENDA } from "@/lib/config";
import { Tarjeta } from "./Tarjeta";

// Página pública: título, grilla y nada más. Sin carrito ni links, como pidió Norma.
export function Vitrina({ piezas, aviso }: { piezas: Pieza[]; aviso?: React.ReactNode }) {
  const visibles = piezas.filter((p) => !p.vendida);
  return (
    <>
      {aviso}
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
              <Tarjeta key={pieza.id} pieza={pieza} indice={i} prioridad={i < 2} />
            ))}
          </div>
        )}
      </main>
      <footer className="pie">
        <p>¿Te gustó alguna? Mandale un mensaje a {NOMBRE_TIA} con el nombre de la pieza.</p>
      </footer>
    </>
  );
}
