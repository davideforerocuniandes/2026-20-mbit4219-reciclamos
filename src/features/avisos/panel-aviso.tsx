"use client";

import { useId, useRef, useState } from "react";
import { Bell, CircleCheck } from "lucide-react";
import { Boton, EnlaceBoton, Nota, Tarjeta } from "@/components/ui";
import { useAlmacen } from "@/lib/almacen";
import type { Cuadra } from "@/features/direcciones/direccion";
import type { Zona } from "@/features/territorio/zonas";
import type { Ruta } from "@/features/rutas/datos";
import { proximoAviso } from "@/features/rutas/consulta";
import { enBogota, fechaRelativa, hora, textoVentana } from "@/features/rutas/tiempo";
import { activarAviso, almacenAviso } from "./avisos";
import { VistaPreviaAviso } from "./vista-previa-aviso";

export function mensajeAviso(ruta: Ruta): string {
  return `Mañana pasa el reciclaje por tu cuadra, ${textoVentana(ruta.ventana)} Saca la bolsa blanca.`;
}

export function PanelAviso({ cuadra, zona, rutas, ahora }: { cuadra: Cuadra; zona: Zona; rutas: Ruta[]; ahora: Date }) {
  const aviso = useAlmacen(almacenAviso);
  const [acepta, setAcepta] = useState(false);
  const idConsentimiento = useId();
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const siguiente = proximoAviso(rutas, ahora);
  const hoy = enBogota(ahora).fecha;
  const activoAqui = aviso?.cuadraClave === cuadra.clave;
  const otroActivo = aviso && !activoAqui ? aviso : null;

  return (
    <Tarjeta aria-labelledby="titulo-aviso">
      <h2 ref={tituloRef} tabIndex={-1} id="titulo-aviso" className="flex items-center gap-2 text-lg font-bold">
        <Bell aria-hidden className="size-5 shrink-0 text-acento" />
        Aviso la noche anterior
      </h2>
      {activoAqui ? (
        <div className="mt-3 space-y-3">
          <p role="status" className="flex items-start gap-2 font-semibold text-exito">
            <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0" /> Aviso de prueba activo
          </p>
          {siguiente && (
            <>
              <p className="text-gris">
                El aviso se mostraría {fechaRelativa(enBogota(siguiente.instante).fecha, hoy)} a las {hora(enBogota(siguiente.instante).minutos)}
              </p>
              <VistaPreviaAviso texto={mensajeAviso(siguiente.ruta)} />
            </>
          )}
          <EnlaceBoton variante="sutil" href="/mis-avisos" className="underline underline-offset-4">Administrar mi aviso</EnlaceBoton>
        </div>
      ) : (
        <>
          <p className="mt-1 text-gris">Prueba el aviso de las <strong className="text-tinta">9:00 p. m.</strong> del día anterior.</p>
          <details className="mt-3">
            <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center rounded-xl border border-acento px-3 py-2 font-semibold text-acento hover:bg-acento-suave [&::-webkit-details-marker]:hidden">
              Configurar aviso de prueba
            </summary>
            <form
              className="mt-3 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!acepta) return;
                tituloRef.current?.focus();
                activarAviso({ cuadraClave: cuadra.clave, cuadraDescripcion: cuadra.descripcion, zonaNombre: zona.nombre, rutaIds: rutas.map((r) => r.id) });
                setAcepta(false);
              }}
            >
              <p className="text-sm text-gris">La notificación se simula en pantalla y el aviso se guarda en este navegador.</p>
              {otroActivo && <Nota tono="alerta">Este aviso reemplaza el que tienes para {otroActivo.cuadraDescripcion}.</Nota>}
              <label htmlFor={idConsentimiento} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-borde bg-fondo p-3">
                <input id={idConsentimiento} type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-1 size-5 shrink-0 accent-acento" />
                <span>
                  <span className="block font-semibold">Autorizo guardar solo mi cuadra para el aviso</span>
                  <span className="mt-1 block text-sm text-gris">{cuadra.descripcion}. Puedes cancelar el aviso cuando quieras.</span>
                </span>
              </label>
              <Boton type="submit" disabled={!acepta}>Activar aviso de prueba</Boton>
            </form>
          </details>
        </>
      )}
    </Tarjeta>
  );
}
