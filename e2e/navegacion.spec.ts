import { expect, test } from "@playwright/test";
import { consultar, esTelefono, fijarHora, sinDesbordeHorizontal, sinViolacionesDeAccesibilidad } from "./apoyo";

const PAGINAS = [
  { ruta: "/", titulo: "Bogotá ya sabe cuándo sacar la basura. Ahora, el reciclaje." },
  { ruta: "/reciclaje", titulo: "¿Cuándo saco el reciclaje?" },
  { ruta: "/mis-avisos", titulo: "Mis avisos y reportes" },
  { ruta: "/organizaciones", titulo: "Rutas y reportes" },
  { ruta: "/acerca", titulo: "Sobre el prototipo" },
] as const;

test.beforeEach(async ({ page }) => {
  await fijarHora(page);
});

for (const { ruta, titulo } of PAGINAS) {
  test(`${ruta} carga sin errores, es accesible y no se desborda`, async ({ page }) => {
    const errores: string[] = [];
    page.on("pageerror", (e) => errores.push(e.message));
    page.on("console", (m) => m.type() === "error" && errores.push(m.text()));

    await page.goto(ruta);
    await expect(page.getByRole("heading", { level: 1, name: titulo })).toBeVisible();
    await expect(page.getByText("Prototipo académico · datos ficticios")).toBeVisible();
    await sinDesbordeHorizontal(page);
    await sinViolacionesDeAccesibilidad(page);
    expect(errores).toEqual([]);
  });
}

test("la navegación se adapta: barra inferior en teléfono, lateral en escritorio", async ({ page }) => {
  await page.goto("/");
  const inferior = page.locator("nav.fixed");
  const lateral = page.locator("aside nav");
  if (esTelefono(page)) {
    await expect(inferior).toBeVisible();
    await expect(lateral).toBeHidden();
    await inferior.getByRole("link", { name: "Mis avisos" }).click();
  } else {
    await expect(lateral).toBeVisible();
    await expect(inferior).toBeHidden();
    await lateral.getByRole("link", { name: "Mis avisos" }).click();
  }
  await expect(page).toHaveURL(/\/mis-avisos$/);
  await expect(page.getByRole("link", { name: "Mis avisos", exact: true }).first()).toHaveAttribute("aria-current", "page");
});

test("el enlace para saltar al contenido funciona con teclado", async ({ page }) => {
  await page.goto("/acerca");
  await page.keyboard.press("Tab");
  const saltar = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(saltar).toBeFocused();
  await saltar.press("Enter");
  await expect(page).toHaveURL(/#contenido$/);
});

test("la consulta se puede hacer solo con teclado", async ({ page }) => {
  await page.goto("/reciclaje");
  await page.getByLabel("Dirección", { exact: true }).focus();
  await page.keyboard.type("Calle 65 Sur # 80-12");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 2, name: "Mañana, martes 10 de noviembre" })).toBeVisible();
});

test("una ruta inexistente muestra la página 404 en español", async ({ page }) => {
  const respuesta = await page.goto("/no-existe");
  expect(respuesta?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Esta página no existe" })).toBeVisible();
  await page.getByRole("link", { name: "Volver al inicio" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("envía cabeceras de seguridad", async ({ request }) => {
  const r = await request.get("/");
  expect(r.headers()["x-content-type-options"]).toBe("nosniff");
  expect(r.headers()["x-frame-options"]).toBe("DENY");
  expect(r.headers()["permissions-policy"]).toContain("geolocation=(self)");
  expect(r.headers()["x-powered-by"]).toBeUndefined();
});

test("capturas de pantalla para revisión visual", async ({ page }, info) => {
  const carpeta = `test-results/capturas/${info.project.name}`;
  for (const { ruta } of PAGINAS) {
    await page.goto(ruta);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${carpeta}/${ruta === "/" ? "inicio" : ruta.slice(1)}.png`, fullPage: true });
  }
  await page.goto("/reciclaje");
  for (const [nombre, direccion] of [
    ["resultado-bosa", "Calle 65 Sur # 80-12"],
    ["resultado-kennedy", "Calle 10 Sur # 82-15"],
    ["resultado-sin-ruta", "Calle 42 Sur # 78-15"],
    ["resultado-usaquen", "Calle 120 # 7-30"],
    ["resultado-error", "mi casa"],
  ] as const) {
    await consultar(page, direccion);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${carpeta}/${nombre}.png`, fullPage: true });
  }
  await consultar(page, "Calle 65 Sur # 80-12");
  await page.getByRole("button", { name: "Reportar que no pasaron" }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${carpeta}/reporte-formulario.png`, fullPage: true });
  await page.getByLabel(/Autorizo guardar solo mi cuadra/).check();
  await page.getByRole("button", { name: "Activar aviso" }).click();
  await page.getByRole("button", { name: "Ver cómo llega el aviso" }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${carpeta}/aviso-vista-previa.png` });
});

test("no hay desborde horizontal en anchos intermedios (teléfono pequeño a escritorio)", async ({ page }, info) => {
  test.skip(info.project.name !== "escritorio", "basta con un perfil: el ancho se fija a mano");
  test.setTimeout(120_000);
  for (const ancho of [320, 360, 768, 1024, 1280]) {
    await page.setViewportSize({ width: ancho, height: 900 });
    for (const { ruta } of PAGINAS) {
      await page.goto(ruta);
      await sinDesbordeHorizontal(page);
    }
    await page.goto("/reciclaje");
    await consultar(page, "Calle 42 Sur # 78-15");
    await expect(page.getByText(/Tu cuadra:/)).toBeVisible();
    await sinDesbordeHorizontal(page);
    await consultar(page, "Calle 10 Sur # 82-15");
    await page.getByRole("button", { name: "Reportar que no pasaron" }).click();
    await expect(page.getByRole("button", { name: "Enviar reporte" })).toBeVisible();
    await sinDesbordeHorizontal(page);
  }
});
