"""Per-answer analysis (dealer named? who else? which sources?) and scan-wide aggregates."""

from collections import Counter, defaultdict

from .matching import (
    PROFILE_SOURCES, SOURCE_ORDER, NameMatcher, canonical_key, classify_source, domain_of,
    extract_named_dealers, most_common_display, same_url, tokens, url_words,
)


class Analyzer:
    def __init__(self, dealer):
        self.dealer = dealer
        self.dealer_domain = domain_of(dealer.website_url)
        self.place_words = [dealer.city, dealer.state_code, dealer.state_name, dealer.zip]
        self.place = {t for w in self.place_words for t in tokens(w)}
        self.matcher = NameMatcher(dealer.dealership_name, self.dealer_domain, self.place_words)
        self.competitors = [NameMatcher(c, "", self.place_words) for c in dealer.competitors]

    def annotate_citation(self, cite):
        cite.domain = domain_of(cite.url)
        cite.source = classify_source(cite.domain, self.dealer_domain)
        cite.is_dealer_site = cite.source == "dealer_site"
        if cite.source not in ("dealer_site", "other"):
            words = url_words(cite.url)
            cite.mentions_dealer = self.matcher.match(words).named or bool(
                cite.title and self.matcher.match(cite.title).named
            )
        if cite.source == "yelp":
            # Store no Yelp data: keep only the link the engine cited, never Yelp's page title.
            cite.title = ""

    def analyze(self, answer, question):
        for cite in answer.citations + answer.consulted:
            self.annotate_citation(cite)
        if not answer.ok:
            return answer
        m = self.matcher.match(answer.text)
        answer.dealer_named, answer.match_how, answer.match_evidence = m.named, m.how, m.evidence[:120]
        answer.named_dealers = extract_named_dealers(answer.text, self.matcher, self.competitors, self.place_words)
        answer.dealer_domain_cited = any(c.is_dealer_site for c in answer.citations)
        answer.dealer_listing_cited = any(c.mentions_dealer for c in answer.citations)
        answer.sources_cited = [s for s in SOURCE_ORDER if any(c.source == s for c in answer.citations)]
        if question.category == "specific_car":
            vehicle_url = ""
            if question.inventory_index is not None and question.inventory_index < len(self.dealer.inventory_samples):
                vehicle_url = self.dealer.inventory_samples[question.inventory_index].url
            answer.vehicle_found = bool(
                answer.dealer_named or answer.dealer_domain_cited
                or (vehicle_url and any(same_url(c.url, vehicle_url) for c in answer.citations))
            )
        return answer


def build_grid(questions, answers, engine_names):
    grid = {q.id: {e: {"named": 0, "runs": 0, "errors": 0} for e in engine_names} for q in questions}
    for a in answers:
        cell = grid[a.question_id][a.engine]
        if a.ok:
            cell["runs"] += 1
            cell["named"] += int(a.dealer_named)
        else:
            cell["errors"] += 1
    return grid


def presence_stats(questions, answers, engine_names):
    nonbranded = {q.id for q in questions if not q.branded}
    by_engine = {}
    for e in engine_names:
        runs = [a for a in answers if a.engine == e and a.ok and a.question_id in nonbranded]
        named = sum(a.dealer_named for a in runs)
        by_engine[e] = {"runs": len(runs), "named": named, "share": round(named / len(runs), 4) if runs else None}
    runs = [a for a in answers if a.ok and a.question_id in nonbranded]
    named = sum(a.dealer_named for a in runs)
    never = [
        q.id for q in questions
        if not q.branded and not any(a.dealer_named for a in answers if a.question_id == q.id and a.ok)
    ]
    return {
        "nonbranded_questions": len(nonbranded),
        "runs": len(runs),
        "named": named,
        "share": round(named / len(runs), 4) if runs else None,
        "by_engine": by_engine,
        "never_named_question_ids": never,
    }


