#!/bin/bash
# Script pour vérifier les clés dupliquées dans les JSON
# Utilisation: bash scripts/check-duplicates.sh

echo "🔍 Recherche des clés dupliquées..."
echo ""

# Vérifier les doublons en français
echo "Français (public/locales/fr/translation.json):"
python3 -c "
import json
with open('public/locales/fr/translation.json', 'r') as f:
    data = json.load(f)

def get_all_keys(obj, prefix=''):
    keys = []
    for k, v in obj.items():
        full_key = f'{prefix}.{k}' if prefix else k
        if isinstance(v, dict):
            keys.extend(get_all_keys(v, full_key))
        else:
            keys.append(full_key)
    return keys

all_keys = get_all_keys(data)
unique_keys = set(all_keys)

if len(all_keys) == len(unique_keys):
    print('  ✅ Pas de doublons')
else
    duplicates = [k for k in all_keys if all_keys.count(k) > 1]
    print(f'  ❌ {len(set(duplicates))} clé(s) dupliquée(s):')
    for d in set(duplicates):
        print(f'     - {d}')
"

echo ""
echo "Arabe (public/locales/ar/translation.json):"
python3 -c "
import json
with open('public/locales/ar/translation.json', 'r') as f:
    data = json.load(f)

def get_all_keys(obj, prefix=''):
    keys = []
    for k, v in obj.items():
        full_key = f'{prefix}.{k}' if prefix else k
        if isinstance(v, dict):
            keys.extend(get_all_keys(v, full_key))
        else:
            keys.append(full_key)
    return keys

all_keys = get_all_keys(data)
unique_keys = set(all_keys)

if len(all_keys) == len(unique_keys):
    print('  ✅ Pas de doublons')
else
    duplicates = [k for k in all_keys if all_keys.count(k) > 1]
    print(f'  ❌ {len(set(duplicates))} clé(s) dupliquée(s):')
    for d in set(duplicates):
        print(f'     - {d}')
"

echo ""
echo "✅ Vérification complètée!"
