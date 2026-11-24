import { DOCUMENT, Injectable, computed, effect, inject } from '@angular/core';
import { ALL_THEMES, DEFAULT_THEME } from '../shared/themes';
import { SharedThemeService } from '../shared/shared-theme-service';
import { PreferencesService } from './preferences-service';

/** Current daisyUI theme, kept in preferences and applied as `data-theme` on <html>. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly shared = inject(SharedThemeService);
  private readonly document = inject(DOCUMENT);
  private readonly preferences = inject(PreferencesService);

  private readonly override = computed(() => {
    const saved = this.preferences.preferences().theme;
    return saved && isKnownTheme(saved) ? saved : null;
  });
  readonly following = computed(() => this.override() === null);
  readonly theme = computed(() => {
    const shared = this.shared.theme();
    return this.override() ?? (isKnownTheme(shared) ? shared : DEFAULT_THEME);
  });

  setFollowing(follow: boolean): void {
    this.preferences.update({ theme: follow ? null : this.theme() });
  }

  constructor() {
    effect(() => this.document.documentElement.setAttribute('data-theme', this.theme()));
  }

  set(id: string): void {
    if (isKnownTheme(id)) this.preferences.update({ theme: id });
  }
}

function isKnownTheme(id: string): boolean {
  return ALL_THEMES.some((t) => t.id === id);
}
