import { TicketBook } from '../../domain';
import { parseTicketBook } from '../parse';
import seed from './ticket-seed.json';

/*
 * The sample tickets: ZORD's orders, operations (confirmation numbers), people and labor (same
 * numbers and ids, so every app means the same ticket), plus work centers, WBS elements and cost
 * centers. Made by scripts/make-sample-data.cjs; dated as of SAMPLE_AS_OF.
 */

/** The day the sample data was made for. */
export const SAMPLE_AS_OF: string = seed.asOf;

/** A fresh copy of the sample store each call, so nothing can change the seed itself. */
export function seedTicketBook(): TicketBook {
  return parseTicketBook(seed);
}
