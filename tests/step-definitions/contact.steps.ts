import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures/fixtures';
import { VALID_CONTACT, MENSAJE_BOUNDARY_INVALID } from '../data/contact.data';

const { Given, When, Then } = createBdd(test);

When('el visitante envía el formulario de contacto sin completar nada', async ({ contactForm }) => {
  await contactForm.submit();
});

When(
  'el visitante completa el formulario de contacto con email {string}',
  async ({ contactForm }, email: string) => {
    await contactForm.fill({ ...VALID_CONTACT, email });
  }
);

When('el visitante completa el formulario de contacto con un mensaje de 9 caracteres', async ({ contactForm }) => {
  await contactForm.fill({ ...VALID_CONTACT, mensaje: MENSAJE_BOUNDARY_INVALID });
});

Given('el visitante completa el formulario de contacto con datos válidos', async ({ contactForm }) => {
  await contactForm.fill(VALID_CONTACT);
});

When('el visitante envía el formulario de contacto', async ({ contactForm }) => {
  await contactForm.submit();
});

Then('debe verse el error {string} en el campo {string}', async ({ contactForm }, message: string, field: string) => {
  await expect(contactForm.errorFor(field as 'nombre' | 'email' | 'telefono' | 'asunto' | 'mensaje')).toHaveText(
    message
  );
});

Then('el botón de enviar debe quedar deshabilitado durante el envío', async ({ contactForm }) => {
  // El botón se deshabilita apenas se dispara el submit (sending=true) —
  // se verifica inmediatamente después del click, antes de que la promesa
  // fetch resuelva (éxito, error de red o timeout).
  await expect(contactForm.submitButton).toBeDisabled();
});

Given('la API de contacto va a fallar', async ({ page }) => {
  await page.route('**/pack-sistema/api/v1/contact.php', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, error: 'Error simulado del servidor' }),
    })
  );
});

Then('debe verse un error inline en el formulario de contacto', async ({ contactForm }) => {
  await expect(contactForm.form.getByRole('alert')).toBeVisible();
});

Then('debe verse el mensaje {string}', async ({ page }, message: string) => {
  await expect(page.getByText(message)).toBeVisible();
});
