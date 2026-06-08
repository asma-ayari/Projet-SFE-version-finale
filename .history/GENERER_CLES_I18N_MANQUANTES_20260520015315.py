#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Générateur automatique de clés i18n manquantes pour les cours Formateur
Analyse le contenu réel des cours et génère les clés i18n correspondantes
"""

import json
import re
from pathlib import Path

# Chemins des fichiers
BASE_DIR = Path(__file__).parent
ASSETS_DIR = BASE_DIR / "frontend/Plateforme-Securite-Routiere-master/src/assets"
I18N_DIR = ASSETS_DIR / "i18n"

FR_JSON_PATH = I18N_DIR / "fr.json"
AR_JSON_PATH = I18N_DIR / "ar.json"
PUBLIC_FR_PATH = ASSETS_DIR.parent / "public/i18n/fr.json"
PUBLIC_AR_PATH = ASSETS_DIR.parent / "public/i18n/ar.json"

# Contenu simplifié pour tester
COURSE_2_PAGE_2_CONTENT = """Page 2/7

Visualisez le champ de vision d'un conducteur en plaçant des marqueurs sur son environnement :

🟢 VUE DIRECTE (par le pare-brise)
- Zone centrale et périphérique
- Couvre environ 180°

🟡 VUE TIROIR (rétroviseur gauche)
- Première zone latérale
- Vue indirecte limitée

🟣 VUE INTÉRIEURE (rétroviseur intérieur)
- Vue arrière du véhicule
- Zone centrale derrière vous

🟠 VUE EXTÉRIEURE (rétroviseur droit)
- Deuxième zone latérale
- Vue indirecte limitée

