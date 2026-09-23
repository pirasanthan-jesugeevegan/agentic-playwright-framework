#!/usr/bin/env node
/**
 * Evaluates whether the 5 agents in .claude/agents/ actually follow their own
 * written instructions. For each scenario in scenarios/*.json: sends the
 * agent's real system prompt + the scenario's input to Claude (the "agent"
 * call), then asks a second Claude call to grade the response against the
 * scenario's rubric (the "judge" call). Writes agent-eval-results.json.
 *
 * Mirrors scripts/qa-showcase/explain-failures.mjs: pure orchestration/parsing
 * functions exported and unit-tested with a fake callAgent/callJudge, a thin
 * CLI entrypoint owns the real Anthropic client.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import Anthropic from '@anthropic-ai/sdk';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

/**
 * Builds the grading prompt for one scenario + the agent's response to it.
 * Pure, dependency-free - the judge call's user message, verbatim.
 */
export function buildGradingPrompt(scenario, agentResponse) {
  const rubricBlock = scenario.rubric
    .map((item, i) => `${i + 1}. ${item}`)
    .join('\n');

  return [
    "You are grading whether an AI agent's response follows its own written rules.",
    '',
    `Scenario given to the agent ("${scenario.agent}"):`,
    scenario.input,
    '',
    'The agent responded:',
    '"""',
    agentResponse,
    '"""',
    '',
    'Rubric - does the response satisfy each of these requirements?',
    rubricBlock,
    '',
    'Answer with exactly one line per rubric item, numbered to match, each formatted as',
    '"N: PASS - <one-sentence reason>" or "N: FAIL - <one-sentence reason>". After the last',
    'rubric line, add one final line formatted as "VERDICT: PASS" if every item passed, or',
    '"VERDICT: FAIL" if any item failed. Do not use any other markdown formatting.',
  ].join('\n');
}

/**
 * Parses the judge's plain-text response into structured per-item results
 * plus an overall verdict. Falls back to deriving the verdict from the items
 * if the judge forgot the VERDICT line (or it doesn't parse) rather than
 * silently reporting a pass.
 */
export function parseGradeResponse(text, expectedItemCount) {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const items = [];
  let verdict = null;

  for (const line of lines) {
    const itemMatch = line.match(/^(\d+):\s*(PASS|FAIL)\s*-\s*(.*)$/i);
    if (itemMatch) {
      items.push({
        index: Number(itemMatch[1]),
        pass: itemMatch[2].toUpperCase() === 'PASS',
        reason: itemMatch[3].trim(),
      });
      continue;
    }
    const verdictMatch = line.match(/^VERDICT:\s*(PASS|FAIL)$/i);
    if (verdictMatch) {
      verdict = verdictMatch[1].toUpperCase() === 'PASS';
    }
  }

  if (verdict === null) {
    verdict = items.length === expectedItemCount && items.every((i) => i.pass);
  }

  return { items, verdict };
}

/** Runs one scenario end to end: agent call, then judge call, then parse. */
export async function runEvalScenario(
  scenario,
  systemPromptText,
  { callAgent, callJudge },
) {
  const agentResponse = await callAgent(systemPromptText, scenario.input);
  const gradingPrompt = buildGradingPrompt(scenario, agentResponse);
  const judgeResponse = await callJudge(gradingPrompt);
  const grade = parseGradeResponse(judgeResponse, scenario.rubric.length);

  return {
    agent: scenario.agent,
    scenario: scenario.scenario,
    agentResponse,
    grade,
  };
}

/** Runs every scenario, keyed by agent name -> systemPromptText. */
export async function runEvals(scenarios, systemPromptsByAgent, deps) {
  const results = [];
  for (const scenario of scenarios) {
    const systemPromptText = systemPromptsByAgent[scenario.agent];
    if (!systemPromptText) {
      throw new Error(
        `No system prompt loaded for agent "${scenario.agent}" (scenario "${scenario.scenario}")`,
      );
    }
    results.push(await runEvalScenario(scenario, systemPromptText, deps));
  }
  return results;
}

async function loadScenarios(scenariosDir) {
  const files = (await readdir(scenariosDir)).filter((f) =>
    f.endsWith('.json'),
  );
  return Promise.all(
    files.map(async (f) =>
      JSON.parse(await readFile(join(scenariosDir, f), 'utf8')),
    ),
  );
}

async function loadSystemPrompts(scenarios) {
  const paths = [...new Set(scenarios.map((s) => s.systemPromptPath))];
  const entries = await Promise.all(
    paths.map(async (p) => [p, await readFile(join(repoRoot, p), 'utf8')]),
  );
  const byPath = Object.fromEntries(entries);
  return Object.fromEntries(
    scenarios.map((s) => [s.agent, byPath[s.systemPromptPath]]),
  );
}

async function realCallAgent(client, systemPromptText, input) {
  const response = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1024,
    system: systemPromptText,
    messages: [{ role: 'user', content: input }],
  });
  const textBlock = response.content.find((b) => b.type === 'text');
  return textBlock?.text ?? '';
}

async function realCallJudge(client, prompt) {
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

  const scenariosDir = flag(
    '--scenarios-dir',
    join(repoRoot, 'scripts', 'agent-evals', 'scenarios'),
  );
  const outPath = flag('--out', join(repoRoot, 'agent-eval-results.json'));

  const scenarios = await loadScenarios(scenariosDir);
  const systemPromptsByAgent = await loadSystemPrompts(scenarios);

  const client = new Anthropic();
  const results = await runEvals(scenarios, systemPromptsByAgent, {
    callAgent: (systemPromptText, input) =>
      realCallAgent(client, systemPromptText, input),
    callJudge: (prompt) => realCallJudge(client, prompt),
  });

  await writeFile(outPath, JSON.stringify(results, null, 2));

  const failed = results.filter((r) => !r.grade.verdict);
  console.log(
    `${results.length - failed.length}/${results.length} scenario(s) passed. Wrote ${outPath}`,
  );
  for (const r of failed) {
    console.log(`  FAIL: ${r.agent} - ${r.scenario}`);
    for (const item of r.grade.items.filter((i) => !i.pass)) {
      console.log(`    - ${item.reason}`);
    }
  }

  if (failed.length > 0) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
