"""
Service d'authentification : JWT + hachage de mots de passe + Google OAuth2.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
import bcrypt
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database import get_db
from app.models.user import User

# --- OAuth2 scheme (extrait le token du header Authorization) ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    """Hache un mot de passe en clair avec bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie un mot de passe par rapport à son hash."""
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crée un access token JWT (courte durée — 15 min par défaut)."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """A5 — Crée un refresh token JWT (longue durée — 7 jours par défaut)."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_REFRESH_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Décode et vérifie un access token JWT."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise JWTError("Not an access token")
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )


def decode_refresh_token(token: str) -> dict:
    """A5 — Décode et vérifie un refresh token JWT."""
    try:
        payload = jwt.decode(token, settings.JWT_REFRESH_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise JWTError("Not a refresh token")
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token invalide ou expiré. Reconnectez-vous.",
        )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Dépendance FastAPI : extrait l'utilisateur connecté depuis le token JWT."""
    payload = decode_access_token(token)
    user_id_str = payload.get("sub")
    if user_id_str is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide",
        )
    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide",
        )
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur non trouvé",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé",
        )
    return user


# Version optionnelle : retourne None si pas de token (pour les endpoints mixtes)
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Retourne l'utilisateur si connecté, None sinon (pas d'erreur)."""
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            return None
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.is_active:
            return user
        return None
    except HTTPException:
        return None


# --- Google OAuth2 ---

async def verify_google_token(credential: str) -> dict:
    """
    Vérifie un ID token Google via l'endpoint tokeninfo de Google.
    Retourne les infos utilisateur (email, name, sub, picture).
    """
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
            )
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token Google invalide",
                )
            payload = resp.json()

        # Vérifier le client_id (audience)
        if payload.get("aud") != settings.GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token Google non autorisé pour cette application",
            )

        # Vérifier que l'email est vérifié
        if payload.get("email_verified") != "true":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email Google non vérifié",
            )

        return {
            "google_id": payload["sub"],
            "email": payload["email"],
            "full_name": payload.get("name", ""),
            "avatar_url": payload.get("picture", ""),
        }

    except httpx.HTTPError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Impossible de vérifier le token Google",
        )


def get_or_create_google_user(db: Session, google_info: dict) -> User:
    """
    Trouve ou crée un utilisateur à partir des infos Google.
    Si l'email existe déjà (compte local), on lie le compte Google.
    """
    # 1. Chercher par google_id
    user = db.query(User).filter(User.google_id == google_info["google_id"]).first()
    if user:
        # Mettre à jour l'avatar si changé
        if google_info.get("avatar_url") and user.avatar_url != google_info["avatar_url"]:
            user.avatar_url = google_info["avatar_url"]
            db.commit()
            db.refresh(user)
        return user

    # 2. Chercher par email (peut être un compte local existant)
    user = db.query(User).filter(User.email == google_info["email"]).first()
    if user:
        # Lier le compte Google au compte local existant
        user.google_id = google_info["google_id"]
        user.auth_provider = "google" if not user.hashed_password else "local"
        if google_info.get("avatar_url"):
            user.avatar_url = google_info["avatar_url"]
        if google_info.get("full_name") and not user.full_name:
            user.full_name = google_info["full_name"]
        db.commit()
        db.refresh(user)
        return user

    # 3. Créer un nouveau compte Google
    # Générer un username unique à partir de l'email
    base_username = google_info["email"].split("@")[0].replace(".", "_")[:40]
    username = base_username
    counter = 1
    while db.query(User).filter(User.username == username).first():
        username = f"{base_username}_{counter}"
        counter += 1

    user = User(
        username=username,
        email=google_info["email"],
        full_name=google_info.get("full_name"),
        avatar_url=google_info.get("avatar_url"),
        auth_provider="google",
        google_id=google_info["google_id"],
        hashed_password=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
