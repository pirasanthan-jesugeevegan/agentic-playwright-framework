# Functional test plan template

Every plan in `docs/test-plans/` uses this shape.

```markdown
# <Area> Test Plan

## Scope

What this area covers, in two or three sentences. State the boundary, not the feature list.

## Spec Files

- `tests/<area>/<area>-positive-paths.spec.ts` - `happy` cases below (mark "not yet planned" if
  none exist)
- `tests/<area>/<area>-negative-paths.spec.ts` - `edge`/`error` cases below (mark "not yet
  planned" if none exist)

## Preconditions

Seed: `tests/smoke/smoke-positive-paths.spec.ts`

- What the suite provides automatically (fresh context, ad-hosts blocked).
- What a case must arrange itself.

## Test Cases

| ID    | Type  | Scenario                                          | Expected                                  |
| ----- | ----- | ------------------------------------------------- | ----------------------------------------- |
| TC-nn | happy | Verify that the user ... (mirrors the test title) | The observable outcome, not the mechanism |

## Locator Notes

Only where the DOM forced a decision. Each note says what was chosen and why.

## Out of Scope

What this plan deliberately leaves out, with the reason.
```

## Rules

- `Type` is one of `happy`, `edge`, `error`, and it decides the file: `happy` implements into
  `-positive-paths.spec.ts`, `edge`/`error` into `-negative-paths.spec.ts`. Every area carries
  at least one non-happy case - if none exists yet, that's a named gap in Spec Files, not a
  silently missing file.
- IDs are assigned in sequence, `TC-01` upward, taking the next number after the highest the
  suite holds. Never reused, never renumbered - a retired case leaves its number as a gap.
- The scenario column reads as behaviour, in the same "Verify that the user ..." language as the
  test title it becomes - not implementation.
- The expected column is observable: what a person would see.
