"""Score out of 100 from config.SCORING. A part that cannot be assessed is excluded and the
total is renormalised over what was assessed. Also: verdict band and the exposure figure."""

import math

from . import config


def _clamp(x, low=0.0, high=1.0):
    return max(low, min(high, x))


def _part(key, label, max_points, fraction, detail):
    assessed = fraction is not None
    return {
        "key": key,
        "label": label,
        "max": round(max_points, 2),
        "earned": round(max_points * fraction, 2) if assessed else 0.0,
        "assessed": assessed,
        "detail": detail,
    }


def _component(key, cfg, parts):
    assessed = [p for p in parts if p["assessed"]]
    return {
        "key": key,
        "label": cfg["label"],
        "max": cfg["points"],
        "earned": round(sum(p["earned"] for p in assessed), 2),
        "assessed_max": round(sum(p["max"] for p in assessed), 2),
        "assessed": bool(assessed),
        "parts": parts,
    }


def score_presence(presence, cfg=None):
    cfg = cfg or config.SCORING["presence"]
    share = presence.get("share")
    if share is None:
        part = _part("presence", "Named in answers to non-branded questions", cfg["points"], None, "no successful non-branded answers")
    else:
        part = _part(
            "presence", "Named in answers to non-branded questions", cfg["points"],
            _clamp(share / cfg["full_credit_share"]),
            f"named in {presence['named']} of {presence['runs']} non-branded question-runs ({share:.0%}); "
            f"full credit at {cfg['full_credit_share']:.0%}",
        )
    return _component("presence", cfg, [part])


def score_sources(sources, cfg=None):
    cfg = cfg or config.SCORING["sources"]
    pts, parts_cfg = cfg["points"], cfg["parts"]
    p1, p2 = parts_cfg["site_or_listings"], parts_cfg["profiles"]
    if not sources.get("answers"):
        parts = [
            _part("site_or_listings", "Your site or your listings cited", pts * p1["weight"], None, "no successful answers"),
            _part("profiles", "Review/listing profiles cited", pts * p2["weight"], None, "no successful answers"),
        ]
    else:
        share = sources["site_or_listing_share"] or 0.0
        platforms = sources["dealer_profile_platforms"]
        parts = [
            _part(
                "site_or_listings", "Your site or your listings cited", pts * p1["weight"],
                _clamp(share / p1["full_credit_share"]),
                f"cited in {sources['site_or_listing_answers']} of {sources['answers']} answers ({share:.0%}); "
                f"full credit at {p1['full_credit_share']:.0%}",
            ),
            _part(
                "profiles", "Review/listing profiles cited", pts * p2["weight"],
                _clamp(len(platforms) / p2["full_credit_platforms"]),
                f"your profile cited on {len(platforms)} platform(s)" + (f": {', '.join(platforms)}" if platforms else "")
                + f"; full credit at {p2['full_credit_platforms']}",
            ),
        ]
    return _component("sources", cfg, parts)


def reputation_facts(dealer):
    ratings = [c.rating for c in dealer.competitor_ratings if c.rating is not None]
    counts = [c.count for c in dealer.competitor_ratings if c.count is not None]
    return {
        "google_rating": dealer.google_rating,
        "google_review_count": dealer.google_review_count,
        "competitor_avg_rating": round(sum(ratings) / len(ratings), 2) if ratings else None,
        "competitor_avg_count": round(sum(counts) / len(counts), 1) if counts else None,
        "competitors": [{"name": c.name, "rating": c.rating, "count": c.count} for c in dealer.competitor_ratings],
        "yelp_claimed": dealer.yelp_claimed,
    }


def score_reputation(dealer, cfg=None):
    cfg = cfg or config.SCORING["reputation"]
    pts, parts_cfg = cfg["points"], cfg["parts"]
    facts = reputation_facts(dealer)
    rc, cc, yc = parts_cfg["google_rating"], parts_cfg["google_reviews"], parts_cfg["yelp_claimed"]

    if dealer.google_rating is None or facts["competitor_avg_rating"] is None:
        why = "no Google rating given" if dealer.google_rating is None else "no competitor ratings given"
        rating = _part("google_rating", "Google rating vs competitors", pts * rc["weight"], None, f"not assessed ({why})")
    else:
        diff = dealer.google_rating - facts["competitor_avg_rating"]
        rating = _part(
            "google_rating", "Google rating vs competitors", pts * rc["weight"],
            _clamp(0.5 + diff / (2 * rc["margin"])),
            f"{dealer.google_rating:.1f} vs competitor average {facts['competitor_avg_rating']:.2f} ({diff:+.2f})",
        )

    avg_count = facts["competitor_avg_count"]
    if dealer.google_review_count is None or not avg_count:
        why = "no Google review count given" if dealer.google_review_count is None else "no competitor review counts given"
        reviews = _part("google_reviews", "Google review count vs competitors", pts * cc["weight"], None, f"not assessed ({why})")
    else:
        ratio = dealer.google_review_count / avg_count
        frac = 0.0 if ratio <= 0 else _clamp(0.5 + 0.5 * math.log2(ratio))
        reviews = _part(
            "google_reviews", "Google review count vs competitors", pts * cc["weight"], frac,
            f"{dealer.google_review_count} reviews vs competitor average {avg_count:.0f} ({ratio:.2f}x)",
        )

    if dealer.yelp_claimed is None:
        yelp = _part("yelp_claimed", "Yelp page claimed", pts * yc["weight"], None, "not assessed (unknown)")
    else:
        yelp = _part("yelp_claimed", "Yelp page claimed", pts * yc["weight"], 1.0 if dealer.yelp_claimed else 0.0,
                     "claimed" if dealer.yelp_claimed else "not claimed")
    return _component("reputation", cfg, [rating, reviews, yelp])


