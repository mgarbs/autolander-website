"""Load and validate the dealer JSON file."""

import json
import re
from pathlib import Path
from urllib.parse import urlparse

from .geo import resolve_state
from .models import CompetitorRating, DealerInput, InventorySample

REQUIRED = ("dealership_name", "website_url", "city", "state", "zip")
OPTIONAL = (
    "brands", "competitors", "cars_sold_per_month", "avg_gross_per_car", "inventory_samples",
    "google_rating", "google_review_count", "competitor_ratings", "yelp_claimed", "manual_notes",
)


class InputError(ValueError):
    pass


def load_dealer(path):
    try:
        data = json.loads(Path(path).read_text(encoding="utf-8-sig"))
    except FileNotFoundError:
        raise InputError(f"input file not found: {path}") from None
    except json.JSONDecodeError as exc:
        raise InputError(f"input is not valid JSON ({exc})") from None
    return parse_dealer(data)


def _text(data, key):
    value = data.get(key)
    return "" if value is None else str(value).strip()


def _number(data, key, low=None, high=None, integer=False):
    value = data.get(key)
    if value is None or value == "":
        return None
    if isinstance(value, bool) or not isinstance(value, (int, float, str)):
        raise InputError(f"{key} must be a number")
    try:
        num = float(str(value).replace(",", "").replace("$", ""))
    except ValueError:
        raise InputError(f"{key} must be a number (got {value!r})") from None
    if (low is not None and num < low) or (high is not None and num > high):
        raise InputError(f"{key} must be between {low} and {high} (got {value!r})")
    return int(round(num)) if integer else num


def _string_list(data, key):
    value = data.get(key)
    if value is None:
        return []
    if isinstance(value, str):
        value = [value]
    if not isinstance(value, list) or not all(isinstance(v, str) for v in value):
        raise InputError(f"{key} must be a list of names")
    return [v.strip() for v in value if v.strip()]


def _http_url(value, field):
    url = str(value or "").strip()
    if not url:
        return ""
    if not re.match(r"^https?://", url, re.I):
        url = "https://" + url
    host = urlparse(url).hostname or ""
    if not host or ("." not in host and host != "localhost"):
        raise InputError(f"{field} must be a web address (got {value!r})")
    return url


def parse_dealer(data):
    if not isinstance(data, dict):
        raise InputError("the input must be a JSON object")
    missing = [k for k in REQUIRED if not _text(data, k)]
    if missing:
        raise InputError("missing required field(s): " + ", ".join(missing))
    warnings = []
    unknown = sorted(set(data) - set(REQUIRED) - set(OPTIONAL))
    if unknown:
        warnings.append("ignored unknown field(s): " + ", ".join(unknown))

    zip_code = _text(data, "zip")
    if not re.fullmatch(r"\d{5}(-\d{4})?", zip_code):
        warnings.append(f"zip {zip_code!r} is not a 5-digit US ZIP code; it is used as given")
    state = _text(data, "state")
    resolved = resolve_state(state)
    if resolved:
        state_code, state_name, tz = resolved
    else:
        state_code, state_name, tz = "", "", ""
        warnings.append(f"state {state!r} is not a US state; engine location uses the city only")

    competitors = _string_list(data, "competitors")
    if len(competitors) > 3:
        warnings.append("more than 3 competitors given; only the first 3 are used")
        competitors = competitors[:3]

    samples_raw = data.get("inventory_samples") or []
    if not isinstance(samples_raw, list):
        raise InputError("inventory_samples must be a list")
    if len(samples_raw) > 5:
        warnings.append("more than 5 inventory samples given; only the first 5 are used")
        samples_raw = samples_raw[:5]
    samples = []
    for i, item in enumerate(samples_raw, 1):
        if not isinstance(item, dict):
            raise InputError(f"inventory_samples[{i}] must be an object with year, make and model")
        missing_car = [k for k in ("year", "make", "model") if not _text(item, k)]
        if missing_car:
            raise InputError(f"inventory_samples[{i}] is missing: " + ", ".join(missing_car))
        year = _text(item, "year")
        if not re.fullmatch(r"(19[89]\d|20[0-4]\d)", year):
            raise InputError(f"inventory_samples[{i}].year must be a 4-digit model year (got {year!r})")
        samples.append(InventorySample(
            year=year, make=_text(item, "make"), model=_text(item, "model"),
            trim=_text(item, "trim"), url=_http_url(item.get("url"), f"inventory_samples[{i}].url"),
        ))

    ratings = []
    raw_ratings = data.get("competitor_ratings") or []
    if not isinstance(raw_ratings, list):
        raise InputError("competitor_ratings must be a list of {name, rating, count}")
    for i, item in enumerate(raw_ratings, 1):
        if not isinstance(item, dict) or not _text(item, "name"):
            raise InputError(f"competitor_ratings[{i}] needs a name")
        ratings.append(CompetitorRating(
            name=_text(item, "name"),
            rating=_number(item, "rating", 0, 5),
            count=_number(item, "count", 0, None, integer=True),
        ))

    yelp = data.get("yelp_claimed")
    if yelp not in (True, False, None):
        raise InputError("yelp_claimed must be true, false or null")

    return DealerInput(
        dealership_name=_text(data, "dealership_name"),
        website_url=_http_url(data.get("website_url"), "website_url"),
        city=_text(data, "city"),
        state=state,
        zip=zip_code,
        state_code=state_code,
        state_name=state_name,
        timezone=tz,
        brands=_string_list(data, "brands"),
        competitors=competitors,
        cars_sold_per_month=_number(data, "cars_sold_per_month", 0, 100000),
        avg_gross_per_car=_number(data, "avg_gross_per_car", 0, 1000000),
        inventory_samples=samples,
        google_rating=_number(data, "google_rating", 0, 5),
        google_review_count=_number(data, "google_review_count", 0, None, integer=True),
        competitor_ratings=ratings,
        yelp_claimed=yelp,
        manual_notes=_text(data, "manual_notes"),
        warnings=warnings,
    )
