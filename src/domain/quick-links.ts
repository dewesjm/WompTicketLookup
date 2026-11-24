/** A Quick Link: one entry in the top bar's Quick Links menu; opens in a new tab. */
export interface QuickLink {
  /** The id in Compass's standard list. */
  id: string;
  label: string;
  url: string;
}

/** Quick Links menu order: A to Z by label, ignoring case. */
export function menuOrder(links: readonly QuickLink[]): QuickLink[] {
  return [...links].sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
}
