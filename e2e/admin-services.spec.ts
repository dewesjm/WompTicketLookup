import AxeBuilder from '@axe-core/playwright';
import { THEMES, expect, test, useTheme } from './pages';

test('only the Developer can run service calls; each shows the full call and its response', async ({ page }) => {
  await useTheme(page, 'navy', 'u-foreman-haddad');
  await page.goto('/admin/services');
  await expect(page.getByRole('heading', { name: 'No access' })).toBeVisible();

  await page.getByRole('button', { name: /account, preferences and theme/ }).click();
  await page.getByTestId('persona').selectOption('u-developer');
  await expect(page.getByRole('heading', { name: 'Services' })).toBeVisible();
  await page.keyboard.press('Escape');

  const argument = page.getByLabel('Argument (JSON)');
  await argument.fill('{');
  await expect(page.getByRole('button', { name: 'Run read' })).toBeDisabled();
  await argument.fill('"2001264027"');
  await expect(page.getByTestId('full-call')).toContainText('getTicket("2001264027")');
  await page.getByRole('button', { name: 'Run read' }).click();
  await expect(page.getByTestId('response')).toContainText('"orderNumber": "513671487"');

  await page.getByLabel('Service call').selectOption('TicketClient.getPeople');
  await page.getByRole('button', { name: 'Run read' }).click();
  await expect(page.getByTestId('response')).toContainText('"costCenter"');
});

for (const theme of THEMES) {
  test(`Services in ${theme} fits the viewport and passes accessibility checks`, async ({ page }) => {
    await useTheme(page, theme);
    await page.goto('/admin/services');
    await expect(page.getByTestId('full-call')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      await page.evaluate(() => document.documentElement.clientWidth),
    );
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    expect(violations).toEqual([]);
  });
}
