import type { Metadata } from "next";
import { Suspense } from "react";
import { ConsultaDesdeEnlace } from "./consulta-desde-enlace";

export const metadata: Metadata = {
  title: "¿Cuándo saco el reciclaje?",
  description: "Consulta con tu dirección qué día y a qué hora pasa el reciclador por tu cuadra.",
};

export default function PaginaReciclaje() {
  return (
    <div className="mx-auto max-w-2xl has-[[data-resultado-amplio]]:max-w-none">
      <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight sm:text-4xl">¿Cuándo saco el reciclaje?</h1>
      <Suspense fallback={<p role="status" className="mt-5 text-gris">Cargando la consulta…</p>}>
        <ConsultaDesdeEnlace />
      </Suspense>
    </div>
  );
}
