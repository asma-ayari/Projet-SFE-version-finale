"""
Service de detection de panneaux de signalisation par image.
Utilise Groq Vision (llama-3.2-11b-vision-preview) pour analyser l'image,
puis fait correspondre les resultats a la base de panneaux existante.
"""
import base64
import re
from typing import List, Dict, Optional
from groq import Groq
from app.core.config import settings
from app.services.sign_detector import SIGNS_DATABASE, SIGN_CATEGORIES


def get_groq_client():
    """Retourne un client Groq."""
    return Groq(api_key=settings.GROQ_API_KEY)


VISION_PROMPT_FR = """Tu es un expert en signalisation routiere tunisienne et internationale. Analyse cette image et identifie TOUS les panneaux de signalisation visibles.

Pour CHAQUE panneau detecte, donne:
1. Le type exact du panneau (ex: "stop", "sens interdit", "limitation de vitesse 50 km/h", etc.)
2. La categorie: interdiction, danger, obligation, ou indication
3. Une breve description

IMPORTANT: Reponds UNIQUEMENT en francais, au format suivant, un panneau par ligne:
PANNEAU: [nom du panneau] | CATEGORIE: [categorie] | DESCRIPTION: [description courte]

Si aucun panneau n'est visible, reponds: AUCUN_PANNEAU

Sois precis et exhaustif dans ta detection."""

VISION_PROMPT_AR = """\u0623\u0646\u062a \u062e\u0628\u064a\u0631 \u0641\u064a \u0639\u0644\u0627\u0645\u0627\u062a \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062a\u0648\u0646\u0633\u064a\u0629 \u0648\u0627\u0644\u062f\u0648\u0644\u064a\u0629. \u062d\u0644\u0644 \u0647\u0630\u0647 \u0627\u0644\u0635\u0648\u0631\u0629 \u0648\u062d\u062f\u062f \u062c\u0645\u064a\u0639 \u0639\u0644\u0627\u0645\u0627\u062a \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u0645\u0631\u0626\u064a\u0629.

\u0644\u0643\u0644 \u0639\u0644\u0627\u0645\u0629 \u0645\u0643\u062a\u0634\u0641\u0629\u060c \u0623\u0639\u0637:
1. \u0627\u0644\u0646\u0648\u0639 \u0627\u0644\u062f\u0642\u064a\u0642 \u0644\u0644\u0639\u0644\u0627\u0645\u0629 (\u0645\u062b\u0644\u0627: "\u0642\u0641", "\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u062f\u062e\u0648\u0644", "\u062a\u062d\u062f\u064a\u062f \u0627\u0644\u0633\u0631\u0639\u0629 50 \u0643\u0645/\u0633")
2. \u0627\u0644\u0641\u0626\u0629: \u0645\u0646\u0639\u060c \u062e\u0637\u0631\u060c \u0625\u062c\u0628\u0627\u0631\u060c \u0623\u0648 \u0625\u0631\u0634\u0627\u062f
3. \u0648\u0635\u0641 \u0645\u062e\u062a\u0635\u0631

\u0645\u0647\u0645: \u0623\u062c\u0628 \u0641\u0642\u0637 \u0628\u0627\u0644\u0639\u0631\u0628\u064a\u0629\u060c \u0628\u0627\u0644\u062a\u0646\u0633\u064a\u0642 \u0627\u0644\u062a\u0627\u0644\u064a\u060c \u0639\u0644\u0627\u0645\u0629 \u0648\u0627\u062d\u062f\u0629 \u0641\u064a \u0643\u0644 \u0633\u0637\u0631:
\u0639\u0644\u0627\u0645\u0629: [\u0627\u0633\u0645 \u0627\u0644\u0639\u0644\u0627\u0645\u0629] | \u0641\u0626\u0629: [\u0627\u0644\u0641\u0626\u0629] | \u0648\u0635\u0641: [\u0648\u0635\u0641 \u0642\u0635\u064a\u0631]

\u0625\u0630\u0627 \u0644\u0645 \u062a\u0643\u0646 \u0647\u0646\u0627\u0643 \u0639\u0644\u0627\u0645\u0627\u062a \u0645\u0631\u0648\u0631\u060c \u0623\u062c\u0628: \u0644\u0627_\u0639\u0644\u0627\u0645\u0627\u062a

\u0643\u0646 \u062f\u0642\u064a\u0642\u0627 \u0648\u0634\u0627\u0645\u0644\u0627 \u0641\u064a \u0627\u0644\u0643\u0634\u0641."""


def analyze_image_with_vision(image_base64: str, language: str = "fr") -> str:
    """
    Envoie l'image au modele Groq Vision pour analyse.
    On utilise TOUJOURS le prompt francais car le modele vision
    donne de bien meilleurs resultats en francais.
    La traduction se fait ensuite via le matching avec la base.
    """
    client = get_groq_client()
    # Toujours utiliser le prompt FR pour de meilleurs resultats
    prompt = VISION_PROMPT_FR
    
    response = client.chat.completions.create(
        model=settings.GROQ_VISION_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}",
                        },
                    },
                ],
            }
        ],
        temperature=0.2,
        max_tokens=1024,
    )
    
    return response.choices[0].message.content


