"""
Modèle SQLAlchemy pour le feedback utilisateur.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.sql import func
from app.database import Base


class Feedback(Base):
    """Stocke les évaluations 👍/👎 des réponses du chatbot."""
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(100), index=True, nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    language = Column(String(5), nullable=False)
    is_positive = Column(Boolean, nullable=False)  # True = 👍, False = 👎
    comment = Column(Text, nullable=True)  # Commentaire optionnel
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
