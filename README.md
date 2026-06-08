# 🚗 Chatbot RAG - Sécurité Routière en Tunisie

## Chatbot intelligent bilingue (Français / العربية) basé sur le RAG

Ce projet implémente un chatbot utilisant la technique **RAG (Retrieval-Augmented Generation)** pour répondre aux questions sur la sécurité routière et le code de la route tunisien, en **français** et en **arabe**.

---

## 🏗️ Architecture du Système

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (HTML/JS)                        │
│              Interface Chat Bilingue FR/AR                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP POST /api/chat/ask
┌──────────────────────▼──────────────────────────────────────┐
│                   FASTAPI BACKEND                            │
│                                                              │
│  1. 🌍 Détection de langue (Arabe/Français)                │
│  2. 🔍 Recherche vectorielle (ChromaDB)                     │
│  3. 📝 Construction du prompt avec contexte                 │
│  4. 🤖 Génération LLM (OpenAI / Groq)                      │
│  5. 📤 Réponse dans la langue de l'utilisateur              │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   VECTOR STORE (ChromaDB)                     │
│  Embeddings multilingues (sentence-transformers)             │
│  Documents : Code de la route FR + AR                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Les Étapes du RAG (Comment ça marche)

### Étape 1 : Préparation des Documents
- Les documents du code de la route tunisien (en FR et AR) sont stockés dans `data/documents/`
- Chaque document est découpé en **chunks** (morceaux) de ~500 caractères avec chevauchement

### Étape 2 : Vectorisation (Embeddings)
- Chaque chunk est converti en **vecteur numérique** via un modèle multilingue
- Modèle utilisé : `paraphrase-multilingual-MiniLM-L12-v2` (supporte FR + AR)
- Les vecteurs sont stockés dans **ChromaDB** (base vectorielle locale)

### Étape 3 : Réception de la Question
- L'utilisateur pose une question en **français** ou en **arabe**
- La **langue est auto-détectée** (analyse des caractères Unicode arabes)

### Étape 4 : Recherche Sémantique (Retrieval)
- La question est vectorisée avec le même modèle
- ChromaDB trouve les **K chunks les plus similaires** (par similarité cosinus)
- Ces chunks constituent le **contexte pertinent**

### Étape 5 : Génération de la Réponse (Generation)
- Un **prompt** est construit avec : contexte + question + instructions de langue
- Le LLM (GPT-3.5 ou Llama via Groq) génère une réponse **naturelle**
- La réponse est dans la **même langue** que la question

---

## 🚀 Guide d'Installation

### Prérequis
- Python 3.10+
- Une clé API : **Groq** (gratuit) ou **OpenAI**

### 1. Installer les dépendances

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurer les clés API

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env et ajouter votre clé API
# Option A (gratuit) : Créer une clé sur https://console.groq.com
# Option B : Utiliser une clé OpenAI
```

Contenu du `.env` :
```env
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_votre_cle_ici
```

### 3. Ingérer les documents dans le vector store

```bash
cd backend
python -m scripts.ingest_documents
```

Cette commande :
- Charge les fichiers .txt depuis `data/documents/fr/` et `data/documents/ar/`
- Les découpe en chunks
- Les vectorise et les stocke dans ChromaDB

### 4. Lancer le serveur

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Accéder à l'application

| URL | Description |
|-----|-------------|
| http://localhost:8000/static/index.html | 💬 Interface du chatbot |
| http://localhost:8000/docs | 📖 Documentation API (Swagger) |
| http://localhost:8000/api/chat/stats | 📊 Statistiques du vector store |

---

## 📁 Structure du Projet

```
backend/
├── app/
│   ├── main.py                    # Point d'entrée FastAPI
│   ├── api/
│   │   └── chat.py                # Endpoints API du chatbot
│   ├── core/
│   │   └── config.py              # Configuration centralisée
│   ├── schemas/
│   │   └── chat.py                # Schémas Pydantic (requête/réponse)
│   └── services/
│       ├── document_loader.py     # Chargement & découpage des documents
│       ├── language_detector.py   # Détection de langue FR/AR
│       ├── rag_service.py         # Pipeline RAG complet
│       └── vector_store.py        # Gestion ChromaDB + embeddings
├── data/
│   ├── documents/
│   │   ├── fr/                    # Documents en français
│   │   └── ar/                    # Documents en arabe
│   └── chroma_db/                 # Base vectorielle (généré)
├── scripts/
│   └── ingest_documents.py        # Script d'ingestion
├── requirements.txt
└── .env.example
frontend/
└── index.html                     # Interface chat bilingue
```

---

## 🔌 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/chat/ask` | Poser une question au chatbot |
| POST | `/api/chat/ingest` | Ingérer les documents (via API) |
| GET | `/api/chat/stats` | Statistiques du vector store |
| DELETE | `/api/chat/clear` | Vider le vector store |

### Exemple de requête :

```json
POST /api/chat/ask
{
  "question": "Quelle est la limitation de vitesse en ville ?",
  "language": null
}
```

### Exemple de réponse :

```json
{
  "answer": "En Tunisie, la limitation de vitesse en agglomération (ville) est de 50 km/h maximum...",
  "language": "fr",
  "sources": [
    {
      "content_preview": "Article 2 : Limitations de vitesse...",
      "source": "code_route_tunisie.txt",
      "language": "fr"
    }
  ],
  "context_found": true
}
```

---

## 🔧 Technologies Utilisées

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| Backend | FastAPI | API REST |
| Vector Store | ChromaDB | Stockage des embeddings |
| Embeddings | sentence-transformers (multilingue) | Vectorisation FR/AR |
| LLM | OpenAI GPT / Groq Llama | Génération de réponses |
| Orchestration | LangChain | Pipeline RAG |
| Frontend | HTML/CSS/JS | Interface chat |
| BDD | MySQL (XAMPP) | Données applicatives |

---

## 🌍 Support Bilingue

Le système détecte automatiquement la langue :
- **Question en français** → Réponse en français
- **سؤال بالعربية** ← جواب بالعربية

Le modèle d'embeddings multilingue permet de trouver des documents pertinents **quelle que soit la langue** de la question.
