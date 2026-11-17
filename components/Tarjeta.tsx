import type { ReactNode } from "react";
import type { Pieza } from "@/lib/types";
import { formatearPrecio } from "@/lib/format";

// La misma tarjeta para los clientes y para la tía. A la tía solo se le suman botones abajo.
export function Tarjeta({
  pieza,
  children,
  prioridad = false,
}: {
  pieza: Pieza;
  children?: ReactNode;
  prioridad?: boolean;
}) {
  return (
    <article className="tarjeta">
      <div className="tarjeta-foto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pieza.foto}
          alt={pieza.titulo}
          loading={prioridad ? "eager" : "lazy"}
          fetchPriority={prioridad ? "high" : "auto"}
          decoding="async"
          width={800}
          height={800}
        />
      </div>
      <div className="tarjeta-texto">
        <h2>{pieza.titulo}</h2>
        <p className="precio">{formatearPrecio(pieza.precio)}</p>
      </div>
      {children}
    </article>
  );
}