def top_named_dealers(questions, answers, analyzer, limit=10):
    """Businesses named across answers to non-branded questions (the scanned dealer included)."""
    nonbranded = {q.id for q in questions if not q.branded}
    pool = [a for a in answers if a.ok and a.question_id in nonbranded]
    total = len(pool)
    counts, displays = Counter(), defaultdict(list)
    dealer_key = "__dealer__"
    for a in pool:
        seen = set()
        for name in a.named_dealers:
            key = canonical_key(name, analyzer.place)
            if key not in seen:
                seen.add(key)
                counts[key] += 1
                displays[key].append(name)
        if a.dealer_named:
            counts[dealer_key] += 1
    rows = []
    for key, n in counts.most_common():
        is_dealer = key == dealer_key
        name = analyzer.dealer.dealership_name if is_dealer else most_common_display(displays[key])
        rows.append({"name": name, "answers": n, "share": round(n / total, 4) if total else 0.0, "is_dealer": is_dealer})
    rows.sort(key=lambda r: (-r["answers"], not r["is_dealer"], r["name"]))
    dealer_row = next((r for r in rows if r["is_dealer"]), None)
    if dealer_row is None:
        dealer_row = {"name": analyzer.dealer.dealership_name, "answers": 0, "share": 0.0, "is_dealer": True}
    rank = rows.index(dealer_row) + 1 if dealer_row in rows else None
    return {"answers_considered": total, "rows": rows[:limit], "dealer": dealer_row, "dealer_rank": rank}


def inventory_stats(questions, answers, engine_names, dealer):
    out = []
    for q in questions:
        if q.category != "specific_car":
            continue
        by_engine = {}
        for e in engine_names:
            runs = [a for a in answers if a.engine == e and a.question_id == q.id and a.ok]
            by_engine[e] = {"found": sum(bool(a.vehicle_found) for a in runs), "runs": len(runs)}
        sample = dealer.inventory_samples[q.inventory_index] if q.inventory_index is not None else None
        out.append({
            "question_id": q.id,
            "label": q.subject,
            "url": sample.url if sample else "",
            "from_inventory": sample is not None,
            "by_engine": by_engine,
            "found": any(v["found"] for v in by_engine.values()),
        })
    return out


def source_stats(answers):
    ok = [a for a in answers if a.ok]
    domain_counts, domain_source = Counter(), {}
    by_source = {s: {"citations": 0, "answers": 0, "dealer_profile_cited": False} for s in SOURCE_ORDER}
    for a in ok:
        seen_sources = set()
        for c in a.citations:
            domain_counts[c.domain] += 1
            domain_source[c.domain] = c.source
            entry = by_source[c.source]
            entry["citations"] += 1
            if c.mentions_dealer or c.is_dealer_site:
                entry["dealer_profile_cited"] = True
            seen_sources.add(c.source)
        for s in seen_sources:
            by_source[s]["answers"] += 1
    site_or_listing = sum(1 for a in ok if a.dealer_domain_cited or a.dealer_listing_cited)
    profiles = sorted(s for s in PROFILE_SOURCES if by_source[s]["dealer_profile_cited"])
    return {
        "answers": len(ok),
        "total_citations": sum(domain_counts.values()),
        "domains": [
            {"domain": d, "citations": n, "source": domain_source[d], "is_dealer_site": domain_source[d] == "dealer_site"}
            for d, n in domain_counts.most_common()
        ],
        "by_source": by_source,
        "dealer_site_cited_answers": sum(1 for a in ok if a.dealer_domain_cited),
        "site_or_listing_answers": site_or_listing,
        "site_or_listing_share": round(site_or_listing / len(ok), 4) if ok else None,
        "dealer_profile_platforms": profiles,
    }


def usage_summary(answers, engines, mock):
    by_engine = {}
    for e in engines:
        rows = [a for a in answers if a.engine == e.name]
        costs = [a.usage.get("cost_usd") for a in rows if a.usage.get("cost_usd") is not None]
        by_engine[e.name] = {
            "label": e.label,
            "model": e.model,
            "priced_as": e.priced_as,
            "calls": len(rows),
            "errors": sum(1 for a in rows if not a.ok),
            "input_tokens": sum(a.usage.get("input_tokens", 0) for a in rows),
            "output_tokens": sum(a.usage.get("output_tokens", 0) for a in rows),
            "searches": sum(a.usage.get("searches", 0) for a in rows),
            "cost_usd": round(sum(costs), 4) if costs else None,
            "unpriced_calls": sum(1 for a in rows if a.ok and a.usage.get("cost_usd") is None),
        }
    total = [v["cost_usd"] for v in by_engine.values() if v["cost_usd"] is not None]
    return {
        "mock": mock,
        "note": (
            "Mock run: no API was called and nothing was billed. Usage figures are synthetic and the cost "
            "shows what similar live usage would cost at the configured prices."
            if mock else "Cost uses the API's own figure when it returns one, otherwise tokens and searches x config prices."
        ),
        "calls": sum(v["calls"] for v in by_engine.values()),
        "cost_usd": round(sum(total), 4) if total else None,
        "by_engine": by_engine,
    }
