"""
Generation automatique de QCM via LLM (independant du RAG).
"""
import json
import logging
import os
import re
import time
from difflib import SequenceMatcher
from typing import Any, List, Optional, Tuple

from langchain_groq import ChatGroq
from langchain_core.documents import Document
from groq import RateLimitError

from app.core.config import settings
from app.services.document_loader import load_documents
from app.services.unsplash_service import UnsplashService


_LLM_INSTANCE: Optional[ChatGroq] = None
_LOGGER = logging.getLogger(__name__)
_QCM_SOURCE_FILE = "PFD pour le chatbot des cours de sécurité routière.pdf"
_QCM_CONTEXT_MAX_CHARS = 5000
_QCM_BASE_TEMPERATURE = 0.2
_QCM_FALLBACK_TEMPERATURE = 0.6
_QCM_MAX_ATTEMPTS = 6
_QCM_BATCH_SIZE = 6
_SIMILARITY_SEQUENCE_THRESHOLD = 0.90
_SIMILARITY_JACCARD_THRESHOLD = 0.75
_QCM_RATE_LIMIT_RETRIES = 2
_QCM_RATE_LIMIT_BASE_DELAY = 6.0
_QCM_INTER_BATCH_DELAY = 2.5


def _get_llm(temperature: Optional[float] = None) -> ChatGroq:
    global _LLM_INSTANCE
    temp = _QCM_BASE_TEMPERATURE if temperature is None else temperature
    if temp == _QCM_BASE_TEMPERATURE and _LLM_INSTANCE is not None:
        return _LLM_INSTANCE

    max_tokens = max(2048, settings.MAX_TOKENS)
    max_tokens = min(3500, max_tokens)
    instance = ChatGroq(
        model=settings.GROQ_MODEL,
        groq_api_key=settings.GROQ_API_KEY,
        max_tokens=max_tokens,
        temperature=temp,
    )
    if temp == _QCM_BASE_TEMPERATURE:
        _LLM_INSTANCE = instance
    return instance


