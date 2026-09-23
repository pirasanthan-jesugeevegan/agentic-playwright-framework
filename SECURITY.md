# Security Policy

## Scope

This repository is a test suite that runs against the public demo site
[automationexercise.com](https://automationexercise.com). It holds no production data and no
real credentials. The CI pipeline uses one repository secret (`ANTHROPIC_API_KEY`, for the failure
diagnosis step) and the default `GITHUB_TOKEN`.

## Reporting a vulnerability

Please do not open a public issue. Use GitHub's private reporting instead: **Security tab →
Report a vulnerability** on this repository.

Things worth reporting: a leaked secret or token in the history, a workflow that can be made to
run untrusted input, or a dependency with a known exploitable vulnerability that Dependabot has
not already raised.

## What is not in scope

Vulnerabilities in automationexercise.com itself. That site belongs to its owners; report it to
them, not here.
