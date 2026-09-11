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


def describe_missing_tag(content):
    for line in content.splitlines():
        if re.search(r"test\.describe\(", line) and "tag:" not in line:
            return True
    return False


# Each rule: (path_pattern, check(content) -> bool, message)
RULES = [
    (
        r"^(src|tests)/.*\.tsx?$",
        lambda c: "waitForTimeout(" in c,
        "waitForTimeout() is a hard wait - use a web-first assertion, "
        ".waitFor(), or fix the real race instead.",
    ),
    (
        r"^(src|tests)/.*\.tsx?$",
        lambda c: bool(re.search(r"""xpath=|locator\(\s*['"`]//""", c)),
        "XPath locator - use getByRole/getByTestId, or a documented CSS "
        "fallback if neither exists on the element.",
    ),
    (
        r"^src/pages/.*\.tsx?$",
        lambda c: bool(re.search(r"\bexpect\(", c)),
        "Page objects don't assert - expose the locator/action and let "
        "the spec (or setup script) hold the expect().",
    ),
    (
        r"^tests/.*\.spec\.tsx?$",
        describe_missing_tag,
        "test.describe(...) needs a tag: ('@smoke' or '@regression') "
        "inline, inherited by every test inside it.",
    ),
    (
        r"^tests/.*\.spec\.tsx?$",
        lambda c: bool(
            re.search(r"""from\s+['"]@playwright/test['"]""", c)
        ),
        "Specs import test/expect from src/fixtures/base-test, not "
        "@playwright/test directly - that's how page-object fixtures "
        "get injected.",
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
        if re.search(path_pattern, rel_path) and check(content):
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
