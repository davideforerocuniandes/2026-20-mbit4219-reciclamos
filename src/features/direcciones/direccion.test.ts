import { describe, expect, it } from "vitest";
import { cuadraDe, leerDireccion } from "./direccion";

function punto(texto: string) {
  const r = leerDireccion(texto);
  if (!r.ok) throw new Error(`No leyó «${texto}»: ${JSON.stringify(r.error)}`);
  return r.direccion.punto;
}

describe("leerDireccion", () => {
  it.each([
    ["Calle 65 Sur # 80-12", { calle: -65, carrera: 80 }],
    ["calle 65 sur #80-12", { calle: -65, carrera: 80 }],
    ["Cl 65 S 80 12", { calle: -65, carrera: 80 }],
    ["CLL 65 SUR NO 80 - 12", { calle: -65, carrera: 80 }],
    ["Carrera 80 # 65-12 Sur", { calle: -65, carrera: 80 }],
    ["KR 7 # 72-41", { calle: 72, carrera: 7 }],
    ["Cra. 15 No. 35-20", { calle: 35, carrera: 15 }],
    ["Calle 145 # 91-19", { calle: 145, carrera: 91 }],
    ["Diagonal 49 Sur # 80-10", { calle: -49, carrera: 80 }],
    ["Transversal 78 # 65-12 Sur", { calle: -65, carrera: 78 }],
    ["Av Calle 26 # 85-10", { calle: 26, carrera: 85 }],
    ["AK 68 # 10-20 sur", { calle: -10, carrera: 68 }],
    ["Calle 65A Bis Sur # 80B-12", { calle: -65, carrera: 80 }],
    ["Carrera 3 Este # 10-15", { calle: 10, carrera: -3 }],
    ["Cáĺle 70 № 100-20", { calle: 70, carrera: 100 }],
  ])("ubica «%s»", (texto, esperado) => {
    expect(punto(texto)).toEqual(esperado);
  });

  it("normaliza el texto para mostrarlo", () => {
    const r = leerDireccion("cl 65a bis sur # 80b-12");
    expect(r.ok && r.direccion.texto).toBe("Calle 65A Bis Sur # 80B-12");
  });

  it("rechaza la entrada vacía", () => {
    expect(leerDireccion("   ")).toEqual({ ok: false, error: { tipo: "vacia" } });
  });

  it.each(["hola", "Calle 65", "65 # 80-12", "Avenida Boyacá con 26", "Manzana 4 casa 12"])("rechaza el formato «%s»", (texto) => {
    const r = leerDireccion(texto);
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error.tipo).toBe("formato");
  });

  it.each(["Calle 500 # 10-20", "Carrera 300 # 10-20", "Calle 0 # 10-20"])("rechaza «%s» por estar fuera de la ciudad", (texto) => {
    expect(leerDireccion(texto)).toEqual({ ok: false, error: { tipo: "fuera-de-rango" } });
  });
});

describe("cuadraDe", () => {
  it("describe la cuadra sin la placa (lo único que se guarda)", () => {
    const r = leerDireccion("Calle 65 Sur # 80-12");
    if (!r.ok) throw new Error();
    expect(cuadraDe(r.direccion)).toEqual({ clave: "-65:80", descripcion: "Calle 65 Sur entre Carrera 80 y Carrera 81" });
  });

  it("dos casas de la misma cuadra comparten clave", () => {
    const a = leerDireccion("Calle 65 Sur # 80-12");
    const b = leerDireccion("Calle 65 Sur # 80-48");
    if (!a.ok || !b.ok) throw new Error();
    expect(cuadraDe(a.direccion).clave).toBe(cuadraDe(b.direccion).clave);
  });

  it("describe cuadras sobre carreras", () => {
    const r = leerDireccion("Carrera 7 # 72-41");
    if (!r.ok) throw new Error();
    expect(cuadraDe(r.direccion).descripcion).toBe("Carrera 7 entre Calle 72 y Calle 73");
  });

  it("conserva el tipo de la vía principal", () => {
    const transversal = leerDireccion("Transversal 78 # 65-12 Sur");
    const diagonal = leerDireccion("Diagonal 49 Sur # 80-10");
    const este = leerDireccion("Carrera 3 Este # 10-15");
    if (!transversal.ok || !diagonal.ok || !este.ok) throw new Error();
    expect(cuadraDe(transversal.direccion).descripcion).toBe("Transversal 78 entre Calle 65 Sur y Calle 66 Sur");
    expect(cuadraDe(diagonal.direccion).descripcion).toBe("Diagonal 49 Sur entre Carrera 80 y Carrera 81");
    expect(cuadraDe(este.direccion).descripcion).toBe("Carrera 3 Este entre Calle 10 y Calle 11");
  });
});
