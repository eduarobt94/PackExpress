import { type Page, expect } from '@playwright/test';
import { ENV } from '../config/env';

/**
 * Page Object de la home (única página real de esta SPA). Orquesta la
 * navegación inicial; el resto de la interacción vive en los Page Objects
 * específicos de cada sección (NavbarPage, TrackingPage, etc.).
 */
export class HomePage {
  constructor(private readonly page: Page) {}

  async goto(path = '/'): Promise<void> {
    await this.page.goto(`${ENV.BASE_URL}${path}`);
  }

  async assertLoaded(): Promise<void> {
    await expect(this.page).toHaveTitle(/Pack Express/);
    await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible();
  }

  async assertNoConsoleErrors(errors: string[]): Promise<void> {
    expect(errors, `Errores de consola detectados: ${errors.join('\n')}`).toHaveLength(0);
  }
}
