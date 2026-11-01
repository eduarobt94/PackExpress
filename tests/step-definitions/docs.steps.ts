import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures/fixtures';

const { Then, When } = createBdd(test);

/**
 * Cada documento (DocRow en Docs.jsx) es un único <a> (con href, descarga/
 * ver-documento) o <button> (abre LegalModal) cuyo nombre accesible incluye
 * el título completo del documento — no hace falta anidar selectors.
 */
function docRow(page: import('@playwright/test').Page, docTitle: string) {
  const byLink = page.getByRole('link', { name: new RegExp(docTitle) });
  const byButton = page.getByRole('button', { name: new RegExp(docTitle) });
  return byLink.or(byButton);
}

Then('el link {string} de {string} debe responder 200', async ({ page, request }, _action: string, docTitle: string) => {
  const href = await docRow(page, docTitle).getAttribute('href');
  expect(href, `El documento "${docTitle}" no tiene href (¿es un modal, no un link?)`).toBeTruthy();
  const res = await request.get(href as string);
  expect(res.status(), `${href} respondió ${res.status()}`).toBe(200);
});

When('el visitante hace click en {string} de {string}', async ({ page }, _action: string, docTitle: string) => {
  await docRow(page, docTitle).click();
});

Then('el modal legal debe estar abierto con el título {string}', async ({ legalModal }, title: string) => {
  await legalModal.assertOpenWithTitle(title);
});
