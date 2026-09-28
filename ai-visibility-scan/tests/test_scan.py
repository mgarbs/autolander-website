"""Tests for the AutoLander AI Visibility Scan (stdlib unittest; no network to any AI engine).

Run from the tool folder:  python -m unittest discover -s tests -v
"""

import copy
import html as htmllib
import http.server
import io
import json
import os
import re
import sys
import tempfile
import threading
import unittest
from contextlib import contextmanager, redirect_stderr, redirect_stdout
from pathlib import Path
from unittest import mock

import requests

TOOL_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(TOOL_DIR))

import scan as scan_cli  # noqa: E402
from avs import config  # noqa: E402
from avs.analysis import Analyzer  # noqa: E402
from avs.engines import ENGINE_CLASSES, build_engines, parse_engine_list  # noqa: E402
from avs.engines.anthropic_engine import AnthropicEngine  # noqa: E402
from avs.engines.base import estimate_cost  # noqa: E402
from avs.engines.openai_engine import OpenAIEngine  # noqa: E402
from avs.engines.perplexity_engine import PerplexityEngine  # noqa: E402
from avs.http import HttpClient, HttpError  # noqa: E402
from avs.inputs import InputError, load_dealer, parse_dealer  # noqa: E402
from avs.keys import KEY_NAMES, Redactor, load_settings  # noqa: E402
from avs.matching import NameMatcher, extract_named_dealers  # noqa: E402
from avs.models import Citation  # noqa: E402
from avs.pdf import find_chrome  # noqa: E402
from avs.pipeline import run_scan, usage_csv, write_outputs  # noqa: E402
from avs.questions import CATEGORY_COUNTS, build_questions  # noqa: E402
from avs.report import render_report  # noqa: E402
from avs.robots import evaluate_bot, is_allowed, parse_robots  # noqa: E402
from avs.scoring import (  # noqa: E402
    compute_exposure, score_presence, score_reputation, score_sources, score_technical, total_score, verdict_for,
)
from avs.sitecheck import (  # noqa: E402
    FetchResult, LiveFetcher, MockFetcher, build_mock_site, detect_cloudflare, find_vin, has_mileage, has_price,
    robots_report, run_site_check, vin_is_valid,
)

SAMPLE_INPUT = TOOL_DIR / "sample" / "sample_motors_input.json"
FAKE_KEYS = {
    "OPENAI_API_KEY": "sk-proj-TESTKEY-openai-DO-NOT-LEAK-0123456789",
    "PERPLEXITY_API_KEY": "pplx-TESTKEY-perplexity-DO-NOT-LEAK-0123456",
    "ANTHROPIC_API_KEY": "sk-ant-api03-TESTKEY-anthropic-DO-NOT-LEAK-01",
}
BASE_DEALER = {
    "dealership_name": "Sample Motors",
    "website_url": "https://www.samplemotors.example/",
    "city": "Raleigh",
    "state": "NC",
    "zip": "27604",
}
PLACE = ["Raleigh", "NC", "North Carolina", "27604"]


def make_dealer(**overrides):
    data = dict(BASE_DEALER)
    data.update(overrides)
    return parse_dealer(data)


@contextmanager
def no_network():
    """Fail the test if any code path tries to use `requests` for an HTTP call."""
    with mock.patch("requests.sessions.Session.request", side_effect=AssertionError("network call attempted")):
        yield


def env_without_keys(extra=None):
    env = {k: v for k, v in os.environ.items() if k not in KEY_NAMES}
    env.update(extra or {})
    return env


def run_cli(args):
    """Run scan.main quietly; returns (exit code, stdout, stderr)."""
    out, err = io.StringIO(), io.StringIO()
    with redirect_stdout(out), redirect_stderr(err):
        code = scan_cli.main(args)
    return code, out.getvalue(), err.getvalue()


class FakeResponse:
    def __init__(self, status, payload=None, headers=None):
        self.status_code = status
        self._payload = payload
        self.text = json.dumps(payload) if payload is not None else ""
        self.headers = headers or {}

    def json(self):
        if self._payload is None:
            raise ValueError("no JSON")
        return self._payload


class FakeSession:
    """Stands in for requests.Session: records each POST and returns scripted responses."""

    def __init__(self, responses):
        self.responses = responses
        self.calls = []
        self.lock = threading.Lock()

    def post(self, url, headers=None, json=None, timeout=None):
        with self.lock:
            self.calls.append({"url": url, "headers": dict(headers or {}), "json": copy.deepcopy(json), "timeout": timeout})
            item = self.responses(len(self.calls)) if callable(self.responses) else self.responses.pop(0)
        if isinstance(item, Exception):
            raise item
        return item


def fake_http(responses, sleeps=None, redact=None):
    session = FakeSession(responses)
    client = HttpClient(redact=redact, session_factory=lambda: session, sleep=(sleeps.append if sleeps is not None else (lambda s: None)))
    return client, session


# --------------------------------------------------------------------------- fixtures from the vendors' documented shapes
OPENAI_RESPONSE = {
    "id": "resp_1", "object": "response", "status": "completed", "model": "gpt-5.4-mini-2026-03-17",
    "output": [
        {"type": "reasoning", "id": "rs_1", "summary": []},
        {"type": "web_search_call", "id": "ws_1", "status": "completed", "action": {
            "type": "search", "query": "best used car dealer Raleigh NC",
            "sources": [{"type": "url", "url": "https://www.cars.com/dealers/1/harborline-motors/"},
                        {"type": "url", "url": "https://www.samplemotors.example/"}]}},
        {"type": "message", "id": "msg_1", "status": "completed", "role": "assistant", "content": [{
            "type": "output_text",
            "text": "Top picks: **Harborline Motors** and **Sample Motors**.",
            "annotations": [
                {"type": "url_citation", "start_index": 0, "end_index": 10,
                 "url": "https://www.cars.com/dealers/1/harborline-motors/?utm_source=openai", "title": "Harborline Motors | Cars.com"},
                {"type": "url_citation", "start_index": 11, "end_index": 20,
                 "url": "https://www.samplemotors.example/?utm_source=openai", "title": "Sample Motors"},
            ]}]},
    ],
    "usage": {"input_tokens": 9000, "input_tokens_details": {"cached_tokens": 1000}, "output_tokens": 800,
              "output_tokens_details": {"reasoning_tokens": 300}, "total_tokens": 9800},
}

