"""
API Videos - Upload, import et gestion des videos par les formateurs.
"""
import os
from pathlib import Path
from datetime import datetime
from typing import List

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.video import Video, VideoCategory
from app.services.auth_service import get_current_user
from app.schemas.video import (
    VideoUploadRequest,
    VideoImportRequest,
    VideoResponse,
    VideoImportResponse,
    VideoUpdateRequest,
    VideoListResponse,
    VideoDeleteResponse,
    VideoPublishResponse,
)

router = APIRouter(prefix="/api/videos", tags=["Videos"])

# Configuration des uploads
UPLOADS_DIR = Path(__file__).parent.parent.parent / "uploads" / "videos"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Extensions autorisees
ALLOWED_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB


def require_formateur_or_admin(current_user: User = Depends(get_current_user)) -> User:
    """Verifier que l'utilisateur est formateur ou admin"""
    if current_user.role not in (UserRole.admin, UserRole.formateur):
        raise HTTPException(403, "Acces reserve aux formateurs et administrateurs")
    return current_user


def validate_video_file(file: UploadFile) -> None:
    """Valider le type et la taille du fichier"""
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            400,
            f"Format non autorise. Extensions acceptees: {', '.join(ALLOWED_EXTENSIONS)}",
        )


# ===================== UPLOAD FICHIER =====================

@router.post("/upload", response_model=VideoResponse)
async def upload_video(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(default=""),
    category: str = Form(default="general"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_formateur_or_admin),
):
    """
    Telecharger une video depuis l'ordinateur.
    - Validations cote serveur
    - Stockage du fichier
    - Creation de l'entree video
    """
    try:
        if not file.filename:
            raise HTTPException(400, "Nom de fichier manquant")

        validate_video_file(file)

        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                413,
                f"Fichier trop volumineux. Max: {MAX_FILE_SIZE // 1024 // 1024}MB",
            )

        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        file_ext = Path(file.filename).suffix.lower()
        unique_filename = f"{timestamp}_{current_user.id}{file_ext}"
        file_path = UPLOADS_DIR / unique_filename

        with open(file_path, "wb") as f:
            f.write(contents)

        video = Video(
            title=title,
            description=description,
            category=category,
            file_path=str(file_path),
            file_size=len(contents),
            mime_type=file.content_type or "video/mp4",
            formateur_id=current_user.id,
            is_published=False,
        )
        db.add(video)
        db.commit()
        db.refresh(video)

        return VideoResponse.model_validate(video)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Erreur lors du telechargement: {str(e)}")
    finally:
        await file.close()


# ===================== IMPORT DEPUIS URL =====================

@router.post("/import", response_model=VideoImportResponse)
async def import_video(
    request: VideoImportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_formateur_or_admin),
):
    """
    Importer une video depuis une URL (YouTube, Vimeo, etc).
    Retour:
    - Si deja importee par cet utilisateur: already_exists=true
    - Sinon: already_exists=false
    """
    try:
        if not request.url:
            raise HTTPException(400, "URL manquante")

        url_str = str(request.url)

        existing_video = db.query(Video).filter(
            Video.file_path == url_str,
            Video.formateur_id == current_user.id,
        ).first()

        if existing_video:
            video_data = VideoResponse.model_validate(existing_video).model_dump()
            video_data["already_exists"] = True
            return VideoImportResponse(**video_data)

        video = Video(
            title=request.title,
            description=request.description or "",
            category=request.category,
            file_path=url_str,
            formateur_id=current_user.id,
            is_published=False,
        )
        db.add(video)
        db.commit()
        db.refresh(video)

        video_data = VideoResponse.model_validate(video).model_dump()
        video_data["already_exists"] = False
        return VideoImportResponse(**video_data)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Erreur lors de l'importation: {str(e)}")


# ===================== LECTURE =====================

@router.get("", response_model=List[VideoListResponse])
def list_videos(
    category: str = Query(None),
    formateur_id: int = Query(None),
    published_only: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Lister les videos avec filtrage optionnel"""
    query = db.query(Video)

    if category:
        query = query.filter(Video.category == category)
    if formateur_id:
        query = query.filter(Video.formateur_id == formateur_id)
    if published_only:
        query = query.filter(Video.is_published == True)

    videos = query.order_by(Video.created_at.desc()).offset(skip).limit(limit).all()
    return [VideoListResponse.model_validate(v) for v in videos]


@router.put("/{video_id}/publish", response_model=VideoPublishResponse)
def toggle_publish(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_formateur_or_admin),
):
    """Publier ou depublier une video."""
    video = db.query(Video).filter(Video.id == video_id).first()

    if not video:
        raise HTTPException(404, "Video non trouvee")

    if current_user.role != UserRole.admin and video.formateur_id != current_user.id:
        raise HTTPException(403, "Vous ne pouvez pas modifier cette video")

    try:
        video.is_published = not bool(video.is_published)
        db.commit()
        db.refresh(video)
        return VideoPublishResponse(is_published=bool(video.is_published))
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Erreur lors de la publication: {str(e)}")


@router.get("/{video_id}", response_model=VideoResponse)
def get_video(video_id: int, db: Session = Depends(get_db)):
    """Recuperer les details d'une video"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(404, "Video non trouvee")
    return VideoResponse.model_validate(video)


# ===================== MODIFICATION =====================

@router.put("/{video_id}", response_model=VideoResponse)
def update_video(
    video_id: int,
    request: VideoUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_formateur_or_admin),
):
    """
    Mettre a jour le titre et la categorie d'une video.
    Seul le formateur proprietaire ou l'admin peut modifier.
    """
    video = db.query(Video).filter(Video.id == video_id).first()

    if not video:
        raise HTTPException(404, "Video non trouvee")

    if current_user.role != UserRole.admin and video.formateur_id != current_user.id:
        raise HTTPException(403, "Vous ne pouvez pas modifier cette video")

    try:
        video.title = request.title
        video.category = request.category

        db.commit()
        db.refresh(video)

        return VideoResponse.model_validate(video)

    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Erreur lors de la mise a jour: {str(e)}")


# ===================== SUPPRESSION =====================

@router.delete("/{video_id}", response_model=VideoDeleteResponse)
def delete_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_formateur_or_admin),
):
    """
    Supprimer une video (verifier que c'est l'owner ou admin).
    Supprime aussi le fichier du systeme.
    """
    video = db.query(Video).filter(Video.id == video_id).first()

    if not video:
        raise HTTPException(404, "Video non trouvee")

    if current_user.role != UserRole.admin and video.formateur_id != current_user.id:
        raise HTTPException(403, "Vous ne pouvez pas supprimer cette video")

    if video.file_path and (video.file_path.startswith("/") or "\\" in video.file_path):
        try:
            Path(video.file_path).unlink()
        except Exception as e:
            print(f"Suppression fichier video echouee: {e}")

    db.delete(video)
    db.commit()

    return VideoDeleteResponse(message="Video supprimee avec succes", id=video_id)
