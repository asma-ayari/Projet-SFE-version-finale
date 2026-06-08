"""
Migration: créer les tables QCM (qcms, questions, answers, user_qcm_results).
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import engine, Base
from app.models.qcm import QCM, Question, Answer, UserQCMResult  # noqa

print("Création des tables QCM …")
Base.metadata.create_all(bind=engine)
print("✅ Tables QCM créées avec succès !")
