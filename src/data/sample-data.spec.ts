import { integrityProblems, ticketOf } from '../domain';
import seed from './seed/ticket-seed.json';
import { SAMPLE_AS_OF, seedPersonas, seedTicketBook } from './seed';

describe('the sample tickets', () => {
  const book = seedTicketBook();

  it('read in full: no record is dropped for being in the wrong shape', () => {
    expect(book.people).toHaveLength(seed.people.length);
    expect(book.orders).toHaveLength(seed.orders.length);
    expect(book.workCenters).toHaveLength(seed.workCenters.length);
    expect(book.operations).toHaveLength(seed.operations.length);
    expect(book.charges).toHaveLength(seed.charges.length);
  });

  it('hold together: every link resolves and numbers have the right format', () => {
    expect(integrityProblems(book)).toEqual([]);
  });

  it('have every status to try, as of the day they were made', () => {
    expect(new Set(book.operations.map((o) => o.status))).toEqual(new Set(['not-started', 'in-work', 'complete']));
    expect(SAMPLE_AS_OF).toBe('2026-11-21');
  });

  it("use ZORD's and Deckfoot's confirmation numbers for order 518789751", () => {
    expect(book.operations.filter((op) => op.orderNumber === '518789751').map((op) => op.confirmationNumber)).toEqual([
      '2182183003',
      '2055271258',
      '2042716493',
    ]);
  });

  it('give the example ticket 2001264027 six charges, all to people in the sample', () => {
    const ticket = ticketOf(book, '2001264027')!;
    expect(ticket.orderNumber).toBe('513671487');
    expect(ticket.charges).toHaveLength(6);
    expect(ticket.charges.every((c) => c.firstName && c.lastName && c.costCenter)).toBe(true);
  });

  it('offer View as people who are all in the sample, with one Developer', () => {
    const personas = seedPersonas();
    expect(personas).toHaveLength(11);
    expect(personas.filter((p) => p.role === 'developer').map((p) => p.id)).toEqual(['u-developer']);
  });
});
