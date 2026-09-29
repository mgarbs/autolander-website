"""Perplexity Agent API (the successor to Sonar chat completions, which Perplexity supports
only until 2026-09-27) with the web_search tool.

Docs (read 2026-09-27):
  https://docs.perplexity.ai/docs/agent-api/quickstart
  https://docs.perplexity.ai/docs/agent-api/tools/web-search.md
  https://docs.perplexity.ai/docs/agent-api/migrate-from-sonar/how-to.md
  https://docs.perplexity.ai/api-reference/agent-post.md
  https://docs.perplexity.ai/docs/getting-started/pricing
Request: POST /v1/agent {model:"perplexity/sonar" | preset, input, tools:[{type:"web_search",
user_location:{country, region, city}}], max_output_tokens}.
Answer text: output[type=message].content[type=output_text].text; citations: url_citation
annotations, plus "[n]" markers that point at output[type=search_results].results[id=n].
usage.cost.total_cost is the API's own cost figure and is used when present.
"""

import re

from ..models import Answer
from .base import Engine, approx_location, citation, dedupe_citations, make_usage


class PerplexityEngine(Engine):
    name = "perplexity"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.preset = (self.settings.get(self.cfg["preset_env"]) or "").strip()
        if self.preset:
            self.model = f"preset:{self.preset}"

    def build_payload(self, question, dealer):
        payload = {
            "input": question.text,
            "tools": [{"type": "web_search", "user_location": approx_location(dealer, with_type=False, with_timezone=False)}],
            "max_output_tokens": self.cfg["max_output_tokens"],
        }
        if self.preset:
            payload["preset"] = self.preset
        else:
            payload["model"] = self.model
        return payload

    def _headers(self):
        return {"Authorization": f"Bearer {self._key}", "Content-Type": "application/json"}

    def _ask(self, question, dealer, run):
        data, retries = self.http.post_json(self.cfg["endpoint"], self._headers(), self.build_payload(question, dealer))
        answer = self.parse(data, question.id, run)
        if retries:
            answer.warnings.append(f"retried {retries} time(s)")
        return answer

    def parse(self, data, question_id, run):
        results, consulted, texts, cites, result_items = {}, [], [], [], 0
        for item in data.get("output") or []:
            kind = item.get("type")
            if kind == "search_results":
                result_items += 1
                for r in item.get("results") or []:
                    if not r.get("url"):
                        continue
                    consulted.append(citation(r["url"], r.get("title", "")))
                    if r.get("id") is not None:
                        results[str(r["id"])] = r
            elif kind == "message":
                for part in item.get("content") or []:
                    if part.get("type") != "output_text":
                        continue
                    texts.append(part.get("text") or "")
                    for ann in part.get("annotations") or []:
                        if ann.get("type") == "url_citation" and ann.get("url"):
                            cites.append(citation(ann["url"], ann.get("title", "")))
        text = "\n\n".join(t for t in texts if t).strip() or str(data.get("output_text") or "").strip()
        for n in re.findall(r"\[(\d{1,3})\]", text):
            r = results.get(n)
            if r and r.get("url"):
                cites.append(citation(r["url"], r.get("title", "")))
        u = data.get("usage") or {}
        details = u.get("tool_calls_details") or {}
        searches = sum(
            int((v or {}).get("invocation", 0) or 0) for k, v in details.items() if "search" in str(k) and isinstance(v, dict)
        ) or result_items
        cost = (u.get("cost") or {}).get("total_cost")
        model = data.get("model") or self.model
        usage = make_usage(
            self.name,
            model if not self.preset else "",
            input_tokens=u.get("input_tokens", 0),
            cached_input_tokens=(u.get("input_tokens_details") or {}).get("cached_tokens", 0),
            output_tokens=u.get("output_tokens", 0),
            searches=searches,
            api_cost=cost,
        )
        answer = Answer(
            self.name, model, question_id, run, text=text,
            citations=dedupe_citations(cites), consulted=dedupe_citations(consulted), usage=usage,
        )
        if data.get("status") == "failed" or data.get("error"):
            err = data.get("error") or {}
            msg = err.get("message") if isinstance(err, dict) else str(err)
            answer.error = self.redact(f"the response failed: {msg}"[:250])
        if not text and not answer.error:
            answer.error = "the engine returned no answer text"
        return answer
