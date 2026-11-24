# Womp Ticket Lookup

Clickable mockup: enter a confirmation number and see its ticket (order, operation, description,
work center, target, spent and remaining hours, WBS, status) and a grid of every charge to it
(employee ID, first and last name, cost center, hours, posting date). Fake data only.

Its own app; Compass's (Forge's) Womp Ticket Lookup tile links to it.

## Commands

| Command | What it does |
| --- | --- |
| `npm start` | The app on http://localhost:4207 |
| `npm test -- --watch=false` | Unit tests (Vitest) |
| `npm run build` | Build and typecheck |
| `npm run e2e` | Browser checks (Playwright + axe), phone and desktop, light and dark |
| `npm run sample-data` | Make `src/data/seed/ticket-seed.json` again from ZORD's sample data (needs `C:\Users\dewes\Zord` beside this folder) |

Run `npm test` from `C:\Users\dewes\WompTicketLookup` with a capital `C:`; from `c:\...` Vitest
fails with "Vitest failed to find the runner".

## The data

One store, kept like tables in a database: each kind of record is its own list, and records
point at each other by number or id. Nothing is stored twice: spent and remaining hours, the
work center's name and each person's details are worked out when a ticket is shown.
`src/domain/tickets.ts` has the types.

| List | One record is | Points at |
| --- | --- | --- |
| `operations` | A ticket: a step of an order, by confirmation number (`2001264027`), with description, work center, status and target hours | order, work center |
| `orders` | An order (`513671487`) and its WBS element (`W.2026.039.03`) | |
| `workCenters` | A work center (`PF-5610`, Pipefitting) | |
| `charges` | Hours one person charged to one confirmation, posted on one day | operation, person |
| `people` | Someone who charges time: employee ID (`E10931`), first and last name, title, cost center (`41560`) | |

Orders, confirmation numbers, people and charges are ZORD's (and so Deckfoot's and MWQ's): the
same numbers, ids and hours. Work centers, WBS elements and cost centers are made up here.
Remaining hours are target less spent, never below zero. A unit test checks every link and
format in the sample data (`integrityProblems`).

## The calls

Screens get ticket data only through `TicketClient` (`src/data/ticket-client.ts`). Today it
reads the sample data built into the app. Every call is a read. Admin > Services (Developers)
runs each call and shows it in full.

| Call | What it does |
| --- | --- |
| `getTicket(confirmationNumber)` | One ticket and every charge to it, newest posting first; null if there's no such ticket |
| `listTickets()` | Every confirmation number with its order, operation, description, status and number of charges |
| `getPeople()` | Everyone who may charge time |

## Linking from another app

Put the confirmation number in the address:

    /?confirmation=2001264027

Confirmation numbers are MWQ's format: 10 digits, starting 20 or 21. A number in the wrong
format says why; one that matches nothing says so.
