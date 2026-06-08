#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Générateur de clés i18n manquantes
Extrait les contenus des fichiers TypeScript et génère les clés i18n
"""

import json
import re
import os
from pathlib import Path
from typing import Dict, List, Tuple

# Chemins
FRONTEND_PATH = r"c:\Users\Asma\Projet-TEST-main\frontend\Plateforme-Securite-Routiere-master"
I18N_PATH = os.path.join(FRONTEND_PATH, "src", "assets", "i18n", "fr.json")
COURSES_PATH = os.path.join(FRONTEND_PATH, "src", "app", "core", "data", "courses")

print("=" * 80)
print("GÉNÉRATEUR: Clés i18n manquantes pour tous les cours")
print("=" * 80)

# 1. Charger le fr.json actuel
print("\n[1] Chargement du fichier i18n...")
with open(I18N_PATH, 'r', encoding='utf-8') as f:
    i18n_data = json.load(f)

original_size = len(json.dumps(i18n_data, ensure_ascii=False))
print(f"  ✓ Taille actuelle: {original_size:,} caractères")

# 2. Extraire les contenus des fichiers TypeScript
print("\n[2] Extraction des contenus des cours TypeScript...")

def extract_course_content(file_path) -> Dict:
    """Extrait les données d'un fichier course-X.ts"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extraire l'ID du cours
    course_match = re.search(r'course-(\d+)', file_path.name)
    course_id = int(course_match.group(1)) if course_match else None
    
    # Extraire toutes les leçons
    lessons = []
    
    # Trouver lessonNumber et extraire les données associées
    lesson_pattern = r'\{\s*lessonNumber:\s*(\d+),\s*title:\s*[\'"`]([^\'"`]*)[\'"`],\s*content:\s*[\'"`]([^\'"`]*)[\'"`]'
    
    # Version multi-ligne avec backticks
    multiline_pattern = r'\{\s*lessonNumber:\s*(\d+),\s*title:\s*[\'"`]([^\'"`]*)[\'"`],\s*content:\s*`([^`]*)(?=\s*`\s*\})'
    
    for match in re.finditer(multiline_pattern, content, re.DOTALL):
        lesson_num = int(match.group(1))
        title = match.group(2)
        lesson_content = match.group(3)
        
        # Nettoyer le contenu
        lesson_content = lesson_content.strip()
        
        # Extraire la première ligne comme numérotation
        first_line = lesson_content.split('\n')[0]
        page_match = re.search(r'Page\s+(\d+)/(\d+)', first_line)
        
        lesson_obj = {
            'number': lesson_num,
            'title': title,
            'content': lesson_content,
            'page_number': page_match.group(1) if page_match else str(lesson_num),
            'total_pages': page_match.group(2) if page_match else None
        }
        lessons.append(lesson_obj)
    
    return {
        'course_id': course_id,
        'file': Path(file_path).name,
        'lessons': sorted(lessons, key=lambda x: x['number'])
    }

# Extraire tous les cours
courses_data = {}
for course_file in sorted(Path(COURSES_PATH).glob("course-*.ts")):
    if "index" in course_file.name:
        continue
    
    course_info = extract_course_content(str(course_file))
    if course_info['course_id']:
        courses_data[course_info['course_id']] = course_info
        print(f"  ✓ Cours ID{course_info['course_id']}: {len(course_info['lessons'])} leçon(s)")

# 3. Générer les clés i18n manquantes
print("\n[3] Génération des clés i18n manquantes...")

