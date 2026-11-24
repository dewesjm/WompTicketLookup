import { Injectable, inject, signal } from '@angular/core';
import { Persona } from '../../domain';
import { PERSONA_REPOSITORY } from './tokens';

/** The sample people for View as (demo). */
@Injectable({ providedIn: 'root' })
export class PersonasService {
  private readonly repository = inject(PERSONA_REPOSITORY);
  private readonly current = signal<readonly Persona[]>([]);

  readonly personas = this.current.asReadonly();

  async load(): Promise<void> {
    this.current.set(await this.repository.load());
  }
}
