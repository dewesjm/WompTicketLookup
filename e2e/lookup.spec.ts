import { expect, test } from './pages';

test('look up a confirmation number, see its ticket and charges, and go Back', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Confirmation number').fill('2001264027');
  await page.getByRole('button', { name: 'Look up' }).click();
  await expect(page).toHaveURL(/\?confirmation=2001264027$/);
  await expect(page.getByRole('heading', { name: 'Confirmation 2001264027' })).toBeVisible();
  await expect(page.getByTestId('order')).toHaveText('513671487');
  await expect(page.getByTestId('work-center')).toHaveText('PF-5610 · Pipefitting');
  await expect(page.getByRole('region', { name: 'Charges grid' }).locator('tbody tr')).toHaveCount(6);

  await page.getByLabel('Confirmation number').fill('2182183003');
  await page.getByRole('button', { name: 'Look up' }).click();
  await expect(page.getByRole('heading', { name: 'Confirmation 2182183003' })).toBeVisible();

  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Confirmation 2001264027' })).toBeVisible();
  await expect(page.getByLabel('Confirmation number')).toHaveValue('2001264027');
});

test('Enter in the box looks up too', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Confirmation number').fill('2182183003');
  await page.getByLabel('Confirmation number').press('Enter');
  await expect(page.getByRole('heading', { name: 'Confirmation 2182183003' })).toBeVisible();
});
