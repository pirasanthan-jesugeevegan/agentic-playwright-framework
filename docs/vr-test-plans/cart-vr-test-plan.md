# Cart Visual Regression Test Plan

Spec file: `tests/vr/cart.vr.spec.ts`.

## Scope

The three states the cart page actually renders as different layouts: empty, holding an item,
and the anonymous-checkout guard. Each replaces a different region of the page with different
markup entirely (a message, a table, a modal) - not a case of the same layout with different
text, which is what the "one state, one capture" rule is guarding against.

## Preconditions

Seed: `tests/ui/smoke/smoke-positive-paths.spec.ts`. A fresh, unauthenticated browser context for
every case - each test in this file reaches its own starting state independently rather than
depending on suite order, the same discipline `cart-test-plan.md` already documents for the
functional suite.

## Cases

| ID    | Screenshot              | State captured                                         |
| ----- | ----------------------- | ------------------------------------------------------ |
| VR-06 | `cart-empty`            | The empty-cart message, nothing ever added             |
| VR-07 | `cart-with-single-item` | The cart table with one product in it                  |
| VR-08 | `cart-checkout-guard`   | The anonymous-checkout guard dialog (`#checkoutModal`) |

## Notes

VR-07 raises `maxDiffPixelRatio` to `0.06`: the row includes the product's own image, and image
compression/decoding varies slightly run to run, same as `products-card-default` would if it
included imagery at a similarly small scale.

## Out of Scope

- Multiple items in the cart at once - same table markup repeated, not a new layout
- The guard dialog dismissed back to the cart - identical to VR-07, nothing new rendered