PERPLEXITY_RESPONSE = {
    "id": "resp_p", "model": "perplexity/sonar", "status": "completed",
    "output": [
        {"type": "search_results", "queries": ["used car dealer Raleigh"], "results": [
            {"id": 1, "url": "https://www.yelp.com/biz/harborline-motors-raleigh", "title": "Harborline Motors - Yelp",
             "snippet": "review text", "date": "2026-09-01", "source": "web"},
            {"id": 2, "url": "https://www.samplemotors.example/used-inventory/", "title": "Sample Motors inventory",
             "snippet": "trucks", "source": "web"}]},
        {"type": "message", "id": "msg_p", "role": "assistant", "status": "completed", "content": [{
            "type": "output_text", "text": "Harborline Motors is popular [1]. Sample Motors lists trucks [2].", "annotations": []}]},
    ],
    "usage": {"input_tokens": 3000, "output_tokens": 400, "total_tokens": 3400,
              "cost": {"currency": "USD", "input_cost": 0.00075, "output_cost": 0.001, "tool_calls_cost": 0.0025, "total_cost": 0.00425},
              "tool_calls_details": {"search_web": {"invocation": 1}}},
}

ANTHROPIC_RESPONSE = {
    "id": "msg_a", "type": "message", "role": "assistant", "model": "claude-sonnet-5", "stop_reason": "end_turn",
    "content": [
        {"type": "text", "text": "I'll search for dealers in Raleigh."},
        {"type": "server_tool_use", "id": "srvtoolu_1", "name": "web_search", "input": {"query": "best used car dealer Raleigh NC"}},
        {"type": "web_search_tool_result", "tool_use_id": "srvtoolu_1", "content": [
            {"type": "web_search_result", "url": "https://www.dealerrater.com/dealer/Harborline-Motors-review-1/",
             "title": "Harborline Motors Reviews", "encrypted_content": "abc", "page_age": "2026-09-01"}]},
        {"type": "text", "text": "Based on reviews, "},
        {"type": "text", "text": "Harborline Motors is highly rated.", "citations": [
            {"type": "web_search_result_location", "url": "https://www.dealerrater.com/dealer/Harborline-Motors-review-1/",
             "title": "Harborline Motors Reviews", "encrypted_index": "xyz", "cited_text": "Great dealer"}]},
    ],
    "usage": {"input_tokens": 12000, "output_tokens": 700, "server_tool_use": {"web_search_requests": 1}},
}


def mock_results(dealer=None, **kwargs):
    dealer = dealer or load_dealer(SAMPLE_INPUT)
    engines, _ = build_engines(list(config.ENGINE_ORDER), {}, mock=True)
    return run_scan(dealer, engines, site_fetcher=MockFetcher(build_mock_site(dealer)), site_mode="mock", **kwargs)


_MOCK_CACHE = {}


def sample_mock_results():
    if "r" not in _MOCK_CACHE:
        _MOCK_CACHE["r"] = mock_results()
    return copy.deepcopy(_MOCK_CACHE["r"])


# =========================================================================== questions
class TestQuestions(unittest.TestCase):
    def test_twenty_questions_in_the_five_categories(self):
        qs = build_questions(make_dealer(competitors=["A Motors", "B Auto Group"]))
        self.assertEqual(len(qs), 20)
        self.assertEqual(len({q.id for q in qs}), 20)
        counts = {c: sum(q.category == c for q in qs) for c in CATEGORY_COUNTS}
        self.assertEqual(counts, CATEGORY_COUNTS)

    def test_templating_uses_city_state_zip_and_leaves_no_placeholders(self):
        qs = build_questions(make_dealer())
        texts = " ".join(q.text for q in qs)
        self.assertNotIn("{", texts)
        self.assertNotIn("}", texts)
        self.assertIn("Raleigh, NC", texts)
        self.assertIn("27604", texts)
        self.assertEqual(qs[0].text, "What is the best used car dealer in Raleigh, NC?")

    def test_branded_questions_are_flagged_separately(self):
        qs = build_questions(make_dealer(competitors=["Harborline Motors", "Quillfield Auto Group"]))
        branded = [q for q in qs if q.branded]
        self.assertEqual(len(branded), 4)  # 2 reputation + 2 comparisons
        for q in qs:
            self.assertEqual(q.branded, "Sample Motors" in q.text, q.text)
        self.assertEqual({q.category for q in branded}, {"reputation", "comparison"})

    def test_comparisons_fall_back_when_no_competitors(self):
        comps = [q for q in build_questions(make_dealer()) if q.category == "comparison"]
        self.assertEqual(len(comps), 2)
        self.assertFalse(any(q.branded for q in comps))
        self.assertEqual(comps[0].text, "Compare the used car dealers in Raleigh, NC.")

    def test_brand_dealer_questions_when_brands_given(self):
        texts = [q.text for q in build_questions(make_dealer(brands=["Ford"])) if q.category == "find_dealer"]
        self.assertIn("Who is the best Ford dealer in Raleigh, NC?", texts)
        self.assertIn("Where can I buy a new Ford near 27604?", texts)
        two = [q.text for q in build_questions(make_dealer(brands=["Ford", "Toyota"])) if q.category == "find_dealer"]
        self.assertIn("Who is the best Toyota dealer in Raleigh, NC?", two)

    def test_inventory_samples_then_generic_models(self):
        d = make_dealer(inventory_samples=[
            {"year": 2021, "make": "Ford", "model": "F-150", "trim": "XLT", "url": "https://www.samplemotors.example/a/"},
            {"year": 2019, "make": "Toyota", "model": "RAV4"},
        ])
        cars = [q for q in build_questions(d) if q.category == "specific_car"]
        self.assertEqual(len(cars), 5)
        self.assertEqual([q.inventory_index for q in cars[:2]], [0, 1])
        self.assertEqual(cars[0].text, "Where can I buy a 2021 Ford F-150 XLT near Raleigh, NC?")
        self.assertTrue(all(q.inventory_index is None for q in cars[2:]))
        self.assertFalse(any("RAV4" in q.text for q in cars[2:]))  # no duplicate of a listed car

    def test_generic_model_questions_follow_the_brand(self):
        cars = [q for q in build_questions(make_dealer(brands=["Honda"])) if q.category == "specific_car"]
        self.assertTrue(all("Honda" in q.text for q in cars[:3]))
        self.assertIn("Where can I find a used Honda CR-V for sale in Raleigh, NC?", [q.text for q in cars])


