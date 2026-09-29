"""HTML report in the autolander.ai look (dark, Archivo italic caps, Inter body, blue accents).

Rules this file enforces:
- Engines are named in plain text only ("OpenAI API"); no logos, marks or "powered by".
- Every engine answer shown carries its cited sources as clickable links right under it.
- The exposure figure is labelled exposure, never money lost.
- A mock report says "SAMPLE - mock data" on every printed page (CSS page margin box).
"""

import html
import re
from datetime import date
from urllib.parse import urlparse

from . import config
from .matching import SOURCE_LABELS, SOURCE_ORDER

_FONTS = (
    "https://fonts.googleapis.com/css2?family=Archivo:ital,wght@1,800;1,900"
    "&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap"
)


def esc(value):
    return html.escape("" if value is None else str(value), quote=True)


def css_string(value):
    """A quoted CSS string that cannot close the <style> element it sits in."""
    text = str(value).replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ")
    return '"' + text.replace("<", "\\3C ").replace(">", "\\3E ") + '"'


def safe_href(url):
    try:
        p = urlparse(url or "")
    except ValueError:
        return None
    return url if p.scheme in ("http", "https") and p.netloc else None


def pct(x):
    return "n/a" if x is None else f"{x:.0%}"


def long_date(iso):
    try:
        d = date.fromisoformat(iso)
    except (TypeError, ValueError):
        return esc(iso)
    return f"{d.strftime('%B')} {d.day}, {d.year}"


