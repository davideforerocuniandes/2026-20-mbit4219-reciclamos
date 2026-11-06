import { crearAlmacen } from "@/lib/almacen";

/** Incidencia operativa «¿No pasaron?». Las PQR formales siguen el canal del servicio de aseo. */
export type Motivo = "no-paso" | "camion-antes" | "otro";

export const MOTIVOS: Record<Motivo, string> = {
  "no-paso": "No pasó el reciclador",
  "camion-antes": "Pasó el camión de la basura antes",
  otro: "Otra cosa",
};

export interface Reporte {
  id: string;
  creadoEl: string;
  rutaId: string;
  organizacionId: string;
  cuadraClave: string;
  cuadraDescripcion: string;
  zonaNombre: string;
  motivo: Motivo;
  /** Día de recolección al que se refiere (AAAA-MM-DD). */
  fecha: string;
  comentario?: string;
  /** Reporte de ejemplo para que la herramienta de organizaciones no arranque vacía. */
  demo?: boolean;
}

export interface Respuesta {
  texto: string;
  fecha: string;
}

export const LIMITE_COMENTARIO = 280;

export const almacenReportes = crearAlmacen<Reporte[]>("reciclamos.reportes.v1", []);
/** Respuestas de las organizaciones, por id de reporte. */
export const almacenRespuestas = crearAlmacen<Record<string, Respuesta>>("reciclamos.respuestas.v1", {});

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0/O ni 1/I para dictarlo por teléfono

export function nuevoNumero(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `R-${Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join("")}`;
}

export function crearReporte(datos: Omit<Reporte, "id" | "creadoEl">): Reporte {
  const reporte: Reporte = {
    ...datos,
    comentario: datos.comentario?.trim().slice(0, LIMITE_COMENTARIO) || undefined,
    id: nuevoNumero(),
    creadoEl: new Date().toISOString(),
  };
  almacenReportes.escribir((previos) => [reporte, ...previos]);
  return reporte;
}

export function responderReporte(id: string, texto: string) {
  const limpio = texto.trim();
  if (!limpio) return;
  almacenRespuestas.escribir((previas) => ({ ...previas, [id]: { texto: limpio, fecha: new Date().toISOString() } }));
}

/** Reportes de ejemplo (ficticios) para la vista de organizaciones. */
export const REPORTES_DEMO: readonly Reporte[] = [
  {
    id: "R-DEMO01",
    creadoEl: "2026-11-03T12:10:00.000Z",
    rutaId: "BOS-01",
    organizacionId: "ars",
    cuadraClave: "-72:88",
    cuadraDescripcion: "Calle 72 Sur entre Carrera 88 y Carrera 89",
    zonaNombre: "Bosa",
    motivo: "camion-antes",
    fecha: "2026-11-03",
    comentario: "El camión pasó a las 4:30 a. m. y se llevó las bolsas blancas.",
    demo: true,
  },
  {
    id: "R-DEMO02",
    creadoEl: "2026-11-04T13:40:00.000Z",
    rutaId: "KEN-01",
    organizacionId: "rdo",
    cuadraClave: "-10:78",
    cuadraDescripcion: "Calle 10 Sur entre Carrera 78 y Carrera 79",
    zonaNombre: "Kennedy",
    motivo: "no-paso",
    fecha: "2026-11-02",
    demo: true,
  },
  {
    id: "R-DEMO03",
    creadoEl: "2026-11-05T11:05:00.000Z",
    rutaId: "CHA-01",
    organizacionId: "crv",
    cuadraClave: "72:7",
    cuadraDescripcion: "Carrera 7 entre Calle 72 y Calle 73",
    zonaNombre: "Chapinero",
    motivo: "otro",
    fecha: "2026-11-03",
    comentario: "Pasaron, pero no recogieron el cartón.",
    demo: true,
  },
];
