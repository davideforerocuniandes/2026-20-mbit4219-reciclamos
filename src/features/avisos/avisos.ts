import { crearAlmacen } from "@/lib/almacen";

/**
 * Suscripción al aviso de la noche anterior.
 * Privacidad por diseño (Ley 1581 de 2012): se guarda la cuadra, nunca la dirección ni la placa.
 */
export interface Aviso {
  cuadraClave: string;
  cuadraDescripcion: string;
  zonaNombre: string;
  rutaIds: string[];
  creadoEl: string;
}

/** «Avísame cuando haya ruta» en una cuadra sin cobertura. */
export interface InteresRuta {
  cuadraClave: string;
  cuadraDescripcion: string;
  zonaNombre: string;
  creadoEl: string;
}

export const almacenAviso = crearAlmacen<Aviso | null>("reciclamos.aviso.v1", null);
export const almacenIntereses = crearAlmacen<InteresRuta[]>("reciclamos.intereses.v1", []);

export function activarAviso(aviso: Omit<Aviso, "creadoEl">) {
  almacenAviso.escribir({ ...aviso, creadoEl: new Date().toISOString() });
}

export function cancelarAviso() {
  almacenAviso.escribir(null);
}

export function registrarInteres(interes: Omit<InteresRuta, "creadoEl">) {
  almacenIntereses.escribir((previos) =>
    previos.some((p) => p.cuadraClave === interes.cuadraClave)
      ? previos
      : [...previos, { ...interes, creadoEl: new Date().toISOString() }],
  );
}

export function quitarInteres(cuadraClave: string) {
  almacenIntereses.escribir((previos) => previos.filter((p) => p.cuadraClave !== cuadraClave));
}
