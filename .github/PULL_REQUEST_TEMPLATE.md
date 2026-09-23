## What

<!-- One or two sentences: what does this change? -->

## Why

<!-- The problem or motivation. Link the issue if there is one: Fixes #123 -->

## Checklist

- [ ] `pnpm validate` is clean (lint + format + typecheck)
- [ ] `pnpm test:scripts` and `pnpm check:status` pass
- [ ] Affected tests run green locally (`pnpm exec playwright test <file>`)
- [ ] New or changed cases have a plan in `docs/` and `docs/STATUS.md` is updated (counts and cap)
- [ ] No secrets, no `.env*` files, no hard waits, no XPath
