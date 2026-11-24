import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ViewerService } from '../../../core/viewer-service';
import { ServiceOperation, ticketOperations } from './ticket-operations';

@Component({
  selector: 'wt-services-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-4xl space-y-4">
      <h1 class="text-2xl font-semibold">Services</h1>
      <p>Try the calls Womp Ticket Lookup's screens make and see exactly what they send and get back. Every call is a read: this app shows tickets and changes nothing.</p>
      <label class="flex flex-col gap-1 font-medium">
        Service call
        <select class="select w-full" (change)="select($any($event.target).value)">
          @for (group of groups; track group.name) {
            <optgroup [label]="group.name">
              @for (operation of group.operations; track operation.name) {
                <option [value]="operation.name">{{ operation.name.split('.')[1] }} ({{ operation.writes ? 'write' : 'read' }})</option>
              }
            </optgroup>
          }
        </select>
      </label>
      <p>{{ selected().description }}</p>
      @if (selected().example !== undefined) {
        <label class="flex flex-col gap-1 font-medium">
          Argument (JSON)
          <textarea class="textarea w-full font-mono" rows="8" spellcheck="false"
            [value]="argument()" (input)="edit($any($event.target).value)"></textarea>
        </label>
      }
      <h2 class="font-semibold">Full call</h2>
      @if (preview(); as prepared) {
        @if ('call' in prepared) {
          <pre class="whitespace-pre-wrap break-all rounded-box bg-base-200 p-3 text-sm" data-testid="full-call">{{ prepared.call }}</pre>
        } @else {
          <p class="text-error">{{ prepared.problem }}</p>
        }
      }
      <button type="button" class="btn btn-primary" [disabled]="!('run' in preview()) || busy()"
        (click)="run()">
        {{ selected().writes ? 'Run write' : 'Run read' }}
      </button>
      <div aria-live="polite">
        @if (response(); as result) {
          <h2 class="mb-2 font-semibold">Response</h2>
          <pre class="whitespace-pre-wrap break-all rounded-box bg-base-200 p-3 text-sm" data-testid="response">{{ result }}</pre>
        }
      </div>
    </div>
  `,
})
export class ServicesPage {
  private readonly viewer = inject(ViewerService);
  private readonly operations = ticketOperations();
  protected readonly groups = [...new Set(this.operations.map((op) => op.name.split('.')[0]))]
    .map((name) => ({ name, operations: this.operations.filter((op) => op.name.startsWith(name + '.')) }));
  protected readonly selected = signal<ServiceOperation>(this.operations[0]);
  protected readonly argument = signal(JSON.stringify(this.operations[0].example, null, 2) ?? '');
  protected readonly busy = signal(false);
  protected readonly response = signal('');
  private revision = 0;
  protected readonly preview = computed(() => {
    try {
      const operation = this.selected();
      return operation.prepare(operation.example === undefined ? undefined : JSON.parse(this.argument()));
    } catch (error) {
      return { problem: error instanceof SyntaxError ? 'Enter valid JSON.' : this.errorMessage(error) };
    }
  });

  protected select(name: string): void {
    const operation = this.operations.find((item) => item.name === name);
    if (!operation) return;
    this.selected.set(operation);
    this.edit(JSON.stringify(operation.example, null, 2) ?? '');
  }

  protected edit(text: string): void {
    this.revision++;
    this.argument.set(text);
    this.response.set('');
  }

  protected async run(): Promise<void> {
    if (this.busy() || !this.viewer.permissions().includes('admin-services')) return;
    const prepared = this.preview();
    if (!('run' in prepared)) return;
    const revision = this.revision;
    this.busy.set(true);
    this.response.set('');
    try {
      const result = await prepared.run();
      if (revision === this.revision) this.response.set(JSON.stringify(result, null, 2) ?? 'Completed (no return value).');
    } catch (error) {
      if (revision === this.revision) this.response.set(this.errorMessage(error));
    } finally {
      this.busy.set(false);
    }
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
