# Products Test Plan

## Scope

Search from the product listing. Reaching a product's detail page from a listing link is not
separately covered here - Product detail's own plan already proves that page's behaviour once
reached, and the view-product link itself carries no logic worth a dedicated case.

## Spec Files

- `tests/ui/products/products-positive-paths.spec.ts` - `happy` cases below
- `tests/ui/products/products-negative-paths.spec.ts` - `error` cases below

## Preconditions

Seed: `tests/ui/smoke/smoke-positive-paths.spec.ts`

- A fresh, unauthenticated browser context.
- `SEARCH_TERM` from `src/data/catalog.ts` - a hand-captured seed snapshot of the live catalog,
  dated, not asserted as exhaustive.

## Test Cases

| ID    | Type  | Scenario                                               | Expected                                                                    |
| ----- | ----- | ------------------------------------------------------ | --------------------------------------------------------------------------- |
| TC-04 | happy | A visitor searches for "Top"                           | The page switches to a "Searched Products" heading with at least one result |
| TC-05 | error | A visitor searches for a term no product name contains | The "Searched Products" heading is shown with zero product cards            |

## Locator Notes

None beyond the base page object.

## Out of Scope

- Exact result count for a search (catalog drifts; only "at least one"/"zero" is asserted)
- Filtering by category/brand (not yet explored)
- Pagination (not yet explored)
- Navigating to a product's detail page via the listing's View Product link (see Scope)
