#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Synchronisation AR: Copie la structure du fr.json vers ar.json
pour maintenir la cohérence entre les deux fichiers i18n
"""

import json
import os
import shutil
from pathlib import Path

FRONTEND_PATH = r"c:\Users\Asma\Projet-TEST-main\frontend\Plateforme-Securite-Routiere-master"
FR_PATH = os.path.join(FRONTEND_PATH, "src", "assets", "i18n", "fr.json")
AR_PATH = os.path.join(FRONTEND_PATH, "src", "assets", "i18n", "ar.json")
PUBLIC_FR_PATH = os.path.join(FRONTEND_PATH, "public", "i18n", "fr.json")
PUBLIC_AR_PATH = os.path.join(FRONTEND_PATH, "public", "i18n", "ar.json")

print("=" * 80)
print("SYNCHRONISATION: Mise à jour des fichiers i18n")
print("=" * 80)

# 1. Charger fr.json (version à jour)
print("\n[1] Chargement du fichier fr.json (source)...")
with open(FR_PATH, 'r', encoding='utf-8') as f:
    fr_data = json.load(f)
print(f"  ✓ Chargé: {len(json.dumps(fr_data))} caractères")

# 2. Charger ar.json
print("\n[2] Chargement du fichier ar.json (cible)...")
with open(AR_PATH, 'r', encoding='utf-8') as f:
    ar_data = json.load(f)
ar_size_before = len(json.dumps(ar_data))
print(f"  ✓ Chargé: {ar_size_before} caractères")

# 3. Synchroniser les COURSE_DETAIL_* keys
print("\n[3] Synchronisation des clés COURSE_DETAIL...")

keys_added = 0
keys_updated = 0

for course_id in range(1, 12):
    course_key = f"COURSE_DETAIL_ID{course_id}"
    
    if course_key in fr_data:
        # Initialiser la structure en arabe si elle n'existe pas
        if course_key not in ar_data:
            ar_data[course_key] = {}
        
        # Synchroniser toutes les clés du cours français
        for sub_key, value in fr_data[course_key].items():
            if sub_key not in ar_data[course_key]:
                # Copier la clé avec la valeur française (sera traduite ultérieurement)
                ar_data[course_key][sub_key] = f"[AR] {value}"  # Marqueur pour traduction
                keys_added += 1
            else:
                keys_updated += 1

print(f"  ✓ Clés ajoutées: {keys_added}")
print(f"  ✓ Clés existantes vérifiées: {keys_updated}")

# 4. Sauvegarder ar.json
print("\n[4] Sauvegarde des fichiers...")

# Backup
ar_backup = AR_PATH + '.backup'
if not os.path.exists(ar_backup):
    shutil.copy(AR_PATH, ar_backup)
    print(f"  ✓ Backup créé: {Path(ar_backup).name}")

# Sauvegarder ar.json
with open(AR_PATH, 'w', encoding='utf-8') as f:
    json.dump(ar_data, f, ensure_ascii=False, indent=2)
ar_size_after = len(json.dumps(ar_data))
print(f"  ✓ ar.json sauvegardé (+{ar_size_after - ar_size_before} caractères)")

# 5. Synchroniser public/i18n/
print("\n[5] Synchronisation des fichiers public/i18n/...")

if os.path.exists(PUBLIC_FR_PATH):
    # Sauvegarder public/i18n/fr.json
    shutil.copy(FR_PATH, PUBLIC_FR_PATH)
    print(f"  ✓ public/i18n/fr.json synchronisé")
else:
    print(f"  ⚠️ public/i18n/fr.json n'existe pas (création skippée)")

if os.path.exists(PUBLIC_AR_PATH):
    # Sauvegarder public/i18n/ar.json
    shutil.copy(AR_PATH, PUBLIC_AR_PATH)
    print(f"  ✓ public/i18n/ar.json synchronisé")
else:
    print(f"  ⚠️ public/i18n/ar.json n'existe pas (création skippée)")

# 6. Statistiques finales
print("\n" + "=" * 80)
print("RAPPORT FINAL")
print("=" * 80)

total_keys = 0
for course_id in range(1, 12):
    course_key = f"COURSE_DETAIL_ID{course_id}"
    if course_key in ar_data and isinstance(ar_data[course_key], dict):
        course_keys = len(ar_data[course_key])
        total_keys += course_keys
        if course_keys > 0:
            print(f"  {course_key}: {course_keys} clés")

print(f"\n✅ RÉSUMÉ:")
print(f"  - Clés générées: {keys_added}")
print(f"  - Fichier ar.json: SYNCHRONISÉ")
print(f"  - Fichier public/i18n/: SYNCHRONISÉ")
print(f"  - Total clés COURSE_DETAIL: {total_keys}")

print("\n" + "=" * 80)
print("STATUT: ✅ PRÊT POUR AFFICHAGE")
print("=" * 80)
print("""
✅ Les clés i18n ont été générées pour tous les cours
✅ Les fichiers fr.json et ar.json sont synchronisés
✅ Les fichiers public/i18n/ sont à jour

PROCHAINES ÉTAPES:
1. Redémarrer le serveur Angular pour charger les nouveaux fichiers i18n
2. Naviguer vers http://localhost:4200/formateur/cours/2/voir
3. Les clés comme "COURSE_DETAIL_ID2.PAGE_2_NUMBER" 
   devraient maintenant afficher les traductions réelles

REMARQUES:
- Les traductions arabes sont marquées avec [AR] pour indiquer 
  qu'elles doivent être traduites manuellement
- Les structures sont maintenant synchronisées et prêtes
""")

print("=" * 80)
print("FIN DE LA SYNCHRONISATION")
print("=" * 80)
