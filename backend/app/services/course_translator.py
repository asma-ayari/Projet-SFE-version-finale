"""
Traduction bilingue (FR/AR) des cours créés par les formateurs.
"""
import json
import logging
from typing import Any, Dict, Optional, Tuple

from app.schemas.course import CourseDetailResponse, CourseListResponse
from app.services.qcm_generator import _extract_json, _invoke_llm_with_retry, _get_llm
from app.services.qcm_translator import detect_language

_LOGGER = logging.getLogger(__name__)
_TRANSLATION_CACHE: Dict[Tuple[int, str, str], Dict[str, Any]] = {}


def get_course_source_language(sample_text: Optional[str]) -> str:
    return detect_language(sample_text)


def _build_translate_prompt(payload: dict, source_lang: str, target_lang: str, include_content: bool) -> str:
    lang_names = {"fr": "français", "ar": "arabe"}
    src = lang_names.get(source_lang, source_lang)
    tgt = lang_names.get(target_lang, target_lang)

    fields = '"title", "description"'
    if include_content:
        fields += ', "content"'

    return f"""Tu es un traducteur expert en securite routiere tunisienne.
Traduis ce cours du {src} vers le {tgt}.
Regles:
- Retourne UNIQUEMENT du JSON valide, sans markdown.
- Traduis {fields}.
- Ne laisse AUCUN texte en {src}.
- Conserve la mise en forme HTML dans "content" si presente.
- Garde le sens pedagogique et les termes techniques corrects.

Format attendu:
{{
  "title": "...",
  "description": "..."{', "content": "..."' if include_content else ''}
}}

JSON a traduire:
{json.dumps(payload, ensure_ascii=False)}
"""


def translate_list_item(
    item: CourseListResponse,
    source_lang: str,
    target_lang: str,
) -> CourseListResponse:
    if not target_lang or target_lang not in ("fr", "ar") or source_lang == target_lang:
        return item

    cache_key = (item.id, target_lang, "list")
    if cache_key in _TRANSLATION_CACHE:
        cached = _TRANSLATION_CACHE[cache_key]
        data = item.model_dump()
        data["title"] = cached.get("title", data["title"])
        if cached.get("description") is not None:
            data["description"] = cached.get("description")
        return CourseListResponse.model_validate(data)

    payload = {"title": item.title, "description": item.description}
    prompt = _build_translate_prompt(payload, source_lang, target_lang, include_content=False)
    llm = _get_llm()
    result = _invoke_llm_with_retry(llm, prompt)
    try:
        translated = _extract_json(result.content or "")
    except ValueError as exc:
        _LOGGER.warning("Traduction liste cours %s echouee: %s", item.id, exc)
        return item

    _TRANSLATION_CACHE[cache_key] = translated
    data = item.model_dump()
    data["title"] = translated.get("title", data["title"])
    if translated.get("description") is not None:
        data["description"] = translated.get("description")
    return CourseListResponse.model_validate(data)


def translate_course_detail(
    response: CourseDetailResponse,
    source_lang: str,
    target_lang: str,
) -> CourseDetailResponse:
    if not target_lang or target_lang not in ("fr", "ar") or source_lang == target_lang:
        return response

    cache_key = (response.id, target_lang, "detail")
    if cache_key in _TRANSLATION_CACHE:
        cached = _TRANSLATION_CACHE[cache_key]
        data = response.model_dump()
        data["title"] = cached.get("title", data["title"])
        if cached.get("description") is not None:
            data["description"] = cached.get("description")
        if cached.get("content") is not None:
            data["content"] = cached.get("content")
        return CourseDetailResponse.model_validate(data)

    payload = {
        "title": response.title,
        "description": response.description,
        "content": response.content,
    }
    prompt = _build_translate_prompt(payload, source_lang, target_lang, include_content=True)
    llm = _get_llm()
    result = _invoke_llm_with_retry(llm, prompt)
    try:
        translated = _extract_json(result.content or "")
    except ValueError as exc:
        _LOGGER.warning("Traduction detail cours %s echouee: %s", response.id, exc)
        return response

    _TRANSLATION_CACHE[cache_key] = translated
    data = response.model_dump()
    data["title"] = translated.get("title", data["title"])
    if translated.get("description") is not None:
        data["description"] = translated.get("description")
    if translated.get("content") is not None:
        data["content"] = translated.get("content")
    return CourseDetailResponse.model_validate(data)
