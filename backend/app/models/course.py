"""
Modèle SQLAlchemy – Cours.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database import Base


class CourseLevel(str, enum.Enum):
    debutant = "debutant"
    intermediaire = "intermediaire"
    avance = "avance"


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False, default="general")
    level = Column(SAEnum(CourseLevel), default=CourseLevel.debutant, nullable=False)
    duration = Column(String(50), nullable=True)  # ex: "1h 30min"
    image_url = Column(String(500), nullable=True)
    content = Column(Text, nullable=True)  # HTML or Markdown content
    video_url = Column(String(500), nullable=True)
    is_published = Column(Boolean, default=False)
    order = Column(Integer, default=0)

    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relations
    creator = relationship("User", backref="courses")
    enrollments = relationship("CourseEnrollment", back_populates="course", cascade="all, delete-orphan")


class CourseEnrollment(Base):
    """Inscription d'un apprenant a un cours."""
    __tablename__ = "course_enrollments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    enrolled_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relations
    user = relationship("User", back_populates="course_enrollments")
    course = relationship("Course", back_populates="enrollments")