CSS = r"""
:root{--bg:#050505;--card:#0b0d12;--line:rgba(255,255,255,0.08);--radius:20px;--text:#e5e7eb;--muted:#9ca3af;
--dim:#6b7280;--blue-1:#93c5fd;--blue-2:#2563eb;--blue-mid:#3b82f6;--emerald:#34d399;--amber:#fbbf24;
--mono:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
*{box-sizing:border-box}
html,body{background:var(--bg);color:var(--text);margin:0}
body{font-family:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;font-size:14px;line-height:1.55;
-webkit-print-color-adjust:exact;print-color-adjust:exact;-webkit-font-smoothing:antialiased}
a{color:var(--blue-1);text-decoration:underline;text-decoration-color:rgba(147,197,253,.45);text-underline-offset:2px;overflow-wrap:anywhere}
.wrap{max-width:1000px;margin:0 auto;padding:26px 16px 36px}
h1,h2,h3,.display{font-family:'Archivo','Arial Black',sans-serif;font-style:italic;font-weight:900;text-transform:uppercase;
letter-spacing:-0.025em;line-height:.95;margin:0}
h1{font-size:clamp(34px,7vw,62px)}
h2{font-size:clamp(24px,4vw,34px);margin:8px 0 10px}
h3{font-size:17px;font-weight:800;letter-spacing:-0.01em;line-height:1.1}
.accent{background:linear-gradient(90deg,#93c5fd,#2563eb);-webkit-background-clip:text;background-clip:text;color:transparent}
.eyebrow{font-family:var(--mono);font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--blue-1);
display:inline-flex;align-items:center;gap:9px}
.eyebrow::before{content:"";width:7px;height:7px;border-radius:2px;background:var(--blue-mid);
box-shadow:0 0 8px 2px rgba(59,130,246,.75);flex:none}
.card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:22px}
.muted{color:var(--muted)}.dim{color:var(--dim)}.pos{color:var(--emerald)}.risk{color:var(--amber)}
.sub{color:var(--muted);margin:0 0 16px;max-width:72ch}
section.block{margin-top:34px}
.ribbon{position:sticky;top:0;z-index:5;background:#161005;color:var(--amber);border-bottom:1px solid rgba(251,191,36,.35);
text-align:center;font-family:var(--mono);font-size:11.5px;letter-spacing:.14em;padding:7px 10px}
.brandbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.brandmark{font-family:'Archivo',sans-serif;font-style:italic;font-weight:900;text-transform:uppercase;font-size:21px;letter-spacing:-0.01em}
.badge{display:inline-block;font-family:var(--mono);font-size:12px;letter-spacing:.1em;
color:var(--amber);border:1px solid rgba(251,191,36,.45);background:rgba(251,191,36,.08);border-radius:99px;padding:5px 12px}
.cover{display:grid;grid-template-columns:1.4fr 1fr;gap:18px;margin-top:20px}
.cover-main{padding:30px}
.meta-line{color:var(--muted);margin-top:14px;font-size:15px}
.band{font-family:'Archivo',sans-serif;font-style:italic;font-weight:900;text-transform:uppercase;font-size:24px;margin-top:24px}
.verdict-line{font-size:16px;margin-top:6px;max-width:48ch}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.stat{border-left:1px solid var(--line);padding-left:14px}
.cover-row{margin-top:14px}
.first-fixes{margin:10px 0 0;padding-left:22px;font-size:14.5px}
.first-fixes li{margin:4px 0}
.sec-head{margin-bottom:4px}
.stat .num{font-family:'Archivo',sans-serif;font-style:italic;font-weight:900;font-size:28px;line-height:1}
.stat .lbl{color:var(--muted);font-size:12.5px;margin-top:5px}
.dial-card{display:flex;flex-direction:column;align-items:center;gap:14px;padding:26px 22px}
#score-dial{width:200px;height:200px}
.dial-num{font-family:'Archivo',sans-serif;font-style:italic;font-weight:900;font-size:64px;fill:#fff}
.dial-of{font-family:var(--mono);font-size:12px;letter-spacing:.2em;fill:#9ca3af}
.breakdown{width:100%;display:grid;gap:10px}
.bd-row{display:grid;grid-template-columns:92px 1fr 64px;gap:10px;align-items:center;font-size:12.5px}
.bd-row .v{text-align:right;font-family:var(--mono);font-size:11.5px;color:var(--muted)}
.bar{height:8px;border-radius:99px;background:rgba(255,255,255,.06);overflow:hidden}
.bar>span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#93c5fd,#2563eb)}
.rank{display:grid;gap:8px}
.rank-row{display:grid;grid-template-columns:26px minmax(0,1fr) 38% 52px;gap:12px;align-items:center;padding:9px 12px;border-radius:12px}
.rank-row .n{font-family:var(--mono);color:var(--dim);font-size:12px}
.rank-row .name{font-weight:600}
.rank-row .v{font-family:var(--mono);font-size:12px;text-align:right;color:var(--muted)}
.rank-row.you{background:rgba(37,99,235,.12);border:1px solid rgba(147,197,253,.35)}
.rank-row.you .name{color:var(--blue-1)}
table{width:100%;border-collapse:collapse}
th,td{text-align:left;padding:9px 10px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-family:var(--mono);font-weight:500;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
thead{display:table-header-group}
tr{break-inside:avoid}
.table-wrap{overflow-x:auto}
td.c{text-align:center;white-space:nowrap}
.cell{display:inline-block;min-width:48px;text-align:center;padding:3px 9px;border-radius:99px;font-family:var(--mono);font-size:11.5px}
.cell.hi{background:rgba(52,211,153,.14);color:var(--emerald);border:1px solid rgba(52,211,153,.4)}
.cell.mid{color:var(--emerald);border:1px dashed rgba(52,211,153,.5)}
.cell.lo{background:rgba(251,191,36,.08);color:var(--amber);border:1px solid rgba(251,191,36,.35)}
.cell.na{color:var(--dim);border:1px solid var(--line)}
.chip{display:inline-block;font-family:var(--mono);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;
padding:2px 7px;border-radius:99px;border:1px solid var(--line);color:var(--muted);margin:0 6px 4px 0;white-space:nowrap}
.chip.blue{color:var(--blue-1);border-color:rgba(147,197,253,.4)}
tr.branded td{color:var(--muted)}
.qgrid td,.qgrid th{padding:4px 7px}
.qgrid th{letter-spacing:.06em;line-height:1.25}
.qgrid td{font-size:12px;line-height:1.3}
.qgrid td.c,.qgrid th.c{width:70px}
.qgrid .cell{min-width:40px;padding:2px 7px;font-size:11px}
.qgrid .chip{margin:0 0 0 4px;vertical-align:1px}
.qgrid tr.grp td{padding:7px 8px 1px;border-bottom:0}
.qgrid tr.grp .chip{margin-left:0;color:var(--blue-1);border-color:rgba(147,197,253,.3)}
.legend{display:flex;gap:14px;flex-wrap:wrap;margin-top:12px;font-size:12px;color:var(--muted)}
.answers{display:grid;gap:12px}
.answer{break-inside:avoid;display:grid;grid-template-columns:minmax(0,1.65fr) minmax(0,1fr);gap:18px}
.answer-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.answer-q{font-weight:600;font-size:14.5px;margin:8px 0 6px}
.answer-text{color:#d1d5db;font-size:12.5px;line-height:1.5}
.answer-text mark{background:rgba(37,99,235,.28);color:#fff;border-radius:4px;padding:0 3px}
.answer-sources{padding-left:16px;border-left:1px solid var(--line)}
.answer-sources ol{margin:6px 0 0;padding-left:20px;font-size:12.5px}
.answer-sources li{margin:3px 0}
.src-label{font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.grid2.wide-left{grid-template-columns:1.45fr 1fr}
.cars{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
.car .per{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.state{font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:.1em}
.callout{border:1px solid rgba(251,191,36,.4);background:rgba(251,191,36,.06);border-radius:16px;padding:14px 16px;margin-top:14px}
.callout .t{color:var(--amber);font-weight:600}
.exposure .big{font-family:'Archivo',sans-serif;font-style:italic;font-weight:900;font-size:clamp(40px,8vw,68px);line-height:1}
.fixes{display:grid;gap:12px}
.fix{display:grid;grid-template-columns:52px 1fr;gap:14px;align-items:start}
.fix .no{font-family:'Archivo',sans-serif;font-style:italic;font-weight:900;font-size:40px;line-height:1}
.method{font-size:13px;color:#cbd5e1}
.method p{margin:6px 0}
footer.foot{margin-top:28px;padding-top:14px;border-top:1px solid var(--line);color:var(--muted);font-size:12px;
display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}
@media screen and (max-width:760px){
  .cover,.grid2,.grid2.wide-left,.answer{grid-template-columns:1fr}
  .answer-sources{padding:10px 0 0;border-left:0;border-top:1px solid var(--line)}
  .stats{grid-template-columns:1fr}
  .stat{border-left:0;border-top:1px solid var(--line);padding:10px 0 0}
  .rank-row{grid-template-columns:22px minmax(0,1fr) 30% 46px;gap:8px}
  .card{padding:16px}.cover-main{padding:20px}
  th,td{padding:7px 6px}
  .fix{grid-template-columns:36px 1fr}.fix .no{font-size:30px}
}
@media print{
  .ribbon{display:none}
  .wrap{max-width:none;padding:0}
  .cover-wrap{break-after:page}
  section.block{margin-top:22px}
  section.page-start{break-before:page;margin-top:0}
  .sec-head{break-inside:avoid;break-after:avoid}
  h2{break-after:avoid}
  .card,.rank-row,.answer,.car,.fix,.callout{break-inside:avoid}
  .card.breakable{break-inside:auto}
  .grid2.stack-print{grid-template-columns:1fr}
  .table-wrap{overflow:visible}
  a{text-decoration:none}
}
"""


