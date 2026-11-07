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
      const ruta = page.getByRole("region", { name: "Organización que pasa por tu cuadra" });
      await expect(ruta.getByRole("heading", { name: "Asociación Recicladores del Sur" })).toBeVisible();
      await expect(ruta.getByText("Próxima: martes 10 de noviembre")).toBeVisible();
      await expect(ruta.getByText("Pasa los martes y viernes")).toBeVisible();
      await expect(ruta.getByText(/Ruta BOS-01 · Validación simulada/)).toBeVisible();
      await expect(page.getByText(/Tu cuadra: (Calle 65 Sur entre Carrera 80 y Carrera 81|Carrera 80 entre Calle 65 Sur y Calle 66 Sur)/)).toBeVisible();
      await page.getByText("Basura · bolsa negra", { exact: true }).click();
      await expect(page.getByText(/Pasa los\s+lunes, miércoles y sábado/)).toBeVisible();
      await expect(page.getByRole("main")).not.toContainText(/\.\./); // sin puntos dobles tras «a. m.» / «p. m.»
    });
  }

  test("muestra todas las organizaciones cuando las rutas se cruzan", async ({ page }, info) => {
    await consultar(page, "Calle 10 Sur # 82-15");
    const rutas = page.getByRole("region", { name: "Organizaciones que pasan por tu cuadra" });
    const filas = rutas.getByRole("listitem");
    await expect(filas).toHaveCount(2);
    await expect(filas.nth(0)).toContainText("Red de Recicladoras de Kennedy");
    await expect(filas.nth(1)).toContainText("Recuperadores de Occidente");
    await expect(page.getByText("Puedes entregar la bolsa blanca a cualquiera de estas organizaciones.")).toBeVisible();
    // Lunes 8:00 a. m.: la ruta de los lunes ya pasó; la siguiente es la del miércoles.
    await expect(page.getByRole("heading", { level: 2, name: "Miércoles 11 de noviembre" })).toBeVisible();
    const ficha = await rutas.boundingBox();
    const aviso = await page.getByRole("region", { name: "Aviso la noche anterior" }).boundingBox();
    if (info.project.name === "escritorio") {
      expect(ficha!.x + ficha!.width).toBeLessThan(aviso!.x);
    } else {
      expect(ficha!.y + ficha!.height).toBeLessThan(aviso!.y);
    }
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
        await expect(page.getByRole("heading", { name: organizacion })).toBeVisible();
      });
    }
  });

  test("dice con honestidad que no hay ruta y permite pedir aviso", async ({ page }) => {
    await consultar(page, "Calle 42 Sur # 78-15");
    await expect(page.getByRole("heading", { name: "Esta cuadra no tiene una ruta de prueba" })).toBeVisible();
    await page.getByRole("button", { name: "Guardar solicitud de prueba" }).click();
    await expect(page.getByText("Solicitud de prueba guardada")).toBeVisible();
    await sinViolacionesDeAccesibilidad(page);

    await page.goto("/mis-avisos");
    await expect(page.getByRole("heading", { name: "Solicitudes de aviso" })).toBeVisible();
    await expect(page.getByText("Calle 42 Sur entre Carrera 78 y Carrera 79")).toBeVisible();
  });

  test("una dirección real copiada del recibo, con apartamento, recibe horario", async ({ page }) => {
    await consultar(page, "Carrera 15 # 127-40 Torre 3 Apto 502");
    await expect(page.getByText("Carrera 15 # 127-40", { exact: true })).toBeVisible();
    await expect(page.getByText(/Próxima recolección de reciclaje/)).toBeVisible();
    await expect(page.getByRole("main")).not.toContainText("Apto 502");
  });

  test("valida el formato y el rango sin perder lo escrito", async ({ page }) => {
    await consultar(page, "mi casa");
    await expect(page.getByRole("main").getByRole("alert")).toContainText("Calle 65 Sur # 80-12");
    await expect(page.getByLabel("Dirección", { exact: true })).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Dirección", { exact: true })).toHaveValue("mi casa");
    await expect(page.getByLabel("Dirección", { exact: true })).toBeFocused();

    await consultar(page, "Calle 500 # 1-1");
    await expect(page.getByRole("main").getByRole("alert")).toContainText("no parece estar en Bogotá");

    await consultar(page, "");
    await expect(page.getByRole("main").getByRole("alert")).toContainText("Escribe tu dirección");
  });

  test("permite corregir la consulta sin perder lo escrito", async ({ page }) => {
    await consultar(page, "cl 65 s 80 12");
    const resultado = page.getByRole("region", { name: "Resultado de la consulta" });
    await expect(resultado).toBeFocused();
    await page.getByRole("button", { name: "Cambiar dirección" }).click();
    const campo = page.getByLabel("Dirección", { exact: true });
    await expect(campo).toBeFocused();
    await expect(campo).toHaveValue("cl 65 s 80 12");
  });

  test("el ejemplo se puede consultar sin escribir", async ({ page }) => {
    await page.getByText("Probar con un ejemplo", { exact: true }).click();
    await page.getByRole("button", { name: /Chapinero/ }).click();
    await expect(page.getByRole("heading", { level: 2, name: "Mañana, martes 10 de noviembre" })).toBeVisible();
  });

  test("un enlace de ejemplo sigue funcionando con solo su identificador", async ({ page }) => {
    await page.goto("/reciclaje?ejemplo=suba");
    await expect(page.getByRole("heading", { name: "Red de Recicladoras de Suba" })).toBeVisible();
  });

  test("distingue el horario de una zona cercana y no permite asociarlo a la cuadra", async ({ page }) => {
    await consultar(page, "Calle 30 # 2-10");
    await expect(page.getByText("Horario de ejemplo de una zona cercana")).toBeVisible();
    await expect(page.getByText("Zona de referencia: Santa Fe y La Candelaria")).toBeVisible();
    await expect(page.getByText("Configurar aviso de prueba")).toHaveCount(0);
    await expect(page.getByText("Reportar que no pasaron")).toHaveCount(0);
    await page.getByRole("button", { name: "Probar con un ejemplo" }).click();
    await expect(page.getByRole("button", { name: /Chapinero/ })).toBeVisible();
  });

  test("advierte cuando la ventana de hoy está en curso", async ({ page }) => {
    await fijarHora(page, new Date("2026-11-10T06:30:00-05:00"));
    await consultar(page, "Calle 65 Sur # 80-12");
    await expect(page.getByRole("heading", { name: "Hoy, martes 10 de noviembre" })).toBeVisible();
    await expect(page.getByText(/La ruta puede estar pasando/)).toBeVisible();
    await expect(page.getByText(/Saca la bolsa blanca poco antes/)).toHaveCount(0);
  });

  test("consultar no guarda la dirección ni la incluye en la URL", async ({ page }) => {
    await page.goto("/reciclaje");
    await page.getByLabel("Dirección", { exact: true }).fill("Calle 65 Sur # 80-12");
    const datosFormulario = await page.getByRole("search").evaluate((formulario: HTMLFormElement) => Array.from(new FormData(formulario)));
    expect(datosFormulario).toEqual([]);
    await page.getByRole("button", { name: "Consultar horario" }).click();
    await expect(page).toHaveURL(/\/reciclaje$/);
    expect(await page.evaluate(() => Object.keys(localStorage).filter((clave) => clave.startsWith("reciclamos.")))).toEqual([]);
  });
});

