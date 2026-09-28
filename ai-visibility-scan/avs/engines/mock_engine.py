"""Deterministic fixture answers so the whole pipeline and report run offline (--mock).

Each answer is seeded from (engine, question, run, dealer), so the same input always
produces the same report. The mix is realistic on purpose: the dealer is named in
some runs and not others, competitors appear, and citations point at cars.com,
cargurus, autotrader, yelp, google, dealerrater, facebook, the dealer's site and a
generic guide page. No network call is ever made.
"""

import hashlib
import random

from ..config import ENGINES
from ..matching import normalize_text
from ..models import Answer
from .base import Engine, citation, dedupe_citations, make_usage

FICTIONAL_COMPETITORS = [
    "Harborline Motors",
    "Quillfield Auto Group",
    "Brightwater Pre-Owned",
    "Kestrel Auto Exchange",
    "Northgate Drive Autos",
]

# Chance the dealer is named in a question-run that does not mention it by name.
NAME_RATE = {
    "openai": {"find_dealer": 0.30, "specific_car": 0.55, "reputation": 0.25, "comparison": 0.35, "trade_in": 0.20},
    "perplexity": {"find_dealer": 0.35, "specific_car": 0.60, "reputation": 0.30, "comparison": 0.40, "trade_in": 0.25},
    "anthropic": {"find_dealer": 0.15, "specific_car": 0.35, "reputation": 0.15, "comparison": 0.20, "trade_in": 0.10},
}
BRANDED_RATE = {"openai": 0.97, "perplexity": 0.97, "anthropic": 0.88}

BLURBS = {
    "find_dealer": [
        "large pre-owned selection with upfront online pricing",
        "strong recent Google reviews for a no-pressure process",
        "known for trucks and SUVs",
        "offers financing for a range of credit situations",
        "family-owned with a long local track record",
        "well-reviewed service department",
    ],
    "trade_in": [
        "quick online appraisals and same-day offers",
        "buys trade-ins even if you purchase elsewhere",
        "known for fair offers on trucks and SUVs",
        "clear appraisal process reviewers describe as straightforward",
    ],
}
INTROS = {
    "find_dealer": [
        "Here are dealerships in {place} that come up often in recent reviews and listings:",
        "Based on reviews and current listings, these dealers near {zip} are worth a look:",
        "A few well-regarded options in {place}:",
    ],
    "reputation": ["Dealers in {place} that reviewers describe as trustworthy:"],
    "comparison": ["Here is how some of the used car dealers in {place} compare:"],
    "trade_in": [
        "Popular places to trade in a car around {place}:",
        "These dealers near {zip} are frequently mentioned for trade-in offers:",
    ],
}
OUTROS = [
    "Inventory changes quickly, so check current listings on Cars.com or CarGurus before you visit.",
    "Read recent reviews on Google and Yelp to compare how each dealer treats buyers.",
    "Call ahead to confirm availability and ask for an out-the-door price.",
]
PLATFORMS = ("cars.com", "cargurus", "autotrader", "google", "yelp", "dealerrater", "facebook")
REVIEW_PLATFORMS = ("google", "yelp", "dealerrater", "facebook")
# The scanned dealer's own pages are cited only on review platforms in the fixtures, so a
# sample report shows the common gap: marketplaces cited for competitors, never for you.
DEALER_PLATFORMS = REVIEW_PLATFORMS


def _slug(name):
    return normalize_text(name).replace(" ", "-")


def _num(name):
    return int(hashlib.sha256(name.encode("utf-8")).hexdigest()[:6], 16) % 900000 + 100000


