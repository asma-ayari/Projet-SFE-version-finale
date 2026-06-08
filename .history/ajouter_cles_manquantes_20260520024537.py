#!/usr/bin/env python3
"""
Ajoute les clés i18n manquantes pour les pages 2-7 du cours ID2
"""

import json
from pathlib import Path

# Toutes les clés manquantes pour PAGE_2
PAGE_2_KEYS = {
    "PAGE_2_SUCCESS": "Parfait ! Tous les cercles sont bien placés !",
}

# Toutes les clés pour PAGE_3
PAGE_3_KEYS = {
    "PAGE_3_INSTRUCTION": "Observez attentivement les positions des objets :",
    "PAGE_3_VIEW_1_TITLE": "À travers le pare-brise",
    "PAGE_3_VIEW_1_TEXT": "Vue directe complète devant votre véhicule, piétons et véhicules en approche frontale",
    "PAGE_3_VIEW_2_TITLE": "À travers les rétroviseurs latéraux",
    "PAGE_3_VIEW_2_TEXT": "Véhicules circulant sur les côtés, cyclistes et motards en dépassement",
    "PAGE_3_VIEW_3_TITLE": "À travers le rétroviseur intérieur",
    "PAGE_3_VIEW_3_TEXT": "Trafic circulant derrière le véhicule, véhicules se rapprochant en ligne droite",
    "PAGE_3_VIEW_4_TITLE": "Zones non couvertes",
    "PAGE_3_VIEW_4_TEXT": "Les ANGLES MORTS - zones non visibles par aucun rétroviseur",
}

# Toutes les clés pour PAGE_4
PAGE_4_KEYS = {
    "PAGE_4_ARC_1": "Vue directe (180°)",
    "PAGE_4_ARC_2": "Rétroviseur gauche",
    "PAGE_4_ARC_3": "Rétroviseur droit",
    "PAGE_4_ARC_4": "Rétroviseur intérieur",
    "BLIND_SPOT": "Angle mort",
    "PAGE_4_CARD_1_TITLE": "La vue directe",
    "PAGE_4_CARD_1_TEXT_PREFIX": "Couvre environ",
    "PAGE_4_CARD_1_TEXT_SUFFIX": "de votre champ visuel",
    "PAGE_4_CARD_2_TITLE": "Les vues indirectes",
    "PAGE_4_CARD_2_TEXT_PREFIX": "Les rétroviseurs (gauche, droit et intérieur) ne couvrent",
    "PAGE_4_CARD_2_TEXT_HIGHLIGHT": "PAS COMPLÈTEMENT",
    "PAGE_4_CARD_2_TEXT_SUFFIX": "le champ visuel restant",
    "PAGE_4_CARD_3_TITLE": "Les angles morts",
    "PAGE_4_CARD_3_TEXT_PREFIX": "Les portions restantes non couvertes sont appelées les",
    "PAGE_4_CARD_3_TEXT_HIGHLIGHT": "ANGLES MORTS",
    "PAGE_4_CARD_3_TEXT_SUFFIX": "zones potentiellement dangereuses",
    "PAGE_4_WARNING_TEXT_H2": "camions et bus",
    "PAGE_4_WARNING_TEXT_SUFFIX": "qui en ont beaucoup plus grands",
}

# Toutes les clés pour PAGE_5
PAGE_5_KEYS = {
    "PAGE_5_ZONE_1": "Avant (en bas)",
    "PAGE_5_ZONE_2": "Côté gauche (en bas)",
    "PAGE_5_ZONE_3": "Côté droit (en bas)",
    "PAGE_5_CARD_1_TITLE": "Pour les gros véhicules",
    "PAGE_5_CARD_1_TEXT_PREFIX": "Les angles morts existent aussi",
    "PAGE_5_CARD_1_TEXT_HIGHLIGHT": "EN HAUTEUR",
    "PAGE_5_CARD_1_TEXT_SUFFIX": "particulièrement importants pour camions et bus",
    "PAGE_5_CARD_2_TITLE": "Danger : ce qui peut être caché",
    "PAGE_5_CARD_2_TEXT_H1": "Des enfants petits,",
    "PAGE_5_CARD_2_TEXT_MID": "des piétons de petite taille, ou des objets sur la route en bas du champ de vision du conducteur peuvent être",
    "PAGE_5_CARD_2_TEXT_H2": "complètement invisibles",
    "PAGE_5_CARD_2_TEXT_SUFFIX": "",
    "PAGE_5_TIP": "💡 Conseil : En vous positionnant correctement avant de faire une manœuvre, vous pouvez réduire considérablement le risque d'accident",
}