# =========================================================================== name matching
class TestNameMatching(unittest.TestCase):
    def setUp(self):
        self.m = NameMatcher("Sample Motors", "samplemotors.example", PLACE)

    def assertNamed(self, text, how=None):
        r = self.m.match(text)
        self.assertTrue(r.named, text)
        if how:
            self.assertEqual(r.how, how, text)

    def assertNotNamed(self, text, matcher=None):
        self.assertFalse((matcher or self.m).match(text).named, text)

    def test_true_positives(self):
        self.assertNamed("I recommend Sample Motors on Capital Blvd.", "name")
        self.assertNamed("SAMPLE MOTORS has good reviews.", "name")
        self.assertNamed("Try Sample Motor Co. for trucks.", "name")
        self.assertNamed("Sample Motors of Raleigh is family-owned.", "name")
        self.assertNamed("Browse samplemotors.example for inventory.", "domain")
        self.assertNamed("Check out SampleMotors on Facebook.", "compact")
        self.assertNamed("Sampel Motors is family-owned.", "fuzzy")
        self.assertNamed("Sample Auto Sales on New Bern Ave has trucks.", "distinctive")

    def test_false_positives(self):
        self.assertNotNamed("Here is a sample of motors dealers in Raleigh.")
        self.assertNotNamed("Sample the local options before you buy.")
        self.assertNotNamed("Sample cars from these dealers vary in price.")
        self.assertNotNamed("Samples of used cars are everywhere.")
        self.assertNotNamed("Here is a sample Ford Explorer listing near you.")
        self.assertNotNamed("Harborline Motors and Quillfield Auto Group are popular.")
        self.assertNotNamed("")

    def test_brand_and_city_names_need_more_than_the_words(self):
        m = NameMatcher("Raleigh Ford", "raleighford.example", PLACE)
        self.assertNotNamed("There are many Raleigh Ford dealers in the area.", m)
        self.assertNotNamed("Compare Raleigh Ford prices online.", m)
        self.assertTrue(m.match("Try Raleigh Ford on Capital Blvd.").named)

    def test_sibling_store_of_another_brand_is_not_a_match(self):
        m = NameMatcher("Leith Honda", "", PLACE)
        self.assertNotNamed("Leith Toyota of Raleigh has a big lot.", m)
        self.assertTrue(m.match("Leith Honda has a large selection.").named)
        self.assertTrue(m.match("Leith Automotive Group owns several stores.").named)

    def test_extraction_of_other_businesses(self):
        text = (
            "Here are some options in Raleigh, NC:\n\n"
            "1. **Harborline Motors** – great selection of trucks.\n"
            "2. **Sample Motors** – family owned.\n"
            "3. **Toyota of Raleigh** – new and used inventory.\n\n"
            "Visit Quillfield Auto Group for trucks. CarMax also buys cars.\n"
            "Check listings on Cars.com, CarGurus and Kelley Blue Book. A used Toyota Camry or Ford F-150 is common here."
        )
        comps = [NameMatcher(c, "", PLACE) for c in ("Harborline Motors", "Quillfield Auto Group")]
        found = extract_named_dealers(text, self.m, comps, PLACE)
        self.assertEqual(set(found), {"Harborline Motors", "Quillfield Auto Group", "Toyota of Raleigh", "CarMax"})

    def test_extraction_groups_variants_under_the_competitor_name(self):
        comps = [NameMatcher("Harborline Motors", "", PLACE)]
        found = extract_named_dealers("**Harborline Motors of Raleigh** has trucks.", self.m, comps, PLACE)
        self.assertEqual(found, ["Harborline Motors"])


# =========================================================================== sources
class TestSources(unittest.TestCase):
    def test_classification_and_yelp_minimisation(self):
        analyzer = Analyzer(make_dealer())
        cites = {
            "yelp": Citation("https://www.yelp.com/biz/sample-motors-raleigh", "Sample Motors - 4.5 stars - Yelp"),
            "site": Citation("https://www.samplemotors.example/inventory/"),
            "cars": Citation("https://www.cars.com/dealers/123/harborline-motors/"),
            "google": Citation("https://maps.google.com/?cid=1"),
            "gurus": Citation("https://www.cargurus.com/Cars/m-Sample-Motors-sp1"),
            "other": Citation("https://www.raleighautoguide.example/best"),
        }
        for c in cites.values():
            analyzer.annotate_citation(c)
        self.assertEqual(cites["yelp"].source, "yelp")
        self.assertTrue(cites["yelp"].mentions_dealer)
        self.assertEqual(cites["yelp"].title, "")  # store no Yelp data (the link stays clickable)
        self.assertEqual(cites["site"].source, "dealer_site")
        self.assertTrue(cites["site"].is_dealer_site)
        self.assertEqual(cites["cars"].source, "cars.com")
        self.assertFalse(cites["cars"].mentions_dealer)
        self.assertEqual(cites["google"].source, "google")
        self.assertTrue(cites["gurus"].mentions_dealer)
        self.assertEqual(cites["other"].source, "other")


