import { defineConfig, devices } from "@playwright/test";

const PUERTO = 3100;

/**
 * Pruebas de punta a punta contra la compilación de producción, en dos
 * perfiles: teléfono (Pixel 7) y escritorio (1440 × 900). Usan el Chrome
 * instalado en el equipo (`channel: "chrome"`) para no descargar navegadores.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${PUERTO}`,
    locale: "es-CO",
    timezoneId: "America/Bogota",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "telefono", use: { ...devices["Pixel 7"], channel: "chrome" } },
    { name: "escritorio", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PUERTO} -H 127.0.0.1`,
    url: `http://127.0.0.1:${PUERTO}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
