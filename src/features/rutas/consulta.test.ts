import { describe, expect, it } from "vitest";
import { RUTAS, ORGANIZACIONES, HORARIOS_CAMION } from "./datos";
import { consultar, consultarPunto, direccionAproximada, proximaRecoleccion, proximoAviso, ultimasRecolecciones } from "./consulta";
import { enBogota, fechaCorta, fechaRelativa, hora, iso, listaDias, textoVentana } from "./tiempo";
import { ZONAS, enBogota as enCiudad, zonaMasCercana } from "@/features/territorio/zonas";

/** Construye un instante a partir de la hora local de Bogotá (UTC−5). */
const bogota = (texto: string) => new Date(`${texto}-05:00`);

// 2026-11-09 es lunes.
const LUNES_8AM = bogota("2026-11-09T08:00:00");

describe("consultar", () => {
  it("encuentra la ruta de Bosa para la dirección del arquetipo", () => {
    const r = consultar("Calle 65 Sur # 80-12", LUNES_8AM);
    expect(r.estado).toBe("con-ruta");
    if (r.estado !== "con-ruta") return;
    expect(r.zona.nombre).toBe("Bosa");
    expect(r.rutas.map((x) => x.ruta.id)).toEqual(["BOS-01"]);
    expect(iso(r.siguiente.proxima)).toBe("2026-11-10"); // martes
    expect(r.camion?.dias).toEqual([1, 3, 6]);
  });

  it("muestra todas las organizaciones cuando las rutas se cruzan (no exclusivas)", () => {
    const r = consultar("Calle 10 Sur # 82-15", LUNES_8AM);
    expect(r.estado).toBe("con-ruta");
    if (r.estado !== "con-ruta") return;
    expect(r.rutas.map((x) => x.ruta.id).sort()).toEqual(["KEN-01", "KEN-02"]);
    // Lunes 8:00 a. m.: KEN-01 (lun y jue, hasta 7:00) ya pasó hoy; KEN-02 pasa el miércoles.
    expect(iso(r.siguiente.proxima)).toBe("2026-11-11");
    expect(r.siguiente.ruta.id).toBe("KEN-02");
  });

  it("dice con honestidad cuando la zona del piloto no tiene ruta en esa cuadra", () => {
    const r = consultar("Calle 42 Sur # 78-15", LUNES_8AM);
    expect(r.estado).toBe("sin-ruta");
    if (r.estado === "sin-ruta") expect(r.zona.nombre).toBe("Kennedy");
  });

  it("una cuadra vecina del sector sin ruta sí tiene ruta", () => {
    expect(consultar("Calle 45 Sur # 78-15", LUNES_8AM).estado).toBe("con-ruta");
  });

  it.each([
    ["Calle 120 # 7-30", "Usaquén"],
    ["Carrera 15 # 127-40 Apto 301", "Usaquén"],
    ["Calle 30 # 2-10", "Santa Fe y La Candelaria"],
    ["Calle 48 Sur # 5-20 Este", "San Cristóbal"],
    ["Calle 70 Sur # 30-10", "Ciudad Bolívar"],
    ["Calle 85 # 50-20", "Barrios Unidos"],
    ["Calle 240 # 15-10", "Usaquén"],
  ])("da un horario de prueba a «%s» (%s)", (texto, zona) => {
    const r = consultar(texto, LUNES_8AM);
    expect(r.estado).toBe("con-ruta");
    if (r.estado === "con-ruta") expect(r.zona.nombre).toBe(zona);
  });

  it("toda dirección dentro de la malla recibe horario, salvo el sector de demostración sin ruta", () => {
    for (let calle = -100; calle <= 250; calle += 3)
      for (let carrera = -20; carrera <= 160; carrera += 3) {
        const r = consultarPunto({ tipo: "CALLE", viaPrincipal: Math.abs(calle), viaGeneradora: carrera, placa: 10, texto: "", punto: { calle, carrera } }, LUNES_8AM);
        const demo = calle >= -43 && calle <= -42 && carrera >= 77 && carrera <= 79;
        expect(r.estado, `${calle},${carrera}`).toBe(demo ? "sin-ruta" : "con-ruta");
      }
  });

  it("reporta el error de formato", () => {
    const r = consultar("mi casa", LUNES_8AM);
    expect(r.estado).toBe("error-direccion");
  });

  it.each([
    ["KR 7 # 72-41", "CHA-01"],
    ["Cra 15 # 35-20", "TEU-01"],
    ["Calle 145 # 91-19", "SUB-01"],
    ["Calle 70 # 100-20", "ENG-01"],
    ["Diagonal 55 Sur # 80-10", "BOS-02"],
  ])("ubica «%s» en la ruta %s", (texto, rutaId) => {
    const r = consultar(texto, LUNES_8AM);
    expect(r.estado).toBe("con-ruta");
    if (r.estado === "con-ruta") expect(r.rutas.map((x) => x.ruta.id)).toContain(rutaId);
  });
});

