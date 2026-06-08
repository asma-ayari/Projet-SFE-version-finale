"""
Service RAG (Retrieval-Augmented Generation) - version finale v5.

CORRECTIONS CUMULEES v5 (par rapport a v4) :
1. content_preview elargi a 800 chars (etait 300) -> evite les faux bloquages
   dans _verify_factual_grounding() quand la valeur numerique est apres le char 300.
2. _NO_DATA_HINTS arabe affine : retire "لا توجد معلومات" seul (trop large),
   garde uniquement les formulations qui signifient VRAIMENT "pas d'info disponible".
3. get_system_prompt() supprimee de language_detector -> code mort retire.
4. _is_speed_limit_question() exige un marqueur de limite legale explicite
   EN PLUS du mot "vitesse" -> evite les faux positifs sur "vitesse de reaction", etc.

CORRECTIONS HERITEES de v4 :
5. _repair_missing_citations : rejette les phrases sans citation (ne fabrique pas).
6. Fallback langue : search_similar() retourne [] si rien ne passe le seuil.
7. _looks_like_no_data : detection robuste des reformulations de refus.
8. _is_answer_fully_cited : verifie uniquement les phrases FACTUELLES.
9. _is_factual_sentence : logique stricte sans le >= 8 permissif.
10. _verify_factual_grounding : detecte l hallucination ancree.
11. _is_small_talk_or_greeting : court-circuite le RAG pour les salutations.
"""
import re
import threading
from typing import Optional

from langchain_groq import ChatGroq

from app.core.config import settings
from app.services.language_detector import detect_language
from app.services.sign_detector import detect_signs_in_text
from app.services.vector_store import search_similar


# ---------------------------------------------------------------------------
# Messages de refus et de small talk
# ---------------------------------------------------------------------------

NO_DATA_MSG = {
    "fr": "Aucune information pertinente n'est disponible dans les documents fournis.",
    "ar": "لا توجد معلومات ذات صلة متاحة في الوثائق المقدمة.",
}

SMALL_TALK_MSG = {
    "fr": (
        "Bonjour, je suis votre assistant pour les cours de securite routiere. "
        "Posez-moi une question precise sur le code de la route, "
        "les priorites, les vitesses ou les sanctions."
    ),
    "ar": (
        "مرحبا، أنا مساعدك لدروس السلامة المرورية. "
        "اطرح سؤالك مباشرة حول قانون المرور أو الأولوية أو السرعة أو العقوبات."
    ),
}

# CORRECTION 2 : hints arabes affines pour eviter les faux positifs.
#
# AVANT (v4) :
#   "لا توجد معلومات"  <- trop large, presente dans des reponses VALIDES comme
#   "لا توجد قاعدة تسمح بالتجاوز هنا [S1]" (= "il n'y a pas de regle qui autorise")
#
# APRES (v5) : on exige des formulations qui signifient VRAIMENT "pas d'info disponible"
_NO_DATA_HINTS = {
    "fr": [
        "aucune information pertinente",
        "documents fournis ne mentionnent pas",
        "pas d'information pertinente",
    ],
    "ar": [
        "لا توجد معلومات ذات صلة",        # "pas d'informations pertinentes"     <- OK conserve
        "لا توجد معلومات متاحة",           # "pas d'informations disponibles"     <- nouveau
        "لا تتوفر معلومات",                # "il n'y a pas d'informations"        <- nouveau
        "غير مذكور في الوثائق",            # "non mentionne dans les documents"   <- remplace "غير مذكور" seul
        "الوثائق المقدمة لا تتضمن",        # "les documents fournis ne contiennent pas" <- nouveau
    ],
}

# Singleton LLM thread-safe
_llm_lock = threading.RLock()
_llm_instance: Optional[ChatGroq] = None


# ---------------------------------------------------------------------------
# Patterns
# ---------------------------------------------------------------------------

_HEADING_PATTERNS = [
    re.compile(r"^justification(s)?\s*:?$", re.IGNORECASE),
    re.compile(r"^sources?\s*:?$", re.IGNORECASE),
    re.compile(r"^references?\s*:?$", re.IGNORECASE),
    re.compile(r"^références?\s*:?$", re.IGNORECASE),
    re.compile(r"^المبررات\s*:?$", re.IGNORECASE),
    re.compile(r"^المصادر\s*:?$", re.IGNORECASE),
]

_NON_SUPPORTING_LINE_PATTERNS = [
    re.compile(r"n['']est pas mentionn", re.IGNORECASE),
    re.compile(r"pas mentionn", re.IGNORECASE),
    re.compile(r"non mentionn", re.IGNORECASE),
    re.compile(r"pas d['']information contradictoire", re.IGNORECASE),
    re.compile(r"aucune mention", re.IGNORECASE),
    re.compile(r"ne figure pas", re.IGNORECASE),
    re.compile(r"غير مذكور", re.IGNORECASE),
    re.compile(r"لا توجد معلومات متناقضة", re.IGNORECASE),
]

# Phrases de transition/introduction -> jamais factuelles
_NON_FACTUAL_PATTERNS = [
    re.compile(r"^en\s+(résumé|conclusion|outre|revanche|effet)\b", re.IGNORECASE),
    re.compile(r"^il\s+(convient|faut|est\s+important|est\s+à\s+noter)\b", re.IGNORECASE),
    re.compile(r"^(ainsi|donc|par\s+ailleurs|cependant|toutefois|notamment|rappelons)\b", re.IGNORECASE),
    re.compile(r"^(selon\s+le\s+contexte|d'après\s+les\s+informations|comme\s+mentionné)\b", re.IGNORECASE),
    re.compile(r"^(cette\s+limite|cette\s+règle|cette\s+obligation)\s+(peut|est|s'applique)\b", re.IGNORECASE),
    re.compile(r"^(وبالتالي|وعليه|ومن\s+ثم|كما\s+أن|علاوة\s+على\s+ذلك|وتجدر\s+الإشارة)\b", re.IGNORECASE),
]

