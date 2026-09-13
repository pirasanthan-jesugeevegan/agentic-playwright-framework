import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDiagnosisPrompt } from './build-prompt.mjs';

test('includes every test name, message, and trace from the group', () => {
  const group = {
    suite: 'api/account/account-schema-validation-paths.spec.ts',
    tests: [
      {
        name: 'API-09',
        status: 'failed',
        message: 'Expected 200, got 403',
        trace: 'trace-09',
      },
      {
        name: 'API-10',
        status: 'broken',
        message: 'ZodError: expected object, received null',
        trace: 'trace-10',
      },
    ],
  };

  const prompt = buildDiagnosisPrompt(
    group,
    '# Suite Status\n\nAccount API schema-validation: Passing\n',
  );

  assert.match(prompt, /API-09/);
  assert.match(prompt, /Expected 200, got 403/);
  assert.match(prompt, /API-10/);
  assert.match(prompt, /ZodError: expected object, received null/);
  assert.match(prompt, /account\/account-schema-validation-paths\.spec\.ts/);
});

test('includes the full STATUS.md text so the model can check for drift', () => {
  const group = {
    suite: 'ui/login/login-negative-paths.spec.ts',
    tests: [{ name: 'TC-13', status: 'failed', message: 'm', trace: 't' }],
  };
  const statusMd = '# Suite Status\n\nLogin: Passing\n';

  const prompt = buildDiagnosisPrompt(group, statusMd);

  assert.match(prompt, /Login: Passing/);
});

test('asks explicitly for root cause, correlation, and drift', () => {
  const group = {
    suite: 'x',
    tests: [{ name: 'T', status: 'failed', message: 'm', trace: 't' }],
  };
  const prompt = buildDiagnosisPrompt(group, '');

  assert.match(prompt, /root cause/i);
  assert.match(prompt, /share one cause|same cause|cascad/i);
  assert.match(prompt, /STATUS\.md/);
});
