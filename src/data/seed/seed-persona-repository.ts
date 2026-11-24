import { Persona } from '../../domain';
import { PersonaRepository } from '../repositories';
import { seedPersonas } from './personas';

/** The sample people, straight from the seed. Nothing to save: personas can't be edited. */
export class SeedPersonaRepository implements PersonaRepository {
  async load(): Promise<Persona[]> {
    return seedPersonas();
  }
}
