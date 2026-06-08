import sys
sys.path.insert(0, '.')

from app.database import get_db, engine
from app.models.user import User, Base
from app.services.auth_service import hash_password, create_access_token
from sqlalchemy.orm import Session

Base.metadata.create_all(bind=engine)

db = next(get_db())

# Créer un utilisateur admin pour test
user = db.query(User).filter(User.email == "admin@test.com").first()
if not user:
    user = User(
        email="admin@test.com",
        hashed_password=hash_password("Admin123!"),
        role="admin",
        is_approved=True,
        full_name="Test Admin"
    )
    db.add(user)
    db.commit()
    print(f"✅ Utilisateur créé: admin@test.com")
else:
    print(f"ℹ️  Utilisateur existe déjà: admin@test.com")

# Générer un token

token = create_access_token(user_id=user.id)
print(f"\nToken: {token}")
