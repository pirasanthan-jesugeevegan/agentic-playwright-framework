---
name: playwright-pageobject-testing
description: Coding standard for tests and page objects in this repository - locator priority, page object structure, fixtures, assertions, and the anti-patterns that get a change rejected. Use before writing or reviewing any test code.
paths:
  - tests/**
  - src/**
  - docs/test-plans/**
---

# Page Object Testing Skill

## Outcome

Tests that read like the user's intent, break only when the product breaks, and can be extended
by someone who has never opened this repo before.

## Working order

Plan, then page object, then spec - a spec can't be written against a locator that doesn't exist
yet.

1. **Read the plan** (`docs/test-plans/<area>-test-plan.md`). No plan, no case.
2. **Decide the boundary.** One page object per URL-addressable page; shared chrome belongs in
   `BaseAppPage`, not copied into each page.
3. **Design the method, not the click.** Task-oriented names (`addToCart`), not mechanics
   (`clickAddButton`).
4. **Add the locator.** `readonly`, assigned in the constructor, semantic first, a CSS fallback
   only with an inline reason.
5. **Register the fixture** in `src/fixtures/page-object-fixtures.ts` - a page object without a
   fixture can't reach a spec.
6. **Write the case.** Given/When/Then via `test.step()`, the fixtures named in the test
   signature, the title in the user's language.
7. **Validate.** `pnpm validate`, then the single case, then the suite.

## Locator priority

1. `getByRole(role, { name })` - the default.
2. `getByLabel` - form controls with a real label.
3. `getByTestId` - the `data-qa` attribute, mapped via `testIdAttribute` in
   `playwright.config.ts`. First-class here, not a fallback, on any form that ships it (contact
   us, signup/login).
4. An application-owned id/class only when neither of the above exists, with an inline comment
   explaining why.
5. Never XPath.

## File naming

One spec file per path type, never mixed. A UI feature/page gets exactly two:

| File                            | Holds                           |
| ------------------------------- | ------------------------------- |
| `<area>-positive-paths.spec.ts` | The plan's `happy` cases        |
| `<area>-negative-paths.spec.ts` | The plan's `edge`/`error` cases |

An API feature/page (`api-tests/<area>/`) gets those same two plus a third:

| File                                     | Holds                                                             |
| ---------------------------------------- | ----------------------------------------------------------------- |
| `<area>-schema-validation-paths.spec.ts` | Different request-body shapes for a `POST`/`PUT`/`PATCH` endpoint |

`GET` and `DELETE` carry no request body, so they're exempt from the schema-validation file - a
`GET`/`DELETE` area still gets its positive and negative files, just not the third.

A case is placed by its plan `Type`, never by convenience: a `happy` case never lands in
`-negative-paths` because the file already exists and the other doesn't yet.

## Page object structure

```typescript
export class CartPage extends BaseAppPage {
  readonly emptyCartMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emptyCartMessage = page.locator('#empty_cart');
  }

  async open(): Promise<void> {
    await this.goto('/view_cart');
  }

  async isEmpty(): Promise<boolean> {
    return this.emptyCartMessage.isVisible();
  }
}
```

- Locators are `readonly`, assigned in the constructor. Never inline a locator in a spec.
- Method names describe the user's task, not the mechanics.
- **Page objects don't assert.** `expect()` lives in the spec (or, rarely, a setup script);
  a page object waits for readiness with `.waitFor()`, it doesn't judge the outcome.
- Export every class from `src/pages/index.ts`, and register it as a fixture in
  `src/fixtures/page-object-fixtures.ts`.

## Spec structure

```typescript
// spec: docs/test-plans/cart-test-plan.md
// file: tests/cart/cart-positive-paths.spec.ts
import { expect, test } from '../../src/fixtures/base-test';
import { KNOWN_PRODUCT } from '../../src/data/catalog';

test.describe('Cart', { tag: '@regression' }, () => {
  test('TC-09: Verify that the user sees the cart return to its empty state after removing the only item', async ({
    productDetailPage,
    cartPage,
  }) => {
    await test.step(`GIVEN product #${KNOWN_PRODUCT.id} was added to the cart`, async () => {
      // ...
    });

    await test.step('WHEN it is removed', async () => {
      await cartPage.removeFromCart(KNOWN_PRODUCT.id);
    });

    await test.step('THEN the cart reports empty again', async () => {
      await expect(cartPage.emptyCartMessage).toBeVisible();
    });
  });
});
```

- Import `test`/`expect` from `src/fixtures/base-test`, never from `@playwright/test` directly -
  that's how the ad-blocking network fixture and the page-object fixtures get injected.
- `test.describe` carries the one tag for every test inside it, inherited, not repeated per test.
- `test.step` marks distinct phases (Given/When/Then), not every single action.
- **Every title starts with `Verify that the user`** (`Verify that the API` for an `api-tests/`
  case), optionally prefixed with the plan's case ID - `'TC-09: Verify that ...'`. States the
  outcome as a claim, never the mechanism ("clicks the button", "calls the endpoint"). The
  mechanical hook (`.claude/scripts/enforce_constitution.py`) blocks anything else.

## Fixtures

| Fixture                                                                    | Provides                                                           |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `homePage`, `productsPage`, `productDetailPage`, `cartPage`, `contactPage` | One page object per surface, built only for the tests that name it |
| `page`                                                                     | Playwright's page, with ad-host requests aborted for every test    |

A new page object gets a fixture in the same change that adds the class.

## Assertions

- Web-first matchers only: `toBeVisible`, `toHaveText`, `toHaveURL`. They retry.
- Assert observable outcomes, not implementation.
- One scenario, one reason to fail.

## Anti-patterns

| Anti-pattern                                     | Why it's rejected                                                                              |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `waitForTimeout`                                 | Arbitrary, and hides the real race instead of fixing it                                        |
| Inline locator in a spec                         | The next locator change has to be made in N places                                             |
| `expect()` inside a page object                  | Couples "is the page ready" with "did the test pass"                                           |
| `new SomePage(page)` in a spec                   | The page object is a fixture; name it in the signature                                         |
| A test that only passes on retry                 | That's a failing test with extra steps                                                         |
| Tags scattered per-`test()`                      | One tag, on `describe`, inherited - see CLAUDE.md                                              |
| A `happy` and an `edge`/`error` case in one file | Each path type gets its own file - a mixed file hides which half of coverage you're looking at |
| A title that doesn't start with `Verify that`    | Breaks the scan-the-report convention every other spec follows                                 |

## Vendor documentation

- [Best practices](https://playwright.dev/docs/best-practices)
- [Locators](https://playwright.dev/docs/locators)
- [Fixtures](https://playwright.dev/docs/test-fixtures)
- [Page object model](https://playwright.dev/docs/pom)
