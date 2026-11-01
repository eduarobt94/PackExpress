import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures/fixtures';

const { Before, After, BeforeAll } = createBdd(test);

BeforeAll(async () => {
  // eslint-disable-next-line no-console
  console.log(`[QA] Ejecutando contra BASE_URL=${process.env.BASE_URL ?? 'http://localhost:5173'}`);
});

Before(async ({ page }) => {
  // Cada escenario arranca desde una página en blanco — la navegación
  // explícita ocurre en los steps "Given" de cada feature (Data Isolation,
  // Fase 31: ningún escenario depende del estado dejado por otro).
  //
  // No se llama page.setDefaultTimeout() acá: sobrescribiría tanto el
  // actionTimeout como el navigationTimeout definidos en playwright.config.ts,
  // y el cold-start de Vite en dev (three.js/gsap/framer-motion sin bundlear
  // aún) puede tardar más que un timeout corto en la primera navegación.
  // DIAGNÓSTICO (Fase 34): esto causó un falso rojo en la primera corrida
  // real de esta suite — bug del framework de test, no de la aplicación.
});

// Escenarios @requires-backend dependen de `pack-sistema` (PHP), que no
// corre dentro de este repo (ver docs/QA_AUTOMATION_STRATEGY.md). Se
// skippean limpiamente en vez de fallar en rojo por un motivo ajeno al
// frontend — evita falsos negativos cuando el backend no está desplegado
// en el entorno de ejecución.
Before({ tags: '@requires-backend' }, async ({ backendAvailable }) => {
  test.skip(!backendAvailable, 'pack-sistema (backend PHP) no responde en este entorno — escenario skippeado.');
});

After(async ({ page }) => {
  // Evidencia adicional en fallo, más allá de lo que ya adjunta la config
  // (trace/screenshot/video "on-failure" vía playwright.config.ts).
  // testInfo no es un fixture inyectable en After() — se obtiene vía
  // test.info(), la API estable de Playwright para esto dentro de hooks.
  const testInfo = test.info();
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach('failure-screenshot-full-page', {
      body: screenshot,
      contentType: 'image/png',
    });
    await testInfo.attach('failure-url', {
      body: page.url(),
      contentType: 'text/plain',
    });
  }
});
