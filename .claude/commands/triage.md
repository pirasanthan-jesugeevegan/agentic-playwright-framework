---
description: Read the last red pipeline run and separate an infrastructure failure from a test failure
argument-hint: [run id, defaults to the latest failed run on this branch]
allowed-tools: Task, Read, Grep, Glob, Bash(gh run *), Bash(gh pr checks *)
---

Delegate to the **playwright-test-manager** agent, workflow W3 (Red run).

Run: $ARGUMENTS

Read the actual error first - the Allure report, `error-context.md`, or the CI job log - never
guess from a test name. Name the job and the failing step. A setup, install, or `publish-report`
step (GitHub Pages, permissions) is infrastructure and gets fixed in the workflow file directly;
only a failing test step goes to the healer via W3.

Report: job, step, first error line, classification, and the fix you propose. Never re-run a job
without a hypothesis for why the second attempt would differ.
