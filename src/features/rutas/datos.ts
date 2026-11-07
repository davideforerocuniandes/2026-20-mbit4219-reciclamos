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
  { id: "arn", nombre: "Asociación Recicladores del Norte", canalRespaldo: "herramienta-web" },
  { id: "rcc", nombre: "Recicladores del Centro", canalRespaldo: "whatsapp" },
  { id: "cmv", nombre: "Cooperativa Manos Verdes", canalRespaldo: "whatsapp" },
  { id: "aro", nombre: "Asociación Reciclaje de Oriente", canalRespaldo: "whatsapp" },
];

export const RUTAS: readonly Ruta[] = [
  // Bosa: dos organizaciones con coberturas que no se cruzan.
  { id: "BOS-01", organizacionId: "ars", zonaId: "bosa", dias: [2, 5], ventana: { desde: h(5), hasta: h(7) }, cobertura: { calle: [-95, -61], carrera: [72, 115] }, validadaEl: "2026-10-20" },
  { id: "BOS-02", organizacionId: "cbb", zonaId: "bosa", dias: [1, 4], ventana: { desde: h(6), hasta: h(8) }, cobertura: { calle: [-60, -49], carrera: [72, 115] }, validadaEl: "2026-10-14" },
  // Kennedy: dos organizaciones que comparten un sector (rutas no exclusivas) y un sector sin ruta (ver SECTORES_SIN_RUTA).
  { id: "KEN-01", organizacionId: "rdo", zonaId: "kennedy", dias: [1, 4], ventana: { desde: h(5), hasta: h(7) }, cobertura: { calle: [-38, 12], carrera: [68, 86] }, validadaEl: "2026-10-22" },
  { id: "KEN-02", organizacionId: "rrk", zonaId: "kennedy", dias: [3, 6], ventana: { desde: h(6), hasta: h(8) }, cobertura: { calle: [-20, 12], carrera: [80, 100] }, validadaEl: "2026-10-09" },
  { id: "KEN-03", organizacionId: "rrk", zonaId: "kennedy", dias: [2, 5], ventana: { desde: h(6), hasta: h(8) }, cobertura: { calle: [-48, -21], carrera: [68, 100] }, validadaEl: "2026-10-23" },
  { id: "SUB-01", organizacionId: "rrs", zonaId: "suba", dias: [2, 4], ventana: { desde: h(6), hasta: h(8) }, cobertura: { calle: [100, 190], carrera: [46, 150] }, validadaEl: "2026-10-17" },
  { id: "ENG-01", organizacionId: "rev", zonaId: "engativa", dias: [1, 3, 5], ventana: { desde: h(5), hasta: h(7) }, cobertura: { calle: [26, 99], carrera: [69, 135] }, validadaEl: "2026-10-21" },
  { id: "CHA-01", organizacionId: "crv", zonaId: "chapinero", dias: [2, 6], ventana: { desde: h(7), hasta: h(9) }, cobertura: { calle: [39, 99], carrera: [-5, 13] }, validadaEl: "2026-10-15" },
  { id: "TEU-01", organizacionId: "crv", zonaId: "teusaquillo", dias: [3, 6], ventana: { desde: h(7), hasta: h(9) }, cobertura: { calle: [26, 63], carrera: [14, 50] }, validadaEl: "2026-10-15" },
  { id: "FON-01", organizacionId: "rdo", zonaId: "fontibon", dias: [2, 5], ventana: { desde: h(5), hasta: h(7) }, cobertura: { calle: [13, 25], carrera: [69, 135] }, validadaEl: "2026-10-19" },
  { id: "BAU-01", organizacionId: "crv", zonaId: "barrios-unidos", dias: [1, 4], ventana: { desde: h(7), hasta: h(9) }, cobertura: { calle: [64, 99], carrera: [14, 68] }, validadaEl: "2026-10-16" },
  { id: "USA-01", organizacionId: "arn", zonaId: "usaquen", dias: [1, 3, 5], ventana: { desde: h(7), hasta: h(9) }, cobertura: { calle: [100, 200], carrera: [-10, 45] }, validadaEl: "2026-10-22" },
  { id: "PAR-01", organizacionId: "cmv", zonaId: "puente-aranda", dias: [2, 4], ventana: { desde: h(6), hasta: h(8) }, cobertura: { calle: [-22, 12], carrera: [30, 67] }, validadaEl: "2026-10-13" },
  { id: "CEN-01", organizacionId: "rcc", zonaId: "centro", dias: [1, 3, 5], ventana: { desde: h(6), hasta: h(8) }, cobertura: { calle: [-10, 25], carrera: [-10, 13] }, validadaEl: "2026-10-20" },
  { id: "MAR-01", organizacionId: "rcc", zonaId: "martires", dias: [2, 4, 6], ventana: { desde: h(6), hasta: h(8) }, cobertura: { calle: [1, 25], carrera: [14, 29] }, validadaEl: "2026-10-20" },
  { id: "ANA-01", organizacionId: "cmv", zonaId: "antonio-narino", dias: [1, 4], ventana: { desde: h(6), hasta: h(8) }, cobertura: { calle: [-22, 0], carrera: [14, 29] }, validadaEl: "2026-10-13" },
  { id: "SCR-01", organizacionId: "aro", zonaId: "san-cristobal", dias: [2, 5], ventana: { desde: h(6), hasta: h(8) }, cobertura: { calle: [-60, -11], carrera: [-20, 9] }, validadaEl: "2026-10-18" },
  { id: "RUU-01", organizacionId: "aro", zonaId: "rafael-uribe", dias: [3, 6], ventana: { desde: h(6), hasta: h(8) }, cobertura: { calle: [-60, -23], carrera: [10, 29] }, validadaEl: "2026-10-18" },
  { id: "TUN-01", organizacionId: "ars", zonaId: "tunjuelito", dias: [1, 4], ventana: { desde: h(5), hasta: h(7) }, cobertura: { calle: [-60, -23], carrera: [30, 67] }, validadaEl: "2026-10-12" },
  { id: "CBO-01", organizacionId: "ars", zonaId: "ciudad-bolivar", dias: [3, 6], ventana: { desde: h(5), hasta: h(7) }, cobertura: { calle: [-100, -61], carrera: [14, 71] }, validadaEl: "2026-10-12" },
  { id: "USM-01", organizacionId: "aro", zonaId: "usme", dias: [2, 5], ventana: { desde: h(6), hasta: h(8) }, cobertura: { calle: [-100, -61], carrera: [-20, 13] }, validadaEl: "2026-10-18" },
];

