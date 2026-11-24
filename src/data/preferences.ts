/** One viewer's own choices for this app, kept in their browser. */
export interface Preferences {
  /** daisyUI theme id, or null for the default theme. */
  theme: string | null;
  /** Demo View as: the persona being viewed as, or null for the default persona. */
  personaId: string | null;
}

export const DEFAULT_PREFERENCES: Preferences = { theme: null, personaId: null };

/** Where preferences are kept. The mockup keeps them in the browser. */
export interface PreferencesRepository {
  load(): Promise<Preferences>;
  save(preferences: Preferences): Promise<void>;
}
