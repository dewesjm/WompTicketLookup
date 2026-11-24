import { Injectable, inject, signal } from '@angular/core';
import { Ticket, confirmationProblem } from '../../domain';
import { TICKET_CLIENT } from './tokens';

/** What the lookup shows: nothing yet, a problem with what was typed, no such ticket, or the ticket. */
export type LookupState =
  | { kind: 'empty' }
  | { kind: 'invalid'; confirmationNumber: string; problem: string }
  | { kind: 'not-found'; confirmationNumber: string }
  | { kind: 'found'; ticket: Ticket }
  | { kind: 'failed'; confirmationNumber: string; message: string };

/** The ticket data for the screens: the current lookup. Everything goes through TicketClient. */
@Injectable({ providedIn: 'root' })
export class TicketsService {
  private readonly client = inject(TICKET_CLIENT);

  readonly state = signal<LookupState>({ kind: 'empty' });
  readonly busy = signal(false);
  /** Where the data comes from, for people to read. */
  readonly where = this.client.where;
  private revision = 0;

  /** Looks up one confirmation number. A slower earlier lookup never replaces a later one. */
  async lookUp(text: string | null): Promise<void> {
    const revision = ++this.revision;
    const confirmationNumber = (text ?? '').trim();
    if (!confirmationNumber) {
      this.state.set({ kind: 'empty' });
      return;
    }
    const problem = confirmationProblem(confirmationNumber);
    if (problem) {
      this.state.set({ kind: 'invalid', confirmationNumber, problem });
      return;
    }
    this.busy.set(true);
    try {
      const ticket = await this.client.getTicket(confirmationNumber);
      if (revision !== this.revision) return;
      this.state.set(ticket ? { kind: 'found', ticket } : { kind: 'not-found', confirmationNumber });
    } catch (error) {
      if (revision === this.revision) {
        this.state.set({ kind: 'failed', confirmationNumber, message: error instanceof Error ? error.message : String(error) });
      }
    } finally {
      if (revision === this.revision) this.busy.set(false);
    }
  }

  /** The client itself, for Admin > Services, which shows and runs its calls directly. */
  get ticketClient() {
    return this.client;
  }
}
