import { TestBed } from '@angular/core/testing';
import { DemoDataService } from '../../core/demo-data-service';
import { ThemeService } from '../../core/theme-service';
import { ALL_THEMES } from '../themes';
import { AvatarMenu } from './avatar-menu';

describe('AvatarMenu', () => {
  beforeEach(() => localStorage.clear());

  async function setup() {
    await TestBed.inject(DemoDataService).load();
    const fixture = TestBed.createComponent(AvatarMenu);
    await fixture.whenStable();
    const toggle = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    // The panel opens in the CDK overlay container at the end of the page.
    return { fixture, page: document.body, toggle };
  }

  it('shows initials and opens to the viewer and the theme list', async () => {
    const { fixture, page, toggle } = await setup();
    expect(toggle.textContent?.trim()).toBe('RH');
    expect(page.querySelector('[role="radiogroup"]')).toBeNull();

    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(page.querySelectorAll('[role="radio"]').length).toBe(ALL_THEMES.length + 1);
    expect(page.querySelector('app-shared-theme-picker')).toBeNull();
    expect(page.querySelector('#avatar-menu-panel')?.textContent).toContain('Rita Haddad');
  });

  it('picks a theme and marks it checked', async () => {
    const { fixture, page, toggle } = await setup();
    toggle.click();
    await fixture.whenStable();

    page.querySelector<HTMLButtonElement>('[data-theme-option="nord"]')!.click();
    await fixture.whenStable();
    expect(TestBed.inject(ThemeService).theme()).toBe('nord');
    expect(page.querySelector('[data-theme-option="nord"]')?.getAttribute('aria-checked')).toBe(
      'true',
    );

    const follow = [...page.querySelectorAll<HTMLButtonElement>('[role="radio"]')]
      .find((button) => button.textContent?.includes('Same as my other apps'))!;
    follow.click();
    await fixture.whenStable();
    expect(TestBed.inject(ThemeService).following()).toBe(true);
    expect(follow.getAttribute('aria-checked')).toBe('true');
  });

  it('closes on a click outside and on Escape', async () => {
    const { fixture, page, toggle } = await setup();
    toggle.click();
    await fixture.whenStable();
    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')!.click();
    await fixture.whenStable();
    expect(page.querySelector('#avatar-menu-panel')).toBeNull();

    toggle.click();
    await fixture.whenStable();
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
    await fixture.whenStable();
    expect(page.querySelector('#avatar-menu-panel')).toBeNull();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('View as switches the viewer straight away', async () => {
    const { fixture, page, toggle } = await setup();
    toggle.click();
    await fixture.whenStable();
    const select = page.querySelector<HTMLSelectElement>('[data-testid="persona"]')!;
    expect(select.options.length).toBe(11);
    expect(select.value).toBe('u-foreman-haddad');

    select.value = 'u-developer';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(toggle.textContent?.trim()).toBe('CE');
    expect(page.querySelector('#avatar-menu-panel')?.textContent).toContain('Developer');
  });

  it('has no Reset demo data: there is no data of its own to reset', async () => {
    const { fixture, page, toggle } = await setup();
    toggle.click();
    await fixture.whenStable();
    expect(page.querySelector('[data-testid="persona"]')).not.toBeNull();
    expect(page.textContent).not.toContain('Reset demo data');
  });
});
