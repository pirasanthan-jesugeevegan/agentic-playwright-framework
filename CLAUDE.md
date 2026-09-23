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
  pages/       Page objects. BaseAppPage carries shared header chrome; each page extends it.
  fixtures/    Dependency-injected fixtures: pom/ (page objects + merged test), api/
               (apiRequest, Zod schemas), and the ad-blocking network fixture
  data/        Test data generators/seeds - never hardcoded inline in a spec
  config/      Environment (environments/<ENV>.json, ENV-selected) + project (browser
               matrix) configuration
tests/         One root, three sibling suites - every browser project's testDir is pinned
               to tests/ui specifically (src/config/projects.ts), so adding tests/api or
               tests/vr never smears those specs across every browser/device.
  ui/          UI E2E specs, one directory per feature area. Two files per area:
               <area>-positive-paths.spec.ts and <area>-negative-paths.spec.ts.
  api/         API specs. Up to three files per feature: -positive-paths /
               -negative-paths / -schema-validation-paths (GET and DELETE carry no
               body, so they skip the schema-validation file). See docs/STATUS.md.
  vr/          Visual regression specs (10, full - see docs/STATUS.md). One
               <area>.vr.spec.ts per area; see .claude/skills/playwright-visual-regression/.
  auth.setup.ts  Shared setup, not itself organized by suite - feeds chromium-authenticated.
               All specs import from src/fixtures/pom/test-options.
docs/          The plan-before-code artifact - not app documentation. STATUS.md is the
               coverage tracker and cap; test-plans/<area>-test-plan.md is written and
               reviewed *before* a single line of test code, one plan per feature area.
.claude/
  agents/      The 5 specialist roles - see Agent system below
  commands/    Slash commands (/plan, /implement, /review, /heal, /cycle, /coverage,
               /triage, /baseline) - each delegates to one agent with a fixed brief
  skills/      Coding standards the agents (and a human) follow: page-object testing,
               visual regression, live MCP exploration
  scripts/     enforce_constitution.py, the mechanical PreToolUse hook