# =========================================================================== scoring
class TestScoring(unittest.TestCase):
    def test_presence_is_linear_to_the_full_credit_share(self):
        self.assertEqual(score_presence({"share": 0.25, "named": 36, "runs": 144})["earned"], 25.0)
        self.assertEqual(score_presence({"share": 0.8, "named": 115, "runs": 144})["earned"], 50.0)
        self.assertFalse(score_presence({"share": None})["assessed"])

    def test_sources_arithmetic(self):
        comp = score_sources({"answers": 100, "site_or_listing_answers": 15, "site_or_listing_share": 0.15,
                              "dealer_profile_platforms": ["google", "yelp"]})
        parts = {p["key"]: p["earned"] for p in comp["parts"]}
        self.assertEqual(parts, {"site_or_listings": 4.5, "profiles": 4.0})
        self.assertEqual(comp["earned"], 8.5)

    def test_reputation_vs_competitors(self):
        comp = score_reputation(load_dealer(SAMPLE_INPUT))  # 4.4/312 vs 4.6/890, 4.2/540, 4.7/205; Yelp unclaimed
        parts = {p["key"]: p["earned"] for p in comp["parts"]}
        self.assertEqual(parts, {"google_rating": 3.6, "google_reviews": 0.68, "yelp_claimed": 0.0})
        self.assertEqual(comp["earned"], 4.28)
        self.assertEqual(comp["assessed_max"], 20)

    def test_reputation_not_assessed_without_competitors_and_renormalised_total(self):
        rep = score_reputation(make_dealer(google_rating=4.8, google_review_count=900))
        self.assertFalse(rep["assessed"])
        self.assertTrue(all("not assessed" in p["detail"] for p in rep["parts"]))
        presence = score_presence({"share": 0.25, "named": 36, "runs": 144})
        sources = score_sources({"answers": 100, "site_or_listing_answers": 15, "site_or_listing_share": 0.15,
                                 "dealer_profile_platforms": ["google", "yelp"]})
        technical = score_technical({"mode": "skipped"})
        total = total_score([presence, sources, rep, technical], "Sample Motors", "Raleigh")
        self.assertEqual(total["assessed_max"], 65.0)
        self.assertEqual(total["score"], round(100 * 33.5 / 65))
        self.assertTrue(total["renormalised"])

    def test_technical_crawler_weights(self):
        dealer = load_dealer(SAMPLE_INPUT)
        site = run_site_check(dealer, MockFetcher(build_mock_site(dealer)), "mock")
        comp = score_technical(site)
        parts = {p["key"]: p["earned"] for p in comp["parts"]}
        # blocked GPTBot(1), ClaudeBot(1); PerplexityBot(2) partial = 1; the rest allowed: 12 of 15
        self.assertEqual(parts["crawler_access"], round(6 * 12 / 15, 2))
        self.assertEqual(parts["homepage"], 4.5)
        self.assertAlmostEqual(parts["vehicle_fields"], 4.5 * (1 + 2 / 3 + 2 / 3 + 1 + 2 / 3) / 5, places=2)

    def test_verdict_bands(self):
        self.assertEqual(verdict_for(85, "X", "Y")["band"], "Strong")
        self.assertEqual(verdict_for(57, "X", "Y")["band"], "Inconsistent")
        self.assertEqual(verdict_for(10, "X", "Y")["band"], "Not named")
        self.assertIn("X", verdict_for(10, "X", "Y")["line"])


# =========================================================================== robots.txt
ROBOTS = """# example
User-agent: *
Disallow: /admin/

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
User-agent: Claude-SearchBot
Disallow: /

User-agent: PerplexityBot
Disallow: /inventory/
Crawl-delay: 5

User-agent: bingbot
Allow: /
Sitemap: https://example.com/sitemap.xml
"""


class TestRobots(unittest.TestCase):
    def setUp(self):
        self.groups = parse_robots(ROBOTS)

    def test_statuses(self):
        ev = lambda token, paths=(): evaluate_bot(self.groups, token, paths)  # noqa: E731
        self.assertEqual(ev("GPTBot")["status"], "blocked")
        self.assertEqual(ev("ClaudeBot")["status"], "blocked")
        self.assertEqual(ev("Claude-SearchBot")["status"], "blocked")  # grouped user-agent lines
        self.assertEqual(ev("OAI-SearchBot")["status"], "not mentioned")
        self.assertEqual(ev("OAI-SearchBot")["effective"], "allowed")
        self.assertEqual(ev("Bingbot")["status"], "allowed")  # case-insensitive token match
        p = ev("PerplexityBot", ["/inventory/used-2021-ford/"])
        self.assertEqual((p["status"], p["effective"]), ("allowed", "partial"))

    def test_precedence_wildcards_and_ties(self):
        rules = [(False, "/"), (True, "/inventory/")]
        self.assertTrue(is_allowed(rules, "/inventory/car-1"))
        self.assertFalse(is_allowed(rules, "/about"))
        self.assertTrue(is_allowed([(False, "/page"), (True, "/page")], "/page"))  # a tie goes to Allow
        self.assertFalse(is_allowed([(False, "/*.pdf$")], "/brochure.pdf"))
        self.assertTrue(is_allowed([(False, "/*.pdf$")], "/brochure.pdf?x=1"))
        self.assertTrue(is_allowed([], "/anything"))

    def test_version_suffix_empty_disallow_and_merged_groups(self):
        g = parse_robots("User-agent: GPTBot/1.0\nDisallow:\n\nUser-agent: GPTBot\nDisallow: /private/\n")
        self.assertEqual(evaluate_bot(g, "GPTBot")["effective"], "allowed")
        self.assertEqual(evaluate_bot(g, "GPTBot", ["/private/x"])["effective"], "partial")

    def test_missing_and_unreachable_robots(self):
        missing = robots_report(FetchResult("https://x.example/robots.txt", 404), [])
        self.assertEqual(missing["state"], "missing")
        self.assertTrue(all(b["effective"] == "allowed" for b in missing["bots"]))
        down = robots_report(FetchResult("https://x.example/robots.txt", None, error="ConnectTimeout"), [])
        self.assertEqual(down["state"], "unreachable")
        self.assertTrue(all(b["effective"] == "unknown" for b in down["bots"]))


# =========================================================================== exposure
class TestExposure(unittest.TestCase):
    def test_formula_and_label(self):
        x = compute_exposure(make_dealer(cars_sold_per_month=30, avg_gross_per_car=2500))
        self.assertEqual(x["value"], 14250.0)
        self.assertEqual(x["label"], "monthly gross exposed to AI-assisted shoppers (not money lost)")
        self.assertEqual(x["source_note"], "Cox Automotive Car Buyer Journey Study, released Jan 2026: 19% of all car buyers used AI websites or AI-generated overviews")
        self.assertEqual(config.EXPOSURE["ai_assisted_share"], 0.19)

    def test_only_when_both_inputs_given(self):
        self.assertIsNone(compute_exposure(make_dealer(cars_sold_per_month=30)))
        self.assertIsNone(compute_exposure(make_dealer(avg_gross_per_car=2500)))
        self.assertEqual(compute_exposure(make_dealer(cars_sold_per_month=0, avg_gross_per_car=2500))["value"], 0.0)


