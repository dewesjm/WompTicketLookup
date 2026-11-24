import AxeBuilder from '@axe-core/playwright';
import { Page } from '@playwright/test';
import { PAGES, THEMES, expect, test, useTheme } from './pages';

/** axe's WCAG 2.2 AA problems on the page as it is now, one line each. */
async function problems(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const where = (n: (typeof results.violations)[number]['nodes'][number]) =>
    `${n.target.join(' ')}: ${(n.failureSummary ?? '').replace(/\s+/g, ' ')}`;
  return results.violations.map(
    (v) => `${v.id} (${v.nodes.length}) ${v.nodes.slice(0, 3).map(where).join(' | ')}`,
  );
}

for (const theme of THEMES) {
  for (const path of PAGES) {
    test(`${path} in ${theme} has no accessibility problems`, async ({ page }, testInfo) => {
      await useTheme(page, theme);
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await testInfo.attach('screenshot', {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });
      expect(await problems(page)).toEqual([]);
    });
  }

  test(`open menus in ${theme} have no accessibility problems`, async ({ page }) => {
    await useTheme(page, theme);
    await page.goto('/');
    await page.getByRole('button', { name: 'Quick Links' }).click();
    await expect(page.locator('#quick-links-panel')).toBeVisible();
    expect(await problems(page)).toEqual([]);
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Admin', exact: true }).click();
    await expect(page.locator('#admin-menu-panel')).toBeVisible();
    expect(await problems(page)).toEqual([]);
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: /account, preferences and theme/ }).click();
    await expect(page.locator('#avatar-menu-panel')).toBeVisible();
    expect(await problems(page)).toEqual([]);
  });
}

for (const theme of THEMES) {
  test(`a wrong confirmation number and an unknown one in ${theme} have no accessibility problems`, async ({ page }) => {
    await useTheme(page, theme);
    await page.goto('/');
    await page.getByLabel('Confirmation number').fill('12345');
    await page.getByRole('button', { name: 'Look up' }).click();
    await expect(page.getByText('this has 5')).toBeVisible();
    expect(await problems(page)).toEqual([]);

    await page.goto('/?confirmation=2199999999');
    await expect(page.getByRole('alert')).toContainText("There's no ticket");
    expect(await problems(page)).toEqual([]);
  });
}
