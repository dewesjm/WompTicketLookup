import { PermissionKey } from '../../domain';

/** One admin page: where it is, what the Admin menu calls it, and the permission it needs. */
export interface AdminPage {
  /** Under /admin. */
  path: string;
  label: string;
  icon: string;
  permission: PermissionKey;
}

/**
 * The admin pages, in Admin menu order. The admin routes, the Admin menu and /admin all read
 * this list, so a new admin page is a line here plus its route.
 */
export const ADMIN_PAGES: readonly AdminPage[] = [
  { path: 'services', label: 'Services', icon: 'wrench', permission: 'admin-services' },
];

/** The admin pages someone with these permissions may use, in menu order. */
export function adminPagesFor(permissions: readonly PermissionKey[]): AdminPage[] {
  return ADMIN_PAGES.filter((page) => permissions.includes(page.permission));
}