# Marqueurs d'affirmation factuelle -> citation obligatoire
_FACTUAL_PATTERNS = [
    re.compile(r"\d+\s*(km/h|km|m|g/l|ans?|points?|%|dinars?|cm³|tonnes?)"),
    re.compile(r"\b(interdit|obligatoire|autorisé|sanctionné|passible|puni|annulé|tolérée?)\b", re.IGNORECASE),
    re.compile(r"\b(priorité|priorite|c[ée]der\s+le\s+passage|right of way)\b", re.IGNORECASE),
    re.compile(r"\b(محظور|إلزامي|مسموح|يُعاقب|ملغى)\b"),
    re.compile(r"\b(الأولوية|إعطاء\s+الأولوية|يجب\s+على\s+السائق)\b"),
    re.compile(r"\b(article|المادة)\s+\d+\b", re.IGNORECASE),
    re.compile(r"\b(amende|retrait|suspension|emprisonnement|infraction|sanction)\b", re.IGNORECASE),
    re.compile(r"\b(permis|categorie|catégorie|classe)\s+[A-Z]\d?\b", re.IGNORECASE),
    re.compile(r"\b(QCM|questions?|examen|épreuve)\b", re.IGNORECASE),
]

# Valeurs numeriques pour verification anti-hallucination
_NUMERIC_VALUE_PATTERN = re.compile(
    r"(\d+(?:[.,]\d+)?)\s*(km/h|km|m|g/l|ans?|points?|%|dinars?|cm³|tonnes?)?"
)

_FR_STOPWORDS = {
    "le", "la", "les", "un", "une", "des", "du", "de", "d", "et", "ou", "a", "au", "aux",
    "en", "dans", "sur", "par", "pour", "avec", "sans", "est", "sont", "que", "qui", "quoi",
    "comment", "quand", "ou", "cela", "ce", "cet", "cette", "ces", "il", "elle", "ils", "elles",
    "je", "tu", "nous", "vous", "mon", "ton", "son", "ma", "ta", "sa", "mes", "tes", "ses",
}

_AR_STOPWORDS = {
    "ما", "ماذا", "من", "هل", "كيف", "متى", "اين", "أين", "في", "على", "عن", "الى", "إلى",
    "من", "مع", "هذا", "هذه", "ذلك", "تلك", "هو", "هي", "هم", "هن", "انا", "أنا", "انت", "أنت",
    "ان", "أن", "او", "أو", "و", "يا", "ثم", "عند", "اذا", "إذا",
}

_FR_DOMAIN_KEYWORDS = {
    "route", "code", "priorite", "priorité", "vitesse", "agglomeration", "agglomération", "permis",
    "feu", "signalisation", "panneau", "panneaux", "intersection", "intersections", "rond", "point", "giratoire", "amende",
    "sanction", "accident", "secours", "ambulance", "telephone", "téléphone", "ceinture", "conducteur",
    "circulation", "depassement", "dépassement", "stationnement", "alcool", "radar", "police", "danger",
}

_AR_DOMAIN_KEYWORDS = {
    "الطريق", "المرور", "الأولوية", "اولوية", "السرعة", "الإشارة", "اشارة", "علامة", "الدوار",
    "التقاطعات", "السائق", "رخصة", "المخالفة", "الغرامة", "العقوبة", "الحادث", "الإسعاف", "الهاتف",
    "الحزام", "الشرطة", "التجاوز", "الوقوف", "الكحول", "قانون", "الجولان",
}


# ---------------------------------------------------------------------------
# Utilitaires citations
# ---------------------------------------------------------------------------

def _extract_citation_ids(text: str) -> list[str]:
    """Extrait tous les identifiants Sx presents dans le texte."""
    return re.findall(r"\bS\d+\b", text)


def _looks_like_no_data(answer: str, language: str) -> bool:
    """
    Detecte une reponse de type 'pas d information' meme si reformulee.
    Verifie l egalite exacte ET les hints partiels.

    CORRECTION v5 : hints arabes affines -> plus de faux positifs sur des
    reponses valides contenant "لا توجد" dans un contexte different.
    Ex valide non bloque : "لا توجد قاعدة تسمح بالتجاوز هنا [S1]"
    """
    normalized = (answer or "").strip().lower()
    if not normalized:
        return True
    exact = NO_DATA_MSG.get(language, NO_DATA_MSG["fr"]).lower()
    if exact in normalized:
        return True
    return any(hint in normalized for hint in _NO_DATA_HINTS.get(language, []))


def _extract_sentences_for_citation_check(answer: str) -> list[str]:
    """Extrait les phrases utiles pour verifier les citations."""
    lines = [line.strip() for line in answer.splitlines() if line.strip()]
    sentences: list[str] = []

    for line in lines:
        normalized = re.sub(r"^[#*_\-\s]+", "", line).strip()
        lowered = normalized.lower()

        if any(pattern.match(lowered) for pattern in _HEADING_PATTERNS):
            continue
        if normalized.endswith(":") and not re.search(r"\[(S\d+)\]", normalized):
            continue

        for part in re.split(r"(?<=[\.\!\?؟])\s+", normalized):
            cleaned = part.strip(" -•\t")
            if cleaned:
                sentences.append(cleaned)

    return sentences


