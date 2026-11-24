import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { confirmationProblem } from '../../../domain';
import { TicketsService } from '../../core/tickets-service';
import { DataGrid } from '../../shared/data-grid/data-grid';
import { Icon } from '../../shared/icon/icon';
import { CHARGE_COLUMNS } from './charge-columns';
import { TicketHeader } from './ticket-header';

/** The example in the hint: a ticket in the sample with several charges. */
export const EXAMPLE_CONFIRMATION = '2001264027';

/**
 * The one page: type a confirmation number, see its ticket and every charge to it. The number
 * is in the address (?confirmation=…), so other apps can link straight to a ticket, and Back
 * and bookmarks work.
 */
@Component({
  selector: 'wt-lookup-page',
  imports: [RouterLink, DataGrid, Icon, TicketHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block space-y-6' },
  template: `
    <form class="flex flex-wrap items-start gap-2" (submit)="submit($event)" novalidate>
      <div class="flex w-full flex-col gap-1 sm:w-72">
        <label for="confirmation" class="font-medium">Confirmation number</label>
        <input
          id="confirmation"
          name="confirmation"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          class="input w-full"
          [class.input-error]="problem()"
          [value]="typed()"
          (input)="typed.set($any($event.target).value)"
          [attr.aria-invalid]="problem() ? true : null"
          [attr.aria-describedby]="problem() ? 'confirmation-problem' : 'confirmation-hint'"
        />
        @if (problem(); as message) {
          <p id="confirmation-problem" class="flex items-center gap-1 text-sm">
            <wt-icon name="triangle-alert" class="size-4 shrink-0 text-error" />{{ message }}
          </p>
        } @else {
          <p id="confirmation-hint" class="text-sm">10 digits, starting with 20 or 21.</p>
        }
      </div>
      <button type="submit" class="btn btn-primary sm:mt-7" [disabled]="tickets.busy()">Look up</button>
    </form>

    <div aria-live="polite">
      @switch (message().kind) {
        @case ('empty') {
          <p>
            Enter a confirmation number to see its ticket and every charge to it. Try
            <a class="link inline-flex min-h-6 items-center" routerLink="/" [queryParams]="{ confirmation: example }">{{ example }}</a>.
          </p>
        }
        @case ('not-found') {
          <div role="alert" class="alert" data-testid="not-found">
            There's no ticket with confirmation number {{ message().confirmationNumber }}.
          </div>
        }
        @case ('failed') {
          <div role="alert" class="alert alert-error">
            Couldn't look up {{ message().confirmationNumber }}: {{ message().text }}
          </div>
        }
      }
    </div>

    @if (ticket(); as t) {
      <section class="space-y-4" aria-labelledby="ticket-heading">
        <h1 id="ticket-heading" class="text-2xl font-semibold">Confirmation {{ t.confirmationNumber }}</h1>
        <wt-ticket-header [ticket]="t" />
        <h2 class="text-xl font-semibold">Charges</h2>
        <wt-data-grid label="Charges" [columns]="columns" [rows]="t.charges" [fileName]="'charges-' + t.confirmationNumber" />
      </section>
    } @else {
      <h1 class="sr-only">Womp Ticket Lookup</h1>
    }
  `,
})
export class LookupPage {
  protected readonly tickets = inject(TicketsService);
  private readonly router = inject(Router);
  protected readonly columns = CHARGE_COLUMNS;
  protected readonly example = EXAMPLE_CONFIRMATION;

  protected readonly ticket = computed(() => {
    const state = this.tickets.state();
    return state.kind === 'found' ? state.ticket : null;
  });
  /** The line under the form: the hint, no such ticket, or a failed call. */
  protected readonly message = computed(() => {
    const state = this.tickets.state();
    switch (state.kind) {
      case 'empty':
        return { kind: 'empty', confirmationNumber: '', text: '' };
      case 'not-found':
        return { kind: 'not-found', confirmationNumber: state.confirmationNumber, text: '' };
      case 'failed':
        return { kind: 'failed', confirmationNumber: state.confirmationNumber, text: state.message };
      default:
        return { kind: 'none', confirmationNumber: '', text: '' };
    }
  });

  private readonly fromAddress = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map((params) => params.get('confirmation') ?? '')),
    { initialValue: '' },
  );
  /** What's in the box. Follows the address, so Back and links fill it in. */
  protected readonly typed = signal('');
  /** A format problem with what was looked up; shown until the next look-up. */
  protected readonly problem = signal<string | null>(null);

  constructor() {
    effect(() => {
      const number = this.fromAddress().trim();
      this.typed.set(number);
      this.problem.set(number ? confirmationProblem(number) : null);
      void this.tickets.lookUp(number);
    });
  }

  protected submit(event: Event): void {
    event.preventDefault();
    const number = this.typed().trim();
    const problem = confirmationProblem(number);
    this.problem.set(problem);
    if (problem) {
      document.getElementById('confirmation')?.focus();
      return;
    }
    if (number === this.fromAddress().trim()) void this.tickets.lookUp(number);
    else void this.router.navigate(['/'], { queryParams: { confirmation: number } });
  }
}
