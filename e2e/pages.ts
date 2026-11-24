import { Page, expect, test as base } from '@playwright/test';

/** Keeps the shared theme call (Manage Settings' service) offline, so tests don't depend on it. */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('https://manage-settings.vercel.app/**', (route) => route.abort());
    await use(page);
  },
});
export { expect };

/** Every page, by address: nothing looked up, a ticket with charges, one without, and the rest. */
export const PAGES = [
  '/',
  '/?confirmation=2001264027',
  '/?confirmation=2042716493',
  '/admin/services',
  '/changelog',
  '/no-such-page',
];

/** The brand themes; daisyUI's other themes are its own colors and aren't checked. */
export const THEMES = ['navy', 'navy-dark'];

/** Start the app as the Developer with a saved theme (the key is PREFERENCES_KEY in src/data). */
export async function useTheme(page: Page, theme: string, personaId = 'u-developer'): Promise<void> {
  await page.addInitScript(
    (saved) => localStorage.setItem('womp-ticket-lookup.preferences', saved),
    JSON.stringify({ schemaVersion: 2, theme, personaId }),
  );
}