.github/workflows/  CI: install -> test (7 projects) -> publish-report to GitHub Pages
```

## Coding standards

These aren't suggestions - every change, human- or agent-authored, is checked against them before it's committed, and a subset is checked mechanically (see [Mechanical enforcement](#mechanical-enforcement)).

- **Locators**: `getByRole` / `getByTestId` (mapped to the app's real `data-qa` attribute) first, an application-owned id/class only when there's no semantic hook, never XPath. Every locator is verified against the live DOM before it's written - via the MCP browser tools below, never assumed from memory or from reading the target's source alone.
- **No hard waits.** No `waitForTimeout`. Web-first assertions (`expect(locator).toBeVisible()`, etc.), `.waitFor()`, and Playwright's own auto-waiting do the synchronising.
- **Given/When/Then.** Every test body is structured with `test.step()`, one step per phase.
- **One tag per feature area** - `@smoke` or `@regression` - declared once on `test.describe(...)`, inherited by every test inside it. Not scattered per-`test()` call, and never both.
- **One path per spec file.** Every UI feature/page gets exactly two spec files: `<area>-positive-paths.spec.ts` (the happy paths) and `<area>-negative-paths.spec.ts` (edge/error cases). An API feature/page gets up to three: those same two, plus `<area>-schema-validation-paths.spec.ts` exercising the different request-body shapes a `POST`/`PUT`/`PATCH` endpoint accepts and rejects - `GET` and `DELETE` carry no body, so they're exempt from the third file. A case never moves suite by getting shoved into the wrong file; a positive case that belongs in `-negative-paths` is misplanned, not miscoded.
- **Test titles state the outcome as a claim.** Every `test()` title starts with `Verify that the user` (`Verify that the API` reads fine for a purely API-facing case), optionally prefixed with the plan's case ID - `'TC-08: Verify that the user sees the cart return to its empty state after removing the only item'`. Not a mechanism description, not a fragment.
- **Page objects don't assert.** They expose locators, actions, and readiness waits (`.waitFor()`); specs hold the `expect()`s. (`login-page.ts` used to break this - `login()` called `expect(...).toBeVisible()` internally; fixed to `.waitFor({ state: 'visible' })`, an example of exactly what the review/enforcement layers below exist to catch.)
- **Test data is generated, not copy-pasted.** Anything unique per run (emails, messages) comes from `src/data/`; anything that mirrors real catalog state is a seed, dated and labelled as one, not a magic literal.

## Flaky-test discipline

A flaky test is a defect, not weather.

1. Never fixed by adding a retry, raising a timeout, or loosening an assertion - that hides the cause and leaves the test passing for the wrong reason.
2. The cause is established first - trace, video, `error-context.md`, or driving the flow live - then classified: application changed, test raced the UI, state leaked from another test, third-party noise, or the target is genuinely at fault.
3. Third-party noise is handled at the network layer, in the fixture, not worked around per test. (`src/fixtures/framework-fixtures.ts` aborts every request to `doubleclick.net` / `googlesyndication.com` / `googleadservices.com` for exactly this reason - AdSense iframes were intercepting real clicks and slowing page loads under CI's network conditions.)
4. If the target is at fault, the test is not repaired to pass anyway - it's parked with `test.fixme()` naming the defect.

## Agent system

This suite is authored and maintained with an AI coding agent operating under this file, the role definitions in `.claude/agents/`, and the slash commands in `.claude/commands/` that invoke them with a fixed brief. Every change is reviewed and committed by a human - nothing lands without that review.

| Agent                       | Role                                                                                                              | Invoked by                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `playwright-test-manager`   | Owns scope: looks before creating, runs W1-W4 (coverage request / new case / red run / stale case), holds the cap | `/cycle`, `/coverage`, `/triage`, `/baseline` |
| `playwright-test-planner`   | Explores the live app over MCP, writes a plan (`docs/test-plans/<area>-test-plan.md`) before any code             | `/plan`                                       |
| `playwright-test-generator` | Implements one case at a time from a plan: page object first, then the spec that uses it                          | `/implement`                                  |
| `playwright-test-healer`    | Root-causes a failing test or a red CI run before proposing any fix - diagnose, don't guess                       | `/heal`, `/triage`, `/baseline`               |
| `playwright-test-reviewer`  | Read-only convention audit against this file and `.claude/skills/`, before a human commits                        | `/review`                                     |

Coverage stays deliberate: `docs/STATUS.md` holds a hard cap per suite (functional: 15, currently 13; API: 10, full; visual regression: 10, full) - a suite extends past its cap only with an explicit swap, named and justified, never by default. Visual regression's baselines still need generating on a real machine; see `docs/STATUS.md`'s Open decisions.

## CI showcase pipeline

`scripts/qa-showcase/` is a second, separate layer from the `.claude/agents` test-authoring system above - it runs in CI (`.github/workflows/playwright.yml`'s `publish-report` job), after tests but before anything is published to GitHub Pages:

- **AI failure diagnosis** (`explain-failures.mjs`) - groups any failed/broken Allure results by suite (`group-failures.mjs`), builds a prompt per group (`build-prompt.mjs`) embedding `docs/STATUS.md` for drift context, and asks Claude for a root cause, cross-suite correlation, and STATUS.md drift check. Writes `ai-diagnosis.json` alongside the Allure report - a safe no-op (empty object) on a clean run.
- **Contract verification** (`verify-contract.mjs`) - checks the built report against `contract/qa-showcase.contract.json`, the consumer-driven contract describing what `pirasanth.com/qa-suite` reads out of it. Runs twice in CI: once as a self-test against known-good/drifted fixtures (proving the verifier itself works), once for real against the report about to be published. A failure here blocks the Pages deploy - it's a drift-prevention gate, not a report annotation.

Each script is a pure-function core plus a thin CLI entrypoint, unit-tested with `node --test` (`pnpm run test:scripts`, also run in CI before the Playwright suite). Follow this same shape (pure logic + `.test.mjs` alongside) for anything added to this layer.

## Live exploration (MCP)

`.mcp.json` wires two Playwright MCP servers for any agent working in this repo:

- **`playwright-test`** - Playwright's own test-runner MCP server (`npx playwright run-test-mcp-server`). Config-aware: reads `playwright.config.ts` directly, so it knows `baseURL` and the project matrix. Preferred for anything test-shaped: listing/running/debugging specs.
- **`playwright`** - the general-purpose browser MCP (`npx @playwright/mcp@latest`), run `--isolated` (fresh context every session) with `--test-id-attribute data-qa` so `getByTestId()` in page objects lines up with the app's real attribute, and a fixed viewport matching CI. Used for exploring a flow before a locator gets written into a page object.

Locator-resolution order when exploring: accessible role + name first (`getByRole`), then `data-qa` (`getByTestId`), and only when neither exists, a documented CSS fallback with a comment explaining why.

Full detail, including known traps in this app (nav scoping, the AdSense timing difference between a suite run and a live MCP session, the native confirm dialog on delete), lives in `.claude/skills/playwright-mcp/SKILL.md`.

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
- A spec under `tests/**/*.spec.ts` importing `test`/`expect` from `@playwright/test` directly instead of `src/fixtures/pom/test-options`
- A UI spec file (`tests/ui/**/*.spec.ts`) not named `-positive-paths.spec.ts` or `-negative-paths.spec.ts`
- An API spec file (`tests/api/**/*.spec.ts`) not named `-positive-paths`, `-negative-paths`, or `-schema-validation-paths`
- A visual regression spec file (`tests/vr/**/*.spec.ts`) not named `<area>.vr.spec.ts`
- A `test()` title that doesn't start with `Verify that`

A hit blocks the write with an explanation on stderr; a clean write proceeds silently. This is a hard backstop under the prompt-level rules, not a replacement for the reviewer agent's judgment calls (coverage gaps, whether an assertion is meaningful) that a grep can't make.

## Environment

`.env` (gitignored) sets `ENV` to `dev`, `staging`, or `production`; `src/config/framework.ts` loads the matching `src/config/environments/<ENV>.json` (each holding `appUrl`/`apiUrl`) and validates it with Zod. See `.env.example` for the shape.
