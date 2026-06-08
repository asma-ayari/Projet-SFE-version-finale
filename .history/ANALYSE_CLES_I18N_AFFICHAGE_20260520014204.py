#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Analyse du problème d'affichage des clés i18n dans la section Formateur
Détecte les clés i18n affichées littéralement au lieu d'être traduites
"""

import json
import re
import os
from pathlib import Path
from collections import defaultdict

# Chemins principaux
FRONTEND_PATH = r"c:\Users\Asma\Projet-TEST-main\frontend\Plateforme-Securite-Routiere-master"
I18N_PATH = os.path.join(FRONTEND_PATH, "src", "assets", "i18n", "fr.json")
COURSES_PATH = os.path.join(FRONTEND_PATH, "src", "app", "core", "data", "courses")

print("=" * 80)
print("ANALYSE: Clés i18n affichées littéralement dans le Formateur")
print("=" * 80)

# 1. Charger le fichier i18n
print("\n[1] Chargement du fichier i18n (fr.json)...")
with open(I18N_PATH, 'r', encoding='utf-8') as f:
    i18n_data = json.load(f)

# Extraire toutes les clés COURSE_DETAIL
course_detail_keys = {k: v for k, v in i18n_data.items() if k.startswith('COURSE_DETAIL')}
print(f"  ✓ Trouvé {len(course_detail_keys)} clés COURSE_DETAIL")

# Statistiques par cours
courses_info = {}
for course_id in range(1, 12):
    course_key = f"COURSE_DETAIL_ID{course_id}"
    if course_key in course_detail_keys:
        keys_count = len(course_detail_keys[course_key]) if isinstance(course_detail_keys[course_key], dict) else 1
        courses_info[course_id] = {
            'key': course_key,
            'keys_count': keys_count,
            'data': course_detail_keys[course_key]
        }

print(f"  ✓ Analysé {len(courses_info)} cours")

# 2. Analyser les fichiers des cours TypeScript
print("\n[2] Analyse des fichiers des cours (TypeScript)...")
courses_files = {}
for file_path in Path(COURSES_PATH).glob("course-*.ts"):
    if "index" in file_path.name:
        continue
    course_num = re.search(r'course-(\d+)', file_path.name)
    if course_num:
        course_id = int(course_num.group(1))
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Compter les leçons
        lessons_count = len(re.findall(r'lessonNumber:\s*\d+', content))
        
        # Chercher les clés i18n mentionnées
        i18n_pattern = r'COURSE_DETAIL_ID\d+[._]PAGE_\d+[._][A-Z_]+'
        mentioned_keys = set(re.findall(i18n_pattern, content))
        
        courses_files[course_id] = {
            'file': file_path.name,
            'lessons_count': lessons_count,
            'mentioned_keys': mentioned_keys,
            'file_size': len(content)
        }

print(f"  ✓ Analysé {len(courses_files)} fichiers de cours")

# 3. Détecter le problème
print("\n[3] Détection du problème d'affichage...")
print("\n" + "=" * 80)
print("RÉSUMÉ PAR COURS")
print("=" * 80)

issues = {
    'missing_translations': [],  # Clés mentionnées mais non traduites
    'incomplete_pages': [],      # Pages indiquées mais contenu manquant
    'empty_courses': []          # Cours sans contenu
}

for course_id in range(1, 12):
    print(f"\n📌 COURS ID{course_id} ({courses_info.get(course_id, {}).get('key', 'N/A')})")
    print("-" * 80)
    
    # Infos du fichier TypeScript
    file_info = courses_files.get(course_id, {})
    ts_lessons = file_info.get('lessons_count', 0)
    
    # Infos de traduction
    course_data = courses_info.get(course_id, {})
    translations = course_data.get('data', {})
    
    # Analyser les pages
    if isinstance(translations, dict):
        pages = set()
        for key in translations.keys():
            match = re.search(r'PAGE_(\d+)', key)
            if match:
                pages.add(int(match.group(1)))
        
        # Chercher PAGE_N_NUMBER pour déterminer le nombre total de pages
        page_numbers = {}
        for key, value in translations.items():
            match = re.search(r'PAGE_(\d+)_NUMBER', key)
            if match:
                page_num = int(match.group(1))
                # Extraire "Page X/Y" pour trouver Y
                if value and 'Page' in value:
                    total_match = re.search(r'Page\s+\d+/(\d+)', value)
                    if total_match:
                        page_numbers[page_num] = int(total_match.group(1))
        
        # Analyser
        if ts_lessons == 0 and not translations:
            print(f"  ⚠️ Aucun contenu (ni dans TS ni dans i18n)")
            issues['empty_courses'].append(course_id)
        elif ts_lessons > 0:
            print(f"  ✓ {ts_lessons} leçon(s) dans le TypeScript")
            print(f"  ✓ {len(pages)} page(s) traduite(s): {sorted(pages)}")
            
            # Chercher discordances
            if page_numbers:
                for page_num, total_pages in page_numbers.items():
                    translated_pages = len([p for p in pages if p <= total_pages])
                    if translated_pages < total_pages:
                        missing = total_pages - translated_pages
                        print(f"    ⚠️ DISCORDANCE: PAGE_{page_num}_NUMBER indique Page {page_num}/{total_pages}")
                        print(f"       mais seulement {translated_pages}/{total_pages} pages traduites ({missing} manquantes)")
                        issues['incomplete_pages'].append({
                            'course_id': course_id,
                            'page': page_num,
                            'expected': total_pages,
                            'actual': translated_pages
                        })
        else:
            print(f"  ✓ {len(pages)} page(s) traduite(s) (sans contenu TS)")
    else:
        print(f"  ✓ Titre uniquement")

# 4. Rapport des problèmes
print("\n" + "=" * 80)
print("RAPPORT DES PROBLÈMES")
print("=" * 80)

print(f"\n🔴 PROBLÈMES CRITIQUES:")
print("-" * 80)

if issues['empty_courses']:
    print(f"\n1. Cours VIDES (pas de contenu du tout):")
    for course_id in issues['empty_courses']:
        print(f"   - Cours ID{course_id}")

if issues['incomplete_pages']:
    print(f"\n2. Discordances entre PAGE_N_NUMBER et contenu réel:")
    for issue in issues['incomplete_pages']:
        print(f"   - Cours ID{issue['course_id']}: Page {issue['page']} indique "
              f"{issue['expected']} pages mais seulement {issue['actual']} traduites")
        print(f"     → {issue['expected'] - issue['actual']} page(s) manquante(s)")

# 5. Analyser le pattern HTML/display
print("\n" + "=" * 80)
print("ANALYSE DU PATTERN D'AFFICHAGE")
print("=" * 80)

# Rechercher dans les templates HTML
print("\n[4] Recherche des templates HTML qui affichent les clés...")
html_files = list(Path(FRONTEND_PATH).glob("src/app/formateur/**/*.html"))
print(f"  ✓ Trouvé {len(html_files)} fichiers HTML")

problematic_patterns = []
for html_file in html_files:
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Chercher les patterns où les clés i18n sont affichées littéralement
    # Pattern 1: {{ key }} sans pipe translate
    if 'COURSE_DETAIL' in content:
        matches = re.findall(r'{{\s*(?:\'|")?COURSE_DETAIL[^}]*(?:\'|")?\s*}}', content)
        if matches:
            problematic_patterns.append({
                'file': html_file.relative_to(FRONTEND_PATH),
                'type': 'template_variable',
                'matches': matches,
                'count': len(matches)
            })

if problematic_patterns:
    print(f"\n⚠️ PATTERNS PROBLÉMATIQUES TROUVÉS:")
    for pattern in problematic_patterns:
        print(f"\n  Fichier: {pattern['file']}")
        print(f"  Type: Clés i18n affichées sans traduction ({pattern['count']} occurrences)")
        for match in pattern['matches'][:3]:
            print(f"    - {match}")

# 6. Solution proposée
print("\n" + "=" * 80)
print("SOLUTION PROPOSÉE")
print("=" * 80)

print("""
Le problème vient du fait que le code génère/affiche les clés i18n littéralement 
au lieu d'utiliser le pipe Angular 'translate'.

CAUSES POSSIBLES:
1. Le HTML affiche {{ 'COURSE_DETAIL_ID2.PAGE_2_NUMBER' }} sans pipe | translate
2. Le contenu est généré dynamiquement en TypeScript sans passer par le système i18n
3. Les clés ne sont pas définies dans le fichier fr.json

SOLUTION:
1. Vérifier que toutes les clés i18n utilisées existent dans fr.json ✓
2. S'assurer que le pipe translate est appliqué: {{ key | translate }}
3. Générer les clés manquantes dans fr.json pour tous les cours
4. Tester avec les deux fichiers i18n (src/assets/i18n et public/i18n)

FICHIERS À CORRIGER:
""")

# Afficher les fichiers à corriger
print("\n[5] Fichiers à examiner/corriger:")
print(f"  - Frontend templates: {[str(f.relative_to(FRONTEND_PATH)) for f in html_files[:5]]}")
print(f"  - Fichier i18n: {str(Path(I18N_PATH).relative_to(FRONTEND_PATH))}")

print("\n" + "=" * 80)
print("FIN DE L'ANALYSE")
print("=" * 80)
