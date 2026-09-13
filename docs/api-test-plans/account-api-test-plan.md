# Account API Test Plan

## Scope

Login verification (`/verifyLogin`), reading account details (`/getUserDetailByEmail`), and
account creation (`/createAccount`) - including the duplicate-email rejection and the missing
required-field case.

## Spec Files

- `tests/api/account/account-positive-paths.spec.ts` - `happy` cases below
- `tests/api/account/account-negative-paths.spec.ts` - `error` cases below
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
`responseCode`. The one exception in this suite is `createAccount` called via `DELETE`
(API-11's `verifyLogin` case), which the app also wraps in HTTP 200/`responseCode: 405` rather
than a genuine HTTP 405.

## Test Cases

| ID     | Type  | Scenario                                                       | Expected                                                                |
| ------ | ----- | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| API-07 | happy | `POST /verifyLogin` with `KNOWN_ACCOUNT`'s valid credentials   | `responseCode: 200`; message says the user exists                       |
| API-08 | happy | `GET /getUserDetailByEmail` with `KNOWN_ACCOUNT`'s email       | `responseCode: 200`; returned user's email matches                      |
| API-09 | error | `POST /verifyLogin` with an email that has no account          | `responseCode: 404`; message says not found                             |
| API-10 | error | `POST /verifyLogin` with no `email` parameter                  | `responseCode: 400`; message says the parameter is missing              |
| API-11 | error | `DELETE /verifyLogin` (wrong method)                           | `responseCode: 405`; message says the method is not supported           |
| API-12 | edge  | `POST /createAccount` with a generated payload missing `email` | `responseCode: 400`; message says the email parameter is missing        |
| API-13 | edge  | `POST /createAccount` with a complete, valid generated payload | `responseCode: 201`; message says the user was created                  |
| API-14 | edge  | `POST /createAccount` twice with the same generated payload    | Second call: `responseCode: 400`; message says the email already exists |

## Out of Scope

- Updating an existing account (`/updateAccount`) - not yet explored
- Password reset / forgot-password flow
- Field-level validation of every `createAccount` field individually (only the missing-email
  case is covered; the payload generator always sends a complete, valid shape otherwise)