def _page_rules(mock, dealer_name):
    top = config.SAMPLE_LABEL if mock else f"AI Visibility Scan \u00b7 {dealer_name}"
    top_color = "#fbbf24" if mock else "#6b7280"
    footer = "Prepared by AutoLander · autolander.ai"
    return (
        "@page{size:Letter;margin:15mm 12mm 15mm 12mm;background:#050505;"
        f"@top-center{{content:{css_string(top)};color:{top_color};font-family:'Inter',sans-serif;font-size:9pt;"
        "font-weight:600;letter-spacing:.08em}"
        f"@bottom-left{{content:{css_string(footer)};color:#9ca3af;font-family:'Inter',sans-serif;font-size:8pt}}"
        "@bottom-right{content:counter(page) \" / \" counter(pages);color:#6b7280;font-family:'Inter',sans-serif;font-size:8pt}}"
    )


def _dial(score):
    circ = 2 * 3.14159265 * 84
    arc = circ * max(0, min(100, score)) / 100
    return (
        f'<svg id="score-dial" viewBox="0 0 200 200" role="img" aria-label="AI visibility score {score} out of 100">'
        '<defs><linearGradient id="dialGrad" x1="0" y1="0" x2="1" y2="1">'
        '<stop offset="0%" stop-color="#93c5fd"/><stop offset="100%" stop-color="#2563eb"/></linearGradient></defs>'
        '<circle cx="100" cy="100" r="84" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="14"/>'
        f'<circle cx="100" cy="100" r="84" fill="none" stroke="url(#dialGrad)" stroke-width="14" stroke-linecap="round" '
        f'stroke-dasharray="{arc:.1f} {circ:.1f}" transform="rotate(-90 100 100)"/>'
        f'<text x="100" y="112" text-anchor="middle" class="dial-num">{score}</text>'
        '<text x="100" y="140" text-anchor="middle" class="dial-of">/ 100</text></svg>'
    )


def _engine_label(results, name):
    for e in results["scan"]["engines"]:
        if e["name"] == name:
            return e["label"] + (" (mock)" if e["mock"] else "")
    return config.ENGINES[name]["label"]


def _accent_last_word(name):
    words = esc(name).split(" ")
    if len(words) < 2:
        return f'<span class="accent">{" ".join(words)}</span>'
    return " ".join(words[:-1]) + f' <span class="accent">{words[-1]}</span>'


