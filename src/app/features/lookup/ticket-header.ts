import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Ticket } from '../../../domain';
import { STATUS_TONE, formatHours, statusLabel } from './format';

/** One ticket's facts and hours, shown above its charges. */
@Component({
  selector: 'wt-ticket-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let t = ticket();
    <dl class="grid grid-cols-1 gap-x-6 gap-y-3 rounded-box bg-base-100 p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <dt class="text-sm font-medium">Order</dt>
        <dd data-testid="order">{{ t.orderNumber }}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium">Operation</dt>
        <dd data-testid="operation">{{ t.operationNumber }}</dd>
      </div>
      <div class="sm:col-span-2">
        <dt class="text-sm font-medium">Description</dt>
        <dd data-testid="description">{{ t.description }}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium">Work center</dt>
        <dd data-testid="work-center">{{ workCenter() }}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium">WBS</dt>
        <dd data-testid="wbs">{{ t.wbs || 'None' }}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium">Status</dt>
        <dd><span class="badge" [class]="'badge-' + tone()" data-testid="status">{{ status() }}</span></dd>
      </div>
    </dl>

    <div class="stats stats-vertical mt-4 w-full bg-base-100 shadow-sm sm:stats-horizontal sm:w-auto">
      <div class="stat">
        <div class="stat-title text-base-content">Target hours</div>
        <div class="stat-value text-2xl tabular-nums" data-testid="target-hours">{{ hours(t.targetHours) }}</div>
      </div>
      <div class="stat">
        <div class="stat-title text-base-content">Spent hours</div>
        <div class="stat-value text-2xl tabular-nums" data-testid="spent-hours">{{ hours(t.spentHours) }}</div>
      </div>
      <div class="stat">
        <div class="stat-title text-base-content">Remaining hours</div>
        <div class="stat-value text-2xl tabular-nums" data-testid="remaining-hours">{{ hours(t.remainingHours) }}</div>
      </div>
    </div>
  `,
})
export class TicketHeader {
  readonly ticket = input.required<Ticket>();
  protected readonly status = computed(() => statusLabel(this.ticket().status));
  protected readonly tone = computed(() => STATUS_TONE[this.ticket().status]);
  protected readonly workCenter = computed(() => {
    const { code, name } = this.ticket().workCenter;
    return name ? `${code} · ${name}` : code;
  });
  protected readonly hours = formatHours;
}
