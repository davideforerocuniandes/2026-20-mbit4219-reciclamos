"use client";

import { useId, useRef, useState } from "react";
import { CircleCheck, MessageSquareWarning } from "lucide-react";
import { Boton, EnlaceBoton, Tarjeta, cx } from "@/components/ui";
import type { Cuadra } from "@/features/direcciones/direccion";
import type { Zona } from "@/features/territorio/zonas";
import { ultimasRecolecciones, type RutaEnCuadra } from "@/features/rutas/consulta";
import { fechaLarga, iso } from "@/features/rutas/tiempo";
import { LIMITE_COMENTARIO, MOTIVOS, crearReporte, type Motivo, type Reporte } from "./reportes";

type ErrorReporte = "organizacion" | "motivo" | "fecha";

const ERRORES: Record<ErrorReporte, string> = {
  organizacion: "Elige la organización que debía pasar.",
  motivo: "Elige qué pasó para poder guardar el reporte.",
  fecha: "Elige el día en que ocurrió.",
};

export function PanelReporte({ cuadra, zona, rutas, ahora }: { cuadra: Cuadra; zona: Zona; rutas: RutaEnCuadra[]; ahora: Date }) {
  const [rutaId, setRutaId] = useState(rutas.length === 1 ? rutas[0].ruta.id : "");
  const [motivo, setMotivo] = useState<Motivo | null>(null);
  const [comentario, setComentario] = useState("");
  const [fecha, setFecha] = useState("");
  const [error, setError] = useState<ErrorReporte | null>(null);
  const [guardado, setGuardado] = useState<Reporte | null>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const detalleRef = useRef<HTMLDetailsElement>(null);
  const id = useId();

  const elegida = rutas.find(({ ruta }) => ruta.id === rutaId);
  const fechas = elegida ? ultimasRecolecciones(elegida.ruta, ahora) : [];
  const fechaValida = fechas.some((f) => iso(f) === fecha) ? fecha : fechas[0] ? iso(fechas[0]) : "";

  function mostrarError(campo: ErrorReporte) {
    setError(campo);
    requestAnimationFrame(() => detalleRef.current?.querySelector<HTMLElement>(`[data-campo="${campo}"]`)?.focus());
  }

  function reiniciar() {
    setGuardado(null);
    setRutaId(rutas.length === 1 ? rutas[0].ruta.id : "");
    setMotivo(null);
    setFecha("");
    setComentario("");
    requestAnimationFrame(() => detalleRef.current?.querySelector("summary")?.focus());
  }

  return (
    <Tarjeta aria-labelledby={`${id}-titulo`}>
      <h2 id={`${id}-titulo`} ref={tituloRef} tabIndex={-1} className="flex items-start gap-2 text-lg font-bold">
        {guardado ? (
          <><CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-exito" /> Reporte guardado en esta prueba</>
        ) : (
          <><MessageSquareWarning aria-hidden className="mt-0.5 size-5 shrink-0 text-acento" /> ¿No pasaron?</>
        )}
      </h2>
      {guardado ? (
        <div className="mt-3 space-y-3">
          <p role="status">
            Número <strong className="font-mono">{guardado.id}</strong>. Puedes ensayar la respuesta de {elegida?.organizacion.nombre} en la herramienta para organizaciones de este navegador.
          </p>
          <div className="flex flex-wrap gap-2">
            <EnlaceBoton variante="secundaria" href="/mis-avisos">Ver mis reportes</EnlaceBoton>
            <Boton variante="sutil" onClick={reiniciar}>Hacer otro reporte</Boton>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-1 text-gris">Si la ruta falló, ensaya cómo reportarlo.</p>
          <details ref={detalleRef} className="mt-3">
            <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center rounded-xl border border-acento px-3 py-2 font-semibold text-acento hover:bg-acento-suave [&::-webkit-details-marker]:hidden">
              Reportar que no pasaron
            </summary>
            <form
              className="mt-3 space-y-4"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (!elegida) return mostrarError("organizacion");
                if (!motivo) return mostrarError("motivo");
                if (!fechaValida) return mostrarError("fecha");
                setError(null);
                setGuardado(crearReporte({
                  rutaId: elegida.ruta.id,
                  organizacionId: elegida.organizacion.id,
                  cuadraClave: cuadra.clave,
                  cuadraDescripcion: cuadra.descripcion,
                  zonaNombre: zona.nombre,
                  motivo,
                  fecha: fechaValida,
                  comentario,
                }));
                requestAnimationFrame(() => tituloRef.current?.focus());
              }}
            >
              {rutas.length > 1 && (
                <fieldset aria-describedby={error === "organizacion" ? `${id}-error` : undefined}>
                  <legend className="font-semibold">¿Qué organización debía pasar?</legend>
                  <div className="mt-2 grid gap-2">
                    {rutas.map(({ ruta, organizacion }) => (
                      <label key={ruta.id} className={claseOpcion(rutaId === ruta.id)}>
                        <input
                          type="radio" name={`${id}-ruta`} value={ruta.id} checked={rutaId === ruta.id} data-campo="organizacion"
                          onChange={() => { setRutaId(ruta.id); setFecha(""); if (error === "organizacion") setError(null); }}
                          className="size-4 shrink-0 accent-acento"
                        />
                        {organizacion.nombre}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              <fieldset aria-describedby={error === "motivo" ? `${id}-error` : undefined}>
                <legend className="font-semibold">¿Qué pasó?</legend>
                <div className="mt-2 grid gap-2">
                  {(Object.keys(MOTIVOS) as Motivo[]).map((m) => (
                    <label key={m} className={claseOpcion(motivo === m)}>
                      <input
                        type="radio" name={`${id}-motivo`} value={m} checked={motivo === m} data-campo="motivo"
                        onChange={() => { setMotivo(m); if (error === "motivo") setError(null); }}
                        className="size-4 shrink-0 accent-acento"
                      />
                      {MOTIVOS[m]}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor={`${id}-fecha`} className="font-semibold">¿Qué día?</label>
                <select
                  id={`${id}-fecha`} value={fechaValida} disabled={!elegida} data-campo="fecha"
                  aria-describedby={error === "fecha" ? `${id}-error` : undefined}
                  onChange={(e) => { setFecha(e.target.value); if (error === "fecha") setError(null); }}
                  className="mt-2 block min-h-11 w-full rounded-xl border border-campo bg-white px-2 text-base disabled:bg-fondo"
                >
                  {!elegida && <option value="">Elige una organización</option>}
                  {fechas.map((f) => <option key={iso(f)} value={iso(f)}>{fechaLarga(f)}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor={`${id}-comentario`} className="font-semibold">
                  Comentario <span className="font-normal text-gris">(opcional)</span>
                </label>
                <textarea
                  id={`${id}-comentario`} value={comentario} rows={3} maxLength={LIMITE_COMENTARIO}
                  onChange={(e) => setComentario(e.target.value)} aria-describedby={`${id}-privacidad`}
                  className="mt-2 block w-full rounded-xl border border-campo bg-white p-3 text-base"
                />
                <p id={`${id}-privacidad`} className="mt-1 text-sm text-gris">Evita escribir direcciones o datos personales.</p>
              </div>

              {error && <p id={`${id}-error`} role="alert" className="font-semibold text-rojo">{ERRORES[error]}</p>}
              <div className="flex flex-wrap gap-2">
                <Boton type="submit">Guardar reporte de prueba</Boton>
                <Boton variante="sutil" onClick={() => {
                  if (detalleRef.current) detalleRef.current.open = false;
                  detalleRef.current?.querySelector("summary")?.focus();
                }}>Cerrar formulario</Boton>
              </div>
            </form>
          </details>
        </>
      )}
    </Tarjeta>
  );
}

function claseOpcion(seleccionada: boolean) {
  return cx(
    "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-base",
    seleccionada ? "border-acento bg-acento-suave" : "border-campo bg-white",
  );
}
