# Contact Us Test Plan

## Scope

Submitting the contact form successfully, and the one field the app actually validates.

## Spec Files

- `tests/ui/contact/contact-positive-paths.spec.ts` - `happy` cases below
- `tests/ui/contact/contact-negative-paths.spec.ts` - `error` cases below

## Preconditions

Seed: `tests/ui/smoke/smoke-positive-paths.spec.ts`

- A fresh, unauthenticated browser context.
- `generateContactMessage()` from `src/data/contact-message.ts` - a fresh, unique message every
  run, never a hardcoded literal.

## Test Cases

| ID    | Type  | Scenario                                                                             | Expected                                                             |
| ----- | ----- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| TC-10 | happy | A visitor fills in and submits the contact form, accepting the native confirm prompt | A success banner confirms the message was sent                       |
| TC-11 | error | A visitor submits the form with every field empty                                    | The browser's native validation blocks the submit; no success banner |

## Locator Notes

The submit handler opens a real native `window.confirm()` before posting on the happy path -
Playwright's dialog handler must be armed before the click or the confirm blocks the page. See
`contact-page.ts`. Only the email field carries the HTML `required` attribute (verified against
the live DOM) - name, subject, and message do not, so the negative case asserts on the email
field's constraint-validation state specifically, not a generic "form blocked" signal.

## Out of Scope

- Invalid-but-non-empty input (a malformed email, an over-length message) - not yet explored
- Attachment upload field