def _is_factual_sentence(sentence: str) -> bool:
    """
    Retourne True si la phrase contient une affirmation factuelle verifiable.
    Une phrase est factuelle UNIQUEMENT si elle contient un marqueur explicite.
    Les phrases ambigues sans marqueur sont ignorees (pas de citation requise).
    """
    clean = sentence.strip()

    # Phrases de transition -> jamais factuelles
    for pattern in _NON_FACTUAL_PATTERNS:
        if pattern.match(clean):
            return False

    # Phrase avec marqueur factuel explicite -> citation requise
    for pattern in _FACTUAL_PATTERNS:
        if pattern.search(clean):
            return True

    return False


def _is_answer_fully_cited(answer: str, valid_citation_ids: set[str]) -> bool:
    """
    Retourne True si chaque phrase FACTUELLE contient au moins une citation valide.
    Les phrases non factuelles sont ignorees.
    """
    sentences = _extract_sentences_for_citation_check(answer)
    if not sentences:
        return False

    factual_count = 0
    for sentence in sentences:
        plain = re.sub(r"\[(S\d+)\]", "", sentence).strip()
        if not plain:
            continue

        if not _is_factual_sentence(plain):
            continue

        factual_count += 1
        cids = [cid for cid in _extract_citation_ids(sentence) if cid in valid_citation_ids]
        if not cids:
            print(f"⚠️  Phrase factuelle sans citation : {plain[:80]}")
            return False

    if factual_count == 0:
        # Evite les faux blocages pour des reponses courtes/reglementaires
        # dont la factualite n'est pas capturee par les patterns.
        any_valid_citation = any(cid in valid_citation_ids for cid in _extract_citation_ids(answer))
        if not any_valid_citation:
            print("⚠️  Aucune phrase factuelle detectee et aucune citation valide.")
        return any_valid_citation

    return True


def _extract_supporting_citation_ids(answer: str, valid_citation_ids: set[str]) -> list[str]:
    """Retourne les citations des lignes qui soutiennent directement la reponse."""
    supporting: list[str] = []

    for raw_line in answer.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        normalized = re.sub(r"^[#*_\-\s]+", "", line).strip().lower()
        if any(pattern.match(normalized) for pattern in _HEADING_PATTERNS):
            continue
        if any(pattern.search(line) for pattern in _NON_SUPPORTING_LINE_PATTERNS):
            continue

        for cid in _extract_citation_ids(line):
            if cid in valid_citation_ids and cid not in supporting:
                supporting.append(cid)

    return supporting


def _safe_search(query: str, k: int, language: Optional[str]) -> list:
    """Recherche vectorielle robuste : ne fait pas tomber tout le pipeline si l'API embedding echoue."""
    try:
        return search_similar(query=query, k=k, language=language)
    except Exception as e:
        print(f"⚠️  Recherche vectorielle indisponible ({language=}): {e}")
        return []


# CORRECTION 4 : _is_speed_limit_question plus strict.
#
# AVANT (v4) :
#   markers = ["vitesse", ...]  <- mot seul, trop large
#   "Quelle est la vitesse de reaction ?" -> activait le filtre vitesse -> NO_DATA
#   "Comment la vitesse affecte-t-elle le freinage ?" -> idem
#
# APRES (v5) :
#   Exige "vitesse" ET au moins un marqueur de limite legale explicite.
#   "vitesse de reaction" -> has_speed=True, has_legal=False -> filtre NON active. OK.
#   "vitesse maximale en agglomeration" -> has_speed=True, has_legal=True -> filtre active. OK.
def _is_speed_limit_question(question: str, language: str) -> bool:
    """
    Detecte si la question porte sur une LIMITE LEGALE de vitesse.
    Exige la presence d'un mot de vitesse ET d'un marqueur de contexte legal.
    """
    q = (question or "").lower()

    if language == "ar":
        speed_words  = ["السرعة", "كم/س", "كم في الساعة", "km/h"]
        legal_markers = [
            "القصوى", "الحد الأقصى", "المسموح", "المحددة",
            "داخل", "خارج", "الطريق السريع",
        ]
        has_speed = any(m in q for m in speed_words)
        has_legal = any(m in q for m in legal_markers)
        return has_speed and has_legal

    # Francais : exige "vitesse" + au moins un marqueur de contexte legal
    speed_words   = ["vitesse", "km/h", "kmh", "rouler", "circuler"]
    legal_markers = [
        "maximale", "maximum", "limite", "limitation",
        "agglomération", "agglomeration",
        "autoroute", "nationale",
        "hors agglomération", "hors agglomeration",
        "autorisée", "autorisee", "permise", "légale", "legale",
    ]
    has_speed = any(m in q for m in speed_words)
    has_legal = any(m in q for m in legal_markers)
    return has_speed and has_legal


def _has_strict_legal_speed_rule_signal(text: str, language: str) -> bool:
    """Verifie qu'un chunk contient une regle legale de vitesse avec unite."""
    t = (text or "").lower()
    if language == "ar":
        legal_markers = ["السرعة القصوى", "الحد الأقصى", "السرعة المسموح بها", "داخل", "خارج"]
        has_unit = any(u in t for u in ["كم/س", "كم في الساعة", "km/h"])
        return any(m in t for m in legal_markers) and has_unit

    legal_markers = [
        "limitations de vitesse", "vitesse maximale", "en agglomération", "en agglomeration",
        "hors agglomération", "hors agglomeration", "maximum",
    ]
    has_unit = bool(re.search(r"\b\d{2,3}\s*(?:km\s*/?\s*h|kmh|km)\b", t))
    return any(m in t for m in legal_markers) and has_unit


