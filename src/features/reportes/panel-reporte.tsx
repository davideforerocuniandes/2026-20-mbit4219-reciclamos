"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { CircleCheck, MessageSquareWarning, Send } from "lucide-react";
import { Boton, Nota, Tarjeta, cx } from "@/components/ui";
import type { Cuadra } from "@/features/direcciones/direccion";
import type { Zona } from "@/features/territorio/zonas";
import type { RutaEnCuadra } from "@/features/rutas/consulta";
import { ultimasRecolecciones } from "@/features/rutas/consulta";
import { enBogota, fechaRelativa, iso } from "@/features/rutas/tiempo";
import { LIMITE_COMENTARIO, MOTIVOS, crearReporte, type Motivo, type Reporte } from "./reportes";

export function PanelReporte({ cuadra, zona, rutas, ahora }: { cuadra: Cuadra; zona: Zona; rutas: RutaEnCuadra[]; ahora: Date }) {
  const [abierto, setAbierto] = useState(false);
  const [rutaId, setRutaId] = useState(rutas[0].ruta.id);
  const [motivo, setMotivo] = useState<Motivo | null>(null);
  const [comentario, setComentario] = useState("");
  const [errorMotivo, setErrorMotivo] = useState(false);
  const [enviado, setEnviado] = useState<Reporte | null>(null);
  const id = useId();

  const elegida = rutas.find((r) => r.ruta.id === rutaId) ?? rutas[0];
  const fechas = ultimasRecolecciones(elegida.ruta, ahora);
  const [fecha, setFecha] = useState(() => (fechas[0] ? iso(fechas[0]) : ""));
  const hoy = enBogota(ahora).fecha;
  const fechaValida = fechas.some((f) => iso(f) === fecha) ? fecha : fechas[0] ? iso(fechas[0]) : "";

  function reiniciar() {
    setEnviado(null);
    setMotivo(null);
    setComentario("");
    setAbierto(false);
  }

  if (enviado) {
    return (
      <Tarjeta aria-labelledby="titulo-reporte" className="animar-entrada">
        <h2 id="titulo-reporte" className="flex items-center gap-2 text-lg font-bold">
          <CircleCheck aria-hidden className="size-5 text-verde-700" />
          Reporte enviado
        </h2>
        <div role="status" className="mt-3 space-y-2 text-[0.95rem]">
          <p>
            Tu número es <strong className="font-mono text-base tracking-wide">{enviado.id}</strong>. Le llegó a{" "}
            <strong>{rutas.find((r) => r.ruta.id === enviado.rutaId)?.organizacion.nombre}</strong>, que debe responder en 72 horas.
          </p>
          <p className="text-gris">Si la ruta falla varias veces, la UAESP revisa el caso. Las quejas formales (PQR) van por el canal del servicio de aseo.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/mis-avisos" className="inline-flex min-h-11 items-center rounded-xl px-4 font-semibold text-verde-700 underline-offset-4 hover:underline">
            Ver mis reportes
          </Link>
          <Boton variante="sutil" onClick={reiniciar}>
            Hacer otro reporte
          </Boton>
        </div>
      </Tarjeta>
    );
  }

  return (
    <Tarjeta aria-labelledby="titulo-reporte">
      <h2 id="titulo-reporte" className="flex items-center gap-2 text-lg font-bold">
        <MessageSquareWarning aria-hidden className="size-5 text-verde-700" />
        ¿No pasaron?
      </h2>
      {!abierto ? (
        <div className="mt-3 space-y-3">
          <p className="text-[0.95rem] text-gris">Si sacaste la bolsa y nadie la recogió, cuéntale a la organización. Así la ruta mejora.</p>
          <Boton variante="secundaria" onClick={() => setAbierto(true)} aria-expanded={false} className="w-full sm:w-auto">
            Reportar que no pasaron
          </Boton>
        </div>
      ) : (
        <form
          className="mt-3 space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!motivo) {
              setErrorMotivo(true);
              return;
            }
            setEnviado(
              crearReporte({
                rutaId: elegida.ruta.id,
                organizacionId: elegida.organizacion.id,
                cuadraClave: cuadra.clave,
                cuadraDescripcion: cuadra.descripcion,
                zonaNombre: zona.nombre,
                motivo,
                fecha: fechaValida,
                comentario,
              }),
            );
          }}
        >
          {rutas.length > 1 && (
            <fieldset>
              <legend className="text-sm font-semibold">¿Qué organización debía pasar?</legend>
              <div className="mt-2 grid gap-2">
                {rutas.map((r) => (
                  <label key={r.ruta.id} className="flex min-h-11 items-center gap-3 rounded-xl bg-crema px-3 py-2 text-sm">
                    <input
                      type="radio"
                      name={`${id}-ruta`}
                      value={r.ruta.id}
                      checked={rutaId === r.ruta.id}
                      onChange={() => {
                        setRutaId(r.ruta.id);
                        const f = ultimasRecolecciones(r.ruta, ahora)[0];
                        setFecha(f ? iso(f) : "");
                      }}
                      className="size-4 accent-verde-700"
                    />
                    {r.organizacion.nombre}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset aria-describedby={errorMotivo ? `${id}-error` : undefined}>
            <legend className="text-sm font-semibold">¿Qué pasó?</legend>
            <div className="mt-2 grid gap-2">
              {(Object.keys(MOTIVOS) as Motivo[]).map((m) => (
                <label
                  key={m}
                  className={cx(
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm ring-1 ring-inset",
                    motivo === m ? "bg-verde-50 ring-verde-700" : "bg-white ring-borde",
                  )}
                >
                  <input
                    type="radio"
                    name={`${id}-motivo`}
                    value={m}
                    checked={motivo === m}
                    onChange={() => {
                      setMotivo(m);
                      setErrorMotivo(false);
                    }}
                    className="size-4 accent-verde-700"
                  />
                  {MOTIVOS[m]}
                </label>
              ))}
            </div>
            {errorMotivo && (
              <p id={`${id}-error`} className="mt-2 text-sm font-semibold text-rojo">
                Elige qué pasó para poder enviar el reporte.
              </p>
            )}
          </fieldset>

          <div>
            <label htmlFor={`${id}-fecha`} className="text-sm font-semibold">
              ¿Qué día?
            </label>
            <select
              id={`${id}-fecha`}
              value={fechaValida}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-2 block min-h-11 w-full rounded-xl border border-borde bg-white px-3 text-sm"
            >
              {fechas.map((f) => (
                <option key={iso(f)} value={iso(f)}>
                  {fechaRelativa(f, hoy).replace(/^el /, "").replace(/^./, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={`${id}-comentario`} className="text-sm font-semibold">
              Comentario <span className="font-normal text-gris">(opcional)</span>
            </label>
            <textarea
              id={`${id}-comentario`}
              value={comentario}
              maxLength={LIMITE_COMENTARIO}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              aria-describedby={`${id}-contador`}
              className="mt-2 block w-full rounded-xl border border-borde bg-white px-3 py-2 text-sm"
              placeholder="Por ejemplo: la bolsa sigue en la esquina."
            />
            <p id={`${id}-contador`} className="mt-1 text-right text-xs text-gris">
              {comentario.length}/{LIMITE_COMENTARIO}
            </p>
          </div>

          <Nota>No incluyas tu dirección ni datos personales: el reporte se asocia a tu cuadra.</Nota>

          <div className="flex flex-wrap gap-2">
            <Boton type="submit">
              <Send aria-hidden className="size-4" />
              Enviar reporte
            </Boton>
            <Boton variante="sutil" onClick={() => setAbierto(false)}>
              Cancelar
            </Boton>
          </div>
        </form>
      )}
    </Tarjeta>
  );
}
