import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object del Navbar — navegación global, CTAs, toggle de tema, menú móvil.
 * No contiene lógica de negocio: solo selectors + interacción de esta página.
 */
export class NavbarPage {
  readonly page: Page;
  readonly nav: Locator;
  readonly logo: Locator;
  readonly cotizarButton: Locator;
  readonly rastrearLink: Locator;
  readonly themeToggle: Locator;
  readonly mobileMenuButton: Locator;
  readonly mobileDrawerCloseButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = page.getByRole('navigation').first();
    // Scoped a `nav`: el mismo logo/alt "Pack Express Uruguay" se repite en
    // el Footer (BUG-TEST-009, ver docs/QA_BUGS.md) — sin scope, dos
    // elementos matchean y toBeVisible() lanza "strict mode violation".
    this.logo = this.nav.getByRole('link', { name: 'Pack Express Uruguay' });
    this.cotizarButton = page.getByRole('button', { name: /^Cotizar$/ });
    this.rastrearLink = page.getByRole('link', { name: /Rastrear/ });
    this.themeToggle = page.getByLabel(/Cambiar a modo (claro|oscuro)/);
    this.mobileMenuButton = page.getByRole('button', { name: 'Menu' });
    // El drawer no expone role/testid — se usa el botón de cierre (único,
    // solo existe montado cuando el drawer está abierto) como proxy de estado.
    this.mobileDrawerCloseButton = page.getByRole('button', { name: 'Cerrar menú' });
  }

  async gotoAnchor(linkName: string): Promise<void> {
    await this.nav.getByRole('link', { name: linkName }).click();
  }

  async openCotizador(): Promise<void> {
    await this.cotizarButton.click();
  }

  async toggleTheme(): Promise<void> {
    await this.themeToggle.click();
  }

  async openMobileMenu(): Promise<void> {
    await this.mobileMenuButton.click();
  }

  async closeMobileMenu(): Promise<void> {
    await this.mobileDrawerCloseButton.click();
  }

  async assertLoaded(): Promise<void> {
    await expect(this.nav).toBeVisible();
    await expect(this.logo).toBeVisible();
  }

  async getCurrentTheme(): Promise<string | null> {
    return this.page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  }

  async getPersistedTheme(): Promise<string | null> {
    return this.page.evaluate(() => localStorage.getItem('pe-theme'));
  }
}
