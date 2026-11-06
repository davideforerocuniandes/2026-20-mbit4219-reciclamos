import { useSyncExternalStore } from "react";

/**
 * Almacén mínimo sobre localStorage, compatible con renderizado en servidor.
 *
 * El prototipo no tiene backend: lo que en producción viviría en la
 * SuperApp (aviso, reportes, respuestas de la organización) se guarda en el
 * navegador. `useSyncExternalStore` evita desajustes de hidratación: en el
 * servidor siempre se usa el valor inicial.
 */
export interface Almacen<T> {
  leer: () => T;
  escribir: (siguiente: T | ((previo: T) => T)) => void;
  suscribir: (aviso: () => void) => () => void;
  inicial: T;
}

export function crearAlmacen<T>(clave: string, inicial: T): Almacen<T> {
  const oyentes = new Set<() => void>();
  let crudoEnCache: string | null | undefined;
  let valorEnCache: T = inicial;
  let memoria: string | null = null; // si localStorage no está disponible (modo privado estricto)

  function leerCrudo(): string | null {
    try {
      return window.localStorage.getItem(clave);
    } catch {
      return memoria;
    }
  }

  function leer(): T {
    const crudo = leerCrudo();
    if (crudo === crudoEnCache) return valorEnCache;
    crudoEnCache = crudo;
    try {
      valorEnCache = crudo === null ? inicial : (JSON.parse(crudo) as T);
    } catch {
      valorEnCache = inicial;
    }
    return valorEnCache;
  }

  function escribir(siguiente: T | ((previo: T) => T)) {
    const valor = typeof siguiente === "function" ? (siguiente as (p: T) => T)(leer()) : siguiente;
    const crudo = JSON.stringify(valor);
    try {
      window.localStorage.setItem(clave, crudo);
    } catch {
      memoria = crudo;
    }
    oyentes.forEach((o) => o());
  }

  function suscribir(aviso: () => void) {
    oyentes.add(aviso);
    const enOtraPestana = (e: StorageEvent) => {
      if (e.key === clave) aviso();
    };
    window.addEventListener("storage", enOtraPestana);
    return () => {
      oyentes.delete(aviso);
      window.removeEventListener("storage", enOtraPestana);
    };
  }

  return { leer, escribir, suscribir, inicial };
}

export function useAlmacen<T>(almacen: Almacen<T>): T {
  return useSyncExternalStore(almacen.suscribir, almacen.leer, () => almacen.inicial);
}

const sinSuscripcion = () => () => {};

/** `false` en el servidor y en la primera pasada de hidratación; `true` después. */
export function useHidratado(): boolean {
  return useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false,
  );
}
