"""
Schémas Pydantic pour l'authentification.
"""
import re
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


# --- Requêtes ---

def _check_password_strength(v: str) -> str:
    """Vérifie la force du mot de passe (A2)."""
    if len(v) < 8:
        raise ValueError("Le mot de passe doit contenir au moins 8 caractères")
    if not re.search(r"[A-Z]", v):
        raise ValueError("Le mot de passe doit contenir au moins une majuscule")
    if not re.search(r"[a-z]", v):
        raise ValueError("Le mot de passe doit contenir au moins une minuscule")
    if not re.search(r"\d", v):
        raise ValueError("Le mot de passe doit contenir au moins un chiffre")
    if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\",./<>?]", v):
        raise ValueError("Le mot de passe doit contenir au moins un caractère spécial (!@#$%...)")
    return v


class RegisterRequest(BaseModel):
    """Inscription d'un nouvel utilisateur par email/mot de passe."""
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=5, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)
    full_name: Optional[str] = Field(None, max_length=100)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return _check_password_strength(v)


class LoginRequest(BaseModel):
    """Connexion par email ou nom d'utilisateur."""
    email: str
    password: str


class GoogleAuthRequest(BaseModel):
    """Authentification via Google OAuth2 (ID token)."""
    credential: str


class ChangePasswordRequest(BaseModel):
    """A6 — Changement de mot de passe."""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        return _check_password_strength(v)


class ForgotPasswordRequest(BaseModel):
    """Demande de réinitialisation de mot de passe."""
    email: str = Field(..., min_length=5, max_length=100)


class ResetPasswordRequest(BaseModel):
    """Réinitialisation du mot de passe avec code."""
    email: str = Field(..., min_length=5, max_length=100)
    code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        return _check_password_strength(v)


class RefreshTokenRequest(BaseModel):
    """A5 — Rafraîchissement du token."""
    refresh_token: str


# --- Réponses ---

class UserResponse(BaseModel):
    """Infos utilisateur (sans mot de passe)."""
    id: int
    username: str
    email: str
    full_name: Optional[str]
    avatar_url: Optional[str] = None
    auth_provider: str = "local"
    role: str = "apprenant"
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Token JWT retourné après login (access + refresh)."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 900  # secondes (15 min)
    user: UserResponse
