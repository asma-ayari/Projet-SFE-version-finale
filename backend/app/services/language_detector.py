"""
Service de détection de langue (Arabe / Français).
Utilise une heuristique simple basée sur les caractères Unicode arabes.
"""
import re


def detect_language(text: str) -> str:
    """
    Détecte si le texte est en arabe ou en français.
    Retourne 'ar' pour l'arabe, 'fr' pour le français.
    """
    # Compter les caractères arabes (plage Unicode arabe)
    arabic_pattern = re.compile(r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+')
    arabic_chars = arabic_pattern.findall(text)
    arabic_count = sum(len(match) for match in arabic_chars)

    # Si plus de 30% des caractères alphabétiques sont arabes → arabe
    alpha_count = sum(1 for c in text if c.isalpha())
    if alpha_count == 0:
        return "fr"  # Par défaut

    ratio = arabic_count / alpha_count
    return "ar" if ratio > 0.3 else "fr"


def get_system_prompt(language: str) -> str:
    """
    Retourne le prompt système adapté à la langue détectée.
    """
    if language == "ar":
        return """أنت مساعد ذكي متخصص في السلامة المرورية في تونس.
أجب على الأسئلة باللغة العربية بناءً على السياق المقدم من قانون المرور التونسي.
إذا لم تجد الإجابة في السياق المقدم، قل ذلك بوضوح.
كن دقيقاً ومفيداً في إجاباتك.

السياق:
{context}

السؤال: {question}

الإجابة:"""
    else:
        return """Tu es un assistant intelligent spécialisé en sécurité routière en Tunisie.
Réponds aux questions en français en te basant sur le contexte fourni du code de la route tunisien.
Si tu ne trouves pas la réponse dans le contexte fourni, dis-le clairement.
Sois précis et utile dans tes réponses.

Contexte :
{context}

Question : {question}

Réponse :"""
