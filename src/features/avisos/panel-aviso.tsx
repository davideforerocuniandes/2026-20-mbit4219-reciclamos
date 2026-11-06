"use client";

import { useCallback, useId, useState } from "react";
import { Bell, BellOff, CircleCheck, ShieldCheck } from "lucide-react";
import { Boton, Nota, Tarjeta } from "@/components/ui";
import { useAlmacen } from "@/lib/almacen";
import type { Cuadra } from "@/features/direcciones/direccion";
import type { Zona } from "@/features/territorio/zonas";
import type { Ruta } from "@/features/rutas/datos";
import { proximoAviso } from "@/features/rutas/consulta";
import { enBogota, fechaRelativa, hora, textoVentana } from "@/features/rutas/tiempo";
import { activarAviso, almacenAviso, cancelarAviso } from "./avisos";
import { VistaPreviaAviso } from "./vista-previa-aviso";

export function mensajeAviso(ruta: Ruta): string {
  return `Mañana pasa el reciclaje por tu cuadra, ${textoVentana(ruta.ventana)} Saca la bolsa blanca.`;
}

export function PanelAviso({ cuadra, zona, rutas, ahora }: { cuadra: Cuadra; zona: Zona; rutas: Ruta[]; ahora: Date }) {
  const aviso = useAlmacen(almacenAviso);
  const [acepta, setAcepta] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState(false);
  const cerrarVista = useCallback(() => setVistaPrevia(false), []);
  const idConsentimiento = useId();

  const siguiente = proximoAviso(rutas, ahora);
  const hoy = enBogota(ahora).fecha;
  const activoAqui = aviso?.cuadraClave === cuadra.clave;
  const otroActivo = aviso && !activoAqui ? aviso : null;

  return (
    <Tarjeta aria-labelledby="titulo-aviso">
      <h2 id="titulo-aviso" className="flex items-center gap-2 text-lg font-bold">
        <Bell aria-hidden className="size-5 text-verde-700" />
        Aviso la noche anterior
      </h2>

      {activoAqui ? (
        <div className="mt-3 space-y-3">
          <Nota titulo="Aviso activo">
            <span className="flex items-start gap-2">
              <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-verde-700" />
              <span>
                {siguiente
                  ? `Te avisamos ${fechaRelativa(enBogota(siguiente.instante).fecha, hoy)} a las ${hora(enBogota(siguiente.instante).minutos)}`
                  : "Te avisamos la noche anterior a cada recolección."}
              </span>
            </span>
          </Nota>
          <div className="flex flex-wrap gap-2">
            {siguiente && (
              <Boton variante="secundaria" onClick={() => setVistaPrevia(true)}>
                Ver cómo llega el aviso
              </Boton>
            )}
            <Boton variante="peligro" onClick={cancelarAviso}>
              <BellOff aria-hidden className="size-4" />
              Cancelar aviso
            </Boton>
          </div>
        </div>
      ) : (
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!acepta) return;
            activarAviso({ cuadraClave: cuadra.clave, cuadraDescripcion: cuadra.descripcion, zonaNombre: zona.nombre, rutaIds: rutas.map((r) => r.id) });
            setAcepta(false);
          }}
        >
          <p className="text-[0.95rem] text-gris">
            Te llega una notificación a las <strong className="text-tinta">9:00 p. m.</strong> del día anterior a cada recolección, para que no
            dependas del camión aunque cambien tus turnos.
          </p>
          {otroActivo && (
            <Nota tono="alerta">
              Ya tienes un aviso para {otroActivo.cuadraDescripcion}. Si activas este, lo reemplaza.
            </Nota>
          )}
          <div className="flex items-start gap-3 rounded-xl bg-crema p-3">
            <input
              id={idConsentimiento}
              type="checkbox"
              checked={acepta}
              onChange={(e) => setAcepta(e.target.checked)}
              className="mt-1 size-5 shrink-0 accent-verde-700"
            />
            <label htmlFor={idConsentimiento} className="text-sm">
              <span className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck aria-hidden className="size-4 text-verde-700" />
                Autorizo guardar solo mi cuadra para el aviso
              </span>
              <span className="mt-0.5 block text-gris">
                Se guarda «{cuadra.descripcion}», no tu dirección ni tu placa. Puedes cancelarlo cuando quieras (Ley 1581 de 2012).
              </span>
            </label>
          </div>
          <Boton type="submit" disabled={!acepta} className="w-full sm:w-auto">
            <Bell aria-hidden className="size-4" />
            Activar aviso
          </Boton>
        </form>
      )}

      {vistaPrevia && siguiente && <VistaPreviaAviso texto={mensajeAviso(siguiente.ruta)} onCerrar={cerrarVista} />}
    </Tarjeta>
  );
}
