import { TicketBook, confirmationProblem, integrityProblems, roundHours, ticketOf, ticketSummaries } from './tickets';

function book(): TicketBook {
  return {
    people: [
      { id: 'u-a', employeeNumber: 'E00001', firstName: 'Ana', lastName: 'Alvarez', title: 'Pipefitter', costCenter: '41560' },
      { id: 'u-b', employeeNumber: 'E00002', firstName: 'Ben', lastName: 'Brooks', title: 'Welder', costCenter: '41570' },
    ],
    orders: [{ orderNumber: '518789751', wbs: 'W.2026.039.01' }],
    workCenters: [{ code: 'PF-5610', name: 'Pipefitting' }],
    operations: [
      { confirmationNumber: '2182183003', orderNumber: '518789751', operationNumber: '0010', description: 'Install hangers', workCenter: 'PF-5610', status: 'in-work', targetHours: 8 },
      { confirmationNumber: '2055271258', orderNumber: '518789751', operationNumber: '0020', description: 'Fit up spool', workCenter: 'PF-5610', status: 'not-started', targetHours: 4 },
    ],
    charges: [
      { confirmationNumber: '2182183003', personId: 'u-a', hours: 4.1, postingDate: '2026-11-16' },
      { confirmationNumber: '2182183003', personId: 'u-b', hours: 4.2, postingDate: '2026-11-18' },
      { confirmationNumber: '2182183003', personId: 'u-a', hours: 0.2, postingDate: '2026-11-17' },
    ],
  };
}

describe('confirmationProblem', () => {
  it('accepts 10 digits starting 20 or 21, with spaces around', () => {
    expect(confirmationProblem('2182183003')).toBeNull();
    expect(confirmationProblem(' 2055271258 ')).toBeNull();
  });

  it('says what is wrong otherwise', () => {
    expect(confirmationProblem('  ')).toBe('Enter a confirmation number.');
    expect(confirmationProblem('21821A3003')).toBe('A confirmation number is digits only.');
    expect(confirmationProblem('218218300')).toBe('A confirmation number has 10 digits; this has 9.');
    expect(confirmationProblem('3182183003')).toBe('A confirmation number starts with 20 or 21.');
    expect(confirmationProblem('2282183003')).toBe('A confirmation number starts with 20 or 21.');
  });
});

describe('ticketOf', () => {
  it('builds the header from the operation, its order and its work center', () => {
    const ticket = ticketOf(book(), '2182183003')!;
    expect(ticket).toMatchObject({
      confirmationNumber: '2182183003',
      orderNumber: '518789751',
      operationNumber: '0010',
      description: 'Install hangers',
      workCenter: { code: 'PF-5610', name: 'Pipefitting' },
      targetHours: 8,
      spentHours: 8.5,
      remainingHours: 0,
      wbs: 'W.2026.039.01',
      status: 'in-work',
    });
  });

  it('lists every charge with the person beside it, newest posting first', () => {
    const ticket = ticketOf(book(), '2182183003')!;
    expect(ticket.charges).toEqual([
      { employeeNumber: 'E00002', firstName: 'Ben', lastName: 'Brooks', costCenter: '41570', hours: 4.2, postingDate: '2026-11-18' },
      { employeeNumber: 'E00001', firstName: 'Ana', lastName: 'Alvarez', costCenter: '41560', hours: 0.2, postingDate: '2026-11-17' },
      { employeeNumber: 'E00001', firstName: 'Ana', lastName: 'Alvarez', costCenter: '41560', hours: 4.1, postingDate: '2026-11-16' },
    ]);
  });

  it('works out remaining hours as target less spent, never below zero', () => {
    const b = book();
    b.operations[0].targetHours = 10;
    expect(ticketOf(b, '2182183003')!.remainingHours).toBe(1.5);
    expect(ticketOf(b, '2055271258')).toMatchObject({ spentHours: 0, remainingHours: 4, charges: [] });
  });

  it('is null when no operation has that confirmation number', () => {
    expect(ticketOf(book(), '2199999999')).toBeNull();
  });

  it('still shows a charge whose person is missing, by their id', () => {
    const b = book();
    b.charges[0].personId = 'u-gone';
    const charge = ticketOf(b, '2182183003')!.charges.find((c) => c.employeeNumber === 'u-gone');
    expect(charge).toMatchObject({ firstName: '', lastName: '', costCenter: '', hours: 4.1 });
  });
});

describe('roundHours', () => {
  it('rounds to two decimals', () => {
    expect(roundHours(0.1 + 0.2)).toBe(0.3);
  });
});

describe('ticketSummaries', () => {
  it('gives each confirmation number with its charge count, in number order', () => {
    expect(ticketSummaries(book()).map((s) => [s.confirmationNumber, s.charges])).toEqual([
      ['2055271258', 0],
      ['2182183003', 3],
    ]);
  });
});

describe('integrityProblems', () => {
  it('is empty for a sound store', () => {
    expect(integrityProblems(book())).toEqual([]);
  });

  it('finds broken links, bad formats, duplicates and impossible charges', () => {
    const b = book();
    b.operations.push({ ...b.operations[0], operationNumber: '0030' });
    b.operations[1].workCenter = 'XX-0000';
    b.orders.push({ orderNumber: '12', wbs: '' });
    b.charges.push({ confirmationNumber: '2055271258', personId: 'u-nobody', hours: 0, postingDate: '2026-11-19' });
    expect(integrityProblems(b)).toEqual([
      'Two operations with confirmation 2182183003.',
      'Order number 12 is not in the right format.',
      "Confirmation 2055271258 points at work center XX-0000, which isn't there.",
      "A charge on 2055271258 points at person u-nobody, who isn't there.",
      'A charge on 2055271258 has 0 hours.',
      'Confirmation 2055271258 is Not started but has time charged.',
    ]);
  });
});
