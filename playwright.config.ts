import { defineConfig, devices } from '@playwright/test';

/**
 * Browser checks: accessibility (axe), layout, menus and keyboard focus on every page, phone and
 * desktop, light and dark. Run with `npm run e2e`. Uses the installed Chrome; starts the dev
 * server if it isn't running. Port 4207, so it can run beside Ready to Work (4200), Compass (4201) and Construction Monitor (4202). Starts the app
 * without the local settings service, so the app keeps settings in the browser; e2e/settings.spec.ts
 * stands in for the service where it's needed.
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4207',
    channel: 'chrome',
    // Start as the Developer, so Admin > Services can be checked.
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:4207',
          localStorage: [{ name: 'womp-ticket-lookup.preferences', value: '{"schemaVersion":2,"personaId":"u-developer"}' }],
        },
      ],
    },
  },
  projects: [
    { name: 'phone', use: { ...devices['Pixel 7'], channel: 'chrome' } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4207',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
