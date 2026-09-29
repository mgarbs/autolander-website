"""Every tunable number, price and label for the AI Visibility Scan.

Prices were read from the vendors' public pages on PRICES_CHECKED_ON (URLs in
PRICING). Re-check them before quoting a client. Live scans also record the usage
each API reports, so the per-scan log shows the real figures.
"""

TOOL_NAME = "AutoLander AI Visibility Scan"
TOOL_VERSION = "1.0.0"
PRICES_CHECKED_ON = "2026-09-27"

# Printed on every page of a report built from mock (fixture) answers.
SAMPLE_LABEL = "SAMPLE — mock data"

# --------------------------------------------------------------------------- engines
# Plain-text descriptions only: no logos, no product marks, no "powered by" wording.
# Only these three engines exist. Google's grounded-search API is deliberately not an
# engine here (its terms limit grounded results to the user who asked).
ENGINE_ORDER = ("openai", "perplexity", "anthropic")

ENGINES = {
    "openai": {
        "label": "OpenAI API",
        "vendor": "OpenAI",
        "key_env": "OPENAI_API_KEY",
        "model_env": "OPENAI_MODEL",
        "default_model": "gpt-5.4-mini",
        # gpt-5.4 defaults to reasoning effort "none"; OpenAI's web search guide says
        # that setting "may produce lower-quality results", so the scan asks for "low".
        # Set OPENAI_REASONING_EFFORT=omit to send no reasoning block (gpt-4.x models).
        "reasoning_env": "OPENAI_REASONING_EFFORT",
        "default_reasoning_effort": "low",
        "endpoint": "https://api.openai.com/v1/responses",
        "max_output_tokens": 4000,
    },
    "perplexity": {
        "label": "Perplexity API",
        "vendor": "Perplexity",
        "key_env": "PERPLEXITY_API_KEY",
        "model_env": "PERPLEXITY_MODEL",
        # Sonar chat completions are supported only until 2026-09-27; the documented
        # successor is the Agent API. perplexity/sonar is Perplexity's own model there.
        "default_model": "perplexity/sonar",
        "preset_env": "PERPLEXITY_PRESET",  # e.g. "fast"; used instead of the model if set
        "endpoint": "https://api.perplexity.ai/v1/agent",
        "max_output_tokens": 1500,
    },
    "anthropic": {
        "label": "Anthropic API",
        "vendor": "Anthropic",
        "key_env": "ANTHROPIC_API_KEY",
        "model_env": "ANTHROPIC_MODEL",
        # claude-haiku-4-5 is cheaper but its retirement is "not sooner than 2026-10-15";
        # claude-sonnet-5 is committed to 2027-06-30 or later.
        "default_model": "claude-sonnet-5",
        "endpoint": "https://api.anthropic.com/v1/messages",
        "api_version": "2023-06-01",
        "tool_type": "web_search_20250305",  # basic web search, supported without extra settings
        "max_uses": 3,  # hard cap on searches per answer (cost control)
        "max_tokens": 2048,
        "max_continuations": 2,  # stop_reason "pause_turn" resends
    },
}

# --------------------------------------------------------------------------- pricing (USD)
# Per 1M tokens, plus per web-search call. Model ids with a date suffix are priced by
# their base id (gpt-5.4-mini-2026-03-17 -> gpt-5.4-mini).
PRICING = {
    "openai": {
        "source": "https://developers.openai.com/api/docs/pricing",
        "per_search": 0.010,  # "Web search (all models): $10.00 / 1k calls + search content tokens billed at model rates"
        "models": {
            "gpt-5.4-mini": {"input": 0.75, "cached_input": 0.075, "output": 4.50},
            "gpt-5.4-nano": {"input": 0.20, "cached_input": 0.02, "output": 1.25},
            "gpt-5-mini": {"input": 0.25, "cached_input": 0.025, "output": 2.00},
            "gpt-5-nano": {"input": 0.05, "cached_input": 0.005, "output": 0.40},
            "gpt-4.1-mini": {"input": 0.40, "cached_input": 0.10, "output": 1.60},
            "gpt-4o-mini": {"input": 0.15, "cached_input": 0.075, "output": 0.60},
        },
    },
    "perplexity": {
        "source": "https://docs.perplexity.ai/docs/getting-started/pricing",
        "per_search": 0.0025,  # Agent API web_search: $2.50 per 1,000 invocations (standard search)
        "models": {
            "perplexity/sonar": {"input": 0.25, "cached_input": 0.0625, "output": 2.50},
        },
    },
    "anthropic": {
        "source": "https://platform.claude.com/docs/en/about-claude/pricing",
        "per_search": 0.010,  # "$10 per 1,000 searches, plus standard token costs"
        "models": {
            "claude-sonnet-5": {"input": 2.00, "cached_input": 0.20, "output": 10.00},
            "claude-haiku-4-5": {"input": 1.00, "cached_input": 0.10, "output": 5.00},
            "claude-opus-5-5": {"input": 4.00, "cached_input": 0.20, "output": 20.00},
        },
    },
}

# Assumed usage per answer, used only by `scan.py --estimate` before any live scan has run.
# Search results are billed as input tokens by OpenAI and Anthropic, which is why input
# dominates. Replace these with the measured averages from usage_log.csv after the
# first live scans.
COST_PROFILES = {
    "openai": {
        "low": {"searches": 1.0, "input_tokens": 5000, "output_tokens": 600},
        "typical": {"searches": 1.5, "input_tokens": 9000, "output_tokens": 1000},
        "high": {"searches": 3.0, "input_tokens": 20000, "output_tokens": 2000},
    },
    "perplexity": {
        "low": {"searches": 1.0, "input_tokens": 1500, "output_tokens": 350},
        "typical": {"searches": 1.5, "input_tokens": 4000, "output_tokens": 600},
        "high": {"searches": 3.0, "input_tokens": 10000, "output_tokens": 1200},
    },
    "anthropic": {
        "low": {"searches": 1.0, "input_tokens": 7000, "output_tokens": 500},
        "typical": {"searches": 1.5, "input_tokens": 13000, "output_tokens": 800},
        "high": {"searches": 3.0, "input_tokens": 30000, "output_tokens": 1500},
    },
}

