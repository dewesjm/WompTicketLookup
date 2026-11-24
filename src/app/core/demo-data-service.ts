import { Injectable, inject } from '@angular/core';
import { PersonasService } from './personas-service';
import { PreferencesService } from './preferences-service';

/** Loads the app's data at start. The tickets are read when looked up, so only these load here. */
@Injectable({ providedIn: 'root' })
export class DemoDataService {
  private readonly preferences = inject(PreferencesService);
  private readonly personas = inject(PersonasService);

  async load(): Promise<void> {
    await Promise.all([this.preferences.load(), this.personas.load()]);
  }
}
