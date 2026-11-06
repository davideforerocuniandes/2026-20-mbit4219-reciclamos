"use client";

import { useId, useState } from "react";
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
    .sort((a, b) => b.creadoEl.localeCompare(a.creadoEl));
  const respondidos = reportes.filter((r) => respuestas[r.id] && hidratado).length;

  return (
    <div className="space-y-6">
      <div className="max-w-md">
        <label htmlFor={`${id}-org`} className="text-sm font-semibold">
          Organización
        </label>
        <select
          id={`${id}-org`}
          value={org.id}
          onChange={(e) => setOrgId(e.target.value)}
          className="mt-2 block min-h-11 w-full rounded-xl border border-borde bg-white px-3 text-base"
        >
          {ORGANIZACIONES.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nombre}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-gris">
          Recibe reportes por {org.canalRespaldo === "whatsapp" ? "WhatsApp (canal de respaldo)" : "la herramienta web"}.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-start">
        <Tarjeta aria-labelledby="titulo-rutas-org">
          <h2 id="titulo-rutas-org" className="flex items-center gap-2 text-lg font-bold">
            <MapPin aria-hidden className="size-5 text-verde-700" />
            Rutas publicadas
          </h2>
          <ul className="mt-3 space-y-3">
            {rutas.map((r) => (
              <li key={r.id} className="rounded-xl bg-crema p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">Ruta {r.id}</span>
                  <Etiqueta>{ZONAS.find((z) => z.id === r.zonaId)?.nombre}</Etiqueta>
                </div>
                <p className="mt-1 text-sm">
                  {listaDias(r.dias).replace(/^./, (c) => c.toUpperCase())}, {textoVentana(r.ventana)}
                </p>
                <p className="text-sm text-gris">
                  {rango(r.cobertura.calle[0], r.cobertura.calle[1], "Calle")} · {rango(r.cobertura.carrera[0], r.cobertura.carrera[1], "Carrera")}
                </p>
                <p className="mt-1 text-xs text-gris">Verificada en campo el {fechaLarga(desdeIso(r.validadaEl))}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-gris">En producción, los cambios de horario se registran aquí y la UAESP los valida antes de publicarlos.</p>
        </Tarjeta>

        <Tarjeta aria-labelledby="titulo-reportes-org">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="titulo-reportes-org" className="flex items-center gap-2 text-lg font-bold">
              <Inbox aria-hidden className="size-5 text-verde-700" />
              Reportes recibidos
            </h2>
            <Etiqueta tono={reportes.length > 0 && respondidos === reportes.length ? "verde" : "amarillo"}>
              {respondidos} de {reportes.length} respondidos
            </Etiqueta>
          </div>
          <p className="mt-1 text-sm text-gris">Meta del proyecto (OE4): responder el 90 % en 72 horas o menos.</p>
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
      </div>
      <Nota>
        Los reportes marcados «Ejemplo» son ficticios. Los que hagas desde «¿No pasaron?» en este navegador aparecen aquí y puedes responderlos: la
        respuesta le llega al ciudadano en «Mis avisos».
      </Nota>
    </div>
  );
}

function ItemReporte({ reporte, respuesta }: { reporte: Reporte; respuesta?: string }) {
  const [texto, setTexto] = useState("");
  const [error, setError] = useState(false);
  const id = useId();
  return (
    <li className="rounded-xl bg-crema p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-sm font-semibold tracking-wide">{reporte.id}</span>
        <span className="flex gap-1.5">
          {reporte.demo && <Etiqueta tono="gris">Ejemplo</Etiqueta>}
          <Etiqueta tono={respuesta ? "verde" : "amarillo"}>{respuesta ? "Respondido" : "Pendiente"}</Etiqueta>
        </span>
      </div>
      <p className="mt-1 font-semibold">{MOTIVOS[reporte.motivo]}</p>
      <p className="text-sm text-gris">
        Ruta {reporte.rutaId} · {reporte.cuadraDescripcion} · recolección del {fechaLarga(desdeIso(reporte.fecha))}
      </p>
      {reporte.comentario && <p className="mt-1 text-sm">«{reporte.comentario}»</p>}
      {respuesta ? (
        <p className="mt-2 flex items-start gap-2 rounded-lg bg-white p-2 text-sm">
          <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-verde-700" />
          <span>
            <span className="font-semibold">Respuesta:</span> {respuesta}
          </span>
        </p>
      ) : (
        <form
          className="mt-2"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!texto.trim()) {
              setError(true);
              return;
            }
            responderReporte(reporte.id, texto);
          }}
        >
          <label htmlFor={`${id}-respuesta`} className="sr-only">
            Respuesta al reporte {reporte.id}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id={`${id}-respuesta`}
              value={texto}
              maxLength={280}
              onChange={(e) => {
                setTexto(e.target.value);
                setError(false);
              }}
              placeholder="Ej.: Mañana pasamos a las 6:00 a. m."
              aria-invalid={error}
              aria-describedby={error ? `${id}-error` : undefined}
              className="min-h-11 flex-1 rounded-xl border border-borde bg-white px-3 text-sm"
            />
            <Boton type="submit">
              <Send aria-hidden className="size-4" />
              Responder
            </Boton>
          </div>
          {error && (
            <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-rojo" role="alert">
              Escribe una respuesta antes de enviarla.
            </p>
          )}
        </form>
      )}
    </li>
  );
}
