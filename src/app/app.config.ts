import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { DemoDataService } from './core/demo-data-service';
import { provideLivePermissionChecks } from './core/permission-guard';
import { ThemeService } from './core/theme-service';

/**
 * The storage and order data seams (core/tokens.ts) default to the mockup's versions. The
 * real app provides its own here.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideAppInitializer(async () => {
      inject(ThemeService);
      await inject(DemoDataService).load();
    }),
    provideLivePermissionChecks(),
  ],
};
