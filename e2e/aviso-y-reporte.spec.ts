import { expect, test } from "@playwright/test";
import { consultar, fijarHora, sinDesbordeHorizontal, sinViolacionesDeAccesibilidad } from "./apoyo";

test.beforeEach(async ({ page }) => {
  await fijarHora(page);
  await page.goto("/reciclaje");
  await consultar(page, "Calle 65 Sur # 80-12");
});

test("activa el aviso solo con autorización, guarda la cuadra y no la dirección", async ({ page }) => {
  const activar = page.getByRole("button", { name: "Activar aviso" });
  await expect(activar).toBeDisabled();
  await page.getByLabel(/Autorizo guardar solo mi cuadra/).check();
  await activar.click();

  await expect(page.getByText("Aviso activo")).toBeVisible();
  await expect(page.getByText("Te avisamos hoy a las 9:00 p. m.")).toBeVisible();
  await expect(page.getByRole("main")).not.toContainText(/\.\./);

  await page.getByRole("button", { name: "Ver cómo llega el aviso" }).click();
  const notificacion = page.getByRole("status").filter({ hasText: "Mañana pasa el reciclaje por tu cuadra" });
  await expect(notificacion).toContainText("entre 5:00 y 7:00 a. m.");
  const caja = await notificacion.boundingBox();
  expect(caja?.y ?? 999, "la notificación se ve arriba de la pantalla").toBeLessThan(40);
  await page.getByRole("button", { name: "Cerrar vista previa" }).click();
  await expect(notificacion).toBeHidden();

  // Privacidad: nada de lo guardado contiene la dirección ni la placa.
  const guardado = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  expect(guardado).toContain("Calle 65 Sur entre Carrera 80 y Carrera 81");
  expect(guardado).not.toContain("80-12");
  expect(guardado).not.toContain("# 80");

  await page.goto("/mis-avisos");
  await expect(page.getByRole("heading", { name: "Aviso activo" })).toBeVisible();
  await expect(page.getByText(/Hoy a las 9:00 p\. m\., para la recolección del martes 10 de noviembre/)).toBeVisible();
  await sinViolacionesDeAccesibilidad(page);

  await page.goto("/");
  await expect(page.getByText("Tu aviso está activo")).toBeVisible();

  await page.goto("/mis-avisos");
  await page.getByRole("button", { name: "Cancelar aviso" }).click();
  await expect(page.getByText("No tienes un aviso activo.")).toBeVisible();
});

test("un aviso nuevo en otra cuadra advierte que reemplaza al anterior", async ({ page }) => {
  await page.getByLabel(/Autorizo guardar solo mi cuadra/).check();
  await page.getByRole("button", { name: "Activar aviso" }).click();
  await consultar(page, "Calle 145 # 91-19");
  await expect(page.getByText(/Ya tienes un aviso para Calle 65 Sur entre Carrera 80 y Carrera 81/)).toBeVisible();
});

test("el reporte «¿No pasaron?» llega a la organización y su respuesta vuelve al ciudadano", async ({ page }) => {
  await page.getByRole("button", { name: "Reportar que no pasaron" }).click();
  await page.getByRole("button", { name: "Enviar reporte" }).click();
  await expect(page.getByText("Elige qué pasó para poder enviar el reporte.")).toBeVisible();

  await page.getByLabel("Pasó el camión de la basura antes").check();
  await expect(page.getByLabel("¿Qué día?")).toHaveValue("2026-11-06"); // último viernes de paso
  await page.getByLabel(/Comentario/).fill("La bolsa sigue en la esquina.");
  await sinViolacionesDeAccesibilidad(page);
  await page.getByRole("button", { name: "Enviar reporte" }).click();

  await expect(page.getByRole("heading", { name: "Reporte enviado" })).toBeVisible();
  const numero = (await page.locator("strong.font-mono").textContent())?.trim() ?? "";
  expect(numero).toMatch(/^R-[A-Z2-9]{6}$/);

  await page.goto("/mis-avisos");
  const mio = page.locator("li").filter({ hasText: numero });
  await expect(mio).toContainText("Enviado");
  await expect(mio).toContainText("La bolsa sigue en la esquina.");

  await page.goto("/organizaciones");
  await page.getByLabel("Organización").selectOption({ label: "Asociación Recicladores del Sur" });
  const recibido = page.locator("li").filter({ hasText: numero });
  await expect(recibido).toContainText("Pendiente");
  await recibido.getByRole("button", { name: "Responder" }).click();
  await expect(recibido.getByRole("alert")).toContainText("Escribe una respuesta");
  await recibido.getByLabel(`Respuesta al reporte ${numero}`).fill("Mañana pasamos a las 5:30 a. m.");
  await recibido.getByRole("button", { name: "Responder" }).click();
  await expect(recibido).toContainText("Respondido");
  await sinViolacionesDeAccesibilidad(page);
  await sinDesbordeHorizontal(page);

  await page.goto("/mis-avisos");
  await expect(page.locator("li").filter({ hasText: numero })).toContainText("Mañana pasamos a las 5:30 a. m.");
});

test("con dos organizaciones, el reporte deja escoger cuál debía pasar", async ({ page }) => {
  await consultar(page, "Calle 10 Sur # 82-15");
  await page.getByRole("button", { name: "Reportar que no pasaron" }).click();
  await page.getByLabel("Red de Recicladoras de Kennedy").check();
  // Esa ruta pasa miércoles y sábado: su último paso fue el sábado 7.
  await expect(page.getByLabel("¿Qué día?")).toHaveValue("2026-11-07");
  await page.getByLabel("No pasó el reciclador").check();
  await page.getByRole("button", { name: "Enviar reporte" }).click();
  await expect(page.getByText(/Le llegó a\s+Red de Recicladoras de Kennedy/)).toBeVisible();
});

test("borrar mis datos limpia aviso y reportes", async ({ page }) => {
  await page.getByLabel(/Autorizo guardar solo mi cuadra/).check();
  await page.getByRole("button", { name: "Activar aviso" }).click();
  await page.goto("/mis-avisos");
  await page.getByRole("button", { name: "Borrar mis datos" }).click();
  await page.getByRole("button", { name: "Sí, borrar" }).click();
  await expect(page.getByText("No tienes un aviso activo.")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("reciclamos.aviso.v1"))).toBe("null");
});
