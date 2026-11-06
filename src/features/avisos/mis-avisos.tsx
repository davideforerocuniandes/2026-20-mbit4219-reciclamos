"use client";

import { useCallback, useState } from "react";
import { Bell, BellOff, CircleCheck, Clock, Inbox, Trash2 } from "lucide-react";
import { Boton, EnlaceBoton, Etiqueta, Nota, Tarjeta } from "@/components/ui";
import { useAlmacen, useHidratado } from "@/lib/almacen";
import { RUTAS, organizacion } from "@/features/rutas/datos";
import { proximoAviso } from "@/features/rutas/consulta";
import { desdeIso, enBogota, fechaLarga, fechaRelativa, hora, listaDias, textoVentana } from "@/features/rutas/tiempo";
import { MOTIVOS, almacenReportes, almacenRespuestas } from "@/features/reportes/reportes";
import { almacenAviso, almacenIntereses, cancelarAviso, quitarInteres } from "./avisos";
import { mensajeAviso } from "./panel-aviso";
import { VistaPreviaAviso } from "./vista-previa-aviso";

export function MisAvisos() {
  const hidratado = useHidratado();
  if (!hidratado) {
    return (
      <div className="grid gap-4 lg:grid-cols-2" aria-hidden>
        <div className="h-48 animate-pulse rounded-tarjeta bg-white/70" />
        <div className="h-48 animate-pulse rounded-tarjeta bg-white/70" />
      </div>
    );
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <div className="space-y-4">
        <AvisoActivo />
        <Intereses />
      </div>
      <div className="space-y-4">
        <MisReportes />
        <BorrarDatos />
      </div>
    </div>
  );
}