def _is_contextually_matching_zone(question: str, chunk_text: str, language: str) -> bool:
    """Verifie que le chunk repond a la zone geographique demandee (urbain / hors agglomeration)."""
    q = (question or "").lower()
    c = (chunk_text or "").lower()

    if language == "ar":
        asks_urban   = any(k in q for k in ["داخل", "في المدينة", "داخل المناطق"])
        asks_outside = any(k in q for k in ["خارج", "خارج المناطق", "خارج العمران"])
        if asks_urban:
            return any(k in c for k in ["داخل", "في المدينة", "داخل المناطق"])
        if asks_outside:
            return any(k in c for k in ["خارج", "خارج المناطق", "خارج العمران"])
        return True

    asks_urban   = any(k in q for k in ["agglomération", "agglomeration", "en ville", "ville"])
    asks_outside = any(k in q for k in ["hors agglomération", "hors agglomeration"])
    if asks_urban:
        return any(k in c for k in ["agglomération", "agglomeration", "en ville", "ville"])
    if asks_outside:
        return any(k in c for k in ["hors agglomération", "hors agglomeration"])
    return True


def _is_chunk_relevant_to_question(question: str, chunk_text: str, language: str) -> bool:
    """Filtre lexical simple pour reduire les chunks hors sujet."""
    q = (question or "").lower().strip()
    c = (chunk_text or "").lower().strip()
    if not q or not c:
        return False

    if len(q.split()) <= 2:
        return True

    if language == "ar":
        keywords = [
            "الأولوية", "السرعة", "الحادث", "الإسعاف", "الإبلاغ", "الهاتف",
            "الإشارات", "الدوار", "التقاطعات", "الغرامة", "المخالف",
        ]
    else:
        keywords = [
            "priorité", "priorite", "vitesse", "agglomération", "agglomeration",
            "accident", "secours", "ambulance", "téléphone", "telephone",
            "signalisation", "feu", "amende", "sanction", "permis",
        ]

    question_hits = [k for k in keywords if k in q]
    if not question_hits:
        return True

    return any(k in c for k in question_hits)


def _tokenize_for_relevance(text: str, language: str) -> set[str]:
    """Tokenisation simple orientee pertinence (stopwords retires)."""
    t = (text or "").lower()
    if language == "ar":
        t = re.sub(r"[^\u0600-\u06FF\w\s]", " ", t)
        raw_tokens = re.findall(r"[\u0600-\u06FF]+", t)
        return {tok for tok in raw_tokens if len(tok) >= 2 and tok not in _AR_STOPWORDS}

    t = re.sub(r"[^a-z0-9àâäçéèêëîïôöùûüÿœæ\s-]", " ", t)
    raw_tokens = re.findall(r"[a-z0-9àâäçéèêëîïôöùûüÿœæ-]+", t)
    return {tok for tok in raw_tokens if len(tok) >= 3 and tok not in _FR_STOPWORDS}


def _is_domain_question(question: str, language: str) -> bool:
    """Detecte si la question semble appartenir au domaine securite routiere."""
    q_tokens = _tokenize_for_relevance(question, language)
    q_text = (question or "").lower()
    if not q_tokens and not q_text.strip():
        return False

    domain = _AR_DOMAIN_KEYWORDS if language == "ar" else _FR_DOMAIN_KEYWORDS
    if any(tok in domain for tok in q_tokens):
        return True

    # Fallback souple: accepte si un mot domaine apparait en sous-chaine.
    return any(k in q_text for k in domain)


def _question_chunk_overlap_score(question: str, chunk_text: str, language: str) -> float:
    """Score [0..1] d'overlap lexical question/chunk."""
    q_tokens = _tokenize_for_relevance(question, language)
    if not q_tokens:
        return 0.0
    c_tokens = _tokenize_for_relevance(chunk_text, language)
    if not c_tokens:
        return 0.0
    inter = q_tokens.intersection(c_tokens)
    return len(inter) / max(len(q_tokens), 1)


def _extract_evidence_snippets(question: str, chunk_text: str, language: str, max_sentences: int = 2) -> list[str]:
    """Extrait les phrases les plus probantes du chunk par rapport a la question."""
    q_tokens = _tokenize_for_relevance(question, language)
    if not q_tokens:
        return []

    candidates = [s.strip() for s in re.split(r"(?<=[\.\!\?؟])\s+|\n+", chunk_text or "") if s.strip()]
    scored: list[tuple[float, str]] = []

    for sent in candidates:
        s_tokens = _tokenize_for_relevance(sent, language)
        if not s_tokens:
            continue
        overlap = len(q_tokens.intersection(s_tokens))
        if overlap == 0:
            continue
        score = overlap / max(len(q_tokens), 1)
        if overlap >= 2:
            score += 0.15
        if _has_strict_legal_speed_rule_signal(sent, language):
            score += 0.15
        scored.append((score, sent))

    if not scored:
        return []

    scored.sort(key=lambda x: x[0], reverse=True)
    selected = [sent for score, sent in scored if score >= 0.12][:max_sentences]
    return selected


def _is_sign_intent(question: str) -> bool:
    """Detecte si la question porte sur des panneaux / signalisation."""
    q = (question or "").lower()
    sign_keywords = [
        "panneau", "panneaux", "signalisation", "signal", "sens interdit",
        "علامة", "علامات", "إشارة", "اشارة", "تشوير",
    ]
    return any(k in q for k in sign_keywords)


def _is_small_talk_or_greeting(question: str, language: str) -> bool:
    """
    Detecte les salutations et messages sociaux courts qui ne necessitent pas de RAG.
    Court-circuite le pipeline pour eviter les justifications hors-sujet (cf. bug 'bonjour').
    """
    q = (question or "").strip().lower()
    if not q:
        return False

    q_clean = re.sub(r"[^\w\s\u0600-\u06FF]", " ", q)
    q_compact = re.sub(r"\s+", " ", q_clean).strip()

    fr_markers = {
        "bonjour", "salut", "salam", "bonsoir", "coucou",
        "merci", "merci beaucoup", "ca va", "comment ca va",
        "bonne journée", "bonne journee", "bienvenue",
    }
    ar_markers = {
        "مرحبا", "السلام عليكم", "اهلا", "أهلا", "صباح الخير",
        "مساء الخير", "شكرا", "كيف حالك", "مرحبا بك",
    }
    en_markers = {
        "hello", "hi", "hey", "good morning", "good evening",
        "thanks", "thank you",
    }

    if language == "ar":
        markers = ar_markers
    else:
        markers = fr_markers | en_markers

    return q_compact in markers


