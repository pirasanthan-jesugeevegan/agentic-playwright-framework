---
name: playwright-visual-regression
description: Create and maintain visual regression tests - what to screenshot, how to stabilize state first, threshold selection, masking third-party noise, and baseline management. Use when adding VR coverage or diagnosing a flaky screenshot.
paths:
  - tests/vr/**
  - docs/vr-test-plans/**
---

# Visual Regression Skill

## Outcome

Screenshots that fail when the site's appearance changes and at no other time. A VR suite that
cries wolf gets ignored, which is worse than having none.

## This suite does not exist yet

`tests/vr/` and `docs/vr-test-plans/` are not created until the first case is planned. This
skill documents the standard the first case is built against, the same way
`playwright-pageobject-testing` was written to match the functional suite's already-working
conventions. `pnpm test:vr` and its Docker/update variants below are planned script names -
add them to `package.json` when the suite's own Playwright project is wired into
`src/config/projects.ts`, not before.

## Repository Conventions

| Path                                    | Purpose                                               |
| --------------------------------------- | ----------------------------------------------------- |
| `tests/vr/`                             | VR spec files, one per feature area                   |
| `tests/vr/<name>.vr.spec.ts-snapshots/` | Baseline PNGs, created by Playwright next to the spec |
| `docs/vr-test-plans/`                   | VR test plans                                         |

| Item       | Pattern              | Example           |
| ---------- | -------------------- | ----------------- |
| Spec file  | `<area>.vr.spec.ts`  | `cart.vr.spec.ts` |
| Screenshot | `<area>-<state>.png` | `cart-empty.png`  |

Playwright appends the platform suffix (`-chromium-linux.png`) itself. Baselines are generated
on Linux to match CI - the same CI that already runs this repo's functional suite. A baseline
captured on macOS will not match and must not be committed.

## Plan shape

`docs/vr-test-plans/` follows [references/vr-plan-template.md](references/vr-plan-template.md).

## Before adding a capture

Four questions, and a no to any of them means the case does not exist. Answer the first and the
third by **taking one throwaway capture and looking at it**, never by reasoning about what the
browser probably does: a native validation bubble, for instance, does appear in a Playwright
screenshot and does persist, which is the opposite of what most people assume.

1. Is this state **visually distinct** from one already captured, or does it merely repeat it?
2. Does the region **fit the viewport**, or does it need anchoring to a heading?
3. What **varies per run** in it, so it can be masked instead of tolerated by a threshold?
4. Does it carry any **third-party slot** (this app serves Google AdSense - see
   `CLAUDE.md`'s flaky-test discipline), in which case it is not capturable here at all?

## Config that a capture depends on

| Setting                     | Value                                                             |
| --------------------------- | ----------------------------------------------------------------- |
| Default `maxDiffPixelRatio` | `0.01`, set globally in `expect.toHaveScreenshot`                 |
| `animations`                | `disabled`, also global                                           |
| Viewport                    | 1920x1080, matching `playwright.config.ts`'s existing `use` block |
| Project                     | `visual-regression`, Chromium only, `testDir: './tests/vr'`       |
| Baselines                   | `tests/vr/<area>.vr.spec.ts-snapshots/`, Linux                    |

## Spec Structure

```typescript
// spec: docs/vr-test-plans/cart-vr-test-plan.md
import { expect, test } from '../../src/fixtures/pom/test-options';

test.describe('Visual regression - cart', { tag: '@regression' }, () => {
  test.beforeEach(async ({ cartPage }) => {
    await cartPage.open();
  });

  test('VR-01: Verify that the user sees the empty cart state rendered correctly', async ({
    cartPage,
  }) => {
    await expect(cartPage.emptyCartMessage).toBeVisible();

    await expect(cartPage.cartTable).toHaveScreenshot('cart-empty.png');
  });
});
```

Fixtures, tagging, and the rest of the coding standard are in
`.claude/skills/playwright-pageobject-testing/SKILL.md`. What follows here is only what is
specific to a screenshot.

## What To Screenshot

**Do:** the states a component actually renders differently - default, empty, error, success,
and signed-in against signed-out, plus an open modal and a form's layout. An error state
qualifies even though it carries text: what breaks there is the banner's colour, its placement
and the reflow it causes, and no assertion notices any of that.

**Do not:** every data permutation, a change of wording in the same rendered state, hover states
(cursor position varies), or anything containing an AdSense slot.

The test is whether the **rendering** differs, not whether the **text** does. A products grid
that draws the same layout with different items is one state; a grid that turns into an empty
result block is another.

## The VR / E2E Boundary

| Question              | Where it belongs |
| --------------------- | ---------------- |
| Does it look right?   | VR test          |
| Does it work?         | Functional E2E   |
| Is the label correct? | Functional E2E   |

A VR test contains the minimum interaction needed to reach the state, then one screenshot. If a
VR test has five assertions, it is a functional test wearing a costume.

## State Preparation

Screenshots are only meaningful once the UI has settled:

```typescript
await productsPage.open();
await expect(productsPage.productGrid).toBeVisible();
await productsPage.productGrid.scrollIntoViewIfNeeded();

await expect(productsPage.productGrid).toHaveScreenshot(
  'products-grid-default.png',
);
```

1. Navigate.
2. Wait for the target to be **visible**: never screenshot on hope.
3. Scroll into view if the element lazy-loads.
4. Reach the target state through the page object.
5. Capture.

`animations: 'disabled'` is set globally in `playwright.config.ts`, same as the functional
project.

## Element vs Page Screenshots

Prefer element-level captures. They isolate the component from page chrome and, critically on
this site, from the AdSense iframes that inject at unpredictable offsets - the same ads that
already caused four real CI failures in the functional suite (see `CLAUDE.md`).

```typescript
// Preferred, scoped to the component
await expect(cartPage.cartTable).toHaveScreenshot('cart-with-single-item.png');

// Only when the visual genuinely spans the viewport (modal over the page)
await expect(page).toHaveScreenshot('product-detail-cart-modal.png', {
  maxDiffPixelRatio: 0.03,
});
```

## Thresholds

| Content                        | `maxDiffPixelRatio` | Why                                 |
| ------------------------------ | ------------------- | ----------------------------------- |
| Static layout, no images       | `0.01` (default)    | Any change is meaningful            |
| Layout with text               | `0.01`-`0.03`       | Font rendering varies slightly      |
| Product images                 | `0.05`-`0.08`       | Image decoding and compression vary |
| Full-page with dynamic regions | `0.03`              | Surrounding content adds noise      |

Start at the default. Raise only after a test has actually proven flaky, and document why
inline:

```typescript
await expect(productCard).toHaveScreenshot('products-card-default.png', {
  maxDiffPixelRatio: 0.06, // VR: product imagery is served with varying compression
});
```

## Masking Third-Party Noise

This app serves Google AdSense (`doubleclick.net`, `googlesyndication.com`,
`googleadservices.com` - already blocked at the network layer for the functional suite via
`blockAds()` in `src/fixtures/framework-fixtures.ts`). The VR project should reuse the same
fixture rather than re-solve this: an ad slot that never loads doesn't need masking. Mask only
what genuinely varies for reasons other than ads:

```typescript
await expect(page).toHaveScreenshot('home-hero.png', {
  mask: [page.locator('.carousel')],
});
```

If an ad iframe appears in a diff anyway, the bug is in the shared fixture not being applied to
the VR project, not something to patch per-test.

## Baseline Management

```bash
pnpm test:vr            # run against committed baselines (add this script when the suite exists)
pnpm test:vr:update     # regenerate - only run in the Linux CI image, never on macOS
```

Baselines are Chromium on Linux. A set written on a Mac will not match CI and must not be
committed - regenerate through a `workflow_dispatch` CI job with a mandatory reason, the same
way the functional suite's `publish-report` job already runs in GitHub Actions.

- Baselines are committed. They are the reference the suite is judged against.
- Update them only when the visual change is intentional **and verified**: look at the diff
  image in the HTML report before regenerating.
- After regenerating, review `git diff --stat`. Only the files you expected should have changed.
  A surprise baseline change is a finding.
- Delete orphaned baselines when a test is renamed or removed.

## Size Rule

No baseline may be taller than the viewport. A capture a reviewer cannot scan in one screen is
not a regression check - a diff in it gets approved without being read, which is worse than no
test. When a region is genuinely larger than the viewport, anchor its heading and capture the
viewport instead, or scope the capture to the repeating component.

## Page objects are shared

Both suites use the same page objects in `src/pages/`, and that is the point: a capture often
needs an element no functional case ever had a reason to address, most often a wrapper that
gives the shot its frame. **Add it to the shared page object like any other locator.** A locator
used by one visual case and no functional case is normal and correct.

What is forbidden is a parallel structure: a VR-only page object class beside the real one, a
locator written inline in a `.vr.spec.ts`, or a second name for an element the page object
already exposes. The class is shared; which suite happens to use a given member is not a
property of it.

## Vendor documentation

- [Visual comparisons](https://playwright.dev/docs/test-snapshots)
- [`toHaveScreenshot` on a page](https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-screenshot-2)
- [`toHaveScreenshot` on a locator](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-screenshot-2)
- [`snapshotPathTemplate`](https://playwright.dev/docs/api/class-testconfig#test-config-snapshot-path-template)

## Anti-Patterns

- Screenshotting without a preceding visibility assertion
- Raising a threshold above `0.08` to silence a diff instead of investigating it
- Committing a baseline generated on a developer machine rather than the CI platform
- Full-page screenshots of a component that fits in a box
- Updating baselines as a reflex when CI goes red
