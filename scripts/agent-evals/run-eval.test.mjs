import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGradingPrompt,
  parseGradeResponse,
  runEvalScenario,
  runEvals,
} from './run-eval.mjs';

const scenario = {
  agent: 'playwright-test-reviewer',
  scenario: 'a scenario title',
  input: 'the situation',
  rubric: ['requirement one', 'requirement two'],
};

test('buildGradingPrompt includes the scenario, the response, and every numbered rubric item', () => {
  const prompt = buildGradingPrompt(scenario, 'the agent said this');

  assert.match(prompt, /the situation/);
  assert.match(prompt, /the agent said this/);
  assert.match(prompt, /1\. requirement one/);
  assert.match(prompt, /2\. requirement two/);
  assert.match(prompt, /VERDICT: PASS/);
});

test('parseGradeResponse parses per-item results and an explicit verdict', () => {
  const text = [
    '1: PASS - did the thing',
    '2: FAIL - missed this',
    'VERDICT: FAIL',
  ].join('\n');

  const grade = parseGradeResponse(text, 2);

  assert.equal(grade.verdict, false);
  assert.deepEqual(grade.items, [
    { index: 1, pass: true, reason: 'did the thing' },
    { index: 2, pass: false, reason: 'missed this' },
  ]);
});

test('parseGradeResponse derives the verdict when the VERDICT line is missing', () => {
  const allPass = parseGradeResponse(
    ['1: PASS - ok', '2: PASS - ok'].join('\n'),
    2,
  );
  assert.equal(allPass.verdict, true);

  const notAllPass = parseGradeResponse(
    ['1: PASS - ok', '2: FAIL - nope'].join('\n'),
    2,
  );
  assert.equal(notAllPass.verdict, false);
});

test('parseGradeResponse treats a missing item as a fail via the derived verdict', () => {
  const grade = parseGradeResponse('1: PASS - ok', 2);
  assert.equal(grade.verdict, false);
});

test('runEvalScenario calls the agent then the judge, in order, and returns the parsed grade', async () => {
  const calls = [];
  const deps = {
    callAgent: async (systemPromptText, input) => {
      calls.push(['agent', systemPromptText, input]);
      return 'the agent response';
    },
    callJudge: async (prompt) => {
      calls.push(['judge', prompt]);
      return '1: PASS - ok\n2: PASS - ok\nVERDICT: PASS';
    },
  };

  const result = await runEvalScenario(scenario, 'SYSTEM PROMPT TEXT', deps);

  assert.equal(calls[0][0], 'agent');
  assert.equal(calls[0][1], 'SYSTEM PROMPT TEXT');
  assert.equal(calls[0][2], 'the situation');
  assert.equal(calls[1][0], 'judge');
  assert.match(calls[1][1], /the agent response/);

  assert.equal(result.agent, 'playwright-test-reviewer');
  assert.equal(result.agentResponse, 'the agent response');
  assert.equal(result.grade.verdict, true);
});

test('runEvals runs every scenario and keys the system prompt by agent name', async () => {
  const scenarios = [
    { ...scenario, agent: 'agent-a' },
    { ...scenario, agent: 'agent-b' },
  ];
  const systemPromptsByAgent = {
    'agent-a': 'PROMPT A',
    'agent-b': 'PROMPT B',
  };
  const seenPrompts = [];

  const results = await runEvals(scenarios, systemPromptsByAgent, {
    callAgent: async (systemPromptText) => {
      seenPrompts.push(systemPromptText);
      return 'ok';
    },
    callJudge: async () => '1: PASS - ok\n2: PASS - ok\nVERDICT: PASS',
  });

  assert.equal(results.length, 2);
  assert.deepEqual(seenPrompts, ['PROMPT A', 'PROMPT B']);
});

test('runEvals throws a clear error when a scenario names an agent with no loaded system prompt', async () => {
  await assert.rejects(
    () =>
      runEvals(
        [scenario],
        {},
        { callAgent: async () => '', callJudge: async () => '' },
      ),
    /No system prompt loaded for agent "playwright-test-reviewer"/,
  );
});
