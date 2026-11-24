import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { DemoDataService } from '../../core/demo-data-service';
import { LookupPage } from './lookup-page';

describe('LookupPage', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: '', component: LookupPage }])] });
  });

  async function open(url = '/') {
    await TestBed.inject(DemoDataService).load();
    const harness = await RouterTestingHarness.create(url);
    const page = harness.routeNativeElement!;
    const settle = async () => {
      await harness.fixture.whenStable();
      harness.detectChanges();
    };
    await settle();
    const box = () => page.querySelector<HTMLInputElement>('#confirmation')!;
    const type = (text: string) => {
      box().value = text;
      box().dispatchEvent(new Event('input'));
    };
    const submit = async () => {
      page.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
      await settle();
    };
    const text = (id: string) => page.querySelector(`[data-testid="${id}"]`)?.textContent?.trim();
    const rows = () =>
      [...page.querySelectorAll('tbody tr')].map((tr) => [...tr.querySelectorAll('td')].map((td) => td.textContent!.trim()));
    return { page, harness, settle, box, type, submit, text, rows };
  }

  it('starts with a hint and an example to try', async () => {
    const { page } = await open();
    expect(page.querySelector('label[for="confirmation"]')?.textContent).toContain('Confirmation number');
    expect(page.querySelector('a[href="/?confirmation=2001264027"]')).not.toBeNull();
  });

  it('looks up a confirmation number, putting it in the address', async () => {
    const { type, submit, text, page } = await open();
    type('2001264027');
    await submit();
    expect(TestBed.inject(Router).url).toBe('/?confirmation=2001264027');
    expect(page.querySelector('h1')?.textContent).toContain('Confirmation 2001264027');
    expect(text('order')).toBe('513671487');
    expect(text('operation')).toBe('0010');
    expect(text('description')).toBe('Fit up new spool');
    expect(text('work-center')).toBe('PF-5610 · Pipefitting');
    expect(text('wbs')).toMatch(/^W\.2026\.\d{3}\.\d{2}$/);
    expect(text('status')).toBe('Complete');
    expect(text('target-hours')).toBe('12');
  });

  it('shows every charge in the grid, newest posting first, and spent hours add them up', async () => {
    const { rows, text } = await open('/?confirmation=2001264027');
    const charges = rows();
    expect(charges).toHaveLength(6);
    expect(charges[0]).toHaveLength(6);
    expect(charges[0][0]).toMatch(/^E\d{5}$/);
    expect(charges[0][3]).toMatch(/^\d{5}$/);
    const spent = charges.reduce((sum, row) => sum + Number(row[4]), 0);
    expect(Number(text('spent-hours'))).toBeCloseTo(spent);
    const dates = charges.map((row) => Date.parse(row[5]));
    expect([...dates].sort((a, b) => b - a)).toEqual(dates);
  });

  it('opens straight to a ticket from a link, filling in the box', async () => {
    const { box, page } = await open('/?confirmation=2182183003');
    expect(box().value).toBe('2182183003');
    expect(page.querySelector('h1')?.textContent).toContain('Confirmation 2182183003');
  });

  it('says why a number is in the wrong format, without looking it up', async () => {
    const { type, submit, page, box } = await open();
    type('12345');
    await submit();
    expect(page.querySelector('#confirmation-problem')?.textContent).toContain('has 10 digits; this has 5');
    expect(box().getAttribute('aria-invalid')).toBe('true');
    expect(TestBed.inject(Router).url).toBe('/');
    expect(page.querySelector('wt-ticket-header')).toBeNull();
  });

  it('says so when no ticket has that number', async () => {
    const { text, page } = await open('/?confirmation=2199999999');
    expect(text('not-found')).toBe("There's no ticket with confirmation number 2199999999.");
    expect(page.querySelector('wt-ticket-header')).toBeNull();
  });

  it('shows an empty grid for a ticket nobody has charged to yet', async () => {
    const { page, text } = await open('/?confirmation=2042716493');
    expect(text('status')).toBe('Not started');
    expect(text('spent-hours')).toBe('0');
    expect(page.querySelector('tbody')?.textContent).toContain('Nothing to show.');
  });
});