# =========================================================================== vehicle-page checks
class TestVehicleFields(unittest.TestCase):
    def test_vin_price_mileage(self):
        self.assertTrue(vin_is_valid("1HGCM82633A004352"))
        self.assertTrue(vin_is_valid("1M8GDM9AXKP042788"))
        self.assertFalse(vin_is_valid("1HGCM82633A004353"))
        self.assertEqual(find_vin("Stock 12 VIN: 1HGCM82633A004352 Clean title"), "1HGCM82633A004352")
        self.assertEqual(find_vin("order id ABCDEFGH123456789 total"), "")
        self.assertTrue(has_price("Our price $18,995 plus fees"))
        self.assertFalse(has_price("Only $99 down"))
        self.assertTrue(has_mileage("Mileage: 45,000"))
        self.assertTrue(has_mileage("24,500 miles"))
        self.assertFalse(has_mileage("We deliver within 25 miles"))


# =========================================================================== site check over real HTTP (local server)
class _Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):  # noqa: N802
        self.server.hits.append(self.path)
        status, headers, body = self.server.routes.get(self.path, (404, {"Content-Type": "text/html"}, "<title>404</title>"))
        data = body.encode("utf-8")
        self.send_response(status)
        for k, v in headers.items():
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *args):
        pass


@contextmanager
def local_site(routes):
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), _Handler)
    server.routes, server.hits = routes, []
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        with mock.patch.dict(os.environ, {"NO_PROXY": "127.0.0.1,localhost", "no_proxy": "127.0.0.1,localhost"}):
            yield server
    finally:
        server.shutdown()
        server.server_close()


class TestSiteCheckLive(unittest.TestCase):
    def test_polite_live_check_against_a_local_server(self):
        car = "/inventory/used-2021-ford-f-150-xlt-1FTFW1E5XMFA00001/"
        html_headers = {"Content-Type": "text/html; charset=utf-8", "CF-RAY": "8f00aa-IAD", "Server": "cloudflare"}
        routes = {
            "/": (200, html_headers, f'<html><title>Home</title><a href="{car}">F-150</a> <a href="/about/">About</a></html>'),
            "/robots.txt": (200, {"Content-Type": "text/plain"}, "User-agent: *\nDisallow: /admin/\n\nUser-agent: GPTBot\nDisallow: /\n"),
            car: (200, html_headers, "<p>Price: $31,995</p><p>Mileage: 24,500 miles</p><p>VIN: 1HGCM82633A004352</p>"),
        }
        with local_site(routes) as server:
            dealer = make_dealer(website_url=f"http://127.0.0.1:{server.server_address[1]}/")
            site = run_site_check(dealer, LiveFetcher(delay=0), "live")
        self.assertTrue(site["homepage"]["ok"])
        self.assertEqual(site["robots"]["state"], "ok")
        bots = {b["token"]: b["effective"] for b in site["robots"]["bots"]}
        self.assertEqual(bots["GPTBot"], "blocked")
        self.assertEqual(bots["OAI-SearchBot"], "allowed")
        self.assertEqual(site["vehicle_page_source"], "homepage_links")
        page = site["vehicle_pages"][0]
        self.assertTrue(page["price"] and page["mileage"] and page["vin"])
        self.assertTrue(site["cloudflare"]["detected"])
        self.assertEqual(site["cloudflare"]["note"], config.CLOUDFLARE_NOTE)
        # one request per URL
        self.assertEqual(sorted(server.hits), sorted(["/", "/robots.txt", car]))
        self.assertEqual(site["requests"], 3)

    def test_challenge_page_is_reported(self):
        routes = {"/": (403, {"Content-Type": "text/html", "cf-mitigated": "challenge", "Server": "cloudflare"},
                        "<html><head><title>Just a moment...</title></head><body>cf-chl</body></html>")}
        with local_site(routes) as server:
            dealer = make_dealer(website_url=f"http://127.0.0.1:{server.server_address[1]}/")
            site = run_site_check(dealer, LiveFetcher(delay=0), "live")
        self.assertFalse(site["homepage"]["ok"])
        self.assertIn("Cloudflare challenge", site["homepage"]["challenge"])
        self.assertTrue(any("challenge page" in e for e in site["cloudflare"]["evidence"]))
        self.assertEqual(site["robots"]["state"], "missing")


class TestCloudflareFinding(unittest.TestCase):
    def test_exact_wording_and_detection(self):
        self.assertEqual(
            config.CLOUDFLARE_NOTE,
            "Cloudflare may block AI crawlers by default (policy since 2025-07-01); "
            "ask the website vendor to allow the crawlers you want",
        )
        hit = detect_cloudflare([("homepage", FetchResult("https://x.example/", 200, headers={"cf-ray": "abc-IAD"}, text="<p>hi</p>"))])
        self.assertTrue(hit["detected"])
        self.assertEqual(hit["note"], config.CLOUDFLARE_NOTE)
        miss = detect_cloudflare([("homepage", FetchResult("https://x.example/", 200, headers={"server": "nginx"}, text="<p>hi</p>"))])
        self.assertFalse(miss["detected"])
        self.assertEqual(miss["note"], "")

    def test_finding_is_reported_but_never_scored(self):
        dealer = load_dealer(SAMPLE_INPUT)
        site = run_site_check(dealer, MockFetcher(build_mock_site(dealer)), "mock")
        without = copy.deepcopy(site)
        without["cloudflare"] = {"detected": False, "evidence": [], "note": ""}
        self.assertEqual(score_technical(site)["earned"], score_technical(without)["earned"])
        html = render_report(sample_mock_results())
        self.assertIn(htmllib.escape(config.CLOUDFLARE_NOTE), html)