def match_vision_to_signs(vision_text: str, language: str = "fr") -> List[Dict]:
    """
    Parse la reponse du modele vision et fait correspondre
    aux panneaux de la base de donnees existante.
    
    Args:
        vision_text: Texte brut retourne par le modele vision
        language: Langue de la detection
        
    Returns:
        Liste de panneaux detectes avec leurs infos completes
    """
    if not vision_text or "AUCUN_PANNEAU" in vision_text.upper() or "\u0644\u0627_\u0639\u0644\u0627\u0645\u0627\u062a" in vision_text:
        return []
    
    detected = []
    seen_ids = set()
    vision_lower = vision_text.lower()
    
    # Strategie: Chercher les mots-cles de chaque panneau dans la reponse vision
    # On cherche dans les DEUX langues pour couvrir tous les cas
    for sign in SIGNS_DATABASE:
        if sign["id"] in seen_ids:
            continue
        
        # Combiner tous les mots-cles des deux langues
        all_keywords = (
            sign.get("keywords_fr", []) +
            sign.get("keywords_ar", [])
        )
        
        found = False
        # Chercher dans tous les mots-cles (FR + AR)
        for kw in all_keywords:
            if kw.lower() in vision_lower:
                found = True
                break
        
        # Chercher aussi par l'ID/nom simplifie du panneau
        if not found:
            simple_names = [
                sign["id"].replace("_", " "),
                sign["name_fr"].lower(),
            ]
            for name in simple_names:
                if name in vision_lower:
                    found = True
                    break
        
        if found:
            seen_ids.add(sign["id"])
            cat = SIGN_CATEGORIES.get(sign["category"], {})
            detected.append({
                "id": sign["id"],
                "name": sign.get(f"name_{language}", sign["name_fr"]),
                "name_fr": sign["name_fr"],
                "name_ar": sign["name_ar"],
                "category": sign["category"],
                "category_label": cat.get(f"label_{language}", cat.get("label_fr", "")),
                "category_emoji": cat.get("emoji", ""),
                "category_color": cat.get("color", "#666"),
                "image": f"/static/signs/{sign['image']}",
            })
    
    return detected


def detect_sign_from_image(
    image_base64: str,
    language: str = "fr",
) -> Dict:
    """
    Pipeline complet de detection de panneaux par image:
    1. Envoie l'image au modele vision Groq
    2. Parse la reponse et match avec la base de panneaux
    3. Retourne les panneaux detectes + la description brute
    
    Args:
        image_base64: Image encodee en base64 (sans le prefixe data:...)
        language: Langue souhaitee ('fr' ou 'ar')
        
    Returns:
        Dict avec signs, description, language
    """
    try:
        # 1. Analyse par le modele vision
        vision_response = analyze_image_with_vision(image_base64, language)
        print(f"\U0001f441 Vision response: {vision_response[:200]}...")
        
        # 2. Matcher avec la base de panneaux
        matched_signs = match_vision_to_signs(vision_response, language)
        
        # 3. Construire la reponse descriptive
        if matched_signs:
            if language == "ar":
                desc = f"\U0001f50d \u062a\u0645 \u0627\u0643\u062a\u0634\u0627\u0641 {len(matched_signs)} \u0639\u0644\u0627\u0645\u0629(\u0627\u062a) \u0645\u0631\u0648\u0631\u064a\u0629 \u0641\u064a \u0627\u0644\u0635\u0648\u0631\u0629:\n\n"
                for s in matched_signs:
                    desc += f"{s['category_emoji']} **{s['name_ar']}** ({s['category_label']})\n"
            else:
                desc = f"\U0001f50d {len(matched_signs)} panneau(x) de signalisation d\u00e9tect\u00e9(s) dans l'image :\n\n"
                for s in matched_signs:
                    desc += f"{s['category_emoji']} **{s['name_fr']}** ({s['category_label']})\n"
        else:
            # Pas de match exact: construire une description traduite
            # a partir de la reponse brute du modele (qui est en FR)
            if language == "ar":
                desc = f"\U0001f50d \u062a\u062d\u0644\u064a\u0644 \u0627\u0644\u0635\u0648\u0631\u0629:\n\n"
                # Essayer de traduire les lignes PANNEAU: en arabe
                for line in vision_response.split('\n'):
                    line = line.strip()
                    if line.startswith('PANNEAU:'):
                        parts = line.split('|')
                        panneau_name = parts[0].replace('PANNEAU:', '').strip() if len(parts) > 0 else ''
                        categorie = parts[1].replace('CATEGORIE:', '').strip() if len(parts) > 1 else ''
                        description = parts[2].replace('DESCRIPTION:', '').strip() if len(parts) > 2 else ''
                        cat_ar = {"interdiction": "\u0645\u0646\u0639", "danger": "\u062e\u0637\u0631", "obligation": "\u0625\u062c\u0628\u0627\u0631", "indication": "\u0625\u0631\u0634\u0627\u062f"}
                        cat_label = cat_ar.get(categorie.lower(), categorie)
                        desc += f"\u26a0\ufe0f **{panneau_name}** ({cat_label})\n{description}\n\n"
                    elif line and 'AUCUN' not in line:
                        desc += line + '\n'
                if desc.strip() == "\U0001f50d \u062a\u062d\u0644\u064a\u0644 \u0627\u0644\u0635\u0648\u0631\u0629:":
                    desc += vision_response
            else:
                desc = f"\U0001f50d Analyse de l'image :\n\n{vision_response}"
        
        return {
            "signs": matched_signs,
            "description": desc,
            "raw_analysis": vision_response,
            "language": language,
            "success": True,
        }
        
    except Exception as e:
        error_msg = {
            "fr": f"\u274c Erreur lors de l'analyse de l'image : {str(e)}",
            "ar": f"\u274c \u062e\u0637\u0623 \u0623\u062b\u0646\u0627\u0621 \u062a\u062d\u0644\u064a\u0644 \u0627\u0644\u0635\u0648\u0631\u0629: {str(e)}",
        }
        return {
            "signs": [],
            "description": error_msg.get(language, error_msg["fr"]),
            "raw_analysis": "",
            "language": language,
            "success": False,
            "error": str(e),
        }
