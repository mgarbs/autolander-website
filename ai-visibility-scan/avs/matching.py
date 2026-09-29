"""Text heuristics: dealer-name matching, extraction of other businesses named in an
answer, URL/domain helpers and citation-source classification.

Matching is deliberately conservative: a false "named" inflates the score, so every
looser rule needs extra evidence (a proper-noun form plus a dealer word next to it).
"""

import re
import unicodedata
from collections import Counter
from typing import NamedTuple
from urllib.parse import parse_qsl, unquote_plus, urlencode, urlparse, urlunparse

from .vehicles import MODEL_TOKENS_BY_BRAND

LEGAL_SUFFIXES = {"inc", "llc", "ltd", "co", "corp", "corporation", "company", "llp", "pllc", "dba", "incorporated"}
CONNECTORS = {"the", "of", "and", "at", "on", "in", "by", "for", "de", "la"}

DEALER_NOUNS = {
    "motors", "motor", "motorcars", "motorcar", "motorsports", "auto", "autos", "automotive", "automobiles",
    "automobile", "cars", "car", "sales", "group", "dealership", "dealer", "imports", "import", "trucks",
    "truck", "superstore", "outlet", "mall", "automall", "autoplex", "preowned", "center", "centre",
    "exchange", "wholesale", "leasing", "chevy", "cdjr", "cjdr", "autogroup", "autosales", "carstore",
}
GENERIC_WORDS = DEALER_NOUNS | LEGAL_SUFFIXES | CONNECTORS | {
    "used", "new", "certified", "pre", "owned", "best", "top", "quality", "value", "discount", "family", "city",
    "country", "express", "plus", "select", "world", "usa", "america", "american", "national", "premier",
    "elite", "prime", "credit", "finance", "financing", "buy", "here", "pay", "bhph", "suv", "suvs", "vans",
    "van", "fleet", "enterprises", "enterprise", "holdings", "dealers", "dealerships", "lot", "lots",
}
BRANDS = {
    "acura", "alfa", "romeo", "audi", "bentley", "bmw", "buick", "cadillac", "chevrolet", "chevy", "chrysler",
    "dodge", "ferrari", "fiat", "ford", "genesis", "gmc", "honda", "hyundai", "infiniti", "jaguar", "jeep",
    "kia", "lamborghini", "land", "rover", "lexus", "lincoln", "lucid", "maserati", "mazda", "mclaren",
    "mercedes", "benz", "mini", "mitsubishi", "nissan", "polestar", "porsche", "ram", "rivian", "subaru",
    "suzuki", "tesla", "toyota", "volkswagen", "vw", "volvo", "cdjr", "cjdr",
}
# Words that, right after a brand-plus-city name with no distinctive word, make the phrase
# descriptive ("Raleigh Ford dealers") rather than a business name ("Raleigh Ford").
DESCRIPTIVE_FOLLOWERS = {
    "dealer", "dealers", "dealership", "dealerships", "lot", "lots", "store", "stores", "option", "options",
    "buyer", "buyers", "shopper", "shoppers", "area", "areas", "region", "market", "markets", "listing",
    "listings", "inventory", "model", "models", "owner", "owners", "vehicle", "vehicles", "truck", "trucks",
    "suv", "suvs", "car", "cars", "price", "prices", "deal", "deals", "incentive", "incentives",
}
# Businesses that are marketplaces, review sites, lenders or AI products, not dealers.
NON_DEALER_NAMES = [
    "cars com", "cargurus", "car gurus", "autotrader", "auto trader", "edmunds", "kelley blue book", "kbb",
    "truecar", "true car", "carfax", "facebook", "facebook marketplace", "marketplace", "craigslist", "yelp",
    "google", "better business bureau", "bbb", "dealerrater", "dealer rater", "consumer reports", "jd power",
    "j d power", "nada", "reddit", "youtube", "capital one", "carsdirect", "cars direct", "iseecars", "autolist",
    "offerup", "autotempest", "cox automotive", "openai", "perplexity", "anthropic", "chatgpt", "claude", "bing",
    "microsoft", "apple", "instagram", "tiktok", "nextdoor", "autocheck", "black book", "credit karma",
    "lendingtree", "carsforsale", "cars for sale",
]
KNOWN_RETAILERS = {
    "carmax": "CarMax", "carvana": "Carvana", "autonation": "AutoNation", "vroom": "Vroom",
    "drivetime": "DriveTime", "echopark": "EchoPark", "car mart": "America's Car-Mart",
}
# Sentence-start words that get capitalised and glued onto a business name.
LEAD_STRIP = {
    "visit", "try", "consider", "check", "contact", "call", "see", "both", "also", "then", "compare", "comparing",
    "while", "whereas", "however", "overall", "meanwhile", "additionally", "finally", "first", "second", "third",
    "next", "lastly", "top", "best", "many", "some", "most", "several", "other", "these", "those", "this", "that",
    "here", "there", "if", "for", "at", "from", "with", "and", "or", "the", "a", "an", "is", "are", "was", "were",
    "like", "include", "including", "near", "in", "on", "to", "by", "local", "popular", "reputable", "trusted",
    "recommended", "nearby", "used", "new", "vs", "versus", "yes", "no", "note", "tip", "pros", "cons", "why",
    "what", "which", "who", "where", "how", "when", "option", "options", "choice", "pick", "winner", "verdict",
}
# Words that end a business name when they trail it ("Harborline Motors Inventory").
TRAIL_STRIP = {
    "inventory", "reviews", "review", "rating", "ratings", "location", "locations", "website", "site", "team",
    "service", "financing", "specials", "program", "programs", "page", "listing", "listings", "profile",
    "store", "stores", "showroom", "suv", "suvs", "vehicles", "vehicle", "trade", "offer", "offers",
}
NON_NAME_WORDS = {"program", "programs", "guide", "tips", "report", "loan", "loans", "warranty", "value", "values"}

