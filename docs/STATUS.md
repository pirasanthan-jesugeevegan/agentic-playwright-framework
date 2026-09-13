# Suite Status

Coverage counts, findings against the application, and open decisions. Nothing else goes here -
conventions and templates live in `.claude/skills/`.

## Functional (UI) suite

Cap: 15 (currently deliberately low - a new suite, extended with a stated reason per addition,
not grown by default. Raise the cap itself only with a reason.)

| Area           | Plan                                          | Positive spec                           | Negative spec                            | Cases | Implemented | Last run         |
| -------------- | --------------------------------------------- | --------------------------------------- | ---------------------------------------- | ----- | ----------- | ---------------- |
| Smoke          | `docs/test-plans/smoke-test-plan.md`          | `smoke-positive-paths.spec.ts`          | not planned - infra check, not a feature | 3     | 3           | Passing (see CI) |
| Products       | `docs/test-plans/products-test-plan.md`       | `products-positive-paths.spec.ts`       | `products-negative-paths.spec.ts`        | 2     | 2           | Passing          |
| Product detail | `docs/test-plans/product-detail-test-plan.md` | `product-detail-positive-paths.spec.ts` | `product-detail-negative-paths.spec.ts`  | 2     | 2           | Passing          |
| Cart           | `docs/test-plans/cart-test-plan.md`           | `cart-positive-paths.spec.ts`           | `cart-negative-paths.spec.ts`            | 2     | 2           | Passing          |
| Contact us     | `docs/test-plans/contact-test-plan.md`        | `contact-positive-paths.spec.ts`        | `contact-negative-paths.spec.ts`         | 2     | 2           | Passing          |
| Login          | `docs/test-plans/login-test-plan.md`          | `login-positive-paths.spec.ts`          | `login-negative-paths.spec.ts`           | 2     | 2           | Passing          |

**Total: 13 / 15.** Every non-smoke feature area carries exactly one positive and one negative
case, deliberately - Products, Product detail, and Cart each traded a second happy-path case for
the pairing (a case that can be justified beats a pile that can't). Smoke stays happy-path only
since it's an infra/seed check, not a feature.

## API suite

Cap: 10 (same discipline as the functional suite - both areas trimmed to a positive/negative
pair plus one or two edge cases apiece, dropping cases that repeated a pattern already shown
elsewhere in the suite rather than keeping one of everything imaginable).

| Area        | Plan                                           | Positive spec                    | Negative spec                    | Schema-validation spec                    | Cases | Implemented | Last run         |
| ----------- | ---------------------------------------------- | -------------------------------- | -------------------------------- | ----------------------------------------- | ----- | ----------- | ---------------- |
| Search API  | `docs/api-test-plans/search-api-test-plan.md`  | `search-positive-paths.spec.ts`  | `search-negative-paths.spec.ts`  | `search-schema-validation-paths.spec.ts`  | 5     | 5           | Passing (see CI) |
| Account API | `docs/api-test-plans/account-api-test-plan.md` | `account-positive-paths.spec.ts` | `account-negative-paths.spec.ts` | `account-schema-validation-paths.spec.ts` | 5     | 5           | Passing          |

**Total: 10 / 10. Full.** New coverage replaces an existing case rather than growing the suite.
Runs on the `api` project (no browser device, `apiRequest` fixture only), config from
`src/config/environments/<ENV>.json` via `ENV` in `.env`.

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
- The product detail page accepts a zero quantity with no client-side validation: adding at
  quantity 0 succeeds and the cart lists the item at that quantity (Rs. 0 total). Confirmed live
  against the app before TC-07 was written to assert the behaviour that exists.
- An anonymous visitor who tries to check out is shown a "Register / Login account to proceed on
  checkout" prompt and is kept on `/view_cart` rather than being redirected - TC-09 asserts this
  rather than the full checkout flow, which stays out of scope.
- Of the contact form's four fields, only email carries the HTML `required` attribute - name,
  subject, and message do not. TC-11 asserts on the email field's validity state specifically,
  confirmed against the live DOM rather than assumed.
- The public API returns real HTTP 200 for almost every call, including outright rejections -
  the actual result lives in a `responseCode` field in the JSON body (400/404/405 all arrive
  wrapped in HTTP 200).
- Every `POST`/`DELETE` endpoint takes `application/x-www-form-urlencoded` (`form` in
  Playwright's request options), not a JSON body.

## Open decisions

- Visual regression is planned next; see `CLAUDE.md`'s Agent system section for the roadmap.
- `chromium-authenticated` currently has no spec targeting it at all (no test needs a logged-in
  session yet). It stays wired (auth setup, storage state) for when one does.
- `staging`/`production` in `src/config/environments/` hold placeholder URLs, not real ones -
  automationexercise.com doesn't expose separate tiers. Fill them in if/when real endpoints for
  those tiers exist; until then `ENV=dev` is the only environment actually exercised.
