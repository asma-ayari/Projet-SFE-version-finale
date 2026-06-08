"""Créer un compte administrateur dans la base de données."""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.conversation import Conversation, Message  # noqa
from app.models.qcm import QCM, Question, Answer, UserQCMResult  # noqa
from app.models.course import Course  # noqa
from app.models.feedback import Feedback  # noqa
from app.services.auth_service import hash_password

def create_admin():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == "admin@securite-routiere.tn").first()
        if existing:
            print(f"⚠️  Admin existe déjà : {existing.username} ({existing.email}) - rôle: {existing.role.value}")
            if existing.role != UserRole.admin:
                existing.role = UserRole.admin
                db.commit()
                print("✅ Rôle mis à jour vers admin.")
            return

        admin = User(
            username="admin",
            email="admin@securite-routiere.tn",
            hashed_password=hash_password("Admin@2026"),
            full_name="Administrateur",
            auth_provider="local",
            role=UserRole.admin,
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("✅ Compte admin créé avec succès !")
        print("   Email    : admin@securite-routiere.tn")
        print("   Password : Admin@2026")
        print("   Rôle     : admin")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
