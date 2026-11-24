/*
 * Womp tickets: one operation of an order, found by its confirmation number, and the time
 * people charged to it. Kept as separate lists that point at each other by number or id, like
 * tables in a database. Nothing is stored twice: spent and remaining hours, the work center's
 * name and each person's details are worked out when a ticket is shown. Formats follow MWQ's
 * (ids.ts), as in ZORD and Deckfoot.
 */

/** 10 digits, starts with 2, second digit 0 or 1 (MWQ's CONFIRMATION_NUMBER_PATTERN). */
export const CONFIRMATION_NUMBER_PATTERN = /^2[01]\d{8}$/;

/** 9 digits, starts with 2 or 5, second digit 0 or 1 (MWQ's ORDER_NUMBER_PATTERN). */
export const ORDER_NUMBER_PATTERN = /^[25][01]\d{7}$/;

/** Someone who charges time. `employeeNumber` is the ID people know them by, like E00118. */
export interface Person {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  title: string;
  /** The cost center their time is booked to, like 41560. */
  costCenter: string;
}

export interface Order {
  orderNumber: string;
  /** The work breakdown structure element the order's cost goes to, like W.2026.039.01. */
  wbs: string;
}

export interface WorkCenter {
  /** Like PF-5610. */
  code: string;
  name: string;
}

export type OperationStatus = 'not-started' | 'in-work' | 'complete';

export const OPERATION_STATUSES: readonly { value: OperationStatus; label: string }[] = [
  { value: 'not-started', label: 'Not started' },
  { value: 'in-work', label: 'In work' },
  { value: 'complete', label: 'Complete' },
];

/** One step of an order, the thing a confirmation number names. */
export interface Operation {
  confirmationNumber: string;
  orderNumber: string;
  /** Like 0010. */
  operationNumber: string;
  description: string;
  /** A WorkCenter's code. */
  workCenter: string;
  status: OperationStatus;
  targetHours: number;
}

/** Time one person charged to one confirmation, posted on one day. */
export interface Charge {
  confirmationNumber: string;
  personId: string;
  hours: number;
  /** ISO date. */
  postingDate: string;
}

/** The whole store: a list per kind of record. */
export interface TicketBook {
  people: Person[];
  orders: Order[];
  workCenters: WorkCenter[];
  operations: Operation[];
  charges: Charge[];
}

/** One charge as shown: the person's details beside the hours. */
export interface TicketCharge {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  costCenter: string;
  hours: number;
  postingDate: string;
}

/** Everything the lookup shows about one confirmation number. */
export interface Ticket {
  confirmationNumber: string;
  orderNumber: string;
  operationNumber: string;
  description: string;
  workCenter: WorkCenter;
  targetHours: number;
  spentHours: number;
  /** Target less spent, never below zero. */
  remainingHours: number;
  wbs: string;
  status: OperationStatus;
  /** Newest posting first. */
  charges: TicketCharge[];
}

/** Hours to two decimal places, so adding 0.1s never shows 0.30000000000000004. */
export function roundHours(hours: number): number {
  return Math.round(hours * 100) / 100;
}

/** What's wrong with a typed confirmation number, or null when it's in the right format. */
export function confirmationProblem(text: string): string | null {
  const value = text.trim();
  if (!value) return 'Enter a confirmation number.';
  if (!/^\d+$/.test(value)) return 'A confirmation number is digits only.';
  if (value.length !== 10) return `A confirmation number has 10 digits; this has ${value.length}.`;
  if (!CONFIRMATION_NUMBER_PATTERN.test(value)) return 'A confirmation number starts with 20 or 21.';
  return null;
}

