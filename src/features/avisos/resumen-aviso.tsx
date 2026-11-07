"use client";

import Link from "next/link";
import { BellRing } from "lucide-react";
import { useAlmacen, useHidratado } from "@/lib/almacen";
import { RUTAS } from "@/features/rutas/datos";
import { proximoAviso } from "@/features/rutas/consulta";
import { enBogota, fechaRelativa, hora } from "@/features/rutas/tiempo";
import { almacenAviso } from "./avisos";

/** Tarjeta de inicio con el próximo aviso, si el ciudadano activó uno. */
export function ResumenAviso() {
  const hidratado = useHidratado();
  const aviso = useAlmacen(almacenAviso);
  if (!hidratado || !aviso) return null;

  const ahora = new Date();
  const rutas = RUTAS.filter((r) => aviso.rutaIds.includes(r.id));
  const siguiente = proximoAviso(rutas, ahora);
  const m = siguiente ? enBogota(siguiente.instante) : null;

  return (
    <Link
      href="/mis-avisos"
      className="flex min-h-11 items-center gap-4 rounded-tarjeta bg-white p-4 shadow-tarjeta ring-1 ring-borde/60 hover:ring-acento"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-acento-suave text-acento">
        <BellRing aria-hidden className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold">Tu aviso de prueba está activo</span>
        <span className="block text-sm text-gris">
          {m ? `El aviso aparecería ${fechaRelativa(m.fecha, enBogota(ahora).fecha)} a las ${hora(m.minutos)}` : "Aviso simulado la noche anterior"} ·{" "}
          {aviso.cuadraDescripcion}
        </span>
      </span>
    </Link>
  );
}
