import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatIssueBody,
  formatResolvedComment,
} from './format-issue-body.mjs';

test('formatIssueBody includes every suite, its failing tests, its diagnosis, and the run link', () => {
  const diagnosis = {
    'api/account/account-schema-validation-paths.spec.ts': {
      tests: ['API-09', 'API-10'],
      diagnosis:
        'Root cause: the endpoint now rejects an empty email.\nCorrelation: one root cause.\nDrift: none.',
    },
    'ui/login/login-negative-paths.spec.ts': {
      tests: ['TC-13'],
      diagnosis: 'Root cause: the error message text changed.',
    },
  };

  const body = formatIssueBody(diagnosis, 'https://example.com/run/1');

  assert.match(body, /2 suites/);
  assert.match(body, /api\/account\/account-schema-validation-paths\.spec\.ts/);
  assert.match(body, /API-09, API-10/);
  assert.match(body, /the endpoint now rejects an empty email/);
  assert.match(body, /ui\/login\/login-negative-paths\.spec\.ts/);
  assert.match(body, /TC-13/);
  assert.match(body, /the error message text changed/);
  assert.match(body, /https:\/\/example\.com\/run\/1/);
});

test('formatIssueBody uses singular "suite" for exactly one failing suite', () => {
  const body = formatIssueBody(
    { 'a/b.spec.ts': { tests: ['T-1'], diagnosis: 'x' } },
    'https://example.com/run/2',
  );
  assert.match(body, /red on 1 suite\. /);
});

test('formatResolvedComment names the run that went green', () => {
  const comment = formatResolvedComment('https://example.com/run/3');
  assert.match(comment, /green again/);
  assert.match(comment, /https:\/\/example\.com\/run\/3/);
});
