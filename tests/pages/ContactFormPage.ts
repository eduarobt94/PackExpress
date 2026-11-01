import { type Page, type Locator, expect } from '@playwright/test';
import type { ContactFormData } from '../utils/types';

/**
 * Page Object del formulario de contacto (dentro de src/components/Docs.jsx).
 */
export class ContactFormPage {
  readonly page: Page;
  readonly form: Locator;
  readonly nombreInput: Locator;
  readonly emailInput: Locator;
  readonly telefonoInput: Locator;
  readonly asuntoSelect: Locator;
  readonly mensajeTextarea: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly sendAnotherButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.locator('#contacto form');
    this.nombreInput = page.getByLabel('Nombre completo');
    this.emailInput = page.getByLabel('Email', { exact: true });
    this.telefonoInput = page.getByLabel('Teléfono');
    this.asuntoSelect = page.getByLabel('Asunto');
    this.mensajeTextarea = page.getByLabel('Mensaje');
    // Estructural, no por texto: el label del botón cambia a "Enviando…"
    // durante el envío (BUG-TEST-006, ver docs/QA_BUGS.md) — un locator
    // atado al texto "Enviar mensaje" deja de matchear justo cuando más
    // se lo necesita (para verificar el estado disabled durante el envío).
    this.submitButton = this.form.locator('button[type="submit"]');
    this.successMessage = page.getByText('¡Mensaje enviado!');
    this.sendAnotherButton = page.getByRole('button', { name: 'Enviar otro mensaje' });
  }

  async goto(page: Page): Promise<void> {
    await this.form.scrollIntoViewIfNeeded();
  }

  async fill(data: Partial<ContactFormData>): Promise<void> {
    if (data.nombre !== undefined) await this.nombreInput.fill(data.nombre);
    if (data.email !== undefined) await this.emailInput.fill(data.email);
    if (data.telefono !== undefined) await this.telefonoInput.fill(data.telefono);
    if (data.asunto !== undefined) await this.asuntoSelect.selectOption(data.asunto);
    if (data.mensaje !== undefined) await this.mensajeTextarea.fill(data.mensaje);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  private static readonly FIELD_LABEL: Record<string, string> = {
    nombre: 'Nombre completo',
    email: 'Email',
    telefono: 'Teléfono',
    asunto: 'Asunto',
    mensaje: 'Mensaje',
  };

  /**
   * El error (<p class="text-red-400">) es hermano del <label> dentro del
   * mismo contenedor <Field> (div > label + children + p). `div:has(> label)`
   * exige que el label sea HIJO DIRECTO — así no matchea también el div
   * contenedor externo (el grid que envuelve los 4 campos), que también
   * "contiene" el label como descendiente pero no como hijo directo.
   * BUG-TEST-005 (ver docs/QA_BUGS.md): la versión anterior usaba
   * `locator('div').filter({has: getByText(...)}).first()`, que resolvía
   * al div externo y devolvía los 4 párrafos de error a la vez.
   */
  errorFor(field: 'nombre' | 'email' | 'telefono' | 'asunto' | 'mensaje'): Locator {
    const label = ContactFormPage.FIELD_LABEL[field];
    return this.form.locator(`div:has(> label:text-is("${label}"))`).locator('p');
  }

  async assertSubmitEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
  }

  async assertSending(): Promise<void> {
    await expect(this.page.getByText('Enviando…')).toBeVisible();
  }

  async assertSuccess(): Promise<void> {
    await expect(this.successMessage).toBeVisible();
  }
}
