import type { DiaSemana, Ventana } from "./datos";

/**
 * Tiempo en Bogotá. Colombia no tiene horario de verano: la hora local es
 * siempre UTC−5. Trabajar con un desfase fijo hace los cálculos
 * deterministas y fáciles de probar, sin depender de la zona del navegador.
 */
const DESFASE_MS = -5 * 60 * 60 * 1000;
const DIA_MS = 24 * 60 * 60 * 1000;

/** Fecha civil de Bogotá (sin hora). */
export interface FechaCivil {
  anio: number;
  mes: number; // 1-12
  dia: number;
}

export interface MomentoBogota {
  fecha: FechaCivil;
  diaSemana: DiaSemana;
  /** Minutos transcurridos desde la medianoche local. */
  minutos: number;
}

export function enBogota(instante: Date): MomentoBogota {
  const local = new Date(instante.getTime() + DESFASE_MS);
  const diaUTC = local.getUTCDay(); // 0 = domingo
  return {
    fecha: { anio: local.getUTCFullYear(), mes: local.getUTCMonth() + 1, dia: local.getUTCDate() },
    diaSemana: (diaUTC === 0 ? 7 : diaUTC) as DiaSemana,
    minutos: local.getUTCHours() * 60 + local.getUTCMinutes(),
  };
}

/** Instante (Date real) que corresponde a una fecha civil y minuto de Bogotá. */
export function instanteBogota(fecha: FechaCivil, minutos: number): Date {
  return new Date(Date.UTC(fecha.anio, fecha.mes - 1, fecha.dia) + minutos * 60_000 - DESFASE_MS);
}

export function sumarDias(fecha: FechaCivil, dias: number): FechaCivil {
  const d = new Date(Date.UTC(fecha.anio, fecha.mes - 1, fecha.dia) + dias * DIA_MS);
  return { anio: d.getUTCFullYear(), mes: d.getUTCMonth() + 1, dia: d.getUTCDate() };
}

export function diaSemanaDe(fecha: FechaCivil): DiaSemana {
  const d = new Date(Date.UTC(fecha.anio, fecha.mes - 1, fecha.dia)).getUTCDay();
  return (d === 0 ? 7 : d) as DiaSemana;
}

export function iso(fecha: FechaCivil): string {
  return `${fecha.anio}-${String(fecha.mes).padStart(2, "0")}-${String(fecha.dia).padStart(2, "0")}`;
}

export function desdeIso(texto: string): FechaCivil {
  const [anio, mes, dia] = texto.split("-").map(Number);
  return { anio, mes, dia };
}

const NOMBRES_DIA: Record<DiaSemana, string> = {
  1: "lunes",
  2: "martes",
  3: "miércoles",
  4: "jueves",
  5: "viernes",
  6: "sábado",
  7: "domingo",
};

const NOMBRES_MES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export function nombreDia(d: DiaSemana): string {
  return NOMBRES_DIA[d];
}

/** «martes y viernes», «lunes, miércoles y viernes». */
export function listaDias(dias: readonly DiaSemana[]): string {
  const nombres = [...dias].sort((a, b) => a - b).map(nombreDia);
  if (nombres.length <= 1) return nombres.join("");
  return `${nombres.slice(0, -1).join(", ")} y ${nombres.at(-1)}`;
}

/** «7:00 a. m.», «9:30 p. m.» (convención del español de Colombia). */
export function hora(minutos: number): string {
  const h24 = Math.floor(minutos / 60) % 24;
  const m = minutos % 60;
  const sufijo = h24 < 12 ? "a. m." : "p. m.";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${sufijo}`;
}

export function textoVentana(v: Ventana): string {
  return `entre ${hora(v.desde).replace(/ (a|p)\. m\.$/, "")} y ${hora(v.hasta)}`;
}

/** «hoy», «mañana» o «el jueves 12 de noviembre», relativo a `hoy`. */
export function fechaRelativa(fecha: FechaCivil, hoy: FechaCivil): string {
  if (iso(fecha) === iso(hoy)) return "hoy";
  if (iso(fecha) === iso(sumarDias(hoy, 1))) return "mañana";
  return `el ${nombreDia(diaSemanaDe(fecha))} ${fecha.dia} de ${NOMBRES_MES[fecha.mes - 1]}`;
}

export function fechaLarga(fecha: FechaCivil): string {
  return `${nombreDia(diaSemanaDe(fecha))} ${fecha.dia} de ${NOMBRES_MES[fecha.mes - 1]}`;
}

const DIA_CORTO: Record<DiaSemana, string> = { 1: "lun", 2: "mar", 3: "mié", 4: "jue", 5: "vie", 6: "sáb", 7: "dom" };
const MES_CORTO = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** «hoy», «mañana» o «mié 11 nov»: para etiquetas donde no cabe la fecha larga. */
export function fechaCorta(fecha: FechaCivil, hoy: FechaCivil): string {
  const relativa = fechaRelativa(fecha, hoy);
  if (relativa === "hoy" || relativa === "mañana") return relativa;
  return `${DIA_CORTO[diaSemanaDe(fecha)]} ${fecha.dia} ${MES_CORTO[fecha.mes - 1]}`;
}