/**
 * Cuadras donde ninguna organización ha registrado ruta. En el prototipo es un
 * sector pequeño de Kennedy, para mostrar el caso «Sin ruta todavía» (dirección
 * de prueba «Calle 42 Sur # 78-15»).
 */
export const SECTORES_SIN_RUTA: ReadonlyArray<{ calle: readonly [number, number]; carrera: readonly [number, number] }> = [
  { calle: [-43, -42], carrera: [77, 79] },
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
  { zonaId: "martires", dias: [1, 3, 5], franja: "en la noche, desde las 9:00 p. m." },
  { zonaId: "antonio-narino", dias: [2, 4, 6], franja: "en la noche, desde las 8:00 p. m." },
  { zonaId: "san-cristobal", dias: [1, 3, 6], franja: "en la mañana, desde las 6:00 a. m." },
  { zonaId: "rafael-uribe", dias: [1, 4, 6], franja: "en la mañana, desde las 6:00 a. m." },
  { zonaId: "tunjuelito", dias: [2, 3, 5], franja: "en la noche, desde las 8:00 p. m." },
  { zonaId: "ciudad-bolivar", dias: [1, 2, 4], franja: "en la mañana, desde las 6:00 a. m." },
  { zonaId: "usme", dias: [1, 3, 6], franja: "en la mañana, desde las 6:00 a. m." },
];

export function organizacion(id: string): Organizacion {
  const org = ORGANIZACIONES.find((o) => o.id === id);
  if (!org) throw new Error(`Organización desconocida: ${id}`);
  return org;
}

export function ruta(id: string): Ruta | undefined {
  return RUTAS.find((r) => r.id === id);
}
