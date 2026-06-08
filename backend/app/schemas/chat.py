"""
Schémas Pydantic pour l'API du chatbot.
B6 — Validation renforcée des entrées utilisateur.
"""
import re
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime


class ChatRequest(BaseModel):
    """Requête de chat de l'utilisateur."""
    question: str = Field(..., min_length=2, max_length=1000, description="La question de l'utilisateur (max 1000 chars)")
    language: Optional[str] = Field(None, pattern="^(fr|ar)$", description="Langue forcée (fr/ar)")

    @field_validator("question")
    @classmethod
    def sanitize_question(cls, v: str) -> str:
        """B6 — Nettoyer l'entrée utilisateur (anti-injection basique)."""
        # Supprimer les balises HTML/script
        v = re.sub(r"<[^>]*>", "", v)
        # Supprimer les caractères de contrôle (sauf newlines)
        v = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", v)
        # Limiter les espaces multiples
        v = re.sub(r"\s{5,}", "    ", v)
        return v.strip()


class SourceInfo(BaseModel):
    """Information sur une source utilisée."""
    citation_id: Optional[str] = None
    content_preview: str
    source: str
    language: str
    score: Optional[float] = None


class SignInfo(BaseModel):
    """Information sur un panneau de signalisation détecté."""
    id: str
    name: str
    name_fr: str
    name_ar: str
    category: str
    category_label: str
    category_emoji: str
    category_color: str
    image: str


class ChatResponse(BaseModel):
    """Réponse du chatbot."""
    answer: str
    language: str
    sources: List[SourceInfo] = []
    signs: List[SignInfo] = []
    context_found: bool
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class IngestRequest(BaseModel):
    """Requête d'ingestion de documents."""
    clear_existing: bool = Field(False, description="Vider le vector store avant l'ingestion")


class IngestResponse(BaseModel):
    """Réponse de l'ingestion."""
    status: str
    documents_loaded: int
    chunks_created: int
    message: str


class StoreStatsResponse(BaseModel):
    """Statistiques du vector store."""
    total_chunks: int
    collection_name: str
    embedding_model: str


# ---- Feedback ----

class FeedbackRequest(BaseModel):
    """Requête d'évaluation d'une réponse."""
    session_id: str = Field(..., min_length=1, max_length=100, description="Identifiant de session")
    question: str = Field(..., min_length=1, description="La question posée")
    answer: str = Field(..., min_length=1, description="La réponse évaluée")
    language: str = Field("fr", pattern="^(fr|ar)$", description="Langue de la conversation")
    is_positive: bool = Field(..., description="True = 👍, False = 👎")
    comment: Optional[str] = Field(None, max_length=1000, description="Commentaire optionnel")


class FeedbackResponse(BaseModel):
    """Réponse après enregistrement du feedback."""
    status: str
    message: str
    feedback_id: int


class FeedbackStatsResponse(BaseModel):
    """Statistiques des feedbacks."""
    total: int
    positive: int
    negative: int
    positive_ratio: float


class ImageDetectionResponse(BaseModel):
    """Reponse de la detection de panneaux par image."""
    signs: List[SignInfo] = []
    description: str
    raw_analysis: str = ""
    language: str
    success: bool
    error: Optional[str] = None
