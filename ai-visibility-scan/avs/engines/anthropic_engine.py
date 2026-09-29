"""Anthropic Messages API with the web search server tool.

Docs (read 2026-09-27):
  https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool
  https://platform.claude.com/docs/en/about-claude/pricing
  https://platform.claude.com/docs/en/about-claude/models/overview
Request: POST /v1/messages with headers x-api-key, anthropic-version: 2023-06-01 and
tools:[{type:"web_search_20250305", name:"web_search", max_uses, user_location:{type:"approximate",
city, region, country, timezone}}]. Answer text: content blocks of type text; citations: their
citations of type web_search_result_location (url, title). Searches billed:
usage.server_tool_use.web_search_requests. stop_reason "pause_turn" means send the assistant
content back unchanged to let the turn continue.
"""

from collections import Counter

from ..models import Answer
from .base import Engine, approx_location, citation, dedupe_citations, make_usage


class AnthropicEngine(Engine):
    name = "anthropic"

    def build_payload(self, question, dealer, messages=None):
        tool = {
            "type": self.cfg["tool_type"],
            "name": "web_search",
            "max_uses": self.cfg["max_uses"],
            "user_location": approx_location(dealer),
        }
        return {
            "model": self.model,
            "max_tokens": self.cfg["max_tokens"],
            "messages": messages or [{"role": "user", "content": question.text}],
            "tools": [tool],
        }

    def _headers(self):
        return {"x-api-key": self._key, "anthropic-version": self.cfg["api_version"], "content-type": "application/json"}

    def _ask(self, question, dealer, run):
        messages = [{"role": "user", "content": question.text}]
        blocks, totals, model, stop, retries_total = [], Counter(), self.model, None, 0
        for _ in range(1 + self.cfg["max_continuations"]):
            data, retries = self.http.post_json(self.cfg["endpoint"], self._headers(), self.build_payload(question, dealer, messages))
            retries_total += retries
            content = data.get("content") or []
            blocks.extend(content)
            u = data.get("usage") or {}
            cache_read = u.get("cache_read_input_tokens") or 0
            totals["input"] += (u.get("input_tokens") or 0) + (u.get("cache_creation_input_tokens") or 0) + cache_read
            totals["cached"] += cache_read
            totals["output"] += u.get("output_tokens") or 0
            totals["searches"] += (u.get("server_tool_use") or {}).get("web_search_requests") or 0
            model = data.get("model") or model
            stop = data.get("stop_reason")
            if stop != "pause_turn":
                break
            messages = messages + [{"role": "assistant", "content": content}]
        answer = self.parse_blocks(blocks, question.id, run, model, totals)
        if stop == "pause_turn":
            answer.warnings.append("stopped at the continuation limit (pause_turn)")
        elif stop == "max_tokens":
            answer.warnings.append("answer truncated at max_tokens")
        if retries_total:
            answer.warnings.append(f"retried {retries_total} time(s)")
        return answer

    def parse_blocks(self, blocks, question_id, run, model, totals):
        cites, consulted, search_errors = [], [], []
        last_result = max((i for i, b in enumerate(blocks) if b.get("type") == "web_search_tool_result"), default=-1)
        texts = []
        for i, block in enumerate(blocks):
            kind = block.get("type")
            if kind == "text":
                if i > last_result:  # the final answer comes after the last search result
                    texts.append(block.get("text") or "")
                for c in block.get("citations") or []:
                    if c.get("type") == "web_search_result_location" and c.get("url"):
                        cites.append(citation(c["url"], c.get("title", "")))
            elif kind == "web_search_tool_result":
                content = block.get("content")
                if isinstance(content, list):
                    for r in content:
                        if r.get("type") == "web_search_result" and r.get("url"):
                            consulted.append(citation(r["url"], r.get("title", "")))
                elif isinstance(content, dict) and content.get("type") == "web_search_tool_result_error":
                    search_errors.append(content.get("error_code") or "unknown")
        text = "".join(texts).strip()
        if not text:
            text = "".join(b.get("text") or "" for b in blocks if b.get("type") == "text").strip()
        usage = make_usage(
            self.name, model, input_tokens=totals["input"], cached_input_tokens=totals["cached"],
            output_tokens=totals["output"], searches=totals["searches"],
        )
        answer = Answer(
            self.name, model, question_id, run, text=text,
            citations=dedupe_citations(cites), consulted=dedupe_citations(consulted), usage=usage,
        )
        if search_errors:
            answer.warnings.append("web search errors: " + ", ".join(sorted(set(search_errors))))
        if not text:
            answer.error = "the engine returned no answer text"
        return answer
