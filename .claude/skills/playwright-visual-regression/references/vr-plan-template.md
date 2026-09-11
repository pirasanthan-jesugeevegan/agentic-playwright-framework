# Visual regression plan template

Every plan in `docs/vr-test-plans/` uses this shape.

```markdown
# <Area> Visual Regression Test Plan

Spec file: `vr-tests/<area>.vr.spec.ts`.

## Scope

Why this area is worth capturing: which visual states break in ways a functional assertion
never notices.

## Preconditions

State the suite must be in before capturing (signed in/out, cart contents, etc).

## Cases

| ID    | Screenshot       | State captured         |
| ----- | ---------------- | ---------------------- |
| VR-nn | `<area>-<state>` | The state, in one line |

## Notes

Only where a case departs from the default: a raised threshold, a mask, a viewport capture
instead of an element. Each note carries the reason.

## Out of Scope

States deliberately not captured, each with its reason: a state another case already covers, a
state that carries an AdSense slot, or one that cannot be captured stably.
```

## Rules

- The screenshot column holds the baseline name without `.png` and without the platform suffix
  Playwright appends. It must match the name in the spec exactly.
- IDs are assigned in sequence, `VR-01` upward, taking the next number after the highest the
  suite holds. They are never reused and never renumbered: the ID is what ties the plan to the
  test title, to `docs/STATUS.md` and, for a visual case, to the baseline name.
- A retired case leaves its number behind. The gap is the record that it existed; closing it by
  renumbering would silently repoint every one of those links.
- A case is one state and one capture. Two states are two cases.
- `Out of Scope` is not optional. At a small cap, what was left out and why is the argument that
  the cases kept were chosen rather than collected.
- No note means the case uses the project default threshold. A raised threshold without a note
  is a defect.
- The "State captured" column is the state in one line, not the test title. The test itself
  still follows CLAUDE.md's title convention - `VR-01: Verify that the user sees the empty cart
state rendered correctly` - the hook checks the title, not this table.
