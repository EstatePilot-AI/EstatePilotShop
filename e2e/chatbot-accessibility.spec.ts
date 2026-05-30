import { expect, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('chatbot accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/ai-advisor', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          module: 'Search',
          filters_extracted: {},
          top_properties: [],
          recommendation: null,
          comparison: null,
          negotiation: null,
          fallback_used: false,
          explanation: 'Here are matching properties.',
          reply_in_egyptian_arabic: '',
        }),
      });
    });
  });

  test('opens, focuses, sends, closes, and passes axe checks', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('estatepilot-lang', 'en');
    });
    await page.goto('/');

    const openButton = page.getByRole('button', { name: /open chat/i });
    await openButton.click();

    const dialog = page.getByRole('dialog', { name: /estatepilot advisor/i });
    await expect(dialog).toBeVisible();

    const input = page.getByRole('textbox', { name: /ask about properties/i });
    await expect(input).toBeFocused();

    await input.fill('Find apartments in Cairo');
    await page.getByRole('button', { name: /^send$/i }).click();

    await expect(dialog.getByText('Here are matching properties.')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('.chat-panel')
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(openButton).toBeFocused();
  });
});
