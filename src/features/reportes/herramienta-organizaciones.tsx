"use client";

import { useId, useRef, useState } from "react";
import { CircleCheck, Inbox, MapPin, Send } from "lucide-react";
import { Boton, Etiqueta, Nota, Tarjeta } from "@/components/ui";
import { useAlmacen, useHidratado } from "@/lib/almacen";
import { ORGANIZACIONES, RUTAS } from "@/features/rutas/datos";
import { ZONAS } from "@/features/territorio/zonas";
import { desdeIso, fechaLarga, listaDias, textoVentana } from "@/features/rutas/tiempo";
import { MOTIVOS, REPORTES_DEMO, almacenReportes, almacenRespuestas, responderReporte, type Reporte } from "./reportes";

function rango(desde: number, hasta: number, tipo: "Calle" | "Carrera"): string {
  const nombre = (n: number) => (n < 0 ? `${-n} ${tipo === "Calle" ? "Sur" : "Este"}` : `${n}`);
  return `${tipo === "Calle" ? "Calles" : "Carreras"} ${nombre(desde)} a ${nombre(hasta)}`;
}

/** Herramienta web para que las organizaciones vean sus rutas y respondan reportes (en producción, con respaldo por WhatsApp). */
export function HerramientaOrganizaciones() {
  const [orgId, setOrgId] = useState(ORGANIZACIONES[0].id);
  const hidratado = useHidratado();
  const locales = useAlmacen(almacenReportes);
  const respuestas = useAlmacen(almacenRespuestas);
  const id = useId();

  const org = ORGANIZACIONES.find((o) => o.id === orgId) ?? ORGANIZACIONES[0];
  const rutas = RUTAS.filter((r) => r.organizacionId === org.id);
  const reportes = (hidratado ? [...locales, ...REPORTES_DEMO] : [...REPORTES_DEMO])
    .filter((r) => r.organizacionId === org.id)
    .sort((a, b) => Number(Boolean(respuestas[a.id])) - Number(Boolean(respuestas[b.id])) || b.creadoEl.localeCompare(a.creadoEl));
  const respondidos = reportes.filter((r) => respuestas[r.id] && hidratado).length;

  return (
    <div className="@container space-y-6">
      <div className="max-w-md">
        <label htmlFor={`${id}-org`} className="text-sm font-semibold">
          Organización
        </label>
        <select
          id={`${id}-org`}
          value={org.id}
          onChange={(e) => setOrgId(e.target.value)}
          className="mt-2 block min-h-11 w-full rounded-xl border border-campo bg-white px-3 text-base"
        >
          {ORGANIZACIONES.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nombre}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-gris">
          Estás viendo los reportes de prueba para esta organización.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 @min-[50rem]:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Tarjeta aria-labelledby="titulo-reportes-org">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="titulo-reportes-org" className="flex items-center gap-2 text-lg font-bold">
              <Inbox aria-hidden className="size-5 text-acento" />
              Reportes recibidos
            </h2>
            <Etiqueta tono={reportes.length > 0 && respondidos === reportes.length ? "exito" : "amarillo"}>
              {respondidos} de {reportes.length} respondidos
            </Etiqueta>
          </div>
          <p className="mt-1 text-sm text-gris">Meta del proyecto: responder el 90 % de los reportes en 72 horas o menos.</p>
          {reportes.length === 0 ? (
            <p className="mt-3 text-gris">No hay reportes para esta organización.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {reportes.map((r) => (
                <ItemReporte key={r.id} reporte={r} respuesta={hidratado ? respuestas[r.id]?.texto : undefined} />
              ))}
            </ul>
          )}
        </Tarjeta>
        <Tarjeta aria-labelledby="titulo-rutas-org">
          <h2 id="titulo-rutas-org" className="flex items-center gap-2 text-lg font-bold">
            <MapPin aria-hidden className="size-5 text-acento" />
            Rutas de prueba
          </h2>
          <ul className="mt-3 space-y-3">
            {rutas.map((r) => (
              <li key={r.id} className="rounded-xl border border-borde bg-fondo p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">Ruta {r.id}</h3>
                  <Etiqueta>{ZONAS.find((z) => z.id === r.zonaId)?.nombre}</Etiqueta>
                </div>
                <p className="mt-2 font-medium">
                  {listaDias(r.dias).replace(/^./, (c) => c.toUpperCase())}, {textoVentana(r.ventana)}
                </p>
                <p className="mt-1 text-sm text-gris">
                  <strong>Cobertura</strong> · {rango(r.cobertura.calle[0], r.cobertura.calle[1], "Calle")} · {rango(r.cobertura.carrera[0], r.cobertura.carrera[1], "Carrera")}
                </p>
                <p className="mt-1 text-xs text-gris">Fecha de validación simulada: {fechaLarga(desdeIso(r.validadaEl))}</p>
              </li>
            ))}
          </ul>
        </Tarjeta>
      </div>
      <Nota>
        Los reportes marcados «Ejemplo» vienen con el prototipo. Los que hagas en este navegador aparecen aquí. Puedes ensayar una respuesta y verla en «Mis avisos y reportes».
      </Nota>
    </div>
  );
}