# ---------------------------------------------------------------------------
# Verification anti-hallucination ancree
# ---------------------------------------------------------------------------

def _verify_factual_grounding(answer: str, sources: list[dict]) -> bool:
    """
    Verifie que les valeurs numeriques cles de la reponse sont litteralement
    presentes dans le chunk de la source citee.

    Detecte l hallucination ancree : le LLM cite [Sx] pour une valeur
    qui n'existe pas dans le texte de Sx.

    CORRECTION v5 : content_preview est maintenant 800 chars (etait 300).
    Les valeurs numeriques situees apres le char 300 ne sont plus faussement
    detectees comme des hallucinations.

    Returns:
        True  -> reponse ancree (valeurs trouvees dans les sources citees).
        False -> hallucination ancree detectee.
    """
    source_map = {s["citation_id"]: s.get("content_preview", "") for s in sources}

    sentences = _extract_sentences_for_citation_check(answer)

    for sentence in sentences:
        plain = re.sub(r"\[(S\d+)\]", "", sentence).strip()
        if not _is_factual_sentence(plain):
            continue

        # Extraire les valeurs numeriques de la phrase
        numeric_values = _NUMERIC_VALUE_PATTERN.findall(sentence)
        if not numeric_values:
            continue

        # Identifier les citations de cette phrase
        cited_ids = [cid for cid in _extract_citation_ids(sentence) if cid in source_map]
        if not cited_ids:
            continue

        for value, unit in numeric_values:
            value_str = value.replace(",", ".").replace(" ", "")
            # Ignorer les petits nombres ambigus (numeros d'article, etc.)
            try:
                if float(value_str) < 5 and not unit:
                    continue
            except ValueError:
                continue

            found_in_any_source = False
            for cid in cited_ids:
                chunk_text = source_map[cid].replace(",", ".").replace(" ", "")
                if value_str in chunk_text:
                    found_in_any_source = True
                    break

            if not found_in_any_source:
                print(
                    f"🚨 Hallucination ancree : valeur '{value_str} {unit}' "
                    f"absente des chunks {cited_ids} -> reponse rejetee."
                )
                return False

    return True


# ---------------------------------------------------------------------------
# Repair coherent avec la logique factuelle
# ---------------------------------------------------------------------------

def _repair_missing_citations(answer: str, valid_citation_ids: set[str]) -> Optional[str]:
    """
    Supprime les phrases FACTUELLES sans citation valide.
    Les phrases non factuelles sont conservees sans exiger de citation.

    Returns:
        Reponse nettoyee si au moins une phrase citee subsiste, sinon None.
    """
    repaired_lines: list[str] = []

    for raw_line in answer.splitlines():
        line = raw_line.rstrip()
        if not line.strip():
            repaired_lines.append(line)
            continue

        normalized = re.sub(r"^[#*_\-\s]+", "", line).strip().lower()
        if any(pattern.match(normalized) for pattern in _HEADING_PATTERNS):
            repaired_lines.append(line)
            continue

        parts = re.split(r"(?<=[\.\!\?؟])\s+", line)
        kept_parts: list[str] = []

        for part in parts:
            text = part.strip()
            if not text:
                continue

            plain = re.sub(r"\[(S\d+)\]", "", text).strip()

            # Phrase non factuelle -> conserver sans exiger de citation
            if not _is_factual_sentence(plain):
                kept_parts.append(text)
                continue

            # Phrase factuelle -> exiger une citation valide
            sentence_cids = [cid for cid in _extract_citation_ids(text) if cid in valid_citation_ids]
            if sentence_cids:
                kept_parts.append(text)
            else:
                print(f"⚠️  Phrase factuelle rejetee (pas de citation) : {text[:80]}...")

        if kept_parts:
            repaired_lines.append(" ".join(kept_parts))

    repaired_answer = "\n".join(repaired_lines).strip()

    if not repaired_answer or not _extract_citation_ids(repaired_answer):
        return None

    return repaired_answer


# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------

def _build_strict_prompt(language: str, question: str, context: str) -> str:
    """Construit un prompt strictement document-only avec citations obligatoires."""
    if language == "ar":
        return f"""أنت مساعد متخصص في السلامة المرورية في تونس.

تعليمات إلزامية:
- استخدم فقط المعلومات الموجودة في السياق المرفق.
- لا تستخدم المعرفة العامة أو أي معلومات خارج السياق.
- كل معلومة واقعية في الإجابة يجب أن تتضمن استشهادًا بصيغة [Sx] (مثال: [S1]).
- استشهد فقط بالمصادر التي تدعم الإجابة مباشرة.
- لا تذكر مصدرًا فقط للقول إنه لا يحتوي على المعلومة.
- إذا كان السياق غير كافٍ للإجابة، أعد النص التالي حرفيًا فقط:
{NO_DATA_MSG['ar']}
- عند استخدام أكثر من مصدر، ادمج المعلومات بشكل متماسك مع الاستشهاد بكل مصدر.
- أنهِ الإجابة بقسم "المبررات:" يتضمن أسطرًا قصيرة تشير إلى الاستشهادات.

السياق:
{context}

السؤال:
{question}

الإجابة:"""

    return f"""Tu es un assistant specialise en securite routiere en Tunisie.

Consignes obligatoires :
- Utilise uniquement les informations presentes dans le contexte ci-dessous.
- N'utilise aucune connaissance externe ou generale.
- Chaque affirmation factuelle doit contenir une citation au format [Sx] (ex: [S1]).
- Cite uniquement les sources qui soutiennent directement la reponse.
- Ne cite pas une source uniquement pour dire qu'elle ne contient pas l'information.
- Si le contexte ne permet pas de repondre, renvoie exactement ce texte et rien d'autre :
{NO_DATA_MSG['fr']}
- Si plusieurs sources sont utiles, combine les informations et cite chaque source.
- Termine par une section "Justifications:" avec de courtes lignes referencees par [Sx].

Contexte:
{context}

Question:
{question}

Reponse:"""


