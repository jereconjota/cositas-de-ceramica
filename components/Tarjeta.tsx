import type { ReactNode } from "react";
import type { Pieza } from "@/lib/types";
import { formatearPrecio } from "@/lib/format";
import { enlaceConsulta } from "@/lib/whatsapp";
import { NOMBRE_TIA } from "@/lib/config";

// La misma tarjeta para los clientes y para la tía. A la tía se le suman botones abajo
// y no ve «Escribile», que es para que los clientes le escriban a ella.
export function Tarjeta({
  pieza,
  children,
  prioridad = false,
  conContacto = true,
}: {
  pieza: Pieza;
  children?: ReactNode;
  prioridad?: boolean;
  conContacto?: boolean;
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
        <div className="precio-fila">
          <p className="precio">{formatearPrecio(pieza.precio)}</p>
          {conContacto && (
            <a
              className="boton-escribir"
              href={enlaceConsulta(pieza)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Escribirle a ${NOMBRE_TIA} por «${pieza.titulo}»`}
            >
              <span aria-hidden>💬</span> Escribile
            </a>
          )}
        </div>
      </div>
      {children}
    </article>
  );
}
