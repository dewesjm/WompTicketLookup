import { DOCUMENT, DestroyRef, Injectable, inject, signal } from '@angular/core';

export const SHARED_THEME_DEFAULT = 'navy';

@Injectable({ providedIn: 'root' })
export class SharedThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly browser = this.document.defaultView;
  private readonly address = this.endpoint();
  private readonly current = signal(SHARED_THEME_DEFAULT);
  readonly theme = this.current.asReadonly();
  readonly saving = signal(false);
  readonly error = signal('');
  private revision = 0;

  constructor() {
    const refresh = () => void this.refresh();
    this.browser?.addEventListener('focus', refresh);
    inject(DestroyRef).onDestroy(() => this.browser?.removeEventListener('focus', refresh));
    refresh();
  }

  async refresh(): Promise<void> {
    if (this.saving()) return;
    const revision = ++this.revision;
    try {
      const theme = await this.request('GET');
      if (revision === this.revision) this.current.set(theme);
    } catch {
      // Keep the last theme if the app is offline.
    }
  }

  async save(theme: string): Promise<void> {
    if (this.saving()) return;
    ++this.revision;
    this.saving.set(true);
    this.error.set('');
    try {
      this.current.set(await this.request('PUT', theme));
    } catch {
      this.error.set('Could not save the shared theme. Try again.');
    } finally {
      this.saving.set(false);
    }
  }

  /** Manage Settings' deployed service, wherever this app runs: never a local one first (user, 2026-11-21). */
  private endpoint(): string {
    return 'https://manage-settings.vercel.app/api/sharedTheme';
  }

  private async request(method: 'GET' | 'PUT', theme?: string): Promise<string> {
    const response = await fetch(this.address, {
      method,
      signal: AbortSignal.timeout(5000),
      ...(theme === undefined ? {} : {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      }),
    });
    if (!response.ok) throw new Error('Shared theme request failed');
    const result: { theme?: unknown } = await response.json();
    if (typeof result.theme !== 'string') throw new Error('Invalid shared theme');
    return result.theme;
  }
}
