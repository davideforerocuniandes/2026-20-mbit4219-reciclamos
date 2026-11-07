import { BellRing, ChevronDown } from "lucide-react";

export function VistaPreviaAviso({ texto }: { texto: string }) {
  return (
    <details className="group rounded-xl border border-borde bg-white">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-acento [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">Ver vista previa del aviso</span>
        <span className="hidden group-open:inline">Cerrar vista previa</span>
        <ChevronDown aria-hidden className="ml-auto size-4 shrink-0 group-open:rotate-180" />
      </summary>
      <div className="flex items-start gap-3 border-t border-borde bg-fondo p-3">
        <BellRing aria-hidden className="mt-0.5 size-5 shrink-0 text-acento" />
        <div>
          <p className="text-sm text-gris">Reciclamos · Vista previa de las 9:00 p. m.</p>
          <p className="mt-1 font-semibold">{texto}</p>
        </div>
      </div>
    </details>
  );
}
