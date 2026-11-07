"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Building2, House, Info, Recycle } from "lucide-react";
import { cx } from "./ui";

const SECCIONES = [
  { href: "/", etiqueta: "Inicio", icono: House },
  { href: "/reciclaje", etiqueta: "Reciclaje", icono: Recycle },
  { href: "/mis-avisos", etiqueta: "Mis avisos", icono: Bell },
  { href: "/organizaciones", etiqueta: "Organizaciones", icono: Building2 },
  { href: "/acerca", etiqueta: "Acerca", icono: Info },
] as const;

export function NavegacionLateral() {
  const ruta = usePathname();
  return (
    <nav aria-label="Secciones" className="flex flex-col gap-1">
      {SECCIONES.map(({ href, etiqueta, icono: Icono }) => {
        const activa = ruta === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={activa ? "page" : undefined}
            className={cx(
              "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 font-medium wrap-anywhere",
              activa ? "bg-acento text-white" : "text-tinta hover:bg-acento-suave hover:text-acento",
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

export function NavegacionInferior() {
  const ruta = usePathname();
  return (
    <nav aria-label="Secciones" className="fixed inset-x-0 bottom-0 z-30 border-t border-borde bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-4 px-1">
        {SECCIONES.slice(0, 4).map(({ href, etiqueta, icono: Icono }) => {
          const activa = ruta === href;
          return (
            <li key={href} className="min-w-0">
              <Link
                href={href}
                aria-current={activa ? "page" : undefined}
                className={cx(
                  "flex h-full min-h-14 flex-col items-center justify-start gap-0.5 rounded-lg px-0.5 py-1.5 text-center text-[0.6875rem] font-semibold wrap-anywhere focus-visible:-outline-offset-3 sm:text-xs",
                  activa ? "text-acento" : "text-gris",
                )}
              >
                <span className={cx("rounded-full px-2 py-1 sm:px-3", activa && "bg-acento text-white")}>
                  <Icono aria-hidden className="size-5 shrink-0" />
                </span>
                <span className="max-w-full">{etiqueta}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function EnlaceAcerca() {
  const activa = usePathname() === "/acerca";
  return (
    <Link
      href="/acerca"
      aria-label="Acerca"
      aria-current={activa ? "page" : undefined}
      className={cx(
        "grid min-h-11 min-w-11 shrink-0 place-items-center rounded-full",
        activa ? "bg-acento text-white" : "text-acento hover:bg-acento-suave",
      )}
    >
      <Info aria-hidden className="size-5" />
    </Link>
  );
}
