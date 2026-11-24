import { Page } from '@playwright/test';
import { PAGES, expect, test } from './pages';

/** Visible controls smaller than 24×24px (WCAG 2.2 AA), one line each. A checkbox or radio
 * counts by its label, which is what a finger hits. */
async function smallTargets(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const small: string[] = [];
    const controls = document.querySelectorAll<HTMLElement>(
      'a[href], button, input, select, textarea, label:has(input)',
    );
    for (const el of controls) {
      if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) continue;
      const box = el.getBoundingClientRect();
      if (box.width === 0 || box.height === 0 || getComputedStyle(el).visibility === 'hidden') continue;
      if (box.width < 24 || box.height < 24) {
        const name = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30);
        small.push(`${el.tagName.toLowerCase()} "${name}" ${Math.round(box.width)}x${Math.round(box.height)}`);
      }
    }
    return small;
  });
}

test.describe('phone layout', () => {
  test.skip(({ isMobile }) => !isMobile, 'phones only');

  for (const path of PAGES) {
    test(`${path} fits the screen width, header on one line`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(width).toBeLessThanOrEqual(page.viewportSize()!.width);
      const header = await page.locator('header').boundingBox();
      expect(header!.height).toBeLessThanOrEqual(72);
    });

    test(`${path} has no control under 24px`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await smallTargets(page)).toEqual([]);
    });
  }
});
