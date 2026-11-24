import { inject } from '@angular/core';
import { confirmationProblem } from '../../../../domain';
import { TicketsService } from '../../../core/tickets-service';

export interface ServiceOperation {
  name: string;
  description: string;
  writes: boolean;
  example?: unknown;
  /** The call as text, and how to run it. */
  prepare(input: unknown): { call: string; run(): unknown };
}

/**
 * The app's calls, run straight against the ticket data, so Admin > Services shows exactly
 * what the screens get. Every call in TicketClient is here. All are reads: the app shows
 * tickets and changes nothing.
 */
export function ticketOperations(): ServiceOperation[] {
  const client = inject(TicketsService).ticketClient;

  return [
    {
      name: 'TicketClient.getTicket',
      description:
        'Look up one confirmation number: the order, operation, description, work center, target, spent and remaining hours, WBS and status, and every charge to it (person, cost center, hours, posting date), newest first. Null when there is no such ticket.',
      writes: false,
      example: '2001264027',
      prepare(input) {
        if (typeof input !== 'string') throw new Error('Enter a confirmation number in quotes, like "2001264027".');
        // The same check as the lookup box, so formats are handled alike.
        const problem = confirmationProblem(input);
        if (problem) throw new Error(problem);
        const number = input.trim();
        return { call: client.describe({ name: 'getTicket', confirmationNumber: number }), run: () => client.getTicket(number) };
      },
    },
    {
      name: 'TicketClient.listTickets',
      description: 'List every confirmation number with its order, operation, description, status and how many charges it has.',
      writes: false,
      prepare: () => ({ call: client.describe({ name: 'listTickets' }), run: () => client.listTickets() }),
    },
    {
      name: 'TicketClient.getPeople',
      description: "List everyone who may charge time (employee ID, first and last name, title, cost center), with MWQ's, Deckfoot's and ZORD's ids.",
      writes: false,
      prepare: () => ({ call: client.describe({ name: 'getPeople' }), run: () => client.getPeople() }),
    },
  ];
}
