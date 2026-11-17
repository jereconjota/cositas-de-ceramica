"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { Pieza, Tienda } from "@/lib/types";
import { NOMBRE_TIA, NOMBRE_TIENDA } from "@/lib/config";
import { formatearPrecio, leerPrecio } from "@/lib/format";
import { Tarjeta } from "./Tarjeta";
import {
  agregarPieza,
  cambiarFoto,
  editarPieza,
  marcarVendida,
  type Resultado,
} from "@/app/acciones";

type Dialogo =
  | { tipo: "agregar"; foto: Blob; vista: string }
  | { tipo: "editar"; pieza: Pieza };

type Aviso = { texto: string; error?: boolean; deshacer?: () => void };

// Achica la foto en el celular antes de subirla: de ~5 MB a ~200 KB.
async function comprimir(archivo: File): Promise<Blob> {
  const MAX = 1400;
  try {
    const imagen = await createImageBitmap(archivo, { imageOrientation: "from-image" });
    const escala = Math.min(1, MAX / Math.max(imagen.width, imagen.height));
    const lienzo = document.createElement("canvas");
    lienzo.width = Math.round(imagen.width * escala);
    lienzo.height = Math.round(imagen.height * escala);
    lienzo.getContext("2d")!.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
    imagen.close();
    const blob = await new Promise<Blob | null>((ok) => lienzo.toBlob(ok, "image/jpeg", 0.82));
    if (blob) return blob;
  } catch {
    // Si el navegador no puede achicarla, se sube como vino.
  }
  return archivo;
}

function conFoto(foto: Blob, extra?: Record<string, string>) {
  const form = new FormData();
  form.set("foto", new File([foto], "foto.jpg", { type: foto.type || "image/jpeg" }));
  for (const [k, v] of Object.entries(extra ?? {})) form.set(k, v);
  return form;
}

