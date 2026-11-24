import { InjectionToken } from '@angular/core';
import {
  LocalPreferencesRepository,
  PersonaRepository,
  PreferencesRepository,
  SampleTicketClient,
  SeedPersonaRepository,
  TicketClient,
} from '../../data';

/*
 * The seams to storage and the ticket data. Each defaults to the mockup's version; the real app
 * provides its own in app.config.ts and the screens don't change.
 */

export const PREFERENCES_REPOSITORY = new InjectionToken<PreferencesRepository>(
  'PreferencesRepository',
  { providedIn: 'root', factory: () => new LocalPreferencesRepository() },
);

export const PERSONA_REPOSITORY = new InjectionToken<PersonaRepository>('PersonaRepository', {
  providedIn: 'root',
  factory: () => new SeedPersonaRepository(),
});

/** The ticket data: the sample tickets built into the app. */
export const TICKET_CLIENT = new InjectionToken<TicketClient>('TicketClient', {
  providedIn: 'root',
  factory: () => new SampleTicketClient(),
});