/** The ticket for one confirmation number, or null when there's no such operation. */
export function ticketOf(book: TicketBook, confirmationNumber: string): Ticket | null {
  const operation = book.operations.find((o) => o.confirmationNumber === confirmationNumber.trim());
  if (!operation) return null;
  const people = new Map(book.people.map((p) => [p.id, p]));
  const charges = book.charges
    .filter((c) => c.confirmationNumber === operation.confirmationNumber)
    .map((c): TicketCharge => {
      const person = people.get(c.personId);
      return {
        employeeNumber: person?.employeeNumber ?? c.personId,
        firstName: person?.firstName ?? '',
        lastName: person?.lastName ?? '',
        costCenter: person?.costCenter ?? '',
        hours: c.hours,
        postingDate: c.postingDate,
      };
    })
    .sort((a, b) => b.postingDate.localeCompare(a.postingDate) || a.lastName.localeCompare(b.lastName));
  const spentHours = roundHours(charges.reduce((sum, c) => sum + c.hours, 0));
  return {
    confirmationNumber: operation.confirmationNumber,
    orderNumber: operation.orderNumber,
    operationNumber: operation.operationNumber,
    description: operation.description,
    workCenter: book.workCenters.find((w) => w.code === operation.workCenter) ?? { code: operation.workCenter, name: '' },
    targetHours: operation.targetHours,
    spentHours,
    remainingHours: roundHours(Math.max(0, operation.targetHours - spentHours)),
    wbs: book.orders.find((o) => o.orderNumber === operation.orderNumber)?.wbs ?? '',
    status: operation.status,
    charges,
  };
}

/** A short line per confirmation, for Admin > Services to show what numbers exist. */
export interface TicketSummary {
  confirmationNumber: string;
  orderNumber: string;
  operationNumber: string;
  description: string;
  status: OperationStatus;
  charges: number;
}

export function ticketSummaries(book: TicketBook): TicketSummary[] {
  return book.operations
    .map((o) => ({
      confirmationNumber: o.confirmationNumber,
      orderNumber: o.orderNumber,
      operationNumber: o.operationNumber,
      description: o.description,
      status: o.status,
      charges: book.charges.filter((c) => c.confirmationNumber === o.confirmationNumber).length,
    }))
    .sort((a, b) => a.confirmationNumber.localeCompare(b.confirmationNumber));
}

/**
 * Everything that would make the store disagree with itself: bad formats, duplicates, and
 * records pointing at something that isn't there. Empty when the store is sound. The sample
 * data must pass it (unit test).
 */
export function integrityProblems(book: TicketBook): string[] {
  const problems: string[] = [];
  const duplicates = (values: string[], what: string) => {
    const seen = new Set<string>();
    for (const v of values) {
      if (seen.has(v)) problems.push(`Two ${what} ${v}.`);
      seen.add(v);
    }
    return seen;
  };
  const people = duplicates(book.people.map((p) => p.id), 'people with id');
  duplicates(book.people.map((p) => p.employeeNumber), 'people with employee number');
  const orders = duplicates(book.orders.map((o) => o.orderNumber), 'orders numbered');
  const workCenters = duplicates(book.workCenters.map((w) => w.code), 'work centers coded');
  const confirmations = duplicates(book.operations.map((o) => o.confirmationNumber), 'operations with confirmation');
  duplicates(book.operations.map((o) => `${o.orderNumber}/${o.operationNumber}`), 'operations numbered');

  for (const o of book.orders) {
    if (!ORDER_NUMBER_PATTERN.test(o.orderNumber)) problems.push(`Order number ${o.orderNumber} is not in the right format.`);
  }
  for (const o of book.operations) {
    if (!CONFIRMATION_NUMBER_PATTERN.test(o.confirmationNumber)) problems.push(`Confirmation ${o.confirmationNumber} is not in the right format.`);
    if (!orders.has(o.orderNumber)) problems.push(`Confirmation ${o.confirmationNumber} points at order ${o.orderNumber}, which isn't there.`);
    if (!workCenters.has(o.workCenter)) problems.push(`Confirmation ${o.confirmationNumber} points at work center ${o.workCenter}, which isn't there.`);
    if (o.targetHours < 0) problems.push(`Confirmation ${o.confirmationNumber} has negative target hours.`);
  }
  for (const c of book.charges) {
    if (!confirmations.has(c.confirmationNumber)) problems.push(`A charge points at confirmation ${c.confirmationNumber}, which isn't there.`);
    if (!people.has(c.personId)) problems.push(`A charge on ${c.confirmationNumber} points at person ${c.personId}, who isn't there.`);
    if (!(c.hours > 0)) problems.push(`A charge on ${c.confirmationNumber} has ${c.hours} hours.`);
  }
  for (const o of book.operations) {
    const charged = book.charges.some((c) => c.confirmationNumber === o.confirmationNumber);
    if (o.status === 'not-started' && charged) problems.push(`Confirmation ${o.confirmationNumber} is Not started but has time charged.`);
  }
  return problems;
}
