# Contact Us Test Plan

## Scope

Submitting the contact form successfully.

## Spec Files

- `tests/contact/contact-positive-paths.spec.ts` - `happy` cases below
- `tests/contact/contact-negative-paths.spec.ts` - not yet planned; `edge`/`error` cases go here once the planner has explored this area's real error states

## Preconditions

Seed: `tests/smoke/smoke-positive-paths.spec.ts`

- A fresh, unauthenticated browser context.
- `generateContactMessage()` from `src/data/contact-message.ts` - a fresh, unique message every
  run, never a hardcoded literal.

## Test Cases

| ID    | Type  | Scenario                                                                             | Expected                                       |
| ----- | ----- | ------------------------------------------------------------------------------------ | ---------------------------------------------- |
| TC-10 | happy | A visitor fills in and submits the contact form, accepting the native confirm prompt | A success banner confirms the message was sent |

## Locator Notes

The submit handler opens a real native `window.confirm()` before posting - Playwright's dialog
handler must be armed before the click or the confirm blocks the page. See `contact-page.ts`.

## Out of Scope

- Field validation (empty/invalid email, etc.) - not yet explored
- Attachment upload field