describe("proximaRecoleccion", () => {
  const bos01 = RUTAS.find((r) => r.id === "BOS-01")!; // martes y viernes, 5:00 a 7:00

  it("es hoy si hoy pasa y la ventana no ha terminado", () => {
    expect(iso(proximaRecoleccion(bos01, bogota("2026-11-10T06:30:00")))).toBe("2026-11-10");
  });

  it("salta al siguiente día de paso cuando la ventana ya terminó", () => {
    expect(iso(proximaRecoleccion(bos01, bogota("2026-11-10T07:00:00")))).toBe("2026-11-13");
  });

  it("cruza la semana", () => {
    expect(iso(proximaRecoleccion(bos01, bogota("2026-11-14T10:00:00")))).toBe("2026-11-17");
  });

  it("no depende de la zona horaria del equipo: 1:00 a. m. UTC del martes sigue siendo lunes en Bogotá", () => {
    const instante = new Date("2026-11-10T01:00:00Z"); // lunes 8:00 p. m. en Bogotá
    expect(enBogota(instante).diaSemana).toBe(1);
    expect(iso(proximaRecoleccion(bos01, instante))).toBe("2026-11-10");
  });
});

describe("proximoAviso", () => {
  const bos01 = RUTAS.find((r) => r.id === "BOS-01")!;

  it("llega a las 9:00 p. m. de la noche anterior", () => {
    const a = proximoAviso([bos01], LUNES_8AM)!;
    expect(a.instante.toISOString()).toBe(bogota("2026-11-09T21:00:00").toISOString());
    expect(iso(a.recoleccion)).toBe("2026-11-10");
  });

  it("si ya pasó la hora del aviso, programa el siguiente", () => {
    const a = proximoAviso([bos01], bogota("2026-11-09T22:00:00"))!;
    expect(iso(a.recoleccion)).toBe("2026-11-13");
  });
});

describe("textos de horario", () => {
  it("formatea horas y días en español de Colombia", () => {
    expect(hora(0)).toBe("12:00 a. m.");
    expect(hora(7 * 60)).toBe("7:00 a. m.");
    expect(hora(21 * 60 + 30)).toBe("9:30 p. m.");
    expect(listaDias([5, 2])).toBe("martes y viernes");
    expect(listaDias([1, 3, 5])).toBe("lunes, miércoles y viernes");
    expect(textoVentana({ desde: 300, hasta: 420 })).toBe("entre 5:00 y 7:00 a. m.");
  });

  it("dice hoy, mañana o la fecha", () => {
    const hoy = { anio: 2026, mes: 11, dia: 9 };
    expect(fechaRelativa(hoy, hoy)).toBe("hoy");
    expect(fechaRelativa({ anio: 2026, mes: 11, dia: 10 }, hoy)).toBe("mañana");
    expect(fechaRelativa({ anio: 2026, mes: 11, dia: 13 }, hoy)).toBe("el viernes 13 de noviembre");
    expect(fechaCorta({ anio: 2026, mes: 11, dia: 11 }, hoy)).toBe("mié 11 nov");
    expect(fechaCorta({ anio: 2026, mes: 11, dia: 10 }, hoy)).toBe("mañana");
  });
});

