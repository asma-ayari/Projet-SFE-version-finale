import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.services.rag_service import (
    NO_DATA_MSG,
    _build_strict_prompt,
    _extract_citation_ids,
    _extract_supporting_citation_ids,
    _is_answer_fully_cited,
    ask_question,
    get_llm,
)
from app.services.vector_store import search_similar

q = "Le port de la ceinture de sécurité est-il obligatoire ?"

print("--- ask_question ---")
print(json.dumps(ask_question(q, language="fr"), ensure_ascii=False, indent=2))

print("\n--- retrieval ---")
docs = search_similar(q, k=settings.TOP_K_RESULTS, language="fr")
print("docs_fr", len(docs))
for i, d in enumerate(docs, 1):
    print(i, d.metadata.get("source"), d.metadata.get("language"), d.metadata.get("score"))
    print(d.page_content[:180].replace("\n", " "))

if not docs:
    raise SystemExit

code_docs = [d for d in docs if "code_route_tunisie" in str(d.metadata.get("source", "")).lower()]
print("code_docs", len(code_docs))
if code_docs:
    docs = code_docs

sources = []
context_parts = []
for idx, d in enumerate(docs, 1):
    cid = f"S{idx}"
    sources.append({"citation_id": cid})
    context_parts.append(f"[{cid}] Source: {d.metadata.get('source')} | Langue: {d.metadata.get('language')}\n{d.page_content}")
context = "\n\n---\n\n".join(context_parts)

llm = get_llm()
ans = llm.invoke(_build_strict_prompt("fr", q, context)).content.strip()
valid = {s["citation_id"] for s in sources}
used = [c for c in _extract_citation_ids(ans) if c in valid]
print("\n--- strict answer ---")
print(ans)
print("used", used)
print("full", _is_answer_fully_cited(ans, valid))
print("supporting", _extract_supporting_citation_ids(ans, valid))
print("is_no_data", ans == NO_DATA_MSG["fr"])