def _build_extraction_fallback_prompt(language: str, question: str, context: str) -> str:
    """Prompt de secours pour forcer une reponse courte depuis le contexte."""
    if language == "ar":
        return f"""أجب اعتمادًا على السياق فقط.

المطلوب:
- أعطِ إجابة قصيرة ودقيقة مباشرة على السؤال.
- يجب أن تتضمن الجملة استشهادًا صحيحًا [Sx].
- ثم أضف سطر "المبررات:" مع استشهاد واحد على الأقل.
- لا تُرجع رسالة عدم توفر المعلومات إذا كان السياق يحتوي إجابة.

السياق:
{context}

السؤال:
{question}

الإجابة:"""

    return f"""Reponds uniquement a partir du contexte.

Exigences:
- Donne une reponse courte et precise a la question.
- La phrase de reponse doit contenir une citation valide [Sx].
- Ajoute ensuite une ligne "Justifications:" avec au moins une citation.
- N'utilise pas le message d'absence d'information si une reponse existe dans le contexte.

Contexte:
{context}

Question:
{question}

Reponse:"""


def _build_compact_retry_prompt(
    language: str,
    question: str,
    previous_answer: str,
    citation_ids: list[str],
) -> str:
    """Prompt de retry compact pour forcer l'ajout de citations manquantes."""
    ids = ", ".join(citation_ids)

    if language == "ar":
        retry_rules = (
            "\n\nتعليمات إعادة صياغة إلزامية:\n"
            "- أعد صياغة الإجابة السابقة فقط باستخدام نفس المعنى المعتمد على السياق.\n"
            "- يجب أن تحتوي كل جملة واقعية على استشهاد صالح بصيغة [Sx].\n"
            f"- الاستشهادات المسموح بها فقط: {ids}.\n"
            "- لا تضف أي معلومة جديدة خارج السياق.\n"
            "- أنهِ بقسم المبررات: مع استشهاد واحد على الأقل."
        )
        return f"""السؤال:
{question}

الإجابة السابقة:
{previous_answer}
{retry_rules}

أعد فقط النسخة المصححة."""

    retry_rules = (
        "\n\nConsignes de reformulation obligatoires :\n"
        "- Reformule uniquement la reponse precedente en conservant son sens base sur le contexte.\n"
        "- Chaque phrase factuelle doit contenir une citation valide au format [Sx].\n"
        f"- Citations autorisees uniquement : {ids}.\n"
        "- N'ajoute aucune information hors contexte.\n"
        "- Format attendu : phrase factuelle + citation, puis section Justifications:"
    )
    return f"""Question:
{question}

Reponse precedente:
{previous_answer}
{retry_rules}

Retourne uniquement la version corrigee."""


# ---------------------------------------------------------------------------
# LLM
# ---------------------------------------------------------------------------

def get_llm() -> ChatGroq:
    """Retourne le modele LLM Groq (singleton thread-safe)."""
    global _llm_instance
    if _llm_instance is None:
        with _llm_lock:
            if _llm_instance is None:
                _llm_instance = ChatGroq(
                    model=settings.GROQ_MODEL,
                    groq_api_key=settings.GROQ_API_KEY,
                    max_tokens=settings.MAX_TOKENS,
                    temperature=0.0,
                )
    return _llm_instance


# ---------------------------------------------------------------------------
# Pipeline principal
# ---------------------------------------------------------------------------

