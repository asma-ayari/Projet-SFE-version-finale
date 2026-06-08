"""
Service de gestion du Vector Store (Pinecone Cloud).
Stocke les embeddings des documents pour la recherche sémantique.
Utilise HuggingFace Inference API (gratuit) pour les embeddings multilingues.

CORRECTIONS v2 :
- Suppression du fallback_docs qui annulait le seuil MIN_SIMILARITY_SCORE.
- Si aucun doc ne passe le seuil -> retourner liste vide (honnête).
- Le fallback langue (sans filtre) est géré dans ask_question(), pas ici.
"""
import threading
from typing import List, Optional

from langchain_pinecone import PineconeVectorStore
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_core.documents import Document
from pinecone import Pinecone, ServerlessSpec

from app.core.config import settings

# Singletons protégés par verrou réentrant (évite deadlock sur appels imbriqués)
_lock = threading.RLock()
_embeddings_model = None
_vector_store = None
_pinecone_client = None


def get_pinecone_client() -> Pinecone:
    """Retourne le client Pinecone (singleton thread-safe)."""
    global _pinecone_client
    if _pinecone_client is None:
        with _lock:
            if _pinecone_client is None:
                _pinecone_client = Pinecone(api_key=settings.PINECONE_API_KEY)
    return _pinecone_client


def ensure_index_exists() -> None:
    """Crée l'index Pinecone s'il n'existe pas."""
    pc = get_pinecone_client()
    existing = [idx.name for idx in pc.list_indexes()]
    if settings.PINECONE_INDEX_NAME not in existing:
        print(f"🔄 Création de l'index Pinecone : {settings.PINECONE_INDEX_NAME}")
        pc.create_index(
            name=settings.PINECONE_INDEX_NAME,
            dimension=384,  # paraphrase-multilingual-MiniLM-L12-v2
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
        print("✅ Index Pinecone créé")
    else:
        print(f"✅ Index Pinecone existant : {settings.PINECONE_INDEX_NAME}")


def get_embeddings_model() -> HuggingFaceEndpointEmbeddings:
    """Retourne le modèle d'embeddings HuggingFace (singleton thread-safe)."""
    global _embeddings_model
    if _embeddings_model is None:
        with _lock:
            if _embeddings_model is None:
                print(f"🔄 Chargement du modèle d'embeddings : {settings.HUGGINGFACE_EMBEDDING_MODEL}")
                _embeddings_model = HuggingFaceEndpointEmbeddings(
                    model=settings.HUGGINGFACE_EMBEDDING_MODEL,
                    huggingfacehub_api_token=settings.HUGGINGFACE_API_KEY,
                )
                print("✅ Modèle d'embeddings HuggingFace chargé")
    return _embeddings_model


def get_vector_store() -> PineconeVectorStore:
    """Retourne l'instance PineconeVectorStore (singleton thread-safe)."""
    global _vector_store
    if _vector_store is None:
        with _lock:
            if _vector_store is None:
                ensure_index_exists()
                embeddings = get_embeddings_model()
                _vector_store = PineconeVectorStore(
                    index_name=settings.PINECONE_INDEX_NAME,
                    embedding=embeddings,
                    pinecone_api_key=settings.PINECONE_API_KEY,
                )
                print("✅ Vector store Pinecone chargé")
    return _vector_store


def add_documents_to_store(chunks: List[Document]) -> None:
    """Ajoute des chunks de documents au vector store Pinecone."""
    if not chunks:
        print("⚠️ Aucun chunk à ajouter")
        return

    store = get_vector_store()
    store.add_documents(chunks)
    print(f"✅ {len(chunks)} chunk(s) ajouté(s) à Pinecone")


def search_similar(query: str, k: int = None, language: Optional[str] = None) -> List[Document]:
    """
    Recherche les documents les plus similaires à la requête.
    
    CORRECTION v2:
    - Plus de fallback_docs.
    - Si aucun doc ne dépasse MIN_SIMILARITY_SCORE -> liste vide retournée.
    - C'est ask_question() qui gère ensuite le fallback sans filtre langue.

    Args:
        query: La question de l'utilisateur.
        k: Nombre max de résultats à récupérer depuis Pinecone.
        language: Filtrer par langue ('fr' ou 'ar'), None pour toutes.

    Returns:
        Liste de Documents dont le score >= MIN_SIMILARITY_SCORE.
        Liste vide si aucun résultat pertinent.
    """
    if k is None:
        k = settings.TOP_K_RESULTS

    store = get_vector_store()

    # Filtrer par langue si spécifié
    filter_dict = {"language": language} if language else None

    try:
        # Scores normalisés [0..1] où 1 = très pertinent.
        scored_results = store.similarity_search_with_relevance_scores(
            query=query,
            k=k,
            filter=filter_dict,
        )

        filtered_docs: List[Document] = []

        for doc, score in scored_results:
            relevance = float(score) if score is not None else 0.0
            doc.metadata["score"] = round(relevance, 4)

            if relevance >= settings.MIN_SIMILARITY_SCORE:
                filtered_docs.append(doc)
            else:
                src = doc.metadata.get("source", "?")
                print(
                    f"⚠️  Doc écarté (score {relevance:.3f} < {settings.MIN_SIMILARITY_SCORE}) : {src}"
                )

        return filtered_docs

    except Exception as e:
        # Fallback robuste: certains backends retournent des scores non normalisés.
        # On convertit en pertinence bornée [0..1] puis on applique le même seuil.
        print(f"⚠️  similarity_search_with_relevance_scores échoué ({e}), fallback avec seuil.")
        raw_scored_results = store.similarity_search_with_score(
            query=query,
            k=k,
            filter=filter_dict,
        )
        docs: List[Document] = []
        for doc, raw_score in raw_scored_results:
            raw = float(raw_score) if raw_score is not None else None

            # Heuristique conservative:
            # - score déjà en [0,1] -> utilisé tel quel
            # - sinon -> normalisation monotone 1/(1+raw) pour borner en [0,1]
            if raw is None:
                relevance = 0.0
            elif 0.0 <= raw <= 1.0:
                relevance = raw
            else:
                relevance = 1.0 / (1.0 + max(raw, 0.0))

            doc.metadata["score"] = round(relevance, 4)

            if relevance >= settings.MIN_SIMILARITY_SCORE:
                docs.append(doc)
            else:
                src = doc.metadata.get("source", "?")
                print(
                    f"⚠️  Doc écarté fallback (score {relevance:.3f} < {settings.MIN_SIMILARITY_SCORE}) : {src}"
                )
        return docs


def clear_vector_store() -> None:
    """Supprime toutes les données de l'index Pinecone."""
    global _vector_store
    pc = get_pinecone_client()
    index = pc.Index(settings.PINECONE_INDEX_NAME)
    index.delete(delete_all=True)
    _vector_store = None
    print("✅ Vector store Pinecone vidé")


def get_store_stats() -> dict:
    """Retourne des statistiques sur le vector store."""
    pc = get_pinecone_client()
    index = pc.Index(settings.PINECONE_INDEX_NAME)
    stats = index.describe_index_stats()
    return {
        "total_chunks": stats.total_vector_count,
        "collection_name": settings.PINECONE_INDEX_NAME,
        "embedding_model": settings.HUGGINGFACE_EMBEDDING_MODEL,
    }