function ItemReporte({ reporte, respuesta }: { reporte: Reporte; respuesta?: string }) {
  const [texto, setTexto] = useState("");
  const [error, setError] = useState(false);
  const campoRef = useRef<HTMLTextAreaElement>(null);
  const confirmacionRef = useRef<HTMLDivElement>(null);
  const id = useId();
  return (
    <li className="rounded-xl bg-fondo p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-sm font-semibold tracking-wide">{reporte.id}</span>
        <span className="flex gap-1.5">
          {reporte.demo && <Etiqueta tono="gris">Ejemplo</Etiqueta>}
          <Etiqueta tono={respuesta ? "exito" : "amarillo"}>{respuesta ? "Respondido" : "Pendiente"}</Etiqueta>
        </span>
      </div>
      <p className="mt-1 font-semibold">{MOTIVOS[reporte.motivo]}</p>
      <p className="text-sm text-gris">
        Ruta {reporte.rutaId} · {reporte.cuadraDescripcion} · recolección del {fechaLarga(desdeIso(reporte.fecha))}
      </p>
      {reporte.comentario && <p className="mt-1 text-sm">«{reporte.comentario}»</p>}
      {respuesta ? (
        <div ref={confirmacionRef} tabIndex={-1} className="mt-3 rounded-xl bg-white p-3">
          <p role="status" className="flex items-start gap-2 font-semibold text-exito">
            <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0" />
            Respuesta guardada en este navegador
          </p>
          <p className="mt-1 text-gris">{respuesta}</p>
        </div>
      ) : (
        <form
          className="mt-3"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!texto.trim()) {
              setError(true);
              campoRef.current?.focus();
              return;
            }
            responderReporte(reporte.id, texto);
            requestAnimationFrame(() => confirmacionRef.current?.focus());
          }}
        >
          <label htmlFor={`${id}-respuesta`} className="block font-semibold">Respuesta al reporte {reporte.id}</label>
          <textarea
            ref={campoRef}
            id={`${id}-respuesta`}
            rows={2}
            value={texto}
            maxLength={280}
            onChange={(e) => {
              setTexto(e.target.value);
              setError(false);
            }}
            aria-invalid={error || undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`mt-2 block min-h-11 w-full rounded-xl border bg-white p-3 text-base ${error ? "border-rojo" : "border-campo"}`}
          />
          {error && (
            <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-rojo" role="alert">Escribe una respuesta antes de guardarla.</p>
          )}
          <Boton type="submit" className="mt-3">
            <Send aria-hidden className="size-4 shrink-0" />
            Guardar respuesta de prueba
          </Boton>
        </form>
      )}
    </li>
  );
}
