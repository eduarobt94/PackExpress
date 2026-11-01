import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures/fixtures';

const { Given, When, Then } = createBdd(test);

When('el visitante hace click en {string} del navbar', async ({ navbar }, label: string) => {
  if (label === 'Cotizar') {
    await navbar.openCotizador();
  } else {
    await navbar.gotoAnchor(label);
  }
});

When('el visitante hace click en {string} del Hero', async ({ page }, label: string) => {
  await page.getByRole('button', { name: label }).click();
});

When('el visitante hace click en el link {string} del footer', async ({ page }, label: string) => {
  await page.locator('footer').getByRole('link', { name: label, exact: true }).click();
});

Then('el modal de cotización debe estar abierto', async ({ quoteModal }) => {
  await quoteModal.waitForOpen();
});

Given('el visitante usa un viewport móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
});

When('el visitante abre el menú móvil', async ({ navbar }) => {
  await navbar.openMobileMenu();
});

When('el visitante cierra el menú móvil', async ({ navbar }) => {
  await navbar.closeMobileMenu();
});

Then('el menú móvil debe mostrar el botón de cerrar', async ({ navbar }) => {
  await expect(navbar.mobileDrawerCloseButton).toBeVisible();
});

Then('el botón de cerrar del menú móvil ya no debe estar visible', async ({ navbar }) => {
  await expect(navbar.mobileDrawerCloseButton).toBeHidden();
});

Given('el visitante anota el tema actual', async ({ navbar, world }) => {
  world.themeBefore = await navbar.getCurrentTheme();
});

When('el visitante cambia el tema', async ({ navbar }) => {
  await navbar.toggleTheme();
});

Then('el tema visual debe haber cambiado', async ({ navbar, world }) => {
  const after = await navbar.getCurrentTheme();
  expect(after).not.toBe(world.themeBefore);
});

Then('el tema debe seguir siendo el mismo que tras el cambio', async ({ navbar }) => {
  const persisted = await navbar.getPersistedTheme();
  const current = await navbar.getCurrentTheme();
  expect(current).toBe(persisted);
});

Then('debe verse la página de {string}', async ({ page }, _label: string) => {
  await expect(page.getByRole('heading', { name: 'Destino fuera de ruta.' })).toBeVisible();
});
