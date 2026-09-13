# Agentic Playwright Framework

A Playwright + TypeScript end-to-end suite for [automationexercise.com](https://automationexercise.com) - UI and API, page-object modelled, dependency-injected through fixtures, and published from CI to a live Allure report.

[![Playwright Tests](https://github.com/pirasanthan-jesugeevegan/agentic-playwright-framework/actions/workflows/playwright.yml/badge.svg)](https://github.com/pirasanthan-jesugeevegan/agentic-playwright-framework/actions/workflows/playwright.yml)

**Live Allure report:** https://pirasanthan-jesugeevegan.github.io/agentic-playwright-framework/

Every change here is written by an AI coding agent operating under a written constitution, through named roles, with a subset of the rules enforced mechanically before a write is even allowed to land - see [`CLAUDE.md`](./CLAUDE.md) for the full standard, the agent system, and the project structure.

## Quick start

```bash
pnpm install
pnpm exec playwright install --with-deps

cp .env.example .env   # ENV=dev is the only environment with real URLs right now

pnpm test               # full suite, every project
pnpm test:smoke         # @smoke-tagged cases only
```

## Scripts

| Command                                              | Purpose                                             |
| ---------------------------------------------------- | --------------------------------------------------- |
| `pnpm test`                                          | Run the full suite, every project                   |
| `pnpm test:smoke`                                    | `@smoke`-tagged cases only                          |
| `pnpm test:ui` / `test:headed` / `test:debug`        | Interactive runs                                    |
| `pnpm validate`                                      | lint + format:check + typecheck - all must be clean |
| `pnpm report:allure:generate` / `report:allure:open` | Build and view the Allure report locally            |

## Suite coverage

Current test counts, what's implemented vs. planned, and findings against the application live
in [`docs/STATUS.md`](./docs/STATUS.md). Individual feature-area test plans (written before any
test code, per the workflow in `CLAUDE.md`) live under `docs/test-plans/` and
`docs/api-test-plans/`.

## Tech stack

- Node.js + pnpm (`pnpm-lock.yaml` is the only lockfile)
- TypeScript, strict mode
- Playwright: chromium, firefox, webkit, mobile-chrome, mobile-safari, plus a dedicated no-browser `api` project, fully parallel
- Allure reporting, published to GitHub Pages on every push to `main`/`master`
- ESLint + Prettier + Husky/lint-staged pre-commit
