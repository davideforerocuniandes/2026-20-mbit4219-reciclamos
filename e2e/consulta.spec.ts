import { expect, test } from "@playwright/test";
import { consultar, fijarHora, sinDesbordeHorizontal, sinViolacionesDeAccesibilidad } from "./apoyo";

test.beforeEach(async ({ page }) => {
  await fijarHora(page);
  await page.goto("/reciclaje");
});

test.describe("consulta por dirección", () => {
  for (const formato of ["Calle 65 Sur # 80-12", "cl 65 s 80 12", "Carrera 80 # 65-12 Sur", "CLL 65 SUR NO 80 - 12"]) {
    test(`entiende «${formato}» y muestra el horario de Bosa`, async ({ page }) => {
      await consultar(page, formato);
      const horario = page.getByRole("heading", { level: 2, name: /martes 10 de noviembre/ });
      await expect(horario).toBeVisible();
      await expect(horario).toHaveText("Mañana, martes 10 de noviembre");
      await expect(page.getByText("La ruta pasa entre 5:00 y 7:00 a. m.")).toBeVisible();
      await expect(page.getByText("Asociación Recicladores del Sur")).toBeVisible();
      await expect(page.getByText(/Tu cuadra: (Calle 65 Sur entre Carrera 80 y Carrera 81|Carrera 80 entre Calle 65 Sur y Calle 66 Sur)/)).toBeVisible();
      await expect(page.getByText(/Pasa los\s+lunes, miércoles y sábado/)).toBeVisible();
      await expect(page.getByRole("main")).not.toContainText(/\.\./); // sin puntos dobles tras «a. m.» / «p. m.»
    });
  }

  test("muestra todas las organizaciones cuando las rutas se cruzan", async ({ page }) => {
    await consultar(page, "Calle 10 Sur # 82-15");
    await expect(page.getByRole("heading", { name: "2 organizaciones pasan por tu cuadra" })).toBeVisible();
    await expect(page.getByText("Recuperadores de Occidente")).toBeVisible();
    await expect(page.getByText("Red de Recicladoras de Kennedy")).toBeVisible();
    await expect(page.getByText("Las rutas no son exclusivas")).toBeVisible();
    // Lunes 8:00 a. m.: la ruta de los lunes ya pasó; la siguiente es la del miércoles.
    await expect(page.getByRole("heading", { level: 2, name: "Miércoles 11 de noviembre" })).toBeVisible();
    await sinDesbordeHorizontal(page);
    await sinViolacionesDeAccesibilidad(page);
  });

  test.describe("otras localidades", () => {
    for (const [direccion, organizacion, dia] of [
      ["Carrera 7 # 72-41", "Cooperativa Ruta Verde", "Mañana, martes 10 de noviembre"],
      ["Cra 15 # 35-20", "Cooperativa Ruta Verde", "Miércoles 11 de noviembre"],
      ["Calle 145 # 91-19", "Red de Recicladoras de Suba", "Mañana, martes 10 de noviembre"],
      ["Calle 70 # 100-20", "Asociación Reciclar es Vida", "Miércoles 11 de noviembre"],
      ["Diagonal 55 Sur # 80-10", "Cooperativa Bolsa Blanca", "Jueves 12 de noviembre"],
    ] as const) {
      test(`«${direccion}» → ${organizacion}`, async ({ page }) => {
        await consultar(page, direccion);
        await expect(page.getByRole("heading", { level: 2, name: dia })).toBeVisible();
        await expect(page.getByText(organizacion)).toBeVisible();
      });
    }
  });

  test("dice con honestidad que no hay ruta y permite pedir aviso", async ({ page }) => {
    await consultar(page, "Calle 42 Sur # 78-15");
    await expect(page.getByRole("heading", { name: "Todavía no hay una ruta de reciclaje registrada en tu cuadra" })).toBeVisible();
    await expect(page.getByText(/En Kennedy ya hay rutas en otros sectores/)).toBeVisible();
    await page.getByRole("button", { name: "Avísame cuando haya ruta" }).click();
    await expect(page.getByText("Te avisaremos cuando haya ruta")).toBeVisible();
    await sinViolacionesDeAccesibilidad(page);

    await page.goto("/mis-avisos");
    await expect(page.getByRole("heading", { name: "Esperando ruta" })).toBeVisible();
    await expect(page.getByText("Calle 42 Sur entre Carrera 78 y Carrera 79")).toBeVisible();
  });

  test("distingue una localidad fuera del piloto", async ({ page }) => {
    await consultar(page, "Calle 120 # 7-30");
    await expect(page.getByText("Usaquén todavía no hace parte del piloto.", { exact: false })).toBeVisible();
  });

  test("explica cuando el prototipo no sabe ubicar la dirección", async ({ page }) => {
    await consultar(page, "Calle 30 # 2-10");
    await expect(page.getByRole("heading", { name: "No podemos ubicar esa dirección en el prototipo" })).toBeVisible();
  });

  test("valida el formato y el rango sin perder lo escrito", async ({ page }) => {
    await consultar(page, "mi casa");
    await expect(page.getByRole("main").getByRole("alert")).toContainText("Calle 65 Sur # 80-12");
    await expect(page.getByLabel("Dirección", { exact: true })).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Dirección", { exact: true })).toHaveValue("mi casa");

    await consultar(page, "Calle 500 # 1-1");
    await expect(page.getByRole("main").getByRole("alert")).toContainText("no parece estar en Bogotá");

    await consultar(page, "");
    await expect(page.getByRole("main").getByRole("alert")).toContainText("Escribe tu dirección");
  });

  test("muestra cómo leyó la dirección mientras se escribe", async ({ page }) => {
    await page.getByLabel("Dirección", { exact: true }).fill("cl 65a bis sur # 80b-12");
    await expect(page.getByText("Calle 65A Bis Sur # 80B-12")).toBeVisible();
  });

  test("los botones de ejemplo consultan directamente", async ({ page }) => {
    await page.getByRole("button", { name: /Chapinero/ }).click();
    await expect(page.getByLabel("Dirección", { exact: true })).toHaveValue("Carrera 7 # 72-41");
    await expect(page.getByRole("heading", { level: 2, name: "Mañana, martes 10 de noviembre" })).toBeVisible();
  });

  test("los enlaces de ejemplo de la página de inicio llevan solo un identificador", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Calle 145 # 91-19/ }).click();
    await expect(page).toHaveURL(/\/reciclaje\?ejemplo=suba$/);
    await expect(page.getByText("Red de Recicladoras de Suba")).toBeVisible();
  });
});

test.describe("usar mi ubicación", () => {
  test("ubica la zona más cercana dentro de Bogotá", async ({ page, context }) => {
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 4.6205, longitude: -74.1905 });
    await page.getByRole("button", { name: "Usar mi ubicación" }).click();
    await expect(page.getByText("Ubicación aproximada en Bosa")).toBeVisible();
    await expect(page.getByText("Asociación Recicladores del Sur")).toBeVisible();
  });

  test("avisa cuando la ubicación está fuera de Bogotá", async ({ page, context }) => {
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 6.2442, longitude: -75.5812 });
    await page.getByRole("button", { name: "Usar mi ubicación" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("fuera de Bogotá");
  });

  test("explica qué hacer si no hay permiso", async ({ page }) => {
    await page.getByRole("button", { name: "Usar mi ubicación" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("No diste permiso para usar tu ubicación");
  });
});
