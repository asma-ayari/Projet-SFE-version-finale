"""
API de gestion des utilisateurs (Admin).
CRUD utilisateurs + attribution de rôles.
"""
from fastapi import APIRouter, HTTPException, Depends, Query, status, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import func as sa_func, or_
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from pathlib import Path
import uuid

from app.database import get_db
from app.models.user import User, UserRole
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/users", tags=["Gestion Utilisateurs"])


# --- Dépendances de rôle ---

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Accessible uniquement aux administrateurs."""
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    return current_user


def require_formateur_or_admin(current_user: User = Depends(get_current_user)) -> User:
    """Accessible aux formateurs et administrateurs."""
    if current_user.role not in (UserRole.admin, UserRole.formateur):
        raise HTTPException(status_code=403, detail="Accès réservé aux formateurs et administrateurs")
    return current_user


# --- Schémas ---

class UserListResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    auth_provider: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PaginatedUsersResponse(BaseModel):
    users: List[UserListResponse]
    total: int
    page: int
    pages: int


class UpdateUserRoleRequest(BaseModel):
    role: str = Field(..., pattern="^(admin|formateur|apprenant)$")


class UpdateUserStatusRequest(BaseModel):
    is_active: bool


class AdminCreateUserRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=5, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)
    full_name: Optional[str] = Field(None, max_length=100)
    role: str = Field("apprenant", pattern="^(admin|formateur|apprenant)$")


class UsersStatsResponse(BaseModel):
    total: int
    apprenants: int
    formateurs: int
    admins: int
    actifs: int
    inactifs: int


# --- Endpoints ---

@router.get("/me", response_model=UserListResponse)
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Profil de l'utilisateur connecte (utilise pour la sync avatar)."""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouve")
    return UserListResponse.model_validate(user)

