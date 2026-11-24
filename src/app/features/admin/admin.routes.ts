import { inject } from '@angular/core';
import { Route, Routes } from '@angular/router';
import { ADMIN_PAGES, adminPagesFor } from '../../core/admin-pages';
import { canMatchPermission } from '../../core/permission-guard';
import { ViewerService } from '../../core/viewer-service';

/** An admin page's route: shown only to viewers with its permission (core/admin-pages.ts). */
function adminRoute(path: string, loadComponent: Route['loadComponent']): Route {
  const page = ADMIN_PAGES.find((p) => p.path === path)!;
  return {
    path,
    title: `${page.label} · Womp Ticket Lookup`,
    canMatch: [canMatchPermission(page.permission)],
    loadComponent,
  };
}

/**
 * The admin pages, under /admin. Each is guarded by its permission; without it, the same
 * address falls through to "You don't have access to this page".
 */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    // The first admin page the viewer may use; with none, Services says they have no access.
    redirectTo: () => `/admin/${adminPagesFor(inject(ViewerService).permissions())[0]?.path ?? 'services'}`,
  },
  adminRoute('services', () => import('./services/services-page').then((m) => m.ServicesPage)),
  ...ADMIN_PAGES.map(
    (page): Route => ({
      path: page.path,
      title: 'No access · Womp Ticket Lookup',
      loadComponent: () => import('./no-access-page').then((m) => m.NoAccessPage),
    }),
  ),
];
