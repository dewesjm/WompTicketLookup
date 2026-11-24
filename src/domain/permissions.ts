/*
 * Roles and what they allow: the demo's stand-in for access control. In the real app the
 * person's AD groups decide. Everyone may look up tickets; only Developers may use
 * Admin > Services. To add a permission, add it to PermissionKey and to the roles that have it.
 */

export type PermissionKey = 'admin-services';

export type Role = 'user' | 'developer';

export const ROLE_PERMISSIONS: Readonly<Record<Role, readonly PermissionKey[]>> = {
  user: [],
  developer: ['admin-services'],
};

export function permissionsOf(person: { role: Role }): PermissionKey[] {
  return [...ROLE_PERMISSIONS[person.role]];
}
