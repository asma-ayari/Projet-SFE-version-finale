#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Générateur complet de clés i18n pour COURSE_DETAIL_ID2 (pages 3-7)
Extrait le contenu réel des pages et génère les clés manquantes
"""

import json
import re
from pathlib import Path

# Chemins
BASE_DIR = Path(__file__).parent
I18N_DIR = BASE_DIR / "frontend/Plateforme-Securite-Routiere-master/src/assets/i18n"
FR_JSON_PATH = I18N_DIR / "fr.json"
AR_JSON_PATH = I18N_DIR / "ar.json"
PUBLIC_I18N = BASE_DIR / "frontend/Plateforme-Securite-Routiere-master/public/i18n"

# Contenu des pages 3-7 du cours 2
PAGES_CONTENT = {
    3: {
        "title": "Observation du champ visuel complet",
        "lead": "Observez attentivement les positions des objets :",
        "content": """À travers le pare-brise :
✓ Vue directe complète devant votre véhicule
✓ Piétons et véhicules en approche frontale
✓ Obstacles sur la route

À travers les rétroviseurs latéraux (gauche et droit) :
✓ Véhicules circulant sur les côtés
✓ Cyclistes et motards en dépassement
✓ Lignes d'autres voies

À travers le rétroviseur intérieur :
✓ Trafic circulant derrière le véhicule
✓ Véhicules se rapprochant en ligne droite

🔍 CEPENDANT, certaines zones ne sont couvertes par aucun rétroviseur = ANGLES MORTS"""
    },
    4: {
        "title": "Définition et zones des angles morts",
        "lead": "Un angle mort est une zone autour de votre véhicule que vous ne pouvez pas voir",
        "content": """🎯 QU'EST-CE QU'UN ANGLE MORT ?

Un angle mort est une zone autour de votre véhicule que vous ne pouvez pas voir par :
1. La vue directe (par le pare-brise)
2. La vue périphérique effective
3. Les rétroviseurs intérieur et extérieurs

📊 COUVERTURE VISUELLE TOTALE

La vue directe (centrale et périphérique) couvre 180°.
Les vues indirectes depuis les rétroviseurs intérieur et extérieurs NE COMPLÈTENT PAS ENTIÈREMENT le champ visuel.

Les portions restantes sont appelées les ANGLES MORTS - des zones aveugles potentiellement dangereuses.

⚠️ ATTENTION AUX DIFFÉRENCES DE VÉHICULES

Tous les véhicules ne sont pas équipés de la même façon :
• Les voitures particulières : ont un rétroviseur intérieur
• Les camions, bus et plupart des utilitaires : N'ONT PAS de rétroviseur intérieur
• Les camions et bus : angles morts BEAUCOUP PLUS IMPORTANTS

Les gros véhicules sont particulièrement dangereux en raison de leurs énormes angles morts !"""
    },
    5: {
        "title": "Angles morts : hauteur et proximité",
        "lead": "Les angles morts existent aussi EN HAUTEUR !",
        "content": """📍 ANGLES MORTS VERTICAUX

Particulièrement importants pour :
✓ Les camions et bus (hauteur de 3-4 mètres)
✓ Les grands SUV et 4x4
✓ Les véhicules commerciaux

Zones dangereuses :
✓ Devant le capot du véhicule - pas de visibilité jusqu'à plusieurs mètres
✓ Sur les côtés du véhicule - surtout au niveau des roues
✓ Derrière le véhicule

Ce qui peut être caché par ces angles morts :
• Des enfants petits (moins de 1,30m)
• Des cyclistes en position basse
• Des motocyclistes
• Des piétons près du trottoir
• Des animaux domestiques
• Des objets bas sur la route

⚠️ CONSÉQUENCE DIRECTE :

Le conducteur du grand véhicule ne peut pas voir :
- Ce qui est proche de son véhicule
- Ce qui est devant son capot sur plusieurs mètres
- Ce qui est immédiatement sur les côtés au niveau des roues

Une collision est possible sans que le conducteur ait jamais vu la victime !"""
    },
    6: {
        "title": "Positions à risque autour des véhicules",
        "lead": "Du fait de ces angles morts, plusieurs positions relatives sont EXTRÊMEMENT À RISQUE",
        "content": """Voici trois exemples critiques à ABSOLUMENT ÉVITER :