def _normalize(text: str) -> str:
    t = text.lower()
    t = re.sub(r"[^a-z0-9\u0600-\u06FF\s]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def _tokenize(text: str) -> List[str]:
    t = _normalize(text)
    return [tok for tok in t.split(" ") if len(tok) >= 3]


def _jaccard(a: str, b: str) -> float:
    ta = set(_tokenize(a))
    tb = set(_tokenize(b))
    
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / max(len(ta | tb), 1)


def _sequence_ratio(a: str, b: str) -> float:
    return SequenceMatcher(None, _normalize(a), _normalize(b)).ratio()


def _is_similar(a: str, b: str) -> bool:
    if _normalize(a) == _normalize(b):
        return True
    if _sequence_ratio(a, b) >= _SIMILARITY_SEQUENCE_THRESHOLD:
        return True
    if _jaccard(a, b) >= _SIMILARITY_JACCARD_THRESHOLD:
        return True
    return False


def _extract_retry_delay(message: str) -> Optional[float]:
    match = re.search(r"try again in ([0-9.]+)s", message)
    if not match:
        return None
    try:
        return float(match.group(1))
    except ValueError:
        return None


def _invoke_llm_with_retry(llm: ChatGroq, prompt: str) -> Any:
    delay = _QCM_RATE_LIMIT_BASE_DELAY
    last_error: Optional[Exception] = None
    for attempt in range(_QCM_RATE_LIMIT_RETRIES + 1):
        try:
            return llm.invoke(prompt)
        except RateLimitError as exc:
            last_error = exc
            if attempt >= _QCM_RATE_LIMIT_RETRIES:
                raise
            wait = _extract_retry_delay(str(exc)) or delay
            _LOGGER.warning("Rate limit Groq, retry in %.1fs", wait)
            time.sleep(wait)
            delay = min(delay * 1.8, 30.0)

    if last_error:
        raise last_error
    raise RuntimeError("LLM invocation failed without error")


def _strip_newlines_in_strings(text: str) -> str:
    out = []
    in_string = False
    escape = False

    for ch in text:
        if in_string:
            if escape:
                out.append(ch)
                escape = False
                continue
            if ch == "\\":
                out.append(ch)
                escape = True
                continue
            if ch == '"':
                in_string = False
                out.append(ch)
                continue
            if ch in ("\n", "\r"):
                out.append(" ")
                continue
            out.append(ch)
            continue

        if ch == '"':
            in_string = True
        out.append(ch)

    return "".join(out)


def _extract_balanced_json(text: str) -> str:
    start_obj = text.find("{")
    start_arr = text.find("[")
    starts = [i for i in (start_obj, start_arr) if i != -1]
    if not starts:
        return text

    start = min(starts)
    stack: List[str] = []
    in_string = False
    escape = False

    for i in range(start, len(text)):
        ch = text[i]
        if in_string:
            if escape:
                escape = False
                continue
            if ch == "\\":
                escape = True
                continue
            if ch == '"':
                in_string = False
            continue

        if ch == '"':
            in_string = True
            continue
        if ch in ("{", "["):
            stack.append(ch)
            continue
        if ch in ("}", "]"):
            if stack:
                stack.pop()
            if not stack:
                return text[start:i + 1]

    return text[start:]


def _close_unbalanced_json(text: str) -> str:
    stack: List[str] = []
    in_string = False
    escape = False

    for ch in text:
        if in_string:
            if escape:
                escape = False
                continue
            if ch == "\\":
                escape = True
                continue
            if ch == '"':
                in_string = False
            continue

        if ch == '"':
            in_string = True
            continue
        if ch in ("{", "["):
            stack.append(ch)
            continue
        if ch in ("}", "]"):
            if stack:
                stack.pop()

    if in_string or not stack:
        return text

    closers = []
    for opener in reversed(stack):
        closers.append("}" if opener == "{" else "]")
    return text + "".join(closers)


def _cleanup_json(text: str) -> str:
    cleaned = text
    cleaned = cleaned.replace("\u201c", '"').replace("\u201d", '"')
    cleaned = cleaned.replace("\u2019", "'").replace("`", '"')
    cleaned = cleaned.replace("\u2028", " ").replace("\u2029", " ")
    cleaned = cleaned.replace("\r\n", " ").replace("\n", " ").replace("\r", " ")
    cleaned = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", " ", cleaned)
    cleaned = _strip_newlines_in_strings(cleaned)
    cleaned = re.sub(r",\s*([}\]])", r"\1", cleaned)
    return cleaned


def _extract_json(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```[a-zA-Z]*", "", cleaned)
        cleaned = cleaned.strip().rstrip("```").strip()

    payload = _extract_balanced_json(cleaned)
    payload = _cleanup_json(payload)
    payload = _close_unbalanced_json(payload)

    try:
        return json.loads(payload)
    except json.JSONDecodeError:
        # Fallback: try Python literal evaluation for single-quoted JSON.
        try:
            import ast

            py_like = re.sub(r"\btrue\b", "True", payload, flags=re.IGNORECASE)
            py_like = re.sub(r"\bfalse\b", "False", py_like, flags=re.IGNORECASE)
            py_like = re.sub(r"\bnull\b", "None", py_like, flags=re.IGNORECASE)
            return ast.literal_eval(py_like)
        except Exception as exc:
            raise ValueError("JSON invalide retourne par le modele.") from exc


def _extract_questions_from_text(text: str) -> List[dict]:
    cleaned = _cleanup_json(text)
    marker = cleaned.find("\"questions\"")
    if marker != -1:
        sub = cleaned[marker:]
        array_start = sub.find("[")
        if array_start != -1:
            cleaned = sub[array_start:]

    start = cleaned.find("[")
    if start != -1:
        cleaned = cleaned[start:]

    questions: List[dict] = []
    depth = 0
    in_string = False
    escape = False
    buf: List[str] = []
    capturing = False

    for ch in cleaned:
        if in_string:
            buf.append(ch)
            if escape:
                escape = False
                continue
            if ch == "\\":
                escape = True
                continue
            if ch == '"':
                in_string = False
            continue

        if ch == '"':
            in_string = True
            buf.append(ch)
            continue

        if ch == "{":
            depth += 1
            capturing = True
            buf.append(ch)
            continue

        if ch == "}":
            if capturing:
                depth -= 1
                buf.append(ch)
                if depth == 0:
                    raw_obj = "".join(buf)
                    buf = []
                    capturing = False
                    try:
                        obj_text = _cleanup_json(raw_obj)
                        obj_text = _close_unbalanced_json(obj_text)
                        obj = json.loads(obj_text)
                        if isinstance(obj, dict):
                            questions.append(obj)
                    except Exception:
                        pass
            continue

        if capturing:
            buf.append(ch)

    return questions


def _parse_questions_from_response(content: str) -> Tuple[dict, List[dict]]:
    try:
        payload = _extract_json(content)
    except ValueError:
        questions = _extract_questions_from_text(content)
        payload = {"title": "QCM genere", "description": "QCM auto-genere"}
        return payload, questions

    if isinstance(payload, list):
        return {"title": "QCM genere", "description": "QCM auto-genere"}, payload
    if isinstance(payload, dict):
        return payload, payload.get("questions") or []

    return {"title": "QCM genere", "description": "QCM auto-genere"}, []


def _build_context(language: str, max_chars: int = _QCM_CONTEXT_MAX_CHARS) -> str:
    docs = load_documents()
    expected_base = os.path.splitext(_QCM_SOURCE_FILE)[0].lower()
    filtered = [
        d for d in docs
        if d.metadata.get("language") == language
        and os.path.splitext((d.metadata.get("source") or "").lower())[0] == expected_base
    ]
    if not filtered:
        return ""

    parts: List[str] = []
    total = 0
    for doc in filtered:
        source = doc.metadata.get("source", "document")
        snippet = doc.page_content.strip()
        if not snippet:
            continue
        snippet = snippet[:3000]
        block = f"Source: {source}\n{snippet}"
        parts.append(block)
        total += len(block)
        if total >= max_chars:
            break

    return "\n\n---\n\n".join(parts)


def _build_prompt(
    context: str,
    language: str,
    mode: str,
    theme: Optional[str],
    question_count: int,
    difficulty: str,
) -> str:
    if language == "ar":
        theme_line = f"الموضوع المحدد: {theme}" if theme else ""
        return f"""أنت خبير في السلامة المرورية في تونس.
    اكتب اختبار اختيار من متعدد (QCM) بصيغة JSON فقط وبشكل مضغوط.
المطلوب:
- عدد الأسئلة: {question_count}
- مستوى الصعوبة: {difficulty}
- كل سؤال يحتوي 4 إجابات بالضبط مع إجابة صحيحة واحدة.
- كل سؤال يجب أن يعالج مفهوما مختلفا بوضوح.
- تجنب التكرار وإعادة صياغة نفس المفهوم.
- يجب أن يذكر العنوان الموضوع المحدد (أو قائمة الموضوعات).
- لا تضف أي نص خارج JSON.
    - JSON صارم: علامات اقتباس مزدوجة فقط، بدون فواصل زائدة، ولا أسطر داخل النصوص.
- لكل سؤال: اضف حقل "image_description" بوصف قصير لصورة توضيحية (10-15 كلمة باللغة الإنجليزية).
{theme_line}

هيكل JSON المطلوب:
{{
  "title": "...",
  "description": "...",
  "questions": [
    {{
      "text": "...",
      "image_description": "road safety, warning sign, Tunisia",
      "explanation": "... (جملة قصيرة جدا)",
      "answers": [
        {{"text": "...", "is_correct": true}},
        {{"text": "...", "is_correct": false}},
        {{"text": "...", "is_correct": false}},
        {{"text": "...", "is_correct": false}}
      ]
    }}
  ]
}}

السياق:
{context}
"""

    theme_line = f"Theme specifique: {theme}" if theme else ""
    return f"""Tu es un expert en securite routiere en Tunisie.
Genere un QCM au format JSON uniquement et compact.
Exigences:
- Nombre de questions: {question_count}
- Niveau: {difficulty}
- 4 reponses par question, 1 seule correcte.
- Chaque question doit porter sur un concept distinct.
- Evite toute repetition ou reformulation d'un meme concept.
- Le titre doit mentionner le theme (ou la liste des themes).
- Aucun texte hors JSON.
- JSON strict: guillemets doubles, pas de virgules finales, pas de retours a la ligne dans les chaines.
- Pour chaque question: ajoute un champ "image_description" avec une description courte d'une image illustrative (10-15 mots en anglais).
{theme_line}

Format JSON attendu:
{{
  "title": "...",
  "description": "...",
  "questions": [
    {{
      "text": "...",
      "image_description": "car safety, seatbelt, road rules, Tunisia",
      "explanation": "... (tres court)",
      "answers": [
        {{"text": "...", "is_correct": true}},
        {{"text": "...", "is_correct": false}},
        {{"text": "...", "is_correct": false}},
        {{"text": "...", "is_correct": false}}
      ]
    }}
  ]
}}

Contexte:
{context}
"""


def _filter_questions(
    questions: List[dict],
    existing_questions: List[str],
) -> List[dict]:
    kept: List[dict] = []
    existing = existing_questions[:]

    for item in questions:
        text = (item.get("text") or "").strip()
        if not text:
            continue

        is_dup = any(_is_similar(text, old) for old in existing)
        if is_dup:
            continue

        is_dup_local = any(_is_similar(text, k.get("text", "")) for k in kept)
        if is_dup_local:
            continue

        kept.append(item)
        existing.append(text)

    return kept


def _generate_image_description(question_text: str, language: str = "en") -> str:
    """
    Generate a simple image description from question text.
    Extracts key concepts to create a search query for Unsplash.
    
    Args:
        question_text: The question text
        language: Language code ('fr' or 'ar')
        
    Returns:
        A description suitable for Unsplash image search
    """
    if not question_text:
        return "road safety Tunisia"
    
    # Simple keyword extraction from question
    # Remove common words and keep meaningful terms
    stop_words_fr = {'est', 'la', 'le', 'de', 'du', 'un', 'une', 'et', 'ou', 'quel', 'quels', 'quelle', 'quelles', 'qu', 'que', 'qui', 'quel', 'quoi', 'pas', 'avoir', 'être', 'en', 'les', 'des'}
    stop_words_ar = {'ما', 'هو', 'هي', 'في', 'على', 'من', 'إلى', 'هذا', 'ذلك', 'التي', 'الذي'}
    
    text = question_text.lower().strip()[:100]  # Limit to first 100 chars
    
    # Split and filter
    if language == 'ar':
        words = [w for w in text.split() if w not in stop_words_ar and len(w) > 2]
    else:
        words = [w for w in text.split() if w not in stop_words_fr and len(w) > 2]
    
    # Take meaningful words
    keywords = ' '.join(words[:4]) if words else "road safety"
    
    # Add context for more relevant images
    description = f"{keywords} road safety Tunisia traffic"[:80]
    
    return description


def _enrich_with_images(questions: List[dict], language: str = "fr") -> None:
    """
    Enrichit les questions avec des images depuis Unsplash basees sur les descriptions generees.
    Modifie la liste en place.
    
    Args:
        questions: Liste des questions a enrichir
        language: Language code ('fr' or 'ar')
    """
    if not questions:
        return

    _LOGGER.info("🖼️ Enriching %d questions with images from Unsplash...", len(questions))
    
    for i, question in enumerate(questions):
        # Essayer d'abord la description fournie par le LLM
        image_desc = question.get("image_description", "").strip()
        
        # Sinon, la générer à partir du texte de la question
        if not image_desc:
            question_text = question.get("text", "").strip()
            image_desc = _generate_image_description(question_text, language)
            _LOGGER.debug("Q%d: Generated image description: %s", i + 1, image_desc[:50])

        if not image_desc:
            _LOGGER.warning("⚠️ Q%d: Could not generate image description", i)
            continue

        try:
            # Récupérer l'image via Unsplash (utiliser la version fallback pour plus de fiabilité)
            image_url = UnsplashService.search_image_fallback(image_desc)
            
            if image_url:
                question["image_url"] = image_url
                _LOGGER.info("✅ Q%d: Image added for '%s'", i + 1, image_desc[:50])
            else:
                _LOGGER.warning("⚠️ Q%d: No image found for '%s'", i + 1, image_desc[:50])
                
        except Exception as e:
            _LOGGER.error("❌ Q%d: Error fetching image for '%s': %s", i + 1, image_desc[:50], e)
            
        # Supprimer la description temporaire
        if "image_description" in question:
            del question["image_description"]

    _LOGGER.info("✅ Image enrichment complete")


def generate_qcm_from_docs(
    language: str,
    mode: str,
    theme: Optional[str],
    question_count: int,
    difficulty: str,
    existing_questions: List[str],
) -> dict:
    context = _build_context(language)
    if not context:
        raise ValueError("Aucun document disponible pour la generation.")

    llm = _get_llm()
    remaining = question_count
    attempts = 0
    collected: List[dict] = []
    existing = existing_questions[:]
    payload: dict = {"title": "QCM genere", "description": "QCM auto-genere"}
    last_cleaned: List[dict] = []

    while remaining > 0 and attempts < _QCM_MAX_ATTEMPTS:
        batch_size = min(_QCM_BATCH_SIZE, remaining)
        prompt = _build_prompt(context, language, mode, theme, batch_size, difficulty)
        response = _invoke_llm_with_retry(llm, prompt)
        content = response.content or ""
        _LOGGER.info("QCM LLM response length: %s", len(content))

        payload_part, questions = _parse_questions_from_response(content)
        if not questions:
            _LOGGER.error("QCM LLM raw response (truncated): %s", content[:2000])

        if payload_part.get("title"):
            payload["title"] = payload_part.get("title")
        if payload_part.get("description"):
            payload["description"] = payload_part.get("description")

        cleaned = []
        for q in questions:
            answers = q.get("answers") or []
            if len(answers) < 4:
                continue
            if not any(a.get("is_correct") for a in answers):
                continue
            q["answers"] = answers[:4]
            cleaned.append(q)

        last_cleaned = cleaned
        filtered = _filter_questions(cleaned, existing)
        for q in filtered:
            text = (q.get("text") or "").strip()
            if text:
                existing.append(text)

        collected.extend(filtered)
        remaining = question_count - len(collected)
        attempts += 1
        if remaining > 0 and _QCM_INTER_BATCH_DELAY > 0:
            time.sleep(_QCM_INTER_BATCH_DELAY)

    if len(collected) < question_count:
        # Fallback: une passe plus permissive pour completer le quota.
        needed = question_count - len(collected)
        prompt = _build_prompt(context, language, mode, theme, min(10, needed), difficulty)
        fallback_llm = _get_llm(temperature=_QCM_FALLBACK_TEMPERATURE)
        response = _invoke_llm_with_retry(fallback_llm, prompt)
        content = response.content or ""
        payload_part, questions = _parse_questions_from_response(content)
        if payload_part.get("title"):
            payload["title"] = payload_part.get("title")
        if payload_part.get("description"):
            payload["description"] = payload_part.get("description")

        cleaned = []
        for q in questions:
            answers = q.get("answers") or []
            if len(answers) < 4:
                continue
            if not any(a.get("is_correct") for a in answers):
                continue
            q["answers"] = answers[:4]
            cleaned.append(q)

        last_cleaned = cleaned

        existing_texts = {((q.get("text") or "").strip()) for q in collected}
        for q in cleaned:
            text = (q.get("text") or "").strip()
            if not text or text in existing_texts:
                continue
            collected.append(q)
            existing_texts.add(text)
            if len(collected) >= question_count:
                break

    if len(collected) < question_count and last_cleaned:
        existing_texts = {((q.get("text") or "").strip()) for q in collected}
        for q in last_cleaned:
            text = (q.get("text") or "").strip()
            if not text:
                continue
            if text in existing_texts:
                continue
            collected.append(q)
            existing_texts.add(text)
            if len(collected) >= question_count:
                break

    if len(collected) < question_count:
        if not collected:
            raise ValueError("Pas assez de questions uniques apres filtrage.")
        _LOGGER.warning(
            "Questions insuffisantes (%s/%s). Retour partiel.",
            len(collected),
            question_count,
        )

    payload["questions"] = collected[:question_count]
    
    # Enrichir les questions avec des images
    _enrich_with_images(payload["questions"])
    
    return payload
