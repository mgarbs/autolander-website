"""OpenAI Responses API with the web_search tool.

Docs (read 2026-09-27):
  https://developers.openai.com/api/docs/guides/tools-web-search
  https://developers.openai.com/api/docs/pricing
Request: POST /v1/responses {model, input, tools:[{type:"web_search", user_location:{type:"approximate",
city, region, country, timezone}}], include:["web_search_call.action.sources"], reasoning:{effort}}.
Answer text: output[type=message].content[type=output_text].text; citations: its annotations of
type url_citation (url, title). Each web_search_call with action.type "search" is a billed call.
"""

import json

from ..models import Answer
from .base import Engine, approx_location, citation, dedupe_citations, make_usage

_REASONING_PREFIXES = ("gpt-5", "gpt-6", "o1", "o3", "o4")


def is_reasoning_model(model):
    return (model or "").lower().startswith(_REASONING_PREFIXES)


class OpenAIEngine(Engine):
    name = "openai"

    def build_payload(self, question, dealer):
        payload = {
            "model": self.model,
            "input": question.text,
            "tools": [{"type": "web_search", "user_location": approx_location(dealer)}],
            "include": ["web_search_call.action.sources"],
            "max_output_tokens": self.cfg["max_output_tokens"],
            "store": False,
        }
        effort = (self.settings.get(self.cfg["reasoning_env"]) or self.cfg["default_reasoning_effort"]).strip().lower()
        if effort and effort != "omit" and is_reasoning_model(self.model):
            payload["reasoning"] = {"effort": effort}
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
        texts, cites, consulted, searches = [], [], [], 0
        for item in data.get("output") or []:
            kind = item.get("type")
            if kind == "web_search_call":
                action = item.get("action") or {}
                if action.get("type", "search") == "search":
                    searches += 1
                for src in action.get("sources") or []:
                    if isinstance(src, dict) and src.get("url"):
                        consulted.append(citation(src["url"], src.get("title", "")))
            elif kind == "message":
                for part in item.get("content") or []:
                    if part.get("type") != "output_text":
                        continue
                    texts.append(part.get("text") or "")
                    for ann in part.get("annotations") or []:
                        if ann.get("type") == "url_citation" and ann.get("url"):
                            cites.append(citation(ann["url"], ann.get("title", "")))
        text = "\n\n".join(t for t in texts if t).strip() or str(data.get("output_text") or "").strip()
        model = data.get("model") or self.model
        u = data.get("usage") or {}
        usage = make_usage(
            self.name,
            model,
            input_tokens=u.get("input_tokens", 0),
            cached_input_tokens=(u.get("input_tokens_details") or {}).get("cached_tokens", 0),
            output_tokens=u.get("output_tokens", 0),
            searches=searches,
        )
        answer = Answer(
            self.name, model, question_id, run, text=text,
            citations=dedupe_citations(cites), consulted=dedupe_citations(consulted), usage=usage,
        )
        status = data.get("status")
        if status == "failed" or data.get("error"):
            answer.error = self.redact("the response failed: " + json.dumps(data.get("error"))[:200])
        elif status == "incomplete":
            reason = (data.get("incomplete_details") or {}).get("reason", "unknown")
            answer.warnings.append(f"incomplete answer ({reason})")
        if not text and not answer.error:
            answer.error = "the engine returned no answer text"
        return answer
