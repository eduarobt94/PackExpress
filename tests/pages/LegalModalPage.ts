import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object del modal legal (src/components/LegalModal.jsx) — usado tanto
 * para Términos/Privacidad (footer) como Requisitos Courier/Equipaje/
 * Prohibidos (Docs.jsx). Único componente de la app con role="dialog".
 */
export class LegalModalPage {
  readonly page: Page;
  readonly dialog: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // aria-modal evita chocar con el banner de cookies (role="dialog" no modal) cuando GA está activo
    this.dialog = page.locator('[role="dialog"][aria-modal="true"]');
    this.closeButton = this.dialog.getByRole('button', { name: 'Cerrar' });
  }

  async assertOpenWithTitle(title: string | RegExp): Promise<void> {
    await expect(this.dialog).toBeVisible();
    await expect(this.dialog.getByRole('heading', { name: title })).toBeVisible();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }

  async closeViaEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async closeViaBackdrop(): Promise<void> {
    await this.page.mouse.click(5, 5);
  }

  async assertClosed(): Promise<void> {
    await expect(this.dialog).toBeHidden();
  }
}
