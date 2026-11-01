import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures/fixtures';
import { scrollToLazySection } from '../helpers/lazySections';

const { Given, When, Then } = createBdd(test);

Given('el visitante navega a la home', async ({ homePage }) => {
  await homePage.goto('/');
});

Given(
  'el visitante navega a la home con hash {string}',
  async ({ homePage }, hash: string) => {
    await homePage.goto(`/${hash}`);
  }
);

Given('el visitante navega a la ruta inválida {string}', async ({ homePage }, path: string) => {
  await homePage.goto(path);
});

// Estas secciones son lazy (LazySection + useInViewMount): no existen en el DOM
// hasta que el scroll las acerca al viewport, así que primero se provoca el
// scroll y recién después se espera el elemento. Ver helpers/lazySections.ts.
When('el visitante hace scroll hasta el final de la página', async ({ page }) => {
  await scrollToLazySection(page, page.locator('footer'));
});

Given('el visitante hace scroll hasta el footer', async ({ page }) => {
  await scrollToLazySection(page, page.locator('footer'));
});

Given('el visitante hace scroll hasta el formulario de contacto', async ({ page, contactForm }) => {
  await scrollToLazySection(page, contactForm.form);
});

Given('el visitante hace scroll hasta la sección de documentos', async ({ page }) => {
  await scrollToLazySection(page, page.locator('#contacto'));
});

Given('el visitante hace scroll hasta la sección de rastreo', async ({ tracking }) => {
  await tracking.section.scrollIntoViewIfNeeded();
});

When('el visitante recarga la página', async ({ page }) => {
  await page.reload();
});

Then('el título de la página debe contener {string}', async ({ page }, text: string) => {
  await expect(page).toHaveTitle(new RegExp(text));
});

Then('el encabezado principal \\(H1) debe ser visible', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

Then('no deben registrarse errores de consola', async ({ consoleErrors }) => {
  expect(consoleErrors, `Errores de consola:\n${consoleErrors.join('\n')}`).toHaveLength(0);
});

Then('el navbar debe estar visible con el logo de Pack Express', async ({ navbar }) => {
  await navbar.assertLoaded();
});

Then('el footer debe mostrar el teléfono {string}', async ({ page }, phone: string) => {
  await expect(page.locator('footer').getByText(phone)).toBeVisible();
});
