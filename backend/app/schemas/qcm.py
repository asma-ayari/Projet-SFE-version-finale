"""
Schémas Pydantic pour le système QCM.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# --- Réponses ---

class AnswerCreate(BaseModel):
    text: str = Field(..., min_length=1)
    is_correct: bool = False


class AnswerResponse(BaseModel):
    id: int
    text: str
    is_correct: bool

    class Config:
        from_attributes = True


class AnswerPublic(BaseModel):
    """Réponse sans indiquer si elle est correcte (pour le test)."""
    id: int
    text: str
    is_correct: bool = False

    class Config:
        from_attributes = True


# --- Questions ---

class QuestionCreate(BaseModel):
    text: str = Field(..., min_length=1)
    image_url: Optional[str] = None
    explanation: Optional[str] = None
    order: int = 0
    answers: List[AnswerCreate] = Field(..., min_length=2)


class QuestionResponse(BaseModel):
    id: int
    text: str
    image_url: Optional[str]
    explanation: Optional[str]
    order: int
    answers: List[AnswerResponse]

    class Config:
        from_attributes = True


class QuestionPublic(BaseModel):
    """Question avec explanation pour le résultat final."""
    id: int
    text: str
    image_url: Optional[str]
    explanation: Optional[str] = None
    order: int
    answers: List[AnswerPublic]

    class Config:
        from_attributes = True


# --- QCM ---

class QCMCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: str = Field("moyen", pattern="^(facile|moyen|difficile)$")
    duration_minutes: int = Field(20, ge=1, le=180)
    pass_score: int = Field(70, ge=0, le=100)
    questions: List[QuestionCreate] = Field(..., min_length=1)


class QCMCategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)


class QCMCategoryUpdate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    is_active: Optional[bool] = None


class QCMCategoryResponse(BaseModel):
    id: int
    slug: str
    name: str
    is_active: bool

    class Config:
        from_attributes = True


class QCMUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    duration_minutes: Optional[int] = None
    pass_score: Optional[int] = None
    is_published: Optional[bool] = None


class QCMListResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    category: Optional[str]
    category_name: Optional[str] = None
    difficulty: str
    duration_minutes: int
    pass_score: int
    is_published: bool
    is_generated: bool = False
    generation_mode: Optional[str] = None
    generation_theme: Optional[str] = None
    questions_count: int = 0
    results_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class QCMDetailResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    category: Optional[str]
    category_name: Optional[str] = None
    difficulty: str
    duration_minutes: int
    pass_score: int
    is_published: bool
    questions: List[QuestionResponse]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class QCMPublicResponse(BaseModel):
    """QCM pour les apprenants (sans réponses correctes)."""
    id: int
    title: str
    description: Optional[str]
    category: Optional[str]
    category_name: Optional[str] = None
    difficulty: str
    duration_minutes: int
    pass_score: int
    questions: List[QuestionPublic]

    class Config:
        from_attributes = True


# --- Soumission QCM ---

class SubmitAnswer(BaseModel):
    question_id: int
    answer_id: int


class SubmitQCMRequest(BaseModel):
    answers: List[SubmitAnswer]
    duration_seconds: Optional[int] = None


class QCMResultResponse(BaseModel):
    id: int
    qcm_id: int
    qcm_title: str = ""
    score: float
    total_questions: int
    correct_answers: int
    passed: bool
    duration_seconds: Optional[int]
    completed_at: datetime
    details: Optional[List[dict]] = None

    class Config:
        from_attributes = True


# --- Generation automatique ---

class QCMGenerateRequest(BaseModel):
    mode: str = Field("general", pattern="^(general|specific)$")
    theme: Optional[str] = Field(None, max_length=100)
    themes: Optional[List[str]] = None
    question_count: int = Field(10, ge=5, le=10)
    duration_minutes: int = Field(20, ge=0, le=180)
    language: str = Field("fr", pattern="^(fr|ar)$")
    difficulty: str = Field("moyen", pattern="^(facile|moyen|difficile)$")


class QCMGenerateResponse(BaseModel):
    qcm_id: int
    title: str
    questions_count: int
    duration_minutes: int


class PaginatedQCMResponse(BaseModel):
    qcms: List[QCMListResponse]
    total: int
    page: int
    pages: int
