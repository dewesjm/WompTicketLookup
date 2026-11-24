// Makes Womp Ticket Lookup's sample data (src/data/seed/ticket-seed.json) from ZORD's sample data:
// the same orders, operations (confirmation numbers), people and labor, so every app means the
// same ticket and the same hours. Adds what ZORD doesn't have: work centers, WBS elements and
// cost centers. No randomness, so the same every run. Run: npm run sample-data
const fs = require('fs');
const path = require('path');

const source = process.argv[3] ? path.resolve(process.argv[3]) : path.resolve(__dirname, '../../Zord/src/data/seed/zord-seed.json');
const out = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '../src/data/seed/ticket-seed.json');
const zord = JSON.parse(fs.readFileSync(source, 'utf8'));

// Made up, like everything here.
const WORK_CENTERS = {
  pipefitter: { code: 'PF-5610', name: 'Pipefitting' },
  welder: { code: 'WD-5710', name: 'Structural welding' },
  machinist: { code: 'MS-3110', name: 'Machine shop' },
  electrician: { code: 'EL-5810', name: 'Electrical' },
  rigger: { code: 'RG-5910', name: 'Rigging' },
};
const COST_CENTERS = {
  pipefitter: '41560',
  welder: '41570',
  machinist: '41310',
  electrician: '41580',
  rigger: '41590',
  management: '40100',
  it: '40900',
};

const people = zord.people.map((p) => {
  const [firstName, ...rest] = p.name.split(' ');
  return {
    id: p.id,
    employeeNumber: p.employeeNumber,
    firstName,
    lastName: rest.join(' '),
    title: p.title,
    costCenter: COST_CENTERS[p.trade],
  };
});

// WBS: year, the work package's module, then the package's place in the list.
const packages = zord.workPackages.map((w, i) => ({
  group: w.group,
  wbs: `W.2026.${w.module.replace(/\D/g, '').padStart(3, '0')}.${String(i + 1).padStart(2, '0')}`,
}));
const wbsOf = new Map(packages.map((p) => [p.group, p.wbs]));
const orders = zord.orders.map((o) => ({ orderNumber: o.orderNumber, wbs: wbsOf.get(o.group) }));

const operations = zord.operations.map((o) => ({
  confirmationNumber: o.confirmationNumber,
  orderNumber: o.orderNumber,
  operationNumber: o.operationNumber,
  description: o.description,
  workCenter: WORK_CENTERS[o.trade].code,
  status: o.status,
  targetHours: o.plannedHours,
}));

const confirmationOf = new Map(zord.operations.map((o) => [`${o.orderNumber}/${o.operationNumber}`, o.confirmationNumber]));
const charges = zord.labor.map((l) => ({
  confirmationNumber: confirmationOf.get(`${l.orderNumber}/${l.operationNumber}`),
  personId: l.personId,
  hours: l.hours,
  postingDate: l.date,
}));

const seed = {
  $comment: "Womp Ticket Lookup sample data, made from ZORD's (same orders, confirmation numbers, people and labor) plus work centers, WBS and cost centers. Fake data only. Made by scripts/make-sample-data.cjs; don't edit by hand.",
  asOf: zord.asOf,
  people,
  orders,
  workCenters: Object.values(WORK_CENTERS),
  operations,
  charges,
};
fs.writeFileSync(out, JSON.stringify(seed, null, 2) + '\n');
console.log(`Wrote ${out}: ${people.length} people, ${orders.length} orders, ${operations.length} operations, ${charges.length} charges.`);
