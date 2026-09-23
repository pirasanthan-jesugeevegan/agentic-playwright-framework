/**
 * CLI for the docs-drift gate: compares the case counts in docs/STATUS.md with
 * the real test() counts under tests/ui, tests/api and tests/vr. Exits 1 on any
 * disagreement. Logic lives in status-drift.mjs (unit-tested).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { countTests, findDrift, parseStatusTotals } from './status-drift.mjs';

const root = process.cwd();

function countSuite(dir) {
  const files = readdirSync(join(root, dir), { recursive: true })
    .filter((f) => f.endsWith('.spec.ts'))
    .map((f) => join(root, dir, f));
  return files.reduce(
    (sum, file) => sum + countTests(readFileSync(file, 'utf8')),
    0,
  );
}

const totals = parseStatusTotals(
  readFileSync(join(root, 'docs/STATUS.md'), 'utf8'),
);
const actual = {
  ui: countSuite('tests/ui'),
  api: countSuite('tests/api'),
  vr: countSuite('tests/vr'),
};

const problems = findDrift(totals, actual);

if (problems.length > 0) {
  console.error(`docs/STATUS.md has drifted from the specs:\n`);
  problems.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}

console.log(
  `docs/STATUS.md matches the specs: ui ${actual.ui}/${totals.ui.cap}, api ${actual.api}/${totals.api.cap}, vr ${actual.vr}/${totals.vr.cap}.`,
);
