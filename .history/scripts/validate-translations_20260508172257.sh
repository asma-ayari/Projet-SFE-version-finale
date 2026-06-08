#!/bin/bash
# Script de validation des fichiers de traduction
# Utilisation: bash scripts/validate-translations.sh

echo "🔍 Validation des fichiers de traduction..."
echo ""

# Vérifier que les fichiers existent
if [ ! -f "public/locales/fr/translation.json" ]; then
    echo "❌ Fichier FR manquant: public/locales/fr/translation.json"
    exit 1
fi

if [ ! -f "public/locales/ar/translation.json" ]; then
    echo "❌ Fichier AR manquant: public/locales/ar/translation.json"
    exit 1
fi

# Compter les clés
FR_KEYS=$(grep -o '"[A-Z_]*"' public/locales/fr/translation.json | wc -l)
AR_KEYS=$(grep -o '"[A-Z_]*"' public/locales/ar/translation.json | wc -l)

echo "✅ Fichiers trouvés"
echo ""
echo "📊 Statistiques:"
echo "  • Clés Français: $FR_KEYS"
echo "  • Clés Arabe: $AR_KEYS"
echo ""

# Vérifier que les fichiers JSON sont valides
echo "🔎 Validation JSON..."

if python3 -m json.tool public/locales/fr/translation.json > /dev/null 2>&1; then
    echo "  ✅ Français: JSON valide"
else
    echo "  ❌ Français: JSON invalide"
    exit 1
fi

if python3 -m json.tool public/locales/ar/translation.json > /dev/null 2>&1; then
    echo "  ✅ Arabe: JSON valide"
else
    echo "  ❌ Arabe: JSON invalide"
    exit 1
fi

echo ""
echo "✅ Tous les fichiers sont valides!"
echo ""
echo "Prochaines étapes:"
echo "  1. ng serve (pour tester localement)"
echo "  2. ng build --configuration production (pour la production)"
