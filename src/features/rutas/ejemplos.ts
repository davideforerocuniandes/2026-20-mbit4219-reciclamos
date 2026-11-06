/** Direcciones de prueba que recorren todos los casos del prototipo. */
export const EJEMPLOS = [
  { id: "bosa", etiqueta: "Bosa", direccion: "Calle 65 Sur # 80-12", caso: "Una ruta" },
  { id: "kennedy", etiqueta: "Kennedy", direccion: "Calle 10 Sur # 82-15", caso: "Dos organizaciones" },
  { id: "chapinero", etiqueta: "Chapinero", direccion: "Carrera 7 # 72-41", caso: "Ruta en la mañana" },
  { id: "suba", etiqueta: "Suba", direccion: "Calle 145 # 91-19", caso: "Una ruta" },
  { id: "sin-ruta", etiqueta: "Kennedy sur", direccion: "Calle 42 Sur # 78-15", caso: "Sin ruta todavía" },
] as const;

export function ejemploPorId(id: string | null): (typeof EJEMPLOS)[number] | undefined {
  return EJEMPLOS.find((e) => e.id === id);
}