# Toutes les clés pour PAGE_6
PAGE_6_KEYS = {
    "PAGE_6_INSTRUCTION": "Du fait de ces angles morts, certaines positions autour d'un véhicule sont extrêmement dangereuses :",
    "PAGE_6_SUBINSTRUCTION_HIGHLIGHT": "Survolez chaque scénario pour voir la zone d'angle mort",
    "PAGE_6_SUBINSTRUCTION": "Observez comment un conducteur peut ne pas voir un autre usager",
    "PAGE_6_SCENARIO_1_TITLE": "Avant et sur le côté",
    "PAGE_6_SCENARIO_1_TEXT": "Position très dangereuse : un cycliste ou un scooter entre le véhicule et celui de devant",
    "PAGE_6_SCENARIO_2_TITLE": "Sur le côté",
    "PAGE_6_SCENARIO_2_TEXT": "Position classique d'angle mort : entre les deux véhicules sur le côté",
    "PAGE_6_SCENARIO_3_TITLE": "Derrière",
    "PAGE_6_SCENARIO_3_TEXT": "Position dangereuse : juste derrière le véhicule, pas visible dans les rétroviseurs",
    "PAGE_6_DANGER": "Danger !",
    "PAGE_6_DANGER_2": "Très dangereux !",
}

# Toutes les clés pour PAGE_7
PAGE_7_KEYS = {
    "PAGE_7_LEAD_PREFIX": "LA RÉPONSE EST SIMPLE :",
    "PAGE_7_LEAD_HIGHLIGHT": "Ceux qu'on voit ne nous voient pas toujours",
    "PAGE_7_LEAD_SUFFIX": "à cause des angles morts",
    "PAGE_7_TIPS_TITLE": "Principes fondamentaux à retenir :",
    "PAGE_7_TIP_1_PREFIX": "Pensez que les autres ne vous voient pas toujours -",
    "PAGE_7_TIP_1_HIGHLIGHT": "Évitez les positions à risque !",
    "PAGE_7_TIP_2_HIGHLIGHT": "Vérifiez vos angles morts avant toute manœuvre (head-check) !",
    "PAGE_7_TIP_3_PREFIX": "Réduisez votre vitesse -",
    "PAGE_7_TIP_3_HIGHLIGHT": "Augmentez votre temps de réaction",
    "PAGE_7_TIP_3_SUFFIX": "",
    "PAGE_7_REMINDER": "Avant toute manœuvre, tournez votre tête pour vérifier les zones non couvertes par les rétroviseurs",
    "CONGRATS": "Bravo ! Cours complété",
    "COMPLETED": "Vous avez complété le cours sur les angles morts. Ces connaissances vous aideront à rester en sécurité sur la route.",
}

# Combiner toutes les clés
ALL_KEYS = {}
ALL_KEYS.update(PAGE_2_KEYS)
ALL_KEYS.update(PAGE_3_KEYS)
ALL_KEYS.update(PAGE_4_KEYS)
ALL_KEYS.update(PAGE_5_KEYS)
ALL_KEYS.update(PAGE_6_KEYS)
ALL_KEYS.update(PAGE_7_KEYS)

# Fichiers à mettre à jour
FILES = [
    "c:\\Users\\Asma\\Projet-TEST-main\\frontend\\Plateforme-Securite-Routiere-master\\src\\assets\\i18n\\fr.json",
    "c:\\Users\\Asma\\Projet-TEST-main\\frontend\\Plateforme-Securite-Routiere-master\\src\\public\\i18n\\fr.json",
    "c:\\Users\\Asma\\Projet-TEST-main\\frontend\\Plateforme-Securite-Routiere-master\\public\\i18n\\fr.json",
]

def update_file(file_path):
    """Met à jour un fichier i18n avec les clés manquantes"""
    try:
        p = Path(file_path)
        if not p.exists():
            return f"❌ Fichier non trouvé: {file_path}"
        
        # Charger le JSON
        with open(p, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Ajouter les clés dans COURSE_DETAIL_ID2
        if "COURSE_DETAIL_ID2" not in data:
            data["COURSE_DETAIL_ID2"] = {}
        
        added = 0
        for key, value in ALL_KEYS.items():
            if key not in data["COURSE_DETAIL_ID2"]:
                data["COURSE_DETAIL_ID2"][key] = value
                added += 1
        
        # Sauvegarder
        with open(p, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        return f"✅ {added} clés ajoutées à {file_path}"
    
    except Exception as e:
        return f"❌ Erreur dans {file_path}: {str(e)}"

if __name__ == "__main__":
    print("\n" + "="*70)
    print("  AJOUTER LES CLÉS i18n MANQUANTES - COURS ID2")
    print("="*70 + "\n")
    
    print(f"📝 {len(ALL_KEYS)} clés à ajouter\n")
    
    for file_path in FILES:
        result = update_file(file_path)
        print(result)
    
    print("\n" + "="*70)
    print("  ✅ CLÉS MANQUANTES AJOUTÉES!")
    print("="*70)
