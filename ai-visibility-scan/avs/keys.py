"""API keys and model settings.

Keys are read from the process environment first, then from a .env file in this tool's
folder, then from _local_tools/cli/.env. Only the names in SETTING_NAMES are read from a
file; every other line stays untouched in memory. Values are never printed: callers get
the value plus the *name* of where it came from.
"""

import os
import re
from pathlib import Path

from dotenv import dotenv_values

KEY_NAMES = ("OPENAI_API_KEY", "PERPLEXITY_API_KEY", "ANTHROPIC_API_KEY")
SETTING_NAMES = KEY_NAMES + (
    "OPENAI_MODEL",
    "OPENAI_REASONING_EFFORT",
    "PERPLEXITY_MODEL",
    "PERPLEXITY_PRESET",
    "ANTHROPIC_MODEL",
)
TOOL_DIR = Path(__file__).resolve().parents[1]


def default_env_files():
    return [TOOL_DIR / ".env", TOOL_DIR.parent / "cli" / ".env"]


def load_settings(env_files=None, environ=None):
    """Return (settings, sources). sources maps a setting name to where it was found."""
    environ = os.environ if environ is None else environ
    files = default_env_files() if env_files is None else [Path(p) for p in env_files]
    settings, sources = {}, {}
    for name in SETTING_NAMES:
        value = (environ.get(name) or "").strip()
        if value:
            settings[name], sources[name] = value, "environment"
    for path in files:
        if not path.is_file():
            continue
        try:
            values = dotenv_values(path)
        except Exception:  # an unreadable .env must not stop a mock run
            continue
        for name in SETTING_NAMES:
            if name in settings:
                continue
            value = (values.get(name) or "").strip()
            if value:
                settings[name], sources[name] = value, str(path)
    return settings, sources


# Shapes of common API keys, masked in error messages even if a value slipped past.
_KEY_SHAPES = [
    re.compile(r"(?<![A-Za-z0-9])sk-(?:proj-|ant-(?:api\d+-)?)?[A-Za-z0-9_\-]{16,}"),
    re.compile(r"(?<![A-Za-z0-9])pplx-[A-Za-z0-9_\-]{16,}"),
    re.compile(r"(?i)(bearer\s+)[A-Za-z0-9._\-]{16,}"),
]


class Redactor:
    """Replaces known secret values (and key-shaped strings, in messages) with [REDACTED]."""

    def __init__(self, secrets=()):
        self.secrets = sorted({s for s in secrets if s and len(s) >= 6}, key=len, reverse=True)

    def values(self, text):
        """Exact-value replacement only (safe for whole output files)."""
        if not text:
            return text
        out = str(text)
        for secret in self.secrets:
            out = out.replace(secret, "[REDACTED]")
        return out

    def __call__(self, text):
        """For error messages: exact values plus anything shaped like an API key."""
        out = self.values(text)
        if not out:
            return out
        for shape in _KEY_SHAPES:
            out = shape.sub(lambda m: (m.group(1) if m.lastindex else "") + "[REDACTED]", out)
        return out

    def leaks(self, text):
        return any(secret in str(text) for secret in self.secrets)
