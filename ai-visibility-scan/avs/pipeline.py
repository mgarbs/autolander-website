"""Run a scan end to end and write results.json, report.html and usage_log.csv."""

import csv
import io
import json
import threading
from concurrent.futures import ThreadPoolExecutor
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path

from . import config
from .analysis import (
    Analyzer, build_grid, inventory_stats, presence_stats, source_stats, top_named_dealers, usage_summary,
)
from .engines.base import approx_location
from .fixes import build_fixes
from .questions import CATEGORY_LABELS, build_questions
from .scoring import (
    compute_exposure, reputation_facts, score_presence, score_reputation, score_sources, score_technical, total_score,
)
from .sitecheck import run_site_check, skipped_site_check


def run_scan(dealer, engines, runs=None, site_fetcher=None, site_mode="skipped", skipped=(), progress=None,
             workers_per_engine=None, now=None):
    runs = runs or config.RUNS_PER_QUESTION
    workers = workers_per_engine or config.WORKERS_PER_ENGINE
    started = now or datetime.now(timezone.utc)
    questions = build_questions(dealer)
    qmap = {q.id: q for q in questions}
    # interleave engines so parallel workers spread across engines
    tasks = [(e, q, r) for q in questions for r in range(1, runs + 1) for e in engines]
    total = len(tasks)
    answers = []
    mock = all(e.mock for e in engines)

    if mock:
        for i, (e, q, r) in enumerate(tasks, 1):
            answers.append(e.ask(q, dealer, r))
            if progress:
                progress(i, total, answers[-1])
    else:
        gates = {e.name: threading.Semaphore(workers) for e in engines}

        def work(task):
            engine, question, run = task
            with gates[engine.name]:
                return engine.ask(question, dealer, run)

        with ThreadPoolExecutor(max_workers=workers * len(engines)) as pool:
            for i, answer in enumerate(pool.map(work, tasks), 1):
                answers.append(answer)
                if progress:
                    progress(i, total, answer)

    analyzer = Analyzer(dealer)
    for a in answers:
        analyzer.analyze(a, qmap[a.question_id])
    order = {name: i for i, name in enumerate(config.ENGINE_ORDER)}
    answers.sort(key=lambda a: (order[a.engine], a.question_id, a.run))
    engine_names = [e.name for e in engines]

    site = run_site_check(dealer, site_fetcher, site_mode) if site_fetcher else skipped_site_check("site check skipped")
    presence = presence_stats(questions, answers, engine_names)
    grid = build_grid(questions, answers, engine_names)
    top = top_named_dealers(questions, answers, analyzer, config.REPORT["top_dealers_shown"])
    inventory = inventory_stats(questions, answers, engine_names, dealer)
    sources = source_stats(answers)
    reputation = reputation_facts(dealer)
    components = [score_presence(presence), score_sources(sources), score_reputation(dealer), score_technical(site)]
    score = total_score(components, dealer.dealership_name, dealer.city)
    exposure = compute_exposure(dealer)
    fixes, ranked = build_fixes(dealer, questions, presence, top, inventory, sources, site, reputation)
    finished = datetime.now(timezone.utc) if now is None else now

    warnings = list(dealer.warnings)
    notes_shown = bool(dealer.manual_notes) and "gemini" not in dealer.manual_notes.lower()
    if dealer.manual_notes and not notes_shown:
        warnings.append("manual_notes mention an engine this report does not cover; they are left out of the report")
    errors = [a for a in answers if not a.ok]
    if errors:
        warnings.append(f"{len(errors)} of {len(answers)} engine calls failed; see answers[].error")

    return {
        "tool": {"name": config.TOOL_NAME, "version": config.TOOL_VERSION, "mode": "mock" if mock else "live"},
        "scan": {
            "date": started.astimezone().date().isoformat(),
            "started_utc": started.isoformat(timespec="seconds"),
            "finished_utc": finished.isoformat(timespec="seconds"),
            "runs_per_question": runs,
            "question_count": len(questions),
            "engines": [{"name": e.name, "label": e.label, "model": e.model, "mock": e.mock} for e in engines],
            "skipped_engines": list(skipped),
            "location": approx_location(dealer),
            "manual_notes_shown": notes_shown,
        },
        "dealer": asdict(dealer),
        "questions": [dict(asdict(q), category_label=CATEGORY_LABELS[q.category]) for q in questions],
        "grid": grid,
        "presence": presence,
        "top_dealers": top,
        "inventory": inventory,
        "sources": sources,
        "site_check": site,
        "reputation": reputation,
        "score": score,
        "exposure": exposure,
        "fixes": fixes,
        "other_fixes": ranked[3:],
        "usage": usage_summary(answers, engines, mock),
        "answers": [asdict(a) for a in answers],
        "warnings": warnings,
    }


USAGE_COLUMNS = ["engine", "model", "question_id", "run", "status", "input_tokens", "cached_input_tokens",
                 "output_tokens", "searches", "cost_usd", "cost_source", "latency_s", "error"]


def usage_csv(results):
    buf = io.StringIO()
    writer = csv.writer(buf, lineterminator="\n")
    writer.writerow(USAGE_COLUMNS)
    for a in results["answers"]:
        u = a["usage"] or {}
        writer.writerow([
            a["engine"], a["model"], a["question_id"], a["run"], "error" if a["error"] else "ok",
            u.get("input_tokens", 0), u.get("cached_input_tokens", 0), u.get("output_tokens", 0), u.get("searches", 0),
            "" if u.get("cost_usd") is None else f"{u['cost_usd']:.6f}", u.get("cost_source", ""),
            a["latency_s"], a["error"] or "",
        ])
    totals = results["usage"]
    writer.writerow(["TOTAL", "", "", "", "", "", "", "", "", "" if totals["cost_usd"] is None else f"{totals['cost_usd']:.4f}",
                     totals["note"], "", ""])
    return buf.getvalue()


class SecretLeakError(RuntimeError):
    pass


def safe_write(path, text, redactor):
    """Write text after replacing any known secret value; refuse if one would still leak."""
    clean = redactor.values(text) if redactor else text
    if redactor and redactor.leaks(clean):
        raise SecretLeakError(f"refusing to write {Path(path).name}: a secret value would leak")
    Path(path).write_text(clean, encoding="utf-8", newline="\n")
    return clean


def write_outputs(results, html, out_dir, redactor):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    paths = {
        "results": out / "results.json",
        "report_html": out / "report.html",
        "usage_log": out / "usage_log.csv",
    }
    safe_write(paths["results"], json.dumps(results, indent=2, ensure_ascii=False), redactor)
    safe_write(paths["report_html"], html, redactor)
    safe_write(paths["usage_log"], usage_csv(results), redactor)
    return paths