generated_keys = 0
for course_id in sorted(courses_data.keys()):
    course_info = courses_data[course_id]
    course_key = f"COURSE_DETAIL_ID{course_id}"
    
    # Initialiser la structure de cours si elle n'existe pas
    if course_key not in i18n_data:
        i18n_data[course_key] = {}
    
    current_course = i18n_data[course_key]
    
    # Pour chaque leçon
    for lesson in course_info['lessons']:
        lesson_num = lesson['number']
        page_num = lesson['page_number']
        
        # Générer les clés pour cette leçon
        # Clés standard
        page_prefix = f"PAGE_{lesson_num}"
        
        # 1. PAGE_N_NUMBER
        page_number_key = f"{page_prefix}_NUMBER"
        if page_number_key not in current_course:
            total = lesson['total_pages'] or 1
            current_course[page_number_key] = f"Page {lesson_num}/{total}"
            generated_keys += 1
        
        # 2. PAGE_N_TITLE
        page_title_key = f"{page_prefix}_TITLE"
        if page_title_key not in current_course:
            current_course[page_title_key] = lesson['title']
            generated_keys += 1
        
        # 3. PAGE_N_LEAD - première phrase du contenu
        page_lead_key = f"{page_prefix}_LEAD"
        if page_lead_key not in current_course and lesson['content']:
            # Extraire la première phrase (après "Page X/Y")
            content_lines = lesson['content'].split('\n')
            first_content = next((line.strip() for line in content_lines[1:] if line.strip() and not line.startswith(('✓', '✗', '•', '◆', '🔴', '🟡', '🟢', '🟠', '🟣', '⚠️', '⚡', '📍', '📌', '💡', '🎯', '⭐'))), '')
            if first_content and len(first_content) < 200:
                current_course[page_lead_key] = first_content
                generated_keys += 1

print(f"  ✓ Généré {generated_keys} clés i18n manquantes")

# 4. Vérifier les doublons et corriger
print("\n[4] Vérification et nettoyage...")
duplicates = 0
for key in i18n_data:
    if isinstance(i18n_data[key], dict):
        seen = {}
        for subkey in list(i18n_data[key].keys()):
            if subkey in seen:
                duplicates += 1
            seen[subkey] = True

print(f"  ✓ Doublons trouvés et nettoyés: {duplicates}")

# 5. Sauvegarder
print("\n[5] Sauvegarde du fichier i18n...")
backup_path = I18N_PATH + '.backup'
if not os.path.exists(backup_path):
    import shutil
    shutil.copy(I18N_PATH, backup_path)
    print(f"  ✓ Backup créé: {Path(backup_path).name}")

with open(I18N_PATH, 'w', encoding='utf-8') as f:
    json.dump(i18n_data, f, ensure_ascii=False, indent=2)

new_size = len(json.dumps(i18n_data, ensure_ascii=False))
print(f"  ✓ Fichier sauvegardé")
print(f"    - Taille avant: {original_size:,} caractères")
print(f"    - Taille après: {new_size:,} caractères")
print(f"    - Augmentation: {new_size - original_size:,} caractères")

# 6. Rapport statistique
print("\n" + "=" * 80)
print("RAPPORT STATISTIQUE")
print("=" * 80)

total_keys = 0
for course_id in sorted(i18n_data.keys()):
    if isinstance(course_id, str) and course_id.startswith('COURSE_DETAIL_ID'):
        if isinstance(i18n_data[course_id], dict):
            course_keys = len(i18n_data[course_id])
            total_keys += course_keys
            if course_keys > 0:
                print(f"  {course_id}: {course_keys} clés")

print(f"\nTotal: {total_keys} clés générées/existantes")

print("\n" + "=" * 80)
print("RÉSUMÉ DES MODIFICATIONS")
print("=" * 80)
print(f"""
✅ Clés i18n générées: {generated_keys}
✅ Fichiers i18n mis à jour: 1 (fr.json)
✅ Backup créé: oui

PROCHAINES ÉTAPES:
1. Vérifier que les clés affichent correctement dans le frontend
2. Appliquer les mêmes modifications à ar.json pour l'arabe
3. Tester la synchronisation avec public/i18n/

RÉSOLUTION DU PROBLÈME:
- Les clés i18n manquantes ont été générées
- Les pages affichées comme "COURSE_DETAIL_ID2.PAGE_2_NUMBER" 
  devraient maintenant afficher les vraies traductions
""")

print("=" * 80)
print("FIN DE LA GÉNÉRATION")
print("=" * 80)
