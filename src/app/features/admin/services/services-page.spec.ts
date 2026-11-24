import { TestBed } from '@angular/core/testing';
import { DemoDataService } from '../../../core/demo-data-service';
import { ViewerService } from '../../../core/viewer-service';
import { ServicesPage } from './services-page';

describe('ServicesPage', () => {
  beforeEach(() => localStorage.clear());

  async function render() {
    await TestBed.inject(DemoDataService).load();
    TestBed.inject(ViewerService).setPersona('u-developer');
    const fixture = TestBed.createComponent(ServicesPage);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const select = page.querySelector('select')!;
    const choose = async (name: string) => {
      select.value = name;
      select.dispatchEvent(new Event('change'));
      await fixture.whenStable();
    };
    const type = async (text: string) => {
      const box = page.querySelector('textarea')!;
      box.value = text;
      box.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    const run = async () => {
      page.querySelector<HTMLButtonElement>('button.btn-primary')!.click();
      await vi.waitFor(() => expect(page.querySelector('[data-testid="response"]')).not.toBeNull());
      return page.querySelector('[data-testid="response"]')!.textContent!;
    };
    const call = () => page.querySelector('[data-testid="full-call"]')?.textContent ?? '';
    return { page, choose, type, run, call };
  }

  it('looks up the example confirmation number by default, showing the call', async () => {
    const { call, run } = await render();
    expect(call()).toContain('getTicket("2001264027")');
    const ticket = JSON.parse(await run());
    expect(ticket).toMatchObject({ confirmationNumber: '2001264027', orderNumber: '513671487', operationNumber: '0010' });
    expect(ticket.charges).toHaveLength(6);
  });

  it('lists every call as a read', async () => {
    const { page } = await render();
    const options = [...page.querySelectorAll('option')].map((o) => o.textContent!.trim());
    expect(options).toEqual(['getTicket (read)', 'listTickets (read)', 'getPeople (read)']);
  });

  it('lists the tickets', async () => {
    const { choose, run, call } = await render();
    await choose('TicketClient.listTickets');
    expect(call()).toContain('listTickets()');
    expect(JSON.parse(await run())).toHaveLength(96);
  });

  it('refuses a confirmation number in the wrong format, saying why', async () => {
    const { type, page } = await render();
    await type('"12"');
    expect(page.textContent).toContain('A confirmation number has 10 digits; this has 2.');
  });

  it('returns null for a number in the right format that is not a ticket', async () => {
    const { type, run } = await render();
    await type('"2199999999"');
    expect(await run()).toBe('null');
  });
});