def ask_question(question: str, language: Optional[str] = None) -> dict:
    """
    Pipeline RAG complet v5 :

    0.  Detecte les salutations -> reponse directe sans RAG.
    1.  Detecte la langue.
    2.  Recherche Pinecone avec filtre langue.
        Si vide -> relance sans filtre.
        Si toujours vide -> NO_DATA_MSG.
    3.  Construit le contexte [S1][S2]...
        content_preview = 800 chars (v5, etait 300 en v4).
    4.  Genere la reponse via LLM.
    5a. Si LLM dit 'pas d info' (meme reformule) -> fallback extraction.
    5b. Si aucune citation utilisee -> fallback extraction.
    5c. Si citations incompletes -> retry prompt.
    5d. Si encore rate -> repair (supprime factuelles non citees).
    5e. Si repair echoue -> NO_DATA_MSG.
    6.  Verifie l ancrage factuel (anti-hallucination ancree).
        Si valeur numerique absente du chunk cite -> NO_DATA_MSG.
    7.  Retourne reponse + sources filtrees + panneaux detectes.
    """

    # 1. Detection de la langue
    detected_lang = language or detect_language(question)
    print(f"🌍 Langue detectee : {detected_lang}")

    # 0. Court-circuit salutations/small talk -> pas de RAG, pas de justification hors-sujet
    if _is_small_talk_or_greeting(question, detected_lang):
        print("💬 Small talk detecte -> reponse directe sans RAG.")
        return {
            "answer": SMALL_TALK_MSG.get(detected_lang, SMALL_TALK_MSG["fr"]),
            "language": detected_lang,
            "sources": [],
            "signs": [],
            "context_found": True,
        }

    is_sign_q = _is_sign_intent(question)
    is_speed_q = _is_speed_limit_question(question, detected_lang)

    # Garde-fou domaine (assoupli): on ne bloque que si hors domaine ET sans intention panneau/vitesse.
    if not _is_domain_question(question, detected_lang) and not is_sign_q and not is_speed_q:
        return {
            "answer": NO_DATA_MSG.get(detected_lang, NO_DATA_MSG["fr"]),
            "language": detected_lang,
            "sources": [],
            "signs": [],
            "context_found": False,
        }

    # 2. Recherche vectorielle
    # CORRECTION 4 : is_speed_q n'est True que si la question contient
    # un marqueur legal explicite EN PLUS du mot vitesse.
    search_k = max(settings.TOP_K_RESULTS * 4, 16) if is_speed_q else settings.TOP_K_RESULTS

    relevant_docs = _safe_search(
        query=question,
        k=search_k,
        language=detected_lang,
    )

    if not relevant_docs:
        print(f"⚠️  Aucun doc pertinent en '{detected_lang}', relance sans filtre langue.")
        relevant_docs = _safe_search(
            query=question,
            k=search_k,
            language=None,
        )

    # Garde-fou vitesse : exiger un chunk avec regle explicite (pas distances de freinage).
    if relevant_docs and is_speed_q:
        strict_docs = [
            d for d in relevant_docs
            if _has_strict_legal_speed_rule_signal(d.page_content, detected_lang)
            and _is_contextually_matching_zone(question, d.page_content, detected_lang)
        ]

        if not strict_docs:
            expanded_k = max(40, settings.TOP_K_RESULTS * 10)
            print(f"⚠️  Pas de regle explicite en top-{search_k}, relance elargie top-{expanded_k}.")
            expanded_docs = (
                _safe_search(question, expanded_k, detected_lang)
                or _safe_search(question, expanded_k, None)
            )
            strict_docs = [
                d for d in expanded_docs
                if _has_strict_legal_speed_rule_signal(d.page_content, detected_lang)
                and _is_contextually_matching_zone(question, d.page_content, detected_lang)
            ]

        if strict_docs:
            relevant_docs = strict_docs[:settings.TOP_K_RESULTS]
        else:
            return {
                "answer": NO_DATA_MSG.get(detected_lang, NO_DATA_MSG["fr"]),
                "language": detected_lang,
                "sources": [],
                "signs": [],
                "context_found": False,
            }

    # Filtre de pertinence (hors questions vitesse deja traitees avec un filtre strict).
    if relevant_docs and not is_speed_q:
        filtered_docs = [
            d for d in relevant_docs
            if _is_chunk_relevant_to_question(question, d.page_content, detected_lang)
        ]
        if filtered_docs:
            relevant_docs = filtered_docs

    # Seuil global de pertinence question<->chunk pour eviter les derives semantiques.
    # On preserve les questions vitesse deja filtrees strictement.
    if not is_speed_q:
        ranked_docs = []
        for d in relevant_docs:
            lexical = _question_chunk_overlap_score(question, d.page_content, detected_lang)
            vector = float(d.metadata.get("score") or 0.0)
            combined = (0.6 * lexical) + (0.4 * vector)
            ranked_docs.append((combined, d))

        ranked_docs.sort(key=lambda x: x[0], reverse=True)
        relevant_docs = [d for score, d in ranked_docs if score >= 0.16] or [d for _, d in ranked_docs[: settings.TOP_K_RESULTS]]

    if not relevant_docs:
        return {
            "answer": NO_DATA_MSG.get(detected_lang, NO_DATA_MSG["fr"]),
            "language": detected_lang,
            "sources": [],
            "signs": [],
            "context_found": False,
        }

    # 3. Construire le contexte
    # CORRECTION 1 : content_preview elargi a 800 chars (etait 300).
    # Raison : _verify_factual_grounding cherche les valeurs numeriques dans
    # content_preview. Si la valeur est apres le char 300, elle etait faussement
    # detectee comme hallucination et la reponse etait bloquee a tort.
    context_parts = []
    sources = []
    seen_citation_ids = set()
    evidence_found = False
    for idx, doc in enumerate(relevant_docs, start=1):
        citation_id = f"S{idx}"
        source_name  = doc.metadata.get("source", "inconnu")
        source_lang  = doc.metadata.get("language", "inconnu")
        source_score = doc.metadata.get("score")

        evidence = _extract_evidence_snippets(question, doc.page_content, detected_lang, max_sentences=2)
        evidence_text = " ".join(evidence).strip()
        if evidence_text:
            evidence_found = True
        snippet_for_context = evidence_text if evidence_text else doc.page_content[:350]

        context_parts.append(
            f"[{citation_id}] Source: {source_name} | Langue: {source_lang}\n{snippet_for_context}"
        )
        source_info = {
            "citation_id":    citation_id,
            "content_preview": doc.page_content[:800],   # <-- CORRECTION 1
            "source":         source_name,
            "language":       source_lang,
            "score":          source_score,
        }
        if citation_id not in seen_citation_ids:
            sources.append(source_info)
            seen_citation_ids.add(citation_id)

    # Si aucune phrase evidence n'est trouvee, on continue quand meme avec extraits:
    # cela evite les faux blocages sur des formulations inattendues.

    context = "\n\n---\n\n".join(context_parts)

    # 4. Appel LLM principal
    full_prompt = _build_strict_prompt(detected_lang, question, context)

    try:
        llm = get_llm()
        response = llm.invoke(full_prompt)
        answer = response.content.strip()

    except Exception as e:
        error_msg = {
            "fr": f"Erreur lors de la generation de la reponse : {str(e)}",
            "ar": f"خطأ أثناء إنشاء الإجابة: {str(e)}",
        }
        return {
            "answer": error_msg.get(detected_lang, error_msg["fr"]),
            "language": detected_lang,
            "sources": sources,
            "signs": [],
            "context_found": True,
            "error": str(e),
        }

    valid_citation_ids = {s["citation_id"] for s in sources}

    # 5a. Anti faux-negatif : LLM dit "pas d'info" alors qu'on a un contexte
    if _looks_like_no_data(answer, detected_lang):
        print("⚠️  LLM a repondu 'pas d info', tentative fallback extraction.")
        try:
            fallback_prompt = _build_extraction_fallback_prompt(detected_lang, question, context)
            fallback_response = llm.invoke(fallback_prompt)
            fallback_answer = fallback_response.content.strip()
            if fallback_answer and not _looks_like_no_data(fallback_answer, detected_lang):
                answer = fallback_answer
        except Exception:
            pass

    # Calcul initial des indicateurs de citation
    used_citation_ids = [cid for cid in _extract_citation_ids(answer) if cid in valid_citation_ids]
    is_fully_cited = _is_answer_fully_cited(answer, valid_citation_ids)

    # 5b. Aucune citation utilisee -> fallback extraction avant retry
    if valid_citation_ids and not used_citation_ids:
        print("⚠️  Aucune citation utilisee, tentative fallback extraction.")
        try:
            fallback_prompt = _build_extraction_fallback_prompt(detected_lang, question, context)
            fallback_response = llm.invoke(fallback_prompt)
            fallback_answer = fallback_response.content.strip()
            if fallback_answer:
                answer = fallback_answer
                used_citation_ids = [cid for cid in _extract_citation_ids(answer) if cid in valid_citation_ids]
                is_fully_cited = _is_answer_fully_cited(answer, valid_citation_ids)
        except Exception:
            pass

    # 5c. Citations incompletes -> retry prompt
    if valid_citation_ids and (not used_citation_ids or not is_fully_cited):
        print("⚠️  Citations incompletes, tentative retry prompt.")
        try:
            retry_prompt = _build_compact_retry_prompt(
                detected_lang,
                question,
                answer,
                sorted(valid_citation_ids),
            )
            retry_response = llm.invoke(retry_prompt)
            retry_answer = retry_response.content.strip()

            retry_used  = [cid for cid in _extract_citation_ids(retry_answer) if cid in valid_citation_ids]
            retry_cited = _is_answer_fully_cited(retry_answer, valid_citation_ids)

            if retry_used and retry_cited:
                answer = retry_answer
                used_citation_ids = retry_used
                is_fully_cited = True
        except Exception:
            pass

    # 5d. Repair : supprime les phrases factuelles non citees
    if valid_citation_ids and (not used_citation_ids or not is_fully_cited):
        print("⚠️  Tentative repair des citations manquantes.")
        repaired = _repair_missing_citations(answer, valid_citation_ids)

        if repaired is not None:
            repaired_used  = [cid for cid in _extract_citation_ids(repaired) if cid in valid_citation_ids]
            repaired_cited = _is_answer_fully_cited(repaired, valid_citation_ids)

            if repaired_used and repaired_cited:
                answer = repaired
                used_citation_ids = repaired_used
                is_fully_cited = True
            else:
                return {
                    "answer": NO_DATA_MSG.get(detected_lang, NO_DATA_MSG["fr"]),
                    "language": detected_lang,
                    "sources": [],
                    "signs": [],
                    "context_found": False,
                }
        else:
            return {
                "answer": NO_DATA_MSG.get(detected_lang, NO_DATA_MSG["fr"]),
                "language": detected_lang,
                "sources": [],
                "signs": [],
                "context_found": False,
            }

    # 5e. Echec total
    if not used_citation_ids or not is_fully_cited:
        return {
            "answer": NO_DATA_MSG.get(detected_lang, NO_DATA_MSG["fr"]),
            "language": detected_lang,
            "sources": [],
            "signs": [],
            "context_found": False,
        }

    # 6. Verification anti-hallucination ancree
    if not _verify_factual_grounding(answer, sources):
        print("🚨 Hallucination ancree detectee -> reponse bloquee.")
        return {
            "answer": NO_DATA_MSG.get(detected_lang, NO_DATA_MSG["fr"]),
            "language": detected_lang,
            "sources": [],
            "signs": [],
            "context_found": False,
        }

    # 7. Filtrer les sources effectivement utilisees
    supporting = _extract_supporting_citation_ids(answer, valid_citation_ids)
    selected = set(supporting or used_citation_ids)
    filtered_sources = [s for s in sources if s["citation_id"] in selected]

    # Validation finale supplementaire pour les questions de vitesse
    if is_speed_q:
        citation_to_text = {s["citation_id"]: cp for s, cp in zip(sources, context_parts)}
        filtered_sources = [
            src for src in filtered_sources
            if _has_strict_legal_speed_rule_signal(
                citation_to_text.get(src.get("citation_id"), ""), detected_lang
            )
            and _is_contextually_matching_zone(
                question, citation_to_text.get(src.get("citation_id"), ""), detected_lang
            )
        ]
        if not filtered_sources:
            return {
                "answer": NO_DATA_MSG.get(detected_lang, NO_DATA_MSG["fr"]),
                "language": detected_lang,
                "sources": [],
                "signs": [],
                "context_found": False,
            }

        allowed_ids = {src.get("citation_id") for src in filtered_sources if src.get("citation_id")}
        cleaned = _repair_missing_citations(answer, allowed_ids)
        if cleaned:
            answer = cleaned

    # Detecter les panneaux mentionnes uniquement si la question le demande
    detected_signs = (
        detect_signs_in_text(question + " " + answer, detected_lang)
        if _is_sign_intent(question)
        else []
    )

    return {
        "answer": answer,
        "language": detected_lang,
        "sources": filtered_sources,
        "signs": detected_signs,
        "context_found": True,
    }