# --------------------------------------------------------------------------- sections
def _cover(r):
    d, score, presence = r["dealer"], r["score"], r["presence"]
    mock = r["tool"]["mode"] == "mock"
    s = score["score"]
    band_class = "pos" if s >= 60 else ("risk" if s < 40 else "")
    rows = []
    for c in score["components"]:
        if c["assessed"]:
            width = 100 * c["earned"] / c["max"] if c["max"] else 0
            value = f"{c['earned']:.0f}/{c['max']}"
            if c["assessed_max"] < c["max"]:
                value += "*"
        else:
            width, value = 0, "n/a"
        rows.append(
            f'<div class="bd-row"><span>{esc(c["label"])}</span><span class="bar"><span style="width:{width:.0f}%"></span></span>'
            f'<span class="v">{value}</span></div>'
        )
    top = [row for row in r["top_dealers"]["rows"] if not row["is_dealer"]]
    rival = top[0] if top else None
    listed = [i for i in r["inventory"] if i["from_inventory"]]
    engines = len(r["scan"]["engines"])
    stats = [
        (f"{presence['named']}/{presence['runs']}", "answers to non-branded questions that named you"),
        (esc(rival["name"]) if rival else "&mdash;", f"named most often ({pct(rival['share'])} of those answers)" if rival else "no other dealer named"),
    ]
    if listed:
        stats.append((f"{sum(i['found'] for i in listed)}/{len(listed)}", "of your listed cars found by at least one engine"))
    else:
        stats.append((f"{r['sources']['dealer_site_cited_answers']}", "answers that cited your website"))
    stat_html = "".join(f'<div class="stat"><div class="num">{n}</div><div class="lbl">{l}</div></div>' for n, l in stats)
    note = '<p class="dim" style="font-size:11.5px;margin:0">* part of this component was not assessed; the total is renormalised to 100.</p>' if score["renormalised"] else ""
    sample = f'<div style="margin-top:22px"><span class="badge">{esc(config.SAMPLE_LABEL)}</span></div>' if mock else ""
    first_fixes = "".join(f"<li>{esc(f['title'])}</li>" for f in r["fixes"])
    return f"""
<div class="cover-wrap">
  <div class="brandbar"><span class="brandmark">AutoLander</span><span class="eyebrow">AI Visibility Scan</span></div>
  <div class="cover">
    <div class="card cover-main">
      <span class="eyebrow">Local AI visibility report</span>
      <h1 style="margin-top:14px">{_accent_last_word(d["dealership_name"])}</h1>
      <div class="meta-line">{esc(d["city"])}, {esc(d["state_code"] or d["state"])} &middot; scanned {long_date(r["scan"]["date"])}
        &middot; {r["scan"]["question_count"]} buyer questions &times; {r["scan"]["runs_per_question"]} runs &times; {engines} engine{"s" if engines != 1 else ""}</div>
      <div class="band {band_class}">{esc(score["verdict"]["band"])}</div>
      <div class="verdict-line">{esc(score["verdict"]["line"])}</div>
      {sample}
    </div>
    <div class="card dial-card">
      <span class="eyebrow">AI visibility score</span>
      {_dial(s)}
      <div class="breakdown">{"".join(rows)}</div>
      {note}
    </div>
  </div>
  <div class="card cover-row"><div class="stats">{stat_html}</div></div>
  <div class="card cover-row"><span class="eyebrow">First fixes</span><ol class="first-fixes">{first_fixes}</ol></div>
</div>"""


def _head(eyebrow, title_html, sub_html=""):
    sub = f'<p class="sub">{sub_html}</p>' if sub_html else ""
    return f'<header class="sec-head"><span class="eyebrow">{esc(eyebrow)}</span><h2>{title_html}</h2>{sub}</header>'


def _recommends(r):
    d, top = r["dealer"], r["top_dealers"]
    rows = list(top["rows"])
    if not any(x["is_dealer"] for x in rows):
        rows.append(top["dealer"])
    items = []
    for i, row in enumerate(rows, 1):
        rank = i if row in top["rows"] else (top["dealer_rank"] or "&ndash;")
        you = " you" if row["is_dealer"] else ""
        name = esc(row["name"]) + (' <span class="chip blue">you</span>' if row["is_dealer"] else "")
        items.append(
            f'<div class="rank-row{you}"><span class="n">{rank}</span><span class="name">{name}</span>'
            f'<span class="bar"><span style="width:{100 * row["share"]:.0f}%"></span></span>'
            f'<span class="v">{pct(row["share"])}</span></div>'
        )
    body = "".join(items) if top["answers_considered"] else '<p class="muted">No successful answers to report.</p>'
    notes = ""
    if d.get("manual_notes") and r["scan"]["manual_notes_shown"]:
        notes = (
            '<div class="card" style="margin-top:14px"><span class="eyebrow">Observed by hand (not scored)</span>'
            f'<p style="margin:8px 0 0">{esc(d["manual_notes"])}</p></div>'
        )
    head = _head(
        "Who AI recommends", f'Who AI recommends in <span class="accent">{esc(d["city"])}</span>',
        f'Share of the {top["answers_considered"]} answers to questions that did not mention any dealer by name in which '
        "each business was named. Business names are read from the answer text, so similar spellings are grouped.",
    )
    return f"""
<section class="block">
  {head}
  <div class="card"><div class="rank">{body}</div></div>
  {notes}
</section>"""


def _cell(named, runs, errors):
    if runs == 0:
        return f'<span class="cell na">{"error" if errors else "&ndash;"}</span>'
    cls = "hi" if named >= 2 or (named and named == runs) else ("mid" if named else "lo")
    return f'<span class="cell {cls}" title="named in {named} of {runs} runs">{named}/{runs}</span>'


