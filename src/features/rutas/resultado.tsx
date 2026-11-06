"use client";

import Link from "next/link";
import { BellRing, CalendarCheck, CircleCheck, MapPin, Truck, TriangleAlert } from "lucide-react";
import { Boton, Etiqueta, Nota, Tarjeta } from "@/components/ui";
import { useAlmacen } from "@/lib/almacen";
import { PanelAviso } from "@/features/avisos/panel-aviso";
import { almacenIntereses, quitarInteres, registrarInteres } from "@/features/avisos/avisos";
import { PanelReporte } from "@/features/reportes/panel-reporte";
import { ZONAS } from "@/features/territorio/zonas";
import { RUTAS } from "./datos";
import type { HorarioCamion } from "./datos";
import type { ResultadoConsulta } from "./consulta";
import { desdeIso, enBogota, fechaCorta, fechaLarga, fechaRelativa, hora, iso, listaDias, textoVentana } from "./tiempo";

type ConDireccion = Exclude<ResultadoConsulta, { estado: "error-direccion" }>;

export function Resultado({ resultado, ahora }: { resultado: ConDireccion; ahora: Date }) {
  return (
    <div className="animar-entrada space-y-4">
      <Ubicacion resultado={resultado} />
      {resultado.estado === "con-ruta" && <ConRuta resultado={resultado} ahora={ahora} />}
      {resultado.estado === "sin-ruta" && <SinRuta resultado={resultado} />}
      {resultado.estado === "fuera-de-cobertura" && <FueraDeCobertura />}
    </div>
  );
}

function Ubicacion({ resultado }: { resultado: ConDireccion }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span className="flex items-center gap-1.5 font-semibold">
        <MapPin aria-hidden className="size-4 text-verde-700" />
        {resultado.direccion.texto}
      </span>
      {"zona" in resultado && <Etiqueta>{resultado.zona.nombre} (aprox.)</Etiqueta>}
      <span className="w-full text-gris">Tu cuadra: {resultado.cuadra.descripcion}</span>
    </div>
  );
}

function Camion({ camion }: { camion?: HorarioCamion }) {
  if (!camion) return null;
  return (
    <Tarjeta aria-labelledby="titulo-camion" className="bg-white">
      <h2 id="titulo-camion" className="flex items-center gap-2 font-bold">
        <Truck aria-hidden className="size-5 text-gris" />
        Camión de la basura (bolsa negra)
      </h2>
      <p className="mt-1 text-[0.95rem] text-gris">
        Pasa los <strong className="text-tinta">{listaDias(camion.dias)}</strong>, {camion.franja} No le entregues la bolsa blanca: el camión la lleva
        al relleno.
      </p>
    </Tarjeta>
  );
}

function ConRuta({ resultado, ahora }: { resultado: Extract<ConDireccion, { estado: "con-ruta" }>; ahora: Date }) {
  const hoy = enBogota(ahora).fecha;
  const { siguiente, rutas } = resultado;
  const relativa = fechaRelativa(siguiente.proxima, hoy);
  const esHoyOManana = relativa === "hoy" || relativa === "mañana";

  return (
    <div className="grid gap-4 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] @4xl:items-start">
      <div className="min-w-0 space-y-4">
        <section aria-labelledby="titulo-horario" className="rounded-tarjeta bg-verde-700 p-6 text-white shadow-tarjeta">
          <p className="flex items-center gap-2 text-sm font-semibold text-amarillo">
            <CalendarCheck aria-hidden className="size-4" />
            Próxima recolección de reciclaje
          </p>
          <h2 id="titulo-horario" className="mt-2 text-2xl font-bold leading-tight @lg:text-3xl">
            {esHoyOManana ? `${relativa[0].toUpperCase()}${relativa.slice(1)}, ${fechaLarga(siguiente.proxima)}` : fechaLarga(siguiente.proxima).replace(/^./, (c) => c.toUpperCase())}
          </h2>
          <p className="mt-1 text-lg">La ruta pasa {textoVentana(siguiente.ruta.ventana)}</p>
          <p className="mt-4 rounded-xl bg-white/10 p-3 text-[0.95rem]">
            Saca la bolsa blanca poco antes de las <strong>{hora(siguiente.ruta.ventana.desde)}</strong>, para que no quede horas en el andén.
          </p>
        </section>

        <Tarjeta aria-labelledby="titulo-rutas">
          <h2 id="titulo-rutas" className="font-bold">
            {rutas.length === 1 ? "Organización que pasa por tu cuadra" : `${rutas.length} organizaciones pasan por tu cuadra`}
          </h2>
          {rutas.length > 1 && (
            <p className="mt-1 text-sm text-gris">Las rutas no son exclusivas: puedes entregar el material a cualquiera de ellas.</p>
          )}
          <ul className="mt-3 divide-y divide-borde">
            {rutas.map(({ ruta, organizacion, proxima }) => (
              <li key={ruta.id} className="flex flex-col items-start gap-1 py-3 first:pt-0 last:pb-0 @xl:flex-row @xl:items-center @xl:justify-between @xl:gap-4">
                <div className="min-w-0">
                  <p className="font-semibold">{organizacion.nombre}</p>
                  <p className="text-sm text-gris">
                    {listaDias(ruta.dias).replace(/^./, (c) => c.toUpperCase())}, {textoVentana(ruta.ventana)}
                  </p>
                  <p className="text-xs text-gris">
                    Ruta {ruta.id} · horario verificado el {fechaLarga(desdeIso(ruta.validadaEl))}
                  </p>
                </div>
                <span className="shrink-0">
                  <Etiqueta tono={iso(proxima) === iso(siguiente.proxima) ? "amarillo" : "gris"}>Próxima: {fechaCorta(proxima, hoy)}</Etiqueta>
                </span>
              </li>
            ))}
          </ul>
        </Tarjeta>

        <Camion camion={resultado.camion} />
      </div>

      <div className="min-w-0 space-y-4">
        <PanelAviso cuadra={resultado.cuadra} zona={resultado.zona} rutas={rutas.map((r) => r.ruta)} ahora={ahora} />
        <PanelReporte cuadra={resultado.cuadra} zona={resultado.zona} rutas={rutas} ahora={ahora} />
      </div>
    </div>
  );
}

