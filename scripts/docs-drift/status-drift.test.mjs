import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseStatusTotals, countTests, findDrift } from './status-drift.mjs';

const STATUS = `# Suite Status

## Functional (UI) suite

Cap: 15 (currently deliberately low)

**Total: 13 / 15.** Every area carries one positive and one negative case.

## API suite

Cap: 10 (same discipline)

**Total: 10 / 10. Full.** New coverage replaces an existing case.

## Visual regression suite

Cap: 10 (same discipline)

**Total: 9 / 10.** One slot free.

## Findings against the application

- Something that mentions **Total: 99 / 99** must not be picked up.
`;

test('parseStatusTotals reads the count and cap of each suite section', () => {
  assert.deepEqual(parseStatusTotals(STATUS), {
    ui: { total: 13, cap: 15, capLine: 15 },
    api: { total: 10, cap: 10, capLine: 10 },
    vr: { total: 9, cap: 10, capLine: 10 },
  });
});

test('parseStatusTotals ignores a Total line outside the three suite sections', () => {
  const totals = parseStatusTotals(STATUS);
  assert.notEqual(totals.vr.total, 99);
});

test('parseStatusTotals throws when a suite section has no Total line', () => {
  const broken = STATUS.replace('**Total: 10 / 10. Full.**', 'No total here.');
  assert.throws(() => parseStatusTotals(broken), /API suite/);
});

test('parseStatusTotals throws when a suite section is missing', () => {
  const broken = STATUS.replace(
    '## Visual regression suite',
    '## Something else',
  );
  assert.throws(() => parseStatusTotals(broken), /Visual regression suite/);
});

test('countTests counts test() calls, not describe/step/hooks or comments', () => {
  const source = `
    test.describe('Area', { tag: '@regression' }, () => {
      test.beforeEach(async () => {});
      test('TC-01: Verify that the user does a thing', async () => {
        await test.step('Given x', async () => {});
      });
      test(
        'TC-02: Verify that the user does another thing',
        async () => {},
      );
      // test('TC-03: commented out', async () => {});
    });
  `;
  assert.equal(countTests(source), 2);
});

test('findDrift is empty when counts and caps agree', () => {
  const totals = parseStatusTotals(STATUS);
  assert.deepEqual(findDrift(totals, { ui: 13, api: 10, vr: 9 }), []);
});

test('findDrift reports a suite whose real count differs from STATUS.md', () => {
  const totals = parseStatusTotals(STATUS);
  const problems = findDrift(totals, { ui: 14, api: 10, vr: 9 });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /ui/);
  assert.match(problems[0], /14/);
  assert.match(problems[0], /13/);
});

test('findDrift reports a suite over its cap', () => {
  const totals = parseStatusTotals(STATUS);
  const problems = findDrift(totals, { ui: 13, api: 11, vr: 9 });
  assert.ok(problems.some((p) => /api/.test(p) && /cap/i.test(p)));
});

test('findDrift reports a Cap line that disagrees with the Total line', () => {
  const totals = parseStatusTotals(STATUS.replace('Cap: 15', 'Cap: 12'));
  const problems = findDrift(totals, { ui: 13, api: 10, vr: 9 });
  assert.ok(problems.some((p) => /ui/.test(p) && /12/.test(p) && /15/.test(p)));
});
