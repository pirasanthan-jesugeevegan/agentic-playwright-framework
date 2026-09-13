# Home Visual Regression Test Plan

Spec file: `tests/vr/home.vr.spec.ts`.

## Scope

The category accordion (`.left-sidebar`) is shared chrome that appears on several pages, but the
home page is where it's captured: a layout regression here (spacing, a broken accordion icon, a
font fallback kicking in) would otherwise only surface as "something looks off" reports, never
as a failing functional assertion.

## Preconditions

A fresh, unauthenticated browser context. No cart or account state affects this component.

## Cases

| ID    | Screenshot                    | State captured                              |
| ----- | ----------------------------- | ------------------------------------------- |
| VR-01 | `home-category-panel-default` | The category panel as it renders by default |

## Notes

The hero carousel (`#slider .carousel`) is deliberately not captured: it auto-advances slides,
so any baseline against it would be flaky by construction. It would need masking to be safe, and
masking away the only thing that makes it visually distinct leaves nothing worth capturing.

## Out of Scope

- The hero carousel - auto-advancing, not stably capturable without masking away its content
- The featured-items grid - covered by the products page instead (`products-vr-test-plan.md`),
  which needs it anyway for its empty-search state
