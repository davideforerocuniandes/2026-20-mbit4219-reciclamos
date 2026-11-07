import { expect, test } from "@playwright/test";
import { EJEMPLOS } from "../src/features/rutas/ejemplos";
import { consultar, fijarHora, sinDesbordeHorizontal, sinViolacionesDeAccesibilidad } from "./apoyo";

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
    await expect(page.getByText("Prototipo académico · Datos ficticios")).toBeVisible();
    await sinDesbordeHorizontal(page);
    await sinViolacionesDeAccesibilidad(page);
    expect(errores).toEqual([]);
  });
}

test("Inicio abre la consulta y destaca la sección activa", async ({ page }, info) => {
  await page.goto("/");
  const secciones = page.getByRole("navigation", { name: "Secciones" });
  const enlaces = secciones.getByRole("link");
  const esMovil = info.project.name === "telefono";
  const esperados = ["Inicio", "Reciclaje", "Mis avisos", "Organizaciones"];
  if (!esMovil) esperados.push("Acerca");
  await expect(enlaces).toHaveText(esperados);
  await expect(secciones.getByRole("link", { name: "Inicio" })).toHaveAttribute("aria-current", "page");

  const consultarHorario = page.getByRole("main").getByRole("link", { name: /¿Cuándo saco el reciclaje?/ });
  await expect(consultarHorario).toHaveCSS("background-color", "rgb(249, 210, 72)");
  await consultarHorario.click();
  await expect(page).toHaveURL(/\/reciclaje$/);
  await expect(secciones.getByRole("link", { name: "Reciclaje" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByLabel("Dirección", { exact: true })).toBeVisible();
  await consultar(page, "Calle 65 Sur # 80-12");
  await expect(page.getByRole("heading", { name: "Mañana, martes 10 de noviembre" })).toBeVisible();

  await secciones.getByRole("link", { name: "Mis avisos" }).click();
  await expect(secciones.getByRole("link", { name: "Mis avisos" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("link", { name: "Consultar mi horario" })).toHaveAttribute("href", "/reciclaje");

  const acerca = (esMovil ? page.getByRole("banner") : secciones).getByRole("link", { name: "Acerca", exact: true });
  await acerca.click();
  await expect(acerca).toHaveAttribute("aria-current", "page");
  await page.getByText("Cómo se conectaría con la SuperApp", { exact: true }).click();
  await expect(page.getByText(/IDECA serviría/)).toBeVisible();
  await page.getByRole("link", { name: "Probar con un ejemplo" }).click();
  await expect(page).toHaveURL(/\/reciclaje\?ejemplo=bosa$/);
  await expect(page.getByRole("heading", { name: "Mañana, martes 10 de noviembre" })).toBeVisible();
});

test("cada tarjeta de Inicio abre su ejemplo con solo el identificador", async ({ page }) => {
  for (const ejemplo of EJEMPLOS) {
    await page.goto("/");
    await page.getByRole("main").getByRole("link", { name: new RegExp(ejemplo.etiqueta + " ·") }).filter({ hasText: ejemplo.direccion }).click();
    await expect(page).toHaveURL(new RegExp(`/reciclaje\\?ejemplo=${ejemplo.id}$`));
    await expect(page.getByRole("region", { name: "Resultado de la consulta" }).getByText(ejemplo.direccion, { exact: true })).toBeVisible();
  }
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
  const resultado = page.getByRole("region", { name: "Resultado de la consulta" });
  await expect(resultado).toBeFocused();
  await expect(resultado).toHaveAccessibleDescription(/Mañana, martes 10 de noviembre La ruta pasa entre 5:00 y 7:00 a\. m\./);
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
  await page.getByText("Reportar que no pasaron", { exact: true }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${carpeta}/reporte-formulario.png`, fullPage: true });
  await page.getByText("Configurar aviso de prueba").click();
  await page.getByLabel(/Autorizo guardar solo mi cuadra/).check();
  await page.getByRole("button", { name: "Activar aviso de prueba" }).click();
  await page.getByText("Ver vista previa del aviso", { exact: true }).click();
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
    await page.getByText("Reportar que no pasaron", { exact: true }).click();
    await expect(page.getByRole("button", { name: "Guardar reporte de prueba" })).toBeVisible();
    await sinDesbordeHorizontal(page);
  }
});

test("las pantallas fluyen con texto ampliado y el foco queda sobre la barra inferior", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const ruta of ["/", "/mis-avisos", "/organizaciones", "/acerca", "/reciclaje"]) {
    await page.goto(ruta);
    await page.addStyleTag({ content: "html { font-size: 200%; }" });
    await sinDesbordeHorizontal(page);
  }

  await consultar(page, "Calle 65 Sur # 80-12");
  await page.getByText("Configurar aviso de prueba").click();
  await page.getByText("Reportar que no pasaron", { exact: true }).click();
  await sinDesbordeHorizontal(page);
  await page.getByRole("button", { name: "Guardar reporte de prueba" }).focus();
  await page.keyboard.press("Tab");
  const cerrar = page.getByRole("button", { name: "Cerrar formulario" });
  await expect(cerrar).toBeFocused();
  const caja = await cerrar.boundingBox();
  const barra = await page.getByRole("navigation", { name: "Secciones" }).boundingBox();
  expect(caja).not.toBeNull();
  expect(barra).not.toBeNull();
  expect(caja!.y + caja!.height).toBeLessThanOrEqual(barra!.y);
});
