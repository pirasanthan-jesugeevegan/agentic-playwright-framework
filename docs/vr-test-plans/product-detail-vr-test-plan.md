# Product Detail Visual Regression Test Plan

Spec file: `tests/vr/product-detail.vr.spec.ts`.

## Scope

The product information panel's default layout, and the confirmation dialog that appears on
add-to-cart. Both are places a CSS regression (broken image aspect ratio, a modal that no longer
centers, an overflowing price) would slip past the functional suite, which only checks that the
right elements are present and clickable, never how they're laid out.

## Preconditions

A fresh, unauthenticated browser context, `KNOWN_PRODUCT` from `src/data/catalog.ts`.

## Cases

| ID    | Screenshot                    | State captured                                    |
| ----- | ----------------------------- | ------------------------------------------------- |
| VR-04 | `product-detail-info-default` | The product information panel, no interaction yet |
| VR-05 | `product-detail-cart-modal`   | The add-to-cart confirmation dialog, open         |

## Notes

Both capture `.modal-content` / `.product-information` directly rather than the page or the
`#cartModal` wrapper: `#cartModal` itself is a full-viewport overlay element (confirmed live at
1009x768), so screenshotting it would produce a full-page shot with a lot of empty backdrop
around the one thing that's actually meaningful.

## Out of Scope

- The quantity input at a non-default value - a functional concern (TC-06/TC-07), not a visual
  one; the input doesn't render differently at 0 vs. 1 vs. 3
- "Continue Shopping" as a separate state - same modal, same layout, no visual difference from
  VR-05
