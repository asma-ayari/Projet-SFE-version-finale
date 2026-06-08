"""
API Cours — CRUD formateur/admin + lecture publique.
"""
import logging
import shutil
import uuid
from pathlib import Path
from urllib.parse import urlparse
from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app.models.user import User, UserRole
from app.models.course import Course, CourseEnrollment
from app.services.auth_service import get_current_user
from app.services.course_translator import (
    get_course_source_language,
    translate_course_detail,
    translate_list_item,
)
from app.schemas.course import (
    CourseCreate, CourseUpdate, CourseListResponse,
    CourseDetailResponse, PaginatedCoursesResponse,
)

_LOGGER = logging.getLogger(__name__)

router = APIRouter(prefix="/api/courses", tags=["Courses"])

_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
COURSE_UPLOAD_DIR = _BACKEND_ROOT / "uploads" / "courses"
ALLOWED_COVER_TYPES = ["image/jpeg", "image/png", "image/webp"]
MAX_COVER_SIZE_MB = 5
COURSE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# --- Helpers ---

def _normalize_image_url(value: Optional[str]) -> Optional[str]:
    """Stocke un chemin stable /uploads/... pour les fichiers locaux."""
    if not value:
        return value
    raw = value.strip()
    if not raw:
        return None
    if raw.startswith("blob:") or raw.startswith("data:"):
        return None
    if raw.startswith("/uploads/"):
        return raw
    if raw.startswith("uploads/"):
        return f"/{raw}"
    if raw.startswith("http://") or raw.startswith("https://"):
        path = urlparse(raw).path
        if path.startswith("/uploads/"):
            return path
        if path.startswith("/uploads"):
            return path if path.startswith("/uploads/") else None
    return raw


def migrate_legacy_course_uploads() -> int:
    """Copie les couvertures téléversées dans d'anciens dossiers vers backend/uploads/courses."""
    copied = 0
    target = COURSE_UPLOAD_DIR.resolve()
    legacy_dirs = [
        Path.cwd() / "uploads" / "courses",
        _BACKEND_ROOT.parent / "uploads" / "courses",
    ]
    for src_dir in legacy_dirs:
        try:
            resolved_src = src_dir.resolve()
        except OSError:
            continue
        if not resolved_src.is_dir() or resolved_src == target:
            continue
        for file_path in resolved_src.iterdir():
            if not file_path.is_file():
                continue
            dest = target / file_path.name
            if dest.exists():
                continue
            try:
                shutil.copy2(file_path, dest)
                copied += 1
            except OSError as exc:
                _LOGGER.warning("Migration couverture %s echouee: %s", file_path.name, exc)
    return copied


def _serialize_course_list(course: Course) -> CourseListResponse:
    data = CourseListResponse.model_validate(course).model_dump()
    data["image_url"] = _normalize_image_url(data.get("image_url"))
    return CourseListResponse.model_validate(data)


def _serialize_course_detail(course: Course) -> CourseDetailResponse:
    data = CourseDetailResponse.model_validate(course).model_dump()
    data["image_url"] = _normalize_image_url(data.get("image_url"))
    return CourseDetailResponse.model_validate(data)


def require_formateur_or_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in (UserRole.admin, UserRole.formateur):
        raise HTTPException(403, "Accès réservé aux formateurs et administrateurs")
    return current_user


# ===================== PUBLIC =====================

@router.get("/published", response_model=List[CourseListResponse])
def list_published_courses(
    category: Optional[str] = None,
    level: Optional[str] = None,
    lang: Optional[str] = Query(None, pattern="^(fr|ar)$"),
    db: Session = Depends(get_db),
):
    """Liste des cours publiés (accessible à tous)."""
    query = db.query(Course).filter(Course.is_published == True)
    if category:
        query = query.filter(Course.category == category)
    if level:
        query = query.filter(Course.level == level)
    courses = query.order_by(Course.order, Course.created_at.desc()).all()
    items = [_serialize_course_list(c) for c in courses]
    if not lang:
        return items

    translated_items = []
    for item, course in zip(items, courses):
        sample = course.title or course.description or ""
        source_lang = get_course_source_language(sample)
        try:
            translated_items.append(translate_list_item(item, source_lang, lang))
        except Exception as exc:
            _LOGGER.warning("Traduction liste cours %s echouee: %s", item.id, exc)
            translated_items.append(item)
    return translated_items


@router.get("/published/{course_id}", response_model=CourseDetailResponse)
def get_published_course(
    course_id: int,
    lang: Optional[str] = Query(None, pattern="^(fr|ar)$"),
    db: Session = Depends(get_db),
):
    """Détail d'un cours publié."""
    course = db.query(Course).filter(Course.id == course_id, Course.is_published == True).first()
    if not course:
        raise HTTPException(404, "Cours non trouvé ou non publié")
    response = _serialize_course_detail(course)
    if not lang:
        return response

    sample = course.title or course.description or course.content or ""
    source_lang = get_course_source_language(sample)
    try:
        return translate_course_detail(response, source_lang, lang)
    except Exception as exc:
        _LOGGER.warning("Traduction cours %s vers %s echouee: %s", course_id, lang, exc)
        return response


# ===================== FORMATEUR / ADMIN CRUD =====================

