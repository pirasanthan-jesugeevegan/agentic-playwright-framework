# Login Test Plan

## Scope

Signing in with a real, pre-existing account: the success state and the wrong-password error
state. Account creation is covered by the Account API plan, not here.

## Spec Files

- `tests/ui/login/login-positive-paths.spec.ts` - `happy` cases below
- `tests/ui/login/login-negative-paths.spec.ts` - `error` cases below

## Preconditions

Seed: `tests/ui/smoke/smoke-positive-paths.spec.ts`

- A fresh, unauthenticated browser context.
- `KNOWN_ACCOUNT` from `src/data/known-account.ts` - a real, pre-existing account on
  automationexercise.com, not one created by the suite itself.

## Test Cases

| ID    | Type  | Scenario                                                               | Expected                                                        |
| ----- | ----- | ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| TC-12 | happy | A visitor signs in with `KNOWN_ACCOUNT`'s valid credentials            | The header shows their logged-in status                         |
| TC-13 | error | A visitor signs in with `KNOWN_ACCOUNT`'s email but the wrong password | An incorrect-credentials message is shown and no session starts |

## Locator Notes

None beyond the base page object.

## Out of Scope

- Account creation / sign-up (see the Account API plan)
- Logout
- "Remember me" / session persistence across browser restarts
- Password reset
