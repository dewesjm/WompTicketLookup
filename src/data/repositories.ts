import { Persona } from '../domain';

/**
 * The sample people for View as. Read only: in the real app this is the logged-in person and
 * their AD groups, not a list to pick from.
 */
export interface PersonaRepository {
  load(): Promise<Persona[]>;
}