def _grid(r):
    engines = [e["name"] for e in r["scan"]["engines"]]
    head = "".join(f'<th class="c">{"<br>".join(esc(w) for w in config.ENGINES[e]["label"].split(" "))}</th>' for e in engines)
    body, current = [], None
    for q in r["questions"]:
        if q["category"] != current:
            current = q["category"]
            body.append(f'<tr class="grp"><td colspan="{2 + len(engines)}"><span class="chip">{esc(q["category_label"])}</span></td></tr>')
        cells = "".join(
            f'<td class="c">{_cell(r["grid"][q["id"]][e]["named"], r["grid"][q["id"]][e]["runs"], r["grid"][q["id"]][e]["errors"])}</td>'
            for e in engines
        )
        tag = ' <span class="chip blue">names you</span>' if q["branded"] else ""
        body.append(
            f'<tr class="{"branded" if q["branded"] else ""}"><td class="dim">{esc(q["id"][1:])}</td>'
            f'<td>{esc(q["text"])}{tag}</td>{cells}</tr>'
        )
    runs = r["scan"]["runs_per_question"]
    sec_head = _head(
        "Question by engine", 'Were you <span class="accent">named?</span>',
        f"Runs (out of {runs}) in which the answer named you. Questions marked &ldquo;names you&rdquo; mention your "
        "dealership, so they are shown but not scored.",
    )
    return f"""
<section class="block page-start">
  {sec_head}
  <div class="card table-wrap breakable"><table class="qgrid">
    <thead><tr><th>#</th><th>Buyer question</th>{head}</tr></thead>
    <tbody>{"".join(body)}</tbody>
  </table>
  <div class="legend"><span><span class="cell hi">2/3</span> named in most runs</span>
  <span><span class="cell mid">1/3</span> named sometimes</span><span><span class="cell lo">0/3</span> not named</span></div>
  </div>
</section>"""


def _excerpt(text, dealer_name, limit):
    t = re.sub(r"\[([^\]]+)\]\((?:https?://)[^)]+\)", r"\1", text or "")
    t = re.sub(r"^\s{0,3}#{1,6}\s*", "", t, flags=re.M)
    t = re.sub(r"\n{3,}", "\n\n", t).strip()
    if len(t) > limit:
        cut = t[:limit]
        stop = max(cut.rfind(". "), cut.rfind("\n"))
        t = (cut[: stop + 1] if stop > limit * 0.5 else cut.rsplit(" ", 1)[0]).rstrip() + " \u2026"
    out = esc(t)
    out = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", out)
    if dealer_name:
        out = re.sub(re.escape(esc(dealer_name)), lambda m: f"<mark>{m.group(0)}</mark>", out, flags=re.I)
    return out.replace("\n", "<br>")


def pick_showcase(r, per_engine=None):
    per_engine = per_engine or config.REPORT["answers_shown_per_engine"]
    branded = {q["id"]: q["branded"] for q in r["questions"]}
    picks = []
    for e in [x["name"] for x in r["scan"]["engines"]]:
        ok = [a for a in r["answers"] if a["engine"] == e and not a["error"] and "gemini" not in a["text"].lower()]
        nonbranded = [a for a in ok if not branded[a["question_id"]]]
        chosen = []
        first = next((a for a in nonbranded if a["question_id"] == "Q01"), None) or (nonbranded[0] if nonbranded else None)
        if first:
            chosen.append(first)
        rest = [a for a in nonbranded if all(a["question_id"] != c["question_id"] for c in chosen)]
        second = (
            next((a for a in rest if not a["dealer_named"] and a["named_dealers"] and a["citations"]), None)
            or next((a for a in rest if a["dealer_named"] and a["citations"]), None)
            or (rest[0] if rest else None)
        )
        if second:
            chosen.append(second)
        picks.extend(chosen[:per_engine])
    return picks


def _source_link(c):
    href = safe_href(c["url"])
    domain = c.get("domain") or ""
    if c.get("source") == "yelp" or not c.get("title"):
        path = urlparse(c["url"]).path if href else ""
        text = domain + (path if len(path) <= 48 else path[:45] + "\u2026")
    else:
        title = c["title"]
        text = title if len(title) <= 90 else title[:87] + "\u2026"
    if not href:
        return f"<li>{esc(text or c['url'])}</li>"
    tail = f' <span class="dim">{esc(domain)}</span>' if c.get("title") and c.get("source") != "yelp" else ""
    return f'<li><a href="{esc(href)}" target="_blank" rel="noopener noreferrer">{esc(text)}</a>{tail}</li>'


def _answers(r):
    qtext = {q["id"]: q["text"] for q in r["questions"]}
    cards = []
    for a in pick_showcase(r):
        status = '<span class="cell hi">named you</span>' if a["dealer_named"] else '<span class="cell lo">not named</span>'
        cites = "".join(_source_link(c) for c in a["citations"])
        sources = (
            f'<div class="src-label">Sources cited in this answer</div><ol>{cites}</ol>' if cites
            else '<div class="src-label">No sources were cited in this answer</div>'
        )
        cards.append(
            f'<article class="card answer" data-answer="{esc(a["engine"])}:{esc(a["question_id"])}:{a["run"]}"><div>'
            f'<div class="answer-head"><span class="eyebrow">Answer from the {esc(_engine_label(r, a["engine"]))} &middot; run {a["run"]}</span>{status}</div>'
            f'<p class="answer-q">&ldquo;{esc(qtext[a["question_id"]])}&rdquo;</p>'
            f'<div class="answer-text">{_excerpt(a["text"], r["dealer"]["dealership_name"], config.REPORT["excerpt_chars"])}</div>'
            f'</div><div class="answer-sources">{sources}</div></article>'
        )
    if not cards:
        return ""
    head = _head(
        "In their own words", 'What the engines <span class="accent">said</span>',
        "A few of the answers, shortened, each with the sources the engine cited for it. Every answer is kept in full in results.json.",
    )
    return f"""
<section class="block">
  {head}
  <div class="answers">{"".join(cards)}</div>
</section>"""