_WORD_RE = re.compile(r"&|[A-Za-z0-9][A-Za-z0-9'’.\-]*")
_ABBREV = {"co.", "inc.", "jr.", "sr.", "st.", "mt.", "ft.", "corp.", "ltd.", "bros."}
_BOLD_RE = re.compile(r"\*\*([^*\n]{2,90})\*\*|__([^_\n]{2,90})__")
_HEADING_RE = re.compile(r"^\s{0,3}#{1,6}\s+(?:\d+[.)]\s*)?(.{2,90})$", re.M)
_LIST_LEAD_RE = re.compile(r"^\s*(?:\d+[.)]|[-*•])\s+([A-Z][^\n:|–—(]{2,70}?)(?:\s+[–—-]\s|:|\s*\(|\s*$)", re.M)


# --------------------------------------------------------------------------- text basics
def strip_accents(text):
    return "".join(c for c in unicodedata.normalize("NFKD", text) if not unicodedata.combining(c))


def normalize_text(text):
    """Lowercase ASCII words separated by single spaces ("Sam's Pre-Owned" -> "sam pre owned")."""
    t = strip_accents(str(text or "")).lower()
    t = t.replace("&", " and ").replace("’", "'").replace("`", "'")
    t = re.sub(r"'s\b", "", t)
    t = re.sub(r"[^a-z0-9]+", " ", t)
    return t.strip()


def tokens(text):
    return normalize_text(text).split()


def stem(tok):
    return tok[:-1] if len(tok) > 3 and tok.endswith("s") and not tok.endswith("ss") else tok


def osa_distance(a, b, limit=2):
    """Optimal-string-alignment edit distance (a swap of two letters counts as one edit)."""
    if abs(len(a) - len(b)) > limit:
        return limit + 1
    prev2, prev = None, list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        cur = [i] + [0] * len(b)
        for j in range(1, len(b) + 1):
            cost = 0 if a[i - 1] == b[j - 1] else 1
            cur[j] = min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
            if i > 1 and j > 1 and a[i - 1] == b[j - 2] and a[i - 2] == b[j - 1]:
                cur[j] = min(cur[j], prev2[j - 2] + 1)
        prev2, prev = prev, cur
    return prev[-1]


def token_close(a, b):
    """Same word, allowing a plural/singular difference or one typo in words of 5+ letters."""
    if a == b or stem(a) == stem(b):
        return True
    if min(len(a), len(b)) >= 5 and a[0] == b[0] and not (a.isdigit() or b.isdigit()):
        limit = 1 if max(len(a), len(b)) < 9 else 2
        return osa_distance(a, b, limit) <= limit
    return False


# --------------------------------------------------------------------------- URLs and domains
_MULTI_PART_SUFFIXES = {"co.uk", "org.uk", "ac.uk", "com.au", "net.au", "co.nz", "com.mx", "com.br", "co.jp", "co.za", "co.in"}


def host_of(url):
    if not url:
        return ""
    u = url.strip()
    if "://" not in u:
        u = "http://" + u
    try:
        host = (urlparse(u).hostname or "").lower().rstrip(".")
    except ValueError:
        return ""
    for prefix in ("www.", "m."):
        if host.startswith(prefix) and host.count(".") >= 2:
            host = host[len(prefix):]
    return host


