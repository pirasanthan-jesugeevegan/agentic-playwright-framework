#!/usr/bin/env node
/**
 * Verifies a published (or on-disk) Allure report + ai-diagnosis.json against
 * contract/qa-showcase.contract.json. Run from either side:
 *
 *   node scripts/qa-showcase/verify-contract.mjs
 *       against the published report named in the contract (the consumer's
 *       scheduled workflow does this)
 *
 *   node scripts/qa-showcase/verify-contract.mjs --base ./allure-report
 *       against a report on disk, run before publishing so a break is caught
 *       before it goes live (the provider's CI does this)
 *
 * Exit code is 1 if any required document is missing or malformed. An
 * optional document that is absent is reported and forgiven — the page hides
 * whatever panel would have used it.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const at = args.indexOf(name);
  return at === -1 || at === args.length - 1 ? fallback : args[at + 1];
};

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const contractPath = flag(
  '--contract',
  join(repoRoot, 'contract', 'qa-showcase.contract.json'),
);
const contract = JSON.parse(await readFile(contractPath, 'utf8'));
const base = flag('--base', contract.provider);
const isUrl = /^https?:\/\//i.test(base);

async function readDoc(path) {
  if (isUrl) {
    const response = await fetch(new URL(path, base));
    if (!response.ok) return { present: false };
    return { present: true, data: await response.json() };
  }
  try {
    const text = await readFile(join(base, path), 'utf8');
    return { present: true, data: JSON.parse(text) };
  } catch {
    return { present: false };
  }
}

function getField(obj, path) {
  return path
    .split('.')
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function checkField(data, check, problems, docPath) {
  const value = getField(data, check.field);
  if (check.type === 'number' && typeof value !== 'number') {
    problems.push(
      `${docPath}: expected "${check.field}" to be a number, got ${typeof value}`,
    );
    return;
  }
  if (check.type === 'string' && typeof value !== 'string') {
    problems.push(
      `${docPath}: expected "${check.field}" to be a string, got ${typeof value}`,
    );
    return;
  }
  if (check.type === 'array' && !Array.isArray(value)) {
    problems.push(
      `${docPath}: expected "${check.field}" to be an array, got ${typeof value}`,
    );
    return;
  }
  if (
    typeof check.min === 'number' &&
    typeof value === 'number' &&
    value < check.min
  ) {
    problems.push(
      `${docPath}: expected "${check.field}" >= ${check.min}, got ${value}`,
    );
  }
}

function leaves(node, out) {
  if (!node) return out;
  if (node.children?.length) {
    node.children.forEach((child) => leaves(child, out));
  } else if (node.status) {
    out.push(node);
  }
  return out;
}

function checkLeaves(data, check, problems, docPath) {
  const found = leaves(data, []);
  if (found.length < check.minCount) {
    problems.push(
      `${docPath}: expected at least ${check.minCount} leaf result(s), found ${found.length}`,
    );
    return;
  }
  for (const field of check.require) {
    const missing = found.filter((leaf) => getField(leaf, field) === undefined);
    if (missing.length > 0) {
      problems.push(
        `${docPath}: ${missing.length} leaf result(s) are missing required field "${field}"`,
      );
    }
  }
}

function checkArrayOf(data, check, problems, docPath) {
  if (!Array.isArray(data)) {
    problems.push(`${docPath}: expected an array, got ${typeof data}`);
    return;
  }
  if (data.length < check.minLength) {
    problems.push(
      `${docPath}: expected at least ${check.minLength} item(s), found ${data.length}`,
    );
    return;
  }
  for (const entryCheck of check.each) {
    checkField(data[0], entryCheck, problems, docPath);
  }
}

function checkObjectValues(data, check, problems, docPath) {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    problems.push(`${docPath}: expected an object, got ${typeof data}`);
    return;
  }
  for (const [key, value] of Object.entries(data)) {
    for (const entryCheck of check.each) {
      checkField(value, entryCheck, problems, `${docPath}["${key}"]`);
    }
  }
}

const problems = [];
const notes = [];

for (const doc of contract.documents) {
  const { present, data } = await readDoc(doc.path);
  if (!present) {
    if (doc.required) {
      problems.push(
        `${doc.path}: required document is missing (used for: ${doc.usedFor})`,
      );
    } else {
      notes.push(
        `${doc.path}: optional document is absent — the panel that uses it (${doc.usedFor}) will be hidden`,
      );
    }
    continue;
  }

  for (const check of doc.checks ?? []) {
    if (check.field) checkField(data, check, problems, doc.path);
    else if (check.kind === 'leaves')
      checkLeaves(data, check, problems, doc.path);
    else if (check.kind === 'arrayOf')
      checkArrayOf(data, check, problems, doc.path);
    else if (check.kind === 'objectValues')
      checkObjectValues(data, check, problems, doc.path);
  }
}

for (const note of notes) console.log(`note: ${note}`);

if (problems.length > 0) {
  console.error(
    `${contract.name} v${contract.version}: ${problems.length} problem(s) against ${base}:\n`,
  );
  problems.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}

console.log(`${contract.name} v${contract.version}: OK against ${base}`);
