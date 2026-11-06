/**
 * Lectura de direcciones urbanas de Bogotá (nomenclatura de malla vial).
 *
 * Una dirección como «Calle 65 Sur # 80-12» dice: la casa está sobre la
 * Calle 65 Sur, a 12 metros de la esquina con la Carrera 80. En el prototipo
 * eso basta para ubicar la cuadra en una malla (calle, carrera). En producción
 * este paso lo hace el geocodificador de IDECA.
 */

export type TipoVia = "CALLE" | "CARRERA" | "DIAGONAL" | "TRANSVERSAL" | "AVENIDA_CALLE" | "AVENIDA_CARRERA";

/** Posición en la malla: calles crecen hacia el norte (sur = negativo); carreras hacia el occidente (este = negativo). */
export interface PuntoMalla {
  calle: number;
  carrera: number;
}

export interface Direccion {
  tipo: TipoVia;
  /** Número de la vía principal (la vía donde está la casa). */
  viaPrincipal: number;
  /** Número de la vía que cruza (la que va después del «#»). */
  viaGeneradora: number;
  placa: number;
  /** Texto normalizado para mostrar, p. ej. «Calle 65 Sur # 80-12». */
  texto: string;
  punto: PuntoMalla;
}

export type ErrorDireccion =
  | { tipo: "vacia" }
  | { tipo: "formato"; detalle: string }
  | { tipo: "fuera-de-rango" };

export type ResultadoDireccion = { ok: true; direccion: Direccion } | { ok: false; error: ErrorDireccion };

const ALIAS_VIA: Array<[RegExp, TipoVia]> = [
  [/^(AVENIDA CALLE|AV CALLE|AV CL|AVDA CALLE|AC)$/, "AVENIDA_CALLE"],
  [/^(AVENIDA CARRERA|AV CARRERA|AV CRA|AV KR|AVDA CARRERA|AK)$/, "AVENIDA_CARRERA"],
  [/^(CALLE|CLL|CL|CALL|CLLE|CAL)$/, "CALLE"],
  [/^(CARRERA|CRA|CR|KR|KRA|CARR|CRR|K)$/, "CARRERA"],
  [/^(DIAGONAL|DG|DIAG|DIG)$/, "DIAGONAL"],
  [/^(TRANSVERSAL|TV|TR|TRANSV|TRV|TRANS)$/, "TRANSVERSAL"],
];

const NOMBRE_VIA: Record<TipoVia, string> = {
  CALLE: "Calle",
  CARRERA: "Carrera",
  DIAGONAL: "Diagonal",
  TRANSVERSAL: "Transversal",
  AVENIDA_CALLE: "Avenida Calle",
  AVENIDA_CARRERA: "Avenida Carrera",
};

/** Vías que corren como calles (oriente-occidente); el resto corre como carreras. */
const ES_TIPO_CALLE: Record<TipoVia, boolean> = {
  CALLE: true,
  DIAGONAL: true,
  AVENIDA_CALLE: true,
  CARRERA: false,
  TRANSVERSAL: false,
  AVENIDA_CARRERA: false,
};

/** Límites aproximados de la malla urbana de Bogotá. */
export const LIMITES_MALLA = { calleMin: -100, calleMax: 250, carreraMin: -20, carreraMax: 160 } as const;

function normalizar(entrada: string): string {
  return entrada
    .normalize("NFKD") // NFKD además convierte «№» en «No»
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/N[°ºO]\.?(?=\s|\d)/g, " # ")
    .replace(/NUMERO|NRO\.?/g, " # ")
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// número + letra opcional + BIS opcional + letra opcional, p. ej. «65», «65A», «65 BIS», «65A BIS B»
const NUM = String.raw`(\d{1,3})\s?([A-H])?(?:\s?(BIS))?(?:\s?([A-H])\b)?`;
const CUADRANTE = String.raw`(SUR|ESTE|S|E)`;

const PATRON = new RegExp(
  String.raw`^(.+?)\s+${NUM}(?:\s+${CUADRANTE})?\s*(?:#|\s)\s*${NUM}\s*(?:-|\s)\s*(\d{1,3})(?:\s+${CUADRANTE})?$`,
);

function sufijo(letra?: string, bis?: string, letra2?: string): string {
  return [letra ?? "", bis ? " Bis" : "", letra2 ? ` ${letra2}` : ""].join("");
}

function nombreCuadrante(c?: string): "SUR" | "ESTE" | undefined {
  if (!c) return undefined;
  return c.startsWith("S") ? "SUR" : "ESTE";
}