def score_technical(site, cfg=None):
    cfg = cfg or config.SCORING["technical"]
    pts, parts_cfg = cfg["points"], cfg["parts"]
    ca, hp, vf = parts_cfg["crawler_access"], parts_cfg["homepage"], parts_cfg["vehicle_fields"]
    if not site or site.get("mode") == "skipped":
        reason = "not assessed (site check skipped)"
        return _component("technical", cfg, [
            _part("crawler_access", "AI crawlers allowed in robots.txt", pts * ca["weight"], None, reason),
            _part("homepage", "Homepage loads for a normal browser", pts * hp["weight"], None, reason),
            _part("vehicle_fields", "Price, mileage and VIN in vehicle-page HTML", pts * vf["weight"], None, reason),
        ])

    robots = site["robots"]
    if robots["state"] in ("ok", "missing"):
        credit = {"allowed": 1.0, "partial": ca["partial_credit"], "blocked": 0.0}
        total_w = sum(b["weight"] for b in robots["bots"])
        got = sum(b["weight"] * credit.get(b["effective"], 0.0) for b in robots["bots"])
        blocked = [b["token"] for b in robots["bots"] if b["effective"] == "blocked"]
        partial = [b["token"] for b in robots["bots"] if b["effective"] == "partial"]
        detail = "all checked crawlers allowed"
        if blocked or partial:
            detail = "; ".join(x for x in (
                f"blocked: {', '.join(blocked)}" if blocked else "",
                f"vehicle pages blocked: {', '.join(partial)}" if partial else "",
            ) if x)
        access = _part("crawler_access", "AI crawlers allowed in robots.txt", pts * ca["weight"], got / total_w, detail)
    else:
        access = _part("crawler_access", "AI crawlers allowed in robots.txt", pts * ca["weight"], None, f"not assessed ({robots['note']})")

    home = site["homepage"]
    if home["ok"]:
        hdetail = f"HTTP {home['status_code']}"
    elif home["challenge"]:
        hdetail = f"HTTP {home['status_code']}: {home['challenge']}"
    else:
        hdetail = home["error"] or f"HTTP {home['status_code']}"
    homepage = _part("homepage", "Homepage loads for a normal browser", pts * hp["weight"], 1.0 if home["ok"] else 0.0, hdetail)

    pages = [p for p in site["vehicle_pages"] if not p["error"]]
    if pages:
        frac = sum((p["price"] + p["mileage"] + p["vin"]) / 3 for p in pages) / len(pages)
        vdetail = f"{len(pages)} vehicle page(s) checked; {frac:.0%} of the three fields found as plain text"
        fields = _part("vehicle_fields", "Price, mileage and VIN in vehicle-page HTML", pts * vf["weight"], frac, vdetail)
    else:
        fields = _part("vehicle_fields", "Price, mileage and VIN in vehicle-page HTML", pts * vf["weight"], None,
                       "not assessed (no vehicle page could be checked)")
    return _component("technical", cfg, [access, homepage, fields])


def verdict_for(score, dealer_name, city):
    for threshold, band, line in config.VERDICT_BANDS:
        if score >= threshold:
            return {"band": band, "line": line.format(dealer=dealer_name, city=city)}
    band, line = config.VERDICT_BANDS[-1][1:]
    return {"band": band, "line": line.format(dealer=dealer_name, city=city)}


def total_score(components, dealer_name, city):
    earned = sum(c["earned"] for c in components)
    assessed_max = sum(c["assessed_max"] for c in components)
    score = int(round(100 * earned / assessed_max)) if assessed_max else 0
    return {
        "score": score,
        "earned": round(earned, 2),
        "assessed_max": round(assessed_max, 2),
        "renormalised": round(assessed_max, 2) < 100,
        "components": components,
        "verdict": verdict_for(score, dealer_name, city),
    }


def compute_exposure(dealer, cfg=None):
    """cars_sold_per_month x share x avg_gross_per_car. Exposure, never 'money lost'."""
    cfg = cfg or config.EXPOSURE
    if dealer.cars_sold_per_month is None or dealer.avg_gross_per_car is None:
        return None
    value = dealer.cars_sold_per_month * cfg["ai_assisted_share"] * dealer.avg_gross_per_car
    return {
        "value": round(value, 2),
        "label": cfg["label"],
        "formula": (
            f"{dealer.cars_sold_per_month:g} cars/month x {cfg['ai_assisted_share']:.0%} AI-assisted share x "
            f"${dealer.avg_gross_per_car:,.0f} average gross per car"
        ),
        "cars_sold_per_month": dealer.cars_sold_per_month,
        "avg_gross_per_car": dealer.avg_gross_per_car,
        "ai_assisted_share": cfg["ai_assisted_share"],
        "source_note": cfg["source_note"],
    }
