"""Site technical check with plain HTTP GETs: one request per URL, a pause between URLs,
no retries, a normal browser user-agent. Checks robots.txt rules for AI crawlers, whether
the homepage answers 200 (a bot-protection layer shows up as 403 or a challenge page),
and whether price, mileage and VIN appear as plain text in vehicle-page HTML.

The Cloudflare finding is reported only (never scored) and never claims which crawlers
are blocked; only robots.txt or a response can show that.
"""

import json
import re
import time
from dataclasses import dataclass, field
from html.parser import HTMLParser
from typing import Optional
from urllib.parse import urljoin, urlparse

import requests

from . import config
from .matching import domain_of
from .robots import evaluate_bot, parse_robots


@dataclass
class FetchResult:
    url: str
    status: Optional[int] = None
    final_url: str = ""
    headers: dict = field(default_factory=dict)  # lower-case names
    text: str = ""
    error: Optional[str] = None
    elapsed_s: float = 0.0


class LiveFetcher:
    def __init__(self, user_agent=None, timeout=None, delay=None, max_bytes=None, sleep=time.sleep):
        opts = config.SITE_CHECK
        self.user_agent = user_agent or opts["user_agent"]
        self.timeout = timeout if timeout is not None else opts["timeout"]
        self.delay = delay if delay is not None else opts["delay_between_requests"]
        self.max_bytes = max_bytes or opts["max_bytes"]
        self.sleep = sleep
        self._last = None
        self.log = []

    def fetch(self, url):
        if self._last is not None:
            wait = self.delay - (time.monotonic() - self._last)
            if wait > 0:
                self.sleep(wait)
        headers = {
            "User-Agent": self.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }
        started = time.monotonic()
        self.log.append(url)
        try:
            with requests.get(url, headers=headers, timeout=(10, self.timeout), allow_redirects=True, stream=True) as resp:
                chunks, size = [], 0
                for chunk in resp.iter_content(65536):
                    chunks.append(chunk)
                    size += len(chunk)
                    if size >= self.max_bytes:
                        break
                body = b"".join(chunks)[: self.max_bytes]
                declared = "charset" in (resp.headers.get("content-type") or "").lower()
                try:
                    text = body.decode((resp.encoding if declared else None) or "utf-8", errors="replace")
                except LookupError:
                    text = body.decode("utf-8", errors="replace")
                return FetchResult(
                    url, resp.status_code, resp.url, {k.lower(): v for k, v in resp.headers.items()}, text, None,
                    round(time.monotonic() - started, 2),
                )
        except requests.RequestException as exc:
            return FetchResult(url, None, url, {}, "", type(exc).__name__, round(time.monotonic() - started, 2))
        finally:
            self._last = time.monotonic()


class MockFetcher:
    """Canned responses for --mock runs; no network."""

    def __init__(self, pages):
        self.pages = pages
        self.log = []

    def fetch(self, url):
        self.log.append(url)
        hit = self.pages.get(url) or self.pages.get(url.rstrip("/")) or self.pages.get(url.rstrip("/") + "/")
        if hit is None:
            return FetchResult(url, 404, url, {"content-type": "text/html"}, "<html><title>Not found</title></html>")
        status, headers, text = hit
        return FetchResult(url, status, url, dict(headers), text, None, 0.0)


