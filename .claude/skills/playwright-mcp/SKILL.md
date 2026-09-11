---
name: playwright-mcp
description: Drive the live application through Playwright's MCP servers for exploration, locator discovery, and failure diagnosis. Use when planning coverage, confirming an accessible name, or investigating a failure.
---

# Playwright MCP Skill

## Outcome

Agents inspect the **real** application instead of guessing. Every locator that reaches a page
object was confirmed against a live accessibility snapshot first.

## Two servers, two jobs

`.mcp.json` registers both. Pick by task, not by habit.

| Server            | Command                                                                                       | Use for                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `playwright-test` | `npx playwright run-test-mcp-server`                                                          | Anything test-shaped: config-aware, reads `playwright.config.ts` directly (baseURL, project matrix) |
| `playwright`      | `npx @playwright/mcp@latest --isolated --test-id-attribute data-qa --viewport-size 1920,1080` | Ad-hoc exploration outside test authoring                                                           |

**Prefer `playwright-test`** for anything that will end up in a page object or spec - it resolves
locators exactly as the suite will run them.

## Method

1. Navigate to the real page.
2. Take an accessibility snapshot - the source of truth for locators, not the rendered HTML.
3. Interact to reach each state a plan needs; snapshot again at every state worth asserting on.
4. Record the confirmed accessible names, not a guess at what they probably are.

## Locator resolution order

1. A real role and accessible name in the snapshot -> `getByRole(role, { name })`.
2. An element carrying `data-qa` -> `getByTestId(...)` (mapped via `testIdAttribute` in
   `playwright.config.ts`).
3. Neither exists -> a documented CSS fallback with an inline comment explaining why, never a
   silent one.
4. Two elements sharing one accessible name is a scoping problem to solve in the page object
   (narrow the locator to its container), not a reason to reach for `.nth()`.

## When not to use MCP

- **Not for running the suite.** Tests run through `pnpm test`. MCP explores and verifies; it
  does not execute the suite.
- **Not as a recorder.** A transcribed click sequence is not a test - it has no page objects, no
  intent, and assertions only where someone remembered them. Use what the session established,
  then write the spec properly, page-object first.

## Known traps in this application

- Header nav lives inside `header .nav` - the bare `.nav` class matches roughly 30 other
  elements elsewhere on the page (carousels, tabs).
- Google AdSense iframes inject after load and can intercept clicks or shift layout. The shared
  fixture (`src/fixtures/framework-fixtures.ts`) aborts those hosts for every test, so a suite
  run and a live MCP session can render slightly differently - check which one you're looking
  at.
- The contact form's submit handler opens a real native `window.confirm()` before posting.
  Playwright's dialog handler has to be armed before the click, or it blocks indefinitely.
- An authenticated session's cart is tied to the account server-side, unlike the anonymous,
  per-browser-context cart the rest of the suite exercises.