⚠️ IMPORTANT : Même avec tous ces rétroviseurs, il reste des zones invisibles - ce sont les ANGLES MORTS !"""

def extraire_elements(content):
    """Extrait les éléments du contenu (instructions, légendes, zones)"""
    elements = {}
    
    # Extraire l'instruction (1er paragraphe)
    lignes = content.split('\n')
    instruction = ""
    for ligne in lignes[1:]:  # Sauter la ligne Page X/Y
        if ligne.strip() and not ligne.startswith(('🟢', '🟡', '🟣', '🟠', '🔴', '🟠', '-', '⚠️')):
            instruction = ligne.strip()
            break
    
    if instruction:
        elements['instruction'] = instruction
    
    # Extraire les légendes (lignes avec emojis)
    legend_num = 1
    for ligne in lignes:
        if ligne.startswith(('🟢', '🟡', '🟣', '🟠', '🔴', '⚠️')):
            texte = ligne.replace('🟢', '').replace('🟡', '').replace('🟣', '').replace('🟠', '').replace('🔴', '').replace('⚠️', '').strip()
            if texte:
                elements[f'legend_{legend_num}'] = texte
                legend_num += 1
    
    # Extraire les zones (bullet points sous les emojis)
    zone_num = 1
    for i, ligne in enumerate(lignes):
        if ligne.startswith(('🟢', '🟡', '🟣', '🟠', '🔴', '⚠️')):
            # Chercher les bullet points qui suivent
            j = i + 1
            while j < len(lignes) and lignes[j].startswith('-'):
                zone_text = lignes[j].replace('-', '').strip()
                if zone_text:
                    elements[f'zone_{zone_num}'] = zone_text
                    zone_num += 1
                j += 1
    
    return elements

def charger_json(path):
    """Charge un fichier JSON"""
    if path.exists():
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def sauvegarder_json(path, data):
    """Sauvegarde un fichier JSON"""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def generer_cles_manquantes():
    """Génère les clés i18n manquantes"""
    
    print("🔍 Analyse du contenu des cours...")
    print(f"📂 Fichier i18n: {FR_JSON_PATH}")
    
    # Charger les fichiers JSON
    fr_data = charger_json(FR_JSON_PATH)
    ar_data = charger_json(AR_JSON_PATH)
    
    # Test avec le contenu du cours 2, page 2
    print("\n📊 Extraction du contenu du cours ID2, PAGE 2...")
    elements = extraire_elements(COURSE_2_PAGE_2_CONTENT)
    
    print(f"✅ Éléments trouvés:")
    for key, value in elements.items():
        print(f"   - {key}: {value[:50]}...")
    
    # Ajouter les clés manquantes pour ID2, PAGE 2
    if "COURSE_DETAIL_ID2" not in fr_data:
        fr_data["COURSE_DETAIL_ID2"] = {}
    
    # Ajouter les clés de PAGE 2
    page_prefix = "PAGE_2"
    
    # Ajouter instruction
    if f"{page_prefix}_INSTRUCTION" not in fr_data["COURSE_DETAIL_ID2"]:
        fr_data["COURSE_DETAIL_ID2"][f"{page_prefix}_INSTRUCTION"] = elements.get('instruction', "[AR] PAGE 2 - INSTRUCTION")
        print(f"✨ Ajouté: {page_prefix}_INSTRUCTION")
    
    # Ajouter légendes
    for i in range(1, 10):
        key = f"{page_prefix}_LEGEND_{i}"
        if f"legend_{i}" in elements and key not in fr_data["COURSE_DETAIL_ID2"]:
            fr_data["COURSE_DETAIL_ID2"][key] = elements[f"legend_{i}"]
            print(f"✨ Ajouté: {key}")
    
    # Ajouter zones
    for i in range(1, 15):
        key = f"{page_prefix}_ZONE_{i}"
        if f"zone_{i}" in elements and key not in fr_data["COURSE_DETAIL_ID2"]:
            fr_data["COURSE_DETAIL_ID2"][key] = elements[f"zone_{i}"]
            print(f"✨ Ajouté: {key}")
    
    # Ajouter un titre de banque (pour compléter l'image)
    if "PAGE_2_BANK_TITLE" not in fr_data["COURSE_DETAIL_ID2"]:
        fr_data["COURSE_DETAIL_ID2"]["PAGE_2_BANK_TITLE"] = "IMPORTANT : Même avec tous les rétroviseurs..."
        print("✨ Ajouté: PAGE_2_BANK_TITLE")
    
    if "RESET" not in fr_data["COURSE_DETAIL_ID2"]:
        fr_data["COURSE_DETAIL_ID2"]["RESET"] = "RÉINITIALISER"
        print("✨ Ajouté: RESET")
    
    # Synchroniser avec ar.json
    if "COURSE_DETAIL_ID2" not in ar_data:
        ar_data["COURSE_DETAIL_ID2"] = {}
    
    for key, value in fr_data["COURSE_DETAIL_ID2"].items():
        if key not in ar_data["COURSE_DETAIL_ID2"]:
            # Ajouter le marqueur [AR] pour indiquer que c'est à traduire
            if "[AR]" not in str(value):
                ar_data["COURSE_DETAIL_ID2"][key] = f"[AR] {value[:50]}..."
            else:
                ar_data["COURSE_DETAIL_ID2"][key] = value
    
    # Sauvegarder les fichiers
    print("\n💾 Sauvegarde des fichiers...")
    
    # Créer les backups
    if FR_JSON_PATH.exists():
        backup_path = FR_JSON_PATH.with_suffix('.json.backup')
        with open(FR_JSON_PATH, 'r', encoding='utf-8') as src:
            with open(backup_path, 'w', encoding='utf-8') as dst:
                dst.write(src.read())
        print(f"✅ Backup créé: {backup_path.name}")
    
    if AR_JSON_PATH.exists():
        backup_path = AR_JSON_PATH.with_suffix('.json.backup')
        with open(AR_JSON_PATH, 'r', encoding='utf-8') as src:
            with open(backup_path, 'w', encoding='utf-8') as dst:
                dst.write(src.read())
        print(f"✅ Backup créé: {backup_path.name}")
    
    # Sauvegarder les fichiers i18n
    sauvegarder_json(FR_JSON_PATH, fr_data)
    print(f"✅ {FR_JSON_PATH.name} mis à jour")
    
    sauvegarder_json(AR_JSON_PATH, ar_data)
    print(f"✅ {AR_JSON_PATH.name} mis à jour")
    
    # Copier vers public
    try:
        sauvegarder_json(PUBLIC_FR_PATH, fr_data)
        print(f"✅ public/i18n/fr.json synchronisé")
    except Exception as e:
        print(f"⚠️  Impossible de copier vers public/i18n: {e}")
    
    try:
        sauvegarder_json(PUBLIC_AR_PATH, ar_data)
        print(f"✅ public/i18n/ar.json synchronisé")
    except Exception as e:
        print(f"⚠️  Impossible de copier vers public/i18n: {e}")
    
    # Rapport final
    print("\n" + "="*60)
    print("📊 RAPPORT DE GÉNÉRATION")
    print("="*60)
    print(f"✅ Clés générées pour COURSE_DETAIL_ID2")
    print(f"✅ Clés synchronisées vers ar.json")
    print(f"✅ Backups créés avec succès")
    print("\n🚀 PROCHAINES ÉTAPES:")
    print("1. Redémarrer le serveur Angular: npm start")
    print("2. Vider le cache: F12 → Application → Clear Site Data")
    print("3. Tester: http://localhost:4200/formateur/cours/2/voir")
    print("\n✨ Les clés i18n devraient maintenant s'afficher correctement!")

if __name__ == "__main__":
    try:
        generer_cles_manquantes()
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
