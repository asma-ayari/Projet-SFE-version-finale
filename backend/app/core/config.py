"""
Configuration centrale du projet.
"""
from pydantic_settings import BaseSettings
from pathlib import Path
import os


class Settings(BaseSettings):
    # --- Projet ---
    PROJECT_NAME: str = "Chatbot Sécurité Routière Tunisie"
    VERSION: str = "1.0.0"

    # --- Base de données MySQL ---
    DATABASE_URL: str = "mysql+pymysql://root:@localhost:3306/securite_routiere_db"

    # --- Groq (LLM gratuit) ---
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    GROQ_VISION_MODEL: str = "meta-llama/llama-4-scout-17b-16e-instruct"

    # --- HuggingFace (Embeddings gratuit) ---
    HUGGINGFACE_API_KEY: str = ""
    HUGGINGFACE_EMBEDDING_MODEL: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

    # --- Pinecone (Vector Store Cloud) ---
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX_NAME: str = "securite-routiere"

    # --- Google OAuth2 ---
    GOOGLE_CLIENT_ID: str = ""

    # --- JWT Auth ---
    JWT_SECRET_KEY: str = "super-secret-key-change-in-production"
    JWT_REFRESH_SECRET_KEY: str = "refresh-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # A5: 15 minutes (avant: 24h)
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7    # A5: refresh token 7 jours

    # --- SMTP (Email) ---
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_EMAIL: str = ""    # Votre email Gmail
    SMTP_PASSWORD: str = ""  # App Password Gmail (pas le mot de passe normal)

    # --- Sécurité ---
    LOGIN_RATE_LIMIT_MAX: int = 5        # A3: max 5 tentatives
    LOGIN_RATE_LIMIT_WINDOW: int = 300   # A3: par fenêtre de 5 min (300s)
    API_RATE_LIMIT_MAX: int = 100        # B5: max 100 requêtes
    API_RATE_LIMIT_WINDOW: int = 60      # B5: par fenêtre de 1 min (60s)

    # --- Documents source ---
    DOCUMENTS_DIR: str = str(
        Path(__file__).resolve().parent.parent.parent / "data" / "documents"
    )

    # --- RAG Parameters ---
    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 150
    CHUNKING_MODE: str = "smart"  # smart | recursive
    CUSTOM_SPLIT_PATTERN_FR: str = ""
    CUSTOM_SPLIT_PATTERN_AR: str = ""
    TOP_K_RESULTS: int = 4
    MIN_SIMILARITY_SCORE: float = 0.35
    MAX_TOKENS: int = 1024

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
