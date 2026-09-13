# Product Detail Test Plan

## Scope

Whether the quantity chosen before adding a product is honoured by the cart - correctly for a
normal value, and (a real finding against the app, not a defect in the test) for a zero
quantity too.

## Spec Files

- `tests/ui/product-detail/product-detail-positive-paths.spec.ts` - `happy` cases below
- `tests/ui/product-detail/product-detail-negative-paths.spec.ts` - `error` cases below

## Preconditions

Seed: `tests/ui/smoke/smoke-positive-paths.spec.ts`

- A fresh, unauthenticated browser context.
- `KNOWN_PRODUCT` from `src/data/catalog.ts`.

## Test Cases

| ID    | Type  | Scenario                                           | Expected                                                                                                                             |
| ----- | ----- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| TC-06 | happy | A visitor sets quantity to 3 before adding to cart | The cart row for that product shows quantity 3                                                                                       |
| TC-07 | error | A visitor sets quantity to 0 before adding to cart | No validation rejects it; the cart lists the product at quantity 0, confirmed live via the app's own UI before this case was written |

## Locator Notes

`productName` is scoped to `.product-information` (the panel), not a bare heading selector - the
page renders other `h2`s outside that panel (e.g. in the "recommended items" rail).

## Out of Scope

- Quantity validation on the confirmation modal itself
- Product reviews / write-a-review form on this page
- "Recommended items" carousel
