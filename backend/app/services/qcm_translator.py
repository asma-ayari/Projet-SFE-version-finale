"""
Traduction bilingue (FR/AR) des QCM auto-générés à la volée.
"""
import hashlib
import json
import logging
import re
from typing import Any, Dict, Optional, Tuple

from app.schemas.qcm import QCMPublicResponse, QCMListResponse
from app.services.qcm_generator import _extract_json, _invoke_llm_with_retry, _get_llm

_LOGGER = logging.getLogger(__name__)
_TRANSLATION_CACHE: Dict[str, Dict[str, Any]] = {}
_CACHE_MAX_SIZE = 500  # évite la croissance non bornée en mémoire


def detect_language(text: Optional[str]) -> str:
    if not text:
        return "fr"
    if re.search(r"[\u0600-\u06FF]", text):
        return "ar"
    return "fr"


def get_source_language(generation_language: Optional[str], sample_text: Optional[str]) -> str:
    if generation_language in ("fr", "ar"):
        return generation_language
    return detect_language(sample_text)


def _build_translate_prompt(payload: dict, source_lang: str, target_lang: str) -> str:
    lang_names = {"fr": "français", "ar": "arabe"}
    src = lang_names.get(source_lang, source_lang)
    tgt = lang_names.get(target_lang, target_lang)
    return f"""Tu es un traducteur expert en securite routiere tunisienne.
Traduis ce QCM du {src} vers le {tgt}.
Regles:
- Retourne UNIQUEMENT du JSON valide, sans markdown.
- Conserve EXACTEMENT les memes champs "id" numeriques pour questions et answers.
- Traduis title, description, text, explanation, answers[].text.
- Ne laisse AUCUN texte en {src}.
- Garde le sens technique et les termes de signalisation corrects.

Format attendu:
{{
  "title": "...",
  "description": "...",
  "questions": [
    {{
      "id": 1,
      "text": "...",
      "explanation": "...",
      "answers": [{{"id": 10, "text": "..."}}]
    }}
  ]
}}

JSON a traduire:
{json.dumps(payload, ensure_ascii=False)}
"""


def _apply_translation(
    response: QCMPublicResponse,
    translated: dict,
) -> QCMPublicResponse:
    data = response.model_dump()
    data["title"] = translated.get("title", data["title"])
    if translated.get("description") is not None:
        data["description"] = translated.get("description")

    translated_questions = [
        q for q in translated.get("questions", []) if isinstance(q, dict)
    ]
    question_map = {q["id"]: q for q in translated_questions if q.get("id") is not None}

    for idx, question in enumerate(data.get("questions", [])):
        tq = question_map.get(question["id"])
        if not tq and idx < len(translated_questions):
            tq = translated_questions[idx]
        if not tq:
            continue
        if tq.get("text"):
            question["text"] = tq["text"]
        if tq.get("explanation") is not None:
            question["explanation"] = tq.get("explanation")
        translated_answers = [a for a in tq.get("answers", []) if isinstance(a, dict)]
        answer_map = {a["id"]: a for a in translated_answers if a.get("id") is not None}
        for a_idx, answer in enumerate(question.get("answers", [])):
            ta = answer_map.get(answer["id"])
            if not ta and a_idx < len(translated_answers):
                ta = translated_answers[a_idx]
            if ta and ta.get("text"):
                answer["text"] = ta["text"]

    return QCMPublicResponse.model_validate(data)


def _make_cache_key(qcm_id: int, target_lang: str, content_hash: str) -> str:
    """Clé de cache incluant le hash du contenu pour invalider si le QCM change."""
    return f"{qcm_id}:{target_lang}:{content_hash}"


def _content_hash(title: Optional[str], description: Optional[str] = None) -> str:
    raw = (title or "") + "|¦|" + (description or "")
    return hashlib.md5(raw.encode("utf-8")).hexdigest()[:8]


def _cache_set(key: str, value: Dict[str, Any]) -> None:
    if len(_TRANSLATION_CACHE) >= _CACHE_MAX_SIZE:
        # Supprime le premier élément inséré (FIFO simpliste)
        oldest = next(iter(_TRANSLATION_CACHE))
        del _TRANSLATION_CACHE[oldest]
    _TRANSLATION_CACHE[key] = value


def translate_public_qcm(
    response: QCMPublicResponse,
    source_lang: str,
    target_lang: str,
) -> QCMPublicResponse:
    if not target_lang or target_lang not in ("fr", "ar") or source_lang == target_lang:
        return response

    chash = _content_hash(response.title, response.description)
    cache_key = _make_cache_key(response.id, target_lang, chash)
    if cache_key in _TRANSLATION_CACHE:
        _LOGGER.debug("[cache hit] QCM %s -> %s", response.id, target_lang)
        return _apply_translation(response, _TRANSLATION_CACHE[cache_key])

    payload = {
        "title": response.title,
        "description": response.description,
        "questions": [
            {
                "id": q.id,
                "text": q.text,
                "explanation": getattr(q, "explanation", None),
                "answers": [{"id": a.id, "text": a.text} for a in q.answers],
            }
            for q in response.questions
        ],
    }

    prompt = _build_translate_prompt(payload, source_lang, target_lang)
    llm = _get_llm()
    result = _invoke_llm_with_retry(llm, prompt)
    content = result.content or ""
    try:
        translated = _extract_json(content)
    except ValueError as exc:
        _LOGGER.warning("Traduction QCM %s echouee: %s", response.id, exc)
        return response

    _cache_set(cache_key, translated)
    return _apply_translation(response, translated)


def translate_list_item(
    item: QCMListResponse,
    source_lang: str,
    target_lang: str,
) -> QCMListResponse:
    if not item.is_generated:
        return item
    if not target_lang or target_lang not in ("fr", "ar") or source_lang == target_lang:
        return item

    chash = _content_hash(item.title, item.description)
    cache_key = _make_cache_key(item.id, f"list_{target_lang}", chash)
    if cache_key in _TRANSLATION_CACHE:
        cached = _TRANSLATION_CACHE[cache_key]
        data = item.model_dump()
        data["title"] = cached.get("title", data["title"])
        if cached.get("description") is not None:
            data["description"] = cached.get("description")
        return QCMListResponse.model_validate(data)

    payload = {"title": item.title, "description": item.description}
    prompt = _build_translate_prompt(payload, source_lang, target_lang)
    llm = _get_llm()
    result = _invoke_llm_with_retry(llm, prompt)
    try:
        translated = _extract_json(result.content or "")
    except ValueError:
        return item

    _cache_set(cache_key, translated)
    data = item.model_dump()
    data["title"] = translated.get("title", data["title"])
    if translated.get("description") is not None:
        data["description"] = translated.get("description")
    return QCMListResponse.model_validate(data)
