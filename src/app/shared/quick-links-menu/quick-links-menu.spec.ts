import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { QuickLinksMenu } from './quick-links-menu';

describe('QuickLinksMenu', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'changelog', children: [] }])],
    });
  });

  async function setup() {
    localStorage.clear();
    const fixture = TestBed.createComponent(QuickLinksMenu);
    await fixture.whenStable();
    const toggle = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    return { fixture, panel: () => document.querySelector('#quick-links-panel'), toggle };
  }

  it('lists the links, each opening in a new tab, then Change Log', async () => {
    const { fixture, panel, toggle } = await setup();
    expect(panel()).toBeNull();
    toggle.click();
    await fixture.whenStable();

    const links = [...panel()!.querySelectorAll<HTMLAnchorElement>('a')];
    expect(links.map((a) => a.textContent?.replace('(opens in a new tab)', '').trim())).toEqual([
      'Back to Forge',
      'Help Desk',
      'Holiday Calendar',
      'Change Log',
    ]);
    expect(links[0].target).toBe('');
    const external = links.slice(1, 3);
    expect(external.every((a) => a.target === '_blank' && a.rel === 'noopener')).toBe(true);
    expect(links[3].getAttribute('href')).toBe('/changelog');
  });

  it('closes on Escape and when a link is picked', async () => {
    const { fixture, panel, toggle } = await setup();
    toggle.click();
    await fixture.whenStable();
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
    await fixture.whenStable();
    expect(panel()).toBeNull();

    toggle.click();
    await fixture.whenStable();
    panel()!.querySelector<HTMLAnchorElement>('[data-testid="changelog-link"]')!.click();
    await fixture.whenStable();
    expect(panel()).toBeNull();
  });
});