def registrable_domain(host):
    """'shop.samplemotors.com' -> 'samplemotors.com' (good enough for dealer and listing sites)."""
    if not host:
        return ""
    if re.fullmatch(r"[\d.]+", host) or ":" in host or "." not in host:
        return host
    parts = host.split(".")
    if len(parts) >= 3 and ".".join(parts[-2:]) in _MULTI_PART_SUFFIXES:
        return ".".join(parts[-3:])
    return ".".join(parts[-2:])


def domain_of(url):
    return registrable_domain(host_of(url))


def normalize_url(url):
    """Drop fragments and utm_* tracking parameters (engines append utm_source=...)."""
    raw = (url or "").strip()
    try:
        p = urlparse(raw)
    except ValueError:
        return raw
    if not p.scheme or not p.netloc:
        return raw
    query = [(k, v) for k, v in parse_qsl(p.query, keep_blank_values=True) if not k.lower().startswith("utm_")]
    return urlunparse((p.scheme.lower(), p.netloc.lower(), p.path or "/", "", urlencode(query), ""))


def same_url(a, b):
    return bool(a and b) and normalize_url(a).rstrip("/") == normalize_url(b).rstrip("/")


SOURCE_BY_DOMAIN = {
    "cars.com": "cars.com",
    "cargurus.com": "cargurus",
    "autotrader.com": "autotrader",
    "yelp.com": "yelp",
    "yelp.ca": "yelp",
    "google.com": "google",
    "goo.gl": "google",
    "g.co": "google",
    "g.page": "google",
    "share.google": "google",
    "dealerrater.com": "dealerrater",
    "facebook.com": "facebook",
    "fb.com": "facebook",
    "fb.me": "facebook",
}
SOURCE_LABELS = {
    "cars.com": "Cars.com",
    "cargurus": "CarGurus",
    "autotrader": "Autotrader",
    "yelp": "Yelp",
    "google": "Google",
    "dealerrater": "DealerRater",
    "facebook": "Facebook",
    "dealer_site": "Your website",
    "other": "Other sites",
}
SOURCE_ORDER = ("dealer_site", "cars.com", "cargurus", "autotrader", "google", "yelp", "dealerrater", "facebook", "other")
# review/listing platforms where a dealer can hold a profile or listings
PROFILE_SOURCES = ("cars.com", "cargurus", "autotrader", "google", "yelp", "dealerrater", "facebook")


def classify_source(domain, dealer_domain):
    if dealer_domain and domain == dealer_domain:
        return "dealer_site"
    return SOURCE_BY_DOMAIN.get(domain, "other")


def url_words(url):
    """Words from a URL's path and query ('/biz/sample-motors-raleigh' -> 'biz sample motors raleigh')."""
    try:
        p = urlparse(url or "")
    except ValueError:
        return ""
    raw = unquote_plus(p.path + " " + p.query)
    return " ".join(w for w in re.split(r"[^A-Za-z0-9]+", raw) if w)


# --------------------------------------------------------------------------- name matching
class MatchResult(NamedTuple):
    named: bool
    how: str = ""
    evidence: str = ""