@router.get("/", response_model=PaginatedUsersResponse)
def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Liste paginée des utilisateurs avec filtres."""
    query = db.query(User)

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                User.username.ilike(term),
                User.email.ilike(term),
                User.full_name.ilike(term),
            )
        )

    if role and role in ("admin", "formateur", "apprenant"):
        query = query.filter(User.role == role)

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    total = query.count()
    pages = max(1, (total + limit - 1) // limit)
    users = query.order_by(User.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    return PaginatedUsersResponse(
        users=[UserListResponse.model_validate(u) for u in users],
        total=total,
        page=page,
        pages=pages,
    )


@router.get("/stats", response_model=UsersStatsResponse)
def get_users_stats(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    """Statistiques utilisateurs."""
    total = db.query(User).count()
    apprenants = db.query(User).filter(User.role == UserRole.apprenant).count()
    formateurs = db.query(User).filter(User.role == UserRole.formateur).count()
    admins = db.query(User).filter(User.role == UserRole.admin).count()
    actifs = db.query(User).filter(User.is_active == True).count()
    inactifs = db.query(User).filter(User.is_active == False).count()

    return UsersStatsResponse(
        total=total, apprenants=apprenants, formateurs=formateurs,
        admins=admins, actifs=actifs, inactifs=inactifs,
    )


@router.post("/", response_model=UserListResponse, status_code=201)
def create_user(
    request: AdminCreateUserRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Créer un utilisateur (admin)."""
    from app.services.auth_service import hash_password

    if db.query(User).filter(User.username == request.username).first():
        raise HTTPException(400, "Ce nom d'utilisateur est déjà pris")
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(400, "Cet email est déjà utilisé")

    user = User(
        username=request.username,
        email=request.email,
        hashed_password=hash_password(request.password),
        full_name=request.full_name,
        role=UserRole(request.role),
        auth_provider="local",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserListResponse.model_validate(user)


@router.put("/{user_id}/role", response_model=UserListResponse)
def update_user_role(
    user_id: int,
    request: UpdateUserRoleRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Modifier le rôle d'un utilisateur."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Utilisateur non trouvé")
    if user.id == admin.id:
        raise HTTPException(400, "Vous ne pouvez pas modifier votre propre rôle")

    user.role = UserRole(request.role)
    db.commit()
    db.refresh(user)
    return UserListResponse.model_validate(user)


@router.put("/{user_id}/status", response_model=UserListResponse)
def update_user_status(
    user_id: int,
    request: UpdateUserStatusRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Activer/désactiver un utilisateur."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Utilisateur non trouvé")
    if user.id == admin.id:
        raise HTTPException(400, "Vous ne pouvez pas désactiver votre propre compte")

    user.is_active = request.is_active
    db.commit()
    db.refresh(user)
    return UserListResponse.model_validate(user)


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Supprimer un utilisateur."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Utilisateur non trouvé")
    if user.id == admin.id:
        raise HTTPException(400, "Vous ne pouvez pas supprimer votre propre compte")

    db.delete(user)
    db.commit()


# ===================== AVATAR MANAGEMENT =====================

def get_avatar_dir() -> Path:
    """Retourne le repertoire de stockage des avatars."""
    avatar_dir = Path(__file__).parent.parent.parent / "uploads" / "avatars"
    avatar_dir.mkdir(parents=True, exist_ok=True)
    return avatar_dir


@router.post("/avatar/upload")
def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload et mise a jour de l'avatar de l'utilisateur connecte."""
    allowed_types = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(400, "Format d'image invalide. Accepte: JPEG, PNG, GIF, WebP")

    max_size = 2 * 1024 * 1024
    content = file.file.read()
    file.file.seek(0)
    if len(content) > max_size:
        raise HTTPException(400, "La taille du fichier depasse 2 MB")

    try:
        file_ext = Path(file.filename).suffix.lower()
        unique_filename = f"{current_user.id}_{uuid.uuid4().hex}{file_ext}"

        avatar_dir = get_avatar_dir()
        file_path = avatar_dir / unique_filename

        user = db.query(User).filter(User.id == current_user.id).first()
        if user and user.avatar_url and not user.avatar_url.startswith("http"):
            try:
                old_file = avatar_dir / user.avatar_url.split("/")[-1]
                if old_file.exists():
                    old_file.unlink()
            except Exception:
                pass

        with open(file_path, "wb") as f:
            f.write(content)

        avatar_url = f"/uploads/avatars/{unique_filename}"
        user.avatar_url = avatar_url
        db.commit()
        db.refresh(user)

        return {
            "avatar_url": avatar_url,
            "message": "Avatar mis a jour avec succes",
        }
    except Exception as e:
        raise HTTPException(500, f"Erreur lors du telechargement: {str(e)}")


@router.delete("/avatar")
def delete_avatar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Supprimer l'avatar et revenir aux initiales."""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(404, "Utilisateur non trouve")

    if user.avatar_url and not user.avatar_url.startswith("http"):
        try:
            avatar_dir = get_avatar_dir()
            file_path = avatar_dir / user.avatar_url.split("/")[-1]
            if file_path.exists():
                file_path.unlink()
        except Exception:
            pass

    user.avatar_url = None
    db.commit()
    db.refresh(user)

    return {"message": "Avatar supprime"}


@router.post('/me/avatar')
def upload_avatar_me(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Compat: upload avatar using /api/users/me/avatar"""
    # Delegate to existing logic above (reuse code)
    allowed_types = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(400, "Format d'image invalide. Accepte: JPEG, PNG, GIF, WebP")

    max_size = 2 * 1024 * 1024
    content = file.file.read()
    file.file.seek(0)
    if len(content) > max_size:
        raise HTTPException(400, "La taille du fichier depasse 2 MB")

    try:
        file_ext = Path(file.filename).suffix.lower()
        # Use user id in filename to ensure uniqueness per user
        unique_filename = f"{current_user.id}_{uuid.uuid4().hex}{file_ext}"

        avatar_dir = get_avatar_dir()
        file_path = avatar_dir / unique_filename

        user = db.query(User).filter(User.id == current_user.id).first()
        if user and user.avatar_url and not user.avatar_url.startswith("http"):
            try:
                old_file = avatar_dir / user.avatar_url.split("/")[-1]
                if old_file.exists():
                    old_file.unlink()
            except Exception:
                pass

        with open(file_path, "wb") as f:
            f.write(content)

        avatar_url = f"/uploads/avatars/{unique_filename}"
        user.avatar_url = avatar_url
        db.commit()
        db.refresh(user)

        return {"avatar_url": avatar_url, "message": "Avatar mis a jour avec succes"}
    except Exception as e:
        raise HTTPException(500, f"Erreur lors du telechargement: {str(e)}")


@router.delete('/me/avatar')
def delete_avatar_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Compat: delete avatar via /api/users/me/avatar"""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(404, "Utilisateur non trouve")

    if user.avatar_url and not user.avatar_url.startswith("http"):
        try:
            avatar_dir = get_avatar_dir()
            file_path = avatar_dir / user.avatar_url.split("/")[-1]
            if file_path.exists():
                file_path.unlink()
        except Exception:
            pass

    user.avatar_url = None
    db.commit()
    db.refresh(user)

    return {"message": "Avatar supprime"}
