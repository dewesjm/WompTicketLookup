import { OPERATION_STATUSES, OperationStatus } from '../../../domain';
import { CellTone } from '../../shared/data-grid/data-grid';

/** Like Nov 16, 2026, or empty. Dates are local calendar days, so no time zone shifts them. */
export function formatDate(iso: string | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Hours with up to two decimals: 8, 8.5, 0.25. */
export function formatHours(hours: number): string {
  return hours.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function statusLabel(status: OperationStatus): string {
  return OPERATION_STATUSES.find((s) => s.value === status)?.label ?? status;
}

/** Solid badge colors: soft badges fail contrast in the navy themes (ZORD's finding). */
export const STATUS_TONE: Record<OperationStatus, CellTone> = {
  'not-started': 'neutral',
  'in-work': 'warning',
  complete: 'success',
};
