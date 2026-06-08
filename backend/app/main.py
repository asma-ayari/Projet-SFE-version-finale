from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from sqlalchemy import inspect, text

# Importer les routers
from app.api.chat import router as chat_router
from app.api.auth import router as auth_router
from app.api.conversations import router as conversations_router
from app.api.users import router as users_router
from app.api.qcm import router as qcm_router
from app.api.courses import router as courses_router
from app.api.documents import router as documents_router
from app.api.statistics import router as statistics_router
from app.api.videos import router as videos_router
from app.database import engine, Base
from app.models.feedback import Feedback  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.conversation import Conversation, Message  # noqa: F401
from app.models.qcm import QCM, Question, Answer, UserQCMResult, QCMCategory  # noqa: F401
from app.models.course import Course, CourseEnrollment  # noqa: F401
from app.models.video import Video  # noqa: F401

# Sécurité (B2 + B5)
from app.core.security import SecurityHeadersMiddleware, APIRateLimitMiddleware

# Créer les tables dans la base de données (ne bloque pas si MySQL est arrêté)
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Tables MySQL créées / vérifiées avec succès.")

    inspector = inspect(engine)
    if "videos" in inspector.get_table_names():
        video_columns = {column["name"] for column in inspector.get_columns("videos")}
        if "is_published" not in video_columns:
            with engine.begin() as connection:
                connection.execute(
                    text("ALTER TABLE videos ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT 0")
                )
            print("✅ Colonne videos.is_published ajoutée avec succès.")

    if "qcms" in inspector.get_table_names():
        qcm_columns = {column["name"] for column in inspector.get_columns("qcms")}
        if "generation_language" not in qcm_columns:
            with engine.begin() as connection:
                connection.execute(
                    text("ALTER TABLE qcms ADD COLUMN generation_language VARCHAR(5) NULL DEFAULT 'fr'")
                )
            print("✅ Colonne qcms.generation_language ajoutée avec succès.")

    if "courses" in inspector.get_table_names():
        from app.database import SessionLocal
        from app.api.courses import _normalize_image_url, migrate_legacy_course_uploads

        migrated = migrate_legacy_course_uploads()
        if migrated:
            print(f"✅ {migrated} couverture(s) de cours migrée(s) vers uploads/courses.")

        db = SessionLocal()
        try:
            courses = db.query(Course).filter(Course.image_url.isnot(None)).all()
            changed = 0
            for course in courses:
                normalized = _normalize_image_url(course.image_url)
                if normalized != course.image_url:
                    course.image_url = normalized
                    changed += 1
            if changed:
                db.commit()
                print(f"✅ {changed} image_url de cours normalisées.")
        finally:
            db.close()
except Exception as e:
    print(f"⚠️  MySQL indisponible — les feedbacks seront désactivés : {e}")

# Créer l'application FastAPI
app = FastAPI(
    title="API Sécurité Routière - Chatbot RAG",
    description="Chatbot intelligent bilingue (FR/AR) pour la sécurité routière en Tunisie",
    version="1.0.0"
)

# B2 — Headers de sécurité HTTP (X-Frame-Options, CSP, HSTS, etc.)
app.add_middleware(SecurityHeadersMiddleware)

# B5 — Rate limiting global API (100 requêtes/min par IP)
app.add_middleware(APIRateLimitMiddleware)

# Configuration CORS (ajoute en dernier pour entourer toutes les réponses, y compris erreurs/rate-limit)
origins = [
    "http://localhost:4200",  # Angular dev
    "http://127.0.0.1:4200",
    "http://localhost:5173",  # Vite dev
    "http://127.0.0.1:5173",
    "http://localhost:3000",  # React dev
    "http://127.0.0.1:3000",
    "http://localhost:8000",  # FastAPI (frontend intégré)
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routers API
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(conversations_router)
app.include_router(users_router)
app.include_router(qcm_router)
app.include_router(courses_router)
app.include_router(documents_router)
app.include_router(statistics_router)
app.include_router(videos_router)

# Servir le frontend statique
frontend_dir = Path(__file__).resolve().parent.parent.parent / "frontend"
if frontend_dir.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_dir)), name="static")

# Servir les fichiers uploades (avatars, documents, videos, etc.)
uploads_dir = Path(__file__).resolve().parent.parent / "uploads"
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Route principale
@app.get("/")
def read_root():
    return {
        "message": "Bienvenue sur l'API Sécurité Routière - Chatbot RAG ! 🚗🤖",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "chat": "/api/chat/ask",
            "ingest": "/api/chat/ingest",
            "stats": "/api/chat/stats",
            "auth_register": "/api/auth/register",
            "auth_login": "/api/auth/login",
            "conversations": "/api/conversations/",
            "docs": "/docs",
            "frontend": "/static/index.html",
        }
    }

# Health check
@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Test API
@app.get("/api/test")
def test_api():
    return {
        "message": "L'API fonctionne correctement ! ✅",
        "backend": "Python FastAPI",
        "database": "MySQL (XAMPP)",
        "frontend": "Angular + Chat UI",
        "chatbot": "RAG Bilingue (FR/AR)"
    }