📌 SITUATION 1 : Avant le véhicule (en stationnement ou à l'arrêt)
- Caché par le capot et les zones proches
- Impossible à voir même en regardant devant
- Risque très élevé lors d'une manœuvre avant

📌 SITUATION 2 : Côté du véhicule (au niveau des roues)
- Caché par le volume du véhicule
- Invisible dans les rétroviseurs latéraux
- Très dangereux lors d'un changement de voie
- Particulièrement critique pour les gros véhicules

📌 SITUATION 3 : Derrière le véhicule (si arrêt subit)
- Caché par la partie arrière
- Invisible dans le rétroviseur intérieur s'il y a des passagers
- Risque lors d'une marche arrière

⚡ DANS CHACUN DE CES CAS, LE CONDUCTEUR NE PEUT PAS VOIR LES DEUX-ROUES (OU AUTRES USAGERS)

Dangers spécifiques pour les deux-roues :
✓ Accélération rapide ignorée du conducteur
✓ Dépourvu de protection en cas de collision
✓ Très vulnérables

LA RÈGLE D'OR : Ne jamais rester dans les angles morts d'un autre véhicule !"""
    },
    7: {
        "title": "Conclusion : Éviter les accidents dus aux angles morts",
        "lead": "La réponse est simple et scientifique",
        "content": """🎯 RÉSUMÉ : POURQUOI CEUX QU'ON VOIT NE NOUS VOIENT PAS TOUJOURS ?

Les rétroviseurs (intérieur et extérieurs) NE reflètent pas entièrement les vues latérales et arrières. Il reste toujours des zones invisibles - LES ANGLES MORTS.

Aucun système de rétroviseur conventionnel n'offre une vision à 360° de l'environnement du véhicule.

✅ PRINCIPES FONDAMENTAUX À RETENIR :

1️⃣ PENSEZ QUE LES AUTRES NE VOUS VOIENT PAS TOUJOURS
- Même si vous les voyez, l'inverse n'est pas certain
- Soyez prévisible dans vos mouvements
- Ne prenez pas de risques inutiles

2️⃣ ÉVITEZ LES POSITIONS À RISQUE
- Ne restez pas longtemps dans les angles morts
- Dépassez rapidement pour ne pas rester caché
- Soyez particulièrement prudent avec les gros véhicules

3️⃣ SIGNALISATION ET VÉRIFICATION
- Utilisez toujours vos clignotants pour signaler votre intention
- Donnez aux autres conducteurs le temps de réagir
- Ne supposez jamais être vu

4️⃣ VÉRIFICATION VISUELLE ACTIVE
- Quand vous changez de direction, tournez RAPIDEMENT LA TÊTE
- Effectuez une vérification par-dessus l'épaule
- Assurez-vous qu'aucun véhicule n'arrive dans l'angle mort

5️⃣ RÉDUCTION DE LA VITESSE
- Ralentissez en zones à risque élevé
- Roulez moins vite près des gros véhicules
- Laissez-vous plus de temps pour réagir

6️⃣ SOYEZ CONSCIENT DE VOS PROPRES ANGLES MORTS
- Vous aussi, vous avez des zones invisibles
- Tournez la tête pour vérifier avant chaque manœuvre
- Signalez vos intentions clairement

⚠️ FAITS ALARMANTS :

• Les angles morts sont impliqués dans 8-10% de tous les accidents de la route
• Les enfants et personnes âgées sont les victimes prioritaires
• Les deux-roues (motos, scooters, vélos) sont sur-représentés dans ces accidents
• Les gros véhicules commerciaux sont responsables de nombreux décès

💡 VOTRE RESPONSABILITÉ :

En tant que conducteur, vous avez la responsabilité de :
✓ Connaître vos angles morts
✓ Adapter votre conduite
✓ Ne jamais supposer être vu
✓ Tourner la tête avant chaque changement de direction
✓ Respecter les autres usagers de la route

La sécurité routière commence par la compréhension des angles morts et l'adoption de comportements défensifs !"""
    }
}

def extraire_points(content):
    """Extrait les points pucés du contenu"""
    points = []
    for ligne in content.split('\n'):
        if ligne.strip().startswith(('✓', '•', '-')) and ligne.strip():
            texte = ligne.strip()
            # Enlever le pucé
            texte = re.sub(r'^[✓•\-]\s*', '', texte).strip()
            if texte:
                points.append(texte)
    return points

def extraire_situations(content):
    """Extrait les situations (📌 SITUATION)"""
    situations = []
    pattern = r'📌\s*([^:]+):\s*(.+?)(?=📌|⚡|💡|$)'
    matches = re.findall(pattern, content, re.DOTALL)
    for titre, texte in matches:
        situations.append(titre.strip())
    return situations

def generer_cles_page(page_num, content):
    """Génère les clés pour une page"""
    cles = {}
    page_prefix = f"PAGE_{page_num}"
    
    # Clés de base
    cles[f"{page_prefix}_NUMBER"] = f"Page {page_num}/7"
    cles[f"{page_prefix}_TITLE"] = PAGES_CONTENT[page_num]["title"]
    cles[f"{page_prefix}_LEAD"] = PAGES_CONTENT[page_num]["lead"]
    
    # Extraire les points
    points = extraire_points(content)
    for i, point in enumerate(points, 1):
        cles[f"{page_prefix}_POINT_{i}"] = point
    
    # Extraire les situations (pour page 6 et 7)
    if page_num in [6, 7]:
        situations = extraire_situations(content)
        for i, sit in enumerate(situations, 1):
            cles[f"{page_prefix}_SITUATION_{i}"] = sit
    
    # Ajouter des points clés importants
    if page_num == 7:
        cles[f"{page_prefix}_PRINCIPLE_1"] = "PENSEZ QUE LES AUTRES NE VOUS VOIENT PAS TOUJOURS"
        cles[f"{page_prefix}_PRINCIPLE_2"] = "ÉVITEZ LES POSITIONS À RISQUE"
        cles[f"{page_prefix}_PRINCIPLE_3"] = "SIGNALISATION ET VÉRIFICATION"
        cles[f"{page_prefix}_PRINCIPLE_4"] = "VÉRIFICATION VISUELLE ACTIVE"
        cles[f"{page_prefix}_PRINCIPLE_5"] = "RÉDUCTION DE LA VITESSE"
        cles[f"{page_prefix}_PRINCIPLE_6"] = "SOYEZ CONSCIENT DE VOS PROPRES ANGLES MORTS"
    
    return cles

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