# --------------------------------------------------------------------------- network
HTTP = {
    "connect_timeout": 10,
    "read_timeout": 120,
    "max_retries": 3,
    "backoff_base": 2.0,
    "backoff_max": 60.0,
    "retry_statuses": (408, 409, 425, 429, 500, 502, 503, 504, 529),
}
WORKERS_PER_ENGINE = 3
RUNS_PER_QUESTION = 3

SITE_CHECK = {
    "timeout": 20,
    "delay_between_requests": 1.0,  # polite: one request per URL, a pause between URLs
    "max_bytes": 3_000_000,
    "max_vehicle_pages": 5,
    "user_agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36"
    ),
}

# The exact wording requested for the Cloudflare finding (finding only, never scored).
CLOUDFLARE_NOTE = (
    "Cloudflare may block AI crawlers by default (policy since 2025-07-01); "
    "ask the website vendor to allow the crawlers you want"
)

# Crawlers checked in robots.txt. weight 2 = decides whether pages can appear in AI
# answers or search; weight 1 = model training only (a business choice).
AI_BOTS = [
    {"token": "GPTBot", "owner": "OpenAI", "role": "Model training", "weight": 1},
    {"token": "OAI-SearchBot", "owner": "OpenAI", "role": "Search results", "weight": 2},
    {"token": "ChatGPT-User", "owner": "OpenAI", "role": "Pages fetched while answering a user", "weight": 2},
    {"token": "PerplexityBot", "owner": "Perplexity", "role": "Search results", "weight": 2},
    {"token": "ClaudeBot", "owner": "Anthropic", "role": "Model training", "weight": 1},
    {"token": "Claude-SearchBot", "owner": "Anthropic", "role": "Search results", "weight": 2},
    {"token": "Google-Extended", "owner": "Google", "role": "AI training and grounding opt-out (not Google Search)", "weight": 2},
    {"token": "Bingbot", "owner": "Microsoft", "role": "Bing search index", "weight": 2},
    {"token": "Applebot-Extended", "owner": "Apple", "role": "Model training", "weight": 1},
]

# --------------------------------------------------------------------------- scoring
# Points out of 100. Sub-part weights are fractions of their component. Any part that
# cannot be assessed is marked "not assessed" and the total is renormalised to 100.
SCORING = {
    "presence": {
        "label": "Presence",
        "points": 50,
        # Share of NON-branded question-runs (all engines) that name the dealer. Linear;
        # full credit at this share because AI answers usually list several dealers.
        "full_credit_share": 0.50,
    },
    "sources": {
        "label": "Sources",
        "points": 15,
        "parts": {
            # share of all answers citing the dealer's own site or a listing/profile of the dealer
            "site_or_listings": {"weight": 0.6, "full_credit_share": 0.30},
            # distinct review/listing platforms where a dealer profile was cited
            "profiles": {"weight": 0.4, "full_credit_platforms": 3},
        },
    },
    "reputation": {
        "label": "Reputation",
        "points": 20,
        "parts": {
            # 0.5 credit at the competitor average; full at +margin stars, zero at -margin
            "google_rating": {"weight": 0.45, "margin": 0.5},
            # 0.5 credit at the competitor average count; full at 2x; zero at 0.5x
            "google_reviews": {"weight": 0.35},
            "yelp_claimed": {"weight": 0.20},
        },
    },
    "technical": {
        "label": "Technical",
        "points": 15,
        "parts": {
            "crawler_access": {"weight": 0.40, "partial_credit": 0.5},
            "homepage": {"weight": 0.30},
            "vehicle_fields": {"weight": 0.30},
        },
    },
}

VERDICT_BANDS = [
    (80, "Strong", "AI engines regularly name {dealer} when local buyers ask."),
    (60, "Visible", "AI engines know {dealer}, but competitors are named more often."),
    (40, "Inconsistent", "{dealer} is named for some buyer questions and missing from many others."),
    (20, "Mostly invisible", "AI engines rarely name {dealer} when {city} buyers ask."),
    (0, "Not named", "AI answers to local buyer questions name other dealers, not {dealer}."),
]

# --------------------------------------------------------------------------- exposure
EXPOSURE = {
    "ai_assisted_share": 0.19,
    "label": "monthly gross exposed to AI-assisted shoppers (not money lost)",
    "source_note": "Cox Automotive Car Buyer Journey Study, released Jan 2026: 19% of all car buyers used AI websites or AI-generated overviews",
    # What was found when the note was checked (2026-09-27). Kept for the operator; the
    # report prints only source_note.
    "source_detail": (
        "Cox Automotive Car Buyer Journey Study, released 2026-01-13: '19% of all buyers "
        "and 25% of new-vehicle buyers' used AI websites or AI-generated overviews. "
        "https://www.coxautoinc.com/insights/cox-automotive-car-buyer-journey-study-finds-"
        "efficiency-digital-tools-and-ai-drive-record-satisfaction/"
    ),
}

# --------------------------------------------------------------------------- report
REPORT = {
    "answers_shown_per_engine": 2,  # answer excerpts shown with their clickable sources
    "excerpt_chars": 480,
    "top_dealers_shown": 10,
    "top_domains_shown": 12,
}