# =========================================================================== engine adapters (no network)
class TestAdapters(unittest.TestCase):
    def setUp(self):
        self.dealer = load_dealer(SAMPLE_INPUT)
        self.question = build_questions(self.dealer)[0]

    def test_openai_request_shape_and_parsing(self):
        client, session = fake_http([FakeResponse(200, OPENAI_RESPONSE)])
        engine = OpenAIEngine(model="gpt-5.4-mini", key=FAKE_KEYS["OPENAI_API_KEY"], http=client)
        answer = engine.ask(self.question, self.dealer, 1)
        call = session.calls[0]
        self.assertEqual(call["url"], "https://api.openai.com/v1/responses")
        self.assertEqual(call["headers"]["Authorization"], "Bearer " + FAKE_KEYS["OPENAI_API_KEY"])
        body = call["json"]
        self.assertEqual(body["tools"][0]["type"], "web_search")
        self.assertEqual(body["tools"][0]["user_location"], {
            "type": "approximate", "city": "Raleigh", "region": "North Carolina", "country": "US", "timezone": "America/New_York"})
        self.assertEqual(body["include"], ["web_search_call.action.sources"])
        self.assertEqual(body["reasoning"], {"effort": "low"})
        self.assertIsNone(answer.error)
        self.assertIn("Harborline Motors", answer.text)
        self.assertEqual(len(answer.citations), 2)
        self.assertEqual(answer.usage["searches"], 1)
        self.assertAlmostEqual(answer.usage["cost_usd"], 0.019675, places=6)
        self.assertEqual(answer.model, "gpt-5.4-mini-2026-03-17")

    def test_openai_non_reasoning_model_gets_no_reasoning_block(self):
        engine = OpenAIEngine(model="gpt-4.1-mini", key="k", http=None)
        self.assertNotIn("reasoning", engine.build_payload(self.question, self.dealer))

    def test_perplexity_agent_api_request_and_citation_markers(self):
        client, session = fake_http([FakeResponse(200, PERPLEXITY_RESPONSE)])
        engine = PerplexityEngine(model="perplexity/sonar", key=FAKE_KEYS["PERPLEXITY_API_KEY"], http=client)
        answer = engine.ask(self.question, self.dealer, 2)
        body = session.calls[0]["json"]
        self.assertEqual(session.calls[0]["url"], "https://api.perplexity.ai/v1/agent")
        self.assertEqual(body["model"], "perplexity/sonar")
        self.assertEqual(body["tools"][0], {"type": "web_search", "user_location": {"city": "Raleigh", "region": "North Carolina", "country": "US"}})
        self.assertEqual([c.url for c in answer.citations], [
            "https://www.yelp.com/biz/harborline-motors-raleigh", "https://www.samplemotors.example/used-inventory/"])
        self.assertEqual(answer.usage["cost_usd"], 0.00425)
        self.assertEqual(answer.usage["cost_source"], "api")
        self.assertEqual(answer.usage["searches"], 1)

    def test_perplexity_preset_override(self):
        engine = PerplexityEngine(model="perplexity/sonar", key="k", settings={"PERPLEXITY_PRESET": "fast"})
        body = engine.build_payload(self.question, self.dealer)
        self.assertEqual(body["preset"], "fast")
        self.assertNotIn("model", body)

    def test_anthropic_request_shape_and_parsing(self):
        client, session = fake_http([FakeResponse(200, ANTHROPIC_RESPONSE)])
        engine = AnthropicEngine(model="claude-sonnet-5", key=FAKE_KEYS["ANTHROPIC_API_KEY"], http=client)
        answer = engine.ask(self.question, self.dealer, 3)
        call = session.calls[0]
        self.assertEqual(call["url"], "https://api.anthropic.com/v1/messages")
        self.assertEqual(call["headers"]["anthropic-version"], "2023-06-01")
        tool = call["json"]["tools"][0]
        self.assertEqual((tool["type"], tool["name"], tool["max_uses"]), ("web_search_20250305", "web_search", 3))
        self.assertEqual(tool["user_location"]["type"], "approximate")
        self.assertEqual(answer.text, "Based on reviews, Harborline Motors is highly rated.")
        self.assertEqual(len(answer.citations), 1)
        self.assertEqual(answer.usage["searches"], 1)
        self.assertAlmostEqual(answer.usage["cost_usd"], 12000 * 2e-6 + 700 * 1e-5 + 0.01, places=6)

    def test_anthropic_pause_turn_is_continued(self):
        first = {"model": "claude-sonnet-5", "stop_reason": "pause_turn", "content": ANTHROPIC_RESPONSE["content"][1:3],
                 "usage": {"input_tokens": 5000, "output_tokens": 100, "server_tool_use": {"web_search_requests": 1}}}
        second = {"model": "claude-sonnet-5", "stop_reason": "end_turn", "content": ANTHROPIC_RESPONSE["content"][4:],
                  "usage": {"input_tokens": 6000, "output_tokens": 300}}
        client, session = fake_http([FakeResponse(200, first), FakeResponse(200, second)])
        answer = AnthropicEngine(model="claude-sonnet-5", key="k", http=client).ask(self.question, self.dealer, 1)
        self.assertEqual(len(session.calls), 2)
        msgs = session.calls[1]["json"]["messages"]
        self.assertEqual(msgs[1], {"role": "assistant", "content": first["content"]})
        self.assertEqual((answer.usage["input_tokens"], answer.usage["output_tokens"], answer.usage["searches"]), (11000, 400, 1))
        self.assertEqual(answer.text, "Harborline Motors is highly rated.")

    def test_retry_with_backoff_honours_retry_after(self):
        sleeps = []
        client, session = fake_http(
            [FakeResponse(429, {"error": {"message": "slow down"}}, headers={"retry-after": "7"}), FakeResponse(200, {"ok": True})],
            sleeps=sleeps,
        )
        data, retries = client.post_json("https://api.example/x", {}, {})
        self.assertEqual((data, retries), ({"ok": True}, 1))
        self.assertEqual(sleeps, [7.0])

    def test_retries_are_bounded(self):
        sleeps = []
        client, session = fake_http([FakeResponse(500, {"error": {"message": "boom"}})] * 4, sleeps=sleeps)
        with self.assertRaises(HttpError) as ctx:
            client.post_json("https://api.example/x", {}, {})
        self.assertEqual(ctx.exception.status, 500)
        self.assertEqual(len(session.calls), 1 + config.HTTP["max_retries"])
        self.assertEqual(len(sleeps), config.HTTP["max_retries"])

    def test_bad_key_stops_the_engine_after_one_call(self):
        client, session = fake_http(lambda n: FakeResponse(401, {"error": {"message": "invalid key"}}))
        engine = OpenAIEngine(model="gpt-5.4-mini", key="k", http=client)
        first = engine.ask(self.question, self.dealer, 1)
        second = engine.ask(self.question, self.dealer, 2)
        self.assertIn("HTTP 401", first.error)
        self.assertIn("refused the API key", second.error)
        self.assertEqual(len(session.calls), 1)

    def test_redactor_layers(self):
        r = Redactor(["plain-secret-value-123"])
        self.assertEqual(r.values("a plain-secret-value-123 b"), "a [REDACTED] b")
        self.assertEqual(r("key sk-ant-api03-abcdefghijklmnop1234 here"), "key [REDACTED] here")  # shape layer
        self.assertEqual(r("Authorization: Bearer abcdefghijklmnop1234"), "Authorization: Bearer [REDACTED]")
        self.assertTrue(r.leaks("x plain-secret-value-123"))
        self.assertFalse(r.leaks(r.values("x plain-secret-value-123")))

    def test_error_messages_are_redacted(self):
        key = FAKE_KEYS["OPENAI_API_KEY"]
        redact = Redactor([key])
        client, _ = fake_http([FakeResponse(400, {"error": {"message": f"Incorrect API key provided: {key}"}})], redact=redact)
        answer = OpenAIEngine(model="gpt-5.4-mini", key=key, http=client, redact=redact).ask(self.question, self.dealer, 1)
        self.assertIn("[REDACTED]", answer.error)
        self.assertNotIn(key, answer.error)
        self.assertNotIn(key, repr(OpenAIEngine(model="m", key=key)))


