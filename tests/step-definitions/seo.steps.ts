import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures/fixtures';

const { Then } = createBdd(test);

Then('debe existir un meta description no vacío', async ({ page }) => {
  // Sin .first(): tras corregir BUG-APP-001 debe existir exactamente uno,
  // así que el modo estricto de Playwright actúa como red de regresión.
  const content = await page.locator('meta[name="description"]').getAttribute('content');
  expect(content?.trim().length ?? 0).toBeGreaterThan(0);
});

Then('debe existir un link canonical', async ({ page }) => {
  const href = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(href).toContain('packexpress.com.uy');
});

Then('debe existir el meta {string}', async ({ page }, property: string) => {
  const content = await page.locator(`meta[property="${property}"]`).getAttribute('content');
  expect(content?.trim().length ?? 0).toBeGreaterThan(0);
});

Then('no debe haber meta tags ni canonical duplicados', async ({ page }) => {
  const counts = await page.evaluate(() => ({
    description: document.querySelectorAll('meta[name="description"]').length,
    canonical: document.querySelectorAll('link[rel="canonical"]').length,
    ogTitle: document.querySelectorAll('meta[property="og:title"]').length,
    ogDescription: document.querySelectorAll('meta[property="og:description"]').length,
    robots: document.querySelectorAll('meta[name="robots"]').length,
  }));
  expect(counts).toEqual({
    description: 1,
    canonical: 1,
    ogTitle: 1,
    ogDescription: 1,
    robots: 1,
  });
});

Then('debe existir al menos un script JSON-LD parseable', async ({ page }) => {
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(scripts.length).toBeGreaterThan(0);
  for (const raw of scripts) {
    expect(() => JSON.parse(raw)).not.toThrow();
  }
});
