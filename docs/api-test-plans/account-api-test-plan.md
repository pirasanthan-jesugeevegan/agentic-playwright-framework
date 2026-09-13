# Account API Test Plan

## Scope

Login verification (`/verifyLogin`), reading account details (`/getUserDetailByEmail`), and
account creation (`/createAccount`) - including the duplicate-email rejection.

## Spec Files

- `tests/api/account/account-positive-paths.spec.ts` - `happy` cases below
- `tests/api/account/account-negative-paths.spec.ts` - `error` case below
- `tests/api/account/account-schema-validation-paths.spec.ts` - `edge` cases below

## Preconditions

- The `api` project (no browser device; `apiRequest` fixture only).
- `KNOWN_ACCOUNT` from `src/data/known-account.ts` for the login-verification and
  get-user-detail cases.
- `generateAccountPayload()` from `src/data/account-payload.ts` for account creation - a fresh,
  unique email every run so repeat runs never collide.
- Any account a test creates is deleted in `afterEach` via `/deleteAccount`, pass or fail, so the
  suite never accumulates test accounts on the live site.

## API Quirk

Same as the Search API plan: almost every response is HTTP 200 with the real result in
`responseCode`.

## Test Cases

| ID     | Type  | Scenario                                                       | Expected                                                                |
| ------ | ----- | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| API-06 | happy | `POST /verifyLogin` with `KNOWN_ACCOUNT`'s valid credentials   | `responseCode: 200`; message says the user exists                       |
| API-07 | happy | `GET /getUserDetailByEmail` with `KNOWN_ACCOUNT`'s email       | `responseCode: 200`; returned user's email matches                      |
| API-08 | error | `POST /verifyLogin` with an email that has no account          | `responseCode: 404`; message says not found                             |
| API-09 | edge  | `POST /createAccount` with a complete, valid generated payload | `responseCode: 201`; message says the user was created                  |
| API-10 | edge  | `POST /createAccount` twice with the same generated payload    | Second call: `responseCode: 400`; message says the email already exists |

## Out of Scope

- Updating an existing account (`/updateAccount`) - not yet explored
- Password reset / forgot-password flow
- Missing-required-field validation on `/createAccount` specifically - the same "missing
  parameter" pattern is already covered on `/verifyLogin`'s sibling plan (Search API's API-03),
  not repeated here to keep the suite small
- A non-GET/POST method on `/verifyLogin` - the same wrong-method pattern is already covered by
  Search API's API-04