# =========================================================================== inputs, keys and cost
class TestInputsAndSettings(unittest.TestCase):
    def test_validation(self):
        with self.assertRaises(InputError):
            parse_dealer({"dealership_name": "X", "website_url": "x.com", "city": "Raleigh", "state": "NC"})
        with self.assertRaises(InputError):
            make_dealer(yelp_claimed="yes")
        d = make_dealer(state="North Carolina", competitors=["A", "B", "C", "D"], website_url="samplemotors.example")
        self.assertEqual((d.state_code, d.state_name, d.timezone), ("NC", "North Carolina", "America/New_York"))
        self.assertEqual(d.competitors, ["A", "B", "C"])
        self.assertTrue(any("first 3" in w for w in d.warnings))
        self.assertEqual(d.website_url, "https://samplemotors.example")

    def test_settings_come_from_environment_then_env_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            env_file = Path(tmp) / ".env"
            env_file.write_text("ANTHROPIC_API_KEY=from-file-value-123\nUNRELATED_SECRET=zzz\n", encoding="utf-8")
            settings, sources = load_settings([env_file], environ={"OPENAI_API_KEY": "from-env-value-123"})
        self.assertEqual(settings["OPENAI_API_KEY"], "from-env-value-123")
        self.assertEqual(sources["OPENAI_API_KEY"], "environment")
        self.assertEqual(settings["ANTHROPIC_API_KEY"], "from-file-value-123")
        self.assertNotIn("UNRELATED_SECRET", settings)

    def test_cost_estimate_arithmetic(self):
        self.assertAlmostEqual(estimate_cost("openai", "gpt-5.4-mini", 1_000_000, 0, 0, 0), 0.75)
        self.assertAlmostEqual(estimate_cost("anthropic", "claude-sonnet-5", 0, 0, 1_000_000, 0), 10.0)
        self.assertAlmostEqual(estimate_cost("perplexity", "perplexity/sonar", 0, 0, 0, 1000), 2.5)
        self.assertIsNone(estimate_cost("openai", "unknown-model", 1, 0, 1, 1))
        rows, totals = scan_cli.cost_estimate(list(config.ENGINE_ORDER), 3, {})
        self.assertEqual([r["calls"] for r in rows], [60, 60, 60])
        self.assertLess(totals["low"], totals["typical"])
        self.assertLess(totals["typical"], totals["high"])