export function leerDireccion(entrada: string): ResultadoDireccion {
  const limpia = normalizar(entrada);
  if (!limpia) return { ok: false, error: { tipo: "vacia" } };

  const m = PATRON.exec(limpia);
  if (!m) {
    return {
      ok: false,
      error: { tipo: "formato", detalle: "Escríbela como en el recibo de servicios, por ejemplo «Calle 65 Sur # 80-12»." },
    };
  }

  const [, viaTexto, n1, l1, b1, l1b, cuad1, n2, l2, b2, l2b, placaTexto, cuad2] = m;
  const tipo = ALIAS_VIA.find(([re]) => re.test(viaTexto.trim()))?.[1];
  if (!tipo) {
    return {
      ok: false,
      error: { tipo: "formato", detalle: "Empieza por el tipo de vía: Calle, Carrera, Diagonal, Transversal o Avenida." },
    };
  }

  const viaPrincipal = Number(n1);
  const viaGeneradora = Number(n2);
  const placa = Number(placaTexto);
  const cuadPrincipal = nombreCuadrante(cuad1);
  const cuadFinal = nombreCuadrante(cuad2);
  const esCalle = ES_TIPO_CALLE[tipo];

  // El cuadrante después del primer número califica a la vía principal; el del final, a la vía generadora.
  // «Calle 65 Sur # 80-12» -> calle sur. «Carrera 80 # 65-12 Sur» -> la calle (65) es sur.
  const calleNum = esCalle ? viaPrincipal : viaGeneradora;
  const carreraNum = esCalle ? viaGeneradora : viaPrincipal;
  const cuadCalle = esCalle ? (cuadPrincipal ?? cuadFinal) : cuadFinal;
  const cuadCarrera = esCalle ? undefined : cuadPrincipal;
  const esSur = cuadCalle === "SUR" || cuadPrincipal === "SUR" || cuadFinal === "SUR";
  const esEste = cuadCarrera === "ESTE" || cuadPrincipal === "ESTE" || cuadFinal === "ESTE";

  const punto: PuntoMalla = {
    calle: esSur ? -calleNum : calleNum,
    carrera: esEste ? -carreraNum : carreraNum,
  };

  if (
    viaPrincipal === 0 ||
    punto.calle < LIMITES_MALLA.calleMin ||
    punto.calle > LIMITES_MALLA.calleMax ||
    punto.carrera < LIMITES_MALLA.carreraMin ||
    punto.carrera > LIMITES_MALLA.carreraMax
  ) {
    return { ok: false, error: { tipo: "fuera-de-rango" } };
  }

  const cuadTexto = (c?: string) => (c ? ` ${c === "SUR" ? "Sur" : "Este"}` : "");
  const texto =
    `${NOMBRE_VIA[tipo]} ${viaPrincipal}${sufijo(l1, b1, l1b)}${cuadTexto(cuadPrincipal)}` +
    ` # ${viaGeneradora}${sufijo(l2, b2, l2b)}-${placa}${cuadTexto(cuadFinal)}`;

  return { ok: true, direccion: { tipo, viaPrincipal, viaGeneradora, placa, texto, punto } };
}

/** La cuadra es lo único que se guarda (para el aviso): calle y carrera de la esquina más cercana, sin placa. */
export interface Cuadra {
  clave: string;
  descripcion: string;
}

/** Nombre de una vía con su cuadrante: «Calle 65 Sur», «Carrera 3 Este», «Transversal 78». */
function nombreVia(tipo: string, n: number, cuadranteNegativo: "Sur" | "Este"): string {
  return n < 0 ? `${tipo} ${-n} ${cuadranteNegativo}` : `${tipo} ${n}`;
}

export function cuadraDe(direccion: Direccion): Cuadra {
  const { calle, carrera } = direccion.punto;
  const esCalle = ES_TIPO_CALLE[direccion.tipo];
  const via = NOMBRE_VIA[direccion.tipo];
  const siguiente = (n: number) => n + (n < 0 ? -1 : 1);
  // La vía principal conserva su tipo (Diagonal, Transversal…); las que cruzan se nombran como calles o carreras.
  const descripcion = esCalle
    ? `${nombreVia(via, calle, "Sur")} entre ${nombreVia("Carrera", carrera, "Este")} y ${nombreVia("Carrera", siguiente(carrera), "Este")}`
    : `${nombreVia(via, carrera, "Este")} entre ${nombreVia("Calle", calle, "Sur")} y ${nombreVia("Calle", siguiente(calle), "Sur")}`;
  return { clave: `${calle}:${carrera}`, descripcion };
}
