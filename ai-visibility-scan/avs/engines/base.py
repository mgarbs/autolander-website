"""Shared engine interface: one question in, one Answer out, never an exception."""

import re
import threading
import time

from ..config import ENGINES, PRICING
from ..http import HttpError
from ..matching import normalize_url
from ..models import Answer, Citation


def price_model_id(engine, model):
    """The PRICING key for a model id, tolerating dated snapshots; None if unpriced."""
    models = PRICING[engine]["models"]
    if model in models:
        return model
    base = re.sub(r"-\d{4}-\d{2}-\d{2}$", "", model or "")
    base = re.sub(r"-\d{8}$", "", base)
    return base if base in models else None


def estimate_cost(engine, model, input_tokens=0, cached_input_tokens=0, output_tokens=0, searches=0):
    pid = price_model_id(engine, model)
    if pid is None:
        return None
    table = PRICING[engine]
    price = table["models"][pid]
    uncached = max(0, input_tokens - cached_input_tokens)
    cost = (
        uncached * price["input"] / 1e6
        + cached_input_tokens * price.get("cached_input", price["input"]) / 1e6
        + output_tokens * price["output"] / 1e6
        + searches * table["per_search"]
    )
    return round(cost, 6)


def make_usage(engine, model, input_tokens=0, cached_input_tokens=0, output_tokens=0, searches=0, api_cost=None, source=None):
    input_tokens, cached_input_tokens, output_tokens = int(input_tokens or 0), int(cached_input_tokens or 0), int(output_tokens or 0)
    estimate = estimate_cost(engine, model, input_tokens, cached_input_tokens, output_tokens, searches)
    if api_cost is not None:
        cost, how = round(float(api_cost), 6), "api"
    elif estimate is not None:
        cost, how = estimate, "estimated"
    else:
        cost, how = None, "unpriced (add the model to config.PRICING)"
    return {
        "input_tokens": input_tokens,
        "cached_input_tokens": cached_input_tokens,
        "output_tokens": output_tokens,
        "searches": searches,
        "cost_usd": cost,
        "cost_source": source or how,
    }


def approx_location(dealer, with_type=True, with_timezone=True):
    loc = {"type": "approximate"} if with_type else {}
    loc["city"] = dealer.city
    if dealer.state_name:
        loc["region"] = dealer.state_name
    loc["country"] = "US"
    if with_timezone and dealer.timezone:
        loc["timezone"] = dealer.timezone
    return loc


def citation(url, title=""):
    return Citation(url=str(url or "").strip(), title=str(title or "").strip())


def dedupe_citations(cites):
    seen, out = set(), []
    for c in cites:
        key = normalize_url(c.url).rstrip("/")
        if c.url and key not in seen:
            seen.add(key)
            out.append(c)
    return out


class Engine:
    name = ""
    mock = False

    def __init__(self, model=None, key=None, http=None, settings=None, redact=None):
        self.cfg = ENGINES[self.name]
        self.label = self.cfg["label"]
        self.model = model or self.cfg["default_model"]
        self._key = key
        self.http = http
        self.settings = settings or {}
        self.redact = redact or (lambda s: s)
        self.disabled_reason = None
        self._lock = threading.Lock()

    def __repr__(self):  # never includes the key
        return f"<{type(self).__name__} model={self.model!r}>"

    @property
    def priced_as(self):
        return self.model

    def ask(self, question, dealer, run):
        if self.disabled_reason:
            return Answer(self.name, self.model, question.id, run, error=self.disabled_reason)
        started = time.monotonic()
        try:
            answer = self._ask(question, dealer, run)
        except HttpError as exc:
            if exc.status in (401, 403, 404):
                why = "refused the API key" if exc.status in (401, 403) else "could not find the model or endpoint"
                with self._lock:
                    self.disabled_reason = (
                        f"{self.label} {why} (HTTP {exc.status}); the remaining questions for this engine were skipped"
                    )
            answer = Answer(self.name, self.model, question.id, run, error=self.redact(str(exc)))
        except Exception as exc:  # a parsing surprise must not stop the whole scan
            answer = Answer(self.name, self.model, question.id, run, error=self.redact(f"{type(exc).__name__}: {exc}"))
        answer.latency_s = round(time.monotonic() - started, 3)
        return answer

    def _ask(self, question, dealer, run):  # pragma: no cover - implemented by subclasses
        raise NotImplementedError
