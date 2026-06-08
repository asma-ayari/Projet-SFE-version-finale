"""
Schémas Pydantic pour les conversations et messages.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# --- Messages ---

class MessageResponse(BaseModel):
    """Un message dans une conversation."""
    id: int
    role: str  # 'user' ou 'assistant'
    content: str
    language: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# --- Conversations ---

class ConversationCreate(BaseModel):
    """Créer une nouvelle conversation."""
    title: Optional[str] = Field("Nouvelle conversation", max_length=200)


class ConversationSummary(BaseModel):
    """Résumé d'une conversation (pour la liste latérale)."""
    id: int
    title: str
    language: Optional[str]
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    class Config:
        from_attributes = True


class ConversationDetail(BaseModel):
    """Conversation complète avec tous ses messages."""
    id: int
    title: str
    language: Optional[str]
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True


class ConversationRename(BaseModel):
    """Renommer une conversation."""
    title: str = Field(..., min_length=1, max_length=200)
