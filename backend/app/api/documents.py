"""
API Documents — Upload, liste, suppression de documents + ingestion chatbot.
"""
import base64
import os
import shutil
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import List, Optional

from app.models.user import User, UserRole
from app.services.auth_service import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/api/documents", tags=["Documents"])

ALLOWED_EXTENSIONS = {".txt", ".pdf", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


# --- Helpers ---

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(403, "Accès réservé aux administrateurs")
    return current_user


def _get_docs_dir() -> Path:
    return Path(settings.DOCUMENTS_DIR)


def _list_files(lang: Optional[str] = None) -> List[dict]:
    """Liste tous les fichiers dans data/documents/."""
    docs_dir = _get_docs_dir()
    files = []
    langs = [lang] if lang else ["fr", "ar"]

    for l in langs:
        lang_dir = docs_dir / l
        if not lang_dir.exists():
            continue
        for f in lang_dir.iterdir():
            if f.is_file() and f.suffix.lower() in ALLOWED_EXTENSIONS:
                files.append({
                    "name": f.name,
                    "language": l,
                    "size": f.stat().st_size,
                    "extension": f.suffix.lower(),
                    "path": f"{l}/{f.name}",
                })

    return sorted(files, key=lambda x: x["name"])


# ===================== ENDPOINTS =====================

@router.get("/")
def list_documents(lang: Optional[str] = None, admin: User = Depends(require_admin)):
    """Liste tous les documents disponibles."""
    return {"documents": _list_files(lang), "total": len(_list_files(lang))}


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    language: str = Form("fr"),
    admin: User = Depends(require_admin),
):
    """Uploader un document (txt, pdf, docx) pour le chatbot."""
    # Valider l'extension
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Extension non supportée. Autorisées: {', '.join(ALLOWED_EXTENSIONS)}")

    # Valider la langue
    if language not in ("fr", "ar"):
        raise HTTPException(400, "Langue invalide. Choisir 'fr' ou 'ar'.")

    # Lire le contenu avec limite de taille
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, f"Fichier trop volumineux (max {MAX_FILE_SIZE // 1024 // 1024} MB)")

    # Sécuriser le nom de fichier
    safe_name = Path(file.filename or "document").name
    # Empêcher le path traversal
    if ".." in safe_name or "/" in safe_name or "\\" in safe_name:
        raise HTTPException(400, "Nom de fichier invalide")

    # Créer le répertoire si nécessaire
    dest_dir = _get_docs_dir() / language
    dest_dir.mkdir(parents=True, exist_ok=True)

    # Écrire le fichier
    dest_path = dest_dir / safe_name
    with open(dest_path, "wb") as f:
        f.write(content)

    return {
        "message": f"Document '{safe_name}' uploadé avec succès",
        "file": {
            "name": safe_name,
            "language": language,
            "size": len(content),
            "extension": ext,
            "path": f"{language}/{safe_name}",
        }
    }


@router.delete("/{language}/{filename}")
def delete_document(language: str, filename: str, admin: User = Depends(require_admin)):
    """Supprimer un document."""
    if language not in ("fr", "ar"):
        raise HTTPException(400, "Langue invalide")

    # Empêcher le path traversal
    safe_name = Path(filename).name
    if ".." in safe_name or "/" in safe_name or "\\" in safe_name:
        raise HTTPException(400, "Nom de fichier invalide")

    file_path = _get_docs_dir() / language / safe_name
    if not file_path.exists():
        raise HTTPException(404, "Document non trouvé")

    file_path.unlink()
    return {"message": f"Document '{safe_name}' supprimé"}


@router.get("/file/{language}/{filename}")
def download_document(language: str, filename: str, admin: User = Depends(require_admin)):
    """Servir un document pour telechargement ou preview."""
    if language not in ("fr", "ar"):
        raise HTTPException(400, "Langue invalide")

    safe_name = Path(filename).name
    if ".." in safe_name or "/" in safe_name or "\\" in safe_name:
        raise HTTPException(400, "Nom de fichier invalide")

    file_path = _get_docs_dir() / language / safe_name
    if not file_path.exists():
        raise HTTPException(404, f"Document '{safe_name}' non trouve")

    return FileResponse(
        path=file_path,
        media_type="application/octet-stream",
        filename=safe_name,
    )


@router.get("/file-base64/{language}/{filename}")
def download_document_base64(language: str, filename: str, admin: User = Depends(require_admin)):
    """Servir un document en base64 pour les Blob URLs."""
    if language not in ("fr", "ar"):
        raise HTTPException(400, "Langue invalide")

    safe_name = Path(filename).name
    if ".." in safe_name or "/" in safe_name or "\\" in safe_name:
        raise HTTPException(400, "Nom de fichier invalide")

    file_path = _get_docs_dir() / language / safe_name
    if not file_path.exists():
        raise HTTPException(404, f"Document '{safe_name}' non trouve")

    with open(file_path, "rb") as f:
        file_content = f.read()
        base64_content = base64.b64encode(file_content).decode("utf-8")

    return {
        "name": safe_name,
        "language": language,
        "extension": file_path.suffix.lower(),
        "base64Data": base64_content,
    }


@router.post("/ingest")
def ingest_documents(admin: User = Depends(require_admin)):
    """Déclencher l'ingestion des documents dans le vector store (Pinecone)."""
    try:
        from app.services.document_loader import load_documents, split_documents
        from app.services.vector_store import add_documents_to_store, clear_vector_store, get_store_stats

        # Nettoyer le store existant
        try:
            clear_vector_store()
        except Exception:
            pass

        # Charger et découper
        documents = load_documents()
        if not documents:
            return {"status": "warning", "message": "Aucun document trouvé à ingérer"}

        chunks = split_documents(documents)

        # Ajouter au vector store
        add_documents_to_store(chunks)

        # Stats
        stats = get_store_stats()

        return {
            "status": "success",
            "message": f"{len(documents)} document(s) ingéré(s), {len(chunks)} chunk(s) créé(s)",
            "stats": stats,
        }
    except Exception as e:
        raise HTTPException(500, f"Erreur lors de l'ingestion: {str(e)}")


@router.get("/stats")
def get_document_stats(admin: User = Depends(require_admin)):
    """Statistiques des documents et du vector store."""
    files = _list_files()
    fr_count = sum(1 for f in files if f["language"] == "fr")
    ar_count = sum(1 for f in files if f["language"] == "ar")
    total_size = sum(f["size"] for f in files)

    store_stats = {}
    try:
        from app.services.vector_store import get_store_stats
        store_stats = get_store_stats()
    except Exception:
        store_stats = {"error": "Vector store indisponible"}

    return {
        "documents": {
            "total": len(files),
            "fr": fr_count,
            "ar": ar_count,
            "total_size_bytes": total_size,
        },
        "vector_store": store_stats,
    }
