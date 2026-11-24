import { TestBed } from '@angular/core/testing';
import { ChangelogPage, toDays } from './changelog-page';

describe('Change Log', () => {
  it('puts the newest day first and skips empty sections', () => {
    const days = toDays([
      { date: '2026-11-09', fixed: ['A fix'] },
      { date: '2026-11-10', added: ['A new thing'], changed: [] },
    ]);
    expect(days.map((d) => d.date)).toEqual(['2026-11-10', '2026-11-09']);
    expect(days[0].title).toBe('Tuesday 10 November 2026');
    expect(days[0].sections.map((s) => s.label)).toEqual(['Added']);
    expect(days[1].sections.map((s) => s.label)).toEqual(['Fixed']);
  });

  it('shows each day with its lines', async () => {
    const fixture = TestBed.createComponent(ChangelogPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toBe('Change Log');
    expect(el.querySelectorAll('[data-testid="day"]').length).toBeGreaterThan(0);
    expect(el.querySelector('[data-testid="day"] li')?.textContent?.length).toBeGreaterThan(0);
  });
});
