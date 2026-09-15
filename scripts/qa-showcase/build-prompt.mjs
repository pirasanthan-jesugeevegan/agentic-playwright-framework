/**
 * Builds the user-message text for one suite's failure-diagnosis call.
 * Kept pure and dependency-free so it's testable without touching the network.
 */
export function buildDiagnosisPrompt(group, statusMdText) {
  const testsBlock = group.tests
    .map(
      (t) =>
        `### ${t.name} (${t.status})\n\nMessage:\n${t.message}\n\nTrace:\n${t.trace}`,
    )
    .join('\n\n');

  return [
    `A Playwright suite failed. Here is every failing/broken test in the suite file "${group.suite}":`,
    '',
    testsBlock,
    '',
    "Here is this project's docs/STATUS.md, which records the coverage this repo believes is currently passing:",
    '',
    '```markdown',
    statusMdText,
    '```',
    '',
    'Answer with exactly three lines of plain text, each starting with the literal label below followed by a colon, then your answer on the same line. Do not use any markdown formatting - no asterisks, no numbered list markers, no headers, no bullet points.',
    'Root cause: what actually broke, in one or two sentences.',
    'Correlation: if there is more than one failing test above, do they share one root cause (a cascading failure), or are they independent? Say which.',
    'Drift: does docs/STATUS.md already document this as a known issue for this suite, or does it claim this suite is "Passing" while the run just failed (undocumented drift)? Quote the relevant STATUS.md line if you find one.',
  ].join('\n');
}
