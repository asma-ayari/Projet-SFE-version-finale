"""
Modèles SQLAlchemy pour les conversations et messages.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Conversation(Base):
    """Une conversation appartient à un utilisateur."""
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False, default="Nouvelle conversation")
    language = Column(String(5), nullable=True)  # 'fr' ou 'ar', détecté automatiquement
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relations
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")


class Message(Base):
    """Un message dans une conversation (question utilisateur ou réponse bot)."""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(10), nullable=False)  # 'user' ou 'assistant'
    content = Column(Text, nullable=False)
    language = Column(String(5), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relations
    conversation = relationship("Conversation", back_populates="messages")
