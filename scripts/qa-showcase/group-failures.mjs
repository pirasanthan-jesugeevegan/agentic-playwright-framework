/**
 * Groups raw Allure result records (allure-results/*-result.json) into one
 * entry per suite (spec file), keeping only failed/broken tests. Grouping by
 * suite — rather than emitting one diagnosis per test — is what lets a later
 * step notice a cascading failure (one root cause producing two different
 * symptoms) instead of surfacing two disconnected-looking diagnoses.
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
    entry.tests.push({
      name: record.name,
      status: record.status,
      message: record.statusDetails?.message ?? '',
      trace: record.statusDetails?.trace ?? '',
    });
    bySuite.set(suiteLabel.value, entry);
  }

  return Array.from(bySuite.values());
}
