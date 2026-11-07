"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ClipboardList, LocateFixed, LockKeyhole, MapPin, Search } from "lucide-react";
import { Boton, Tarjeta, cx } from "@/components/ui";
import { consultar, consultarUbicacion, type ResultadoConsulta } from "./consulta";
import { EJEMPLOS } from "./ejemplos";
import { Resultado } from "./resultado";

function hacerConsulta(texto: string) {
  const ahora = new Date();
  return { resultado: consultar(texto, ahora), ahora, desdeUbicacion: false };
}

export function ConsultaReciclaje({ direccionInicial }: { direccionInicial?: string }) {
  const [texto, setTexto] = useState(direccionInicial ?? "");
  const [consulta, setConsulta] = useState(() => direccionInicial ? hacerConsulta(direccionInicial) : null);
  const [ubicacion, setUbicacion] = useState<{ estado: "buscando" } | { estado: "error"; mensaje: string } | null>(null);
  const solicitudUbicacion = useRef(0);
  const focoPendiente = useRef<"campo" | "resultado" | "ejemplos" | null>(null);
  const resultadoRef = useRef<HTMLDivElement>(null);
  const campoRef = useRef<HTMLInputElement>(null);
  const ejemplosRef = useRef<HTMLDetailsElement>(null);
  const id = useId();

  useEffect(() => () => {
    solicitudUbicacion.current += 1;
  }, []);

  useEffect(() => {
    if (focoPendiente.current === "resultado") resultadoRef.current?.focus();
    if (focoPendiente.current === "campo") campoRef.current?.focus();
    if (focoPendiente.current === "ejemplos" && ejemplosRef.current) {
      ejemplosRef.current.open = true;
      ejemplosRef.current.querySelector("summary")?.focus();
    }
    focoPendiente.current = null;
  }, [consulta]);

  function descartarUbicacion() {
    solicitudUbicacion.current += 1;
    setUbicacion(null);
  }

  function buscar(valor: string) {
    descartarUbicacion();
    const siguiente = hacerConsulta(valor);
    setTexto(valor);
    focoPendiente.current = siguiente.resultado.estado === "error-direccion" ? "campo" : "resultado";
    setConsulta(siguiente);
  }

  function usarUbicacion() {
    if (!navigator.geolocation) {
      setUbicacion({ estado: "error", mensaje: "Este navegador no permite usar la ubicación. Puedes escribir tu dirección." });
      return;
    }

    const solicitud = ++solicitudUbicacion.current;
    setConsulta(null);
    setUbicacion({ estado: "buscando" });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (solicitud !== solicitudUbicacion.current) return;
        const ahora = new Date();
        const resultado = consultarUbicacion(coords.latitude, coords.longitude, ahora);
        if (!resultado) {
          setUbicacion({ estado: "error", mensaje: "Tu ubicación parece estar fuera de Bogotá. Escribe una dirección de la ciudad." });
          return;
        }
        setUbicacion(null);
        focoPendiente.current = "resultado";
        setConsulta({ resultado, ahora, desdeUbicacion: true });
      },
      (error) => {
        if (solicitud !== solicitudUbicacion.current) return;
        setUbicacion({
          estado: "error",
          mensaje: error.code === error.PERMISSION_DENIED
            ? "No diste permiso para usar tu ubicación. Puedes escribir tu dirección."
            : "No pudimos obtener tu ubicación. Puedes intentar de nuevo o escribir tu dirección.",
        });
      },
      { timeout: 10_000, maximumAge: 60_000 },
    );
  }

  function volver(foco: "campo" | "ejemplos") {
    focoPendiente.current = foco;
    setConsulta(null);
  }

  const resultado = consulta?.resultado;
  if (consulta && resultado && resultado.estado !== "error-direccion") {
    return (
      <div ref={resultadoRef} tabIndex={-1} role="region" aria-label="Resultado de la consulta"
        data-resultado-amplio={resultado.estado === "con-ruta" && !resultado.zonaCercana ? "" : undefined}
        aria-describedby={resultado.estado === "con-ruta" ? "tipo-horario titulo-horario franja-horario" : "titulo-sin-ruta"} className="mt-5 rounded-tarjeta">
        <Resultado resultado={resultado} ahora={consulta.ahora} desdeUbicacion={consulta.desdeUbicacion}
          onCambiar={() => volver("campo")} onEjemplos={() => volver("ejemplos")} />
      </div>
    );
  }

  const error = resultado?.estado === "error-direccion" ? textoError(resultado.error) : null;

  return (
    <>
      <p className="mt-2 text-base text-gris">Consulta qué día y a qué hora pasa el reciclaje por tu cuadra.</p>
      <Tarjeta aria-labelledby={`${id}-titulo`} className="mt-5 sm:p-7">
        <h2 id={`${id}-titulo`} className="flex items-center gap-2 text-lg font-bold">
          <MapPin aria-hidden className="size-5 shrink-0 text-acento" />
          Busca tu horario
        </h2>
        <form role="search" aria-labelledby={`${id}-titulo`} className="mt-4" noValidate onSubmit={(e) => { e.preventDefault(); buscar(texto); }}>
          <label htmlFor={`${id}-direccion`} className="font-semibold">Dirección</label>
          <p id={`${id}-ayuda`} className="mt-1 text-gris">Escríbela como aparece en tu recibo.<br /> Ejemplo: Calle 65 Sur # 80-12.</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              ref={campoRef}
              id={`${id}-direccion`}
              type="text"
              autoComplete="street-address"
              enterKeyHint="search"
              value={texto}
              onChange={(e) => {
                if (ubicacion) descartarUbicacion();
                setTexto(e.target.value);
                if (error) setConsulta(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={`${id}-ayuda${error ? ` ${id}-error` : ""}`}
              className={cx("min-h-12 min-w-0 flex-1 rounded-xl border bg-white px-3 py-2 text-base placeholder:text-gris", error ? "border-rojo" : "border-campo")}
            />
            <Boton type="submit" variante="destacada" className="min-h-12 shrink-0">
              <Search aria-hidden className="size-5" />
              Consultar horario
            </Boton>
          </div>
          {error && <p id={`${id}-error`} role="alert" className="mt-2 font-semibold text-rojo">{error}</p>}
          <p className="mt-4 flex items-start gap-2 text-sm text-gris">
            <LockKeyhole aria-hidden className="mt-0.5 size-4 shrink-0" />
            Usamos tu dirección solo para esta consulta.
          </p>
        </form>
        <div className="mt-4 border-t border-borde pt-4">
          <Boton variante="secundaria" onClick={usarUbicacion} disabled={ubicacion?.estado === "buscando"} aria-describedby={`${id}-ayuda-ubicacion`}>
            <LocateFixed aria-hidden className="size-5 shrink-0" />
            Usar mi ubicación
          </Boton>
          <p id={`${id}-ayuda-ubicacion`} className="mt-2 text-sm text-gris">Muestra un horario de prueba para tu zona aproximada.</p>
          <p role="status" className={ubicacion?.estado === "buscando" ? "mt-2 text-gris" : "sr-only"}>
            {ubicacion?.estado === "buscando" && "Buscando tu ubicación…"}
          </p>
          {ubicacion?.estado === "error" && <p role="alert" className="mt-2 font-semibold text-rojo">{ubicacion.mensaje}</p>}
        </div>
      </Tarjeta>

      <details ref={ejemplosRef} className="group mt-4 rounded-tarjeta border border-borde bg-white">
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 rounded-tarjeta px-4 py-3 font-semibold text-acento [&::-webkit-details-marker]:hidden">
          <ClipboardList aria-hidden className="size-5 shrink-0" />
          Probar con un ejemplo
          <ChevronDown aria-hidden className="ml-auto size-5 shrink-0 group-open:rotate-180" />
        </summary>
        <div className="border-t border-borde px-4 py-3">
          <p className="text-sm text-gris">Elige una dirección de prueba para ver cómo funciona.</p>
          <ul className="mt-2 divide-y divide-borde">
            {EJEMPLOS.map((ejemplo) => (
              <li key={ejemplo.id}>
                <Boton variante="sutil" onClick={() => buscar(ejemplo.direccion)} className="w-full flex-wrap justify-start gap-x-2 px-2 text-left">
                  <span>{ejemplo.direccion}</span>
                  <span className="text-sm font-normal text-gris">{ejemplo.etiqueta} · {ejemplo.caso}</span>
                </Boton>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </>
  );
}

function textoError(error: Extract<ResultadoConsulta, { estado: "error-direccion" }>["error"]) {
  if (error.tipo === "vacia") return "Escribe tu dirección para consultar.";
  if (error.tipo === "fuera-de-rango") return "Esa dirección no parece estar en Bogotá. Revisa los números en tu recibo.";
  return error.detalle;
}
