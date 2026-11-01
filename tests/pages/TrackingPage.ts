import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object de la sección de Rastreo pública (#rastreo, Tracking.jsx)
 * y del input rápido de rastreo del Hero.
 */
export class TrackingPage {
  readonly page: Page;
  readonly section: Locator;
  readonly guiaInput: Locator;
  readonly rastrearButton: Locator;
  readonly clearButton: Locator;
  readonly heroGuiaInput: Locator;
  readonly heroRastrearButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.section = page.locator('#rastreo');
    this.guiaInput = this.section.getByLabel('Número de guía');
    this.rastrearButton = this.section.getByRole('button', { name: 'Rastrear' });
    this.clearButton = this.section.getByLabel('Limpiar');
    this.heroGuiaInput = page.locator('#hero-tracking');
    this.heroRastrearButton = page.locator('#tracking').getByRole('button', { name: /Rastrear/ });
  }

  async searchGuia(numero: string): Promise<void> {
    await this.guiaInput.fill(numero);
    await this.rastrearButton.click();
  }

  async searchFromHero(numero: string): Promise<void> {
    await this.heroGuiaInput.fill(numero);
    await this.heroGuiaInput.press('Enter');
  }

  async assertScrolledIntoView(): Promise<void> {
    await expect(this.section).toBeInViewport();
  }

  async assertGuiaValuePropagated(numero: string): Promise<void> {
    await expect(this.guiaInput).toHaveValue(numero);
  }

  async assertErrorVisible(): Promise<void> {
    await expect(this.section.getByRole('alert')).toBeVisible();
  }

  async assertLoading(): Promise<void> {
    await expect(this.rastrearButton).toBeDisabled();
  }
}
