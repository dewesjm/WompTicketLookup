import { Persona, Role } from '../../domain';
import { seedTicketBook } from './tickets';

/** The persona a viewer sees until they pick one with View as: a pipe foreman. */
export const DEFAULT_PERSONA_ID = 'u-foreman-haddad';

/**
 * Who View as offers, and each one's demo role. People are MWQ's and Deckfoot's, with the same
 * ids. Everyone may look up tickets; only the Developer may use Admin > Services.
 */
const PERSONAS: Readonly<Record<string, Role>> = {
  'u-foreman-haddad': 'user',
  'u-foreman-nguyen': 'user',
  'u-foreman-brennan': 'user',
  'u-foreman-ito': 'user',
  'u-foreman-mendez': 'user',
  'u-general-foreman': 'user',
  'u-director': 'user',
  'u-pipefitter': 'user',
  'u-welder': 'user',
  'u-machinist': 'user',
  'u-developer': 'developer',
};

/** Sample people for View as, in the order above. */
export function seedPersonas(): Persona[] {
  const people = new Map(seedTicketBook().people.map((p) => [p.id, p]));
  return Object.entries(PERSONAS).flatMap(([id, role]) => {
    const person = people.get(id);
    return person ? [{ id, name: `${person.firstName} ${person.lastName}`, title: person.title, role }] : [];
  });
}
