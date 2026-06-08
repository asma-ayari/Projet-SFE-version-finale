"""
Script d'ingestion des documents dans le vector store.
À exécuter une seule fois après avoir ajouté les documents.

Usage : python -m scripts.ingest_documents
"""
import sys
import os

# Ajouter le répertoire parent au path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.document_loader import load_documents, split_documents
from app.services.vector_store import add_documents_to_store, clear_vector_store, get_store_stats


def main():
    print("=" * 60)
    print("📚 INGESTION DES DOCUMENTS - SÉCURITÉ ROUTIÈRE TUNISIE")
    print("=" * 60)

    # Optionnel : vider le store existant
    print("\n🗑️ Nettoyage du vector store existant...")
    try:
        clear_vector_store()
    except Exception:
        print("   (Pas de store existant à nettoyer)")

    # 1. Charger les documents
    print("\n📄 Chargement des documents...")
    documents = load_documents()

    if not documents:
        print("❌ Aucun document trouvé !")
        print("   Ajoutez des fichiers .txt dans :")
        print("   - backend/data/documents/fr/  (documents en français)")
        print("   - backend/data/documents/ar/  (documents en arabe)")
        return

    # 2. Découper en chunks
    print("\n✂️ Découpage en chunks...")
    chunks = split_documents(documents)

    # 3. Ajouter au vector store
    print("\n💾 Ajout au vector store (Pinecone Cloud)...")
    add_documents_to_store(chunks)

    # 4. Afficher les stats
    import time
    print("\n⏳ Attente de l'indexation Pinecone (10s)...")
    time.sleep(10)
    print("\n📊 Statistiques :")
    stats = get_store_stats()
    print(f"   - Chunks vectorisés : {stats['total_chunks']}")
    print(f"   - Index : {stats['collection_name']}")
    print(f"   - Modèle d'embeddings : {stats['embedding_model']}")

    print("\n" + "=" * 60)
    print("✅ INGESTION TERMINÉE AVEC SUCCÈS !")
    print("=" * 60)
    print("\n🚀 Lancez le serveur avec : uvicorn app.main:app --reload")
    print("🌐 Frontend : http://localhost:8000/static/index.html")
    print("📖 API Docs : http://localhost:8000/docs")


if __name__ == "__main__":
    main()