def generer_cles_pages_3_a_7():
    """Génère toutes les clés pour les pages 3-7"""
    
    print("🔄 GÉNÉRATION DES CLÉS POUR PAGES 3-7")
    print("=" * 60)
    
    # Charger les fichiers JSON
    fr_data = charger_json(FR_JSON_PATH)
    ar_data = charger_json(AR_JSON_PATH)
    
    # S'assurer que COURSE_DETAIL_ID2 existe
    if "COURSE_DETAIL_ID2" not in fr_data:
        fr_data["COURSE_DETAIL_ID2"] = {}
    if "COURSE_DETAIL_ID2" not in ar_data:
        ar_data["COURSE_DETAIL_ID2"] = {}
    
    total_cles_ajoutees = 0
    
    # Générer les clés pour chaque page
    for page_num in range(3, 8):
        print(f"\n📄 Page {page_num}/7: {PAGES_CONTENT[page_num]['title']}")
        print("-" * 60)
        
        content = PAGES_CONTENT[page_num]["content"]
        cles_page = generer_cles_page(page_num, content)
        
        # Ajouter les clés à fr.json
        for cle, valeur in cles_page.items():
            if cle not in fr_data["COURSE_DETAIL_ID2"]:
                fr_data["COURSE_DETAIL_ID2"][cle] = valeur
                total_cles_ajoutees += 1
                print(f"   ✨ {cle}")
        
        print(f"   → {len(cles_page)} clés pour cette page")
    
    print(f"\n✅ Total clés ajoutées: {total_cles_ajoutees}")
    
    # Synchroniser avec ar.json
    print("\n🔄 Synchronisation ar.json...")
    for cle, valeur in fr_data["COURSE_DETAIL_ID2"].items():
        if cle not in ar_data["COURSE_DETAIL_ID2"]:
            ar_data["COURSE_DETAIL_ID2"][cle] = f"[AR] {valeur[:50]}..." if len(str(valeur)) > 50 else f"[AR] {valeur}"
    
    # Créer les backups
    print("\n💾 Création des backups...")
    if FR_JSON_PATH.exists():
        backup_fr = FR_JSON_PATH.with_suffix('.json.backup')
        with open(FR_JSON_PATH, 'r', encoding='utf-8') as src:
            with open(backup_fr, 'w', encoding='utf-8') as dst:
                dst.write(src.read())
        print(f"   ✅ {backup_fr.name}")
    
    if AR_JSON_PATH.exists():
        backup_ar = AR_JSON_PATH.with_suffix('.json.backup')
        with open(AR_JSON_PATH, 'r', encoding='utf-8') as src:
            with open(backup_ar, 'w', encoding='utf-8') as dst:
                dst.write(src.read())
        print(f"   ✅ {backup_ar.name}")
    
    # Sauvegarder les fichiers i18n
    print("\n📁 Sauvegarde des fichiers...")
    sauvegarder_json(FR_JSON_PATH, fr_data)
    print(f"   ✅ {FR_JSON_PATH.name}")
    
    sauvegarder_json(AR_JSON_PATH, ar_data)
    print(f"   ✅ {AR_JSON_PATH.name}")
    
    # Copier vers public/i18n
    try:
        public_fr = PUBLIC_I18N / "fr.json"
        public_ar = PUBLIC_I18N / "ar.json"
        sauvegarder_json(public_fr, fr_data)
        print(f"   ✅ public/i18n/fr.json")
        sauvegarder_json(public_ar, ar_data)
        print(f"   ✅ public/i18n/ar.json")
    except Exception as e:
        print(f"   ⚠️  Erreur copie public: {e}")
    
    # Rapport final
    print("\n" + "=" * 60)
    print("✅ GÉNÉRATION COMPLÈTE")
    print("=" * 60)
    print(f"\n📊 Résumé:")
    print(f"   • Pages traitées: 3, 4, 5, 6, 7")
    print(f"   • Clés générées: {total_cles_ajoutees}")
    print(f"   • Fichiers synchronisés: 4 (+ 2 backups)")
    print(f"\n🚀 Prochaines étapes:")
    print(f"   1. Redémarrer Angular: npm start")
    print(f"   2. Vider le cache: F12 → Application → Clear Site Data")
    print(f"   3. Tester: http://localhost:4200/formateur/cours/2/voir")
    print(f"   4. Naviguer pages 3-7 pour vérifier")

if __name__ == "__main__":
    try:
        generer_cles_pages_3_a_7()
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
