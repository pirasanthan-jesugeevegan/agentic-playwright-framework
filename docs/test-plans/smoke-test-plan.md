# Smoke Test Plan

## Scope

The fast, broad check that each top-level page still loads and shows its defining landmark.
Deliberately shallow - nothing here depends on catalog data or account state, so this suite
should never fail because the demo store's products or a test account changed.

## Spec Files

- `tests/smoke/smoke-positive-paths.spec.ts` - `happy` cases below
- `tests/smoke/smoke-negative-paths.spec.ts` - not yet planned; `edge`/`error` cases go here once the planner has explored this area's real error states

## Preconditions

Seed: `tests/smoke/smoke-positive-paths.spec.ts` doubles as the environment seed here - if it fails, treat
every other suite's result with suspicion before investigating them individually.

- A fresh, unauthenticated browser context (the `chromium` project, not `chromium-authenticated`).

## Test Cases

| ID    | Type  | Scenario                            | Expected                                                                           |
| ----- | ----- | ----------------------------------- | ---------------------------------------------------------------------------------- |
| TC-01 | happy | A visitor opens the home page       | The header nav (Home/Products/Cart) and the featured-items rail are visible        |
| TC-02 | happy | A visitor opens the products page   | The "All Products" heading and at least one product card are visible               |
| TC-03 | happy | A visitor opens the contact us page | Every field of the message form (name, email, subject, message, submit) is visible |

## Locator Notes

Header nav is scoped to `header .nav` - the Bootstrap `.nav` class is reused ~30 times elsewhere
on the page (carousels, tabs), so an unscoped `.nav` locator is ambiguous.

## Out of Scope

- Actual navigation/interaction (covered by the regression plans per area)
- Exact catalog contents (drifts over time; only "at least one card" is asserted here)
