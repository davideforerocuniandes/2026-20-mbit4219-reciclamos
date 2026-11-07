import type { Metadata } from "next";
import { ChevronDown, LockKeyhole, MapPin, Users } from "lucide-react";
import { Cabecera, EnlaceBoton, Tarjeta } from "@/components/ui";
import { RUTAS } from "@/features/rutas/datos";
import { ZONAS } from "@/features/territorio/zonas";

export const metadata: Metadata = { title: "Sobre el prototipo" };

const REPOSITORIO = "https://github.com/davideforerocuniandes/2026-20-mbit4219-reciclamos";

export default function Acerca() {
  const zonasConRutas = ZONAS.filter((zona) => RUTAS.some((ruta) => ruta.zonaId === zona.id));

  return (
    <>
      <Cabecera
        antetitulo="Propuesta para la Bogotá SuperApp"
        titulo="Sobre el prototipo"
        descripcion="Reciclamos es un proyecto académico para mostrar cuándo sacar la bolsa blanca y entregarla a quien recoge el reciclaje."
      />
      <div className="@container space-y-4">
        <section aria-labelledby="titulo-probar" className="rounded-tarjeta bg-amarillo-50 p-5 wrap-anywhere sm:p-6">
          <h2 id="titulo-probar" className="text-lg font-bold">Qué puedes probar</h2>
          <p className="mt-2 max-w-2xl text-gris">
            Consulta un horario, mira cómo se vería el aviso de la noche anterior y practica cómo guardar y responder un reporte.
            Las rutas, los horarios y las organizaciones son ficticios.
          </p>
          <EnlaceBoton href="/reciclaje?ejemplo=bosa" variante="destacada" className="mt-4">Probar con un ejemplo</EnlaceBoton>
        </section>

        <div className="grid grid-cols-1 items-start gap-4 @min-[44rem]:grid-cols-2">
          <Tarjeta aria-labelledby="titulo-privacidad">
            <h2 id="titulo-privacidad" className="flex items-center gap-2 text-lg font-bold">
              <LockKeyhole aria-hidden className="size-5 shrink-0 text-acento" /> Tu dirección y tus datos
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-gris">
              <li>Usamos tu dirección en este navegador para calcular un horario de prueba.</li>
              <li>Si eliges usar tu ubicación, la app estima tu zona en este navegador. Las coordenadas quedan fuera de los datos guardados.</li>
              <li>Los avisos y reportes guardan la cuadra en lugar de la dirección completa.</li>
              <li>Puedes cancelar el aviso y borrar lo guardado desde «Mis avisos».</li>
            </ul>
            <EnlaceBoton href="/mis-avisos#titulo-tus-datos" variante="sutil" className="mt-2 underline underline-offset-4">Gestionar mis datos</EnlaceBoton>
          </Tarjeta>

          <Tarjeta aria-labelledby="titulo-cobertura">
            <h2 id="titulo-cobertura" className="flex items-center gap-2 text-lg font-bold">
              <MapPin aria-hidden className="size-5 shrink-0 text-acento" /> Cobertura de prueba
            </h2>
            <p className="mt-3 text-gris">
              El catálogo tiene ejemplos para {zonasConRutas.map((zona) => zona.nombre).join(", ")}.
              Si la dirección queda fuera de esas zonas, puedes ver un horario de referencia de una zona cercana.
            </p>
            <p className="mt-2 text-gris">Un ejemplo de Kennedy permite probar el caso de una cuadra sin ruta.</p>
          </Tarjeta>
        </div>

        <details className="group rounded-tarjeta border border-borde bg-white">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-tarjeta px-4 py-3 font-semibold text-acento [&::-webkit-details-marker]:hidden">
            Cómo se conectaría con la SuperApp
            <ChevronDown aria-hidden className="ml-auto size-5 shrink-0 group-open:rotate-180" />
          </summary>
          <ul className="space-y-2 border-t border-borde px-6 py-4 pl-9 text-gris">
            <li className="list-disc">IDECA serviría para ubicar las direcciones.</li>
            <li className="list-disc">Los horarios vendrían de las rutas registradas y validadas.</li>
            <li className="list-disc">La SuperApp enviaría los avisos y conectaría los reportes con las organizaciones.</li>
          </ul>
        </details>

        <Tarjeta aria-labelledby="titulo-equipo">
          <h2 id="titulo-equipo" className="flex items-center gap-2 text-lg font-bold">
            <Users aria-hidden className="size-5 shrink-0 text-acento" /> Equipo
          </h2>
          <p className="mt-2 text-gris">MBIT 4219 · Universidad de los Andes · Grupo 2 · 2026-20</p>
          <p className="mt-2">
            David Alejandro Abril Medina, Paula Andrea Cañon Camelo, David Elias Forero Cobos y Maria Paulina Ocampo Peralta.
            Profesor: Javier Orlando Torres Páez.
          </p>
          <a href={REPOSITORIO} className="mt-1 inline-flex min-h-11 items-center font-semibold text-acento underline underline-offset-4">Código fuente en GitHub</a>
          <p className="mt-3 border-t border-borde pt-3 text-sm text-gris">
            Foto de Inicio:{" "}
            <a href="https://commons.wikimedia.org/wiki/File:Dan-gold-bogota-city-night-montserrate.jpg" className="font-semibold text-acento underline underline-offset-4">
              Bogotá desde Monserrate, de Danielcgold
            </a>
            {" "}·{" "}
            <a href="https://creativecommons.org/licenses/by-sa/4.0/" className="font-semibold text-acento underline underline-offset-4">CC BY-SA 4.0</a>.
            Versión optimizada en WebP y recortada para el banner.
          </p>
        </Tarjeta>
      </div>
    </>
  );
}
