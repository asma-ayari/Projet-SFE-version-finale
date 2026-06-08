"""
Modèle SQLAlchemy pour les utilisateurs.
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum as SAEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    """Rôles utilisateur de la plateforme."""
    admin = "admin"
    formateur = "formateur"
    apprenant = "apprenant"


class User(Base):
    """Compte utilisateur avec authentification JWT + Google OAuth2."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Nullable pour les comptes Google
    full_name = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)  # Photo de profil Google
    auth_provider = Column(String(20), default="local", nullable=False)  # "local" ou "google"
    google_id = Column(String(100), unique=True, nullable=True, index=True)  # ID Google unique
    role = Column(SAEnum(UserRole), default=UserRole.apprenant, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relations
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    qcm_results = relationship("UserQCMResult", back_populates="user", cascade="all, delete-orphan")
    course_enrollments = relationship("CourseEnrollment", back_populates="user", cascade="all, delete-orphan")