class MockEngine(Engine):
    mock = True

    def __init__(self, engine_name, **kwargs):
        self.name = engine_name
        super().__init__(model="mock", **kwargs)
        self.label = ENGINES[engine_name]["label"]

    @property
    def priced_as(self):
        return ENGINES[self.name]["default_model"]

    # ------------------------------------------------------------------ helpers
    def _rng(self, question, run, dealer):
        seed = hashlib.sha256(f"{self.name}|{question.id}|{run}|{dealer.dealership_name}".encode("utf-8")).hexdigest()
        return random.Random(int(seed[:16], 16))

    @staticmethod
    def _competitors(dealer):
        own = normalize_text(dealer.dealership_name)
        names = []
        for n in list(dealer.competitors) + FICTIONAL_COMPETITORS:
            if n and normalize_text(n) != own and n not in names:
                names.append(n)
        return names

    @staticmethod
    def _profile(name, platform, dealer):
        city, st = dealer.city, (dealer.state_code or dealer.state)
        slug, num = _slug(name), _num(name)
        title_slug = "-".join(w.capitalize() for w in slug.split("-"))
        city_slug = _slug(city)
        if platform == "cars.com":
            return citation(f"https://www.cars.com/dealers/{num}/{slug}/", f"{name} - {city}, {st} | Cars.com")
        if platform == "cargurus":
            return citation(f"https://www.cargurus.com/Cars/m-{title_slug}-sp{num}", f"{name} in {city}, {st} - CarGurus")
        if platform == "autotrader":
            return citation(
                f"https://www.autotrader.com/car-dealers/{city_slug}-{st.lower()}-{dealer.zip}/{num}/{slug}",
                f"{name} | Autotrader",
            )
        if platform == "google":
            return citation(f"https://www.google.com/maps/place/{name.replace(' ', '+')}", f"{name} - Google Maps")
        if platform == "yelp":
            return citation(f"https://www.yelp.com/biz/{slug}-{city_slug}", f"{name} - {city} - Yelp")
        if platform == "dealerrater":
            return citation(f"https://www.dealerrater.com/dealer/{title_slug}-review-{num}/", f"{name} Reviews | DealerRater")
        return citation(f"https://www.facebook.com/{slug.replace('-', '')}", f"{name} | Facebook")

    @staticmethod
    def _dealer_page(dealer, path="used-inventory/"):
        root = dealer.website_url.split("?")[0].split("#")[0]
        root = root if root.endswith("/") else root + "/"
        return citation(root + path, f"Used Inventory | {dealer.dealership_name}")

    # ------------------------------------------------------------------ answer
    def _ask(self, question, dealer, run):
        rng = self._rng(question, run, dealer)
        place, name = dealer.place, dealer.dealership_name
        rate = BRANDED_RATE[self.name] if question.branded else NAME_RATE[self.name][question.category]
        named = rng.random() < rate
        pool = self._competitors(dealer)
        if question.competitor and question.competitor in pool:
            pool.remove(question.competitor)
        others = rng.sample(pool, k=min(len(pool), rng.randint(2, 4)))
        if question.competitor:
            others = [question.competitor] + others[:2]
        sample = None
        if question.inventory_index is not None and question.inventory_index < len(dealer.inventory_samples):
            sample = dealer.inventory_samples[question.inventory_index]

        if question.category == "specific_car":
            text = self._car_answer(rng, question, dealer, named, others)
        elif question.category == "reputation" and question.branded:
            text = self._review_answer(rng, dealer, named, others)
        elif question.category == "comparison" and question.competitor:
            text = self._versus_answer(rng, dealer, named, question.competitor)
        else:
            text = self._list_answer(rng, question, dealer, named, others)

        cites = []
        if named:
            roll = rng.random()
            if sample is not None and sample.url and roll < 0.7:
                cites.append(citation(sample.url, f"{sample.label} | {name}"))
            elif roll < 0.5:
                cites.append(self._dealer_page(dealer))
            if rng.random() < 0.6:
                cites.append(self._profile(name, rng.choice(DEALER_PLATFORMS), dealer))
        mentioned = [o for o in others if f"**{o}**" in text]
        for other in mentioned[:3]:
            if rng.random() < 0.75:
                platforms = REVIEW_PLATFORMS if question.category == "reputation" else PLATFORMS
                cites.append(self._profile(other, rng.choice(platforms), dealer))
        if rng.random() < 0.35 or len(cites) < 2:
            city_slug = _slug(dealer.city)
            cites.append(citation(
                f"https://www.{city_slug.replace('-', '')}autoguide.example/best-used-car-dealers",
                f"Best Used Car Dealers in {dealer.city} (Local Guide)",
            ))
        consulted = cites + [self._profile(o, rng.choice(PLATFORMS), dealer) for o in others[:2]]

        searches = rng.choice((1, 1, 2, 2, 3))
        usage = make_usage(
            self.name, self.priced_as,
            input_tokens=5000 + rng.randint(0, 6000) + 2500 * (searches - 1),
            output_tokens=450 + rng.randint(0, 650),
            searches=searches,
            source="mock (synthetic usage, nothing billed)",
        )
        return Answer(
            self.name, "mock", question.id, run, text=text,
            citations=dedupe_citations(cites), consulted=dedupe_citations(consulted), usage=usage,
        )

    @staticmethod
    def _list_answer(rng, question, dealer, named, others):
        kind = question.category if question.category in INTROS else "find_dealer"
        blurbs = BLURBS["trade_in" if kind == "trade_in" else "find_dealer"]
        intro = rng.choice(INTROS[kind]).format(place=dealer.place, zip=dealer.zip)
        entries = [(o, rng.choice(blurbs)) for o in others]
        if named:
            entries.insert(rng.randint(0, len(entries)), (dealer.dealership_name, rng.choice(blurbs)))
        lines = [intro, ""] + [f"{i}. **{n}** – {b}." for i, (n, b) in enumerate(entries, 1)] + ["", rng.choice(OUTROS)]
        return "\n".join(lines)

    @staticmethod
    def _car_answer(rng, question, dealer, named, others):
        label, place = question.subject, dealer.place
        if named:
            first = f"**{dealer.dealership_name}** in {dealer.city} currently lists a {label}."
            second = f"Similar vehicles also appear at **{others[0]}**" + (f" and **{others[1]}**." if len(others) > 1 else ".")
        else:
            first = f"Listings for a {label} near {place} currently appear at **{others[0]}**" + (
                f" and **{others[1]}**." if len(others) > 1 else "."
            )
            second = "Availability changes daily, so confirm the VIN and price with the dealer before visiting."
        third = rng.choice([
            f"Cars.com, CarGurus and Autotrader let you filter listings by distance from {dealer.zip}.",
            "Ask for the vehicle history report and an out-the-door price before you go.",
        ])
        return " ".join([first, second, third])

    @staticmethod
    def _review_answer(rng, dealer, named, others):
        if not named:
            return (
                "I could not find enough recent, reliable information about that specific dealership. "
                f"Well-reviewed options nearby include **{others[0]}** and **{others[1]}**."
            )
        rating = ""
        if dealer.google_rating is not None and dealer.google_review_count:
            rating = f", with about a {dealer.google_rating:.1f}-star average across roughly {dealer.google_review_count} Google reviews"
        good = rng.choice(["a straightforward buying process", "helpful, low-pressure salespeople", "fair trade-in offers"])
        watch = rng.choice(["wait times on busy weekends", "add-on fees worth asking about", "limited weekend hours"])
        return (
            f"**{dealer.dealership_name}** is generally well reviewed{rating}. Reviewers mention {good}; "
            f"a few mention {watch}. For comparison, **{others[0]}** is another well-reviewed dealer in {dealer.city}."
        )

    @staticmethod
    def _versus_answer(rng, dealer, named, competitor):
        if not named:
            return (
                f"**{competitor}** is one of the larger used-car dealers in {dealer.city}, with a wide selection and "
                "strong review volume. I could not find enough detail to compare it with the other dealership you named."
            )
        edge = rng.choice(["transparent pricing", "a friendly sales team", "quick financing approvals"])
        return (
            f"**{dealer.dealership_name}** and **{competitor}** both sell used vehicles in {dealer.city}. "
            f"{competitor} usually has the larger inventory, while {dealer.dealership_name} gets praise for {edge}. "
            "Compare out-the-door prices and recent reviews before deciding."
        )
