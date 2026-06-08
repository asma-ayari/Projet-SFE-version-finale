"""Add role column to users table."""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text(
            "ALTER TABLE users ADD COLUMN role ENUM('admin','formateur','apprenant') NOT NULL DEFAULT 'apprenant'"
        ))
        conn.commit()
        print("✅ Column 'role' added to users table")
    except Exception as e:
        if "Duplicate column" in str(e):
            print("✅ Column 'role' already exists")
        else:
            print(f"❌ Error: {e}")
