/**
 * Catálogo de rutas y organizaciones del prototipo.
 *
 * TODOS LOS DATOS SON FICTICIOS. En producción, cada ruta sale de la ficha
 * que la organización registra (microrruta en el SUI de la Superservicios,
 * rutas del piloto de la UAESP) y valida la UAESP antes de publicarse.
 */

/** Día ISO: 1 = lunes … 7 = domingo. */
export type DiaSemana = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Organizacion {
  id: string;
  nombre: string;
  /** Canal de respaldo para recibir reportes cuando no usa la herramienta web. */
  canalRespaldo: "whatsapp" | "herramienta-web";
}

/** Ventana de paso en minutos desde la medianoche (hora de Bogotá). */
export interface Ventana {
  desde: number;
  hasta: number;
}

export interface Ruta {
  id: string;
  organizacionId: string;
  zonaId: string;
  dias: readonly DiaSemana[];
  ventana: Ventana;
  /** Rectángulo de cobertura sobre la malla (calle, carrera). */
  cobertura: { calle: readonly [number, number]; carrera: readonly [number, number] };
  /** Ficha de calidad del dato: fecha de la última validación en campo (AAAA-MM-DD). */
  validadaEl: string;
}

export interface HorarioCamion {
  zonaId: string;
  dias: readonly DiaSemana[];
  franja: string;
}

const h = (hora: number, min = 0) => hora * 60 + min;

export const ORGANIZACIONES: readonly Organizacion[] = [
  { id: "ars", nombre: "Asociación Recicladores del Sur", canalRespaldo: "whatsapp" },
  { id: "cbb", nombre: "Cooperativa Bolsa Blanca", canalRespaldo: "herramienta-web" },
  { id: "rdo", nombre: "Recuperadores de Occidente", canalRespaldo: "herramienta-web" },
  { id: "rrk", nombre: "Red de Recicladoras de Kennedy", canalRespaldo: "whatsapp" },
  { id: "rrs", nombre: "Red de Recicladoras de Suba", canalRespaldo: "herramienta-web" },
  { id: "rev", nombre: "Asociación Reciclar es Vida", canalRespaldo: "whatsapp" },
  { id: "crv", nombre: "Cooperativa Ruta Verde", canalRespaldo: "herramienta-web" },
];

export const RUTAS: readonly Ruta[] = [
  // Bosa: dos organizaciones con coberturas que no se cruzan.
  { id: "BOS-01", organizacionId: "ars", zonaId: "bosa", dias: [2, 5], ventana: { desde: h(5), hasta: h(7) }, cobertura: { calle: [-95, -61], carrera: [72, 115] }, validadaEl: "2026-10-20" },
  { id: "BOS-02", organizacionId: "cbb", zonaId: "bosa", dias: [1, 4], ventana: { desde: h(6), hasta: h(8) }, cobertura: { calle: [-60, -49], carrera: [72, 100] }, validadaEl: "2026-10-14" },
  // Kennedy: dos organizaciones que comparten un sector (rutas no exclusivas) y un sector sin ruta (calles 39 a 48 Sur).
  { id: "KEN-01", organizacionId: "rdo", zonaId: "kennedy", dias: [1, 4], ventana: { desde: h(5), hasta: h(7) }, cobertura: { calle: [-38, 12], carrera: [68, 86] }, validadaEl: "2026-10-22" },
  { id: "KEN-02", organizacionId: "rrk", zonaId: "kennedy", dias: [3, 6], ventana: { desde: h(6), hasta: h(8) }, cobertura: { calle: [-20, 12], carrera: [80, 100] }, validadaEl: "2026-10-09" },
  { id: "SUB-01", organizacionId: "rrs", zonaId: "suba", dias: [2, 4], ventana: { desde: h(6), hasta: h(8) }, cobertura: { calle: [100, 160], carrera: [46, 110] }, validadaEl: "2026-10-17" },
  { id: "ENG-01", organizacionId: "rev", zonaId: "engativa", dias: [1, 3, 5], ventana: { desde: h(5), hasta: h(7) }, cobertura: { calle: [26, 80], carrera: [69, 120] }, validadaEl: "2026-10-21" },
  { id: "CHA-01", organizacionId: "crv", zonaId: "chapinero", dias: [2, 6], ventana: { desde: h(7), hasta: h(9) }, cobertura: { calle: [39, 99], carrera: [-5, 13] }, validadaEl: "2026-10-15" },
  { id: "TEU-01", organizacionId: "crv", zonaId: "teusaquillo", dias: [3, 6], ventana: { desde: h(7), hasta: h(9) }, cobertura: { calle: [26, 63], carrera: [14, 50] }, validadaEl: "2026-10-15" },
];

export const HORARIOS_CAMION: readonly HorarioCamion[] = [
  { zonaId: "bosa", dias: [1, 3, 6], franja: "en la noche, desde las 8:00 p. m." },
  { zonaId: "kennedy", dias: [2, 4, 6], franja: "en la noche, desde las 8:00 p. m." },
  { zonaId: "suba", dias: [1, 3, 5], franja: "en la mañana, desde las 6:00 a. m." },
  { zonaId: "engativa", dias: [2, 4, 6], franja: "en la noche, desde las 9:00 p. m." },
  { zonaId: "fontibon", dias: [1, 3, 5], franja: "en la noche, desde las 8:00 p. m." },
  { zonaId: "chapinero", dias: [1, 3, 5], franja: "en la noche, desde las 9:00 p. m." },
  { zonaId: "teusaquillo", dias: [2, 4, 6], franja: "en la noche, desde las 9:00 p. m." },
  { zonaId: "barrios-unidos", dias: [1, 3, 5], franja: "en la noche, desde las 8:00 p. m." },
  { zonaId: "usaquen", dias: [2, 4, 6], franja: "en la mañana, desde las 6:00 a. m." },
  { zonaId: "puente-aranda", dias: [1, 3, 5], franja: "en la noche, desde las 8:00 p. m." },
  { zonaId: "centro", dias: [1, 2, 3, 4, 5, 6], franja: "en la noche, desde las 10:00 p. m." },
];

export function organizacion(id: string): Organizacion {
  const org = ORGANIZACIONES.find((o) => o.id === id);
  if (!org) throw new Error(`Organización desconocida: ${id}`);
  return org;
}

export function ruta(id: string): Ruta | undefined {
  return RUTAS.find((r) => r.id === id);
}
