import { formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { CHANGE_LOG, ChangeLogDay } from './changelog';

const SECTIONS = [
  { key: 'added', label: 'Added', badge: 'badge-success' },
  { key: 'changed', label: 'Changed', badge: 'badge-info' },
  { key: 'fixed', label: 'Fixed', badge: 'badge-warning' },
] as const;

/** The change log, newest day first; each day lists Added, Changed and Fixed, skipping empty ones. */
@Component({
  selector: 'wt-changelog-page',
  template: `
    <h1 class="text-2xl font-semibold">Change Log</h1>
    <div class="mt-4 flex max-w-3xl flex-col gap-4">
      @for (day of days; track day.date) {
        <section
          class="rounded-box border border-base-300 bg-base-100 p-4"
          [attr.aria-labelledby]="'log-' + day.date"
          data-testid="day"
        >
          <h2 [id]="'log-' + day.date" class="text-lg font-semibold">{{ day.title }}</h2>
          @for (s of day.sections; track s.label) {
            <div class="mt-3">
              <h3 class="badge {{ s.badge }}">{{ s.label }}</h3>
              <ul class="mt-1 flex list-disc flex-col gap-1 pl-6">
                @for (line of s.lines; track $index) {
                  <li>{{ line }}</li>
                }
              </ul>
            </div>
          }
        </section>
      }
    </div>
  `,
})
export class ChangelogPage {
  protected readonly days = toDays(CHANGE_LOG);
}

/** Days newest first, with a readable date and only the sections that have lines. */
export function toDays(log: readonly ChangeLogDay[]) {
  return [...log]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((day) => ({
      date: day.date,
      title: formatDate(day.date, 'EEEE d MMMM y', 'en-US'),
      sections: SECTIONS.map((s) => ({ ...s, lines: day[s.key] ?? [] })).filter(
        (s) => s.lines.length > 0,
      ),
    }));
}
