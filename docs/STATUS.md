# Suite Status

Coverage counts, findings against the application, and open decisions. Nothing else goes here -
conventions and templates live in `.claude/skills/`.

## Functional suite

Cap: 15 (currently deliberately low - a new suite, extended with a stated reason per addition,
not grown by default. Raise the cap itself only with a reason.)

| Area           | Plan                                          | Positive spec                           | Negative spec   | Cases | Implemented | Last run         |
| -------------- | --------------------------------------------- | --------------------------------------- | --------------- | ----- | ----------- | ---------------- |
| Smoke          | `docs/test-plans/smoke-test-plan.md`          | `smoke-positive-paths.spec.ts`          | not yet planned | 3     | 3           | Passing (see CI) |
| Products       | `docs/test-plans/products-test-plan.md`       | `products-positive-paths.spec.ts`       | not yet planned | 2     | 2           | Passing          |
| Product detail | `docs/test-plans/product-detail-test-plan.md` | `product-detail-positive-paths.spec.ts` | not yet planned | 2     | 2           | Passing          |
| Cart           | `docs/test-plans/cart-test-plan.md`           | `cart-positive-paths.spec.ts`           | not yet planned | 2     | 2           | Passing          |
| Contact us     | `docs/test-plans/contact-test-plan.md`        | `contact-positive-paths.spec.ts`        | not yet planned | 1     | 1           | Passing          |

**Total: 10 / 15.** Every case implemented so far is a happy path - no area has a
`-negative-paths.spec.ts` yet. That's the next concrete increment per area, and it
needs the planner to explore the app's actual error/edge states first (invalid
contact-form input, an out-of-range quantity, a search with no results), not
invented from assumption.

## Visual regression suite

Not yet built. Tracked here once `vr-tests/` and `docs/vr-test-plans/` exist.

## API suite

Not yet built. Tracked here once an API test layer exists.

## Findings against the application

- Google AdSense iframes intercept clicks and slow page loads under CI's network conditions -
  handled at the network layer (`src/fixtures/framework-fixtures.ts` aborts ad-host requests),
  not per-test.
- The `chromium-authenticated` project's cart is tied to a real, persisted account server-side,
  unlike the anonymous per-context cart the functional suite exercises. Scoped away from these
  specs via `testMatch` in `src/config/projects.ts` until a scenario actually needs a logged-in
  session.
- `login-page.ts` and `cart-page.ts` originally asserted internally (`expect()` inside a page
  object method) - fixed; page objects now only wait for readiness, specs hold the assertions.

## Open decisions

- Visual regression and API testing are planned next; see `CLAUDE.md`'s Agent system section for
  the roadmap.
- `chromium-authenticated` currently has no spec targeting it at all (no test needs a logged-in
  session yet). It stays wired (auth setup, storage state) for when one does.
- No area has a `-negative-paths.spec.ts` yet - every case implemented so far is `happy`. Adding
  the first negative case for an area is W2 work: planner explores the real error/edge states,
  then the generator implements against that plan, same as any other case.
