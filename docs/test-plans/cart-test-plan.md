# Cart Test Plan

## Scope

The cart's own state: starting empty, and returning to empty after the only item is removed.
Adding an item is exercised from the product detail page (see that plan); this one starts from
the cart itself.

## Spec Files

- `tests/cart/cart-positive-paths.spec.ts` - `happy` cases below
- `tests/cart/cart-negative-paths.spec.ts` - not yet planned; `edge`/`error` cases go here once the planner has explored this area's real error states

## Preconditions

Seed: `tests/smoke/smoke-positive-paths.spec.ts`

- A fresh, unauthenticated browser context. Deliberately **not** `chromium-authenticated`: that
  project's cart is tied to a real, persisted account server-side, so "starts empty" would be
  false the second time the suite runs against it. See `.claude/agents/playwright-test-healer.md`
  history and `src/config/projects.ts` for why that project is scoped away from these specs.

## Test Cases

| ID    | Type  | Scenario                                        | Expected                            |
| ----- | ----- | ----------------------------------------------- | ----------------------------------- |
| TC-08 | happy | A visitor with no prior activity opens the cart | The empty-cart message is shown     |
| TC-09 | happy | The only item in the cart is removed            | The cart returns to its empty state |

## Locator Notes

None beyond the base page object.

## Out of Scope

- Multiple items in the cart at once
- Updating quantity from within the cart itself (only from the detail page, TC-07)
- Proceed to checkout / the checkout flow
