#!/usr/bin/env python3
"""AutoLander AI Visibility Scan.

  python scan.py --input dealer.json --out <dir> [--mock] [--engines openai,perplexity,anthropic]
                 [--runs 3] [--pdf] [--site auto|live|mock|skip] [--env-file PATH] [--estimate]

Writes results.json, report.html and usage_log.csv (plus report.pdf with --pdf).
No engine is called without its API key; --mock never calls anything. Keys are never printed.
"""

import argparse
import sys
from pathlib import Path

TOOL_DIR = Path(__file__).resolve().parent
if str(TOOL_DIR) not in sys.path:
    sys.path.insert(0, str(TOOL_DIR))

from avs import config  # noqa: E402
from avs.engines import build_engines, parse_engine_list  # noqa: E402
from avs.engines.base import estimate_cost  # noqa: E402
from avs.http import HttpClient  # noqa: E402
from avs.inputs import InputError, load_dealer  # noqa: E402
from avs.keys import KEY_NAMES, Redactor, load_settings  # noqa: E402
from avs.pdf import PdfError, html_to_pdf  # noqa: E402
from avs.pipeline import SecretLeakError, run_scan, write_outputs  # noqa: E402
from avs.report import render_report  # noqa: E402
from avs.sitecheck import LiveFetcher, MockFetcher, build_mock_site  # noqa: E402


def build_parser():
    p = argparse.ArgumentParser(prog="scan.py", description="AutoLander AI Visibility Scan")
    p.add_argument("--input", help="dealer JSON file")
    p.add_argument("--out", help="output folder")
    p.add_argument("--mock", action="store_true", help="deterministic fixture answers; no API calls")
    p.add_argument("--engines", default=",".join(config.ENGINE_ORDER), help="comma list: openai,perplexity,anthropic")
    p.add_argument("--runs", type=int, default=config.RUNS_PER_QUESTION, help="runs per question per engine (default 3)")
    p.add_argument("--pdf", action="store_true", help="also write report.pdf with headless Chrome")
    p.add_argument("--site", choices=("auto", "live", "mock", "skip"), default="auto",
                   help="site check: auto = fixtures with --mock, live requests otherwise")
    p.add_argument("--env-file", action="append", default=None,
                   help="read keys from this .env file (repeatable). Default: ./.env then ../cli/.env")
    p.add_argument("--chrome", help="path to chrome.exe (for --pdf)")
    p.add_argument("--estimate", action="store_true", help="print the per-scan cost estimate and exit (no calls)")
    p.add_argument("--quiet", action="store_true", help="only print the summary")
    return p


def cost_estimate(engine_names, runs, settings, questions=20):
    rows, totals = [], {"low": 0.0, "typical": 0.0, "high": 0.0}
    for name in engine_names:
        cfg = config.ENGINES[name]
        model = settings.get(cfg["model_env"]) or cfg["default_model"]
        calls = runs * questions
        per = {}
        for level, prof in config.COST_PROFILES[name].items():
            one = estimate_cost(name, model, prof["input_tokens"], 0, prof["output_tokens"], prof["searches"])
            per[level] = None if one is None else round(one * calls, 2)
            if per[level] is not None:
                totals[level] += per[level]
        rows.append({"engine": name, "model": model, "calls": calls, **per})
    return rows, {k: round(v, 2) for k, v in totals.items()}


def print_estimate(engine_names, runs, settings):
    rows, totals = cost_estimate(engine_names, runs, settings)
    money = lambda v: "   n/a" if v is None else f"${v:6.2f}"  # noqa: E731
    print(f"Per-scan cost estimate: 20 questions x {runs} runs per engine (prices checked {config.PRICES_CHECKED_ON})")
    print(f"{'engine':<12}{'model':<20}{'calls':>6}{'low':>10}{'typical':>10}{'high':>10}")
    for r in rows:
        print(f"{r['engine']:<12}{r['model']:<20}{r['calls']:>6}{money(r['low']):>10}{money(r['typical']):>10}{money(r['high']):>10}")
    print(f"{'TOTAL':<38}{money(totals['low']):>10}{money(totals['typical']):>10}{money(totals['high']):>10}")
    print("Assumptions per answer are in avs/config.py COST_PROFILES; the site check costs nothing.")


