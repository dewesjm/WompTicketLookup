import { Person, Ticket, TicketSummary, ticketOf, ticketSummaries } from '../../domain';
import { seedTicketBook } from '../seed';
import { TicketCall, TicketClient } from '../ticket-client';

/** The sample tickets built into the app. Read only, so nothing is saved in the browser. */
export class SampleTicketClient implements TicketClient {
  readonly where = 'the sample tickets built into this app';
  private readonly book = seedTicketBook();

  async getTicket(confirmationNumber: string): Promise<Ticket | null> {
    return ticketOf(this.book, confirmationNumber);
  }

  async listTickets(): Promise<TicketSummary[]> {
    return ticketSummaries(this.book);
  }

  async getPeople(): Promise<Person[]> {
    return [...this.book.people];
  }

  describe(call: TicketCall): string {
    switch (call.name) {
      case 'getTicket':
        return `getTicket(${JSON.stringify(call.confirmationNumber)})\nReads one sample ticket built into this app, with every charge to it.`;
      case 'listTickets':
        return 'listTickets()\nLists the sample tickets built into this app.';
      case 'getPeople':
        return 'getPeople()\nReads the sample people built into this app.';
    }
  }
}
