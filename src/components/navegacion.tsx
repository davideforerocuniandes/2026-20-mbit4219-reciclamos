"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Building2, House, Info, Recycle } from "lucide-react";
import { cx } from "./ui";

export const SECCIONES = [
  { href: "/", etiqueta: "Inicio", icono: House },
  { href: "/reciclaje", etiqueta: "Reciclaje", icono: Recycle },
  { href: "/mis-avisos", etiqueta: "Mis avisos", icono: Bell },
  { href: "/organizaciones", etiqueta: "Organizaciones", icono: Building2 },
  { href: "/acerca", etiqueta: "Acerca", icono: Info },
] as const;

function activa(ruta: string, href: string): boolean {
  return href === "/" ? ruta === "/" : ruta === href || ruta.startsWith(`${href}/`);
}

/** Barra lateral (escritorio). */
export function NavegacionLateral() {
  const ruta = usePathname();
  return (
    <nav aria-label="Secciones" className="flex flex-col gap-1">
      {SECCIONES.map(({ href, etiqueta, icono: Icono }) => {
        const esActiva = activa(ruta, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={esActiva ? "page" : undefined}
            className={cx(
              "flex min-h-11 items-center gap-3 rounded-xl px-3 font-medium transition-colors",
              esActiva ? "bg-verde-700 text-white" : "text-tinta hover:bg-verde-50",
            )}
          >
            <Icono aria-hidden className="size-5 shrink-0" />
            {etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}

/** Barra inferior (teléfono): las cuatro secciones principales. */
export function NavegacionInferior() {
  const ruta = usePathname();
  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-borde bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {SECCIONES.slice(0, 4).map(({ href, etiqueta, icono: Icono }) => {
          const esActiva = activa(ruta, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={esActiva ? "page" : undefined}
                className={cx(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-semibold",
                  esActiva ? "text-verde-700" : "text-gris",
                )}
              >
                <span className={cx("rounded-full px-4 py-1", esActiva && "bg-verde-50")}>
                  <Icono aria-hidden className="size-5" />
                </span>
                {etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
