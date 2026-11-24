/*
 * Checks that data read from the sample file or (later) a service has the right shape, turning
 * it into domain types. A record in the wrong shape is dropped, not guessed at: the app's job is
 * to show ticket data as it is. Plain hand-written checks, like the other apps.
 */
import { Charge, OPERATION_STATUSES, Operation, Order, Person, TicketBook, WorkCenter } from '../domain';
import { isObject } from './schema';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const isString = (v: unknown): v is string => typeof v === 'string';
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isDate = (v: unknown): v is string => isString(v) && ISO_DATE.test(v);
const oneOf = <T extends string>(list: readonly { value: T }[]) => (v: unknown): v is T =>
  list.some((x) => x.value === v);

/** True when `v` is an object whose listed fields pass their checks. */
function has(v: unknown, checks: Record<string, (x: unknown) => boolean>): v is Record<string, unknown> {
  return isObject(v) && Object.entries(checks).every(([key, check]) => check(v[key]));
}

/** Copies just the listed fields, so extra fields in the data never reach the screens. */
function pick<T>(v: Record<string, unknown>, keys: readonly (keyof T & string)[]): T {
  return Object.fromEntries(keys.map((k) => [k, v[k]])) as T;
}

export function parsePerson(v: unknown): Person | null {
  const checks = { id: isString, employeeNumber: isString, firstName: isString, lastName: isString, title: isString, costCenter: isString };
  return has(v, checks) ? pick<Person>(v, ['id', 'employeeNumber', 'firstName', 'lastName', 'title', 'costCenter']) : null;
}

export function parseOrder(v: unknown): Order | null {
  return has(v, { orderNumber: isString, wbs: isString }) ? pick<Order>(v, ['orderNumber', 'wbs']) : null;
}

export function parseWorkCenter(v: unknown): WorkCenter | null {
  return has(v, { code: isString, name: isString }) ? pick<WorkCenter>(v, ['code', 'name']) : null;
}

export function parseOperation(v: unknown): Operation | null {
  const checks = {
    confirmationNumber: isString, orderNumber: isString, operationNumber: isString, description: isString,
    workCenter: isString, status: oneOf(OPERATION_STATUSES), targetHours: isNumber,
  };
  return has(v, checks)
    ? pick<Operation>(v, ['confirmationNumber', 'orderNumber', 'operationNumber', 'description', 'workCenter', 'status', 'targetHours'])
    : null;
}

export function parseCharge(v: unknown): Charge | null {
  const checks = { confirmationNumber: isString, personId: isString, hours: isNumber, postingDate: isDate };
  return has(v, checks) ? pick<Charge>(v, ['confirmationNumber', 'personId', 'hours', 'postingDate']) : null;
}

function list<T>(v: unknown, parse: (x: unknown) => T | null): T[] {
  return Array.isArray(v) ? v.map(parse).filter((x): x is T => x !== null) : [];
}

/** The whole store from one JSON object with a list per kind (the sample file's shape). */
export function parseTicketBook(v: unknown): TicketBook {
  const data = isObject(v) ? v : {};
  return {
    people: list(data['people'], parsePerson),
    orders: list(data['orders'], parseOrder),
    workCenters: list(data['workCenters'], parseWorkCenter),
    operations: list(data['operations'], parseOperation),
    charges: list(data['charges'], parseCharge),
  };
}