def _cars(r):
    engines = [e["name"] for e in r["scan"]["engines"]]
    listed = [i for i in r["inventory"] if i["from_inventory"]]
    items = listed or r["inventory"]
    intro = (
        "For each car you listed, how many runs of the question about it named you or linked to your site."
        if listed else
        "No inventory samples were given, so the scan asked about popular models in your area instead."
    )
    cards = []
    for i in items:
        per = "".join(
            f'<span class="chip">{esc(_engine_label(r, e))}: {i["by_engine"][e]["found"]}/{i["by_engine"][e]["runs"]}</span>'
            for e in engines
        )
        state = '<span class="state pos">found</span>' if i["found"] else '<span class="state risk">not found</span>'
        href = safe_href(i["url"])
        label = esc(i["label"])
        title = f'<a href="{esc(href)}" target="_blank" rel="noopener noreferrer">{label}</a>' if href else label
        cards.append(f'<div class="card car"><div>{state}</div><h3 style="margin-top:8px">{title}</h3><div class="per">{per}</div></div>')
    head = _head("Specific cars", 'Which of your cars <span class="accent">AI found</span>', intro)
    return f"""
<section class="block">
  {head}
  <div class="cars">{"".join(cards)}</div>
</section>"""


def _sources(r):
    s = r["sources"]
    rows = []
    for key in SOURCE_ORDER:
        entry = s["by_source"][key]
        if key == "dealer_site":
            yours = ('<span class="pos">yes</span>' if entry["citations"] else '<span class="risk">never cited</span>')
        elif entry["citations"] == 0:
            yours = '<span class="dim">not cited</span>'
        elif key == "other":
            yours = '<span class="dim">&ndash;</span>'
        else:
            yours = '<span class="pos">yes</span>' if entry["dealer_profile_cited"] else '<span class="risk">others only</span>'
        rows.append(
            f'<tr><td>{esc(SOURCE_LABELS[key])}</td><td class="c">{entry["citations"]}</td>'
            f'<td class="c">{entry["answers"]}</td><td>{yours}</td></tr>'
        )
    doms = []
    for d in s["domains"][: config.REPORT["top_domains_shown"]]:
        tag = ' <span class="chip blue">your site</span>' if d["is_dealer_site"] else ""
        doms.append(f'<tr><td>{esc(d["domain"])}{tag}</td><td class="c">{d["citations"]}</td></tr>')
    doms_html = "".join(doms) or '<tr><td colspan="2" class="muted">No citations.</td></tr>'
    head = _head(
        "Citations", 'Sources AI <span class="accent">trusted</span>',
        f'Where the {s["answers"]} answers pointed ({s["total_citations"]} citations in total). &ldquo;Yours&rdquo; means '
        "a page about your dealership on that platform was cited; &ldquo;others only&rdquo; means only other dealers&rsquo; pages were.",
    )
    return f"""
<section class="block">
  {head}
  <div class="grid2 wide-left">
    <div class="card table-wrap"><table>
      <thead><tr><th>Platform</th><th class="c">Citations</th><th class="c">Answers</th><th>Yours?</th></tr></thead>
      <tbody>{"".join(rows)}</tbody></table></div>
    <div class="card table-wrap"><table>
      <thead><tr><th>Most-cited domains</th><th class="c">Citations</th></tr></thead>
      <tbody>{doms_html}</tbody></table></div>
  </div>
</section>"""


def _yes_no(flag):
    return '<span class="pos">&#10003;</span>' if flag else '<span class="risk">&#10007;</span>'


