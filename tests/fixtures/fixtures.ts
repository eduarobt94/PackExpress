import { test as base } from 'playwright-bdd';
import type { Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { NavbarPage } from '../pages/NavbarPage';
import { ContactFormPage } from '../pages/ContactFormPage';
import { QuoteModalPage } from '../pages/QuoteModalPage';
import { TrackingPage } from '../pages/TrackingPage';
import { LegalModalPage } from '../pages/LegalModalPage';
import { isBackendAvailable } from '../utils/backend';
import { ENV } from '../config/env';

interface Fixtures {
  homePage: HomePage;
  navbar: NavbarPage;
  contactForm: ContactFormPage;
  quoteModal: QuoteModalPage;
  tracking: TrackingPage;
  legalModal: LegalModalPage;
  /** Errores de consola JS capturados durante el test (Fase: sin errores). */
  consoleErrors: string[];
  /** true si `pack-sistema` responde en este entorno — usado por @requires-backend. */
  backendAvailable: boolean;
  /** Estado mutable compartido entre steps de un mismo escenario (patrón "World" de Cucumber). */
  world: Record<string, unknown>;
}

export const test = base.extend<Fixtures>({
  consoleErrors: async ({ page }: { page: Page }, use: (r: string[]) => Promise<void>) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));
    await use(errors);
  },

  backendAvailable: async ({ request }, use) => {
    const available = await isBackendAvailable(request, ENV.BASE_URL);
    await use(available);
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  navbar: async ({ page }, use) => {
    await use(new NavbarPage(page));
  },
  contactForm: async ({ page }, use) => {
    await use(new ContactFormPage(page));
  },
  quoteModal: async ({ page }, use) => {
    await use(new QuoteModalPage(page));
  },
  tracking: async ({ page }, use) => {
    await use(new TrackingPage(page));
  },
  legalModal: async ({ page }, use) => {
    await use(new LegalModalPage(page));
  },
  world: async ({}, use) => {
    await use({});
  },
});

export { expect } from '@playwright/test';
