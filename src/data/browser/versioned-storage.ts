import { Migration, SCHEMA_VERSION, upgrade } from '../schema';

export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/**
 * Reads and writes JSON values with a schema version in browser storage. If storage is blocked
 * (private mode, policy) or full, changes are kept in memory for the visit, as in Ready to Work.
 */
export class VersionedStorage {
  private readonly memory = new Map<string, string>();

  constructor(private readonly storage: KeyValueStorage | null = browserStorage()) {}

  /** The saved value brought up to date, or null when nothing usable is saved. */
  read(key: string, migrations: Readonly<Record<number, Migration>> = {}): Record<string, unknown> | null {
    const text = this.memory.get(key) ?? this.storageGet(key);
    if (text === null) return null;
    try {
      // Version 2 changes theme preferences only. Other stores keep their values.
      return upgrade(JSON.parse(text), { 1: (saved) => saved, ...migrations });
    } catch {
      return null;
    }
  }

  write(key: string, value: Record<string, unknown>): void {
    const text = JSON.stringify({ schemaVersion: SCHEMA_VERSION, ...value });
    try {
      if (!this.storage) throw new Error('No browser storage');
      this.storage.setItem(key, text);
      this.memory.delete(key);
    } catch {
      this.memory.set(key, text);
    }
  }

  remove(key: string): void {
    this.memory.delete(key);
    try {
      this.storage?.removeItem(key);
    } catch {
      // Nothing saved to remove.
    }
  }

  private storageGet(key: string): string | null {
    try {
      return this.storage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
}

export function browserStorage(): KeyValueStorage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}
