"""
API QCM - CRUD admin + passage QCM apprenant.
"""
import json
import logging
import os
import re
import shutil
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_

from app.database import get_db
from app.models.qcm import Answer, QCM, QCMCategory, Question, UserQCMResult
from app.models.user import User, UserRole
from app.schemas.qcm import (
    PaginatedQCMResponse,
    QCMCategoryCreate,
    QCMCategoryResponse,
    QCMCategoryUpdate,
    QCMCreate,
    QCMDetailResponse,
    QCMListResponse,
    QCMPublicResponse,
    QCMResultResponse,
    QCMUpdate,
    SubmitQCMRequest,
    QCMGenerateRequest,
    QCMGenerateResponse,
)
from app.services.qcm_generator import generate_qcm_from_docs
from groq import RateLimitError
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/qcm", tags=["QCM"])
_LOGGER = logging.getLogger(__name__)

# ✅ NOUVEAU - Configuration upload images
UPLOAD_DIR = "uploads/questions"
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
MAX_IMAGE_SIZE_MB = 5
os.makedirs(UPLOAD_DIR, exist_ok=True)

DEFAULT_QCM_CATEGORIES = [
    ("code_route", "Code de la route"),
    ("signalisation", "Signalisation"),
    ("securite", "Securite routiere"),
    ("conduite", "Conduite"),
    ("general", "General"),
]

ALLOWED_QCM_COUNTS = {5, 10}


# --- Helpers ---

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(403, "Acces reserve aux administrateurs")
    return current_user


def _slugify(value: str) -> str:
    value = value.strip().lower()
    value = value.replace("é", "e").replace("è", "e").replace("ê", "e")
    value = value.replace("à", "a").replace("â", "a").replace("î", "i")
    value = value.replace("ô", "o").replace("û", "u").replace("ù", "u")
    value = value.replace("ç", "c")
    value = re.sub(r"[^a-z0-9]+", "_", value)
    return value.strip("_")


def _truncate_text(value: str, max_len: int) -> str:
    if len(value) <= max_len:
        return value
    return value[: max_len - 3].rstrip() + "..."


def _build_theme_title(theme_text: str) -> str:
    return _truncate_text(f"QCM - {theme_text}", 200)


def _build_theme_description(theme_text: str) -> str:
    return _truncate_text(f"Quiz sur: {theme_text}", 500)


def _ensure_default_categories(db: Session) -> None:
    if db.query(QCMCategory).count() > 0:
        return
    for slug, name in DEFAULT_QCM_CATEGORIES:
        db.add(QCMCategory(slug=slug, name=name, is_active=True))
    db.commit()


def _category_name_cache(db: Session) -> dict:
    rows = db.query(QCMCategory).all()
    return {row.slug: row.name for row in rows}


def _get_active_category_by_slug(db: Session, slug: Optional[str]) -> Optional[QCMCategory]:
    if not slug:
        return None
    return db.query(QCMCategory).filter(
        QCMCategory.slug == slug,
        QCMCategory.is_active == True,
    ).first()


def _require_valid_active_category(db: Session, slug: Optional[str]) -> QCMCategory:
    _ensure_default_categories(db)
    if not slug:
        raise HTTPException(400, "La categorie est requise")
    category = _get_active_category_by_slug(db, slug)
    if not category:
        raise HTTPException(400, "Categorie invalide ou desactivee")
    return category


def _qcm_to_list_response(qcm: QCM, category_cache: dict) -> QCMListResponse:
    return QCMListResponse(
        id=qcm.id,
        title=qcm.title,
        description=qcm.description,
        category=qcm.category,
        category_name=category_cache.get(qcm.category, qcm.category),
        difficulty=qcm.difficulty,
        duration_minutes=qcm.duration_minutes,
        pass_score=qcm.pass_score,
        is_published=qcm.is_published,
        is_generated=qcm.is_generated,
        generation_mode=qcm.generation_mode,
        generation_theme=qcm.generation_theme,
        questions_count=len(qcm.questions) if qcm.questions else 0,
        results_count=len(qcm.results) if qcm.results else 0,
        created_at=qcm.created_at,
    )


def _qcm_to_detail_response(qcm: QCM, category_cache: dict) -> QCMDetailResponse:
    payload = QCMDetailResponse.model_validate(qcm)
    payload.category_name = category_cache.get(qcm.category, qcm.category)
    return payload


