"""robots.txt parsing per RFC 9309: user-agent groups, case-insensitive product-token
matching, merged groups, longest-match precedence (Allow wins a tie), '*' and '$' patterns.
A missing robots.txt (4xx) allows everything; an unreachable one (5xx, network) is unknown."""

import re
from dataclasses import dataclass, field

_FIELD_RE = re.compile(r"^\s*([A-Za-z-]+)\s*:\s*(.*?)\s*$")


@dataclass
class RobotsGroup:
    agents: list = field(default_factory=list)
    rules: list = field(default_factory=list)  # [(allow: bool, pattern: str)]


def parse_robots(text):
    groups, current, in_agent_block = [], None, False
    for raw in (text or "").lstrip("﻿").splitlines():
        line = raw.split("#", 1)[0]
        m = _FIELD_RE.match(line)
        if not m:
            continue
        name, value = m.group(1).lower(), m.group(2)
        if name in ("user-agent", "useragent"):
            if current is None or not in_agent_block:
                current = RobotsGroup()
                groups.append(current)
            current.agents.append(value.strip().lower())
            in_agent_block = True
        elif name in ("allow", "disallow"):
            in_agent_block = False
            if current is not None and value:
                current.rules.append((name == "allow", value))
        # any other field (sitemap, crawl-delay, host) is ignored and does not end a group
    return groups


def _agent_matches(agent, token):
    return agent.split("/")[0].strip() == token.lower()


def rules_for(groups, token):
    """(has its own group, rules that apply) for a crawler token."""
    specific = [g for g in groups if any(_agent_matches(a, token) for a in g.agents)]
    if specific:
        return True, [r for g in specific for r in g.rules]
    wildcard = [g for g in groups if any(a.strip() == "*" for a in g.agents)]
    return False, [r for g in wildcard for r in g.rules]


def _pattern_regex(pattern):
    anchored = pattern.endswith("$")
    body = pattern[:-1] if anchored else pattern
    return re.compile("".join(".*" if ch == "*" else re.escape(ch) for ch in body) + ("$" if anchored else ""))


def is_allowed(rules, path):
    path = path if path.startswith("/") else "/" + path
    if path == "/robots.txt":
        return True
    best_len, best_allow = -1, True
    for allow, pattern in rules:
        if _pattern_regex(pattern).match(path):
            length = len(pattern)
            if length > best_len or (length == best_len and allow):
                best_len, best_allow = length, allow
    return best_allow


def evaluate_bot(groups, token, paths=()):
    """status: allowed | blocked | not mentioned (does robots.txt name this crawler?)
    effective: allowed | blocked | partial (what actually applies, '*' included)."""
    specific, rules = rules_for(groups, token)
    root_ok = is_allowed(rules, "/")
    blocked_paths = [p for p in paths if not is_allowed(rules, p)]
    if not root_ok:
        effective = "blocked"
    elif blocked_paths:
        effective = "partial"
    else:
        effective = "allowed"
    if specific:
        status = "blocked" if effective == "blocked" else "allowed"
    else:
        status = "not mentioned"
    if effective == "blocked":
        detail = "the whole site is disallowed" + ("" if specific else " (by the rules for all crawlers)")
    elif effective == "partial":
        detail = "vehicle pages checked are disallowed: " + ", ".join(blocked_paths[:3])
    else:
        detail = "allowed" + ("" if specific else " (falls under the rules for all crawlers)")
    return {"status": status, "effective": effective, "detail": detail, "blocked_paths": blocked_paths}
