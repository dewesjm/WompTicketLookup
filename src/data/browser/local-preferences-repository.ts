import { DEFAULT_PREFERENCES, Preferences, PreferencesRepository } from '../preferences';
import { Migration } from '../schema';
import { VersionedStorage } from './versioned-storage';

/**
 * Browser storage key. index.html reads `.theme` from it too, before Angular starts, so the saved
 * value keeps the theme at the top level.
 */
export const PREFERENCES_KEY = 'womp-ticket-lookup.preferences';

const MIGRATIONS: Record<number, Migration> = { 1: (saved) => ({ ...saved, theme: null }) };

/** Preferences in browser storage. Anything unreadable falls back to the defaults. */
export class LocalPreferencesRepository implements PreferencesRepository {
  constructor(private readonly storage = new VersionedStorage()) {}

  async load(): Promise<Preferences> {
    const saved = this.storage.read(PREFERENCES_KEY, MIGRATIONS);
    const text = (v: unknown) => (typeof v === 'string' ? v : null);
    return { ...DEFAULT_PREFERENCES, theme: text(saved?.['theme']), personaId: text(saved?.['personaId']) };
  }

  async save(preferences: Preferences): Promise<void> {
    this.storage.write(PREFERENCES_KEY, { theme: preferences.theme, personaId: preferences.personaId });
  }
}
