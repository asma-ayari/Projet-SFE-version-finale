"""
Modèles SQLAlchemy pour le système QCM.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class QCMCategory(Base):
    """Catégorie dynamique de QCM gérée en base de données."""
    __tablename__ = "qcm_categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(120), unique=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)


class QCM(Base):
    """Un QCM (quiz) créé par un admin."""
    __tablename__ = "qcms"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)  # slug de catégorie (référence logique vers qcm_categories.slug)
    difficulty = Column(String(20), default="moyen")  # facile, moyen, difficile
    duration_minutes = Column(Integer, default=20)  # durée en minutes
    pass_score = Column(Integer, default=70)  # score minimum pour réussir (%)
    is_published = Column(Boolean, default=False)
    is_generated = Column(Boolean, default=False)  # QCM genere automatiquement (LLM)
    generation_mode = Column(String(20), nullable=True)  # general | specific
    generation_theme = Column(String(100), nullable=True)  # theme si mode specifique
    generation_language = Column(String(5), nullable=True, default="fr")  # fr | ar
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relations
    questions = relationship("Question", back_populates="qcm", cascade="all, delete-orphan", order_by="Question.order")
    results = relationship("UserQCMResult", back_populates="qcm", cascade="all, delete-orphan")


class Question(Base):
    """Une question dans un QCM."""
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    qcm_id = Column(Integer, ForeignKey("qcms.id", ondelete="CASCADE"), nullable=False, index=True)
    text = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)  # Image optionnelle (panneau, situation)
    explanation = Column(Text, nullable=True)  # Explication de la bonne réponse
    order = Column(Integer, default=0)

    # Relations
    qcm = relationship("QCM", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")


class Answer(Base):
    """Une réponse possible à une question."""
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False)

    # Relations
    question = relationship("Question", back_populates="answers")


class UserQCMResult(Base):
    """Résultat d'un apprenant à un QCM."""
    __tablename__ = "user_qcm_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    qcm_id = Column(Integer, ForeignKey("qcms.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Float, nullable=False)  # Score en %
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    passed = Column(Boolean, nullable=False)
    duration_seconds = Column(Integer, nullable=True)  # Temps passé
    answers_detail = Column(Text, nullable=True)  # JSON: [{question_id, answer_id, is_correct}]
    completed_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relations
    user = relationship("User", back_populates="qcm_results")
    qcm = relationship("QCM", back_populates="results")
