import { SCHEMA_VERSION } from '../schema';
import { LocalPreferencesRepository, PREFERENCES_KEY } from './local-preferences-repository';

describe('LocalPreferencesRepository', () => {
  beforeEach(() => localStorage.clear());

  it('gives the defaults when nothing is saved', async () => {
    expect(await new LocalPreferencesRepository().load()).toEqual({ theme: null, personaId: null });
  });

  it('loads what it saved, as a flat object with the schema version', async () => {
    await new LocalPreferencesRepository().save({ theme: 'navy-dark', personaId: 'welder' });
    expect(JSON.parse(localStorage.getItem(PREFERENCES_KEY)!)).toEqual({
      schemaVersion: SCHEMA_VERSION,
      theme: 'navy-dark',
      personaId: 'welder',
    });
    expect(await new LocalPreferencesRepository().load()).toEqual({
      theme: 'navy-dark',
      personaId: 'welder',
    });
  });

  it('clears the old theme and keeps the viewer when upgrading', async () => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ schemaVersion: 1, theme: 'nord', personaId: 'welder' }));
    expect(await new LocalPreferencesRepository().load()).toEqual({ theme: null, personaId: 'welder' });
  });

  it('falls back to the defaults when the saved value is unreadable', async () => {
    localStorage.setItem(PREFERENCES_KEY, '{not json');
    expect(await new LocalPreferencesRepository().load()).toEqual({ theme: null, personaId: null });
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ theme: 42, personaId: ['x'] }));
    expect(await new LocalPreferencesRepository().load()).toEqual({ theme: null, personaId: null });
  });
});
