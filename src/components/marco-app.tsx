import Link from "next/link";
import { Info, Recycle } from "lucide-react";
import type { ReactNode } from "react";
import { NavegacionInferior, NavegacionLateral } from "./navegacion";

function Marca() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-lg">
      <span className="grid size-9 place-items-center rounded-xl bg-amarillo text-verde-900">
        <Recycle aria-hidden className="size-5" strokeWidth={2.5} />
      </span>
      <span className="leading-tight">
        <span className="block text-[0.95rem] font-bold text-tinta">SuperApp</span>
        <span className="block text-xs font-medium text-gris">Maqueta · Reciclamos</span>
      </span>
    </Link>
  );
}

/** Franja que aclara, en todas las pantallas, que es un prototipo con datos ficticios. */
function FranjaPrototipo() {
  return (
    <div className="bg-verde-900 px-4 py-1.5 text-center text-xs font-medium text-white">
      Prototipo académico · datos ficticios · no es un servicio oficial de la Alcaldía de Bogotá
    </div>
  );
}

export function MarcoApp({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold"
      >
        Saltar al contenido
      </a>
      <FranjaPrototipo />
      <div className="mx-auto flex w-full max-w-7xl flex-1">
        {/* Escritorio: barra lateral fija. */}
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-8 border-r border-borde bg-white/60 px-4 py-6 lg:flex">
          <Marca />
          <NavegacionLateral />
          <p className="mt-auto flex gap-2 text-xs text-gris">
            <Info aria-hidden className="size-4 shrink-0" />
            MBIT 4219 · Uniandes · Grupo 2 · 2026-20
          </p>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Teléfono: barra superior. */}
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-borde bg-crema/95 px-4 py-3 backdrop-blur lg:hidden">
            <Marca />
            <Link href="/acerca" className="grid size-11 place-items-center rounded-full text-verde-700 hover:bg-verde-50" aria-label="Acerca del prototipo">
              <Info aria-hidden className="size-5" />
            </Link>
          </header>

          <main id="contenido" className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
            {children}
          </main>
        </div>
      </div>
      <NavegacionInferior />
    </div>
  );
}
