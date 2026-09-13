# Search API Test Plan

## Scope

`POST /searchProduct` - matching and non-matching search terms, its parameter/method
validation, and how it behaves on an input the UI would never send (a SQL-injection-shaped
value).

## Spec Files

- `tests/api/search/search-positive-paths.spec.ts` - `happy` cases below
- `tests/api/search/search-negative-paths.spec.ts` - `error` cases below
- `tests/api/search/search-schema-validation-paths.spec.ts` - `edge` case below

## Preconditions

- The `api` project (no browser device; `apiRequest` fixture only).

## API Quirk

automationexercise.com's API returns real HTTP 200 for almost everything and embeds the actual
result in a `responseCode` field in the JSON body - a missing parameter or wrong method still
comes back as HTTP 200 with `responseCode: 400` / `405` inside it. Every test below asserts on
`responseCode`, not just the transport-level `status`.

## Test Cases

| ID     | Type  | Scenario                                                 | Expected                                                                          |
| ------ | ----- | -------------------------------------------------------- | --------------------------------------------------------------------------------- |
| API-01 | happy | `POST /searchProduct` with `search_product: 'top'`       | `responseCode: 200`; every returned product's name contains "top"                 |
| API-02 | happy | `POST /searchProduct` with a term matching no product    | `responseCode: 200`; `products` is an empty array                                 |
| API-03 | error | `POST /searchProduct` with no `search_product` parameter | `responseCode: 400`; message says the parameter is missing                        |
| API-04 | error | `GET /searchProduct` (wrong method)                      | `responseCode: 405`; message says the method is not supported                     |
| API-05 | edge  | `POST /searchProduct` with a SQL-injection-shaped value  | `responseCode: 200`; `products` is an empty array - no error, no injection effect |

## Out of Scope

- Pagination or sorting of search results (endpoint doesn't support either)
- Search by category/brand rather than free text
- An empty `search_product` value matching every product - a real quirk, deliberately dropped
  from this plan to keep the suite small; see `docs/STATUS.md`'s Findings if it needs
  documenting again later
