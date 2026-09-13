import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groupFailures } from './group-failures.mjs';

function result({ name, status, message, trace, suite }) {
  return {
    name,
    status,
    statusDetails: { message, trace },
    labels: [
      { name: 'parentSuite', value: 'api' },
      { name: 'suite', value: suite },
      { name: 'subSuite', value: 'Account API' },
    ],
  };
}

test('ignores passed and skipped results', () => {
  const records = [
    result({
      name: 'A',
      status: 'passed',
      message: '',
      trace: '',
      suite: 'api/x.spec.ts',
    }),
    result({
      name: 'B',
      status: 'skipped',
      message: '',
      trace: '',
      suite: 'api/x.spec.ts',
    }),
  ];
  assert.deepEqual(groupFailures(records), []);
});

test('groups failed and broken results by the suite label', () => {
  const records = [
    result({
      name: 'API-09',
      status: 'failed',
      message: 'Expected 200, got 403',
      trace: 'trace-09',
      suite: 'api/account/account-schema-validation-paths.spec.ts',
    }),
    result({
      name: 'API-10',
      status: 'broken',
      message: 'ZodError: expected object, received null',
      trace: 'trace-10',
      suite: 'api/account/account-schema-validation-paths.spec.ts',
    }),
    result({
      name: 'TC-13',
      status: 'failed',
      message: 'error banner not visible',
      trace: 'trace-13',
      suite: 'ui/login/login-negative-paths.spec.ts',
    }),
  ];

  const groups = groupFailures(records);

  assert.equal(groups.length, 2);
  const account = groups.find(
    (g) => g.suite === 'api/account/account-schema-validation-paths.spec.ts',
  );
  assert.equal(account.tests.length, 2);
  assert.deepEqual(
    account.tests.map((t) => t.name),
    ['API-09', 'API-10'],
  );
  assert.equal(account.tests[0].message, 'Expected 200, got 403');
  assert.equal(account.tests[1].status, 'broken');

  const login = groups.find(
    (g) => g.suite === 'ui/login/login-negative-paths.spec.ts',
  );
  assert.equal(login.tests.length, 1);
});

test('throws a clear error when a result has no suite label', () => {
  const bad = {
    name: 'X',
    status: 'failed',
    statusDetails: { message: 'm', trace: 't' },
    labels: [],
  };
  assert.throws(() => groupFailures([bad]), /missing a "suite" label/);
});
