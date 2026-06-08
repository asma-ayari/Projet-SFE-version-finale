"""
Modele Video - stockage des videos telechargees par les formateurs.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class VideoCategory(str, enum.Enum):
    general = "general"
    conduite = "conduite"
    securite = "securite"
    secours = "secours"
    signalisation = "signalisation"


class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(Enum(VideoCategory), default=VideoCategory.general, index=True)

    # Stockage du fichier
    file_path = Column(String(500), unique=True, nullable=False)  # Chemin local ou URL
    duration = Column(Integer, nullable=True)
    thumbnail_path = Column(String(500), nullable=True)

    # Metadonnees
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String(100), nullable=True)
    is_published = Column(Integer, default=0, nullable=False, index=True)

    # Relations
    formateur_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    formateur = relationship("User", backref="videos")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Video(id={self.id}, title={self.title}, formateur_id={self.formateur_id})>"
