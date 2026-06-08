"""
Service d'envoi d'emails pour la réinitialisation de mot de passe.
Utilise SMTP (Gmail App Password ou autre fournisseur).
"""
import smtplib
import random
import string
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import settings


# ============================================================
# Stockage en mémoire des codes de réinitialisation
# Format : { email: { "code": "123456", "expires": timestamp } }
# ============================================================
_reset_codes: dict[str, dict] = {}

# Durée de validité du code : 10 minutes
RESET_CODE_EXPIRY = 600  # secondes


def generate_reset_code() -> str:
    """Génère un code à 6 chiffres."""
    return "".join(random.choices(string.digits, k=6))


def store_reset_code(email: str) -> str:
    """Génère et stocke un code de réinitialisation pour un email."""
    code = generate_reset_code()
    _reset_codes[email.lower()] = {
        "code": code,
        "expires": time.time() + RESET_CODE_EXPIRY,
    }
    return code


def verify_reset_code(email: str, code: str) -> bool:
    """Vérifie si le code est valide et non expiré."""
    entry = _reset_codes.get(email.lower())
    if not entry:
        return False
    if time.time() > entry["expires"]:
        # Code expiré — supprimer
        _reset_codes.pop(email.lower(), None)
        return False
    if entry["code"] != code:
        return False
    return True


def consume_reset_code(email: str):
    """Supprime le code après utilisation."""
    _reset_codes.pop(email.lower(), None)


def send_reset_email(to_email: str, code: str) -> bool:
    """
    Envoie un email de réinitialisation avec le code à 6 chiffres.
    Retourne True si envoyé avec succès, False sinon.
    """
    if not settings.SMTP_EMAIL or not settings.SMTP_PASSWORD:
        print(f"⚠️  SMTP non configuré — Code de réinitialisation pour {to_email}: {code}")
        return True  # En dev, on affiche le code dans la console

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "🔐 Réinitialisation de mot de passe — Sécurité Routière"
        msg["From"] = f"Sécurité Routière Tunisie <{settings.SMTP_EMAIL}>"
        msg["To"] = to_email

        # Version texte
        text_content = f"""
Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe.

Votre code de vérification : {code}

Ce code expire dans 10 minutes.

Si vous n'avez pas fait cette demande, ignorez cet email.

— Équipe Sécurité Routière Tunisie
"""

        # Version HTML (belle mise en forme)
        html_content = f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#f4f4f5;">
  <div style="max-width:480px; margin:40px auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg, #e63946 0%, #c1121f 100%); padding:32px 24px; text-align:center;">
      <div style="font-size:2.5rem;">🚗</div>
      <h1 style="color:white; margin:8px 0 0; font-size:1.2rem; font-weight:600;">Sécurité Routière Tunisie</h1>
    </div>
    
    <!-- Body -->
    <div style="padding:32px 24px;">
      <h2 style="color:#1f2937; font-size:1.1rem; margin:0 0 12px;">Réinitialisation de mot de passe</h2>
      <p style="color:#6b7280; font-size:0.9rem; line-height:1.6; margin:0 0 24px;">
        Vous avez demandé la réinitialisation de votre mot de passe. Utilisez le code ci-dessous :
      </p>
      
      <!-- Code -->
      <div style="background:#f8fafc; border:2px dashed #e63946; border-radius:12px; padding:20px; text-align:center; margin:0 0 24px;">
        <div style="font-size:2rem; font-weight:700; letter-spacing:8px; color:#e63946; font-family:monospace;">{code}</div>
        <div style="font-size:0.8rem; color:#9ca3af; margin-top:8px;">Ce code expire dans 10 minutes</div>
      </div>
      
      <p style="color:#9ca3af; font-size:0.8rem; line-height:1.5; margin:0;">
        Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email. Votre mot de passe ne sera pas modifié.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background:#f9fafb; padding:16px 24px; text-align:center; border-top:1px solid #f3f4f6;">
      <p style="color:#9ca3af; font-size:0.75rem; margin:0;">🔒 Cet email a été envoyé automatiquement — ne pas répondre</p>
    </div>
  </div>
</body>
</html>
"""

        msg.attach(MIMEText(text_content, "plain", "utf-8"))
        msg.attach(MIMEText(html_content, "html", "utf-8"))

        # Connexion SMTP
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_EMAIL, to_email, msg.as_string())

        print(f"✅ Email de réinitialisation envoyé à {to_email}")
        return True

    except Exception as e:
        print(f"❌ Erreur envoi email à {to_email}: {e}")
        return False
