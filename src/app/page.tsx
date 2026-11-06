import Link from "next/link";
import { ArrowRight, Bell, Building2, CalendarCheck, Info, MapPin, MessageSquareWarning, Recycle } from "lucide-react";
import { EJEMPLOS } from "@/features/rutas/ejemplos";
import { ResumenAviso } from "@/features/avisos/resumen-aviso";

const SERVICIOS = [
  { href: "/mis-avisos", titulo: "Mis avisos y reportes", texto: "Tu aviso activo y el estado de tus reportes.", icono: Bell },
  { href: "/organizaciones", titulo: "Para organizaciones", texto: "Rutas publicadas y reportes por responder.", icono: Building2 },
  { href: "/acerca", titulo: "Sobre el prototipo", texto: "Qué es real, qué es simulado y por qué.", icono: Info },
] as const;

const PASOS = [
  { icono: MapPin, titulo: "Escribe tu dirección", texto: "Ubicamos tu cuadra. La dirección no se guarda." },
  { icono: CalendarCheck, titulo: "Mira día y hora", texto: "De todas las organizaciones habilitadas que pasan por ahí." },
  { icono: Bell, titulo: "Activa el aviso", texto: "Te avisamos a las 9:00 p. m. del día anterior." },
  { icono: MessageSquareWarning, titulo: "¿No pasaron?", texto: "Lo reportas y la organización responde." },
] as const;

export default function Inicio() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-tarjeta bg-verde-700 text-white shadow-tarjeta">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-amarillo">Hola, buenas</p>
            <h1 className="mt-1 text-3xl font-bold leading-tight sm:text-4xl">Bogotá ya sabe cuándo sacar la basura. Ahora, el reciclaje.</h1>
            <p className="mt-3 max-w-xl text-white/90">
              Con tu dirección te decimos qué día y a qué hora sacar la bolsa blanca para que llegue a un reciclador y no al camión.
            </p>
          </div>
          <Link
            href="/reciclaje"
            className="group flex items-center gap-4 rounded-2xl bg-amarillo p-5 text-verde-900 shadow-lg transition-transform hover:-translate-y-0.5 lg:w-80"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-verde-900 text-amarillo">
              <Recycle aria-hidden className="size-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold leading-tight">¿Cuándo saco el reciclaje?</span>
              <span className="block text-sm font-medium">Consulta tu horario</span>
            </span>
            <ArrowRight aria-hidden className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <ResumenAviso />

      <section aria-labelledby="titulo-como">
        <h2 id="titulo-como" className="text-xl font-bold">
          Cómo funciona
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PASOS.map(({ icono: Icono, titulo, texto }, i) => (
            <li key={titulo} className="flex gap-3 rounded-tarjeta bg-white p-4 shadow-tarjeta ring-1 ring-borde/60">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-verde-50 text-verde-700">
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
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {EJEMPLOS.map((e) => (
            <li key={e.id}>
              <Link
                href={`/reciclaje?ejemplo=${e.id}`}
                className="flex min-h-16 items-center justify-between gap-3 rounded-tarjeta bg-white px-4 py-3 shadow-tarjeta ring-1 ring-borde/60 hover:ring-verde-700"
              >
                <span className="min-w-0">
                  <span className="block font-semibold">{e.direccion}</span>
                  <span className="block text-sm text-gris">
                    {e.etiqueta} · {e.caso}
                  </span>
                </span>
                <ArrowRight aria-hidden className="size-4 shrink-0 text-verde-700" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-servicios">
        <h2 id="titulo-servicios" className="text-xl font-bold">
          Más en esta maqueta
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {SERVICIOS.map(({ href, titulo, texto, icono: Icono }) => (
            <li key={href}>
              <Link href={href} className="flex h-full gap-3 rounded-tarjeta bg-white p-4 shadow-tarjeta ring-1 ring-borde/60 hover:ring-verde-700">
                <Icono aria-hidden className="mt-0.5 size-5 shrink-0 text-verde-700" />
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
