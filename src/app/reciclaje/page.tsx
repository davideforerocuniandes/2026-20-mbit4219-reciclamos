import type { Metadata } from "next";
import { Suspense } from "react";
import { Cabecera } from "@/components/ui";
import { ConsultaDesdeEnlace } from "./consulta-desde-enlace";

export const metadata: Metadata = {
  title: "¿Cuándo saco el reciclaje?",
  description: "Consulta con tu dirección qué día y a qué hora pasa el reciclador por tu cuadra.",
};

export default function PaginaReciclaje() {
  return (
    <>
      <Cabecera
        antetitulo="Aseo · Reciclaje"
        titulo="¿Cuándo saco el reciclaje?"
        descripcion="Con tu dirección te decimos qué día y a qué hora pasa la ruta de reciclaje por tu cuadra. Mostramos todas las organizaciones habilitadas, sin escoger ninguna."
      />
      <Suspense fallback={<EsqueletoConsulta />}>
        <ConsultaDesdeEnlace />
      </Suspense>
    </>
  );
}

function EsqueletoConsulta() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="h-72 animate-pulse rounded-tarjeta bg-white/70" />
      <div className="hidden h-32 rounded-tarjeta border-2 border-dashed border-borde sm:block" />
    </div>
  );
}
