/**
 * Formats ai-diagnosis.json (produced by explain-failures.mjs) into the
 * Markdown body of a GitHub issue. Pure and dependency-free, like
 * build-prompt.mjs - the CI step that posts this to GitHub owns the
 * actions/github-script call, this only owns the text.
 */
export function formatIssueBody(diagnosis, runUrl) {
  const suites = Object.entries(diagnosis);

  const sections = suites.map(([suite, entry]) =>
    [
      `### \`${suite}\``,
      '',
      `Failing: ${entry.tests.join(', ')}`,
      '',
      '```',
      entry.diagnosis,
      '```',
    ].join('\n'),
  );

  return [
    `CI is red on ${suites.length} suite${suites.length === 1 ? '' : 's'}. AI diagnosis below (from \`scripts/qa-showcase/explain-failures.mjs\`) - verify before acting on it, it can be wrong.`,
    ...sections,
    `Run: ${runUrl}`,
  ].join('\n\n');
}

/** The comment posted when a previously-red run goes green again. */
export function formatResolvedComment(runUrl) {
  return `Resolved - the suite is green again as of ${runUrl}.`;
}
