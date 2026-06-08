"""
B7 — Service de logs d'audit sécurité.
Enregistre les événements de sécurité dans un fichier et la console.
"""
import logging
from datetime import datetime, timezone
from pathlib import Path

# Créer le dossier logs
LOG_DIR = Path(__file__).resolve().parent.parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

# Logger sécurité — fichier séparé
security_logger = logging.getLogger("security_audit")
security_logger.setLevel(logging.INFO)

# Handler fichier
file_handler = logging.FileHandler(LOG_DIR / "security_audit.log", encoding="utf-8")
file_handler.setFormatter(logging.Formatter(
    "%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
))
security_logger.addHandler(file_handler)

# Handler console
console_handler = logging.StreamHandler()
console_handler.setFormatter(logging.Formatter(
    "\033[33m[SECURITY]\033[0m %(asctime)s | %(message)s",
    datefmt="%H:%M:%S"
))
security_logger.addHandler(console_handler)


def log_login_success(email: str, ip: str, user_id: int):
    """Connexion réussie."""
    security_logger.info(f"LOGIN_OK | user_id={user_id} | email={email} | ip={ip}")


def log_login_failed(email: str, ip: str, reason: str = "bad_credentials"):
    """Tentative de connexion échouée."""
    security_logger.warning(f"LOGIN_FAIL | email={email} | ip={ip} | reason={reason}")


def log_register(username: str, email: str, ip: str, user_id: int):
    """Inscription d'un nouveau compte."""
    security_logger.info(f"REGISTER | user_id={user_id} | username={username} | email={email} | ip={ip}")


def log_password_change(user_id: int, ip: str):
    """Changement de mot de passe."""
    security_logger.info(f"PASSWORD_CHANGE | user_id={user_id} | ip={ip}")


def log_rate_limit(ip: str, endpoint: str):
    """Rate limit atteint."""
    security_logger.warning(f"RATE_LIMIT | ip={ip} | endpoint={endpoint}")


def log_google_login(email: str, ip: str, user_id: int, is_new: bool):
    """Connexion Google."""
    action = "GOOGLE_REGISTER" if is_new else "GOOGLE_LOGIN"
    security_logger.info(f"{action} | user_id={user_id} | email={email} | ip={ip}")


def log_token_refresh(user_id: int, ip: str):
    """Rafraîchissement de token."""
    security_logger.info(f"TOKEN_REFRESH | user_id={user_id} | ip={ip}")


def log_logout(user_id: int, ip: str):
    """Déconnexion."""
    security_logger.info(f"LOGOUT | user_id={user_id} | ip={ip}")
