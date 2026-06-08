#!/bin/bash
# Script pour générer un rapport de la plateforme bilingue
# Utilisation: bash scripts/generate-report.sh

echo "📊 Génération du rapport de traduction..."
echo ""

mkdir -p reports
REPORT_FILE="reports/i18n-report-$(date +%Y%m%d-%H%M%S).txt"

cat > "$REPORT_FILE" << EOF
=====================================
RAPPORT DE LA PLATEFORME BILINGUE
Généré le: $(date)
=====================================

1. STRUCTURE DES FICHIERS
EOF

# Vérifier les fichiers
if [ -f "public/locales/fr/translation.json" ]; then
    FR_SIZE=$(du -h public/locales/fr/translation.json | cut -f1)
    echo "   ✅ FR: public/locales/fr/translation.json ($FR_SIZE)" >> "$REPORT_FILE"
else
    echo "   ❌ FR: manquant" >> "$REPORT_FILE"
fi

if [ -f "public/locales/ar/translation.json" ]; then
    AR_SIZE=$(du -h public/locales/ar/translation.json | cut -f1)
    echo "   ✅ AR: public/locales/ar/translation.json ($AR_SIZE)" >> "$REPORT_FILE"
else
    echo "   ❌ AR: manquant" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "2. STATISTIQUES" >> "$REPORT_FILE"

# Compter les clés
FR_KEYS=$(grep -o '"[A-Z_]*":' public/locales/fr/translation.json | wc -l)
AR_KEYS=$(grep -o '"[A-Z_]*":' public/locales/ar/translation.json | wc -l)

echo "   Clés Français: $FR_KEYS" >> "$REPORT_FILE"
echo "   Clés Arabe: $AR_KEYS" >> "$REPORT_FILE"

# Compter les modules principaux
echo "" >> "$REPORT_FILE"
echo "3. MODULES TRADUITS" >> "$REPORT_FILE"

for MODULE in NAV ADMIN APPRENANT FORMATEUR QCM_INTERFACE COMMON; do
    COUNT=$(grep -o "\"$MODULE" public/locales/fr/translation.json | wc -l)
    if [ $COUNT -gt 0 ]; then
        echo "   ✅ $MODULE: $COUNT clés" >> "$REPORT_FILE"
    else
        echo "   ❌ $MODULE: pas trouvé" >> "$REPORT_FILE"
    fi
done

echo "" >> "$REPORT_FILE"
echo "4. COMPOSANTS" >> "$REPORT_FILE"

COMPONENTS=(
    "src/app/core/services/language.service.ts"
    "src/app/core/i18n/i18n.config.ts"
    "src/app/shared/components/language-switcher/language-switcher.component.ts"
    "src/app/shared/components/bilingual-form/bilingual-form.component.ts"
)

for COMPONENT in "${COMPONENTS[@]}"; do
    if [ -f "$COMPONENT" ]; then
        echo "   ✅ $COMPONENT" >> "$REPORT_FILE"
    else
        echo "   ❌ $COMPONENT (manquant)" >> "$REPORT_FILE"
    fi
done

echo "" >> "$REPORT_FILE"
echo "5. VALIDATION JSON" >> "$REPORT_FILE"

if python3 -m json.tool public/locales/fr/translation.json > /dev/null 2>&1; then
    echo "   ✅ Français: JSON valide" >> "$REPORT_FILE"
else
    echo "   ❌ Français: JSON invalide" >> "$REPORT_FILE"
fi

if python3 -m json.tool public/locales/ar/translation.json > /dev/null 2>&1; then
    echo "   ✅ Arabe: JSON valide" >> "$REPORT_FILE"
else
    echo "   ❌ Arabe: JSON invalide" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "6. PROCHAINES ÉTAPES" >> "$REPORT_FILE"
echo "   • ng serve --open (tester localement)" >> "$REPORT_FILE"
echo "   • Vérifier la langue switcher dans la navbar" >> "$REPORT_FILE"
echo "   • Tester RTL/LTR en Arabe" >> "$REPORT_FILE"
echo "   • ng build --configuration production (pour prod)" >> "$REPORT_FILE"

echo "✅ Rapport généré: $REPORT_FILE"
echo ""
cat "$REPORT_FILE"
