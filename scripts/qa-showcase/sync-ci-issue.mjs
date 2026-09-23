#!/usr/bin/env node
/**
 * Closes the loop on explain-failures.mjs's diagnosis: syncs a single
 * tracking GitHub issue, labelled "ci-failure", against the run that just
 * finished. A run with real failures opens the issue (or comments on it, if
 * one is already open) with the AI diagnosis; a clean run closes it. Shells
 * out to the `gh` CLI - already authenticated via GITHUB_TOKEN on every
 * GitHub-hosted runner - rather than calling the REST API directly, so no
 * new dependency and no new secret (works out of the box for anyone who
 * forks this repo as a template).
 */
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import {
  formatIssueBody,
  formatResolvedComment,
} from './format-issue-body.mjs';

const LABEL = 'ci-failure';

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' }).trim();
}

/**
 * `gh issue create --label` fails outright if the label doesn't already
 * exist in the repo - it never creates one implicitly. `gh label create
 * --force` creates-or-updates, so this is safe to call every time rather
 * than checking existence first.
 */
function ensureLabelExists() {
  gh([
    'label',
    'create',
    LABEL,
    '--color',
    'd73a4a',
    '--description',
    'Auto-filed from a red CI run’s AI diagnosis (scripts/qa-showcase/sync-ci-issue.mjs)',
    '--force',
  ]);
}

function findOpenIssueNumber() {
  const out = gh([
    'issue',
    'list',
    '--label',
    LABEL,
    '--state',
    'open',
    '--json',
    'number',
    '--limit',
    '1',
  ]);
  const issues = JSON.parse(out);
  return issues[0]?.number ?? null;
}

function syncIssue(diagnosis, runUrl) {
  const suiteCount = Object.keys(diagnosis).length;
  const existing = findOpenIssueNumber();

  if (suiteCount === 0) {
    if (existing) {
      gh([
        'issue',
        'comment',
        String(existing),
        '--body',
        formatResolvedComment(runUrl),
      ]);
      gh(['issue', 'close', String(existing)]);
      console.log(`Clean run - closed issue #${existing}.`);
    } else {
      console.log('Clean run, no open ci-failure issue to close.');
    }
    return;
  }

  const body = formatIssueBody(diagnosis, runUrl);
  if (existing) {
    gh(['issue', 'comment', String(existing), '--body', body]);
    console.log(
      `Updated issue #${existing} (${suiteCount} suite(s) still red).`,
    );
  } else {
    ensureLabelExists();
    const title = `CI failure: ${suiteCount} suite${suiteCount === 1 ? '' : 's'} red`;
    const url = gh([
      'issue',
      'create',
      '--title',
      title,
      '--body',
      body,
      '--label',
      LABEL,
    ]);
    console.log(`Opened ${url}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const flag = (name, fallback) => {
    const at = args.indexOf(name);
    return at === -1 || at === args.length - 1 ? fallback : args[at + 1];
  };

  const diagnosisPath = flag(
    '--diagnosis',
    './allure-report/ai-diagnosis.json',
  );
  const runUrl =
    flag('--run-url', null) ??
    `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;

  let diagnosisText;
  try {
    diagnosisText = await readFile(diagnosisPath, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(
        `No diagnosis file at ${diagnosisPath} (the AI-diagnosis step may have failed) - skipping issue sync.`,
      );
      return;
    }
    throw err;
  }

  syncIssue(JSON.parse(diagnosisText), runUrl);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
