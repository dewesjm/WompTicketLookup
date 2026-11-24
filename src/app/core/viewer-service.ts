import { Injectable, computed, inject } from '@angular/core';
import { DEFAULT_PERSONA_ID } from '../../data';
import { Persona, permissionsOf } from '../../domain';
import { PersonasService } from './personas-service';
import { PreferencesService } from './preferences-service';

/** Shown only before the personas have loaded. */
const GUEST: Persona = { id: 'guest', name: 'Guest', title: '', role: 'user' };

/**
 * Who is looking at the app: the persona picked with View as (demo), or the default persona.
 * There's no real login; in the real app this is the logged-in person and their AD groups.
 */
@Injectable({ providedIn: 'root' })
export class ViewerService {
  private readonly personas = inject(PersonasService);
  private readonly preferences = inject(PreferencesService);

  /** The viewer. A saved persona id that no longer exists falls back to the default persona. */
  readonly viewer = computed<Persona>(() => {
    const all = this.personas.personas();
    const id = this.preferences.preferences().personaId ?? DEFAULT_PERSONA_ID;
    return all.find((p) => p.id === id) ?? all.find((p) => p.id === DEFAULT_PERSONA_ID) ?? all[0] ?? GUEST;
  });

  /** First letters of the first and last names, for the avatar button. */
  readonly initials = computed(() => initialsOf(this.viewer().name));

  /** Everything the viewer's role allows. The Admin menu and route guard use it. */
  readonly permissions = computed(() => permissionsOf(this.viewer()));

  setPersona(id: string): void {
    if (this.personas.personas().some((p) => p.id === id)) this.preferences.update({ personaId: id });
  }
}

export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
}
