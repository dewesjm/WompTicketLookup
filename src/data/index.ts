/*
 * The ticket data and browser storage behind interfaces, their implementations and the sample
 * data. Screens never use these directly: core services in src/app/core do, through the
 * injection tokens in src/app/core/tokens.ts.
 */
export * from './schema';
export * from './repositories';
export * from './preferences';
export * from './parse';
export * from './ticket-client';
export * from './seed';
export * from './browser/versioned-storage';
export * from './browser/local-preferences-repository';
export * from './browser/sample-ticket-client';
