"""
Endpoints API pour l'authentification.
A3 — Rate limiting login | A5 — Refresh tokens | A6 — Changement mot de passe | B7 — Audit logs
"""
from fastapi import APIRouter, HTTPException, Depends, Request, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    GoogleAuthRequest,
    ChangePasswordRequest,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_current_user,
    verify_google_token,
    get_or_create_google_user,
)
from app.core.security import check_login_rate_limit, record_login_attempt
from app.services.audit_logger import (
    log_login_success,
    log_login_failed,
    log_register,
    log_password_change,
    log_google_login,
    log_token_refresh,
    security_logger,
)
from app.services.email_service import (
    store_reset_code,
    verify_reset_code,
    consume_reset_code,
    send_reset_email,
)

router = APIRouter(prefix="/api/auth", tags=["Authentification"])


def _build_token_response(user: User) -> TokenResponse:
    """Génère access + refresh tokens pour un utilisateur."""
    access = create_access_token(data={"sub": str(user.id)})
    refresh = create_refresh_token(data={"sub": str(user.id)})
    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        expires_in=900,
        user=UserResponse.model_validate(user),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, req: Request, db: Session = Depends(get_db)):
    """Créer un nouveau compte utilisateur par email/mot de passe."""
    client_ip = req.client.host if req.client else "unknown"

    # Vérifier unicité username
    if db.query(User).filter(User.username == request.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce nom d'utilisateur est déjà pris",
        )
    # Vérifier unicité email
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet email est déjà utilisé",
        )

    # Créer l'utilisateur
    user = User(
        username=request.username,
        email=request.email,
        hashed_password=hash_password(request.password),
        full_name=request.full_name,
        auth_provider="local",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # B7: Log d'audit
    log_register(user.username, user.email, client_ip, user.id)

    return _build_token_response(user)


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, req: Request, db: Session = Depends(get_db)):
    """Connexion par email + mot de passe (avec rate limiting A3)."""
    client_ip = req.client.host if req.client else "unknown"

    # A3: Vérifier le rate limiting
    check_login_rate_limit(client_ip)

    # Chercher par email
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        record_login_attempt(client_ip)  # A3: compter la tentative
        log_login_failed(request.email, client_ip)  # B7
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
        )

    # Vérifier si c'est un compte Google pur (pas de mot de passe)
    if not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce compte utilise Google. Connectez-vous avec Google.",
        )

    if not verify_password(request.password, user.hashed_password):
        record_login_attempt(client_ip)  # A3
        log_login_failed(request.email, client_ip)  # B7
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé",
        )

    # B7: Log succès
    log_login_success(user.email, client_ip, user.id)

    return _build_token_response(user)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(request: RefreshTokenRequest, req: Request, db: Session = Depends(get_db)):
    """A5 — Rafraîchir l'access token avec un refresh token."""
    client_ip = req.client.host if req.client else "unknown"

    payload = decode_refresh_token(request.refresh_token)
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Token invalide")

    user = db.query(User).filter(User.id == int(user_id_str)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable ou désactivé")

    log_token_refresh(user.id, client_ip)  # B7

    return _build_token_response(user)


@router.post("/google", response_model=TokenResponse)
async def google_auth(request: GoogleAuthRequest, req: Request, db: Session = Depends(get_db)):
    """Authentification via Google OAuth2."""
    client_ip = req.client.host if req.client else "unknown"

    google_info = await verify_google_token(request.credential)

    # Vérifier si l'utilisateur existe déjà
    existing = db.query(User).filter(User.google_id == google_info["google_id"]).first()
    is_new = existing is None

    user = get_or_create_google_user(db, google_info)

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Compte désactivé")

    log_google_login(user.email, client_ip, user.id, is_new)  # B7

    return _build_token_response(user)


@router.put("/change-password")
def change_password(
    request: ChangePasswordRequest,
    req: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """A6 — Changer le mot de passe de l'utilisateur connecté."""
    client_ip = req.client.host if req.client else "unknown"

    # Vérifier que c'est un compte local
    if not current_user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Les comptes Google ne peuvent pas changer de mot de passe ici",
        )

    # Vérifier l'ancien mot de passe
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mot de passe actuel incorrect",
        )

    # Vérifier que le nouveau est différent
    if request.current_password == request.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le nouveau mot de passe doit être différent de l'ancien",
        )

    # Mettre à jour
    current_user.hashed_password = hash_password(request.new_password)
    db.commit()

    log_password_change(current_user.id, client_ip)  # B7

    return {"message": "Mot de passe modifié avec succès"}


# ============================================================
# Mot de passe oublié (envoi code par email + reset)
# ============================================================

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, req: Request, db: Session = Depends(get_db)):
    """
    Envoie un code de réinitialisation à 6 chiffres par email.
    Retourne toujours 200 (même si l'email n'existe pas) pour ne pas révéler l'existence du compte.
    """
    client_ip = req.client.host if req.client else "unknown"

    # Chercher l'utilisateur
    user = db.query(User).filter(User.email == request.email).first()

    if user and user.hashed_password:
        # Générer et stocker le code
        code = store_reset_code(request.email)
        # Envoyer par email
        send_reset_email(request.email, code)
        security_logger.info(
            f"FORGOT_PASSWORD | email={request.email} | ip={client_ip} | code_sent=true"
        )
    else:
        # Ne pas révéler que l'email n'existe pas
        security_logger.warning(
            f"FORGOT_PASSWORD | email={request.email} | ip={client_ip} | code_sent=false (user_not_found_or_google)"
        )

    return {"message": "Si un compte existe avec cet email, un code de réinitialisation a été envoyé."}


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, req: Request, db: Session = Depends(get_db)):
    """Réinitialise le mot de passe avec le code reçu par email."""
    client_ip = req.client.host if req.client else "unknown"

    # Vérifier le code
    if not verify_reset_code(request.email, request.code):
        security_logger.warning(
            f"RESET_PASSWORD_FAIL | email={request.email} | ip={client_ip} | reason=invalid_or_expired_code"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code invalide ou expiré. Veuillez demander un nouveau code.",
        )

    # Chercher l'utilisateur
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Utilisateur introuvable.",
        )

    # Mettre à jour le mot de passe
    user.hashed_password = hash_password(request.new_password)
    db.commit()

    # Supprimer le code utilisé
    consume_reset_code(request.email)

    security_logger.info(
        f"RESET_PASSWORD_OK | user_id={user.id} | email={request.email} | ip={client_ip}"
    )

    return {"message": "Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter."}


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Retourne le profil de l'utilisateur connecté."""
    return UserResponse.model_validate(current_user)
