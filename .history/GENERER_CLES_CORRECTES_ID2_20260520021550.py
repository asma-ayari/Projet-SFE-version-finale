#!/usr/bin/env python3
"""
Script pour générer les BONNES clés i18n pour le cours ID2 (Angles morts)
Basé sur la structure HTML RÉELLE du composant apprenant/cours-detail.html
"""

import json
from pathlib import Path

# ============================================================================
# DONNÉES DU COURS - Extraites du course-2-angles-morts.ts
# ============================================================================

COURSE_CONTENT = {
    "PAGE_1": {
        "NUMBER": "Page 1/7",
        "TITLE": "Pourquoi ceux qu'on voit ne nous voient pas toujours ?",
        "LEAD": "L'une des situations les plus dangereuses sur la route est de ne pas être vu par un autre conducteur.",
        "INTRO": "Vous pouvez voir clairement un autre véhicule, un cycliste ou un piéton, mais celui-ci peut ne pas vous voir à cause des angles morts du véhicule qui l'observe.",
        "ITEM_1": "Suis-je visible pour les autres conducteurs ?",
        "ITEM_2": "Quelles sont les zones dangereuses autour des véhicules ?",
        "ITEM_3": "Comment puis-je réduire ce risque ?",
        "ITEM_4": "Comprendre les angles morts du véhicule",
    },
    "PAGE_2": {
        "NUMBER": "Page 2/7",
        "TITLE": "Champ de vision du conducteur",
        "INSTRUCTION": "Visualisez le champ de vision d'un conducteur en plaçant des marqueurs sur son environnement :",
        "LEGEND_1": "<strong>🟢 VUE DIRECTE</strong> (par le pare-brise)",
        "LEGEND_2": "<strong>🟡 VUE TIROIR</strong> (rétroviseur gauche)",
        "LEGEND_3": "<strong>🟣 VUE INTÉRIEURE</strong> (rétroviseur intérieur)",
        "LEGEND_4": "<strong>🟠 VUE EXTÉRIEURE</strong> (rétroviseur droit)",
        "ZONE_1": "Vue directe",
        "ZONE_2": "Rétroviseur gauche",
        "ZONE_3": "Rétroviseur intérieur",
        "ZONE_4": "Rétroviseur droit",
        "BANK_TITLE": "Glissez les cercles vers les zones",
        "SUCCESS": "Parfait ! Tous les cercles sont bien placés !",
        "RESET": "Réinitialiser",
    },
    "PAGE_3": {
        "NUMBER": "Page 3/7",
        "TITLE": "Observation du champ visuel complet",
        "INSTRUCTION": "Observez attentivement les positions des objets :",
        "VIEW_1_TITLE": "À travers le pare-brise",
        "VIEW_1_TEXT": "Vue directe complète devant votre véhicule, piétons et véhicules en approche frontale",
        "VIEW_2_TITLE": "À travers les rétroviseurs latéraux",
        "VIEW_2_TEXT": "Véhicules circulant sur les côtés, cyclistes et motards en dépassement",
        "VIEW_3_TITLE": "À travers le rétroviseur intérieur",
        "VIEW_3_TEXT": "Trafic circulant derrière le véhicule, véhicules se rapprochant en ligne droite",
        "VIEW_4_TITLE": "Zones non couvertes",
        "VIEW_4_TEXT": "Les ANGLES MORTS - zones non visibles par aucun rétroviseur",
    },
    "PAGE_4": {
        "NUMBER": "Page 4/7",
        "TITLE": "Définition et zones des angles morts",
        "ARC_1": "Vue directe (180°)",
        "ARC_2": "Rétroviseur gauche",
        "ARC_3": "Rétroviseur droit",
        "ARC_4": "Rétroviseur intérieur",
        "BLIND_SPOT": "Angle mort",
        "CARD_1_TITLE": "La vue directe",
        "CARD_1_TEXT_PREFIX": "Couvre environ",
        "CARD_1_TEXT_SUFFIX": "de votre champ visuel",
        "CARD_2_TITLE": "Les vues indirectes",
        "CARD_2_TEXT_PREFIX": "Les rétroviseurs (gauche, droit et intérieur) ne couvrent",
        "CARD_2_TEXT_HIGHLIGHT": "PAS COMPLÈTEMENT",
        "CARD_2_TEXT_SUFFIX": "le champ visuel restant",
        "CARD_3_TITLE": "Les angles morts",
        "CARD_3_TEXT_PREFIX": "Les portions restantes non couvertes sont appelées les",
        "CARD_3_TEXT_HIGHLIGHT": "ANGLES MORTS",
        "CARD_3_TEXT_SUFFIX": "zones potentiellement dangereuses",
        "WARNING_TITLE": "Attention aux différences de véhicules",
        "WARNING_TEXT_PREFIX": "Tous les véhicules n'ont pas les mêmes angles morts. Les",
        "WARNING_TEXT_H1": "voitures particulières",
        "WARNING_TEXT_MID": "ont des angles morts différents des",
        "WARNING_TEXT_H2": "camions et bus",
        "WARNING_TEXT_SUFFIX": "qui en ont beaucoup plus grands",
    },
    "PAGE_5": {
        "NUMBER": "Page 5/7",
        "TITLE": "Angles morts : hauteur et proximité",
        "ZONE_1": "Avant (en bas)",
        "ZONE_2": "Côté gauche (en bas)",
        "ZONE_3": "Côté droit (en bas)",
        "CARD_1_TITLE": "Pour les gros véhicules",
        "CARD_1_TEXT_PREFIX": "Les angles morts existent aussi",
        "CARD_1_TEXT_HIGHLIGHT": "EN HAUTEUR",
        "CARD_1_TEXT_SUFFIX": "particulièrement importants pour camions et bus",
        "CARD_2_TITLE": "Danger : ce qui peut être caché",
        "CARD_2_TEXT_H1": "Des enfants petits,",
        "CARD_2_TEXT_MID": "des piétons de petite taille, ou des objets sur la route en bas du champ de vision du conducteur peuvent être",
        "CARD_2_TEXT_H2": "complètement invisibles",
        "CARD_2_TEXT_SUFFIX": "",
        "TIP": "💡 Conseil : En vous positionnant correctement avant de faire une manœuvre, vous pouvez réduire considérablement le risque d'accident",
    },
    "PAGE_6": {
        "NUMBER": "Page 6/7",
        "TITLE": "Positions à risque autour des véhicules",
        "INSTRUCTION": "Du fait de ces angles morts, certaines positions autour d'un véhicule sont extrêmement dangereuses :",
        "SUBINSTRUCTION_HIGHLIGHT": "Survolez chaque scénario pour voir la zone d'angle mort",
        "SUBINSTRUCTION": "Observez comment un conducteur peut ne pas voir un autre usager",
        "SCENARIO_1_TITLE": "Avant et sur le côté",
        "SCENARIO_1_TEXT": "Position très dangereuse : un cycliste ou un scooter entre le véhicule et celui de devant",
        "SCENARIO_2_TITLE": "Sur le côté",
        "SCENARIO_2_TEXT": "Position classique d'angle mort : entre les deux véhicules sur le côté",
        "SCENARIO_3_TITLE": "Derrière",
        "SCENARIO_3_TEXT": "Position dangereuse : juste derrière le véhicule, pas visible dans les rétroviseurs",
        "DANGER": "Danger !",
        "DANGER_2": "Très dangereux !",
    },
    "PAGE_7": {
        "NUMBER": "Page 7/7",
        "TITLE": "Conclusion : Éviter les accidents dus aux angles morts",
        "LEAD_PREFIX": "LA RÉPONSE EST SIMPLE :",
        "LEAD_HIGHLIGHT": "Ceux qu'on voit ne nous voient pas toujours",
        "LEAD_SUFFIX": "à cause des angles morts",
        "TIPS_TITLE": "Principes fondamentaux à retenir :",
        "TIP_1_PREFIX": "Pensez que les autres ne vous voient pas toujours -",
        "TIP_1_HIGHLIGHT": "Évitez les positions à risque !",
        "TIP_2_HIGHLIGHT": "Vérifiez vos angles morts avant toute manœuvre (head-check) !",
        "TIP_3_PREFIX": "Réduisez votre vitesse -",
        "TIP_3_HIGHLIGHT": "Augmentez votre temps de réaction",
        "TIP_3_SUFFIX": "",
        "REMINDER": "Avant toute manœuvre, tournez votre tête pour vérifier les zones non couvertes par les rétroviseurs",
        "CONGRATS": "Bravo ! Cours complété",
        "COMPLETED": "Vous avez complété le cours sur les angles morts. Ces connaissances vous aideront à rester en sécurité sur la route.",
    },
}

