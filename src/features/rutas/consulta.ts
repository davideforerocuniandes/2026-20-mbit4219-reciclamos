import { cuadraDe, leerDireccion, type Cuadra, type Direccion, type ErrorDireccion, type PuntoMalla } from "@/features/direcciones/direccion";
import { ubicarEnZona, type Zona } from "@/features/territorio/zonas";
import { HORARIOS_CAMION, RUTAS, SECTORES_SIN_RUTA, organizacion, type HorarioCamion, type Organizacion, type Ruta } from "./datos";
import { enBogota, instanteBogota, sumarDias, type FechaCivil } from "./tiempo";

/** Hora a la que llega el aviso la noche anterior (21:00, hora de Bogotá). */
export const MINUTO_AVISO = 21 * 60;

export interface RutaEnCuadra {
  ruta: Ruta;
  organizacion: Organizacion;
  proxima: FechaCivil;
}

export type ResultadoConsulta =
  | { estado: "error-direccion"; error: ErrorDireccion }
  | { estado: "sin-ruta"; direccion: Direccion; cuadra: Cuadra; zona: Zona; camion?: HorarioCamion }
  | {
      estado: "con-ruta";
      direccion: Direccion;
      cuadra: Cuadra;
      zona: Zona;
      rutas: RutaEnCuadra[];
      /** La recolección más próxima entre todas las rutas que pasan por la cuadra. */
      siguiente: RutaEnCuadra;
      camion?: HorarioCamion;
    };

function cubre(ruta: Ruta, p: PuntoMalla): boolean {
  const { calle, carrera } = ruta.cobertura;
  return p.calle >= calle[0] && p.calle <= calle[1] && p.carrera >= carrera[0] && p.carrera <= carrera[1];
}

function enSectorSinRuta(p: PuntoMalla): boolean {
  return SECTORES_SIN_RUTA.some(
    ({ calle, carrera }) => p.calle >= calle[0] && p.calle <= calle[1] && p.carrera >= carrera[0] && p.carrera <= carrera[1],
  );
}

export function rutasEn(p: PuntoMalla): Ruta[] {
  if (enSectorSinRuta(p)) return [];
  return RUTAS.filter((r) => cubre(r, p));
}

/**
 * Próximo día de paso de una ruta. Si hoy es día de paso y la ventana aún no
 * termina, es hoy; si ya terminó, es el siguiente día de la ruta.
 */
export function proximaRecoleccion(ruta: Ruta, ahora: Date): FechaCivil {
  const m = enBogota(ahora);
  for (let i = 0; i < 8; i++) {
    const fecha = sumarDias(m.fecha, i);
    const dia = ((m.diaSemana - 1 + i) % 7) + 1;
    if (!ruta.dias.includes(dia as Ruta["dias"][number])) continue;
    if (i === 0 && m.minutos >= ruta.ventana.hasta) continue;
    return fecha;
  }
  throw new Error(`La ruta ${ruta.id} no tiene días de paso`);
}

/** Próximo aviso: 9:00 p. m. del día anterior a la próxima recolección que aún no se haya avisado. */
export function proximoAviso(rutas: readonly Ruta[], ahora: Date): { instante: Date; recoleccion: FechaCivil; ruta: Ruta } | undefined {
  let mejor: { instante: Date; recoleccion: FechaCivil; ruta: Ruta } | undefined;
  for (const ruta of rutas) {
    // Recorre las próximas dos semanas y toma el primer aviso futuro de esta ruta.
    const m = enBogota(ahora);
    for (let i = 0; i < 15; i++) {
      const fecha = sumarDias(m.fecha, i);
      const dia = ((m.diaSemana - 1 + i) % 7) + 1;
      if (!ruta.dias.includes(dia as Ruta["dias"][number])) continue;
      const instante = instanteBogota(sumarDias(fecha, -1), MINUTO_AVISO);
      if (instante.getTime() <= ahora.getTime()) continue;
      if (!mejor || instante < mejor.instante) mejor = { instante, recoleccion: fecha, ruta };
      break;
    }
  }
  return mejor;
}

function comparar(a: FechaCivil, b: FechaCivil): number {
  return a.anio - b.anio || a.mes - b.mes || a.dia - b.dia;
}

export function consultarPunto(direccion: Direccion, ahora: Date): ResultadoConsulta {
  const cuadra = cuadraDe(direccion);
  const { zona, punto } = ubicarEnZona(direccion.punto);
  const camion = HORARIOS_CAMION.find((c) => c.zonaId === zona.id);
  const rutas = rutasEn(punto)
    .map((ruta) => ({ ruta, organizacion: organizacion(ruta.organizacionId), proxima: proximaRecoleccion(ruta, ahora) }))
    .sort((a, b) => comparar(a.proxima, b.proxima) || a.ruta.ventana.desde - b.ruta.ventana.desde);
  if (rutas.length === 0) return { estado: "sin-ruta", direccion, cuadra, zona, camion };
  return { estado: "con-ruta", direccion, cuadra, zona, rutas, siguiente: rutas[0], camion };
}

export function consultar(texto: string, ahora: Date): ResultadoConsulta {
  const lectura = leerDireccion(texto);
  if (!lectura.ok) return { estado: "error-direccion", error: lectura.error };
  return consultarPunto(lectura.direccion, ahora);
}

/** Últimos días de paso ya ocurridos (o en curso), del más reciente al más antiguo. Sirve para el reporte «¿No pasaron?». */
export function ultimasRecolecciones(ruta: Ruta, ahora: Date, cuantas = 3): FechaCivil[] {
  const m = enBogota(ahora);
  const fechas: FechaCivil[] = [];
  for (let i = 0; fechas.length < cuantas && i < 30; i++) {
    const fecha = sumarDias(m.fecha, -i);
    const dia = ((((m.diaSemana - 1 - i) % 7) + 7) % 7) + 1;
    if (!ruta.dias.includes(dia as Ruta["dias"][number])) continue;
    if (i === 0 && m.minutos < ruta.ventana.desde) continue; // hoy todavía no ha empezado la ventana
    fechas.push(fecha);
  }
  return fechas;
}

/** Dirección sintética para «Usar mi ubicación»: el punto de referencia de la zona más cercana. */
export function direccionAproximada(zona: Zona): Direccion {
  const { calle, carrera } = zona.puntoReferencia;
  return {
    tipo: "CALLE",
    viaPrincipal: Math.abs(calle),
    viaGeneradora: carrera,
    placa: 0,
    texto: `Ubicación aproximada en ${zona.nombre}`,
    punto: zona.puntoReferencia,
  };
}