def main(argv=None):
    for stream in (sys.stdout, sys.stderr):  # never crash on a dealer name the console cannot show
        try:
            stream.reconfigure(errors="replace")
        except (AttributeError, ValueError):
            pass
    args = build_parser().parse_args(argv)
    say = (lambda *a: None) if args.quiet else (lambda *a: print(*a, file=sys.stderr))
    try:
        engine_names = parse_engine_list(args.engines)
    except ValueError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    if not 1 <= args.runs <= 10:
        print("error: --runs must be between 1 and 10", file=sys.stderr)
        return 2

    settings, sources = load_settings(args.env_file)
    redactor = Redactor([settings[k] for k in KEY_NAMES if k in settings])

    if args.estimate:
        print_estimate(engine_names, args.runs, settings)
        return 0
    if not args.input or not args.out:
        print("error: --input and --out are required (or use --estimate)", file=sys.stderr)
        return 2
    try:
        dealer = load_dealer(args.input)
    except InputError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    for w in dealer.warnings:
        say(f"note: {w}")

    http = HttpClient(redact=redactor)
    engines, skipped = build_engines(engine_names, settings, mock=args.mock, http=http, redact=redactor)
    for s in skipped:
        say(f"skipping {s['label']}: {s['reason']}")
    if not engines:
        print("error: no engine has an API key. Add keys (see README) or run with --mock.", file=sys.stderr)
        return 3
    for e in engines:
        where = sources.get(config.ENGINES[e.name]["key_env"], "")
        say(f"{e.label}: " + ("mock fixtures (no API calls)" if e.mock else f"model {e.model}, key from {where}"))

    site_mode = args.site if args.site != "auto" else ("mock" if args.mock else "live")
    fetcher = None
    if site_mode == "mock":
        fetcher = MockFetcher(build_mock_site(dealer))
    elif site_mode == "live":
        fetcher = LiveFetcher()

    def progress(done, total, answer):
        if not answer.ok:
            say(f"[{done}/{total}] {answer.engine} {answer.question_id} run {answer.run}: error: {answer.error}")
        elif done == total or (not answer.usage.get("cost_source", "").startswith("mock") and done % 10 == 0):
            say(f"[{done}/{total}] answers collected")

    results = run_scan(dealer, engines, runs=args.runs, site_fetcher=fetcher,
                       site_mode=site_mode if fetcher else "skipped", skipped=skipped, progress=progress)
    html = render_report(results)
    try:
        paths = write_outputs(results, html, args.out, redactor)
    except SecretLeakError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 4
    written = [paths["results"], paths["report_html"], paths["usage_log"]]
    if args.pdf:
        try:
            written.append(html_to_pdf(paths["report_html"], Path(args.out) / "report.pdf", chrome=args.chrome))
        except PdfError as exc:
            print(f"error: {exc}", file=sys.stderr)
            return 5

    score, presence, usage = results["score"], results["presence"], results["usage"]
    mode = " [MOCK - sample data]" if results["tool"]["mode"] == "mock" else ""
    print(f"AI Visibility Scan - {dealer.dealership_name} ({dealer.place}){mode}")
    print(f"Score: {score['score']}/100 - {score['verdict']['band']}: {score['verdict']['line']}")
    if presence["share"] is not None:
        print(f"Named in {presence['named']} of {presence['runs']} non-branded answers ({presence['share']:.0%})")
    cost = usage["cost_usd"]
    if results["tool"]["mode"] == "mock":
        print("Cost: nothing billed (mock)" + (f"; similar live usage would cost about ${cost:.2f}" if cost is not None else ""))
    else:
        print("Cost: " + ("unknown (unpriced model)" if cost is None else f"${cost:.2f}") + " (details in usage_log.csv)")
    for w in results["warnings"]:
        print(f"note: {w}")
    print("Wrote: " + ", ".join(str(p) for p in written))
    return 0


if __name__ == "__main__":
    sys.exit(main())
