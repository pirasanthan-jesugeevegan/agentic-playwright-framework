# Agentic Playwright Framework

A Playwright + TypeScript end-to-end suite for [automationexercise.com](https://automationexercise.com), page-object modelled, dependency-injected through fixtures, and published from CI to a live Allure report.

What makes it _agentic_ rather than just automated: every change is written by an AI coding agent operating under a written constitution (this file), through named roles (`.claude/agents/`), against the live app via MCP (`.mcp.json`), with a subset of the rules below enforced mechanically before a write is even allowed to land (`.claude/scripts/enforce_constitution.py`) - not just asked for in a prompt. A human reviews and commits every change; nothing lands unreviewed. See [Agent system](#agent-system) below.

## Tech stack

- Node.js + pnpm (`pnpm-lock.yaml` is the only lockfile)
- TypeScript, strict mode
- Playwright: chromium, firefox, webkit, mobile-chrome, mobile-safari, fully parallel
- Allure: reporting, published to GitHub Pages on every push to `master`
- ESLint + Prettier + Husky/lint-staged pre-commit

## Commands

| Command                                              | Purpose                                             |
| ---------------------------------------------------- | --------------------------------------------------- |
| `pnpm test`                                          | Run the full suite, every project                   |
| `pnpm test:smoke`                                    | `@smoke`-tagged cases only                          |
| `pnpm test:ui` / `test:headed` / `test:debug`        | Interactive runs                                    |
| `pnpm validate`                                      | lint + format:check + typecheck - all must be clean |
| `pnpm report:allure:generate` / `report:allure:open` | Build and view the Allure report locally            |

Live report: https://pirasanthan-jesugeevegan.github.io/agentic-playwright-framework/

## Project structure

```
src/
  pages/    Page objects. BaseAppPage carries shared header chrome; each page extends it.
  fixtures/ Dependency-injected page-object fixtures + the ad-blocking network fixture
  data/     Test data generators/seeds - never hardcoded inline in a spec
  config/   Environment + project (browser matrix) configuration
tests/      One directory per feature area; specs import from src/fixtures/base-test
.claude/    Agent roles, the constitution-enforcement hook, MCP-backed exploration
docs/       Agent workflows playbook, decision log
.github/workflows/  CI: install -> test (6 projects) -> publish-report to GitHub Pages
```

## Coding standards

These aren't suggestions - every change, human- or agent-authored, is checked against them before it's committed, and a subset is checked mechanically (see [Mechanical enforcement](#mechanical-enforcement)).

- **Locators**: `getByRole` / `getByTestId` (mapped to the app's real `data-qa` attribute) first, an application-owned id/class only when there's no semantic hook, never XPath. Every locator is verified against the live DOM before it's written - via the MCP browser tools below, never assumed from memory or from reading the target's source alone.
- **No hard waits.** No `waitForTimeout`. Web-first assertions (`expect(locator).toBeVisible()`, etc.), `.waitFor()`, and Playwright's own auto-waiting do the synchronising.
- **Given/When/Then.** Every test body is structured with `test.step()`, one step per phase.
- **One tag per feature area** - `@smoke` or `@regression` - declared once on `test.describe(...)`, inherited by every test inside it. Not scattered per-`test()` call, and never both.
- **Page objects don't assert.** They expose locators, actions, and readiness waits (`.waitFor()`); specs hold the `expect()`s. (`login-page.ts` used to break this - `login()` called `expect(...).toBeVisible()` internally; fixed to `.waitFor({ state: 'visible' })`, an example of exactly what the review/enforcement layers below exist to catch.)
- **Test data is generated, not copy-pasted.** Anything unique per run (emails, messages) comes from `src/data/`; anything that mirrors real catalog state is a seed, dated and labelled as one, not a magic literal.

## Flaky-test discipline

A flaky test is a defect, not weather.

1. Never fixed by adding a retry, raising a timeout, or loosening an assertion - that hides the cause and leaves the test passing for the wrong reason.
2. The cause is established first - trace, video, `error-context.md`, or driving the flow live - then classified: application changed, test raced the UI, state leaked from another test, third-party noise, or the target is genuinely at fault.
3. Third-party noise is handled at the network layer, in the fixture, not worked around per test. (`src/fixtures/framework-fixtures.ts` aborts every request to `doubleclick.net` / `googlesyndication.com` / `googleadservices.com` for exactly this reason - AdSense iframes were intercepting real clicks and slowing page loads under CI's network conditions.)
4. If the target is at fault, the test is not repaired to pass anyway - it's parked with `test.fixme()` naming the defect.

## Agent system

This suite is authored and maintained with an AI coding agent operating under this file and the role definitions in `.claude/agents/`. Every change is reviewed and committed by a human - nothing lands without that review. `docs/agent-workflows.md` maps common requests to the exact agent/phase sequence that handles them.

| Agent                           | Role                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `playwright-test-manager`       | Owns scope for a feature area: routes to the right agent, enforces the caps below, runs the cycle end to end |
| `playwright-test-planner`       | Explores the live app over MCP, writes a plan (`docs/plans/<area>-plan.md`) before any code                  |
| `playwright-page-object-author` | Implements one case at a time from a plan: page object first, then the spec that uses it                     |
| `ci-failure-triage`             | Root-causes a red CI run from its report/logs before proposing any fix                                       |
| `playwright-test-reviewer`      | Read-only convention audit against this file, before a human commits                                         |

Coverage stays deliberate: a feature area extends past roughly a dozen cases only with a stated reason, not by default - twenty cases that can each be justified beat two hundred nobody can explain.

## Live exploration (MCP)

`.mcp.json` wires two Playwright MCP servers for any agent working in this repo:

- **`playwright-test`** - Playwright's own test-runner MCP server (`npx playwright run-test-mcp-server`). Config-aware: reads `playwright.config.ts` directly, so it knows `baseURL` and the project matrix. Preferred for anything test-shaped: listing/running/debugging specs.
- **`playwright`** - the general-purpose browser MCP (`npx @playwright/mcp@latest`), run `--isolated` (fresh context every session) with `--test-id-attribute data-qa` so `getByTestId()` in page objects lines up with the app's real attribute, and a fixed viewport matching CI. Used for exploring a flow before a locator gets written into a page object.

Locator-resolution order when exploring: accessible role + name first (`getByRole`), then `data-qa` (`getByTestId`), and only when neither exists, a documented CSS fallback with a comment explaining why.

## Confidence-gated planning

Before any agent proposes a change beyond a trivial one-line fix, it states its confidence explicitly:

```
Scope: <files touched, what changes>
Confidence: <1-10> (<low|medium|high>)
Rationale: <one line per factor that raised or lowered it>
Unknowns: <what's still unverified, or "none">
```

Below 5: no plan is proposed. The agent goes back and explores (reads the live DOM, the actual spec files, the actual CI log) rather than guess, or asks the human directly. This is the same discipline that governed this session in practice - e.g. asking rather than guessing at the CI failure log before proposing the ad-blocking fix, and re-verifying the tag convention against the real spec files (not this file's earlier, wrong description of it) before writing the enforcement hook below.

## Mechanical enforcement

`.claude/scripts/enforce_constitution.py`, wired as a `PreToolUse` hook on `Write`/`Edit`/`MultiEdit` in `.claude/settings.json`, blocks a small set of mechanically-detectable violations of the rules above before the file is ever written - not a prompt asking nicely, a deterministic check with no AI call involved:

- `waitForTimeout(` anywhere under `src/` or `tests/`
- An XPath locator (`xpath=` or `locator('//...')`)
- `expect(` inside `src/pages/**` (page objects don't assert)
- A new `test.describe(` without a `tag:` alongside it
- A spec under `tests/**/*.spec.ts` importing `test`/`expect` from `@playwright/test` directly instead of `src/fixtures/base-test`

A hit blocks the write with an explanation on stderr; a clean write proceeds silently. This is a hard backstop under the prompt-level rules, not a replacement for the reviewer agent's judgment calls (coverage gaps, whether an assertion is meaningful) that a grep can't make.

## Environment

`.env` (gitignored) sets `APP_URL` / `API_URL`; see `.env.example` for the shape. Defaults to `https://automationexercise.com`.
