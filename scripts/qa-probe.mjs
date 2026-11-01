/**
 * qa-probe.mjs — verificación directa de los fixes de docs/QA_BUGS.md.
 * Requiere `npx vite preview --port 5173 --strictPort` corriendo aparte.
 */
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const results = [];

// ── BUG-APP-005a: backdrop cierra el Cotizador ──
{
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  await page.getByRole('navigation').getByRole('button', { name: /^Cotizar$/ }).click();
  await page.getByRole('heading', { name: /Calculá tu envío/ }).waitFor({ state: 'visible' });
  await page.mouse.click(5, 5);
  await page.waitForTimeout(700);
  const visible = await page.getByRole('heading', { name: /Calculá tu envío/ }).isVisible();
  results.push(['BUG-APP-005a Cotizador cierra con click fuera', !visible]);
  await page.close();
}

// ── BUG-APP-005b: backdrop cierra el LegalModal ──
{
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  await page.locator('footer').last().scrollIntoViewIfNeeded();
  await page.locator('footer').last().getByText('Términos y Condiciones', { exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  await page.mouse.click(5, 5);
  await page.waitForTimeout(700);
  const visible = await page.getByRole('dialog').isVisible().catch(() => false);
  results.push(['BUG-APP-005b LegalModal cierra con click fuera', !visible]);
  await page.close();
}

// ── BUG-APP-007: botón "Cerrar menú" clickeable en mobile ──
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Cerrar menú' }).waitFor({ state: 'visible' });
  let ok = true;
  try {
    await page.getByRole('button', { name: 'Cerrar menú' }).click({ timeout: 6000 });
  } catch { ok = false; }
  results.push(['BUG-APP-007 menú móvil se cierra con la X', ok]);
  await page.close();
}

// ── BUG-APP-004: validación custom de email visible ──
{
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  await page.locator('#contacto form').scrollIntoViewIfNeeded();
  await page.getByLabel('Nombre completo').fill('Juan QA');
  await page.getByLabel('Email', { exact: true }).fill('no-es-email');
  await page.getByLabel('Teléfono').fill('+598 99 123 456');
  await page.getByLabel('Asunto').selectOption('Consulta general');
  await page.getByLabel('Mensaje').fill('mensaje de prueba suficientemente largo');
  await page.locator('#contacto form button[type="submit"]').click();
  await page.waitForTimeout(600);
  const errs = await page.locator('#contacto form p.text-red-400').allTextContents();
  results.push(['BUG-APP-004 muestra "Email inválido"', errs.includes('Email inválido')]);
  await page.close();
}

// ── BUG-APP-001: meta tags sin duplicar ──
{
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  await page.waitForTimeout(800);
  const counts = await page.evaluate(() => ({
    description: document.querySelectorAll('meta[name="description"]').length,
    canonical: document.querySelectorAll('link[rel="canonical"]').length,
    ogTitle: document.querySelectorAll('meta[property="og:title"]').length,
    footer: document.querySelectorAll('footer').length,
  }));
  results.push(['BUG-APP-001 meta description único', counts.description === 1]);
  results.push(['BUG-APP-001 canonical único', counts.canonical === 1]);
  results.push(['BUG-APP-001 og:title único', counts.ogTitle === 1]);
  results.push(['BUG-APP-006 un solo <footer>', counts.footer === 1]);
  await page.close();
}

// ── BUG-APP-003: el loop de Three.js se detiene tras converger ──
{
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  await page.waitForTimeout(6000); // dar tiempo a que las partículas converjan
  const frames = await page.evaluate(
    () =>
      new Promise((resolve) => {
        let n = 0;
        const t0 = performance.now();
        const tick = () => {
          n++;
          if (performance.now() - t0 < 1000) requestAnimationFrame(tick);
          else resolve(n);
        };
        requestAnimationFrame(tick);
      })
  );
  // Solo informativo: no se puede contar los rAF de Three.js desde fuera.
  console.log(`   (rAF del propio probe en 1s: ${frames} — referencia de fps)`);
  await page.close();
}

await browser.close();

let failed = 0;
for (const [name, ok] of results) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}
console.log(`\n${results.length - failed}/${results.length} verificaciones OK`);
process.exit(failed > 0 ? 1 : 0);
