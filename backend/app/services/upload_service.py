# app/services/upload_service.py
import os, shutil, uuid
from fastapi import UploadFile, HTTPException

UPLOAD_DIR = "uploads/questions"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
MAX_SIZE_MB = 5

async def save_question_image(file: UploadFile) -> str:
    """Sauvegarde l'image et retourne l'URL."""
    
    # Vérifier le type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400, 
            detail="Format non supporté. Utilisez jpg, png ou webp"
        )
    
    # Vérifier la taille
    contents = await file.read()
    if len(contents) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"Image trop grande. Maximum {MAX_SIZE_MB}MB"
        )
    
    # Sauvegarder
    ext = file.filename.split(".")[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(contents)
    
    return f"/uploads/questions/{filename}"


def delete_question_image(image_url: str):
    """Supprime l'ancienne image du disque."""
    if not image_url:
        return
    path = image_url.lstrip("/")
    if os.path.exists(path):
        os.remove(path)