"""
Schémas Pydantic – Cours.
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "general"
    level: str = "debutant"
    duration: Optional[str] = None
    image_url: Optional[str] = None
    content: Optional[str] = None
    video_url: Optional[str] = None
    order: int = 0


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    duration: Optional[str] = None
    image_url: Optional[str] = None
    content: Optional[str] = None
    video_url: Optional[str] = None
    order: Optional[int] = None
    is_published: Optional[bool] = None


class CourseListResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: str
    level: str
    duration: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    is_published: bool
    order: int
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CourseDetailResponse(CourseListResponse):
    content: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaginatedCoursesResponse(BaseModel):
    courses: List[CourseListResponse]
    total: int
    page: int
    pages: int
