import { TestBed } from '@angular/core/testing';
import { Preferences, PreferencesRepository } from '../../data';
import { PreferencesService } from './preferences-service';
import { ThemeService } from './theme-service';
import { PREFERENCES_REPOSITORY } from './tokens';

/** Preferences kept in memory, so the spec can see what was saved. */
class MemoryPreferences implements PreferencesRepository {
  saved: Preferences = { theme: null, personaId: null };
  async load() {
    return { ...this.saved };
  }
  async save(p: Preferences) {
    this.saved = { ...p };
  }
}

describe('ThemeService', () => {
  let repo: MemoryPreferences;

  beforeEach(() => {
    repo = new MemoryPreferences();
    TestBed.configureTestingModule({
      providers: [{ provide: PREFERENCES_REPOSITORY, useValue: repo }],
    });
  });

  it('starts on the brand theme and puts it on <html>', () => {
    const themes = TestBed.inject(ThemeService);
    TestBed.tick();
    expect(themes.theme()).toBe('navy');
    expect(document.documentElement.getAttribute('data-theme')).toBe('navy');
  });

  it('applies and saves a picked theme', () => {
    const themes = TestBed.inject(ThemeService);
    themes.set('navy-dark');
    TestBed.tick();
    expect(themes.theme()).toBe('navy-dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('navy-dark');
    expect(repo.saved.theme).toBe('navy-dark');
  });

  it('uses the saved theme after loading', async () => {
    repo.saved = { theme: 'nord', personaId: null };
    await TestBed.inject(PreferencesService).load();
    expect(TestBed.inject(ThemeService).theme()).toBe('nord');
  });

  it('ignores themes it does not know', async () => {
    const themes = TestBed.inject(ThemeService);
    themes.set('no-such-theme');
    expect(repo.saved.theme).toBeNull();
    repo.saved = { theme: 'no-such-theme', personaId: null };
    await TestBed.inject(PreferencesService).load();
    expect(themes.theme()).toBe('navy');
  });
});