describe("integridad del catálogo", () => {
  it("cada ruta apunta a una organización y una zona que existen, y su cobertura cae dentro de la zona", () => {
    for (const r of RUTAS) {
      expect(ORGANIZACIONES.some((o) => o.id === r.organizacionId)).toBe(true);
      const zona = ZONAS.find((z) => z.id === r.zonaId);
      expect(zona, r.id).toBeDefined();
      expect(r.cobertura.calle[0]).toBeGreaterThanOrEqual(zona!.calle[0]);
      expect(r.cobertura.calle[1]).toBeLessThanOrEqual(zona!.calle[1]);
      expect(r.cobertura.carrera[0]).toBeGreaterThanOrEqual(zona!.carrera[0]);
      expect(r.cobertura.carrera[1]).toBeLessThanOrEqual(zona!.carrera[1]);
      expect(r.ventana.desde).toBeLessThan(r.ventana.hasta);
      expect(r.dias.length).toBeGreaterThan(0);
    }
  });

  it("toda zona tiene horario de camión y las zonas no se solapan", () => {
    for (const z of ZONAS) expect(HORARIOS_CAMION.some((c) => c.zonaId === z.id), z.id).toBe(true);
    for (const a of ZONAS)
      for (const b of ZONAS) {
        if (a.id >= b.id) continue;
        const cruzan =
          a.calle[0] <= b.calle[1] && b.calle[0] <= a.calle[1] && a.carrera[0] <= b.carrera[1] && b.carrera[0] <= a.carrera[1];
        expect(cruzan, `${a.id} y ${b.id}`).toBe(false);
      }
  });

  it("el punto de referencia de cada zona cae dentro de ella", () => {
    for (const z of ZONAS) {
      expect(z.puntoReferencia.calle).toBeGreaterThanOrEqual(z.calle[0]);
      expect(z.puntoReferencia.calle).toBeLessThanOrEqual(z.calle[1]);
      expect(z.puntoReferencia.carrera).toBeGreaterThanOrEqual(z.carrera[0]);
      expect(z.puntoReferencia.carrera).toBeLessThanOrEqual(z.carrera[1]);
    }
  });
});

describe("geolocalización", () => {
  it("reconoce coordenadas de Bogotá y elige la zona más cercana", () => {
    expect(enCiudad(4.62, -74.19)).toBe(true);
    expect(enCiudad(6.25, -75.56)).toBe(false); // Medellín
    expect(zonaMasCercana(4.621, -74.19).id).toBe("bosa");
    expect(zonaMasCercana(4.742, -74.08).id).toBe("suba");
  });
});

describe("ultimasRecolecciones", () => {
  const bos01 = RUTAS.find((r) => r.id === "BOS-01")!; // martes y viernes, 5:00 a 7:00
  it("lista los últimos días de paso, del más reciente al más antiguo", () => {
    expect(ultimasRecolecciones(bos01, bogota("2026-11-14T10:00:00")).map(iso)).toEqual(["2026-11-13", "2026-11-10", "2026-11-06"]);
  });
  it("incluye hoy solo si la ventana ya empezó", () => {
    expect(iso(ultimasRecolecciones(bos01, bogota("2026-11-10T04:00:00"))[0])).toBe("2026-11-06");
    expect(iso(ultimasRecolecciones(bos01, bogota("2026-11-10T05:30:00"))[0])).toBe("2026-11-10");
  });
});

describe("direccionAproximada", () => {
  it("usa el punto de referencia de la zona y encuentra su ruta", () => {
    const bosa = ZONAS.find((z) => z.id === "bosa")!;
    const r = consultarPunto(direccionAproximada(bosa), LUNES_8AM);
    expect(r.estado).toBe("con-ruta");
    if (r.estado === "con-ruta") expect(r.direccion.texto).toBe("Ubicación aproximada en Bosa");
  });
});
