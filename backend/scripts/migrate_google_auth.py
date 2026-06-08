"""Migration: ajouter les colonnes Google OAuth2 à la table users."""
import sys
sys.path.insert(0, ".")
from app.database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL"))
            print("+ Added avatar_url")
        except Exception as e:
            print(f"  avatar_url: {e}")
        try:
            conn.execute(text('ALTER TABLE users ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT "local"'))
            print("+ Added auth_provider")
        except Exception as e:
            print(f"  auth_provider: {e}")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR(100) NULL UNIQUE"))
            print("+ Added google_id")
        except Exception as e:
            print(f"  google_id: {e}")
        try:
            conn.execute(text("ALTER TABLE users MODIFY COLUMN hashed_password VARCHAR(255) NULL"))
            print("+ Made hashed_password nullable")
        except Exception as e:
            print(f"  hashed_password: {e}")
        conn.commit()
        print("DB migration done!")

if __name__ == "__main__":
    migrate()
