"""
Schemas Video - validation des requetes/reponses videos.
"""
from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime
from typing import Optional


class VideoBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    category: str = Field(default="general")


class VideoUploadRequest(VideoBase):
    """Requete pour upload de fichier (file envoye comme form-data)"""
    pass


class VideoImportRequest(VideoBase):
    """Requete pour importer depuis URL"""
    url: HttpUrl = Field(...)


class VideoResponse(VideoBase):
    """Reponse video (lecture)"""
    id: int
    file_path: str
    duration: Optional[int] = None
    thumbnail_path: Optional[str] = None
    file_size: Optional[int] = None
    is_published: bool = False
    formateur_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VideoListResponse(BaseModel):
    """Response pour liste des videos"""
    id: int
    title: str
    description: Optional[str]
    category: str
    file_path: str
    thumbnail_path: Optional[str]
    duration: Optional[int]
    file_size: Optional[int]
    is_published: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class VideoDeleteResponse(BaseModel):
    """Response pour suppression"""
    message: str
    id: int


class VideoImportResponse(VideoResponse):
    """Response pour import (inclut already_exists)"""
    already_exists: bool = False

    class Config:
        from_attributes = True


class VideoUpdateRequest(BaseModel):
    """Requete pour mettre a jour une video"""
    title: str = Field(..., min_length=3, max_length=255)
    category: str = Field(default="general")


class VideoPublishResponse(BaseModel):
    """Response pour publication / depublication"""
    is_published: bool
