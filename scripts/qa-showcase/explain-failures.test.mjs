import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diagnoseGroups } from './explain-failures.mjs';

test('calls Claude once per group and returns a diagnosis keyed by suite', async () => {
  const groups = [
    {
      suite: 'api/account/account-schema-validation-paths.spec.ts',
      tests: [
        { name: 'API-09', status: 'failed', message: 'm1', trace: 't1' },
        { name: 'API-10', status: 'broken', message: 'm2', trace: 't2' },
      ],
    },
    {
      suite: 'ui/login/login-negative-paths.spec.ts',
      tests: [{ name: 'TC-13', status: 'failed', message: 'm3', trace: 't3' }],
    },
  ];

  const calls = [];
  const fakeCallClaude = async (prompt) => {
    calls.push(prompt);
    return `diagnosis for call ${calls.length}`;
  };

  const result = await diagnoseGroups(groups, '# Suite Status\n', {
    callClaude: fakeCallClaude,
  });

  assert.equal(calls.length, 2, 'one call per group, not per test');
  assert.deepEqual(Object.keys(result), [
    'api/account/account-schema-validation-paths.spec.ts',
    'ui/login/login-negative-paths.spec.ts',
  ]);
  assert.deepEqual(
    result['api/account/account-schema-validation-paths.spec.ts'].tests,
    ['API-09', 'API-10'],
  );
  assert.equal(
    result['api/account/account-schema-validation-paths.spec.ts'].diagnosis,
    'diagnosis for call 1',
  );
});

test('returns an empty object when there are no failing groups', async () => {
  const result = await diagnoseGroups([], '# Suite Status\n', {
    callClaude: async () => 'unused',
  });
  assert.deepEqual(result, {});
});

test('passes the diff to every group prompt so each diagnosis can see the change', async () => {
  const groups = [
    {
      suite: 'a.spec.ts',
      tests: [{ name: 'T1', status: 'failed', message: 'm', trace: 't' }],
    },
    {
      suite: 'b.spec.ts',
      tests: [{ name: 'T2', status: 'failed', message: 'm', trace: 't' }],
    },
  ];
  const prompts = [];

  await diagnoseGroups(groups, '# Suite Status\n', {
    callClaude: async (prompt) => {
      prompts.push(prompt);
      return 'd';
    },
    diffText: '+  password: changed',
  });

  assert.equal(prompts.length, 2);
  for (const p of prompts) assert.match(p, /password: changed/);
});
