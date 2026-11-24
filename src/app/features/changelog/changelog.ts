/*
 * Change Log (Quick Links > Change Log). Plain-language summary for people using the demo,
 * newest day first. Add to the top entry (or a new day) in the same commit as every change users
 * would notice, under Added, Changed or Fixed. Say what changed for the user, not how; keep each
 * line short. Internal work (refactoring, tests, docs) stays out.
 */
export interface ChangeLogDay {
  /** ISO date, e.g. 2026-11-10. */
  date: string;
  added?: readonly string[];
  changed?: readonly string[];
  fixed?: readonly string[];
}

export const CHANGE_LOG: readonly ChangeLogDay[] = [
  {
    date: '2026-11-24',
    added: [
      'Womp Ticket Lookup: enter a confirmation number to see its ticket and every charge to it.',
      'The ticket shows its order, operation, description, work center, WBS, status, and target, spent and remaining hours.',
      'The Charges grid lists each charge: employee ID, first and last name, cost center, hours and posting date. Sort, filter and download it as CSV.',
      'The address holds the confirmation number, so other apps can link straight to a ticket, and you can bookmark it.',
      'Admin > Services (Developers): try every call the app makes and see the full call.',
      'View as, the theme picker and Quick Links with this Change Log.',
    ],
  },
];
