import { QuickLink } from '../../domain';

/**
 * The Quick Links this app shows: a built-in copy of the links it picks, by id, from Compass's
 * standard list. Reading the list from Compass at start-up comes with Central Quick Links
 * (Compass's plans/central-quick-links.md). Placeholder addresses.
 */
export function seedQuickLinks(): QuickLink[] {
  return [
    { id: 'help-desk', label: 'Help Desk', url: 'https://example.com/help-desk' },
    { id: 'holiday-calendar', label: 'Holiday Calendar', url: 'https://example.com/holiday-calendar' },
  ];
}
