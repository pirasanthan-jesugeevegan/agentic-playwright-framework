# Products Test Plan

## Scope

Search and navigation from the product listing. Covers reaching a product's detail page, not
what that page shows once you're there (see `product-detail-test-plan.md`).

## Spec Files

- `tests/ui/products/products-positive-paths.spec.ts` - `happy` cases below
- `tests/ui/products/products-negative-paths.spec.ts` - not yet planned; `edge`/`error` cases go here once the planner has explored this area's real error states

## Preconditions

Seed: `tests/ui/smoke/smoke-positive-paths.spec.ts`

- A fresh, unauthenticated browser context.
- `KNOWN_PRODUCT` and `SEARCH_TERM` from `src/data/catalog.ts` - a hand-captured seed snapshot
  of the live catalog, dated, not asserted as exhaustive.

## Test Cases

| ID    | Type  | Scenario                                                  | Expected                                                                    |
| ----- | ----- | --------------------------------------------------------- | --------------------------------------------------------------------------- |
| TC-04 | happy | A visitor searches for "Top"                              | The page switches to a "Searched Products" heading with at least one result |
| TC-05 | happy | A visitor opens `KNOWN_PRODUCT` via its View Product link | The detail page shows that product's name                                   |

## Locator Notes

Every product card renders two links addressed by `/product_details/{id}` (the image and the
"View Product" overlay). `viewProductLink` matches on `href`, verified unique per product id on
the listing page.

## Out of Scope

- Exact result count for a search (catalog drifts; only "at least one" is asserted)
- Filtering by category/brand (not yet explored)
- Pagination (not yet explored)
