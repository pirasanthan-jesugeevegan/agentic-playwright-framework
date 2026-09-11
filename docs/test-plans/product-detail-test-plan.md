# Product Detail Test Plan

## Scope

Adding a product to the cart from its detail page, and that the chosen quantity is honoured.

## Spec Files

- `tests/product-detail/product-detail-positive-paths.spec.ts` - `happy` cases below
- `tests/product-detail/product-detail-negative-paths.spec.ts` - not yet planned; `edge`/`error` cases go here once the planner has explored this area's real error states

## Preconditions

Seed: `tests/smoke/smoke-positive-paths.spec.ts`

- A fresh, unauthenticated browser context.
- `KNOWN_PRODUCT` from `src/data/catalog.ts`.

## Test Cases

| ID    | Type  | Scenario                                                           | Expected                                                          |
| ----- | ----- | ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| TC-06 | happy | A visitor adds `KNOWN_PRODUCT` to the cart at the default quantity | The confirmation modal is visible with a working link to the cart |
| TC-07 | happy | A visitor sets quantity to 3 before adding to cart                 | The cart row for that product shows quantity 3                    |

## Locator Notes

`productName` is scoped to `.product-information` (the panel), not a bare heading selector - the
page renders other `h2`s outside that panel (e.g. in the "recommended items" rail).

## Out of Scope

- Quantity validation (non-numeric input, 0, negative) - not yet explored
- Product reviews / write-a-review form on this page
- "Recommended items" carousel
