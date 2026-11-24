import { TicketCharge } from '../../../domain';
import { GridColumn } from '../../shared/data-grid/data-grid';
import { formatDate, formatHours } from './format';

/** The Charges grid: every time someone charged to the ticket. */
export const CHARGE_COLUMNS: readonly GridColumn<TicketCharge>[] = [
  { id: 'employeeNumber', header: 'Employee ID', value: (c) => c.employeeNumber },
  { id: 'firstName', header: 'First name', value: (c) => c.firstName },
  { id: 'lastName', header: 'Last name', value: (c) => c.lastName },
  { id: 'costCenter', header: 'Cost center', value: (c) => c.costCenter },
  { id: 'hours', header: 'Hours', value: (c) => c.hours, text: (c) => formatHours(c.hours), numeric: true },
  { id: 'postingDate', header: 'Posting date', value: (c) => c.postingDate, text: (c) => formatDate(c.postingDate) },
];
