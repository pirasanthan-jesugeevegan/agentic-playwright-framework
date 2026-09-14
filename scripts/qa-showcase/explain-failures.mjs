#!/usr/bin/env node
/**
 * Reads allure-results/*-result.json for the run that was just published,
 * groups failures by suite (Task 1), and asks Claude Sonnet 5 for a root
 * cause + cascading-failure correlation + STATUS.md drift check per group
 * (Task 2's prompt). Writes ai-diagnosis.json as a SIBLING of the Allure
 * report — never injected into Allure's own report schema.
 *
 * This script is a safe no-op on a clean run (writes an empty
 * ai-diagnosis.json); the CI step that invokes it runs unconditionally, not
 * gated on failure count.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { groupFailures } from './group-failures.mjs';
import { buildDiagnosisPrompt } from './build-prompt.mjs';

export async function diagnoseGroups(groups, statusMdText, { callClaude }) {
  const out = {};
  for (const group of groups) {
    const prompt = buildDiagnosisPrompt(group, statusMdText);
    const diagnosis = await callClaude(prompt);
    out[group.suite] = { tests: group.tests.map((t) => t.name), diagnosis };
  }
  return out;
}

async function readAllureResults(resultsDir) {
  const files = (await readdir(resultsDir)).filter((f) =>
    f.endsWith('-result.json'),
  );
  const records = await Promise.all(
    files.map(async (f) =>
      JSON.parse(await readFile(join(resultsDir, f), 'utf8')),
    ),
  );
  return records;
}

async function realCallClaude(client, prompt) {
  const response = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });
  const textBlock = response.content.find((b) => b.type === 'text');
  return textBlock?.text ?? '';
}

async function main() {
  const args = process.argv.slice(2);
  const flag = (name, fallback) => {
    const at = args.indexOf(name);
    return at === -1 || at === args.length - 1 ? fallback : args[at + 1];
  };

  const resultsDir = flag('--results-dir', './allure-results');
  const statusMdPath = flag('--status-md', './docs/STATUS.md');
  const outPath = flag('--out', './allure-report/ai-diagnosis.json');

  const [records, statusMdText] = await Promise.all([
    readAllureResults(resultsDir),
    readFile(statusMdPath, 'utf8'),
  ]);

  const groups = groupFailures(records);
  if (groups.length === 0) {
    console.log(
      'No failed/broken results — writing an empty ai-diagnosis.json.',
    );
    await writeFile(outPath, JSON.stringify({}, null, 2));
    return;
  }

  const client = new Anthropic();
  const diagnosis = await diagnoseGroups(groups, statusMdText, {
    callClaude: (prompt) => realCallClaude(client, prompt),
  });

  await writeFile(outPath, JSON.stringify(diagnosis, null, 2));
  console.log(
    `Wrote diagnosis for ${groups.length} failing suite(s) to ${outPath}`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
