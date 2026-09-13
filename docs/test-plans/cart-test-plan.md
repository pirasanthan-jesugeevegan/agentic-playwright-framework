# Cart Test Plan

## Scope

The cart's own state: returning to empty after the only item is removed, and the guard an
anonymous visitor hits at checkout. Adding an item is exercised from the product detail page
(see that plan); this one starts from the cart itself.

## Spec Files

- `tests/ui/cart/cart-positive-paths.spec.ts` - `happy` cases below
- `tests/ui/cart/cart-negative-paths.spec.ts` - `error` cases below

## Preconditions

Seed: `tests/ui/smoke/smoke-positive-paths.spec.ts`

- A fresh, unauthenticated browser context. Deliberately **not** `chromium-authenticated`: that
  project's cart is tied to a real, persisted account server-side, so "starts empty" would be
  false the second time the suite runs against it. See `.claude/agents/playwright-test-healer.md`
  history and `src/config/projects.ts` for why that project is scoped away from these specs.

## Test Cases

| ID    | Type  | Scenario                                                           | Expected                                                      |
| ----- | ----- | ------------------------------------------------------------------ | ------------------------------------------------------------- |
| TC-08 | happy | The only item in the cart is removed                               | The cart returns to its empty state                           |
| TC-09 | error | An anonymous visitor with an item in the cart proceeds to checkout | A login prompt is shown and the visitor stays on `/view_cart` |

## Locator Notes

The checkout guard (`Register / Login account to proceed on checkout.`, a `Register / Login`
link, `Continue On Cart`) is a real `<a href="/login">` and plain text nodes rather than a named
dialog - `getByRole('link', ...)` and `getByText(...)` are used directly rather than scoping to a
modal container, confirmed against the live DOM before being written.

## Out of Scope

- Multiple items in the cart at once
- Updating quantity from within the cart itself (only from the detail page, TC-06)
- The checkout flow itself once an account exists (only the anonymous guard is covered here)
