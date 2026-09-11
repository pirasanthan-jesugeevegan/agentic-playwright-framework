---
description: Run a full plan -> implement -> review -> validate cycle for a feature area
argument-hint: <feature area>
allowed-tools: Task, Read, Write, Edit, Grep, Glob, Bash, TodoWrite
---

Delegate to the **playwright-test-manager** agent.

Feature area: $ARGUMENTS

The manager owns the cycle: it starts at W1 (below the cap, proceeds straight to W2; at the cap,
proposes a swap and waits). Today that covers the functional suite only, one case at a time -
once the visual and API suites exist, this command chains all three for the area in the same
run, functional first.

Step order: planner, generator (one case at a time), reviewer on the changed files, the static
gate (`pnpm validate`), the case, the suite, healer on failure, `docs/STATUS.md` last.

The review step is not optional because the tests pass. Report the cycle as a table: file, cases
added, review findings, final run result.