test.describe("usar mi ubicación", () => {
  test("muestra un horario de referencia con permiso y permite volver a la dirección", async ({ page, context }) => {
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 4.6205, longitude: -74.1905 });

    const direccion = page.getByLabel("Dirección", { exact: true });
    await direccion.fill("Calle 145 # 91-19");
    await page.getByRole("button", { name: "Usar mi ubicación" }).click();

    const resultado = page.getByRole("region", { name: "Resultado de la consulta" });
    await expect(resultado).toBeFocused();
    await expect(resultado.getByText("Ubicación aproximada en Bosa")).toBeVisible();
    await expect(resultado.getByText("Horario de ejemplo de una zona cercana")).toBeVisible();
    await expect(resultado.getByText("Configurar aviso de prueba")).toHaveCount(0);
    await expect(resultado.getByText("Reportar que no pasaron")).toHaveCount(0);
    const rutas = resultado.getByRole("region", { name: "Rutas de referencia" });
    await expect(rutas.getByRole("heading", { name: "Asociación Recicladores del Sur" })).toBeVisible();
    await expect(page).toHaveURL(/\/reciclaje$/);
    expect(await page.evaluate(() => Object.keys(localStorage).filter((clave) => clave.startsWith("reciclamos.")))).toEqual([]);
    await sinViolacionesDeAccesibilidad(page);

    await resultado.getByRole("button", { name: "Escribir mi dirección" }).click();
    await expect(direccion).toBeFocused();
    await expect(direccion).toHaveValue("Calle 145 # 91-19");
  });

  test("permite seguir con una dirección si la ubicación está fuera de Bogotá", async ({ page, context }) => {
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 6.2442, longitude: -75.5812 });
    await page.getByRole("button", { name: "Usar mi ubicación" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("fuera de Bogotá");
    await consultar(page, "Calle 65 Sur # 80-12");
    await expect(page.getByRole("heading", { name: "Mañana, martes 10 de noviembre" })).toBeVisible();
  });

  test("explica cómo seguir si se rechaza el permiso", async ({ page }) => {
    await page.getByRole("button", { name: "Usar mi ubicación" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("No diste permiso para usar tu ubicación");
    await expect(page.getByLabel("Dirección", { exact: true })).toBeEnabled();
  });

  test("una ubicación que llega tarde no reemplaza la consulta manual", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.geolocation.getCurrentPosition = (mostrar) => {
        window.addEventListener("resolver-ubicacion", () => {
          mostrar({ coords: { latitude: 4.6205, longitude: -74.1905 } } as GeolocationPosition);
        }, { once: true });
      };
    });
    await page.reload();
    await page.getByRole("button", { name: "Usar mi ubicación" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Buscando tu ubicación…" })).toBeVisible();
    await consultar(page, "Calle 145 # 91-19");
    await page.evaluate(() => window.dispatchEvent(new Event("resolver-ubicacion")));
    const resultado = page.getByRole("region", { name: "Resultado de la consulta" });
    await expect(resultado.getByText("Calle 145 # 91-19", { exact: true })).toBeVisible();
    await expect(resultado.getByText("Ubicación aproximada en Bosa")).toHaveCount(0);
  });
});
