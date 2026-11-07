"use client";

import { Bell, CalendarDays, ChevronDown, CircleCheck, MapPin, Recycle, Truck, TriangleAlert } from "lucide-react";
import { Boton, Etiqueta, Nota, Tarjeta, cx } from "@/components/ui";
import { useAlmacen } from "@/lib/almacen";
import { PanelAviso } from "@/features/avisos/panel-aviso";
import { almacenIntereses, quitarInteres, registrarInteres } from "@/features/avisos/avisos";
import { PanelReporte } from "@/features/reportes/panel-reporte";
import type { HorarioCamion } from "./datos";
import type { ResultadoConsulta, RutaEnCuadra } from "./consulta";
import { desdeIso, enBogota, fechaLarga, fechaRelativa, hora, listaDias, textoVentana } from "./tiempo";

type ConDireccion = Exclude<ResultadoConsulta, { estado: "error-direccion" }>;

export function Resultado({ resultado, ahora, desdeUbicacion, onCambiar, onEjemplos }: {
  resultado: ConDireccion;
  ahora: Date;
  desdeUbicacion: boolean;
  onCambiar: () => void;
  onEjemplos: () => void;
}) {
  const hayAcciones = resultado.estado === "con-ruta" && !resultado.zonaCercana;

  return (
    <div className="@container space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border border-borde bg-white px-4 py-2">
        <div className="flex min-w-0 items-start gap-2">
          <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-acento" />
          <div className="min-w-0">
            <p className="font-semibold wrap-anywhere">{resultado.direccion.texto}</p>
            {!desdeUbicacion && (
              <p className="text-sm text-gris">
                {resultado.zonaCercana ? `Zona de referencia: ${resultado.zona.nombre}` : `Tu cuadra: ${resultado.cuadra.descripcion}`}
              </p>
            )}
          </div>
        </div>
        <Boton variante="sutil" className="px-2 underline underline-offset-4" onClick={onCambiar}>
          {desdeUbicacion ? "Escribir mi dirección" : "Cambiar dirección"}
        </Boton>
      </div>

      <div className={cx("grid grid-cols-1 items-start gap-4", hayAcciones && "@min-[52rem]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]")}>
        <div className="min-w-0 space-y-4">
          {resultado.estado === "con-ruta" ? (
            <Horario resultado={resultado} ahora={ahora} />
          ) : (
            <Tarjeta aria-labelledby="titulo-sin-ruta">
              <h2 id="titulo-sin-ruta" className="flex items-start gap-2 text-xl font-bold">
                <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-acento" />
                {resultado.zonaCercana ? "Sin horario de referencia para esta zona" : "Esta cuadra no tiene una ruta de prueba"}
              </h2>
              <p className="mt-2 text-gris">El catálogo del prototipo tiene cobertura limitada.</p>
            </Tarjeta>
          )}

          {resultado.estado === "con-ruta" && <Rutas rutas={resultado.rutas} referencia={resultado.zonaCercana} />}

          {resultado.zonaCercana && (
            <Nota titulo={desdeUbicacion ? "Horario de referencia" : "Prueba una dirección del catálogo"}>
              <p>
                {desdeUbicacion
                  ? "Escribe tu dirección para consultar por cuadra y probar los avisos o reportes."
                  : `El prototipo usa ${resultado.zona.nombre} como referencia. Para ensayar avisos y reportes, elige una dirección de ejemplo.`}
              </p>
              <Boton variante="sutil" className="mt-1 px-2 underline underline-offset-4" onClick={onEjemplos}>Probar con un ejemplo</Boton>
            </Nota>
          )}

          {!resultado.zonaCercana && resultado.estado === "sin-ruta" && <Solicitud resultado={resultado} />}
          {resultado.camion && <Camion camion={resultado.camion} />}
        </div>

        {hayAcciones && (
          <div className="min-w-0 space-y-4">
            <PanelAviso cuadra={resultado.cuadra} zona={resultado.zona} rutas={resultado.rutas.map((r) => r.ruta)} ahora={ahora} />
            <PanelReporte cuadra={resultado.cuadra} zona={resultado.zona} rutas={resultado.rutas} ahora={ahora} />
          </div>
        )}
      </div>
    </div>
  );
}