def _technical(r):
    site = r["site_check"]
    title = 'Technical <span class="accent">checklist</span>'
    if site.get("mode") == "skipped":
        return f"""
<section class="block">{_head("Technical", title)}
<div class="card"><p class="muted" style="margin:0">The site check was skipped for this scan.</p></div></section>"""
    robots = site["robots"]
    status_cls = {"allowed": "pos", "blocked": "risk", "not mentioned": "muted", "unknown": "dim"}
    bot_rows = []
    for b in robots["bots"]:
        eff = b["effective"]
        eff_html = {"allowed": '<span class="pos">allowed</span>', "blocked": '<span class="risk">blocked</span>',
                    "partial": '<span class="risk">vehicle pages blocked</span>'}.get(eff, '<span class="dim">unknown</span>')
        bot_rows.append(
            f'<tr><td><strong>{esc(b["token"])}</strong><div class="dim" style="font-size:12px">{esc(b["owner"])} &middot; {esc(b["role"])}</div></td>'
            f'<td><span class="{status_cls.get(b["status"], "")}">{esc(b["status"])}</span></td><td>{eff_html}</td></tr>'
        )
    robots_note = f'<p class="dim" style="margin:10px 0 0;font-size:12.5px">{esc(robots["note"])}</p>' if robots["note"] else ""
    home = site["homepage"]
    if home["status_code"] is None:
        home_line = f'{_yes_no(False)} Homepage did not respond ({esc(home["error"] or "no response")})'
    else:
        home_line = (
            f'{_yes_no(home["ok"])} Homepage answered HTTP {esc(home["status_code"])} to a normal browser request'
            + (f' &mdash; {esc(home["challenge"])}' if home["challenge"] else "")
        )
    pages = site["vehicle_pages"]
    if pages:
        prow = []
        for p in pages:
            href = safe_href(p["url"])
            path = urlparse(p["url"]).path or p["url"]
            link = f'<a href="{esc(href)}" target="_blank" rel="noopener noreferrer">{esc(path)}</a>' if href else esc(path)
            if p["error"]:
                prow.append(f'<tr><td>{link}</td><td colspan="3" class="risk">{esc(p["error"])}</td></tr>')
            else:
                prow.append(f'<tr><td>{link}</td><td class="c">{_yes_no(p["price"])}</td><td class="c">{_yes_no(p["mileage"])}</td>'
                            f'<td class="c">{_yes_no(p["vin"])}</td></tr>')
        pages_html = (
            '<div class="table-wrap"><table><thead><tr><th>Vehicle page</th><th class="c">Price</th><th class="c">Mileage</th>'
            f'<th class="c">VIN</th></tr></thead><tbody>{"".join(prow)}</tbody></table></div>'
            '<p class="dim" style="font-size:12px;margin:8px 0 0">&#10003; = shown as plain text in the page HTML (what crawlers read without running scripts).</p>'
        )
    else:
        pages_html = '<p class="muted">No vehicle page could be checked (none given and none linked from the homepage).</p>'
    cf = site.get("cloudflare") or {}
    cf_html = ""
    if cf.get("detected"):
        evidence = "; ".join(cf["evidence"])
        cf_html = (
            f'<div class="callout"><div class="t">{esc(cf["note"])}</div>'
            f'<div class="dim" style="font-size:12.5px;margin-top:4px">Seen in: {esc(evidence)}. '
            'This is a finding only; robots.txt and the responses above show what is actually blocked.</div></div>'
        )
    sub = "Plain requests to your site: one request per page, like a normal browser."
    if site["mode"] == "mock":
        sub += " Mock scan: these checks ran against fixture pages, not a live website."
    return f"""
<section class="block page-start">
  {_head("Technical", title, sub)}
  <div class="grid2 stack-print">
    <div class="card table-wrap breakable"><h3>AI crawlers in robots.txt</h3>
      <table style="margin-top:8px"><thead><tr><th>Crawler</th><th>robots.txt</th><th>Effect</th></tr></thead>
      <tbody>{"".join(bot_rows)}</tbody></table>{robots_note}</div>
    <div class="card breakable"><h3>Homepage and vehicle pages</h3>
      <p style="margin:10px 0 12px">{home_line}</p>
      {pages_html}
      {cf_html}
    </div>
  </div>
</section>"""


def _reputation(r):
    rep, d = r["reputation"], r["dealer"]
    comp = [c for c in r["score"]["components"] if c["key"] == "reputation"][0]
    rows = [
        f'<tr class="you"><td><strong class="accent">{esc(d["dealership_name"])}</strong></td>'
        f'<td class="c">{esc("%.1f" % rep["google_rating"]) if rep["google_rating"] is not None else "&ndash;"}</td>'
        f'<td class="c">{esc(rep["google_review_count"]) if rep["google_review_count"] is not None else "&ndash;"}</td></tr>'
    ]
    for c in rep["competitors"]:
        rows.append(
            f'<tr><td>{esc(c["name"])}</td><td class="c">{esc("%.1f" % c["rating"]) if c["rating"] is not None else "&ndash;"}</td>'
            f'<td class="c">{esc(c["count"]) if c["count"] is not None else "&ndash;"}</td></tr>'
        )
    if rep["competitor_avg_rating"] is not None or rep["competitor_avg_count"] is not None:
        rows.append(
            f'<tr><td class="muted">Competitor average</td><td class="c muted">{esc(rep["competitor_avg_rating"]) if rep["competitor_avg_rating"] is not None else "&ndash;"}</td>'
            f'<td class="c muted">{esc(round(rep["competitor_avg_count"])) if rep["competitor_avg_count"] is not None else "&ndash;"}</td></tr>'
        )
    yelp = {True: '<span class="pos">yes</span>', False: '<span class="risk">no</span>', None: '<span class="dim">not known</span>'}[rep["yelp_claimed"]]
    parts = "".join(
        f'<li>{esc(p["label"])}: {esc(p["detail"])}' + ("" if p["assessed"] else ' <span class="chip">not assessed</span>') + "</li>"
        for p in comp["parts"]
    )
    head = _head(
        "Reputation", 'Reputation <span class="accent">snapshot</span>',
        "Ratings as entered for this scan (Google rating and review count). Yelp is recorded as claimed or not, nothing more.",
    )
    return f"""
<section class="block">
  {head}
  <div class="grid2">
    <div class="card table-wrap"><table><thead><tr><th>Dealership</th><th class="c">Google rating</th><th class="c">Reviews</th></tr></thead>
      <tbody>{"".join(rows)}</tbody></table></div>
    <div class="card"><h3>Yelp page claimed: {yelp}</h3><ul style="margin:12px 0 0;padding-left:18px">{parts}</ul></div>
  </div>
</section>"""


