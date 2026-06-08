"""
Middlewares de sécurité pour FastAPI.
A3 — Rate limiting login (anti brute-force)
B2 — Headers de sécurité HTTP
B5 — Rate limiting global API
"""
import time
from collections import defaultdict
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings
from app.services.audit_logger import log_rate_limit


# ============================================================
# Stockage en mémoire des compteurs de rate limiting
# (en production, utiliser Redis)
# ============================================================

class RateLimitStore:
    """Stocke les tentatives par IP avec expiration automatique."""

    def __init__(self):
        self._store: dict[str, list[float]] = defaultdict(list)

    def add_attempt(self, key: str):
        """Enregistre une tentative."""
        self._store[key].append(time.time())

    def count_recent(self, key: str, window_seconds: int) -> int:
        """Compte les tentatives dans la fenêtre de temps."""
        now = time.time()
        cutoff = now - window_seconds
        # Nettoyer les anciennes entrées
        self._store[key] = [t for t in self._store[key] if t > cutoff]
        return len(self._store[key])

    def is_limited(self, key: str, max_attempts: int, window_seconds: int) -> bool:
        """Vérifie si la limite est atteinte."""
        return self.count_recent(key, window_seconds) >= max_attempts


# Instances globales
login_limiter = RateLimitStore()
api_limiter = RateLimitStore()


# ============================================================
# B2 — Middleware Headers de sécurité HTTP
# ============================================================

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Ajoute les headers de sécurité HTTP à chaque réponse."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Protection contre le clickjacking (iframe)
        response.headers["X-Frame-Options"] = "DENY"

        # Protection XSS navigateur
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Empêcher le navigateur de deviner le type MIME
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Politique de référent
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions Policy (désactiver les APIs inutiles)
        response.headers["Permissions-Policy"] = "camera=(self), microphone=(self), geolocation=()"

        # Content Security Policy (protection XSS avancée)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://accounts.google.com; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https://*.googleusercontent.com; "
            "connect-src 'self'; "
            "frame-src https://accounts.google.com; "
            "font-src 'self';"
        )

        # Strict Transport Security (HTTPS en production)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response


# ============================================================
# B5 — Middleware Rate Limiting Global API
# ============================================================

class APIRateLimitMiddleware(BaseHTTPMiddleware):
    """Limite le nombre de requêtes par IP sur toute l'API."""

    async def dispatch(self, request: Request, call_next):
        # Les preflight CORS ne doivent pas etre limites.
        if request.method == "OPTIONS":
            return await call_next(request)

        # Ignorer les fichiers statiques
        if request.url.path.startswith("/static") or request.url.path.startswith("/uploads"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        key = f"api:{client_ip}"

        # Vérifier la limite
        if api_limiter.is_limited(
            key,
            settings.API_RATE_LIMIT_MAX,
            settings.API_RATE_LIMIT_WINDOW,
        ):
            log_rate_limit(client_ip, request.url.path)
            return Response(
                content='{"detail":"Trop de requêtes. Réessayez dans une minute."}',
                status_code=429,
                media_type="application/json",
                headers={"Retry-After": str(settings.API_RATE_LIMIT_WINDOW)},
            )

        # Compter la requête
        api_limiter.add_attempt(key)
        return await call_next(request)


# ============================================================
# A3 — Fonctions Rate Limiting Login (utilisé dans auth.py)
# ============================================================

def check_login_rate_limit(ip: str):
    """Vérifie si l'IP a dépassé la limite de tentatives de login."""
    key = f"login:{ip}"
    if login_limiter.is_limited(
        key,
        settings.LOGIN_RATE_LIMIT_MAX,
        settings.LOGIN_RATE_LIMIT_WINDOW,
    ):
        remaining_time = settings.LOGIN_RATE_LIMIT_WINDOW
        log_rate_limit(ip, "/api/auth/login")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Trop de tentatives de connexion. Réessayez dans {remaining_time // 60} minutes.",
        )


def record_login_attempt(ip: str):
    """Enregistre une tentative de login (échouée)."""
    key = f"login:{ip}"
    login_limiter.add_attempt(key)
