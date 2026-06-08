"""
Endpoints API pour le chatbot RAG.
"""
import base64
from fastapi import APIRouter, HTTPException, Depends, Query, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import Optional
from app.schemas.chat import (
    ChatRequest, ChatResponse,
    IngestRequest, IngestResponse,
    StoreStatsResponse,
    FeedbackRequest, FeedbackResponse, FeedbackStatsResponse,
    ImageDetectionResponse,
)
from app.services.rag_service import ask_question
from app.services.document_loader import load_documents, split_documents
from app.services.vector_store import (
    add_documents_to_store,
    clear_vector_store,
    get_store_stats,
)
from app.services.image_detector import detect_sign_from_image
from app.database import get_db
from app.models.feedback import Feedback
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.services.auth_service import get_current_user_optional

router = APIRouter(prefix="/api/chat", tags=["Chatbot"])


@router.post("/ask", response_model=ChatResponse)
async def ask(
    request: ChatRequest,
    conversation_id: Optional[int] = Query(None, description="ID de la conversation (nécessite auth)"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Poser une question au chatbot.
    Si conversation_id est fourni + utilisateur connecté → sauvegarde dans l'historique.
    Fonctionne aussi sans authentification (mode anonyme).
    """
    try:
        result = ask_question(
            question=request.question,
            language=request.language,
        )

        # Sauvegarder dans l'historique si utilisateur connecté + conversation_id
        if current_user and conversation_id:
            conv = (
                db.query(Conversation)
                .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
                .first()
            )
            if not conv:
                raise HTTPException(status_code=404, detail="Conversation non trouvée")

            # Compter les messages AVANT insertion pour détecter la première question.
            existing_msg_count = db.query(Message).filter(Message.conversation_id == conv.id).count()

            # Mettre à jour la langue de la conversation
            if not conv.language:
                conv.language = result.get("language", "fr")

            # Sauvegarder la question de l'utilisateur
            user_msg = Message(
                conversation_id=conv.id,
                role="user",
                content=request.question,
                language=result.get("language"),
            )
            db.add(user_msg)

            # Sauvegarder la réponse du bot
            bot_msg = Message(
                conversation_id=conv.id,
                role="assistant",
                content=result.get("answer", ""),
                language=result.get("language"),
            )
            db.add(bot_msg)

            # Auto-titre : utiliser la première question réelle de la conversation.
            if existing_msg_count == 0:
                conv.title = request.question[:80] + ("..." if len(request.question) > 80 else "")

            db.commit()

        return ChatResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur du chatbot : {str(e)}")


@router.post("/ingest", response_model=IngestResponse)
async def ingest_documents(request: IngestRequest):
    """
    Ingérer les documents du code de la route dans le vector store.
    À exécuter une fois après avoir ajouté les documents dans data/documents/.
    """
    try:
        # Optionnel : vider le store existant
        if request.clear_existing:
            clear_vector_store()

        # Charger les documents
        documents = load_documents()
        if not documents:
            return IngestResponse(
                status="warning",
                documents_loaded=0,
                chunks_created=0,
                message="Aucun document trouvé dans data/documents/. Ajoutez des fichiers .txt dans les sous-dossiers fr/ et ar/."
            )

        # Découper en chunks
        chunks = split_documents(documents)

        # Ajouter au vector store
        add_documents_to_store(chunks)

        return IngestResponse(
            status="success",
            documents_loaded=len(documents),
            chunks_created=len(chunks),
            message=f"{len(documents)} document(s) ingéré(s), {len(chunks)} chunk(s) créé(s)."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur d'ingestion : {str(e)}")


@router.get("/stats", response_model=StoreStatsResponse)
async def store_stats():
    """
    Obtenir les statistiques du vector store.
    """
    try:
        stats = get_store_stats()
        return StoreStatsResponse(**stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur : {str(e)}")


@router.delete("/clear")
async def clear_store():
    """
    Vider le vector store (supprimer tous les documents vectorisés).
    """
    try:
        clear_vector_store()
        return {"status": "success", "message": "Vector store vidé avec succès."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur : {str(e)}")


# ===== Feedback Endpoints =====

@router.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(request: FeedbackRequest, db: Session = Depends(get_db)):
    """
    Enregistrer un feedback 👍/👎 pour une réponse du chatbot.
    """
    try:
        feedback = Feedback(
            session_id=request.session_id,
            question=request.question,
            answer=request.answer,
            language=request.language,
            is_positive=request.is_positive,
            comment=request.comment,
        )
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        return FeedbackResponse(
            status="success",
            message="Merci pour votre retour ! 🙏" if request.is_positive else "Merci, nous allons améliorer nos réponses.",
            feedback_id=feedback.id,
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur feedback : {str(e)}")


@router.get("/feedback/stats", response_model=FeedbackStatsResponse)
async def feedback_stats(db: Session = Depends(get_db)):
    """
    Obtenir les statistiques des feedbacks.
    """
    try:
        total = db.query(Feedback).count()
        positive = db.query(Feedback).filter(Feedback.is_positive == True).count()
        negative = total - positive
        ratio = (positive / total * 100) if total > 0 else 0.0
        return FeedbackStatsResponse(
            total=total,
            positive=positive,
            negative=negative,
            positive_ratio=round(ratio, 1),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur : {str(e)}")


# ===== Image Detection Endpoint =====

@router.post("/detect-sign", response_model=ImageDetectionResponse)
async def detect_sign_image(
    image: UploadFile = File(..., description="Image du panneau de signalisation"),
    language: str = Form("fr", description="Langue de la reponse (fr/ar)"),
    conversation_id: Optional[int] = Form(None, description="ID de la conversation"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Detecte les panneaux de signalisation dans une image uploadee.
    Utilise Groq Vision pour l'analyse puis matche avec la base de panneaux.
    
    Modes supportes:
    - Upload d'image depuis le PC
    - Capture camera/webcam (envoyer le snapshot comme fichier)
    """
    # Valider le type de fichier
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Type de fichier non supporte: {image.content_type}. Utilisez JPEG, PNG ou WebP."
        )
    
    # Limiter la taille (max 10MB)
    contents = await image.read()
    max_size = 10 * 1024 * 1024  # 10MB
    if len(contents) > max_size:
        raise HTTPException(status_code=400, detail="Image trop volumineuse (max 10MB)")
    
    # Convertir en base64
    image_base64 = base64.b64encode(contents).decode("utf-8")
    
    # Detecter les panneaux
    result = detect_sign_from_image(image_base64, language)
    
    # Sauvegarder dans la conversation si authentifie
    if current_user and conversation_id:
        conv = (
            db.query(Conversation)
            .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
            .first()
        )
        if conv:
            # Sauvegarder le message utilisateur (mention de l'upload)
            user_label = "\U0001f4f7 Image uploadee pour detection de panneau" if language != "ar" else "\U0001f4f7 \u0635\u0648\u0631\u0629 \u0645\u0631\u0641\u0648\u0639\u0629 \u0644\u0644\u0643\u0634\u0641 \u0639\u0646 \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062a"
            user_msg = Message(
                conversation_id=conv.id,
                role="user",
                content=user_label,
                language=language,
            )
            db.add(user_msg)
            
            # Sauvegarder la reponse du bot
            bot_msg = Message(
                conversation_id=conv.id,
                role="assistant",
                content=result.get("description", ""),
                language=language,
            )
            db.add(bot_msg)
            db.commit()
    
    return ImageDetectionResponse(**result)
