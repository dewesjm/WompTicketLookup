/*
 * The version of what this app saves in the browser. Every saved value carries `schemaVersion`.
 * When a release changes the shape of something saved, raise SCHEMA_VERSION and add a migration
 * to that store's table, keyed by the version it upgrades from (Ready to Work does the same).
 */

export const SCHEMA_VERSION = 2;

/** Turns a saved value of one version into the next version. */
export type Migration = (raw: Record<string, unknown>) => Record<string, unknown>;

/**
 * Brings a saved value up to SCHEMA_VERSION, one version at a time. A value with no
 * `schemaVersion` counts as version 0. Returns null when it can't be used: not an object, a
 * newer version than this code knows, or a missing migration.
 */
export function upgrade(
  raw: unknown,
  migrations: Readonly<Record<number, Migration>>,
): Record<string, unknown> | null {
  if (!isObject(raw)) return null;
  let value = raw;
  let version = typeof value['schemaVersion'] === 'number' ? value['schemaVersion'] : 0;
  if (!Number.isInteger(version) || version < 0 || version > SCHEMA_VERSION) return null;
  while (version < SCHEMA_VERSION) {
    const migrate = migrations[version];
    if (!migrate) return null;
    value = migrate(value);
    version++;
  }
  return { ...value, schemaVersion: SCHEMA_VERSION };
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
