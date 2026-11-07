"use client";

import { useSearchParams } from "next/navigation";
import { ConsultaReciclaje } from "@/features/rutas/consulta-reciclaje";
import { ejemploPorId } from "@/features/rutas/ejemplos";
import { useHidratado } from "@/lib/almacen";

/** El enlace acepta solo identificadores de ejemplos del catálogo. */
export function ConsultaDesdeEnlace() {
  const ejemplo = ejemploPorId(useSearchParams().get("ejemplo"));
  const hidratado = useHidratado();
  if (ejemplo && !hidratado) return <p role="status" className="mt-5 text-gris">Cargando el ejemplo…</p>;
  return <ConsultaReciclaje key={ejemplo?.id ?? "vacia"} direccionInicial={ejemplo?.direccion} />;
}
