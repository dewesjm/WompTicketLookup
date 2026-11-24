import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CellValue, SortState, filterRows, nextSort, sortRows, toCsv } from '../../../domain';
import { Icon } from '../icon/icon';

export type CellTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

/** One column: how to read a cell (for sorting, filtering and CSV) and how to show it. */
export interface GridColumn<T> {
  id: string;
  header: string;
  value: (row: T) => CellValue;
  /** Text shown, when it differs from `value` (a label for a code, a formatted date). */
  text?: (row: T) => string;
  /** Shows the cell as a link to this address in the app, like /?confirmation=2001264027 */
  link?: (row: T) => string;
  /** Shows the cell as a colored badge. */
  tone?: (row: T) => CellTone;
  /** Numbers line up on the right. */
  numeric?: boolean;
}

/**
 * A results grid: sort by any column (click its header: up, down, off), filter by words in any
 * cell, and download what's shown as CSV. Wide grids scroll sideways inside their own box, which
 * takes keyboard focus so it can be scrolled with the arrow keys.
 */
@Component({
  selector: 'wt-data-grid',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap items-end gap-2">
      <label class="flex grow flex-col gap-1 text-sm font-medium sm:max-w-xs">
        Filter {{ label().toLowerCase() }}
        <input type="search" class="input input-sm w-full" [value]="filter()"
          (input)="filter.set($any($event.target).value)" />
      </label>
      <p class="grow text-sm" aria-live="polite" data-testid="grid-count">
        {{ shown().length === rows().length ? rows().length + ' ' + noun(rows().length) : shown().length + ' of ' + rows().length + ' ' + noun(rows().length) }}
      </p>
      <button type="button" class="btn btn-sm" [disabled]="shown().length === 0" (click)="download()">
        <wt-icon name="download" class="size-4" /> Download CSV
      </button>
    </div>
    <div class="mt-2 max-h-[70vh] overflow-auto rounded-box border border-base-300 bg-base-100"
      tabindex="0" role="region" [attr.aria-label]="label() + ' grid'">
      <table class="table table-zebra table-sm table-pin-rows whitespace-nowrap">
        <caption class="sr-only">{{ label() }}</caption>
        <thead>
          <tr>
            @for (column of columns(); track column.id) {
              <th scope="col" [attr.aria-sort]="ariaSort(column.id)" [class.text-right]="column.numeric">
                <button type="button" class="btn btn-ghost btn-xs min-h-6 gap-1 px-1 font-semibold"
                  (click)="sortBy(column.id)">
                  {{ column.header }}
                  <wt-icon [name]="sortIcon(column.id)" class="size-3.5" [class.opacity-40]="sort()?.column !== column.id" />
                </button>
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of shown(); track $index) {
            <tr>
              @for (column of columns(); track column.id) {
                <td [class.text-right]="column.numeric" [class.tabular-nums]="column.numeric">
                  @if (column.link; as link) {
                    <a class="link inline-flex min-h-6 items-center font-medium" [routerLink]="router.parseUrl(link(row))">{{ show(column, row) }}</a>
                  } @else if (column.tone && show(column, row)) {
                    <span class="badge badge-sm" [class]="'badge-' + column.tone(row)">{{ show(column, row) }}</span>
                  } @else {
                    {{ show(column, row) }}
                  }
                </td>
              }
            </tr>
          } @empty {
            <tr><td [attr.colspan]="columns().length" class="py-6 text-center">
              {{ rows().length ? 'No rows match the filter.' : 'Nothing to show.' }}
            </td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DataGrid<T> {
  protected readonly router = inject(Router);
  readonly label = input.required<string>();
  readonly columns = input.required<readonly GridColumn<T>[]>();
  readonly rows = input.required<readonly T[]>();
  /** Download's file name, without .csv. */
  readonly fileName = input('charges');

  protected readonly filter = signal('');
  protected readonly sort = signal<SortState | null>(null);

  protected readonly shown = computed(() => {
    const columns = this.columns();
    const filtered = filterRows(this.rows(), (row) => columns.map((c) => this.show(c, row)), this.filter());
    const sort = this.sort();
    const column = sort && columns.find((c) => c.id === sort.column);
    return column ? sortRows(filtered, column.value, sort!.direction) : filtered;
  });

  protected show(column: GridColumn<T>, row: T): string {
    if (column.text) return column.text(row);
    const value = column.value(row);
    return value === null ? '' : String(value);
  }

  protected noun(count: number): string {
    return count === 1 ? 'row' : 'rows';
  }

  protected sortBy(column: string): void {
    this.sort.update((current) => nextSort(current, column));
  }

  protected ariaSort(column: string): string | null {
    const sort = this.sort();
    if (sort?.column !== column) return null;
    return sort.direction === 'asc' ? 'ascending' : 'descending';
  }

  protected sortIcon(column: string): string {
    const sort = this.sort();
    if (sort?.column !== column) return 'arrow-up-down';
    return sort.direction === 'asc' ? 'arrow-up' : 'arrow-down';
  }

  /** Saves the rows shown (filtered and sorted) as a CSV file. */
  protected download(): void {
    const columns = this.columns();
    const csv = toCsv(columns.map((c) => c.header), this.shown().map((row) => columns.map((c) => this.show(c, row))));
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.fileName()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
