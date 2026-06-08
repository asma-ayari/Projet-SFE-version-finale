#!/bin/bash
# Script pour extraire les clés de traduction utilisées dans les templates
# Utilisation: bash scripts/extract-keys.sh

echo "🔍 Extraction des clés de traduction utilisées..."
echo ""

# Créer le dossier de rapport s'il n'existe pas
mkdir -p reports

# Extraire les clés des templates
echo "Recherche des clés dans les templates..."
grep -r "| translate" src/app --include="*.html" --include="*.ts" | \
    sed "s/.*'\([A-Z_\.]*\)'.*/\1/" | \
    sort | uniq > reports/used-keys.txt

echo "Recherche des clés dans i18n.config.ts..."
grep -o "'[A-Z_\.]*'" src/app/core/i18n/i18n.config.ts | \
    sed "s/'//g" | sort | uniq > reports/defined-keys.txt

# Comparer
echo ""
echo "📊 Résultats:"
echo "  • Clés utilisées: $(wc -l < reports/used-keys.txt)"
echo "  • Clés définies: $(wc -l < reports/defined-keys.txt)"
echo ""

# Trouver les clés utilisées mais non définies
echo "Recherche des clés manquantes..."
comm -23 <(sort reports/used-keys.txt) <(sort reports/defined-keys.txt) > reports/missing-keys.txt

if [ -s reports/missing-keys.txt ]; then
    echo "⚠️  Clés manquantes trouvées:"
    cat reports/missing-keys.txt
else
    echo "✅ Toutes les clés sont définies!"
fi

echo ""
echo "Rapports sauvegardés dans:"
echo "  • reports/used-keys.txt (clés utilisées)"
echo "  • reports/defined-keys.txt (clés définies)"
echo "  • reports/missing-keys.txt (clés manquantes)"