# --------------------------------------------------------------------------- HTML helpers
class _PageParser(HTMLParser):
    SKIP = {"script", "style", "noscript", "template", "svg"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.text, self.links, self.jsonld, self.title = [], [], [], []
        self._skip, self._in_title, self._in_jsonld = 0, False, False

    def handle_starttag(self, tag, attrs):
        a = {k: (v or "") for k, v in attrs}
        if tag == "a" and a.get("href"):
            self.links.append(a["href"])
        if tag == "title":
            self._in_title = True
        if tag == "script" and a.get("type", "").lower() == "application/ld+json":
            self._in_jsonld = True
        if tag in self.SKIP:
            self._skip += 1

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        if tag == "script":
            self._in_jsonld = False
        if tag in self.SKIP and self._skip:
            self._skip -= 1

    def handle_data(self, data):
        if self._in_title:
            self.title.append(data)
        if self._in_jsonld:
            self.jsonld.append(data)
        if not self._skip:
            self.text.append(data)


def parse_page(html):
    parser = _PageParser()
    try:
        parser.feed(html or "")
        parser.close()
    except Exception:  # malformed HTML: keep whatever was parsed
        pass
    return {
        "text": re.sub(r"\s+", " ", " ".join(parser.text)).strip(),
        "links": parser.links,
        "jsonld": "\n".join(parser.jsonld),
        "title": " ".join(" ".join(parser.title).split()),
    }


_PRICE_RE = re.compile(r"\$\s?(\d{1,3}(?:,\d{3})+|\d{4,6})(?:\.\d{2})?(?![\d,])")
_MILEAGE_RES = [
    re.compile(r"(?i)\b(?:mileage|odometer)\s*[:\-]?\s*(?:\d{1,3}(?:,\d{3})+|\d{1,7})\b"),
    re.compile(r"(?i)(?<!within )(?<!up to )\b(?:\d{1,3}(?:,\d{3})+|\d{3,7})\s*(?:mi|miles)\b"),
    re.compile(r"(?i)\b\d{1,3}(?:\.\d)?\s?k\s*(?:mi|miles)\b"),
]
_VIN_RE = re.compile(r"(?<![A-Z0-9])([A-HJ-NPR-Z0-9]{17})(?![A-Z0-9])")
_VIN_VALUES = {**{str(d): d for d in range(10)}, **dict(zip("ABCDEFGH", range(1, 9))), **dict(zip("JKLMN", range(1, 6))),
               "P": 7, "R": 9, **dict(zip("STUVWXYZ", range(2, 10)))}
_VIN_WEIGHTS = (8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2)


def vin_check_digit(vin):
    total = sum(_VIN_VALUES[c] * w for c, w in zip(vin.upper(), _VIN_WEIGHTS))
    rem = total % 11
    return "X" if rem == 10 else str(rem)


def vin_is_valid(vin):
    v = (vin or "").upper()
    return bool(re.fullmatch(r"[A-HJ-NPR-Z0-9]{17}", v)) and v[8] == vin_check_digit(v)


def has_price(text):
    for m in _PRICE_RE.finditer(text or ""):
        if 1000 <= int(m.group(1).replace(",", "")) <= 500000:
            return True
    return False


def has_mileage(text):
    return any(r.search(text or "") for r in _MILEAGE_RES)


def find_vin(text):
    upper = (text or "").upper()
    for m in _VIN_RE.finditer(upper):
        v = m.group(1)
        if sum(c.isdigit() for c in v) < 3 or sum(c.isalpha() for c in v) < 2:
            continue
        labelled = re.search(r"VIN\W{0,6}$", upper[max(0, m.start() - 12):m.start()])
        if vin_is_valid(v) or labelled:
            return v
    return ""


_YEAR_RE = re.compile(r"(?<!\d)(19[89]\d|20[0-4]\d)(?!\d)")
_VEHICLE_HINT = re.compile(r"(inventory|vehicle|used|new|pre-owned|preowned|certified|vdp|detail|listing|for-sale)", re.I)
_VIN_IN_PATH = re.compile(r"(?i)(?<![a-z0-9])[a-hj-npr-z0-9]{17}(?![a-z0-9])")


def discover_vehicle_links(links, base_url, dealer_domain, limit=None):
    limit = limit or config.SITE_CHECK["max_vehicle_pages"]
    found = []
    for href in links:
        url = urljoin(base_url, href.strip())
        p = urlparse(url)
        if p.scheme not in ("http", "https") or domain_of(url) != dealer_domain:
            continue
        path = p.path
        if not _VEHICLE_HINT.search(path):
            continue
        if not ((_YEAR_RE.search(path) and re.search(r"[a-z]{3,}", path.lower())) or _VIN_IN_PATH.search(path)):
            continue
        clean = url.split("#")[0]
        if clean not in found:
            found.append(clean)
        if len(found) >= limit:
            break
    return found


_CHALLENGE_TITLES = ("just a moment", "attention required", "access denied", "pardon our interruption",
                     "request unsuccessful", "are you a robot", "verify you are human", "security check", "one more step")
_CHALLENGE_MARKERS = ("cf-chl", "/cdn-cgi/challenge-platform/h/", "_incapsula_resource", "incapsula incident",
                      "px-captcha", "datadome", "sucuri website firewall")


def detect_challenge(result):
    """A bot-protection response instead of the page, or '' if none is visible."""
    if result is None or result.status is None:
        return ""
    headers = result.headers or {}
    if (headers.get("cf-mitigated") or "").lower() == "challenge":
        return "Cloudflare challenge (cf-mitigated header)"
    body = (result.text or "")[:40000].lower()
    title = parse_page(body[:20000])["title"].lower()
    if any(t in title for t in _CHALLENGE_TITLES) and (result.status != 200 or len(body) < 20000):
        return f"challenge page ('{title[:60]}')"
    if result.status in (401, 403, 429, 503) and any(m in body for m in _CHALLENGE_MARKERS):
        return f"bot-protection page (HTTP {result.status})"
    return ""


def detect_cloudflare(labelled_results):
    evidence = []
    for label, r in labelled_results:
        if r is None or r.status is None:
            continue
        h = r.headers or {}
        if "cf-ray" in h:
            evidence.append(f"cf-ray header on the {label} response")
        elif "cloudflare" in (h.get("server") or "").lower():
            evidence.append(f"'server: cloudflare' header on the {label} response")
        body = (r.text or "")[:40000].lower()
        title = parse_page(body[:20000])["title"].lower() if body else ""
        if (h.get("cf-mitigated") or "").lower() == "challenge" or (
            r.status in (403, 503) and ("cf-chl" in body or "just a moment" in title)
        ):
            evidence.append(f"Cloudflare challenge page on the {label} response")
        elif "/cdn-cgi/challenge-platform/" in body:
            evidence.append(f"Cloudflare bot-detection script on the {label} page")
    evidence = list(dict.fromkeys(evidence))
    return {"detected": bool(evidence), "evidence": evidence, "note": config.CLOUDFLARE_NOTE if evidence else ""}


def check_vehicle_page(url, result, source):
    page = parse_page(result.text) if result.text else {"text": "", "jsonld": ""}
    ld = page["jsonld"].lower()
    ok = result.status == 200 and not result.error
    return {
        "url": url,
        "source": source,
        "status_code": result.status,
        "error": result.error or ("" if ok else f"HTTP {result.status}"),
        "price": ok and has_price(page["text"]),
        "mileage": ok and has_mileage(page["text"]),
        "vin": ok and bool(find_vin(page["text"])),
        "structured_data": {
            "price": ok and '"price"' in ld,
            "mileage": ok and "mileagefromodometer" in ld,
            "vin": ok and "vehicleidentificationnumber" in ld,
        },
    }


def robots_report(result, paths):
    base = {"url": result.url, "status_code": result.status}
    bots = []
    if result.error or result.status is None:
        state, note = "unreachable", f"robots.txt could not be fetched ({result.error or 'no response'})"
    elif result.status == 200:
        state, note = "ok", ""
    elif result.status in (401, 403):
        state, note = "denied", f"robots.txt returned HTTP {result.status} to a normal browser"
    elif 400 <= result.status < 500:
        state, note = "missing", f"no robots.txt (HTTP {result.status}): nothing is disallowed"
    else:
        state, note = "unreachable", f"robots.txt returned HTTP {result.status}"
    groups = parse_robots(result.text) if state == "ok" else []
    for bot in config.AI_BOTS:
        entry = {k: bot[k] for k in ("token", "owner", "role", "weight")}
        if state in ("ok", "missing"):
            entry.update(evaluate_bot(groups, bot["token"], paths))
        else:
            entry.update({"status": "unknown", "effective": "unknown", "detail": note, "blocked_paths": []})
        bots.append(entry)
    return dict(base, state=state, note=note, bots=bots)


def run_site_check(dealer, fetcher, mode):
    started = time.monotonic()
    home = fetcher.fetch(dealer.website_url)
    parsed_home = parse_page(home.text) if home.text else None
    challenge = detect_challenge(home)
    homepage = {
        "url": dealer.website_url,
        "status_code": home.status,
        "final_url": home.final_url,
        "ok": home.status == 200 and not challenge and not home.error,
        "challenge": challenge,
        "error": home.error or "",
        "elapsed_s": home.elapsed_s,
    }
    p = urlparse(dealer.website_url)
    robots_result = fetcher.fetch(f"{p.scheme}://{p.netloc}/robots.txt")

    urls = [s.url for s in dealer.inventory_samples if s.url]
    source = "inventory_samples"
    if not urls and parsed_home:
        urls = discover_vehicle_links(parsed_home["links"], home.final_url or dealer.website_url, domain_of(dealer.website_url))
        source = "homepage_links"
    urls = list(dict.fromkeys(u for u in urls if u != dealer.website_url))[: config.SITE_CHECK["max_vehicle_pages"]]
    fetched = [(u, fetcher.fetch(u)) for u in urls]
    pages = [check_vehicle_page(u, r, source) for u, r in fetched]
    paths = [urlparse(u).path or "/" for u in urls]

    labelled = [("homepage", home), ("robots.txt", robots_result)] + [("vehicle page", r) for _, r in fetched]
    return {
        "mode": mode,
        "homepage": homepage,
        "robots": robots_report(robots_result, paths),
        "vehicle_pages": pages,
        "vehicle_page_source": source if urls else "none",
        "cloudflare": detect_cloudflare(labelled),
        "requests": len(fetcher.log),
        "urls_fetched": list(fetcher.log),
        "elapsed_s": round(time.monotonic() - started, 2),
    }


def skipped_site_check(reason):
    return {"mode": "skipped", "reason": reason}


# --------------------------------------------------------------------------- mock site
def _vin(body16):
    """Turn 16 VIN characters (check digit position omitted) into a valid 17-character VIN."""
    draft = body16[:8] + "0" + body16[8:]
    return draft[:8] + vin_check_digit(draft) + draft[9:]


def build_mock_site(dealer):
    """Fixture pages for --mock runs: Cloudflare-fronted, two AI crawlers blocked,
    Perplexity kept out of /inventory/, and vehicle pages of mixed quality."""
    p = urlparse(dealer.website_url)
    root = f"{p.scheme}://{p.netloc}/"
    html_headers = {"content-type": "text/html; charset=utf-8", "server": "cloudflare", "cf-ray": "8f00000000000000-IAD"}
    robots = (
        "# fixture robots.txt (mock scan)\n"
        "User-agent: *\nDisallow: /admin/\nDisallow: /cart\n\n"
        "User-agent: GPTBot\nDisallow: /\n\n"
        "User-agent: ClaudeBot\nDisallow: /\n\n"
        "User-agent: PerplexityBot\nDisallow: /inventory/\n\n"
        f"Sitemap: {root}sitemap.xml\n"
    )
    vins = [_vin(v) for v in ("1FTFW1E5MFA00001", "2T3F1RFV6KW00002", "1HGCV1F3LA000003",
                              "1GCUYDED4JZ00004", "1C4RJFAG6NC00005")]
    samples = list(dealer.inventory_samples)
    if not any(s.url for s in samples):
        samples = [
            type("Car", (), {"label": label, "url": f"{root}inventory/used-{slug}-{vins[i].lower()}/"})()
            for i, (label, slug) in enumerate([("2021 Ford F-150 XLT", "2021-ford-f-150-xlt"),
                                               ("2019 Toyota RAV4 LE", "2019-toyota-rav4-le"),
                                               ("2020 Honda Accord Sport", "2020-honda-accord-sport")])
        ]
    links = "".join(f'<a href="{s.url}">{s.label}</a>' for s in samples if s.url)
    pages = {
        dealer.website_url: (200, html_headers, (
            f"<html><head><title>{dealer.dealership_name} | Used Cars in {dealer.city}</title></head><body>"
            f"<h1>{dealer.dealership_name}</h1><p>Used cars, trucks and SUVs in {dealer.place}.</p>"
            f'<nav><a href="{root}used-inventory/">Used inventory</a> {links}</nav></body></html>'
        )),
        root + "robots.txt": (200, {"content-type": "text/plain", "server": "cloudflare", "cf-ray": "8f00000000000001-IAD"}, robots),
    }
    for i, s in enumerate(samples):
        if not getattr(s, "url", ""):
            continue
        vin = vins[i % len(vins)]
        price, miles = 18995 + 2750 * i, 18450 + 9100 * i
        ld = {"@context": "https://schema.org", "@type": "Car", "name": s.label,
              "offers": {"@type": "Offer", "price": price, "priceCurrency": "USD"}}
        if i % 3 == 0:  # everything in the HTML text
            body = f"<h1>{s.label}</h1><p>Price: ${price:,}</p><p>Mileage: {miles:,} miles</p><p>VIN: {vin}</p>"
        elif i % 3 == 1:  # VIN only arrives through JavaScript
            body = (f"<h1>{s.label}</h1><p>${price:,}</p><p>{miles:,} mi</p><div id='vin'></div>"
                    f"<script>document.getElementById('vin').textContent='{vin}'</script>")
        else:  # price only in structured data
            body = f"<h1>{s.label}</h1><p>Call for price</p><p>Odometer: {miles:,}</p><p>VIN {vin}</p>"
        pages[s.url] = (200, html_headers, (
            f"<html><head><title>{s.label}</title><script type='application/ld+json'>{json.dumps(ld)}</script>"
            f"</head><body>{body}</body></html>"
        ))
    return pages
