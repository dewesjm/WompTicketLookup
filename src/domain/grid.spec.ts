import { compareCells, filterRows, nextSort, sortRows, toCsv } from './grid';

describe('compareCells', () => {
  it('sorts numbers by size and text naturally', () => {
    expect(compareCells(2, 10, 'asc')).toBeLessThan(0);
    expect(compareCells('E2', 'E10', 'asc')).toBeLessThan(0);
    expect(compareCells('b', 'A', 'asc')).toBeGreaterThan(0);
    expect(compareCells(2, 10, 'desc')).toBeGreaterThan(0);
  });

  it('puts empty cells last either way', () => {
    expect(compareCells(null, 'a', 'asc')).toBeGreaterThan(0);
    expect(compareCells(null, 'a', 'desc')).toBeGreaterThan(0);
    expect(compareCells('', null, 'asc')).toBe(0);
  });
});

describe('sortRows', () => {
  it('sorts without changing the list, keeping ties in order', () => {
    const rows = [{ k: 'b', n: 1 }, { k: 'a', n: 2 }, { k: 'b', n: 3 }];
    expect(sortRows(rows, (r) => r.k, 'asc').map((r) => r.n)).toEqual([2, 1, 3]);
    expect(sortRows(rows, (r) => r.k, 'desc').map((r) => r.n)).toEqual([1, 3, 2]);
    expect(rows.map((r) => r.n)).toEqual([1, 2, 3]);
  });
});

describe('nextSort', () => {
  it('goes ascending, descending, then off; a new column starts ascending', () => {
    const asc = nextSort(null, 'a');
    expect(asc).toEqual({ column: 'a', direction: 'asc' });
    const desc = nextSort(asc, 'a');
    expect(desc).toEqual({ column: 'a', direction: 'desc' });
    expect(nextSort(desc, 'a')).toBeNull();
    expect(nextSort(desc, 'b')).toEqual({ column: 'b', direction: 'asc' });
  });
});

describe('filterRows', () => {
  const rows = [['518789751', 'Install hangers'], ['213671487', 'Cut out joint']];
  it('keeps rows that contain every word, in any cell, ignoring case', () => {
    expect(filterRows(rows, (r) => r, 'HANGERS 5187')).toEqual([rows[0]]);
    expect(filterRows(rows, (r) => r, 'joint hangers')).toEqual([]);
    expect(filterRows(rows, (r) => r, '  ')).toEqual(rows);
  });
});

describe('toCsv', () => {
  it('quotes cells with commas, quotes or line breaks', () => {
    expect(toCsv(['Order', 'Text'], [['518789751', 'Say "hi", then\nleave'], ['1', null]])).toBe(
      'Order,Text\r\n518789751,"Say ""hi"", then\nleave"\r\n1,\r\n',
    );
  });
});
