"""Engine registry. Only the three engines in config.ENGINE_ORDER exist."""

from ..config import ENGINE_ORDER, ENGINES
from .anthropic_engine import AnthropicEngine
from .mock_engine import MockEngine
from .openai_engine import OpenAIEngine
from .perplexity_engine import PerplexityEngine

ENGINE_CLASSES = {"openai": OpenAIEngine, "perplexity": PerplexityEngine, "anthropic": AnthropicEngine}


def parse_engine_list(value):
    names = [n.strip().lower() for n in str(value or "").split(",") if n.strip()]
    unknown = [n for n in names if n not in ENGINES]
    if unknown:
        raise ValueError(f"unknown engine(s): {', '.join(unknown)} (choose from {', '.join(ENGINE_ORDER)})")
    ordered = [n for n in ENGINE_ORDER if n in names]
    if not ordered:
        raise ValueError("no engines selected")
    return ordered


def build_engines(names, settings, mock=False, http=None, redact=None):
    """Return (engines, skipped). A live engine without its key is skipped, never called."""
    engines, skipped = [], []
    for name in names:
        cfg = ENGINES[name]
        if mock:
            engines.append(MockEngine(name, redact=redact))
            continue
        key = settings.get(cfg["key_env"])
        if not key:
            skipped.append({"engine": name, "label": cfg["label"], "reason": f"{cfg['key_env']} is not set"})
            continue
        model = settings.get(cfg["model_env"]) or cfg["default_model"]
        engines.append(ENGINE_CLASSES[name](model=model, key=key, http=http, settings=settings, redact=redact))
    return engines, skipped
