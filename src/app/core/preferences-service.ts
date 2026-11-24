import { Injectable, inject, signal } from '@angular/core';
import { DEFAULT_PREFERENCES, Preferences } from '../../data';
import { PREFERENCES_REPOSITORY } from './tokens';

/** The viewer's preferences as a signal. Every change is saved through the repository. */
@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly repository = inject(PREFERENCES_REPOSITORY);
  private readonly current = signal<Preferences>({ ...DEFAULT_PREFERENCES });

  readonly preferences = this.current.asReadonly();

  async load(): Promise<void> {
    this.current.set(await this.repository.load());
  }

  update(change: Partial<Preferences>): void {
    const next = { ...this.current(), ...change };
    this.current.set(next);
    void this.repository.save(next);
  }
}
