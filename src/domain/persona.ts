import { Role } from './permissions';

/**
 * A sample person for the demo's View as. There's no real login; `role` stands in for the
 * person's AD groups. Ids match MWQ's and Deckfoot's sample people, so every app means the same person.
 */
export interface Persona {
  id: string;
  name: string;
  title: string;
  role: Role;
}
