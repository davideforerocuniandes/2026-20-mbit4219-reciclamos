import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** Lunes 9 de noviembre de 2026, 8:00 a. m. en Bogotá: hace los resultados deterministas. */
export const LUNES_8AM = new Date("2026-11-09T08:00:00-05:00");

export async function fijarHora(page: Page, instante = LUNES_8AM) {
  await page.clock.setFixedTime(instante);
}

/** Consulta una dirección escribiéndola en el campo, como lo haría una persona. */
export async function consultar(page: Page, direccion: string) {
  const campo = page.getByLabel("Dirección", { exact: true });
  await campo.fill(direccion);
  await page.getByRole("button", { name: "Consultar" }).click();
}

export async function sinViolacionesDeAccesibilidad(page: Page) {
  const resultado = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  const resumen = resultado.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
  expect(resumen, resumen.join("\n")).toEqual([]);
}

/** Ningún elemento debe obligar a desplazarse horizontalmente. */
export async function sinDesbordeHorizontal(page: Page) {
  const { ancho, contenido } = await page.evaluate(() => ({
    ancho: window.innerWidth,
    contenido: document.documentElement.scrollWidth,
  }));
  expect(contenido, `el contenido mide ${contenido}px en una ventana de ${ancho}px`).toBeLessThanOrEqual(ancho);
}

export function esTelefono(page: Page): boolean {
  return (page.viewportSize()?.width ?? 1440) < 1024;
}
