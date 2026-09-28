# AutoLander AI Visibility Scan

The free hook of AutoLander's AI visibility service for car dealerships. The scan asks AI
engines the questions a car buyer asks in the dealer's city, then reports whether and how the
dealer is named, which competitors are named instead, which sources the engines cite, and
what on the dealer's website gets in the way. Output: `results.json`, `report.html`,
`report.pdf` (with `--pdf`) and a per-scan cost log, `usage_log.csv`.

Status (2026-09-27): built and tested in `--mock` mode. No API key is configured yet, so no
engine has been called. The first live scan should be watched (see "Not verified yet").

## Run it

From this folder (`ai-visibility-scan/`):

```
python scan.py --input sample\sample_motors_input.json --out out\sample --mock --pdf   # offline sample
python scan.py --input dealer.json --out out\dealer --pdf                              # live (needs keys)
python scan.py --estimate                                                               # cost estimate, no calls
python -m unittest discover -s tests -v                                                 # tests
```

| Option | Meaning |
|---|---|
| `--input FILE` | Dealer JSON (see below). |
| `--out DIR` | Output folder (created if missing). |
| `--mock` | Deterministic fixture answers. Nothing is called; every page is labelled "SAMPLE — mock data". |
| `--engines openai,perplexity,anthropic` | Which engines to ask (default: all three). An engine without a key is skipped, never called. |
| `--runs 3` | Runs per question per engine (answers vary run to run). |
| `--pdf` | Also print `report.pdf` with headless Chrome. |
| `--site auto\|live\|mock\|skip` | Site check. `auto` = fixture pages with `--mock`, real requests otherwise. `--mock --site live` checks a real dealer site today, without any AI key. |
| `--env-file PATH` | Read keys from this file instead of the defaults (repeatable). |
| `--estimate` | Print the per-scan cost estimate and exit. |

Exit codes: 0 ok, 2 bad input or option, 3 no engine has a key (use `--mock`), 4 a secret
would have been written (refused), 5 PDF failed.

A live scan makes 20 questions x 3 runs x 3 engines = 180 API calls, three at a time per
engine, plus 2 to 7 plain page requests to the dealer's site. Expect roughly 5 to 15 minutes.

## Dealer input (JSON)

Required: `dealership_name`, `website_url`, `city`, `state` (`"NC"` or `"North Carolina"`), `zip`.
Optional: `brands` (e.g. `["Ford"]`), `competitors` (up to 3 names), `cars_sold_per_month`,
`avg_gross_per_car`, `inventory_samples` (up to 5 `{year, make, model, trim?, url?}`),
`google_rating`, `google_review_count`, `competitor_ratings` (`[{name, rating, count}]`),
`yelp_claimed` (`true`/`false`/`null`), `manual_notes` (e.g. what the rep saw in Google AI Mode;
shown in the report as "Observed by hand (not scored)"). A full example:
`sample\sample_motors_input.json` (a fictional dealership).

## API keys (create them in our accounts; never commit or send them)

Create one key each in our OpenAI, Perplexity and Anthropic accounts, each with a monthly spend limit.
Never paste a key into a chat or Slack, and never commit one: this repository is public. Put the keys
in the environment of the machine that runs the scan, or in this folder's `.env` (this folder's
`.gitignore` keeps that file out of git):

```
OPENAI_API_KEY=...
PERPLEXITY_API_KEY=...
ANTHROPIC_API_KEY=...
```

Optional overrides: `OPENAI_MODEL` (default `gpt-5.4-mini`), `OPENAI_REASONING_EFFORT` (default
`low`; `omit` for gpt-4.x models), `PERPLEXITY_MODEL` (default `perplexity/sonar`),
`PERPLEXITY_PRESET` (e.g. `fast`; used instead of the model), `ANTHROPIC_MODEL` (default
`claude-sonnet-5`; `claude-haiku-4-5` is cheaper, see costs).

Order of precedence: process environment, then this folder's `.env`, then `..\cli\.env`. Only the
eight names above are read from a file; nothing else in it is touched. Key values are never
printed or written: the tool prints only where a key was found, error messages are redacted, and
every output file is checked for key values before it is written. Set a monthly spend limit in
each vendor console.

## What it does

