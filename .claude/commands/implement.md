---
description: Implement one test case from an existing plan
argument-hint: <case id, e.g. "TC-11" or "VR-01">
allowed-tools: Task, Read, Write, Edit, Grep, Glob, Bash
---

Delegate to the **playwright-test-generator** agent.

Case to implement: $ARGUMENTS

Requirements:

- Read the plan the case belongs to first (`docs/test-plans/` or `docs/vr-test-plans/`).
  Implement exactly that case, nothing adjacent.
- Follow `.claude/skills/playwright-pageobject-testing/SKILL.md`. For a `VR-` case, also follow
  `.claude/skills/playwright-visual-regression/SKILL.md`.
- Reuse existing page objects in `src/pages/` before writing new ones. Any new class extends
  `BaseAppPage` and is exported from `src/pages/index.ts`.
- Run `pnpm validate`, then the single case, and report whether it passed on the first attempt.
  A case that only passed on a retry is reported as flaky, not as done.
