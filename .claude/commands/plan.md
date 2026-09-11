---
description: Explore a feature area on the live site via MCP and write a test plan
argument-hint: <feature area, e.g. "recommended items carousel">
allowed-tools: Task, Read, Write, Grep, Glob, mcp__playwright-test__browser_navigate, mcp__playwright-test__browser_snapshot, mcp__playwright-test__browser_click, mcp__playwright-test__browser_type, mcp__playwright-test__browser_evaluate
---

Delegate to the **playwright-test-planner** agent.

Feature area to plan: $ARGUMENTS

Requirements:

- Explore through the MCP browser tools before writing anything. Locators in the plan must come
  from an actual accessibility snapshot against automationexercise.com, not from memory.
- Record every state the area can be in, including empty, error, and unauthenticated states.
- Write the plan to `docs/test-plans/<area>-test-plan.md` following
  `.claude/skills/playwright-pageobject-testing/references/test-plan-template.md`, including the
  "Out of Scope" section and confirmed accessible names.
- Respect the cap. Functional is 15, currently at 10 (`docs/STATUS.md`). If the plan would push
  the suite past 15, say which existing case it should replace and why.
