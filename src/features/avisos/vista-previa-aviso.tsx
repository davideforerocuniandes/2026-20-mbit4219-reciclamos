"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { BellRing, X } from "lucide-react";

/**
 * Simula cómo llega la notificación push de la SuperApp la noche anterior.
 * Se dibuja en un portal sobre <body>: si quedara dentro de un contenedor con
 * `container-type` o `transform`, `position: fixed` se mediría contra ese
 * contenedor y no contra la pantalla.
 */
export function VistaPreviaAviso({ texto, onCerrar }: { texto: string; onCerrar: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onCerrar, 9000);
    const conEscape = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", conEscape);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", conEscape);
    };
  }, [onCerrar]);

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3" role="status" aria-live="polite">
      <div className="animar-entrada pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl bg-white/95 p-4 shadow-xl ring-1 ring-borde backdrop-blur">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-verde-700 text-white">
          <BellRing aria-hidden className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gris">SuperApp · Reciclamos · 9:00 p. m.</p>
          <p className="mt-0.5 font-semibold leading-snug">{texto}</p>
          <p className="mt-1 text-xs text-gris">Vista previa: así llega la notificación la noche anterior.</p>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          className="grid size-9 shrink-0 place-items-center rounded-full text-gris hover:bg-crema"
          aria-label="Cerrar vista previa"
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