def _qcm_to_public_response(qcm: QCM, category_cache: dict) -> QCMPublicResponse:
    payload = QCMPublicResponse.model_validate(qcm)
    payload.category_name = category_cache.get(qcm.category, qcm.category)
    return payload


def _fetch_generated_questions(db: Session, limit: int = 500) -> List[str]:
    rows = (
        db.query(Question.text)
        .join(QCM, QCM.id == Question.qcm_id)
        .filter(QCM.is_generated == True)
        .order_by(Question.id.desc())
        .limit(limit)
        .all()
    )
    return [r[0] for r in rows if r and r[0]]


# ✅ NOUVEAU - Helper suppression image disque
def _delete_image_file(image_url: Optional[str]) -> None:
    if not image_url:
        return
    path = image_url.lstrip("/")
    if os.path.exists(path):
        try:
            os.remove(path)
        except OSError as e:
            _LOGGER.warning("Impossible de supprimer l'image %s: %s", path, e)


# ===================== CATEGORIES =====================

@router.get("/categories", response_model=List[QCMCategoryResponse])
def list_categories(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _ensure_default_categories(db)
    query = db.query(QCMCategory)
    if current_user.role != UserRole.admin:
        query = query.filter(QCMCategory.is_active == True)
    return query.order_by(QCMCategory.name.asc()).all()


@router.post("/categories", response_model=QCMCategoryResponse, status_code=201)
def create_category(
    data: QCMCategoryCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    _ensure_default_categories(db)
    slug = _slugify(data.name)
    if not slug:
        raise HTTPException(400, "Nom de categorie invalide")
    row = QCMCategory(slug=slug, name=data.name.strip(), is_active=True)
    db.add(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Categorie deja existante")
    db.refresh(row)
    return row


@router.put("/categories/{category_id}", response_model=QCMCategoryResponse)
def update_category(
    category_id: int,
    data: QCMCategoryUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    row = db.query(QCMCategory).filter(QCMCategory.id == category_id).first()
    if not row:
        raise HTTPException(404, "Categorie non trouvee")
    new_slug = _slugify(data.name)
    if not new_slug:
        raise HTTPException(400, "Nom de categorie invalide")
    if data.is_active is False:
        in_use = db.query(QCM.id).filter(QCM.category == row.slug).first()
        if in_use:
            raise HTTPException(400, "Categorie utilisee par des QCM, impossible de la desactiver")
    old_slug = row.slug
    row.name = data.name.strip()
    row.slug = new_slug
    if data.is_active is not None:
        row.is_active = data.is_active
    if old_slug != new_slug:
        db.query(QCM).filter(QCM.category == old_slug).update({QCM.category: new_slug})
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Categorie deja existante")
    db.refresh(row)
    return row


@router.delete("/categories/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    row = db.query(QCMCategory).filter(QCMCategory.id == category_id).first()
    if not row:
        raise HTTPException(404, "Categorie non trouvee")
    in_use = db.query(QCM.id).filter(QCM.category == row.slug).first()
    if in_use:
        raise HTTPException(400, "Categorie utilisee par des QCM, suppression impossible")
    db.delete(row)
    db.commit()


# ===================== ADMIN QCM CRUD =====================

@router.post("/", response_model=QCMDetailResponse, status_code=201)
def create_qcm(data: QCMCreate, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    category = _require_valid_active_category(db, data.category)
    qcm = QCM(
        title=data.title,
        description=data.description,
        category=category.slug,
        difficulty=data.difficulty,
        duration_minutes=data.duration_minutes,
        pass_score=data.pass_score,
        created_by=admin.id,
    )
    db.add(qcm)
    db.flush()
    for q_data in data.questions:
        if not any(a.is_correct for a in q_data.answers):
            raise HTTPException(400, f"La question '{q_data.text[:50]}...' doit avoir au moins une bonne reponse")
        question = Question(
            qcm_id=qcm.id,
            text=q_data.text,
            image_url=q_data.image_url,
            explanation=q_data.explanation,
            order=q_data.order,
        )
        db.add(question)
        db.flush()
        for a_data in q_data.answers:
            db.add(Answer(question_id=question.id, text=a_data.text, is_correct=a_data.is_correct))
    db.commit()
    qcm = db.query(QCM).options(
        joinedload(QCM.questions).joinedload(Question.answers)
    ).filter(QCM.id == qcm.id).first()
    cache = _category_name_cache(db)
    return _qcm_to_detail_response(qcm, cache)


# ✅ NOUVEAU - Upload image pour une question existante
@router.post("/questions/{question_id}/upload-image")
async def upload_question_image(
    question_id: int,
    file: UploadFile = File(...),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Uploader ou remplacer l'image d'une question (admin uniquement)."""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(404, "Question introuvable")

    # Vérifier le type de fichier
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(400, "Format non supporte. Utilisez jpg, png ou webp")

    # Vérifier la taille
    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"Image trop grande. Maximum {MAX_IMAGE_SIZE_MB}MB")

    # Supprimer l'ancienne image si elle existe
    _delete_image_file(question.image_url)

    # Sauvegarder la nouvelle image
    ext = (file.filename or "image.jpg").rsplit(".", 1)[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    # Mettre à jour la base de données
    question.image_url = f"/uploads/questions/{filename}"
    db.commit()

    return {"image_url": question.image_url}


# ✅ NOUVEAU - Supprimer l'image d'une question
@router.delete("/questions/{question_id}/image", status_code=204)
def delete_question_image(
    question_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Supprimer l'image d'une question (admin uniquement)."""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(404, "Question introuvable")

    _delete_image_file(question.image_url)
    question.image_url = None
    db.commit()


# ===================== AUTO-GENERATION =====================

@router.post("/generate", response_model=QCMGenerateResponse)
def generate_qcm(
    data: QCMGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _ensure_default_categories(db)
    if data.question_count not in ALLOWED_QCM_COUNTS:
        raise HTTPException(400, "Le nombre de questions doit etre 5 ou 10")
    raw_themes = [t.strip() for t in (data.themes or []) if t and t.strip()]
    themes: List[str] = []
    seen = set()
    for theme in raw_themes:
        key = theme.lower()
        if key in seen:
            continue
        seen.add(key)
        themes.append(theme)
    theme_text = ", ".join(themes) if themes else (data.theme or "").strip()
    if data.mode == "specific" and not theme_text:
        raise HTTPException(400, "Le theme est requis pour le mode specifique")
    existing_questions = _fetch_generated_questions(db)
    try:
        payload = generate_qcm_from_docs(
            language=data.language,
            mode=data.mode,
            theme=theme_text if theme_text else None,
            question_count=data.question_count,
            difficulty=data.difficulty,
            existing_questions=existing_questions,
        )
    except RateLimitError as exc:
        _LOGGER.warning("Rate limit generation QCM: %s", exc)
        raise HTTPException(429, "Limite de requetes atteinte, reessayez dans quelques secondes")
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as exc:
        _LOGGER.exception("Erreur generation QCM: %s", exc)
        raise HTTPException(500, f"Echec de generation du QCM: {exc}")

    title = payload.get("title") or "QCM genere"
    description = payload.get("description") or "QCM auto-genere"
    if data.mode == "specific" and theme_text:
        title = _build_theme_title(theme_text)
        description = _build_theme_description(theme_text)
    category_slug = "general"
    if data.mode == "specific" and theme_text:
        candidate = _slugify(theme_text)
        category = _get_active_category_by_slug(db, candidate)
        if category:
            category_slug = category.slug
    stored_theme = _truncate_text(theme_text, 100) if theme_text else None
    qcm = QCM(
        title=title,
        description=description,
        category=category_slug,
        difficulty=data.difficulty,
        duration_minutes=data.duration_minutes,
        pass_score=70,
        created_by=current_user.id,
        is_generated=True,
        generation_mode=data.mode,
        generation_theme=stored_theme,
    )
    db.add(qcm)
    db.flush()
    for idx, q_data in enumerate(payload.get("questions", []), start=1):
        answers = q_data.get("answers") or []
        if not any(a.get("is_correct") for a in answers):
            raise HTTPException(400, "Chaque question doit avoir une bonne reponse")
        question = Question(
            qcm_id=qcm.id,
            text=q_data.get("text", "").strip(),
            explanation=q_data.get("explanation"),
            order=idx,
        )
        db.add(question)
        db.flush()
        for a_data in answers[:4]:
            db.add(Answer(
                question_id=question.id,
                text=(a_data.get("text") or "").strip(),
                is_correct=bool(a_data.get("is_correct")),
            ))
    db.commit()
    return QCMGenerateResponse(
        qcm_id=qcm.id,
        title=qcm.title,
        questions_count=len(payload.get("questions", [])),
        duration_minutes=qcm.duration_minutes,
    )


@router.get("/admin/list", response_model=PaginatedQCMResponse)
def admin_list_qcms(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    category: Optional[str] = None,
    is_published: Optional[bool] = None,
    include_generated: bool = Query(False),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(QCM).options(joinedload(QCM.questions), joinedload(QCM.results))
    if category:
        query = query.filter(QCM.category == category)
    if is_published is not None:
        query = query.filter(QCM.is_published == is_published)
    if not include_generated:
        query = query.filter(QCM.is_generated == False)
    total = query.count()
    pages = max(1, (total + limit - 1) // limit)
    qcms = query.order_by(QCM.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    cache = _category_name_cache(db)
    return PaginatedQCMResponse(
        qcms=[_qcm_to_list_response(q, cache) for q in qcms],
        total=total,
        page=page,
        pages=pages,
    )


@router.get("/admin/{qcm_id}", response_model=QCMDetailResponse)
def admin_get_qcm(qcm_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    qcm = db.query(QCM).options(
        joinedload(QCM.questions).joinedload(Question.answers)
    ).filter(QCM.id == qcm_id).first()
    if not qcm:
        raise HTTPException(404, "QCM non trouve")
    cache = _category_name_cache(db)
    return _qcm_to_detail_response(qcm, cache)


@router.put("/{qcm_id}", response_model=QCMDetailResponse)
def update_qcm(qcm_id: int, data: QCMUpdate, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    qcm = db.query(QCM).filter(QCM.id == qcm_id).first()
    if not qcm:
        raise HTTPException(404, "QCM non trouve")
    updates = data.model_dump(exclude_unset=True)
    if "category" in updates:
        category = _require_valid_active_category(db, updates["category"])
        updates["category"] = category.slug
    for field, value in updates.items():
        setattr(qcm, field, value)
    db.commit()
    qcm = db.query(QCM).options(
        joinedload(QCM.questions).joinedload(Question.answers)
    ).filter(QCM.id == qcm.id).first()
    cache = _category_name_cache(db)
    return _qcm_to_detail_response(qcm, cache)


@router.delete("/{qcm_id}", status_code=204)
def delete_qcm(qcm_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    qcm = db.query(QCM).filter(QCM.id == qcm_id).first()
    if not qcm:
        raise HTTPException(404, "QCM non trouve")
    db.delete(qcm)
    db.commit()


@router.put("/{qcm_id}/publish")
def toggle_publish(qcm_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    qcm = db.query(QCM).filter(QCM.id == qcm_id).first()
    if not qcm:
        raise HTTPException(404, "QCM non trouve")
    qcm.is_published = not qcm.is_published
    db.commit()
    return {"is_published": qcm.is_published}


# ===================== APPRENANT =====================

@router.get("/list", response_model=List[QCMListResponse])
def list_published_qcms(
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    base_query = db.query(QCM).options(
        joinedload(QCM.questions), joinedload(QCM.results)
    ).filter(
        or_(
            QCM.is_published == True,
            and_(QCM.is_generated == True, QCM.created_by == current_user.id),
        )
    )
    if category:
        base_query = base_query.filter(QCM.category == category)
    qcms = base_query.order_by(QCM.created_at.desc()).all()
    cache = _category_name_cache(db)
    return [_qcm_to_list_response(q, cache) for q in qcms]


@router.get("/generated/{qcm_id}", response_model=QCMPublicResponse)
def get_generated_qcm(
    qcm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    qcm = db.query(QCM).options(
        joinedload(QCM.questions).joinedload(Question.answers)
    ).filter(
        QCM.id == qcm_id,
        QCM.is_generated == True,
        QCM.created_by == current_user.id,
    ).first()
    if not qcm:
        raise HTTPException(404, "QCM genere non trouve")
    cache = _category_name_cache(db)
    return _qcm_to_public_response(qcm, cache)


@router.get("/{qcm_id}", response_model=QCMPublicResponse)
def get_qcm_for_test(qcm_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    qcm = db.query(QCM).options(
        joinedload(QCM.questions).joinedload(Question.answers)
    ).filter(QCM.id == qcm_id, QCM.is_published == True).first()
    if not qcm:
        raise HTTPException(404, "QCM non trouve ou non publie")
    cache = _category_name_cache(db)
    return _qcm_to_public_response(qcm, cache)


@router.post("/{qcm_id}/submit", response_model=QCMResultResponse)
def submit_qcm(
    qcm_id: int,
    data: SubmitQCMRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    qcm = db.query(QCM).options(
        joinedload(QCM.questions).joinedload(Question.answers)
    ).filter(QCM.id == qcm_id, QCM.is_published == True).first()
    if not qcm:
        raise HTTPException(404, "QCM non trouve")
    correct_map = {}
    for question in qcm.questions:
        for answer in question.answers:
            if answer.is_correct:
                correct_map[question.id] = answer.id
    total = len(qcm.questions)
    correct = 0
    details = []
    for submitted in data.answers:
        is_correct = correct_map.get(submitted.question_id) == submitted.answer_id
        if is_correct:
            correct += 1
        details.append({
            "question_id": submitted.question_id,
            "answer_id": submitted.answer_id,
            "correct_answer_id": correct_map.get(submitted.question_id),
            "is_correct": is_correct,
        })
    score = round((correct / total) * 100, 1) if total > 0 else 0
    passed = score >= qcm.pass_score
    result = UserQCMResult(
        user_id=current_user.id,
        qcm_id=qcm.id,
        score=score,
        total_questions=total,
        correct_answers=correct,
        passed=passed,
        duration_seconds=data.duration_seconds,
        answers_detail=json.dumps(details),
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return QCMResultResponse(
        id=result.id,
        qcm_id=qcm.id,
        qcm_title=qcm.title,
        score=score,
        total_questions=total,
        correct_answers=correct,
        passed=passed,
        duration_seconds=data.duration_seconds,
        completed_at=result.completed_at,
        details=details,
    )


@router.post("/generated/{qcm_id}/submit", response_model=QCMResultResponse)
def submit_generated_qcm(
    qcm_id: int,
    data: SubmitQCMRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    qcm = db.query(QCM).options(
        joinedload(QCM.questions).joinedload(Question.answers)
    ).filter(
        QCM.id == qcm_id,
        QCM.is_generated == True,
        QCM.created_by == current_user.id,
    ).first()
    if not qcm:
        raise HTTPException(404, "QCM genere non trouve")
    correct_map = {}
    for question in qcm.questions:
        for answer in question.answers:
            if answer.is_correct:
                correct_map[question.id] = answer.id
    total = len(qcm.questions)
    correct = 0
    details = []
    for submitted in data.answers:
        is_correct = correct_map.get(submitted.question_id) == submitted.answer_id
        if is_correct:
            correct += 1
        details.append({
            "question_id": submitted.question_id,
            "answer_id": submitted.answer_id,
            "correct_answer_id": correct_map.get(submitted.question_id),
            "is_correct": is_correct,
        })
    score = round((correct / total) * 100, 1) if total > 0 else 0
    passed = score >= qcm.pass_score
    result = UserQCMResult(
        user_id=current_user.id,
        qcm_id=qcm.id,
        score=score,
        total_questions=total,
        correct_answers=correct,
        passed=passed,
        duration_seconds=data.duration_seconds,
        answers_detail=json.dumps(details),
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return QCMResultResponse(
        id=result.id,
        qcm_id=qcm.id,
        qcm_title=qcm.title,
        score=score,
        total_questions=total,
        correct_answers=correct,
        passed=passed,
        duration_seconds=data.duration_seconds,
        completed_at=result.completed_at,
        details=details,
    )


@router.get("/results/me", response_model=List[QCMResultResponse])
def my_results(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    results = db.query(UserQCMResult).filter(
        UserQCMResult.user_id == current_user.id
    ).order_by(UserQCMResult.completed_at.desc()).all()
    output = []
    for row in results:
        qcm = db.query(QCM).filter(QCM.id == row.qcm_id).first()
        output.append(QCMResultResponse(
            id=row.id,
            qcm_id=row.qcm_id,
            qcm_title=qcm.title if qcm else "QCM supprime",
            score=row.score,
            total_questions=row.total_questions,
            correct_answers=row.correct_answers,
            passed=row.passed,
            duration_seconds=row.duration_seconds,
            completed_at=row.completed_at,
            details=json.loads(row.answers_detail) if row.answers_detail else None,
        ))
    return output