export function Editor({
  tienda,
  piezas,
}: {
  tienda: Tienda;
  piezas: Pieza[];
}) {
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [guardando, iniciar] = useTransition();
  const [preparandoFoto, setPreparandoFoto] = useState(false);
  const entradaNueva = useRef<HTMLInputElement>(null);
  const entradaCambio = useRef<HTMLInputElement>(null);
  const piezaCambio = useRef<string | null>(null);

  const visibles = piezas.filter((p) => !p.vendida);
  const vendidas = piezas.filter((p) => p.vendida);

  useEffect(() => {
    if (!aviso || aviso.error) return;
    const t = setTimeout(() => setAviso(null), aviso.deshacer ? 10_000 : 5_000);
    return () => clearTimeout(t);
  }, [aviso]);

  useEffect(() => {
    document.body.style.overflow = dialogo ? "hidden" : "";
  }, [dialogo]);

  function correr(accion: () => Promise<Resultado>, alSalirBien?: (r: Resultado) => Aviso) {
    iniciar(async () => {
      let r: Resultado;
      try {
        r = await accion();
      } catch {
        r = { ok: false, mensaje: "No hay conexión o algo falló. Probá de nuevo." };
      }
      if (r.ok) {
        setDialogo(null);
        setAviso(alSalirBien ? alSalirBien(r) : { texto: r.mensaje });
      } else {
        setAviso({ texto: r.mensaje, error: true });
      }
    });
  }

  async function alElegirFotoNueva(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    setPreparandoFoto(true);
    const foto = await comprimir(archivo);
    setPreparandoFoto(false);
    setDialogo({ tipo: "agregar", foto, vista: URL.createObjectURL(foto) });
  }

  async function alElegirFotoCambio(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    const id = piezaCambio.current;
    e.target.value = "";
    if (!archivo || !id) return;
    setPreparandoFoto(true);
    const foto = await comprimir(archivo);
    setPreparandoFoto(false);
    correr(() => cambiarFoto(tienda, id, conFoto(foto)));
  }

  function vender(pieza: Pieza, vendida: boolean) {
    correr(
      () => marcarVendida(tienda, pieza.id, vendida),
      (r) => ({
        texto: r.mensaje,
        deshacer: () => {
          setAviso(null);
          correr(() => marcarVendida(tienda, pieza.id, !vendida));
        },
      }),
    );
  }

  return (
    <div className="modo-tia">
      <header className="cabecera">
        <p className="saludo">Hola {NOMBRE_TIA} 👋, esta es tu página</p>
        <h1>{NOMBRE_TIENDA}</h1>
      </header>

      <main>
        {visibles.length === 0 ? (
          <p className="vacio">
            Todavía no hay piezas. Tocá el botón de abajo para sacarle una foto a la primera.
          </p>
        ) : (
          <div className="grilla">
            {visibles.map((pieza, i) => (
              <Tarjeta key={pieza.id} pieza={pieza} prioridad={i < 2} conContacto={false}>
                <div className="acciones">
                  <button
                    className="boton boton-vendida"
                    disabled={guardando}
                    onClick={() => vender(pieza, true)}
                  >
                    ✅ Ya la vendí
                  </button>
                  <button
                    className="boton"
                    disabled={guardando}
                    onClick={() => setDialogo({ tipo: "editar", pieza })}
                  >
                    ✏️ Cambiar nombre o precio
                  </button>
                  <button
                    className="boton"
                    disabled={guardando}
                    onClick={() => {
                      piezaCambio.current = pieza.id;
                      entradaCambio.current?.click();
                    }}
                  >
                    📷 Cambiar la foto
                  </button>
                </div>
              </Tarjeta>
            ))}
          </div>
        )}

        {vendidas.length > 0 && (
          <section className="vendidas">
            <h2>Vendidas</h2>
            <p>Estas ya no se ven en la página. Si volvés a tener una, tocá el botón.</p>
            <ul>
              {vendidas.map((pieza) => (
                <li key={pieza.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pieza.foto} alt="" loading="lazy" width={80} height={80} />
                  <span>{pieza.titulo}</span>
                  <button
                    className="boton boton-chico"
                    disabled={guardando}
                    onClick={() => vender(pieza, false)}
                  >
                    ↩️ La tengo de nuevo
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <div className="barra-agregar">
        <button
          className="boton boton-agregar"
          disabled={guardando || preparandoFoto}
          onClick={() => entradaNueva.current?.click()}
        >
          📷 Agregar una pieza nueva
        </button>
      </div>

      <input ref={entradaNueva} type="file" accept="image/*" hidden onChange={alElegirFotoNueva} />
      <input ref={entradaCambio} type="file" accept="image/*" hidden onChange={alElegirFotoCambio} />

      {dialogo && (
        <Formulario
          key={dialogo.tipo === "editar" ? dialogo.pieza.id : dialogo.vista}
          dialogo={dialogo}
          guardando={guardando}
          onCancelar={() => setDialogo(null)}
          onGuardar={(titulo, precio) => {
            if (dialogo.tipo === "agregar") {
              correr(() => agregarPieza(tienda, conFoto(dialogo.foto, { titulo, precio })));
            } else {
              const form = new FormData();
              form.set("titulo", titulo);
              form.set("precio", precio);
              correr(() => editarPieza(tienda, dialogo.pieza.id, form));
            }
          }}
        />
      )}

      {(guardando || preparandoFoto) && (
        <div className="cargando" role="status" aria-live="assertive">
          <div className="cargando-caja">
            <span className="girando" aria-hidden>
              ⏳
            </span>
            {preparandoFoto ? "Preparando la foto…" : "Guardando… no cierres la página"}
          </div>
        </div>
      )}

      {aviso && !guardando && (
        <div className={`aviso ${aviso.error ? "aviso-error" : ""}`} role="alert">
          <p>
            {aviso.error ? "⚠️ " : "✅ "}
            {aviso.texto}
          </p>
          <div className="aviso-botones">
            {aviso.deshacer && (
              <button className="boton" onClick={aviso.deshacer}>
                ↩️ Me equivoqué, deshacer
              </button>
            )}
            <button className="boton boton-chico" onClick={() => setAviso(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Formulario({
  dialogo,
  guardando,
  onCancelar,
  onGuardar,
}: {
  dialogo: Dialogo;
  guardando: boolean;
  onCancelar: () => void;
  onGuardar: (titulo: string, precio: string) => void;
}) {
  const editando = dialogo.tipo === "editar" ? dialogo.pieza : null;
  const [titulo, setTitulo] = useState(editando?.titulo ?? "");
  const [precio, setPrecio] = useState(editando ? String(editando.precio) : "");
  const [error, setError] = useState<string | null>(null);
  const [confirmoBajo, setConfirmoBajo] = useState(false);
  const precioLeido = leerPrecio(precio);
  const foto = dialogo.tipo === "agregar" ? dialogo.vista : dialogo.pieza.foto;

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && !guardando && onCancelar();
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [guardando, onCancelar]);

  return (
    <div className="fondo-dialogo" role="dialog" aria-modal="true" aria-labelledby="titulo-dialogo">
      <form
        className="dialogo"
        onSubmit={(e) => {
          e.preventDefault();
          if (!titulo.trim()) return setError("Escribí cómo se llama la pieza.");
          if (!precioLeido) return setError("Escribí cuánto sale, solo con números.");
          if (precioLeido < 1000 && !confirmoBajo) {
            setConfirmoBajo(true);
            return setError(
              `¿Seguro que sale ${formatearPrecio(precioLeido)}? Si sale ${precioLeido} mil, escribí ${precioLeido}000. Si está bien, tocá el botón de nuevo.`,
            );
          }
          setError(null);
          onGuardar(titulo.trim(), String(precioLeido));
        }}
      >
        <h2 id="titulo-dialogo">{editando ? "Cambiar la pieza" : "Pieza nueva"}</h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="dialogo-foto" src={foto} alt="" />

        <label htmlFor="campo-titulo">¿Cómo se llama?</label>
        <input
          id="campo-titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ej: Taza azul con platito"
          maxLength={80}
          autoComplete="off"
          enterKeyHint="next"
          autoFocus={!editando}
        />

        <label htmlFor="campo-precio">¿Cuánto sale?</label>
        <div className="campo-precio">
          <span aria-hidden>$</span>
          <input
            id="campo-precio"
            value={precio}
            onChange={(e) => {
              setPrecio(e.target.value.replace(/[^\d.]/g, ""));
              setConfirmoBajo(false);
            }}
            inputMode="numeric"
            placeholder="Ej: 15000"
            autoComplete="off"
            enterKeyHint="done"
          />
        </div>
        <p className="vista-precio" aria-live="polite">
          {precioLeido ? <>Se va a ver así: <strong>{formatearPrecio(precioLeido)}</strong></> : " "}
        </p>

        {error && (
          <p className="error-campo" role="alert">
            ⚠️ {error}
          </p>
        )}

        <button className="boton boton-agregar" type="submit" disabled={guardando}>
          {editando ? "💾 Guardar cambios" : "✅ Publicar en la página"}
        </button>
        <button className="boton" type="button" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
      </form>
    </div>
  );
}
