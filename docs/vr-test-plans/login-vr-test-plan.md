# Login Visual Regression Test Plan

Spec file: `tests/vr/login.vr.spec.ts`.

## Scope

The login form with its error state showing - the one state where the form's layout genuinely
changes shape (it grows to fit the error message). Captured instead of the bare default form,
which never changes shape and would be a lower-value baseline than the one state most likely to
actually break.

## Preconditions

A fresh, unauthenticated browser context, `KNOWN_ACCOUNT` from `src/data/known-account.ts`
(a real, wrong password only).

## Cases

| ID    | Screenshot                    | State captured                              |
| ----- | ----------------------------- | ------------------------------------------- |
| VR-10 | `login-incorrect-credentials` | The login form with the error message shown |

## Notes

None - default threshold, no mask.

## Out of Scope

- The bare default form (no error) - static, lower-value than the state that actually reshapes
  the layout; add it back if the error-state baseline alone ever proves insufficient
- The signup half of this page - out of scope for the whole suite; no signup case exists in the
  functional suite either (see `login-test-plan.md`)
