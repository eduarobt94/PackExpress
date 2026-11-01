import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object del modal Cotizador (src/components/Cotizacion.jsx).
 * El modal no expone role="dialog" ni data-testid en el código fuente —
 * se navega por accesibilidad (heading, labels, roles de botón) en vez de
 * envolver todo en un locator "modal" frágil basado en estructura DOM.
 */
export class QuoteModalPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly closeButton: Locator;
  readonly countrySelectButton: Locator;
  readonly countrySearchInput: Locator;
  readonly noResultsText: Locator;
  readonly docTypeButton: Locator;
  readonly pkgTypeButton: Locator;
  readonly cotizarButton: Locator;
  readonly noTarifaText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /Calculá tu envío/ });
    this.closeButton = page.getByRole('button', { name: 'Cerrar' });
    this.countrySelectButton = page.locator('[data-country-select] button').first();
    this.countrySearchInput = page.getByPlaceholder('Buscar país...');
    this.noResultsText = page.getByText('Sin resultados');
    this.docTypeButton = page.getByRole('button', { name: /Documentos/ });
    this.pkgTypeButton = page.getByRole('button', { name: /Paquetería/ });
    // BUG-TEST-008 (ver docs/QA_BUGS.md): el texto real del botón es "Ver
    // precio", no "Cotizar" — asunción incorrecta original. Sin scope al
    // modal, `/^Cotizar$/` matcheaba en cambio el botón "Cotizar" del
    // Navbar (que queda detrás del modal pero sigue en el DOM), dando un
    // falso resultado "enabled" porque ese botón nunca está deshabilitado.
    this.cotizarButton = page.getByRole('button', { name: /Ver precio|Calculando/ });
    this.noTarifaText = page.getByText('Sin tarifa disponible para esta zona');
  }

  async waitForOpen(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.closeButton).toBeVisible();
  }

  async waitForClosed(): Promise<void> {
    await expect(this.heading).toBeHidden();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }

  /**
   * El backdrop (App.jsx) cubre el viewport completo detrás del panel
   * centrado del modal. Clickear la esquina superior-izquierda garantiza
   * caer sobre el backdrop y no sobre el contenido del modal.
   */
  async closeViaBackdropClick(): Promise<void> {
    await this.page.mouse.click(5, 5);
  }

  async closeViaEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async openCountrySelect(): Promise<void> {
    await this.countrySelectButton.click();
  }

  async searchCountry(term: string): Promise<void> {
    await this.countrySearchInput.fill(term);
  }

  async selectCountry(name: string): Promise<void> {
    await this.openCountrySelect();
    await this.searchCountry(name);
    await this.page.getByRole('button', { name, exact: true }).click();
  }

  async selectTipoDocumentos(): Promise<void> {
    await this.docTypeButton.click();
  }

  async selectTipoPaquete(): Promise<void> {
    await this.pkgTypeButton.click();
  }

  async assertCotizarDisabled(): Promise<void> {
    await expect(this.cotizarButton).toBeDisabled();
  }

  async assertCotizarEnabled(): Promise<void> {
    await expect(this.cotizarButton).toBeEnabled();
  }
}
