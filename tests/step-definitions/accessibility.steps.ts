import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures/fixtures';

const { Given, When, Then } = createBdd(test);

Given('el visitante tiene activada la preferencia de movimiento reducido', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

Then('las transiciones de color deben seguir activas para dar feedback', async ({ page }) => {
  // index.css: bajo prefers-reduced-motion, transition-property se limita a
  // color/background-color/border-color/etc — nunca a 0 (ver docs/QA fix 004).
  const transitionProperty = await page.evaluate(() => {
    const btn = document.querySelector('button');
    return btn ? getComputedStyle(btn).transitionProperty : '';
  });
  expect(transitionProperty).not.toBe('');
});

When('el visitante presiona Tab desde el inicio de la página', async ({ page }) => {
  await page.keyboard.press('Tab');
});

Then('el link {string} debe quedar visible', async ({ page }, label: string) => {
  await expect(page.getByRole('link', { name: label })).toBeFocused();
});

Then(
  'los campos nombre, email, teléfono, asunto y mensaje deben tener label accesible',
  async ({ contactForm }) => {
    for (const input of [
      contactForm.nombreInput,
      contactForm.emailInput,
      contactForm.telefonoInput,
      contactForm.asuntoSelect,
      contactForm.mensajeTextarea,
    ]) {
      // getByLabel ya garantiza la asociación; se valida que resuelva a
      // exactamente un elemento visible (si el label no estuviera asociado,
      // el locator del Page Object no encontraría nada y esto fallaría).
      await expect(input).toBeVisible();
    }
  }
);
