import Link from "next/link";
import { Info, Recycle } from "lucide-react";
import type { ReactNode } from "react";
import { EnlaceAcerca, NavegacionInferior, NavegacionLateral } from "./navegacion";

function Marca() {
  return (
    <Link href="/" className="flex min-h-11 min-w-0 items-center gap-2.5 rounded-lg">
      <span className="grid size-[40px] shrink-0 place-items-center rounded-xl bg-amarillo text-tinta">
        <Recycle aria-hidden className="size-[24px]" />
      </span>
      <span className="min-w-0 leading-tight wrap-anywhere">
        <span className="block font-bold">SuperApp</span>
        <span className="block text-sm text-gris">Maqueta · Reciclamos</span>
      </span>
    </Link>
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
      <p className="border-b-2 border-marca bg-acento px-4 py-1.5 text-center text-sm font-medium text-white">
        Prototipo académico · Datos ficticios
      </p>
      <div className="mx-auto flex w-full max-w-7xl flex-1">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-8 overflow-y-auto border-r border-borde bg-white/70 px-4 py-6 lg:flex">
          <Marca />
          <NavegacionLateral />
          <p className="mt-auto flex gap-2 text-xs text-gris">
            <Info aria-hidden className="size-4 shrink-0" />
            MBIT 4219 · Uniandes · Grupo 2 · 2026-20
          </p>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-borde bg-white px-4 py-2 lg:hidden">
            <Marca />
            <EnlaceAcerca />
          </header>
          <main id="contenido" tabIndex={-1} className="flex-1 px-4 pt-6 pb-[var(--espacio-navegacion)] sm:px-6 lg:px-10 lg:pt-10 lg:pb-12">
            {children}
          </main>
        </div>
      </div>
      <NavegacionInferior />
    </div>
  );
}
