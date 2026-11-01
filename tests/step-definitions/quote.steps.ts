import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures/fixtures';

const { Given, When, Then } = createBdd(test);

Given('el visitante abre el cotizador', async ({ navbar, quoteModal }) => {
  await navbar.openCotizador();
  await quoteModal.waitForOpen();
});

When('el visitante cierra el cotizador con el botón de cerrar', async ({ quoteModal }) => {
  await quoteModal.close();
});

// Regresión de BUG-APP-005 (corregido): el backdrop con onClick estaba
// tapado por un div hermano (z-91 > z-90) sin handler, así que el click
// nunca llegaba a cerrar el modal. El handler se movió a ese contenedor.
When('el visitante clickea fuera del modal de cotización', async ({ quoteModal }) => {
  await quoteModal.closeViaBackdropClick();
});

When('el visitante presiona Escape', async ({ page }) => {
  await page.keyboard.press('Escape');
});

Then('el modal de cotización no debe estar visible', async ({ quoteModal }) => {
  await quoteModal.waitForClosed();
});

When('el visitante busca el país {string} en el selector', async ({ quoteModal }, term: string) => {
  await quoteModal.openCountrySelect();
  await quoteModal.searchCountry(term);
});

Then('la opción {string} debe estar visible en la lista', async ({ page }, name: string) => {
  await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
});

Then('debe verse el texto {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible();
});

When('el visitante selecciona el país {string}', async ({ quoteModal }, name: string) => {
  await quoteModal.selectCountry(name);
});

Then('el selector de país debe mostrar {string}', async ({ quoteModal }, name: string) => {
  await expect(quoteModal.countrySelectButton).toHaveText(new RegExp(name));
});

Then('el botón de cotizar debe estar deshabilitado', async ({ quoteModal }) => {
  await quoteModal.assertCotizarDisabled();
});

When('el visitante selecciona el tipo de envío {string}', async ({ quoteModal }, tipo: string) => {
  if (tipo === 'Documentos') await quoteModal.selectTipoDocumentos();
  else await quoteModal.selectTipoPaquete();
});

Then('el tipo de envío {string} debe estar marcado como seleccionado', async ({ page }, tipo: string) => {
  const button = page.getByRole('button', { name: new RegExp(tipo) });
  // El navegador normaliza el atributo style (espacios tras comas en rgba);
  // se valida vía color computado en vez de comparar el string crudo.
  await expect(button).toHaveCSS('border-color', 'rgba(255, 107, 0, 0.45)');
});
