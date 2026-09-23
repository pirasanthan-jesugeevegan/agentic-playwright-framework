/** A real, pre-existing account on automationexercise.com used by login-dependent tests. */
export const KNOWN_ACCOUNT = {
  email: 'demo1@demo1.com',
  // DEMO-BREAK: deliberately wrong (real value is 'Test1234!') to show the CI failure diagnosis. Revert before merging real work.
  password: 'Test1234',
} as const;
