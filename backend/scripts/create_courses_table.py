"""
Migration: créer la table courses.
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import engine, Base
from app.models.course import Course  # noqa

print("Création de la table courses …")
Base.metadata.create_all(bind=engine)
print("✅ Table courses créée avec succès !")