function Horario({ resultado, ahora }: { resultado: Extract<ConDireccion, { estado: "con-ruta" }>; ahora: Date }) {
  const { fecha: hoy, minutos } = enBogota(ahora);
  const { proxima, ruta } = resultado.siguiente;
  const relativa = fechaRelativa(proxima, hoy);
  const fecha = relativa === "hoy" || relativa === "mañana" ? `${relativa}, ${fechaLarga(proxima)}` : fechaLarga(proxima);
  const enCurso = relativa === "hoy" && minutos >= ruta.ventana.desde;

  return (
    <section aria-labelledby="titulo-horario" className="rounded-tarjeta bg-amarillo p-5 text-tinta sm:p-7">
      <p id="tipo-horario" className="flex items-center gap-2 text-sm font-semibold">
        <CalendarDays aria-hidden className="size-5 shrink-0" />
        {resultado.zonaCercana ? "Horario de ejemplo de una zona cercana" : "Próxima recolección de reciclaje · horario de prueba"}
      </p>
      <h2 id="titulo-horario" className="mt-2 text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
        {fecha[0].toUpperCase() + fecha.slice(1)}
      </h2>
      <p id="franja-horario" className="mt-1 text-xl font-semibold">La ruta pasa {textoVentana(ruta.ventana)}</p>
      {!resultado.zonaCercana && (
        <p className="mt-4 rounded-xl bg-white/75 p-3">
          {enCurso ? "La ruta puede estar pasando. Si la ves, entrega la bolsa blanca directamente a la persona que recoge el reciclaje." : (
            <>Saca la bolsa blanca poco antes de las <strong>{hora(ruta.ventana.desde)}</strong> Entrégala a quien recoge el reciclaje.</>
          )}
        </p>
      )}
    </section>
  );
}

function Rutas({ rutas, referencia }: { rutas: RutaEnCuadra[]; referencia: boolean }) {
  const titulo = referencia ? "Rutas de referencia" : rutas.length === 1
    ? "Organización que pasa por tu cuadra"
    : "Organizaciones que pasan por tu cuadra";

  return (
    <Tarjeta aria-labelledby="titulo-rutas">
      <h2 id="titulo-rutas" className="flex items-start gap-2 text-lg font-bold">
        <Recycle aria-hidden className="mt-0.5 size-5 shrink-0 text-acento" />
        {titulo}
      </h2>
      {!referencia && rutas.length > 1 && (
        <p className="mt-2 text-sm text-gris">Puedes entregar la bolsa blanca a cualquiera de estas organizaciones.</p>
      )}
      <ul className="mt-3 divide-y divide-borde">
        {rutas.map(({ ruta, organizacion, proxima }) => (
          <li key={ruta.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <h3 className="text-lg font-semibold">{organizacion.nombre}</h3>
              <Etiqueta tono="amarillo">Próxima: {fechaLarga(proxima)}</Etiqueta>
            </div>
            <p className="mt-1">
              <span className="font-semibold">Pasa los {listaDias(ruta.dias)}</span>, {textoVentana(ruta.ventana)}
            </p>
            <p className="mt-1 text-sm text-gris">
              Ruta {ruta.id} · Validación simulada: {fechaLarga(desdeIso(ruta.validadaEl))}
            </p>
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}

function Camion({ camion }: { camion: HorarioCamion }) {
  return (
    <details className="group rounded-tarjeta border border-borde bg-white">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-tarjeta px-4 py-3 font-semibold text-tinta [&::-webkit-details-marker]:hidden">
        <Truck aria-hidden className="size-5 shrink-0 text-gris" />
        Basura · bolsa negra
        <ChevronDown aria-hidden className="ml-auto size-5 shrink-0 group-open:rotate-180" />
      </summary>
      <div className="border-t border-borde px-4 py-3 text-gris">
        <p>Horario de prueba del camión. Pasa los <strong className="text-tinta">{listaDias(camion.dias)}</strong>, {camion.franja}</p>
        <p className="mt-2">Reserva la bolsa blanca para quien recoge el reciclaje.</p>
      </div>
    </details>
  );
}

function Solicitud({ resultado }: { resultado: Extract<ConDireccion, { estado: "sin-ruta" }> }) {
  const intereses = useAlmacen(almacenIntereses);
  const { cuadra, zona } = resultado;
  const registrado = intereses.some((i) => i.cuadraClave === cuadra.clave);

  return (
    <Tarjeta aria-labelledby="titulo-solicitud">
      <h2 id="titulo-solicitud" className="font-bold">Aviso cuando haya ruta</h2>
      <p className="mt-1 text-gris">Puedes ensayar la solicitud con tu cuadra. Se guarda en este navegador como parte de la prueba.</p>
      <p role="status" className={registrado ? "mt-3 flex items-center gap-2 font-semibold text-exito" : "sr-only"}>
        {registrado && <><CircleCheck aria-hidden className="size-5 shrink-0" /> Solicitud de prueba guardada</>}
      </p>
      <Boton
        variante="secundaria"
        className="mt-3"
        onClick={() => {
          if (registrado) quitarInteres(cuadra.clave);
          else registrarInteres({ cuadraClave: cuadra.clave, cuadraDescripcion: cuadra.descripcion, zonaNombre: zona.nombre });
        }}
      >
        <Bell aria-hidden className="size-4 shrink-0" />
        {registrado ? "Quitar solicitud" : "Guardar solicitud de prueba"}
      </Boton>
    </Tarjeta>
  );
}
