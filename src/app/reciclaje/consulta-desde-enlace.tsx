"use client";

import { useSearchParams } from "next/navigation";
import { ConsultaReciclaje } from "@/features/rutas/consulta-reciclaje";
import { ejemploPorId } from "@/features/rutas/ejemplos";

/**
 * Los enlaces de la página de inicio abren una dirección de ejemplo con
 * `?ejemplo=<id>`. La URL lleva solo el identificador del ejemplo: nunca una
 * dirección real, porque las URL quedan en el historial y en los registros.
 */
export function ConsultaDesdeEnlace() {
  const ejemplo = ejemploPorId(useSearchParams().get("ejemplo"));
  return <ConsultaReciclaje key={ejemplo?.id ?? "vacia"} direccionInicial={ejemplo?.direccion} />;
}
