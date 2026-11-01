import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures/fixtures';

const { When, Then } = createBdd(test);

When('el visitante hace click en {string} sin ingresar ningún número', async ({ tracking }, _label: string) => {
  await tracking.rastrearButton.click();
});

Then('debe verse el mensaje de validación {string}', async ({ tracking }, message: string) => {
  await expect(tracking.section.getByRole('alert')).toHaveText(message);
});

Then('no debe dispararse ninguna búsqueda contra la API', async ({ tracking }) => {
  // Proxy práctico: si track() se hubiera disparado, el botón mostraría el
  // spinner de carga (phase=SEARCHING) — registrar un listener de red acá
  // llegaría tarde, el click ya ocurrió en el step anterior.
  await expect(tracking.rastrearButton).toBeEnabled();
});

When(
  'el visitante ingresa la guía {string} en el input rápido del Hero',
  async ({ tracking }, numero: string) => {
    await tracking.searchFromHero(numero);
  }
);

Then('la sección de rastreo debe quedar visible en pantalla', async ({ tracking }) => {
  await tracking.assertScrolledIntoView();
});

Then('el campo de número de guía debe contener {string}', async ({ tracking }, numero: string) => {
  await tracking.assertGuiaValuePropagated(numero);
});

When('el visitante busca la guía {string}', async ({ tracking }, numero: string) => {
  await tracking.searchGuia(numero);
});

Then('debe verse un mensaje de error de rastreo', async ({ tracking }) => {
  await tracking.assertErrorVisible();
});
