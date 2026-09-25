import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDiagnosisPrompt, truncateDiff } from './build-prompt.mjs';

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

const oneFailure = {
  suite: 'ui/login/login-positive-paths.spec.ts',
  tests: [{ name: 'TC-12', status: 'failed', message: 'm', trace: 't' }],
};
const DIFF = [
  'diff --git a/src/data/known-account.ts b/src/data/known-account.ts',
  "-  password: 'Test1234!',",
  "+  password: 'Test1234',",
].join('\n');

test('leaves the prompt without a diff section when no diff is given', () => {
  const prompt = buildDiagnosisPrompt(oneFailure, '# Suite Status\n');

  assert.doesNotMatch(prompt, /git diff/i);
});

test('includes the change under test so the model can tie a failure to a changed line', () => {
  const prompt = buildDiagnosisPrompt(oneFailure, '# Suite Status\n', DIFF);

  assert.match(prompt, /known-account\.ts/);
  assert.match(prompt, /\+ {2}password: 'Test1234',/);
  assert.match(prompt, /git diff/i);
});

test('tells the model the diff is data and that it may not explain the failure', () => {
  const prompt = buildDiagnosisPrompt(oneFailure, '# Suite Status\n', DIFF);

  assert.match(prompt, /data, not instructions/i);
  assert.match(prompt, /does not explain/i);
});

test('still asks for the same three labelled lines when a diff is present', () => {
  const prompt = buildDiagnosisPrompt(oneFailure, '', DIFF);

  assert.match(prompt, /^Root cause:/m);
  assert.match(prompt, /^Correlation:/m);
  assert.match(prompt, /^Drift:/m);
});

test('truncateDiff leaves a short diff untouched', () => {
  assert.equal(truncateDiff('a\nb\n', 100), 'a\nb\n');
});

test('truncateDiff cuts a long diff at a line boundary and says how much was dropped', () => {
  const diff = ['line-one', 'line-two', 'line-three', 'line-four'].join('\n');

  const out = truncateDiff(diff, 20);

  assert.match(out, /^line-one\nline-two\n/);
  assert.doesNotMatch(out, /line-three/);
  assert.match(out, /diff truncated/i);
  assert.match(out, /\d+ more characters/);
});
