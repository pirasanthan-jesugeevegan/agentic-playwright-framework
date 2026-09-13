# Contact Visual Regression Test Plan

Spec file: `tests/vr/contact.vr.spec.ts`.

## Scope

The contact form's default layout - four inputs, a submit button, no error or success state
yet. A regression that misaligns a label or breaks the form's spacing would pass every
functional assertion in `contact-test-plan.md`, which only checks required-field validation.

## Preconditions

A fresh, unauthenticated browser context.

## Cases

| ID    | Screenshot             | State captured                          |
| ----- | ---------------------- | --------------------------------------- |
| VR-09 | `contact-form-default` | The form as it renders before any input |

## Notes

None - default threshold, no mask.

## Out of Scope

- The success banner after a real submission - the submit handler opens a native
  `window.confirm()` first (see `ContactPage.submit()`); dismissing it reliably inside a
  screenshot-focused test adds a real source of flakiness for a state that's already asserted on
  functionally (`contact-positive-paths.spec.ts`) and carries no distinct layout beyond a banner
  appearing above the form
- The invalid-submission state (TC-11) - HTML5's native validation bubble is browser-chrome, not
  page content, and doesn't composite into a Playwright screenshot consistently across engines