function AvisoActivo() {
  const aviso = useAlmacen(almacenAviso);
  const [vista, setVista] = useState(false);
  const cerrar = useCallback(() => setVista(false), []);

  if (!aviso) {
    return (
      <Tarjeta aria-labelledby="titulo-aviso-activo">
        <h2 id="titulo-aviso-activo" className="flex items-center gap-2 text-lg font-bold">
          <Bell aria-hidden className="size-5 text-verde-700" />
          Aviso de la noche anterior
        </h2>
        <p className="mt-2 text-gris">No tienes un aviso activo. Consulta tu dirección y actívalo para que no se te pase la ruta.</p>
        <EnlaceBoton href="/reciclaje" className="mt-4">
          Consultar mi horario
        </EnlaceBoton>
      </Tarjeta>
    );
  }

  const ahora = new Date();
  const rutas = RUTAS.filter((r) => aviso.rutaIds.includes(r.id));
  const siguiente = proximoAviso(rutas, ahora);
  const m = siguiente ? enBogota(siguiente.instante) : null;
  const hoy = enBogota(ahora).fecha;

  return (
    <Tarjeta aria-labelledby="titulo-aviso-activo">
      <div className="flex items-start justify-between gap-3">
        <h2 id="titulo-aviso-activo" className="flex items-center gap-2 text-lg font-bold">
          <Bell aria-hidden className="size-5 text-verde-700" />
          Aviso activo
        </h2>
        <Etiqueta>
          <CircleCheck aria-hidden className="size-3.5" />
          Activo
        </Etiqueta>
      </div>
      <dl className="mt-3 space-y-2 text-[0.95rem]">
        <div>
          <dt className="text-sm text-gris">Cuadra</dt>
          <dd className="font-semibold">
            {aviso.cuadraDescripcion} · {aviso.zonaNombre}
          </dd>
        </div>
        {m && siguiente && (
          <div>
            <dt className="text-sm text-gris">Próximo aviso</dt>
            <dd className="font-semibold">
              {fechaRelativa(m.fecha, hoy).replace(/^./, (c) => c.toUpperCase())} a las {hora(m.minutos)}, para la recolección del{" "}
              {fechaLarga(siguiente.recoleccion)}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-sm text-gris">Rutas</dt>
          <dd>
            <ul className="space-y-1">
              {rutas.map((r) => (
                <li key={r.id}>
                  {organizacion(r.organizacionId).nombre}: {listaDias(r.dias)}, {textoVentana(r.ventana)}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        {siguiente && (
          <Boton variante="secundaria" onClick={() => setVista(true)}>
            Ver cómo llega el aviso
          </Boton>
        )}
        <Boton variante="peligro" onClick={cancelarAviso}>
          <BellOff aria-hidden className="size-4" />
          Cancelar aviso
        </Boton>
      </div>
      {vista && siguiente && <VistaPreviaAviso texto={mensajeAviso(siguiente.ruta)} onCerrar={cerrar} />}
    </Tarjeta>
  );
}

function Intereses() {
  const intereses = useAlmacen(almacenIntereses);
  if (intereses.length === 0) return null;
  return (
    <Tarjeta aria-labelledby="titulo-intereses">
      <h2 id="titulo-intereses" className="flex items-center gap-2 text-lg font-bold">
        <Clock aria-hidden className="size-5 text-verde-700" />
        Esperando ruta
      </h2>
      <p className="mt-1 text-sm text-gris">Te avisamos cuando una organización registre ruta en estas cuadras.</p>
      <ul className="mt-3 divide-y divide-borde">
        {intereses.map((i) => (
          <li key={i.cuadraClave} className="flex items-center justify-between gap-3 py-2">
            <span className="min-w-0 text-[0.95rem]">
              {i.cuadraDescripcion} <span className="text-gris">· {i.zonaNombre}</span>
            </span>
            <Boton variante="sutil" onClick={() => quitarInteres(i.cuadraClave)} aria-label={`Quitar ${i.cuadraDescripcion}`}>
              Quitar
            </Boton>
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}

function MisReportes() {
  const reportes = useAlmacen(almacenReportes);
  const respuestas = useAlmacen(almacenRespuestas);
  return (
    <Tarjeta aria-labelledby="titulo-mis-reportes">
      <h2 id="titulo-mis-reportes" className="flex items-center gap-2 text-lg font-bold">
        <Inbox aria-hidden className="size-5 text-verde-700" />
        Mis reportes
      </h2>
      {reportes.length === 0 ? (
        <p className="mt-2 text-gris">Aún no has hecho reportes. Si la ruta no pasa, repórtalo desde el resultado de tu consulta.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {reportes.map((r) => {
            const respuesta = respuestas[r.id];
            return (
              <li key={r.id} className="rounded-xl bg-crema p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold tracking-wide">{r.id}</span>
                  <Etiqueta tono={respuesta ? "verde" : "amarillo"}>{respuesta ? "Respondido" : "Enviado"}</Etiqueta>
                </div>
                <p className="mt-1 font-semibold">{MOTIVOS[r.motivo]}</p>
                <p className="text-sm text-gris">
                  {organizacion(r.organizacionId).nombre} · recolección del {fechaLarga(desdeIso(r.fecha))}
                </p>
                {r.comentario && <p className="mt-1 text-sm">«{r.comentario}»</p>}
                {respuesta && (
                  <p className="mt-2 rounded-lg bg-white p-2 text-sm">
                    <span className="font-semibold">Respuesta de la organización:</span> {respuesta.texto}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Tarjeta>
  );
}

function BorrarDatos() {
  const [confirmando, setConfirmando] = useState(false);
  return (
    <Nota titulo="Tus datos">
      <p>
        En este prototipo todo se guarda solo en este navegador: tu cuadra (si activaste el aviso) y tus reportes. Nunca tu dirección.
      </p>
      {confirmando ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">¿Borrar aviso, cuadras en espera y reportes?</span>
          <Boton
            variante="peligro"
            onClick={() => {
              almacenAviso.escribir(null);
              almacenIntereses.escribir([]);
              almacenReportes.escribir([]);
              almacenRespuestas.escribir({});
              setConfirmando(false);
            }}
          >
            Sí, borrar
          </Boton>
          <Boton variante="sutil" onClick={() => setConfirmando(false)}>
            No
          </Boton>
        </div>
      ) : (
        <Boton variante="sutil" className="mt-2 -ml-2" onClick={() => setConfirmando(true)}>
          <Trash2 aria-hidden className="size-4" />
          Borrar mis datos
        </Boton>
      )}
    </Nota>
  );
}
