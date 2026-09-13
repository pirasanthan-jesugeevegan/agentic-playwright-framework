# Suite Status

Coverage counts, findings against the application, and open decisions. Nothing else goes here -
conventions and templates live in `.claude/skills/`.

## Functional (UI) suite

Cap: 15 (currently deliberately low - a new suite, extended with a stated reason per addition,
not grown by default. Raise the cap itself only with a reason.)

| Area           | Plan                                          | Positive spec                           | Negative spec                     | Cases | Implemented | Last run         |
| -------------- | --------------------------------------------- | --------------------------------------- | --------------------------------- | ----- | ----------- | ---------------- |
| Smoke          | `docs/test-plans/smoke-test-plan.md`          | `smoke-positive-paths.spec.ts`          | not yet planned                   | 3     | 3           | Passing (see CI) |
| Products       | `docs/test-plans/products-test-plan.md`       | `products-positive-paths.spec.ts`       | `products-negative-paths.spec.ts` | 3     | 3           | Passing          |
| Product detail | `docs/test-plans/product-detail-test-plan.md` | `product-detail-positive-paths.spec.ts` | not yet planned                   | 2     | 2           | Passing          |
| Cart           | `docs/test-plans/cart-test-plan.md`           | `cart-positive-paths.spec.ts`           | not yet planned                   | 2     | 2           | Passing          |
| Contact us     | `docs/test-plans/contact-test-plan.md`        | `contact-positive-paths.spec.ts`        | not yet planned                   | 1     | 1           | Passing          |
| Login          | `docs/test-plans/login-test-plan.md`          | `login-positive-paths.spec.ts`          | `login-negative-paths.spec.ts`    | 2     | 2           | Passing          |

**Total: 13 / 15.** Products and Login each have a negative-path case now; Smoke, Product detail,
Cart, and Contact us are still happy-path only. Adding the next negative case for one of those
areas needs the planner to explore the app's actual error/edge states first (invalid contact-form
input, an out-of-range quantity), not invented from assumption.

## API suite

Cap: not yet set - this is the suite's first round, so no number has been picked or justified.
Set one (with a reason) before adding a third feature area.

| Area        | Plan                                           | Positive spec                    | Negative spec                    | Schema-validation spec                    | Cases | Implemented | Last run         |
| ----------- | ---------------------------------------------- | -------------------------------- | -------------------------------- | ----------------------------------------- | ----- | ----------- | ---------------- |
| Search API  | `docs/api-test-plans/search-api-test-plan.md`  | `search-positive-paths.spec.ts`  | `search-negative-paths.spec.ts`  | `search-schema-validation-paths.spec.ts`  | 6     | 6           | Passing (see CI) |
| Account API | `docs/api-test-plans/account-api-test-plan.md` | `account-positive-paths.spec.ts` | `account-negative-paths.spec.ts` | `account-schema-validation-paths.spec.ts` | 8     | 8           | Passing          |

**Total: 14 / (no cap).** Runs on the `api` project (no browser device, `apiRequest` fixture
only), config from `src/config/environments/<ENV>.json` via `ENV` in `.env`.

## Visual regression suite

Not yet built. Tracked here once `tests/vr/` and `docs/vr-test-plans/` exist.

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
- The public API returns real HTTP 200 for almost every call, including outright rejections -
  the actual result lives in a `responseCode` field in the JSON body (400/404/405 all arrive
  wrapped in HTTP 200). The one exception found so far is `createAccount` called with the wrong
  HTTP method, which the app also wraps rather than returning a genuine non-200 status - see the
  `verifyLogin` DELETE case (API-11) for that quirk in practice.
- Every `POST`/`DELETE` endpoint takes `application/x-www-form-urlencoded` (`form` in
  Playwright's request options), not a JSON body.

## Open decisions

- Visual regression is planned next; see `CLAUDE.md`'s Agent system section for the roadmap.
- The API suite's cap has not been set. Pick one (with a stated reason, same discipline as the
  functional cap) before adding a third API feature area.
- `chromium-authenticated` currently has no spec targeting it at all (no test needs a logged-in
  session yet). It stays wired (auth setup, storage state) for when one does.
- `staging`/`production` in `src/config/environments/` hold placeholder URLs, not real ones -
  automationexercise.com doesn't expose separate tiers. Fill them in if/when real endpoints for
  those tiers exist; until then `ENV=dev` is the only environment actually exercised.
