# Products Visual Regression Test Plan

Spec file: `tests/vr/products.vr.spec.ts`.

## Scope

The two states a product card actually renders differently in: its default appearance, and the
grid with none in it. A layout regression in the card (broken image sizing, a misplaced price)
or a regression that makes the empty state look wrong (e.g. a stray "no results" banner
appearing where none exists today) would both pass every functional assertion in
`products-test-plan.md` without being caught.

## Preconditions

A fresh, unauthenticated browser context.

## Cases

| ID    | Screenshot              | State captured                                   |
| ----- | ----------------------- | ------------------------------------------------ |
| VR-02 | `products-card-default` | The first product card on the unfiltered listing |
| VR-03 | `products-grid-empty`   | The grid after a search matching zero products   |

## Notes

- VR-02 captures one card (`.product-image-wrapper`), not the grid (`.features_items`): the real
  grid renders 34 cards today at roughly 7100px tall, far past the "no baseline taller than the
  viewport" rule. A single card is the repeating unit; that's what a layout regression would
  actually break.
- VR-03 captures the grid container itself: with zero cards it's only the heading, comfortably
  inside the viewport, and it's the one state where the _whole_ grid is small enough to be one
  meaningful shot.

## Out of Scope

- The full populated grid - too tall to capture as a whole; the per-card state is what matters
- A search returning a subset of cards - visually the same rendering as the default listing,
  just fewer repetitions of the same card already covered by VR-02