# =========================================================================== end to end (mock) + compliance
class TestEndToEndMock(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.out = Path(cls.tmp.name) / "out"
        cls.chrome = find_chrome()
        args = ["--input", str(SAMPLE_INPUT), "--out", str(cls.out), "--mock", "--quiet",
                "--env-file", str(Path(cls.tmp.name) / "no.env")]
        if cls.chrome:
            args.append("--pdf")
        with mock.patch.dict(os.environ, env_without_keys(FAKE_KEYS), clear=True), no_network():
            cls.code, cls.stdout, cls.stderr = run_cli(args)
        cls.results = json.loads((cls.out / "results.json").read_text(encoding="utf-8"))
        cls.html = (cls.out / "report.html").read_text(encoding="utf-8")

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def test_writes_all_three_files(self):
        self.assertEqual(self.code, 0)
        for name in ("results.json", "report.html", "usage_log.csv"):
            self.assertGreater((self.out / name).stat().st_size, 500, name)
        if not self.chrome:
            self.skipTest("Chrome not found: PDF not checked")
        pdf = (self.out / "report.pdf").read_bytes()
        self.assertEqual(pdf[:5], b"%PDF-")
        pages = max(int(n) for n in re.findall(rb"/Count (\d+)", pdf))
        self.assertGreaterEqual(pages, 5)
        self.assertGreater(pdf.count(b"/URI"), 5)  # citations stay clickable in the PDF

    def test_results_content(self):
        r = self.results
        self.assertEqual(r["tool"]["mode"], "mock")
        self.assertEqual(len(r["questions"]), 20)
        self.assertEqual(len(r["answers"]), 20 * 3 * 3)
        self.assertEqual(r["presence"]["runs"], 16 * 3 * 3)
        self.assertTrue(0 <= r["score"]["score"] <= 100)
        self.assertEqual(len(r["fixes"]), 3)
        self.assertEqual(r["exposure"]["value"], 45 * 0.19 * 2400)
        self.assertEqual(r["usage"]["calls"], 180)
        self.assertEqual(len((self.out / "usage_log.csv").read_text(encoding="utf-8").strip().splitlines()), 182)

    def test_no_key_value_in_any_output(self):
        blobs = {p.name: p.read_bytes() for p in self.out.iterdir() if p.is_file()}
        self.assertGreaterEqual(len(blobs), 3)
        blobs["<stdout+stderr>"] = (self.stdout + self.stderr).encode()
        for name, data in blobs.items():
            for key in FAKE_KEYS.values():
                self.assertNotIn(key.encode(), data, f"{key[:10]}... found in {name}")

    def test_rule_every_shown_answer_has_clickable_sources_next_to_it(self):
        articles = re.findall(r'<article class="card answer" data-answer="([^"]+)">(.*?)</article>', self.html, re.S)
        self.assertGreaterEqual(len(articles), 3)
        by_key = {f'{a["engine"]}:{a["question_id"]}:{a["run"]}': a for a in self.results["answers"]}
        for key, body in articles:
            answer = by_key[htmllib.unescape(key)]
            expected = [c["url"] for c in answer["citations"] if c["url"].startswith(("http://", "https://"))]
            hrefs = [htmllib.unescape(h) for h in re.findall(r'<a href="([^"]+)" target="_blank" rel="noopener noreferrer">', body)]
            self.assertEqual(hrefs, expected, key)
            self.assertLess(body.index("answer-text"), body.index("answer-sources"))

    def test_rule_no_logos_marks_or_partner_wording(self):
        low = self.html.lower()
        for banned in ("<img", "favicon", "logo", "data:image", "powered by", "partner"):
            self.assertNotIn(banned, low, banned)
        self.assertEqual(low.count("<svg"), 1)
        self.assertIn('id="score-dial"', self.html)
        self.assertIn("Answer from the OpenAI API", self.html)  # products named as plain text

    def test_rule_gemini_never_appears(self):
        self.assertNotIn("gemini", config.ENGINES)
        self.assertNotIn("gemini", ENGINE_CLASSES)
        with self.assertRaises(ValueError):
            parse_engine_list("openai,gemini")
        self.assertNotIn("gemini", self.html.lower())
        dealer = load_dealer(SAMPLE_INPUT)
        dealer.manual_notes = "Rep compared Gemini answers with Google AI Mode."
        results = mock_results(dealer)
        self.assertNotIn("gemini", render_report(results).lower())
        self.assertTrue(any("left out of the report" in w for w in results["warnings"]))

    def test_rule_exposure_is_labelled_exposure_not_money_lost(self):
        self.assertIn("monthly gross exposed to AI-assisted shoppers (not money lost)", self.html)
        low = self.html.lower()
        self.assertEqual(low.count("money lost"), low.count("(not money lost)"))

    def test_report_never_promises_outcomes(self):
        low = self.html.lower()
        for phrase in ("guarantee", "rank #", "#1 ", "more leads", "more sales", "increase sales", "increase traffic",
                       "more traffic", "boost your ranking", "lost revenue", "losing money"):
            self.assertNotIn(phrase, low, phrase)

    def test_sample_label_on_every_printed_page(self):
        self.assertIn('@top-center{content:"SAMPLE — mock data"', self.html)
        self.assertIn("SAMPLE — mock data", self.html)
        live = copy.deepcopy(self.results)
        live["tool"]["mode"] = "live"
        self.assertNotIn("SAMPLE — mock data", render_report(live))

    def test_method_box_and_footer(self):
        self.assertIn("Prepared by AutoLander &middot; autolander.ai", self.html)
        self.assertIn("AutoLander is not affiliated with OpenAI, Perplexity or Anthropic.", self.html)
        live = copy.deepcopy(self.results)
        live["tool"]["mode"] = "live"
        live["scan"]["date"] = "2026-09-27"
        self.assertIn(
            "Answers collected through each engine's official API on September 27, 2026, 3 runs per question, "
            "location set to Raleigh, NC. Answers vary run to run. AutoLander is not affiliated with OpenAI, "
            "Perplexity or Anthropic.",
            render_report(live),
        )

    def test_no_yelp_titles_or_snippets_stored(self):
        blob = json.dumps(self.results)
        self.assertNotIn("snippet", blob)
        self.assertNotIn("cited_text", blob)
        yelp = [c for a in self.results["answers"] for c in a["citations"] + a["consulted"] if c["source"] == "yelp"]
        self.assertTrue(yelp)
        self.assertTrue(all(c["title"] == "" for c in yelp))


class TestCliAndLiveSafety(unittest.TestCase):
    def test_no_keys_means_no_calls(self):
        with tempfile.TemporaryDirectory() as tmp:
            args = ["--input", str(SAMPLE_INPUT), "--out", str(Path(tmp) / "o"), "--quiet", "--site", "skip",
                    "--env-file", str(Path(tmp) / "no.env")]
            with mock.patch.dict(os.environ, env_without_keys(), clear=True), no_network():
                code, _, err = run_cli(args)
        self.assertEqual(code, 3)
        self.assertIn("no engine has an API key", err)

    def test_unknown_engine_is_rejected(self):
        self.assertEqual(run_cli(["--engines", "gemini", "--estimate", "--quiet"])[0], 2)

    def test_estimate_prints_a_total_without_calls(self):
        with no_network():
            code, out, _ = run_cli(["--estimate", "--env-file", "does-not-exist.env"])
        self.assertEqual(code, 0)
        self.assertRegex(out, r"TOTAL\s+\$\s*\d+\.\d\d\s+\$\s*\d+\.\d\d\s+\$\s*\d+\.\d\d")

    def test_network_guard_really_blocks_requests(self):
        with no_network(), self.assertRaises(AssertionError):
            requests.get("http://127.0.0.1:9/")

    def test_hostile_dealer_name_cannot_inject_html(self):
        dealer = load_dealer(SAMPLE_INPUT)
        dealer.dealership_name = 'Evil</style><script>alert(1)</script> "Motors"'
        html = render_report(mock_results(dealer))
        self.assertNotIn("<script>", html)
        self.assertEqual(html.count("</style>"), 1)

    def test_method_box_names_skipped_engines(self):
        dealer = load_dealer(SAMPLE_INPUT)
        engines, _ = build_engines(["openai", "anthropic"], {}, mock=True)
        skipped = [{"engine": "perplexity", "label": "Perplexity API", "reason": "PERPLEXITY_API_KEY is not set"}]
        html = render_report(run_scan(dealer, engines, skipped=skipped))
        self.assertIn("Not included in this scan: Perplexity API.", html)
        self.assertNotIn("PERPLEXITY_API_KEY", html)

    def test_live_path_outputs_never_contain_the_key(self):
        key = "unshaped-secret-value-0123456789-abcdef"  # no known key shape: only exact-value redaction can catch it
        redact = Redactor([key])
        client, session = fake_http(lambda n: FakeResponse(400, {"error": {"message": f"bad request for key {key}"}}), redact=redact)
        engines, _ = build_engines(["openai"], {"OPENAI_API_KEY": key}, mock=False, http=client, redact=redact)
        results = run_scan(load_dealer(SAMPLE_INPUT), engines, runs=1, workers_per_engine=1)
        self.assertEqual(len(session.calls), 20)
        html = render_report(results)
        with tempfile.TemporaryDirectory() as tmp:
            paths = write_outputs(results, html, tmp, redact)
            for p in paths.values():
                self.assertNotIn(key, Path(p).read_text(encoding="utf-8"))
        self.assertIn("[REDACTED]", usage_csv(results))
        self.assertIn("20 of 20 engine calls failed", html)


if __name__ == "__main__":
    unittest.main()
