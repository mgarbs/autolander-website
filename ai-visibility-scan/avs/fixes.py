"""Top 3 fixes, chosen by fixed rules from the findings (highest priority first).

Wording rule: describe what to change and why the engines need it. Never promise a
ranking, traffic, leads or sales.
"""

from .matching import SOURCE_LABELS

ANSWER_TIME_ROLES = {"Search results", "Pages fetched while answering a user", "Bing search index",
                     "AI training and grounding opt-out (not Google Search)"}


def _fix(fid, priority, title, detail):
    return {"id": fid, "priority": round(priority, 1), "title": title, "detail": detail}


def build_fixes(dealer, questions, presence, top_dealers, inventory, sources, site, reputation):
    fixes = []
    qtext = {q.id: q.text for q in questions}

    # 1. crawlers that decide what can appear in answers are blocked
    if site.get("mode") != "skipped" and site["robots"]["state"] in ("ok", "missing"):
        answer_bots = [b for b in site["robots"]["bots"] if b["role"] in ANSWER_TIME_ROLES]
        blocked = [b["token"] for b in answer_bots if b["effective"] == "blocked"]
        partial = [b["token"] for b in answer_bots if b["effective"] == "partial"]
        if blocked:
            fixes.append(_fix(
                "unblock_search_crawlers", 100, "Unblock the AI search crawlers in robots.txt",
                f"robots.txt blocks {', '.join(blocked)}. These crawlers decide whether your pages can be used "
                "when AI engines answer buyers. Remove the Disallow rules for them; blocking the training-only "
                "crawlers can stay a separate choice.",
            ))
        elif partial:
            fixes.append(_fix(
                "unblock_inventory_paths", 85, "Let AI search crawlers read your vehicle pages",
                f"robots.txt keeps {', '.join(partial)} out of the vehicle pages checked. Allow the inventory "
                "paths so engines can read the cars you actually have in stock.",
            ))
        training = [b["token"] for b in site["robots"]["bots"]
                    if b["role"] == "Model training" and b["effective"] == "blocked"]
        if training:
            fixes.append(_fix(
                "training_crawlers", 20, "Decide on the AI training crawlers",
                f"robots.txt blocks {', '.join(training)}, which collect pages for model training. That is a "
                "business choice; it does not change the search crawlers above.",
            ))

    # 2. the homepage does not load for a normal browser
    if site.get("mode") != "skipped" and not site["homepage"]["ok"]:
        home = site["homepage"]
        what = home["challenge"] or home["error"] or f"HTTP {home['status_code']}"
        fixes.append(_fix(
            "homepage_reachable", 95, "Make sure your homepage loads for visitors and crawlers",
            f"A normal browser request to your homepage got: {what}. If a security layer sits in front of the "
            "site, ask the website vendor to let verified search and AI crawlers through.",
        ))

    # 3. vehicle pages hide price / mileage / VIN from the HTML
    pages = [p for p in (site.get("vehicle_pages") or []) if not p["error"]]
    weak = [p for p in pages if not (p["price"] and p["mileage"] and p["vin"])]
    if weak:
        missing = [f for f in ("price", "mileage", "VIN") if any(not p[f.lower()] for p in weak)]
        missing_text = missing[0] if len(missing) == 1 else ", ".join(missing[:-1]) + " or " + missing[-1]
        fixes.append(_fix(
            "vehicle_page_fields", 70 + 10 * len(weak) / len(pages),
            "Put price, mileage and VIN in the vehicle-page HTML",
            f"{len(weak)} of {len(pages)} vehicle pages checked do not show the {missing_text} as plain text. "
            "Many crawlers read the raw HTML without running scripts, so values filled in by JavaScript can be "
            "invisible to them. Add them to the page HTML and to Vehicle structured data.",
        ))

    # 4. low presence for non-branded questions
    share = presence.get("share")
    if share is not None and share < 0.25:
        rivals = [r["name"] for r in top_dealers["rows"] if not r["is_dealer"]][:3]
        missed = [qtext[q] for q in presence["never_named_question_ids"][:2]]
        detail = f"You were named in {presence['named']} of {presence['runs']} answers to questions that did not mention you."
        if rivals:
            detail += f" Named more often: {', '.join(rivals)}."
        if missed:
            detail += " Never named for: " + "; ".join(f"'{m}'" for m in missed) + "."
        detail += (" Publish pages that answer these questions directly (location, inventory, financing and trade-in "
                   "pages) and keep your business details identical everywhere they are listed.")
        fixes.append(_fix("presence", 75 + 40 * (0.25 - share), "Give AI engines a reason to name you", detail))

    # 5. listed cars not found
    listed = [i for i in inventory if i["from_inventory"]]
    not_found = [i for i in listed if not i["found"]]
    if listed and len(not_found) * 2 >= len(listed):
        fixes.append(_fix(
            "cars_not_found", 65, "Make your in-stock cars findable",
            f"AI engines found {len(listed) - len(not_found)} of the {len(listed)} cars you listed. Crawlable vehicle "
            "pages with the year, make, model, price and VIN in plain text, plus listings on the big car marketplaces, "
            "give engines something to point to.",
        ))

    # 6. the dealer's own site is rarely a source
    if sources.get("answers") and sources["dealer_site_cited_answers"] / sources["answers"] < 0.10:
        top_other = [d["domain"] for d in sources["domains"] if not d["is_dealer_site"]][:3]
        fixes.append(_fix(
            "site_not_cited", 60, "Make your own website a source engines can cite",
            f"Your website was cited in {sources['dealer_site_cited_answers']} of {sources['answers']} answers; "
            f"engines cited {', '.join(top_other) or 'other sites'} instead. Clear, crawlable pages for inventory, "
            "location, hours and financing give them something to cite.",
        ))

    # 7. platforms engines rely on, without the dealer's profile
    by_source = sources.get("by_source") or {}
    gaps = [s for s in ("cars.com", "cargurus", "autotrader", "google", "yelp", "dealerrater", "facebook")
            if by_source.get(s, {}).get("citations", 0) >= 3 and not by_source[s]["dealer_profile_cited"]]
    if gaps:
        labels = [SOURCE_LABELS[s] for s in gaps]
        cited = sum(by_source[s]["citations"] for s in gaps)
        fixes.append(_fix(
            "profiles", 55, f"Complete your {', '.join(labels[:3])} profile{'s' if len(labels) > 1 else ''}",
            f"Engines cited {', '.join(labels)} {cited} times in this scan, but never a page of yours there. "
            "Claim and complete those profiles with the same name, address, phone and hours as your website.",
        ))

    # 8. review gap vs competitors
    avg_rating, avg_count = reputation.get("competitor_avg_rating"), reputation.get("competitor_avg_count")
    rating, count = dealer.google_rating, dealer.google_review_count
    if (rating is not None and avg_rating is not None and rating + 0.2 <= avg_rating) or (
        count is not None and avg_count and count < 0.7 * avg_count
    ):
        parts = []
        if rating is not None and avg_rating is not None:
            parts.append(f"rating {rating:.1f} vs competitor average {avg_rating:.1f}")
        if count is not None and avg_count:
            parts.append(f"{count} reviews vs competitor average {avg_count:.0f}")
        fixes.append(_fix(
            "reviews", 50, "Close the Google review gap",
            "Google: " + "; ".join(parts) + ". Ask every buyer for a review and answer the reviews you get.",
        ))

    # 9. Yelp page unclaimed
    if dealer.yelp_claimed is False:
        yelp_cites = by_source.get("yelp", {}).get("citations", 0)
        fixes.append(_fix(
            "yelp", 40 + (10 if yelp_cites >= 3 else 0), "Claim your Yelp business page",
            "Your Yelp page is not claimed." + (f" Engines cited Yelp {yelp_cites} times in this scan." if yelp_cites else "")
            + " Claiming it lets you correct your details and reply to reviews.",
        ))

    # fallbacks so there are always three
    fixes.append(_fix(
        "consistency", 10, "Keep your business details identical everywhere",
        "Use the same name, address, phone and hours on your website, Google, Yelp and the car marketplaces, "
        "so engines can match every mention to one dealership.",
    ))
    fixes.append(_fix(
        "faq", 5, "Answer buyers' questions on your own site",
        "A short FAQ covering financing, trade-ins, warranties and test drives gives engines direct answers to quote.",
    ))
    fixes.sort(key=lambda f: -f["priority"])
    return fixes[:3], fixes
