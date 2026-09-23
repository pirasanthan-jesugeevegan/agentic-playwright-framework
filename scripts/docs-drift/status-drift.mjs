/**
 * Pure logic for the docs-drift gate: docs/STATUS.md states how many cases each
 * suite holds and what its cap is; the spec files are the ground truth. This
 * compares the two so a case added or removed without updating STATUS.md fails
 * CI instead of quietly leaving the coverage tracker (and the cap it enforces)
 * out of date.
 */

const SUITES = [
  { key: 'ui', heading: 'Functional (UI) suite' },
  { key: 'api', heading: 'API suite' },
  { key: 'vr', heading: 'Visual regression suite' },
];

/**
 * Reads `Cap: N` and `**Total: X / Y` from each suite's own section of
 * STATUS.md. Scoped to the section so a "Total" mentioned elsewhere in the file
 * (findings, open decisions) is never mistaken for a suite total.
 */
export function parseStatusTotals(markdown) {
  const sections = markdown.split(/^## /m).slice(1);
  const totals = {};

  for (const { key, heading } of SUITES) {
    const section = sections.find((s) => s.startsWith(heading));
    if (!section) {
      throw new Error(`STATUS.md has no "## ${heading}" section.`);
    }
    const total = section.match(/\*\*Total:\s*(\d+)\s*\/\s*(\d+)/);
    const capLine = section.match(/^Cap:\s*(\d+)/m);
    if (!total || !capLine) {
      throw new Error(
        `STATUS.md "${heading}" section needs both a "Cap: N" line and a "**Total: X / N" line (${heading}).`,
      );
    }
    totals[key] = {
      total: Number(total[1]),
      cap: Number(total[2]),
      capLine: Number(capLine[1]),
    };
  }

  return totals;
}

/** Counts `test(` cases in a spec's source - not describe/step/hooks, not comments. */
export function countTests(source) {
  return (source.match(/^[ \t]*test\(/gm) ?? []).length;
}

/** Returns one human-readable problem per disagreement; empty when everything agrees. */
export function findDrift(totals, actual) {
  const problems = [];

  for (const { key, heading } of SUITES) {
    const { total, cap, capLine } = totals[key];

    if (capLine !== cap) {
      problems.push(
        `${key}: STATUS.md says "Cap: ${capLine}" but the Total line says "/ ${cap}" (${heading}).`,
      );
    }
    if (actual[key] !== total) {
      problems.push(
        `${key}: ${actual[key]} cases in the specs but STATUS.md says ${total} (${heading}).`,
      );
    }
    if (actual[key] > cap) {
      problems.push(
        `${key}: ${actual[key]} cases exceeds the cap of ${cap} (${heading}) - a swap needs a stated reason.`,
      );
    }
  }

  return problems;
}
