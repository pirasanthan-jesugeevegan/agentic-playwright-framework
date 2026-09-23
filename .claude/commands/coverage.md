---
description: Audit suite coverage against the plans and decide what to work on next
allowed-tools: Task, Read, Grep, Glob
---

Delegate to the **playwright-test-manager** agent.

Ask it to:

1. Read `docs/STATUS.md`, the coverage baseline.
2. Cross-check every case ID in `docs/test-plans/*.md`, `docs/api-test-plans/*.md`, and
   `docs/vr-test-plans/*.md` against what is actually implemented in `tests/ui/`, `tests/api/`,
   and `tests/vr/`. Report both directions: planned-but-missing and implemented-but-unplanned.
3. State the current counts against each cap: functional 15 (currently 13), API 10 (full), VR
   10 (full, baselines pending).
4. Recommend the single highest-value next piece of work. If a cap is already reached, name the
   weakest existing case and propose a swap rather than growing that suite.

Focus area, if given: $ARGUMENTS
