import { Migration, SCHEMA_VERSION, upgrade } from './schema';

describe('upgrade', () => {
  it('passes a current value through', () => {
    expect(upgrade({ schemaVersion: SCHEMA_VERSION, a: 1 }, {})).toEqual({ schemaVersion: SCHEMA_VERSION, a: 1 });
  });

  it('upgrades a value with no version (version 0) through the migrations', () => {
    const migrations: Record<number, Migration> = { 0: (raw) => ({ ...raw, added: true }), 1: (raw) => raw };
    expect(upgrade({ theme: 'nord' }, migrations)).toEqual({
      theme: 'nord',
      added: true,
      schemaVersion: SCHEMA_VERSION,
    });
  });

  it('gives null for what it cannot use', () => {
    expect(upgrade('text', {})).toBeNull();
    expect(upgrade([1, 2], {})).toBeNull();
    expect(upgrade(null, {})).toBeNull();
    expect(upgrade({ schemaVersion: SCHEMA_VERSION + 1 }, {})).toBeNull();
    expect(upgrade({ schemaVersion: 1.5 }, {})).toBeNull();
    // An old version with no migration for it.
    expect(upgrade({}, {})).toBeNull();
  });
});