1. **20 buyer questions** built from the input: 8 finding a dealer (brand-dealer questions when
   `brands` is given), 5 specific cars (from `inventory_samples`, else popular models in the
   city), 3 reputation, 2 comparisons (`{dealer} vs {competitor}`, else "compare used car dealers
   in {city}"), 2 trade-in. Questions that name the dealer are flagged **branded** and kept out
   of the presence score.
2. **Engines**, through their official APIs only, each with an approximate user location
   (city, state, US, time zone):
   - OpenAI Responses API with the `web_search` tool (`gpt-5.4-mini`, reasoning effort `low`:
     OpenAI's guide says effort `none` "may produce lower-quality results" with web search).
   - Perplexity **Agent API** (`POST /v1/agent`, model `perplexity/sonar`, `web_search` tool).
     The brief asked for Sonar chat completions, but Perplexity's docs say "Sonar will be
     supported until September 27, 2026" (today) and name the Agent API as the successor, so the
     adapter targets the Agent API.
   - Anthropic Messages API with the basic web search server tool `web_search_20250305`
     (`max_uses` 3; `pause_turn` continued up to twice).
   Timeouts (10 s connect, 120 s read), retries with exponential backoff and jitter on
   408/409/425/429/5xx/529 (Retry-After honoured, 3 retries), and a circuit breaker: a
   401/403/404 stops that engine's remaining calls. Google's grounded search API is deliberately
   not an engine.
3. **Per answer**: dealer named? (full name tolerant of plurals and possessives, the website
   domain, the name without spaces, one typo, or the distinctive word as a proper noun right
   before a dealer word; "Raleigh Ford dealers" and a sibling "Leith Toyota" do not count),
   other businesses named (bold/list/heading names, capitalised runs with a dealer word,
   competitor names; marketplaces, review sites and "brand + model" phrases are excluded),
   cited URLs and domains, whether the dealer's own domain is cited, and the source class
   (cars.com, cargurus, autotrader, yelp, google, dealerrater, facebook, the dealer's site, other).
4. **Site check**: one plain GET per URL, a 1-second pause between URLs, a normal browser
   user-agent, no retries. robots.txt rules (RFC 9309: grouped user-agents, merged groups,
   longest match, `*` and `$`) for GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot,
   Claude-SearchBot, Google-Extended, Bingbot, Applebot-Extended; homepage status and
   bot-challenge detection; price, mileage and VIN as plain text on up to 5 vehicle pages (from
   `inventory_samples`, else vehicle-looking links on the homepage). If responses show Cloudflare
   (a `cf-ray` or `server: cloudflare` header, or a challenge page) the report adds: "Cloudflare may
   block AI crawlers by default (policy since 2025-07-01); ask the website vendor to allow the
   crawlers you want". That is a finding only; it is never scored and never claims which bots are
   blocked.
5. **Score out of 100** (all weights in `avs/config.py` `SCORING`):
   Presence 50 (share of non-branded question-runs naming the dealer; full credit at 50%),
   Sources 15 (own site or own listings cited, full credit at 30% of answers; own profiles cited on
   review/listing platforms, full credit at 3), Reputation 20 (Google rating and review count vs
   the competitor averages; Yelp claimed yes/no), Technical 15 (crawler access weighted towards
   search crawlers, homepage reachable, vehicle-page fields). A part without data is marked "not
   assessed" and the total is renormalised to 100. One-line verdict per score band.
6. **Exposure** (only with `cars_sold_per_month` and `avg_gross_per_car`):
   cars/month x 0.19 x average gross, labelled "monthly gross exposed to AI-assisted shoppers
   (not money lost)". The 0.19 share and its note live in `config.EXPOSURE`.
7. **Top 3 fixes** chosen by fixed rules from the findings (blocked search crawlers, homepage
   blocked, vehicle fields missing, low presence, listed cars not found, own site not cited,
   marketplace profiles missing, review gap, Yelp unclaimed; generic fallbacks otherwise).
8. **Report** in the autolander.ai look: dark background, Archivo italic caps, Inter body, blue
   gradient accents, emerald for good states, amber for risks. Sections: cover with score dial and
   verdict, who AI recommends in the city, question-by-engine grid, answer excerpts with their
   sources, listed cars found, sources AI trusted, technical checklist, reputation, exposure, top 3
   fixes, method box, footer "Prepared by AutoLander · autolander.ai". Readable on a phone
   (no horizontal page scroll at 375 px); the PDF prints backgrounds, and a mock report carries
   "SAMPLE — mock data" at the top of every page.

## Compliance rules (hard)

- Official APIs only. Never scrape or automate ChatGPT, Gemini or Google web interfaces. No
  engine is called without its key.
- Store no Yelp data: the tool never contacts Yelp. For a Yelp link an engine cites, only the link
  itself is kept (so it stays clickable in the report); Yelp page titles are dropped and no
  snippets or cited text from any source are stored. `yelp_claimed` is a yes/no typed by the rep.
- The exposure figure is exposure, never "money lost".
- The report describes what engines answered on the scan date. It never promises rankings,
  traffic, leads or sales.
- Every engine answer shown in the report has its cited sources as clickable links right beside
  it (OpenAI: web search citations must be "clearly visible and clickable"; Anthropic: citations
  must be shown when outputs are displayed to end users).
- No logos or marks of OpenAI/ChatGPT, Perplexity, Anthropic/Claude or Google anywhere; engines are
  named in plain text only ("Answer from the OpenAI API"); never "powered by" or "partner" wording.
  Crawler tokens such as ChatGPT-User and Claude-SearchBot appear only as plain text in the
  robots.txt table, because that is what robots.txt must name.
- Gemini never appears in the report and is not an engine. Rep notes that mention it are left out
  of the report (a warning is written to `results.json`).
- The method box states the collection date, runs, location, that answers vary, and that
  AutoLander is not affiliated with OpenAI, Perplexity or Anthropic.

The tests check each of these rules.

## Cost per scan

Prices read from the vendors' pages on **2026-09-27**:

| Engine (default model) | Tokens (per 1M) | Web search | Source |
|---|---|---|---|
| OpenAI `gpt-5.4-mini` | $0.75 input, $0.075 cached, $4.50 output | $10.00 per 1k calls; search content tokens billed at model rates | https://developers.openai.com/api/docs/pricing |
| Perplexity `perplexity/sonar` (Agent API) | $0.25 input, $2.50 output | $2.50 per 1k `web_search` invocations ($1.00 per 1k for fast search) | https://docs.perplexity.ai/docs/getting-started/pricing |
| Anthropic `claude-sonnet-5` | $2 input, $10 output | $10 per 1k searches, plus search results billed as input tokens | https://platform.claude.com/docs/en/about-claude/pricing |
| (Anthropic `claude-haiku-4-5`, cheaper option) | $1 input, $5 output | same | same |

Per call = input tokens x input price + output tokens x output price + searches x search price.
Per scan = that, times 60 calls per engine (20 questions x 3 runs), summed over the engines.
Token and search counts per answer are assumptions until a live scan measures them
(`config.COST_PROFILES`; OpenAI and Anthropic bill the search results they read as input
tokens, which is why input dominates):

| Engine | Assumed per answer (low / typical / high) | Per scan: low | typical | high |
|---|---|---|---|---|
| OpenAI | 1 / 1.5 / 3 searches; 5k / 9k / 20k input; 0.6k / 1k / 2k output | $0.99 | $1.57 | $3.24 |
| Perplexity | 1 / 1.5 / 3 searches; 1.5k / 4k / 10k input; 0.35k / 0.6k / 1.2k output | $0.22 | $0.38 | $0.78 |
| Anthropic | 1 / 1.5 / 3 searches; 7k / 13k / 30k input; 0.5k / 0.8k / 1.5k output | $1.74 | $2.94 | $6.30 |
| **All three** | | **$2.95** | **$4.89** | **$10.32** |

With `ANTHROPIC_MODEL=claude-haiku-4-5` the typical total falls to about $3.87. The site check
costs nothing. `python scan.py --estimate` prints this table from the config; after a live scan,
`usage_log.csv` has the real tokens, searches and cost per call (Perplexity returns its own cost
figure, which is used as is).

## API docs used (read 2026-09-27)

- OpenAI web search tool (tool type `web_search`, `user_location`, `url_citation` annotations,
  `include: ["web_search_call.action.sources"]`, model notes):
  https://developers.openai.com/api/docs/guides/tools-web-search
- OpenAI pricing: https://developers.openai.com/api/docs/pricing ;
  model page: https://developers.openai.com/api/docs/models/gpt-5.4-mini ;
  crawlers: https://developers.openai.com/api/docs/bots
- Perplexity Agent API: https://docs.perplexity.ai/docs/agent-api/quickstart ;
  reference: https://docs.perplexity.ai/api-reference/agent-post.md ;
  web_search tool: https://docs.perplexity.ai/docs/agent-api/tools/web-search.md ;
  migration from Sonar: https://docs.perplexity.ai/docs/agent-api/migrate-from-sonar/how-to.md ;
  legacy Sonar chat completions: https://docs.perplexity.ai/api-reference/chat-completions-post ;
  pricing: https://docs.perplexity.ai/docs/getting-started/pricing ;
  crawlers: https://docs.perplexity.ai/guides/bots
- Anthropic web search tool: https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool ;
  tool reference: https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-reference ;
  pricing: https://platform.claude.com/docs/en/about-claude/pricing ;
  models: https://platform.claude.com/docs/en/about-claude/models/overview ;
  crawlers: https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- Google-Extended: https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers
- robots.txt standard: RFC 9309, https://www.rfc-editor.org/rfc/rfc9309
- 19% share: Cox Automotive Car Buyer Journey Study, released 2026-01-13 ("19% of all buyers and
  25% of new-vehicle buyers" used AI websites or AI-generated overviews):
  https://www.coxautoinc.com/insights/cox-automotive-car-buyer-journey-study-finds-efficiency-digital-tools-and-ai-drive-record-satisfaction/
  The report keeps the required note "Cox Automotive 2026 AI shopper research — verify before
  client use".

## Tests

`python -m unittest discover -s tests -v` runs 63 tests in about 5 seconds with no network access
to any AI engine (a guard makes any `requests` call fail inside the offline tests; one test serves
a fake dealer site on 127.0.0.1 to exercise the real HTTP site check). Covered: question
generation, name matching (true and false positives), business-name extraction, source
classification, scoring arithmetic and renormalisation, robots parsing, the exposure formula,
vehicle-page fields, each engine adapter's request shape and response parsing on the documented
shapes (plus retries, Retry-After, `pause_turn`, the key circuit breaker and error redaction), the
mock end-to-end run producing all files (PDF included when Chrome is present), no key value in
any output, and each report rule above.

## Not verified yet

- No live call has been made (no keys). Adapters follow the docs above and are tested against the
  documented shapes only. Watch the first live scan's `usage_log.csv` and `results.json`.
- Perplexity's Agent API is new as of today; the docs did not spell out the citation annotation
  fields in full, so the adapter reads `url_citation` annotations and also maps `[n]` markers to
  `search_results` ids. If `perplexity/sonar` is refused, set `PERPLEXITY_PRESET=fast`.
- Anthropic's docs defer per-model support of `web_search_20250305` to each model; if
  `claude-sonnet-5` refuses it, set `ANTHROPIC_MODEL=claude-haiku-4-5` (retirement "not sooner
  than October 15, 2026").
- The per-answer token and search counts behind the cost estimate are assumptions.
- Name matching and extraction are heuristics tested on synthetic answers, not on real ones.
- Fonts come from Google Fonts when the PDF is printed; offline, system fonts are used.
- API answers can differ from what the consumer apps show the same buyer.

## Files

```
scan.py                      command line
avs/config.py                every weight, price, label and crawler in one place
avs/questions.py             the 20 questions          avs/vehicles.py   brand/model words
avs/engines/                 openai, perplexity, anthropic adapters + deterministic mock
avs/matching.py              name matching, extraction, source classes
avs/analysis.py              per-answer analysis and aggregates
avs/robots.py                robots.txt (RFC 9309)     avs/sitecheck.py  site check, Cloudflare finding, mock site
avs/scoring.py               score, verdict, exposure  avs/fixes.py      top 3 fixes
avs/report.py                HTML report               avs/pdf.py        headless Chrome PDF
avs/pipeline.py              run a scan, write outputs avs/keys.py       keys and redaction
avs/http.py                  POST with retries         avs/inputs.py     input validation; avs/geo.py states + time zones
tests/test_scan.py           unittest suite
sample/                      Sample Motors (fictional): input, results.json, report.html, report.pdf, usage_log.csv
```
