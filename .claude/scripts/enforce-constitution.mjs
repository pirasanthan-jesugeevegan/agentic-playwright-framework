#!/usr/bin/env node
/**
 * PreToolUse hook: blocks a small set of mechanically-detectable
 * violations of CLAUDE.md before a Write/Edit/MultiEdit lands, so the
 * constitution is a hard backstop and not just a prompt asked nicely.
 *
 * Wired in .claude/settings.json against Write|Edit|MultiEdit. Claude Code
 * pipes the tool-call payload to this script's stdin; exit 0 allows the
 * write, exit 2 blocks it and shows the agent this script's stderr.
 *
 * Deliberately dumb: no AI call, no parsing the file as TypeScript - each
 * rule is a plain string/regex check against only the content being added
 * (never the whole file, and never content being deleted), gated to the
 * paths it actually applies to. A grep-equivalent, on purpose: zero false
 * positives from a rule matter more here than catching everything.
 * Plain Node, no dependencies - this is a Node/TS repo, not a Python one.
 */

function addedContent(toolName, toolInput) {
  if (toolName === 'Write') return toolInput.content ?? '';
  if (toolName === 'Edit') return toolInput.new_string ?? '';
  if (toolName === 'MultiEdit') {
    return (toolInput.edits ?? []).map((e) => e.new_string ?? '').join('\n');
  }
  return '';
}

function describeMissingTag(content) {
  return content
    .split('\n')
    .some((line) => /test\.describe\(/.test(line) && !line.includes('tag:'));
}

// Each rule: [pathPattern, check(content) -> boolean, message]
const RULES = [
  [
    /^(src|tests)\/.*\.tsx?$/,
    (c) => c.includes('waitForTimeout('),
    'waitForTimeout() is a hard wait - use a web-first assertion, .waitFor(), or fix the real race instead.',
  ],
  [
    /^(src|tests)\/.*\.tsx?$/,
    (c) => /xpath=|locator\(\s*['"`]\/\//.test(c),
    'XPath locator - use getByRole/getByTestId, or a documented CSS fallback if neither exists on the element.',
  ],
  [
    /^src\/pages\/.*\.tsx?$/,
    (c) => /\bexpect\(/.test(c),
    "Page objects don't assert - expose the locator/action and let the spec (or setup script) hold the expect().",
  ],
  [
    /^tests\/.*\.spec\.tsx?$/,
    describeMissingTag,
    "test.describe(...) needs a tag: ('@smoke' or '@regression') inline, inherited by every test inside it.",
  ],
  [
    /^tests\/.*\.spec\.tsx?$/,
    (c) => /from\s+['"]@playwright\/test['"]/.test(c),
    "Specs import test/expect from src/fixtures/base-test, not @playwright/test directly - that's how page-object fixtures get injected.",
  ],
];

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  let payload;
  try {
    payload = JSON.parse(await readStdin());
  } catch {
    return 0; // can't parse the call - fail open, don't block on our own bug
  }

  const toolName = payload.tool_name ?? '';
  const toolInput = payload.tool_input ?? {};
  const filePath = toolInput.file_path ?? '';

  if (!['Write', 'Edit', 'MultiEdit'].includes(toolName)) return 0;

  const marker = 'agentic-playwright-framework/';
  const relPath = filePath.includes(marker)
    ? filePath.slice(filePath.indexOf(marker) + marker.length)
    : filePath;

  const content = addedContent(toolName, toolInput);
  if (!content) return 0;

  const violations = RULES.filter(
    ([pathPattern, check]) => pathPattern.test(relPath) && check(content),
  ).map(([, , message]) => message);

  if (violations.length > 0) {
    process.stderr.write(
      `BLOCKED by Constitution enforcement hook (${relPath}):\n`,
    );
    for (const v of violations) process.stderr.write(`  - ${v}\n`);
    return 2;
  }

  return 0;
}

main().then((code) => process.exit(code));
