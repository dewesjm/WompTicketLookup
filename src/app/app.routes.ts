import { Routes } from '@angular/router';
import { LookupPage } from './features/lookup/lookup-page';

export const routes: Routes = [
  { path: '', title: 'Womp Ticket Lookup', component: LookupPage },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'changelog',
    title: 'Change Log · Womp Ticket Lookup',
    loadComponent: () =>
      import('./features/changelog/changelog-page').then((m) => m.ChangelogPage),
  },
  {
    path: '**',
    title: 'Page not found · Womp Ticket Lookup',
    loadComponent: () =>
      import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
