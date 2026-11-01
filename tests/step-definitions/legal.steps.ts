import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures/fixtures';

const { When, Then } = createBdd(test);

When(
  'el visitante hace click en {string} del footer',
  async ({ page }, linkLabel: string) => {
    await page.locator('footer').getByText(linkLabel, { exact: true }).click();
  }
);

When('el visitante clickea fuera del modal legal', async ({ legalModal }) => {
  await legalModal.closeViaBackdrop();
});

Then('el modal legal debe estar abierto', async ({ legalModal }) => {
  await expect(legalModal.dialog).toBeVisible();
});

Then('el modal legal no debe estar visible', async ({ legalModal }) => {
  await legalModal.assertClosed();
});