def _exposure(r):
    x = r["exposure"]
    if not x:
        return ""
    return f"""
<section class="block">
  {_head("Exposure", 'What is <span class="accent">in play</span>')}
  <div class="card exposure">
    <div class="big">${x["value"]:,.0f}<span class="muted" style="font-size:.4em"> / month</span></div>
    <p style="margin:10px 0 4px;font-size:16px">{esc(x["label"])}</p>
    <p class="muted" style="margin:0">{esc(x["formula"])}.</p>
    <p class="dim" style="margin:8px 0 0;font-size:12px">Share source: {esc(x["source_note"])}.</p>
  </div>
</section>"""


def _fixes(r):
    cards = "".join(
        f'<div class="card fix"><div class="no accent">{i}</div><div><h3>{esc(f["title"])}</h3>'
        f'<p style="margin:8px 0 0" class="muted">{esc(f["detail"])}</p></div></div>'
        for i, f in enumerate(r["fixes"], 1)
    )
    return f"""
<section class="block">
  {_head("What to fix first", 'Top 3 <span class="accent">fixes</span>')}
  <div class="fixes">{cards}</div>
</section>"""


def _method(r):
    d, scan = r["dealer"], r["scan"]
    mock = r["tool"]["mode"] == "mock"
    city = f'{d["city"]}, {d["state_code"] or d["state"]}'
    runs = scan["runs_per_question"]
    engines = "; ".join(f'{e["label"]} ({"mock" if e["mock"] else e["model"]})' for e in scan["engines"])
    weights = " &middot; ".join(f'{esc(v["label"])} {v["points"]}' for v in config.SCORING.values())
    extra = ""
    if scan.get("skipped_engines"):
        extra += " Not included in this scan: " + esc(", ".join(s["label"] for s in scan["skipped_engines"])) + "."
    failed = sum(1 for a in r["answers"] if a["error"])
    if failed:
        extra += f" {failed} of {len(r['answers'])} engine calls failed and are left out of every count."
    if mock:
        first = (
            f"<p><strong class=\"risk\">{esc(config.SAMPLE_LABEL)}.</strong> No engine was queried for this report: every "
            "answer is a fixture generated offline to show the format. In a live scan, answers are collected through each "
            f"engine's official API on the scan date, {runs} runs per question, location set to {esc(city)}. "
            "Answers vary run to run. AutoLander is not affiliated with OpenAI, Perplexity or Anthropic.</p>"
        )
    else:
        first = (
            f"<p>Answers collected through each engine's official API on {long_date(scan['date'])}, {runs} runs per question, "
            f"location set to {esc(city)}. Answers vary run to run. AutoLander is not affiliated with OpenAI, Perplexity or Anthropic.</p>"
        )
    return f"""
<section class="block">
  <div class="card method">
    <span class="eyebrow">Method</span>
    {first}
    <p>Engines: {esc(engines)}.{extra} A dealer counts as named when the answer text contains its name, a close variant of
    it, or its website address. The score weighs {weights} points; a part that could not be assessed is left out and
    the total is renormalised to 100.</p>
    <p class="dim">This report describes what the engines answered on the scan date. It does not predict rankings,
    traffic or sales.</p>
  </div>
</section>"""


def render_report(results):
    d = results["dealer"]
    mock = results["tool"]["mode"] == "mock"
    title = f"AI Visibility Scan \u2014 {d['dealership_name']}" + (" (SAMPLE)" if mock else "")
    ribbon = f'<div class="ribbon">{esc(config.SAMPLE_LABEL)}</div>' if mock else ""
    body = "".join([
        _cover(results), _recommends(results), _grid(results), _answers(results), _cars(results), _sources(results),
        _technical(results), _reputation(results), _exposure(results), _fixes(results), _method(results),
    ])
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{_FONTS}">
<style>{CSS}{_page_rules(mock, d["dealership_name"])}</style>
</head>
<body>
{ribbon}
<main class="wrap">
{body}
<footer class="foot"><span>Prepared by AutoLander &middot; autolander.ai</span><span>{esc(config.TOOL_NAME)} v{esc(config.TOOL_VERSION)}</span></footer>
</main>
</body>
</html>
"""
