import type { PuntoMalla } from "@/features/direcciones/direccion";

/**
 * Zonas aproximadas de localidades sobre la malla vial (calle, carrera).
 * Son rectángulos simplificados para el prototipo: sirven para ubicar una
 * dirección de prueba, no para delimitar localidades reales. En producción
 * la localidad y la cuadra salen del geocodificador de IDECA.
 */
export interface Zona {
  id: string;
  nombre: string;
  /** Rango [mín, máx] de calles (sur negativo). */
  calle: readonly [number, number];
  /** Rango [mín, máx] de carreras (este negativo). */
  carrera: readonly [number, number];
  /** Punto de referencia para «Usar mi ubicación» (latitud, longitud aproximadas). */
  centro: { lat: number; lon: number };
  /** Representa la zona cuando se llega por geolocalización. */
  puntoReferencia: PuntoMalla;
}

export const ZONAS: readonly Zona[] = [
  { id: "bosa", nombre: "Bosa", calle: [-95, -49], carrera: [72, 115], centro: { lat: 4.6205, lon: -74.1905 }, puntoReferencia: { calle: -65, carrera: 80 } },
  { id: "kennedy", nombre: "Kennedy", calle: [-48, 12], carrera: [68, 100], centro: { lat: 4.6275, lon: -74.1515 }, puntoReferencia: { calle: -10, carrera: 78 } },
  { id: "suba", nombre: "Suba", calle: [100, 190], carrera: [46, 150], centro: { lat: 4.7405, lon: -74.0835 }, puntoReferencia: { calle: 145, carrera: 91 } },
  { id: "engativa", nombre: "Engativá", calle: [26, 99], carrera: [69, 135], centro: { lat: 4.7055, lon: -74.1105 }, puntoReferencia: { calle: 70, carrera: 100 } },
  { id: "fontibon", nombre: "Fontibón", calle: [13, 25], carrera: [69, 135], centro: { lat: 4.6735, lon: -74.1455 }, puntoReferencia: { calle: 20, carrera: 100 } },
  { id: "chapinero", nombre: "Chapinero", calle: [39, 99], carrera: [-5, 13], centro: { lat: 4.6485, lon: -74.0625 }, puntoReferencia: { calle: 72, carrera: 7 } },
  { id: "teusaquillo", nombre: "Teusaquillo", calle: [26, 63], carrera: [14, 50], centro: { lat: 4.6375, lon: -74.0805 }, puntoReferencia: { calle: 35, carrera: 15 } },
  { id: "barrios-unidos", nombre: "Barrios Unidos", calle: [64, 99], carrera: [14, 68], centro: { lat: 4.6675, lon: -74.0755 }, puntoReferencia: { calle: 80, carrera: 30 } },
  { id: "usaquen", nombre: "Usaquén", calle: [100, 200], carrera: [-10, 45], centro: { lat: 4.7035, lon: -74.0305 }, puntoReferencia: { calle: 120, carrera: 7 } },
  { id: "puente-aranda", nombre: "Puente Aranda", calle: [-22, 12], carrera: [30, 67], centro: { lat: 4.6155, lon: -74.1065 }, puntoReferencia: { calle: 6, carrera: 50 } },
  { id: "centro", nombre: "Santa Fe y La Candelaria", calle: [-10, 25], carrera: [-10, 13], centro: { lat: 4.6015, lon: -74.0705 }, puntoReferencia: { calle: 19, carrera: 5 } },
  { id: "martires", nombre: "Los Mártires", calle: [1, 25], carrera: [14, 29], centro: { lat: 4.6045, lon: -74.0895 }, puntoReferencia: { calle: 19, carrera: 22 } },
  { id: "antonio-narino", nombre: "Antonio Nariño", calle: [-22, 0], carrera: [14, 29], centro: { lat: 4.5895, lon: -74.1025 }, puntoReferencia: { calle: -15, carrera: 20 } },
  { id: "san-cristobal", nombre: "San Cristóbal", calle: [-60, -11], carrera: [-20, 9], centro: { lat: 4.5605, lon: -74.0855 }, puntoReferencia: { calle: -27, carrera: -3 } },
  { id: "rafael-uribe", nombre: "Rafael Uribe Uribe", calle: [-60, -23], carrera: [10, 29], centro: { lat: 4.5675, lon: -74.1135 }, puntoReferencia: { calle: -36, carrera: 20 } },
  { id: "tunjuelito", nombre: "Tunjuelito", calle: [-60, -23], carrera: [30, 67], centro: { lat: 4.5755, lon: -74.1355 }, puntoReferencia: { calle: -50, carrera: 40 } },
  { id: "ciudad-bolivar", nombre: "Ciudad Bolívar", calle: [-100, -61], carrera: [14, 71], centro: { lat: 4.5355, lon: -74.1555 }, puntoReferencia: { calle: -70, carrera: 30 } },
  { id: "usme", nombre: "Usme", calle: [-100, -61], carrera: [-20, 13], centro: { lat: 4.5005, lon: -74.1205 }, puntoReferencia: { calle: -76, carrera: 3 } },
];

function dentro(valor: number, [min, max]: readonly [number, number]): boolean {
  return valor >= min && valor <= max;
}

export function zonaDe(punto: PuntoMalla): Zona | undefined {
  return ZONAS.find((z) => dentro(punto.calle, z.calle) && dentro(punto.carrera, z.carrera));
}

function acotar(valor: number, [min, max]: readonly [number, number]): number {
  return Math.min(Math.max(valor, min), max);
}

/**
 * Zona de un punto de la malla y el punto dentro de ella. Los rectángulos no
 * cubren toda la ciudad, así que un punto que cae entre zonas (o en un borde)
 * se asigna a la zona más cercana y se acerca a su borde. Así cualquier
 * dirección de Bogotá recibe un resultado en el prototipo.
 */
export function ubicarEnZona(punto: PuntoMalla): { zona: Zona; punto: PuntoMalla } {
  const exacta = zonaDe(punto);
  if (exacta) return { zona: exacta, punto };
  let mejor = ZONAS[0];
  let menor = Infinity;
  for (const z of ZONAS) {
    const d = (acotar(punto.calle, z.calle) - punto.calle) ** 2 + (acotar(punto.carrera, z.carrera) - punto.carrera) ** 2;
    if (d < menor) {
      menor = d;
      mejor = z;
    }
  }
  return { zona: mejor, punto: { calle: acotar(punto.calle, mejor.calle), carrera: acotar(punto.carrera, mejor.carrera) } };
}

/** Límites aproximados del área urbana de Bogotá para validar una geolocalización. */
const BOGOTA = { latMin: 4.45, latMax: 4.84, lonMin: -74.24, lonMax: -73.98 } as const;

export function enBogota(lat: number, lon: number): boolean {
  return lat >= BOGOTA.latMin && lat <= BOGOTA.latMax && lon >= BOGOTA.lonMin && lon <= BOGOTA.lonMax;
}

/** Zona más cercana a unas coordenadas (distancia euclidiana sobre grados; suficiente a escala de ciudad). */
export function zonaMasCercana(lat: number, lon: number): Zona {
  let mejor = ZONAS[0];
  let menor = Infinity;
  for (const z of ZONAS) {
    const d = (z.centro.lat - lat) ** 2 + (z.centro.lon - lon) ** 2;
    if (d < menor) {
      menor = d;
      mejor = z;
    }
  }
  return mejor;
}