class NameMatcher:
    """Decides whether a text names one specific business.

    Rules, strongest first: the full name (plural/possessive tolerant) -> the website
    domain -> the name written without spaces -> the name with one typo -> the
    distinctive word(s) written as a proper noun directly before a dealer word.
    """

    def __init__(self, name, domain="", place_words=()):
        self.name = (name or "").strip()
        toks = tokens(self.name)
        core = [t for t in toks if t not in LEGAL_SUFFIXES]
        while core and core[0] == "the":
            core = core[1:]
        self.core = core or toks
        self.core_stem = [stem(t) for t in self.core]
        self.place = {t for w in place_words for t in tokens(w)}
        self.brands_in_name = [t for t in self.core if t in BRANDS]
        self.distinctive = [
            t for t in self.core
            if t not in GENERIC_WORDS and t not in BRANDS and t not in self.place and not t.isdigit() and len(t) >= 3
        ]
        self.domain = (domain or "").lower()
        self.compact = "".join(self.core)
        self._context = DEALER_NOUNS | BRANDS | set(self.core) | {"pre"}
        self._context_stems = {stem(w) for w in self._context}

    def match(self, text):
        if not text or not self.core:
            return MatchResult(False)
        words = tokens(text)
        stems = [stem(t) for t in words]
        n = len(self.core_stem)

        # 1. the name itself
        for i in range(len(stems) - n + 1):
            if stems[i:i + n] == self.core_stem:
                follower = stems[i + n] if i + n < len(stems) else ""
                if not self.distinctive and follower in {stem(w) for w in DESCRIPTIVE_FOLLOWERS}:
                    continue  # "Raleigh Ford dealers" describes a category, not this business
                return MatchResult(True, "name", " ".join(words[i:i + n]))

        # 2. the website domain written out
        if self.domain and "." in self.domain:
            if re.search(r"(?<![a-z0-9-])" + re.escape(self.domain) + r"(?![a-z0-9-])", str(text).lower()):
                return MatchResult(True, "domain", self.domain)

        # 3. spacing variants ("SampleMotors", "Pre Owned" vs "Preowned"); the plain spaced
        #    name was already handled (with its descriptive-phrase guard) by rule 1
        if len(self.compact) >= 8:
            for size in sorted({max(1, n - 1), n, n + 1}):
                for i in range(len(words) - size + 1):
                    window = words[i:i + size]
                    if window == self.core or "".join(window) != self.compact:
                        continue
                    follower = stem(words[i + size]) if i + size < len(words) else ""
                    if not self.distinctive and follower in {stem(w) for w in DESCRIPTIVE_FOLLOWERS}:
                        continue
                    return MatchResult(True, "compact", " ".join(window))

        # 4. one typo, only when the name has a distinctive word
        if self.distinctive:
            for i in range(len(words) - n + 1):
                window = words[i:i + n]
                if all(token_close(a, b) for a, b in zip(window, self.core)) and any(
                    token_close(w, d) for w in window for d in self.distinctive
                ):
                    return MatchResult(True, "fuzzy", " ".join(window))

        # 5. distinctive word(s) as a proper noun right before a dealer word
        if self.distinctive:
            hit = self._distinctive_match(str(text))
            if hit:
                return hit
        return MatchResult(False)

    def _distinctive_match(self, text):
        found = [(m.group(0), m.start()) for m in _WORD_RE.finditer(text)]
        norm = [normalize_text(w).replace(" ", "") for w, _ in found]
        dist = self.distinctive
        k = len(dist)
        for i in range(len(found) - k):
            if not all(norm[i + j] and token_close(norm[i + j], dist[j]) for j in range(k)):
                continue
            first = found[i][0]
            if not first[0].isupper():
                continue  # "a sample of dealers" is not a name
            j = i + k
            nxt_raw, nxt = found[j][0], norm[j]
            if not nxt or not (nxt_raw[0].isupper() or nxt_raw[0].isdigit()):
                continue  # "Sample cars from..." at a sentence start
            if nxt not in self._context and stem(nxt) not in self._context_stems:
                continue
            if nxt in BRANDS and self.brands_in_name and nxt not in self.brands_in_name:
                continue  # "Leith Toyota" is a sibling store, not "Leith Honda"
            prev_word, prev_pos = found[j - 1]
            gap = text[prev_pos + len(prev_word):found[j][1]]
            if prev_word.endswith(".") or not re.fullmatch(r"[ \t\-]{1,3}", gap):
                continue  # the two words must belong to one phrase
            return MatchResult(True, "distinctive", text[found[i][1]:found[j][1] + len(nxt_raw)])
        return None


# --------------------------------------------------------------------------- business extraction
def canonical_key(name, place=()):
    toks = [t for t in tokens(name) if t not in LEGAL_SUFFIXES]
    while toks and toks[0] == "the":
        toks = toks[1:]
    # "Harborline Motors of Raleigh" -> "harborline motor"; keep "Toyota of Raleigh" whole
    trimmed = list(toks)
    while trimmed and trimmed[-1] in place:
        trimmed.pop()
    while trimmed and trimmed[-1] in {"of", "in", "at"}:
        trimmed.pop()
    distinctive = [t for t in trimmed if t not in GENERIC_WORDS and t not in BRANDS and t not in place]
    if trimmed and distinctive:
        toks = trimmed
    return " ".join(stem(t) for t in toks)


def _clean_candidate(raw):
    text = re.sub(r"\[\d+\]", "", raw or "")
    text = re.sub(r"\s+", " ", text).strip(" \t*_#:;,.!?-–—\"'()[]")
    words = text.split(" ")
    while words and normalize_text(words[0]) in LEAD_STRIP:
        words = words[1:]
    while words and (normalize_text(words[-1]) in TRAIL_STRIP or normalize_text(words[-1]) in CONNECTORS):
        words = words[:-1]
    return " ".join(words).strip(" ,.:;")


