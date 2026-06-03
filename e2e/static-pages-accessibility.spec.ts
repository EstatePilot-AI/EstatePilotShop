import { expect, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

const pages = [
  {
    path: '/about',
    heading: /AI-powered real estate outreach/i,
  },
  {
    path: '/contact',
    heading: /Talk to us about AI real estate outreach/i,
  },
];

test.describe('static company pages accessibility', () => {
  for (const companyPage of pages) {
    test(`${companyPage.path} renders and passes axe checks`, async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('estatepilot-lang', 'en');
      });

      await page.goto(companyPage.path);

      await expect(page.getByRole('heading', { level: 1, name: companyPage.heading })).toBeVisible();

      const accessibilityScanResults = await new AxeBuilder({ page }).include('main').analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
