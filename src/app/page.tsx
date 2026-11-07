import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bell, Building2, CalendarCheck, Info, MapPin, MessageSquareWarning, Recycle } from "lucide-react";
import { EJEMPLOS } from "@/features/rutas/ejemplos";
import { ResumenAviso } from "@/features/avisos/resumen-aviso";
import panoramicaBogota from "./bogota-desde-monserrate.webp";

const SERVICIOS = [
  { href: "/mis-avisos", titulo: "Mis avisos y reportes", texto: "Revisa tus avisos de prueba y el estado de tus reportes.", icono: Bell },
  { href: "/organizaciones", titulo: "Para organizaciones", texto: "Consulta rutas de prueba y practica cómo responder reportes.", icono: Building2 },
  { href: "/acerca", titulo: "Sobre el prototipo", texto: "Conoce los datos de prueba, la cobertura y cómo cuidamos tu dirección.", icono: Info },
] as const;

const PASOS = [
  { icono: MapPin, titulo: "Escribe tu dirección", texto: "Escríbela como aparece en tu recibo. La consulta usa tu dirección en este navegador." },
  { icono: CalendarCheck, titulo: "Mira día y hora", texto: "Consulta el próximo paso y los horarios de todas las rutas de prueba para tu cuadra." },
  { icono: Bell, titulo: "Activa el aviso", texto: "Prueba cómo se vería el aviso de las 9:00 p. m. del día anterior." },
  { icono: MessageSquareWarning, titulo: "¿No pasaron?", texto: "Guarda un reporte de prueba y consulta su respuesta en esta maqueta." },
] as const;

export default function Inicio() {
  return (
    <div className="@container space-y-8 wrap-anywhere">
      <section className="relative isolate overflow-hidden rounded-tarjeta bg-slate-950 text-white shadow-tarjeta">
        <Image
          src={panoramicaBogota}
          alt=""
          fill
          preload
          sizes="(min-width: 1280px) 944px, (min-width: 1024px) calc(100vw - 336px), calc(100vw - 32px)"
          className="object-cover object-[68%_45%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-slate-950/75 via-slate-950/70 via-75% to-slate-950/30 @min-[52rem]:bg-linear-to-r @min-[52rem]:via-66%"
        />
        <div className="relative grid grid-cols-1 gap-6 p-5 sm:p-8 @min-[52rem]:grid-cols-[minmax(0,1fr)_auto] @min-[52rem]:items-center">
          <div>
            <p className="text-sm font-semibold text-amarillo">Hola, buenas</p>
            <h1 className="mt-1 text-3xl font-bold leading-tight sm:text-4xl">Bogotá ya sabe cuándo sacar la basura. Ahora, el reciclaje.</h1>
            <p className="mt-3 max-w-xl text-white/90">
              Consulta qué día y a qué hora sacar la bolsa blanca para entregarla a quien recoge el reciclaje.
            </p>
          </div>
          <Link
            href="/reciclaje"
            className="flex min-h-14 min-w-0 items-center gap-3 rounded-2xl bg-amarillo p-4 text-tinta shadow-lg hover:bg-amarillo-50 focus-visible:outline-white @min-[52rem]:w-[19rem]"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-acento text-white">
              <Recycle aria-hidden className="size-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold leading-tight">¿Cuándo saco el reciclaje?</span>
              <span className="block text-sm font-medium">Consulta tu horario</span>
            </span>
            <ArrowRight aria-hidden className="size-5 shrink-0" />
          </Link>
        </div>
      </section>

      <ResumenAviso />

      <section aria-labelledby="titulo-como">
        <h2 id="titulo-como" className="text-xl font-bold">
          Cómo funciona
        </h2>
        <ol className="mt-4 grid grid-cols-1 gap-3 @lg:grid-cols-2 @min-[52rem]:grid-cols-4">
          {PASOS.map(({ icono: Icono, titulo, texto }, i) => (
            <li key={titulo} className="flex gap-3 rounded-tarjeta bg-white p-4 shadow-tarjeta ring-1 ring-borde/60">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-acento-suave text-acento">
                <Icono aria-hidden className="size-5" />
              </span>
              <span>
                <span className="block font-semibold">
                  <span className="sr-only">Paso {i + 1}: </span>
                  {titulo}
                </span>
                <span className="block text-sm text-gris">{texto}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="titulo-ejemplos">
        <h2 id="titulo-ejemplos" className="text-xl font-bold">
          Prueba con una dirección de ejemplo
        </h2>
        <p className="mt-1 text-sm text-gris">Los datos son ficticios. Cada ejemplo muestra un caso distinto.</p>
        <ul className="mt-4 grid grid-cols-1 gap-3 @lg:grid-cols-2 @min-[52rem]:grid-cols-3">
          {EJEMPLOS.map((e) => (
            <li key={e.id}>
              <Link
                href={`/reciclaje?ejemplo=${e.id}`}
                className="flex min-h-16 items-center justify-between gap-3 rounded-tarjeta bg-white px-4 py-3 shadow-tarjeta ring-1 ring-borde/60 hover:ring-acento"
              >
                <span className="min-w-0">
                  <span className="block font-semibold">{e.direccion}</span>
                  <span className="block text-sm text-gris">
                    {e.etiqueta} · {e.caso}
                  </span>
                </span>
                <ArrowRight aria-hidden className="size-4 shrink-0 text-acento" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-servicios">
        <h2 id="titulo-servicios" className="text-xl font-bold">
          Más en esta maqueta
        </h2>
        <ul className="mt-4 grid grid-cols-1 gap-3 @xl:grid-cols-3">
          {SERVICIOS.map(({ href, titulo, texto, icono: Icono }) => (
            <li key={href}>
              <Link href={href} className="flex h-full gap-3 rounded-tarjeta bg-white p-4 shadow-tarjeta ring-1 ring-borde/60 hover:ring-acento">
                <Icono aria-hidden className="mt-0.5 size-5 shrink-0 text-acento" />
                <span>
                  <span className="block font-semibold">{titulo}</span>
                  <span className="block text-sm text-gris">{texto}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