def _capitalized_runs(text):
    """Runs of Capitalised Words (connectors allowed inside) within one phrase."""
    runs, current, last_end = [], [], None
    for m in _WORD_RE.finditer(text):
        word = m.group(0)
        gap = text[last_end:m.start()] if last_end is not None else ""
        breaks = last_end is not None and not re.fullmatch(r"[ \t\-]{0,3}", gap)
        is_connector = word.lower() in {"of", "&", "the", "de", "la"}
        is_cap = word[0].isupper() or word[0].isdigit()
        if breaks or not (is_cap or (is_connector and current)):
            if current:
                runs.append(current)
            current = []
            if is_cap:
                current = [word]
        else:
            current.append(word)
        if current and word.endswith(".") and word.lower() not in _ABBREV:
            runs.append(current)
            current = []
        last_end = m.end()
    if current:
        runs.append(current)
    out = []
    for run in runs:
        while run and run[-1].lower() in {"of", "&", "the", "de", "la"}:
            run = run[:-1]
        if 2 <= len(run) <= 7:
            out.append(" ".join(run))
    return out


def looks_like_dealer(name, place=()):
    toks = tokens(name)
    if not toks or len(toks) > 7:
        return False
    norm = " ".join(toks)
    if any(norm == x or norm.startswith(x + " ") for x in NON_DEALER_NAMES):
        return False
    if norm in KNOWN_RETAILERS:
        return True
    if any(t in NON_NAME_WORDS for t in toks):
        return False
    has_pre_owned = "pre owned" in norm
    brands = [t for t in toks if t in BRANDS]
    if not (brands or has_pre_owned or any(t in DEALER_NOUNS for t in toks)):
        return False
    for b in brands:  # "Toyota Camry", "Ford F 150": a brand plus one of its models
        models = MODEL_TOKENS_BY_BRAND.get(b, set())
        if any(t in models for t in toks if t not in BRANDS):
            return False
    distinctive = [
        t for t in toks
        if t not in GENERIC_WORDS and t not in BRANDS and t not in place and not t.isdigit() and len(t) >= 2
    ]
    if distinctive:
        return True
    # No distinctive word: only "Raleigh Ford" / "Ford of Raleigh" style names qualify.
    places = [t for t in toks if t in place]
    if brands and places and toks[-1] not in DESCRIPTIVE_FOLLOWERS:
        return all(t in BRANDS or t in place or t in DEALER_NOUNS or t in {"of", "and"} for t in toks)
    return False


def extract_named_dealers(text, dealer_matcher=None, competitor_matchers=(), place_words=()):
    """Best-effort list of other dealerships an answer names (the scanned dealer excluded)."""
    if not text:
        return []
    place = {t for w in place_words for t in tokens(w)}
    found = {}

    def add(display):
        key = canonical_key(display, place)
        if key and key not in found:
            found[key] = display

    for cm in competitor_matchers:
        if cm.match(text).named:
            add(cm.name)

    candidates = []
    for m in _BOLD_RE.finditer(text):
        candidates.append(m.group(1) or m.group(2))
    candidates += [m.group(1) for m in _HEADING_RE.finditer(text)]
    candidates += [m.group(1) for m in _LIST_LEAD_RE.finditer(text)]
    candidates += _capitalized_runs(re.sub(r"\*\*|__", " ", text))

    for raw in candidates:
        display = _clean_candidate(raw)
        if not display:
            continue
        alias = next((cm for cm in competitor_matchers if cm.match(display).named), None)
        if alias:
            add(alias.name)
            continue
        if dealer_matcher is not None and dealer_matcher.match(display).named:
            continue
        if looks_like_dealer(display, place):
            add(display)

    padded = " " + normalize_text(text) + " "
    for key, display in KNOWN_RETAILERS.items():
        if f" {key} " in padded:
            add(display)

    # drop a name that is a shorter piece of another name found in the same answer
    keys = list(found)
    keep = []
    for k in keys:
        kt = k.split()
        contained = any(
            other != k and len(other.split()) > len(kt)
            and any(other.split()[i:i + len(kt)] == kt for i in range(len(other.split()) - len(kt) + 1))
            for other in keys
        )
        if not contained:
            keep.append(found[k])
    return keep


def most_common_display(displays):
    """Pick the most frequent spelling of a business name (ties -> the shortest)."""
    counts = Counter(displays)
    return sorted(counts, key=lambda d: (-counts[d], len(d), d))[0]
