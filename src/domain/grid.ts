/*
 * Sorting and filtering for the results grids: plain functions, so they're tested without a
 * browser. A grid's columns say how to read each cell; these work on what the columns read.
 */

export type CellValue = string | number | boolean | null;

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  column: string;
  direction: SortDirection;
}

/** Empty cells last whichever way the column is sorted; numbers by size; text naturally (0010 < 0020, E2 < E10). */
export function compareCells(a: CellValue, b: CellValue, direction: SortDirection): number {
  const emptyA = a === null || a === '';
  const emptyB = b === null || b === '';
  if (emptyA || emptyB) return emptyA === emptyB ? 0 : emptyA ? 1 : -1;
  let result: number;
  if (typeof a === 'number' && typeof b === 'number') result = a - b;
  else if (typeof a === 'boolean' && typeof b === 'boolean') result = Number(a) - Number(b);
  else result = String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
  return direction === 'asc' ? result : -result;
}

/** Rows sorted by one column, a stable sort, so ties keep their order. Never changes `rows`. */
export function sortRows<T>(rows: readonly T[], read: (row: T) => CellValue, direction: SortDirection): T[] {
  return rows
    .map((row, index) => ({ row, index, value: read(row) }))
    .sort((x, y) => compareCells(x.value, y.value, direction) || x.index - y.index)
    .map((x) => x.row);
}

/** Clicking a column's header: sort by it ascending, then descending, then not at all. */
export function nextSort(current: SortState | null, column: string): SortState | null {
  if (current?.column !== column) return { column, direction: 'asc' };
  return current.direction === 'asc' ? { column, direction: 'desc' } : null;
}

/** Rows where any cell contains every word of `filter`, ignoring case. */
export function filterRows<T>(rows: readonly T[], cells: (row: T) => CellValue[], filter: string): T[] {
  const words = filter.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [...rows];
  return rows.filter((row) => {
    const text = cells(row).map((c) => (c === null ? '' : String(c).toLowerCase())).join(' ');
    return words.every((w) => text.includes(w));
  });
}

/** The rows as CSV (RFC 4180), header first, for Download. */
export function toCsv(headers: readonly string[], rows: readonly CellValue[][]): string {
  const cell = (v: CellValue) => {
    const text = v === null ? '' : String(v);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [headers, ...rows].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';
}
