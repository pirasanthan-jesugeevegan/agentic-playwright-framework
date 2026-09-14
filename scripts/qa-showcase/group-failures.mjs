/**
 * Groups raw Allure result records (allure-results/*-result.json) into one
 * entry per suite (spec file), keeping only failed/broken tests. Grouping by
 * suite — rather than emitting one diagnosis per test — is what lets a later
 * step notice a cascading failure (one root cause producing two different
 * symptoms) instead of surfacing two disconnected-looking diagnoses.
 *
 * The "suite" label is the spec file path, which is identical across every
 * browser project (chromium, firefox, ...) for the same UI test. When one
 * test fails on multiple projects in the same run, dedupe within a group by
 * name + message so it appears once, not once per failing browser.
 */
export function groupFailures(resultRecords) {
  const relevant = resultRecords.filter(
    (r) => r.status === 'failed' || r.status === 'broken',
  );

  const bySuite = new Map();
  for (const record of relevant) {
    const suiteLabel = record.labels.find((l) => l.name === 'suite');
    if (!suiteLabel) {
      throw new Error(
        `Result "${record.name}" is missing a "suite" label — cannot group it.`,
      );
    }

    const entry = bySuite.get(suiteLabel.value) ?? {
      suite: suiteLabel.value,
      tests: [],
    };
    const message = record.statusDetails?.message ?? '';
    const isDuplicate = entry.tests.some(
      (t) => t.name === record.name && t.message === message,
    );
    if (!isDuplicate) {
      entry.tests.push({
        name: record.name,
        status: record.status,
        message,
        trace: record.statusDetails?.trace ?? '',
      });
    }
    bySuite.set(suiteLabel.value, entry);
  }

  return Array.from(bySuite.values());
}