# ============================================================================
# GÉNÉRER LES CLÉS I18N
# ============================================================================

def generate_i18n_keys():
    """Génère toutes les clés i18n pour le cours ID2"""
    keys = {}
    
    for page_num, page_data in COURSE_CONTENT.items():
        page_num_int = int(page_num.split("_")[1])
        prefix = f"PAGE_{page_num_int}"
        
        for key, value in page_data.items():
            full_key = f"{prefix}_{key}"
            keys[full_key] = value
    
    return keys

# ============================================================================
# CHARGER ET METTRE À JOUR LES FICHIERS i18n
# ============================================================================

def update_i18n_files(new_keys):
    """Met à jour les fichiers i18n avec les nouvelles clés"""
    
    base_path = Path(__file__).parent / "frontend" / "Plateforme-Securite-Routiere-master" / "src" / "assets" / "i18n"
    public_path = Path(__file__).parent / "frontend" / "Plateforme-Securite-Routiere-master" / "public" / "i18n"
    
    files_to_update = [
        (base_path / "fr.json", "src/assets/i18n"),
        (base_path / "ar.json", "src/assets/i18n"),
        (public_path / "fr.json", "public/i18n"),
        (public_path / "ar.json", "public/i18n"),
    ]
    
    results = {"success": [], "error": []}
    
    for file_path, location in files_to_update:
        try:
            if not file_path.exists():
                results["error"].append(f"❌ Fichier non trouvé: {file_path}")
                continue
            
            # Créer backup
            backup_path = file_path.parent / f"{file_path.name}.backup"
            if not backup_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    backup_content = f.read()
                with open(backup_path, 'w', encoding='utf-8') as f:
                    f.write(backup_content)
                results["success"].append(f"✅ Backup créé: {backup_path.name}")
            
            # Charger le fichier i18n
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # SUPPRIMER les anciennes clés incorrectes PAGE_3_POINT_*, PAGE_4_*, etc.
            removed_count = 0
            keys_to_remove = []
            for key in data.keys():
                if key.startswith("PAGE_3_POINT_") or \
                   key.startswith("PAGE_4_POINT_") or \
                   key.startswith("PAGE_5_POINT_") or \
                   key.startswith("PAGE_5_SITUATION_") or \
                   key.startswith("PAGE_5_ZONE_") or \
                   key.startswith("PAGE_5_CARD_") or \
                   key.startswith("PAGE_5_TIP_") or \
                   key.startswith("PAGE_6_PRINCIPLE_") or \
                   key.startswith("PAGE_7_PRINCIPLE_") or \
                   key.startswith("PAGE_7_TIP_") or \
                   key.startswith("PAGE_7_SITUATION_"):
                    keys_to_remove.append(key)
                    removed_count += 1
            
            for key in keys_to_remove:
                del data[key]
            
            if removed_count > 0:
                results["success"].append(f"🗑️  {removed_count} anciennes clés supprimées dans {location}")
            
            # Ajouter les BONNES clés
            for key, value in new_keys.items():
                if key.startswith(("PAGE_3_", "PAGE_4_", "PAGE_5_", "PAGE_6_", "PAGE_7_")):
                    full_key = f"COURSE_DETAIL_ID2.{key}"
                    
                    if "ar.json" in str(file_path):
                        # Pour l'arabe, ajouter un marqueur [AR]
                        data[full_key] = f"[AR] {value}"
                    else:
                        # Pour le français, utiliser la valeur réelle
                        data[full_key] = value
            
            # Sauvegarder
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            # Compter les clés ajoutées
            added = len([k for k in new_keys.keys() if k.startswith(("PAGE_3_", "PAGE_4_", "PAGE_5_", "PAGE_6_", "PAGE_7_"))])
            results["success"].append(f"✅ {added} nouvelles clés ajoutées dans {location}")
        
        except Exception as e:
            results["error"].append(f"❌ Erreur dans {location}: {str(e)}")
    
    return results

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    print("\n" + "="*70)
    print("  GÉNÉRATION DES BONNES CLÉS I18N - COURS ID2 (Angles morts)")
    print("="*70 + "\n")
    
    # Générer les clés
    print("📝 Génération des clés i18n...")
    new_keys = generate_i18n_keys()
    print(f"✅ {len(new_keys)} clés générées\n")
    
    # Afficher un aperçu
    print("📋 Aperçu des clés (pages 3-7):")
    for page in [3, 4, 5, 6, 7]:
        page_keys = {k: v for k, v in new_keys.items() if k.startswith(f"PAGE_{page}_")}
        print(f"   Page {page}: {len(page_keys)} clés")
    print()
    
    # Mettre à jour les fichiers
    print("💾 Mise à jour des fichiers i18n...")
    results = update_i18n_files(new_keys)
    
    print("\n✅ SUCCÈS:")
    for msg in results["success"]:
        print(f"   {msg}")
    
    if results["error"]:
        print("\n❌ ERREURS:")
        for msg in results["error"]:
            print(f"   {msg}")
    
    print("\n" + "="*70)
    print("  ✅ CLÉS CORRECTES GÉNÉRÉES ET SYNCHRONISÉES!")
    print("="*70 + "\n")
    print("⚠️  Prochaines étapes:")
    print("   1. npm start  (redémarrer Angular)")
    print("   2. Ctrl+Shift+Delete  (vider le cache)")
    print("   3. Tester à http://localhost:4200/apprenant/cours/2\n")
