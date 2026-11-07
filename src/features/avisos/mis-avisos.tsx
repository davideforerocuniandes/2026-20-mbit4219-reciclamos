"use client";

import { useRef, useState } from "react";
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
  return (
    <div className="@container space-y-4">
      {hidratado ? (
        <div className="grid grid-cols-1 items-start gap-4 @min-[48rem]:grid-cols-2">
          <div className="min-w-0 space-y-4">
            <AvisoActivo />
            <Intereses />
          </div>
          <MisReportes />
        </div>
      ) : <p role="status" className="text-gris">Cargando tus avisos y reportes…</p>}
      <BorrarDatos />
    </div>
  );
}

function AvisoActivo() {
  const aviso = useAlmacen(almacenAviso);
  const tituloRef = useRef<HTMLHeadingElement>(null);

  if (!aviso) {
    return (
      <Tarjeta aria-labelledby="titulo-aviso-activo">
        <h2 ref={tituloRef} tabIndex={-1} id="titulo-aviso-activo" className="flex items-center gap-2 text-lg font-bold">
          <Bell aria-hidden className="size-5 text-acento" />
          Aviso de la noche anterior
        </h2>
        <p className="mt-2 text-gris">No tienes un aviso de prueba activo. Consulta tu dirección y elige «Configurar aviso de prueba».</p>
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
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 ref={tituloRef} tabIndex={-1} id="titulo-aviso-activo" className="flex items-center gap-2 text-lg font-bold">
          <Bell aria-hidden className="size-5 text-acento" />
          Aviso de prueba activo
        </h2>
        <Etiqueta tono="exito">
          <CircleCheck aria-hidden className="size-3.5" />
          Activo
        </Etiqueta>
      </div>
      {m && siguiente ? (
        <dl className="mt-4 rounded-xl bg-amarillo-50 p-4">
          <dt className="text-sm font-semibold text-gris">Cuándo aparecería el aviso</dt>
          <dd className="mt-1 text-lg font-bold">
            {fechaRelativa(m.fecha, hoy).replace(/^./, (c) => c.toUpperCase())} a las {hora(m.minutos)}, para la recolección del{" "}
            {fechaLarga(siguiente.recoleccion)}
          </dd>
        </dl>
      ) : <p className="mt-3 text-gris">Este aviso quedó guardado. Puedes consultar de nuevo para revisar los horarios del catálogo.</p>}
      <p className="mt-3 text-gris"><strong className="text-tinta">Cuadra:</strong> {aviso.cuadraDescripcion} · {aviso.zonaNombre}</p>
      {rutas.length > 0 && (
        <details className="mt-3 rounded-xl border border-borde bg-white">
          <summary className="min-h-11 cursor-pointer rounded-xl px-3 py-2 font-semibold text-acento">Ver rutas del aviso</summary>
          <ul className="space-y-2 border-t border-borde px-3 py-2 text-gris">
            {rutas.map((r) => (
              <li key={r.id}><strong className="text-tinta">{organizacion(r.organizacionId).nombre}</strong> · {listaDias(r.dias)}, {textoVentana(r.ventana)}</li>
            ))}
          </ul>
        </details>
      )}
      <div className="mt-4 space-y-2">
        {siguiente && <VistaPreviaAviso texto={mensajeAviso(siguiente.ruta)} />}
        <Boton variante="peligro" onClick={() => { cancelarAviso(); requestAnimationFrame(() => tituloRef.current?.focus()); }}>
          <BellOff aria-hidden className="size-4 shrink-0" />
          Cancelar aviso
        </Boton>
      </div>
    </Tarjeta>
  );
}

function Intereses() {
  const intereses = useAlmacen(almacenIntereses);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const [mensaje, setMensaje] = useState("");

  return (
    <Tarjeta aria-labelledby="titulo-intereses">
      <h2 ref={tituloRef} tabIndex={-1} id="titulo-intereses" className="flex items-center gap-2 text-lg font-bold">
        <Clock aria-hidden className="size-5 shrink-0 text-acento" />
        Solicitudes de aviso
      </h2>
      {intereses.length === 0 ? (
        <p className="mt-2 text-gris">Aún no tienes solicitudes. Puedes guardar una si tu cuadra no tiene una ruta de prueba.</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-gris">Solicitudes de prueba guardadas en este navegador.</p>
          <ul className="mt-3 space-y-2">
            {intereses.map((i) => (
              <li key={i.cuadraClave} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-fondo p-3">
                <div className="min-w-0">
                  <p className="font-semibold">{i.cuadraDescripcion}</p>
                  <p className="text-sm text-gris">{i.zonaNombre}</p>
                </div>
                <Boton
                  variante="sutil" aria-label={`Quitar solicitud para ${i.cuadraDescripcion}`}
                  onClick={() => {
                    tituloRef.current?.focus();
                    quitarInteres(i.cuadraClave);
                    setMensaje(`Solicitud retirada para ${i.cuadraDescripcion}.`);
                  }}
                >
                  Quitar
                </Boton>
              </li>
            ))}
          </ul>
        </>
      )}
      <p role="status" className={mensaje ? "mt-2 text-sm text-exito" : "sr-only"}>{mensaje}</p>
    </Tarjeta>
  );
}

function MisReportes() {
  const reportes = useAlmacen(almacenReportes);
  const respuestas = useAlmacen(almacenRespuestas);
  return (
    <Tarjeta aria-labelledby="titulo-mis-reportes">
      <h2 id="titulo-mis-reportes" className="flex items-center gap-2 text-lg font-bold">
        <Inbox aria-hidden className="size-5 text-acento" />
        Mis reportes
      </h2>
      {reportes.length === 0 ? (
        <p className="mt-2 text-gris">Aún no tienes reportes. Consulta tu dirección y elige «¿No pasaron?» en el resultado para probar.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {reportes.map((r) => {
            const respuesta = respuestas[r.id];
            return (
              <li key={r.id} className="rounded-xl bg-fondo p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold tracking-wide">{r.id}</span>
                  <Etiqueta tono={respuesta ? "exito" : "amarillo"}>{respuesta ? "Respondido" : "Guardado"}</Etiqueta>
                </div>
                <p className="mt-1 font-semibold">{MOTIVOS[r.motivo]}</p>
                <p className="text-sm text-gris">
                  {organizacion(r.organizacionId).nombre} · recolección del {fechaLarga(desdeIso(r.fecha))}
                </p>
                {r.comentario && <p className="mt-1 text-sm">«{r.comentario}»</p>}
                {respuesta && (
                  <p className="mt-2 rounded-lg bg-white p-2 text-sm">
                    <span className="font-semibold">Respuesta de prueba:</span> {respuesta.texto}
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
  const [borrado, setBorrado] = useState(false);
  const borrarRef = useRef<HTMLButtonElement>(null);
  const conservarRef = useRef<HTMLButtonElement>(null);

  function cerrarConfirmacion() {
    setConfirmando(false);
    requestAnimationFrame(() => borrarRef.current?.focus());
  }
  return (
    <section aria-labelledby="titulo-tus-datos">
      <Nota>
        <h2 id="titulo-tus-datos" className="mb-1 text-lg font-bold">Tus datos</h2>
        <p>
          Los avisos, las solicitudes y los reportes se guardan en este navegador. La dirección que escribes para consultar queda fuera de esos datos.
        </p>
        {confirmando ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">¿Borrar avisos, solicitudes, reportes y respuestas de prueba?</span>
            <Boton
              variante="peligro"
              onClick={() => {
                almacenAviso.escribir(null);
                almacenIntereses.escribir([]);
                almacenReportes.escribir([]);
                almacenRespuestas.escribir({});
                setBorrado(true);
                cerrarConfirmacion();
              }}
            >
              Sí, borrar
            </Boton>
            <Boton ref={conservarRef} variante="sutil" onClick={cerrarConfirmacion}>
              Conservar datos
            </Boton>
          </div>
        ) : (
          <Boton variante="sutil" className="mt-2 -ml-2" ref={borrarRef} onClick={() => {
              setBorrado(false);
              setConfirmando(true);
              requestAnimationFrame(() => conservarRef.current?.focus());
            }}>
            <Trash2 aria-hidden className="size-4" />
            Borrar mis datos
          </Boton>
        )}
        <p role="status" className={borrado ? "mt-2 font-semibold text-exito" : "sr-only"}>{borrado && "Datos de la prueba borrados."}</p>
      </Nota>
    </section>
  );
}
