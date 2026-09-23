---
description: Audit test code against the repository conventions
argument-hint:
  [file or directory, defaults to everything changed on this branch]
allowed-tools: Task, Read, Grep, Glob, Bash
---

Delegate to the **playwright-test-reviewer** agent. It is read-only: it reports, it does not fix.

File set to audit: $ARGUMENTS

If no file set is given, audit everything changed on this branch. Resolve the default branch
instead of assuming its name, and diff against the merge-base (three dots):

```bash
BASE=$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's#^origin/##')
git diff --name-only "${BASE:-master}"...HEAD
```

If that is empty (you are on the default branch), audit the uncommitted changes instead
(`git diff --name-only HEAD`). If that is empty too, ask which files to audit.

The reviewer must work through its full checklist and additionally flag assertions that would
still pass if the site were broken. Findings come back as a table with file, line, severity, and
the fix. Blockers first. Clean files are named as clean.
