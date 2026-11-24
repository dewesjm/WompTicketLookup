import { TestBed } from '@angular/core/testing';
import { DemoDataService } from './demo-data-service';
import { PreferencesService } from './preferences-service';
import { ViewerService, initialsOf } from './viewer-service';

describe('ViewerService', () => {
  beforeEach(() => localStorage.clear());

  async function setup() {
    await TestBed.inject(DemoDataService).load();
    return TestBed.inject(ViewerService);
  }

  it('starts on the default persona, the shop machinist, with no admin permissions', async () => {
    const viewer = await setup();
    expect(viewer.viewer().id).toBe('u-foreman-haddad');
    expect(viewer.initials()).toBe('RH');
    expect(viewer.permissions()).toEqual([]);
  });

  it('gives the Developer Admin > Services', async () => {
    const viewer = await setup();
    viewer.setPersona('u-developer');
    expect(viewer.permissions()).toEqual(['admin-services']);
  });

  it('switches persona and saves the choice', async () => {
    const viewer = await setup();
    viewer.setPersona('u-welder');
    expect(viewer.viewer().name).toBe('Sam Kowalski');
    expect(viewer.initials()).toBe('SK');
    expect(TestBed.inject(PreferencesService).preferences().personaId).toBe('u-welder');
  });

  it('ignores a persona that does not exist, and falls back to the default for a stale saved one', async () => {
    const viewer = await setup();
    viewer.setPersona('nobody');
    expect(viewer.viewer().id).toBe('u-foreman-haddad');

    TestBed.inject(PreferencesService).update({ personaId: 'retired-persona' });
    expect(viewer.viewer().id).toBe('u-foreman-haddad');
  });

  it('is a Guest before the personas load', () => {
    const viewer = TestBed.inject(ViewerService);
    expect(viewer.viewer().name).toBe('Guest');
    expect(viewer.permissions()).toEqual([]);
  });
});

describe('initialsOf', () => {
  it('takes the first letters of the first and last names', () => {
    expect(initialsOf('Demo Viewer')).toBe('DV');
    expect(initialsOf('ana maria lopez')).toBe('AL');
  });

  it('copes with one name or none', () => {
    expect(initialsOf('Cher')).toBe('C');
    expect(initialsOf('  ')).toBe('?');
  });
});
