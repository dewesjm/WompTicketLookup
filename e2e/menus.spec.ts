import { expect, test } from './pages';

test('Quick Links opens by mouse, lists the links and goes to the Change Log', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Quick Links' }).click();
  const panel = page.locator('#quick-links-panel');
  await expect(panel.getByRole('link', { name: /Help Desk/ })).toHaveAttribute('target', '_blank');

  await panel.getByRole('link', { name: 'Change Log' }).click();
  await expect(page).toHaveURL(/\/changelog$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Change Log');
  await expect(panel).toBeHidden();
});

test('both menus open and close from the keyboard', async ({ page }) => {
  await page.goto('/');
  for (const [name, panelId] of [
    ['Quick Links', '#quick-links-panel'],
    ['Admin', '#admin-menu-panel'],
    [/account, preferences and theme/, '#avatar-menu-panel'],
  ] as const) {
    const button = page.getByRole('button', { name, exact: true });
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator(panelId)).toBeVisible();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(page.locator(panelId)).toBeHidden();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  }
});

test('menus close on a click outside', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /account, preferences and theme/ }).click();
  await expect(page.locator('#avatar-menu-panel')).toBeVisible();
  // The CDK adds the click-catching backdrop just after the panel; a person can't click sooner.
  await expect(page.locator('.cdk-overlay-backdrop-showing')).toBeAttached();
  await page.mouse.click(10, 300);
  await expect(page.locator('#avatar-menu-panel')).toBeHidden();
});

test('a picked theme applies at once and is kept after a reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'navy');
  await page.getByRole('button', { name: /account, preferences and theme/ }).click();
  await page.getByRole('radio', { name: 'Navy & Gold (dark)' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'navy-dark');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'navy-dark');
});
