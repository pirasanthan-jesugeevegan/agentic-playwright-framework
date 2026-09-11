/**
 * A slice of the demo store's real catalog, captured by hand on
 * 2026-09-11 against https://automationexercise.com/products. This is a
 * seed catalog, not a live one: if the demo site's data changes, these
 * cases will fail honestly rather than silently testing the wrong
 * product - that's a signal to re-capture this file, not to loosen an
 * assertion.
 */
export const KNOWN_PRODUCT = {
  id: 1,
  name: 'Blue Top',
  price: 'Rs. 500',
} as const;

/** A generic term guaranteed to match more than one product without
 * depending on the exact catalog count, which does drift over time. */
export const SEARCH_TERM = 'Top';