function SinRuta({ resultado }: { resultado: Extract<ConDireccion, { estado: "sin-ruta" }> }) {
  const intereses = useAlmacen(almacenIntereses);
  const registrado = intereses.some((i) => i.cuadraClave === resultado.cuadra.clave);
  const zonaConRutas = RUTAS.some((r) => r.zonaId === resultado.zona.id);

  return (
    <div className="space-y-4">
      <section aria-labelledby="titulo-sin-ruta" className="rounded-tarjeta bg-amarillo-50 p-6 shadow-tarjeta ring-1 ring-amarillo/60">
        <p className="flex items-center gap-2 text-sm font-semibold text-tinta">
          <TriangleAlert aria-hidden className="size-4" />
          Sin ruta registrada
        </p>
        <h2 id="titulo-sin-ruta" className="mt-2 text-2xl font-bold leading-tight">
          Todavía no hay una ruta de reciclaje registrada en tu cuadra
        </h2>
        <p className="mt-2 text-[0.95rem]">
          {zonaConRutas
            ? `En ${resultado.zona.nombre} ya hay rutas en otros sectores, pero ninguna organización ha registrado esta cuadra.`
            : `${resultado.zona.nombre} todavía no hace parte del piloto.`}{" "}
          No te mostramos un horario que no podemos verificar.
        </p>
        <div className="mt-4">
          {registrado ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="flex items-center gap-2 font-semibold text-verde-700" role="status">
                <CircleCheck aria-hidden className="size-5" />
                Te avisaremos cuando haya ruta
              </p>
              <Boton variante="sutil" onClick={() => quitarInteres(resultado.cuadra.clave)}>
                Ya no me avises
              </Boton>
            </div>
          ) : (
            <Boton
              onClick={() =>
                registrarInteres({ cuadraClave: resultado.cuadra.clave, cuadraDescripcion: resultado.cuadra.descripcion, zonaNombre: resultado.zona.nombre })
              }
            >
              <BellRing aria-hidden className="size-4" />
              Avísame cuando haya ruta
            </Boton>
          )}
        </div>
      </section>
      <Nota titulo="Mientras tanto">
        Guarda la bolsa blanca separada. Si un reciclador pasa por tu cuadra, entrégasela directamente y no al camión.
      </Nota>
      <Camion camion={resultado.camion} />
    </div>
  );
}

function FueraDeCobertura() {
  const pilotos = ZONAS.filter((z) => RUTAS.some((r) => r.zonaId === z.id)).map((z) => z.nombre);
  return (
    <section aria-labelledby="titulo-fuera" className="rounded-tarjeta bg-white p-6 shadow-tarjeta ring-1 ring-borde/60">
      <h2 id="titulo-fuera" className="text-xl font-bold">
        No podemos ubicar esa dirección en el prototipo
      </h2>
      <p className="mt-2 text-[0.95rem] text-gris">
        El prototipo solo conoce algunas zonas de la ciudad. Las localidades con rutas de prueba son: {pilotos.join(", ")}.
      </p>
      <p className="mt-3 text-[0.95rem]">
        Prueba con una de las direcciones de ejemplo o lee <Link href="/acerca" className="font-semibold text-verde-700 underline underline-offset-4">cómo funciona el prototipo</Link>.
      </p>
    </section>
  );
}
