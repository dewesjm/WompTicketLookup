import { Person, Ticket, TicketSummary } from '../domain';

/**
 * Everything Womp Ticket Lookup reads. Screens use it only through the core services
 * (src/app/core). One version today, SampleTicketClient: the sample tickets built into the app.
 * A real service would be a second version with the same calls; the screens wouldn't change.
 * Every call is a read: the app shows tickets, it doesn't change them.
 */
export interface TicketClient {
  /** Where the data comes from, for people to read. */
  readonly where: string;
  /** One confirmation number's ticket and every charge to it, or null when there's no such ticket. */
  getTicket(confirmationNumber: string): Promise<Ticket | null>;
  /** A short line per confirmation number, so testers can see what numbers exist. */
  listTickets(): Promise<TicketSummary[]>;
  /** Everyone who may charge time, with MWQ's, Deckfoot's and ZORD's ids. */
  getPeople(): Promise<Person[]>;
  /** The call as text, for Admin > Services. */
  describe(call: TicketCall): string;
}

export type TicketCall =
  | { name: 'getTicket'; confirmationNumber: string }
  | { name: 'listTickets' }
  | { name: 'getPeople' };
