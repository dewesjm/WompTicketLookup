import {
  EnvironmentProviders,
  effect,
  inject,
  provideEnvironmentInitializer,
} from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { PermissionKey } from '../../domain';
import { ViewerService } from './viewer-service';

/**
 * Route guard: the route matches only for a viewer with this permission. Without it the router
 * moves on to the next route with the same path, which says "You don't have access to this
 * page", so the address stays as typed.
 */
export function canMatchPermission(key: PermissionKey): CanMatchFn {
  return () => inject(ViewerService).permissions().includes(key);
}

/**
 * Guards only run on navigation. This re-checks the current address whenever the viewer's
 * permissions change (View as, or an admin edits one of their Groups), so an admin page turns
 * into "no access", or back, at once.
 */
export function provideLivePermissionChecks(): EnvironmentProviders {
  return provideEnvironmentInitializer(() => {
    const router = inject(Router);
    const viewer = inject(ViewerService);
    let previous: string | null = null;
    effect(() => {
      const current = [...viewer.permissions()].sort().join();
      if (previous !== null && current !== previous && router.navigated) {
        void router.navigateByUrl(router.url, { onSameUrlNavigation: 'reload' });
      }
      previous = current;
    });
  });
}
