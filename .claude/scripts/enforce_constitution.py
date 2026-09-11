#!/usr/bin/env python3
"""PreToolUse hook: blocks a small set of mechanically-detectable
violations of CLAUDE.md before a Write/Edit/MultiEdit lands, so the
constitution is a hard backstop and not just a prompt asked nicely.

Wired in .claude/settings.json against Write|Edit|MultiEdit. Claude Code
pipes the tool-call payload to this script's stdin; exit 0 allows the
write, exit 2 blocks it and shows the agent this script's stderr.

Deliberately dumb: no AI call, no parsing the file as TypeScript - each
rule is a plain string/regex check against only the content being added
(never the whole file, and never content that was only removed), gated
to the paths it actually applies to. A grep-equivalent, on purpose: zero
false positives from a rule matter more here than catching everything.
"""

import json
import re
import sys


def added_content(tool_name, tool_input):
    """Text this call would newly introduce - not the whole file, and
    not text being deleted, so a fix that *removes* a violation (like
    the login-page.ts expect() call this hook exists because of) never
    gets flagged for the very violation it's fixing."""
    if tool_name == "Write":
        return tool_input.get("content", "")
    if tool_name == "Edit":
        return tool_input.get("new_string", "")
    if tool_name == "MultiEdit":
        edits = tool_input.get("edits", [])
        return "\n".join(e.get("new_string", "") for e in edits)
    return ""


def describe_missing_tag(content, rel_path):
    for line in content.splitlines():
        if re.search(r"test\.describe\(", line) and "tag:" not in line:
            return True
    return False


def bad_spec_titles(content, rel_path):
    """Every top-level test() title must open with 'Verify that', an
    optional 'TC-09: ' / 'VR-01: ' plan-case-id prefix allowed in front
    of it. Matches only a bare test( call - test.step(/test.describe(/
    test.beforeEach( all have a '.' right after 'test' so \\btest\\(
    doesn't match them."""
    for m in re.finditer(r"\btest\(\s*['\"`]([^'\"`]*)", content):
        title = m.group(1)
        if title and not re.match(r"^(?:[A-Za-z]{2,}-\d+:\s*)?Verify that", title):
            return True
    return False


def bad_ui_spec_name(content, rel_path):
    return not re.search(r"-(positive|negative)-paths\.spec\.tsx?$", rel_path)


def bad_api_spec_name(content, rel_path):
    return not re.search(
        r"-(positive|negative|schema-validation)-paths\.spec\.tsx?$", rel_path
    )


# Each rule: (path_pattern, check(content, rel_path) -> bool, message)
RULES = [
    (
        r"^(src|tests|api-tests)/.*\.tsx?$",
        lambda c, p: "waitForTimeout(" in c,
        "waitForTimeout() is a hard wait - use a web-first assertion, "
        ".waitFor(), or fix the real race instead.",
    ),
    (
        r"^(src|tests|api-tests)/.*\.tsx?$",
        lambda c, p: bool(re.search(r"""xpath=|locator\(\s*['"`]//""", c)),
        "XPath locator - use getByRole/getByTestId, or a documented CSS "
        "fallback if neither exists on the element.",
    ),
    (
        r"^src/pages/.*\.tsx?$",
        lambda c, p: bool(re.search(r"\bexpect\(", c)),
        "Page objects don't assert - expose the locator/action and let "
        "the spec (or setup script) hold the expect().",
    ),
    (
        r"^(tests|api-tests)/.*\.spec\.tsx?$",
        describe_missing_tag,
        "test.describe(...) needs a tag: ('@smoke' or '@regression') "
        "inline, inherited by every test inside it.",
    ),
    (
        r"^(tests|api-tests)/.*\.spec\.tsx?$",
        lambda c, p: bool(re.search(r"""from\s+['"]@playwright/test['"]""", c)),
        "Specs import test/expect from src/fixtures/base-test, not "
        "@playwright/test directly - that's how page-object fixtures "
        "get injected.",
    ),
    (
        r"^tests/.*\.spec\.tsx?$",
        bad_ui_spec_name,
        "UI spec files must be named <area>-positive-paths.spec.ts or "
        "<area>-negative-paths.spec.ts - one file per path, never mixed.",
    ),
    (
        r"^api-tests/.*\.spec\.tsx?$",
        bad_api_spec_name,
        "API spec files must be named <area>-positive-paths.spec.ts, "
        "<area>-negative-paths.spec.ts, or (except GET/DELETE, which carry "
        "no body) <area>-schema-validation-paths.spec.ts.",
    ),
    (
        r"^(tests|api-tests)/.*\.spec\.tsx?$",
        bad_spec_titles,
        "Every test() title must start with \"Verify that the user\" (or "
        "\"Verify that the API\" for an API-only case) - optionally "
        "prefixed with the plan's case ID, e.g. 'TC-09: Verify that ...'.",
    ),
]


def main():
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return 0  # can't parse the call - fail open, don't block on our own bug

    tool_name = payload.get("tool_name", "")
    tool_input = payload.get("tool_input", {})
    file_path = tool_input.get("file_path", "")

    if tool_name not in ("Write", "Edit", "MultiEdit"):
        return 0

    # Normalise to a repo-relative path for the rule patterns above.
    rel_path = file_path
    marker = "agentic-playwright-framework/"
    if marker in rel_path:
        rel_path = rel_path.split(marker, 1)[1]

    content = added_content(tool_name, tool_input)
    if not content:
        return 0

    violations = []
    for path_pattern, check, message in RULES:
        if re.search(path_pattern, rel_path) and check(content, rel_path):
            violations.append(message)

    if violations:
        sys.stderr.write(
            f"BLOCKED by Constitution enforcement hook ({rel_path}):\n"
        )
        for v in violations:
            sys.stderr.write(f"  - {v}\n")
        return 2

    return 0


if __name__ == "__main__":
    sys.exit(main())
