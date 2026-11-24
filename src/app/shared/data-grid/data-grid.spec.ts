import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DataGrid, GridColumn } from './data-grid';

interface Row {
  order: string;
  hours: number;
}

describe('DataGrid', () => {
  const columns: GridColumn<Row>[] = [
    { id: 'order', header: 'Order', value: (r) => r.order },
    { id: 'hours', header: 'Hours', value: (r) => r.hours, numeric: true },
  ];
  const rows: Row[] = [
    { order: '518789751', hours: 4 },
    { order: '213671487', hours: 12 },
    { order: '500162002', hours: 2.5 },
  ];

  async function render() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(DataGrid<Row>);
    fixture.componentRef.setInput('label', 'Operations');
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('rows', rows);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const firstCells = () => [...page.querySelectorAll('tbody tr td:first-child')].map((td) => td.textContent?.trim());
    return { fixture, page, firstCells };
  }

  it('sorts by a column: up, down, then back to the original order', async () => {
    const { fixture, page, firstCells } = await render();
    const hours = page.querySelectorAll<HTMLButtonElement>('th button')[1];
    hours.click();
    await fixture.whenStable();
    expect(firstCells()).toEqual(['500162002', '518789751', '213671487']);
    expect(page.querySelectorAll('th')[1].getAttribute('aria-sort')).toBe('ascending');
    hours.click();
    await fixture.whenStable();
    expect(firstCells()).toEqual(['213671487', '518789751', '500162002']);
    hours.click();
    await fixture.whenStable();
    expect(firstCells()).toEqual(['518789751', '213671487', '500162002']);
    expect(page.querySelectorAll('th')[1].getAttribute('aria-sort')).toBeNull();
  });

  it('filters and counts the rows shown', async () => {
    const { fixture, page, firstCells } = await render();
    const filter = page.querySelector<HTMLInputElement>('input[type="search"]')!;
    filter.value = '5187';
    filter.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(firstCells()).toEqual(['518789751']);
    expect(page.querySelector('[data-testid="grid-count"]')?.textContent?.trim()).toBe('1 of 3 rows');
    filter.value = 'nothing';
    filter.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(page.querySelector('tbody')?.textContent).toContain('No rows match the filter.');
  });
});
