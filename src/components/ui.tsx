import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/** Une clases condicionales sin dependencias. */
export function cx(...clases: Array<string | false | null | undefined>): string {
  return clases.filter(Boolean).join(" ");
}

type Variante = "primaria" | "destacada" | "secundaria" | "sutil" | "peligro";

const VARIANTES: Record<Variante, string> = {
  primaria: "bg-acento text-white hover:bg-[#83101d] disabled:opacity-50",
  destacada: "bg-amarillo text-tinta hover:bg-amarillo-50 ring-1 ring-inset ring-tinta/50",
  secundaria: "bg-white text-acento ring-1 ring-inset ring-acento hover:bg-acento-suave disabled:opacity-50",
  sutil: "bg-transparent text-acento hover:bg-acento-suave disabled:opacity-50",
  peligro: "bg-white text-rojo ring-1 ring-inset ring-rojo/60 hover:bg-rojo-50 disabled:opacity-50",
};

const BASE_BOTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold transition-colors disabled:cursor-not-allowed";

export function Boton({ variante = "primaria", className, ...props }: ComponentProps<"button"> & { variante?: Variante }) {
  return <button type="button" className={cx(BASE_BOTON, VARIANTES[variante], className)} {...props} />;
}

export function EnlaceBoton({ variante = "primaria", className, ...props }: ComponentProps<typeof Link> & { variante?: Variante }) {
  return <Link className={cx(BASE_BOTON, VARIANTES[variante], className)} {...props} />;
}

export function Tarjeta({ className, ...props }: ComponentProps<"section">) {
  return <section className={cx("min-w-0 rounded-tarjeta bg-white p-5 wrap-anywhere shadow-tarjeta ring-1 ring-borde/60", className)} {...props} />;
}

export function Etiqueta({ tono = "gris", children }: { tono?: "exito" | "amarillo" | "gris" | "rojo"; children: ReactNode }) {
  const tonos = {
    exito: "bg-exito-suave text-exito",
    amarillo: "bg-amarillo-50 text-tinta",
    gris: "bg-fondo text-gris ring-1 ring-inset ring-borde",
    rojo: "bg-rojo-50 text-rojo",
  } as const;
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", tonos[tono])}>{children}</span>
  );
}

export function Cabecera({ antetitulo, titulo, descripcion }: { antetitulo?: string; titulo: string; descripcion?: ReactNode }) {
  return (
    <header className="mb-6">
      {antetitulo && <p className="text-sm font-semibold uppercase tracking-wide text-acento">{antetitulo}</p>}
      <h1 className="mt-1 text-2xl font-bold leading-tight text-tinta sm:text-3xl">{titulo}</h1>
      {descripcion && <div className="mt-2 max-w-2xl text-gris">{descripcion}</div>}
    </header>
  );
}

export function Nota({ tono = "info", titulo, children }: { tono?: "info" | "alerta" | "error"; titulo?: string; children: ReactNode }) {
  const tonos = {
    info: "bg-fondo ring-borde",
    alerta: "bg-amarillo-50 ring-amarillo/50",
    error: "bg-rojo-50 ring-rojo/30",
  } as const;
  return (
    <div className={cx("rounded-xl p-4 ring-1 ring-inset", tonos[tono])} role={tono === "error" ? "alert" : undefined}>
      {titulo && <p className="font-semibold">{titulo}</p>}
      <div className={cx("text-base text-tinta", titulo && "mt-1")}>{children}</div>
    </div>
  );
}
