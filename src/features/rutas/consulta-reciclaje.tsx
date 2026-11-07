"use client";

import { useId, useRef, useState } from "react";
import { LocateFixed, MapPin, Search } from "lucide-react";
import { Boton, cx } from "@/components/ui";
import { leerDireccion } from "@/features/direcciones/direccion";
import { enBogota as dentroDeBogota, zonaMasCercana } from "@/features/territorio/zonas";
import { consultar, consultarPunto, direccionAproximada, type ResultadoConsulta } from "./consulta";
import { EJEMPLOS } from "./ejemplos";
import { Resultado } from "./resultado";

interface Consulta {
  resultado: ResultadoConsulta;
  ahora: Date;
  /** Cambia en cada consulta para reiniciar los paneles del resultado. */
  n: number;
}

const MENSAJE_ERROR: Record<string, string> = {
  vacia: "Escribe tu dirección para consultar.",
  "fuera-de-rango": "Esa dirección no parece estar en Bogotá. Revisa los números de la calle y la carrera.",
};

export function ConsultaReciclaje({ direccionInicial }: { direccionInicial?: string }) {
  const [texto, setTexto] = useState(direccionInicial ?? "");
  const [consulta, setConsulta] = useState<Consulta | null>(() =>
    direccionInicial ? { resultado: consultar(direccionInicial, new Date()), ahora: new Date(), n: 0 } : null,
  );
  const [ubicando, setUbicando] = useState(false);
  const [errorUbicacion, setErrorUbicacion] = useState<string | null>(null);
  const resultadoRef = useRef<HTMLDivElement>(null);
  const campoRef = useRef<HTMLInputElement>(null);
  const id = useId();

  function mostrar(resultado: ResultadoConsulta) {
    const ahora = new Date();
    setConsulta((previa) => ({ resultado, ahora, n: (previa?.n ?? 0) + 1 }));
    setErrorUbicacion(null);
    if (resultado.estado === "error-direccion") {
      campoRef.current?.focus();
    } else {
      // Mueve el foco al resultado para lectores de pantalla y lo trae a la vista en teléfono.
      requestAnimationFrame(() => {
        resultadoRef.current?.focus({ preventScroll: true });
        resultadoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  function buscar(valor: string) {
    setTexto(valor);
    mostrar(consultar(valor, new Date()));
  }

  function usarUbicacion() {
    if (!("geolocation" in navigator)) {
      setErrorUbicacion("Tu navegador no permite compartir la ubicación. Escribe tu dirección.");
      return;
    }
    setUbicando(true);
    setErrorUbicacion(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUbicando(false);
        if (!dentroDeBogota(coords.latitude, coords.longitude)) {
          setErrorUbicacion("Tu ubicación está fuera de Bogotá. Escribe una dirección de la ciudad.");
          return;
        }
        const zona = zonaMasCercana(coords.latitude, coords.longitude);
        const direccion = direccionAproximada(zona);
        setTexto("");
        mostrar(consultarPunto(direccion, new Date()));
      },
      (error) => {
        setUbicando(false);
        setErrorUbicacion(
          error.code === error.PERMISSION_DENIED
            ? "No diste permiso para usar tu ubicación. Puedes escribir tu dirección."
            : "No pudimos obtener tu ubicación. Escribe tu dirección.",
        );
      },
      { timeout: 10_000, maximumAge: 60_000 },
    );
  }

  const error = consulta?.resultado.estado === "error-direccion" ? consulta.resultado.error : null;
  const mensajeError = error ? (error.tipo === "formato" ? error.detalle : MENSAJE_ERROR[error.tipo]) : null;
  const vistaPrevia = texto.trim() ? leerDireccion(texto) : null;

  return (
    <div className="space-y-6">
      <section aria-labelledby={`${id}-titulo`} className="@container rounded-tarjeta bg-white p-5 shadow-tarjeta ring-1 ring-borde/60 sm:p-6">
        <h2 id={`${id}-titulo`} className="text-lg font-bold">
          ¿Dónde vives?
        </h2>
        <form
          className="mt-3"
          role="search"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            buscar(texto);
          }}
        >
          <label htmlFor={`${id}-direccion`} className="text-sm font-semibold">
            Dirección
          </label>
          <div className="mt-2 flex flex-col gap-2 @2xl:flex-row">
            <div className="relative min-w-0 flex-1">
              <MapPin aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gris" />
              <input
                ref={campoRef}
                id={`${id}-direccion`}
                name="direccion"
                type="text"
                inputMode="text"
                autoComplete="street-address"
                enterKeyHint="search"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Calle 65 Sur # 80-12"
                aria-invalid={Boolean(mensajeError)}
                aria-describedby={`${id}-ayuda${mensajeError ? ` ${id}-error` : ""}`}
                className={cx(
                  "block min-h-12 w-full rounded-xl border bg-white py-3 pl-11 pr-3 text-base",
                  mensajeError ? "border-rojo" : "border-borde",
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-2 @md:grid-cols-2 @2xl:flex">
              <Boton type="submit" className="min-h-12">
                <Search aria-hidden className="size-4" />
                Consultar
              </Boton>
              <Boton variante="secundaria" onClick={usarUbicacion} disabled={ubicando} className="min-h-12">
                <LocateFixed aria-hidden className="size-4" />
                {ubicando ? "Ubicando…" : "Usar mi ubicación"}
              </Boton>
            </div>
          </div>
          <p id={`${id}-ayuda`} className="mt-2 text-sm text-gris">
            Como aparece en el recibo de servicios. No la guardamos ni la enviamos a ningún lado.
            {vistaPrevia?.ok && vistaPrevia.direccion.texto !== texto.trim() && (
              <> Leemos: <strong className="text-tinta">{vistaPrevia.direccion.texto}</strong>.</>
            )}
          </p>
          {mensajeError && (
            <p id={`${id}-error`} role="alert" className="mt-2 text-sm font-semibold text-rojo">
              {mensajeError}
            </p>
          )}
          {errorUbicacion && (
            <p role="alert" className="mt-2 text-sm font-semibold text-rojo">
              {errorUbicacion}
            </p>
          )}
        </form>

        <div className="mt-5 border-t border-borde pt-4">
          <p className="text-sm font-semibold">Prueba con estas direcciones</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {EJEMPLOS.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => buscar(e.direccion)}
                  className="min-h-11 rounded-full bg-crema px-3 py-1.5 text-left text-sm ring-1 ring-inset ring-borde hover:bg-verde-50"
                >
                  <span className="font-semibold">{e.etiqueta}</span> <span className="text-gris">· {e.caso}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-gris">
            En el prototipo la cuadra se estima con la nomenclatura. En producción la ubica el geocodificador de IDECA, el mismo que usa Chatico.
          </p>
        </div>
      </section>

      <div ref={resultadoRef} tabIndex={-1} aria-live="polite" className="@container min-w-0 scroll-mt-20 outline-none">
        {consulta && consulta.resultado.estado !== "error-direccion" ? (
          <Resultado key={consulta.n} resultado={consulta.resultado} ahora={consulta.ahora} />
        ) : (
          <EstadoInicial />
        )}
      </div>
    </div>
  );
}

function EstadoInicial() {
  return (
    <div className="hidden rounded-tarjeta border-2 border-dashed border-borde p-8 text-center text-gris sm:block">
      <p className="text-lg font-semibold text-tinta">Tu horario aparecerá aquí</p>
      <p className="mt-1">Escribe tu dirección o elige una de prueba. Te diremos qué día y a qué hora pasa el reciclador por tu cuadra.</p>
    </div>
  );
}
