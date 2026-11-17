"use client";

import { useTransition } from "react";
import { reiniciarDemoAccion } from "@/app/acciones";

export function BotonReiniciar() {
  const [pendiente, iniciar] = useTransition();
  return (
    <button
      className="enlace-boton"
      disabled={pendiente}
      onClick={() => iniciar(async () => void (await reiniciarDemoAccion()))}
    >
      {pendiente ? "Reiniciando…" : "Reiniciar la prueba"}
    </button>
  );
}
