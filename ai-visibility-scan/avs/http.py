"""JSON POST with timeouts and retries (exponential backoff with jitter, Retry-After aware).

Request headers are never logged or put into error messages; error text is passed
through the redactor before it leaves this module.
"""

import json
import random
import threading
import time

import requests

from . import config


class HttpError(Exception):
    def __init__(self, message, status=None, retryable=False):
        super().__init__(message)
        self.status = status
        self.retryable = retryable


class HttpClient:
    def __init__(self, redact=None, session_factory=None, sleep=time.sleep, rng=None, **overrides):
        opts = dict(config.HTTP, **overrides)
        self.connect_timeout = opts["connect_timeout"]
        self.read_timeout = opts["read_timeout"]
        self.max_retries = opts["max_retries"]
        self.backoff_base = opts["backoff_base"]
        self.backoff_max = opts["backoff_max"]
        self.retry_statuses = set(opts["retry_statuses"])
        self.redact = redact or (lambda s: s)
        self.session_factory = session_factory or requests.Session
        self.sleep = sleep
        self.rng = rng or random.Random()
        self._local = threading.local()

    def _session(self):
        session = getattr(self._local, "session", None)
        if session is None:
            session = self._local.session = self.session_factory()
        return session

    def post_json(self, url, headers, payload):
        """Return (parsed JSON, retries used). Raises HttpError on failure."""
        attempt = 0
        while True:
            try:
                resp = self._session().post(
                    url, headers=headers, json=payload, timeout=(self.connect_timeout, self.read_timeout)
                )
            except requests.RequestException as exc:
                if attempt < self.max_retries:
                    self._backoff(attempt, None)
                    attempt += 1
                    continue
                raise HttpError(
                    self.redact(f"network error after {attempt + 1} attempt(s): {type(exc).__name__}"),
                    retryable=True,
                ) from None
            status = resp.status_code
            if 200 <= status < 300:
                try:
                    return resp.json(), attempt
                except ValueError:
                    raise HttpError(f"HTTP {status}: the response was not JSON", status) from None
            if status in self.retry_statuses and attempt < self.max_retries:
                self._backoff(attempt, _header(resp, "retry-after"))
                attempt += 1
                continue
            raise HttpError(self.redact(f"HTTP {status}: {_error_text(resp)}"), status, status in self.retry_statuses)

    def _backoff(self, attempt, retry_after):
        delay = min(self.backoff_max, self.backoff_base * (2 ** attempt)) * (0.5 + self.rng.random() / 2)
        if retry_after:
            try:
                delay = min(self.backoff_max, max(delay, float(retry_after)))
            except ValueError:
                pass
        self.sleep(delay)


def _header(resp, name):
    headers = getattr(resp, "headers", None) or {}
    try:
        return headers.get(name) or headers.get(name.title())
    except AttributeError:
        return None


def _error_text(resp):
    try:
        data = resp.json()
    except ValueError:
        return (getattr(resp, "text", "") or "")[:300]
    err = data.get("error") if isinstance(data, dict) else None
    if isinstance(err, dict):
        msg = err.get("message") or err.get("type") or json.dumps(err)
    elif isinstance(err, str):
        msg = err
    else:
        msg = json.dumps(data)
    return str(msg)[:300]
