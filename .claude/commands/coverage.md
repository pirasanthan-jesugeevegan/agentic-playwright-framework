---
description: Audit suite coverage against the plans and decide what to work on next
allowed-tools: Task, Read, Grep, Glob
---

Delegate to the **playwright-test-manager** agent.

Ask it to:

1. Read `docs/STATUS.md`, the coverage baseline.
2. Cross-check every case ID in `docs/test-plans/*.md` (and `docs/vr-test-plans/*.md`, once it
   exists) against what is actually implemented in `tests/` (and `tests/vr/`). Report both
   directions: planned-but-missing and implemented-but-unplanned.
3. State the current counts against the cap - 15 functional, currently 10. Visual and API get
   their own caps once those suites exist.
4. Recommend the single highest-value next piece of work. If the cap is already reached, name
   the weakest existing case and propose a swap rather than growing the suite.

Focus area, if given: $ARGUMENTS
