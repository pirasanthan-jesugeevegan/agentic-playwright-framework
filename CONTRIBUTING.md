# Contributing

This suite is written and maintained by an AI coding agent working under the rules in
[`CLAUDE.md`](CLAUDE.md), and a human reviews and commits every change. Human contributions follow
the same rules.

## Setup

```sh
nvm use            # Node 22, from .nvmrc
pnpm install       # pnpm only; pnpm-lock.yaml is the single lockfile
cp .env.example .env
pnpm exec playwright install --with-deps
```

## Before opening a PR

```sh
pnpm validate        # lint + format check + typecheck
pnpm test:scripts    # unit tests for the CI scripts
pnpm check:status    # docs/STATUS.md counts match the specs
pnpm exec playwright test <the spec you touched>
```

## Ground rules

- **Plan before code.** A new case needs an entry in the area's plan under `docs/`, and
  `docs/STATUS.md` must be updated. Each suite has a hard cap, so a new case normally replaces an
  existing one.
- **Follow the coding standards** in `CLAUDE.md`. The mechanical ones (no hard waits, no XPath,
  no `expect()` in page objects, tagged `describe`, title format, fixture imports) are ESLint
  errors, so `pnpm validate` catches them.
- **Locators are verified against the live DOM** before they are written, not assumed.
- **A flaky test is a defect.** Do not add retries, longer timeouts or looser assertions; find the
  cause. See "Flaky-test discipline" in `CLAUDE.md`.
- **Conventional commits** (`fix:`, `feat:`, `docs:`, `ci:`, `refactor:`, `chore:`). Never commit
  secrets or `.env*` files.

## Reporting problems

Use the issue templates. For anything security-related, see [`SECURITY.md`](SECURITY.md).