@router.get("/manage", response_model=PaginatedCoursesResponse)
def manage_list_courses(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    category: Optional[str] = None,
    user: User = Depends(require_formateur_or_admin),
    db: Session = Depends(get_db),
):
    """Liste des cours pour gestion (tous les formateurs voient tous les cours)."""
    query = db.query(Course)
    if category:
        query = query.filter(Course.category == category)

    total = query.count()
    pages = max(1, (total + limit - 1) // limit)
    courses = query.order_by(Course.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    return PaginatedCoursesResponse(
        courses=[_serialize_course_list(c) for c in courses],
        total=total, page=page, pages=pages,
    )


@router.get("/manage/{course_id}", response_model=CourseDetailResponse)
def manage_get_course(
    course_id: int,
    user: User = Depends(require_formateur_or_admin),
    db: Session = Depends(get_db),
):
    """Détail d'un cours (formateur/admin)."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(404, "Cours non trouvé")
    return _serialize_course_detail(course)


# ===================== DASHBOARD APPRENANT =====================

@router.get("/list", response_model=List[CourseListResponse])
def list_all_courses(
    db: Session = Depends(get_db),
):
    """Liste de tous les cours disponibles (pour dashboard apprenant)."""
    courses = db.query(Course).order_by(Course.order, Course.created_at.desc()).all()
    return [_serialize_course_list(c) for c in courses]


@router.get("/count", response_model=dict)
def count_courses(
    db: Session = Depends(get_db),
):
    """Retourne le nombre total de cours dynamiques."""
    from sqlalchemy import func

    total = db.query(func.count(Course.id)).scalar() or 0
    return {"total": total}


@router.post("/upload-cover")
async def upload_course_cover(
    file: UploadFile = File(...),
    user: User = Depends(require_formateur_or_admin),
):
    """Téléverser une image de couverture pour un cours."""
    if file.content_type not in ALLOWED_COVER_TYPES:
        raise HTTPException(400, "Format non supporté. Utilisez jpg, png ou webp")

    contents = await file.read()
    if len(contents) > MAX_COVER_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"Image trop grande. Maximum {MAX_COVER_SIZE_MB}MB")

    ext = (file.filename or "cover.jpg").split(".")[-1].lower()
    if ext not in ("jpg", "jpeg", "png", "webp"):
        ext = "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = COURSE_UPLOAD_DIR / filename

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    return {"image_url": f"/uploads/courses/{filename}"}


@router.post("/", response_model=CourseDetailResponse, status_code=201)
def create_course(
    data: CourseCreate,
    user: User = Depends(require_formateur_or_admin),
    db: Session = Depends(get_db),
):
    """Créer un cours."""
    course = Course(
        title=data.title, description=data.description,
        category=data.category, level=data.level,
        duration=data.duration, image_url=_normalize_image_url(data.image_url),
        content=data.content, video_url=data.video_url,
        order=data.order, created_by=user.id,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return _serialize_course_detail(course)


@router.put("/{course_id}", response_model=CourseDetailResponse)
def update_course(
    course_id: int,
    data: CourseUpdate,
    user: User = Depends(require_formateur_or_admin),
    db: Session = Depends(get_db),
):
    """Modifier un cours."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(404, "Cours non trouvé")
    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "image_url":
            setattr(course, field, _normalize_image_url(value))
        else:
            setattr(course, field, value)

    db.commit()
    db.refresh(course)
    return _serialize_course_detail(course)


@router.delete("/{course_id}", status_code=204)
def delete_course(
    course_id: int,
    user: User = Depends(require_formateur_or_admin),
    db: Session = Depends(get_db),
):
    """Supprimer un cours."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(404, "Cours non trouvé")
    db.delete(course)
    db.commit()


@router.put("/{course_id}/publish")
def toggle_publish(
    course_id: int,
    user: User = Depends(require_formateur_or_admin),
    db: Session = Depends(get_db),
):
    """Publier / dépublier un cours."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(404, "Cours non trouvé")
    course.is_published = not course.is_published
    db.commit()
    return {"is_published": course.is_published}


# ===================== INSCRIPTIONS =====================

@router.post("/{course_id}/enroll")
def enroll_in_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Inscrire l'utilisateur connecte a un cours publie."""
    course = db.query(Course).filter(Course.id == course_id, Course.is_published == True).first()
    if not course:
        raise HTTPException(404, "Cours non trouve ou non publie")

    existing = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == current_user.id,
        CourseEnrollment.course_id == course_id,
    ).first()

    if existing:
        raise HTTPException(400, "Vous etes deja inscrit a ce cours")

    enrollment = CourseEnrollment(
        user_id=current_user.id,
        course_id=course_id,
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return {
        "id": enrollment.id,
        "user_id": enrollment.user_id,
        "course_id": enrollment.course_id,
        "enrolled_at": enrollment.enrolled_at,
        "message": "Inscription au cours reussie",
    }


@router.delete("/{course_id}/unenroll")
def unenroll_from_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Desinscrire l'utilisateur connecte d'un cours."""
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == current_user.id,
        CourseEnrollment.course_id == course_id,
    ).first()

    if not enrollment:
        raise HTTPException(404, "Inscription introuvable")

    db.delete(enrollment)
    db.commit()

    return {"message": "Desinscription reussie"}
