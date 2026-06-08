import { CourseContent } from '../../../core/services/course-content.service';

export const COURSE_3_ALCOOL_EFFETS: CourseContent = {
  id: 3,
  title: 'Alcool : les effets',
  icon: '🍷',
  category: 'Sécurité',
  duration: '45 min',
  description: 'Comprendre comment éliminer l\'alcool et les effets sur la conduite à différents niveaux d\'alcoolémie',
  totalPages: 5,
  lessons: [
    {
      lessonNumber: 1,
      title: 'Comment éliminer les effets de l\'alcool ?',
      content: `Page 1/5

C'est la question que se posent beaucoup de gens après une soirée ou un repas : "Comment me débarrasser rapidement des effets de l'alcool ?"

Les réponses courantes : café, eau, sommeil, cuillère d'huile...

Mais AUCUNE de ces solutions n'est efficace.

La vérité scientifique est simple mais difficile à accepter : il n'existe qu'une seule vraie solution.

Découvrez comment votre corps élimine vraiment l'alcool et pourquoi il n'existe pas de shortcut magique.

Cette leçon concerne directement votre sécurité routière et celle d'autrui.`
    },
    {
      lessonNumber: 2,
      title: 'Mesure et cinétique de l\'alcoolémie',
      content: `Page 2/5

Pour comprendre comment éliminer l'alcool, il faut d'abord comprendre comment il circule dans votre corps.

🍷 TEST INTERACTIF : CALCULER VOTRE ALCOOLÉMIE

Plusieurs facteurs influent sur l'alcoolémie :

1️⃣ VOTRE SEXE
   • Hommes et femmes traitent l'alcool différemment
   • Les femmes atteignent des niveaux plus élevés plus vite
   • En raison de la proportion eau/graisse corporelle

2️⃣ VOTRE POIDS
   • Plus vous pesez, moins la concentration d'alcool est élevée
   • Exemple : 70kg vs 100kg → alcoolémie très différente
   • Même quantité d'alcool = effets différents

3️⃣ TYPE DE BOISSON
   • Verre de vin : 10 cl (≈10g d'alcool pur)
   • Bière 5° : 25 cl (≈10g d'alcool pur)
   • Verre d'alcool fort : 3 cl (≈12g d'alcool pur)
   • Tous les alcools ne sont pas équivalents en volume

4️⃣ CONSOMMATION AVEC OU SANS REPAS
   • À JEUN : alcoolémie maximale en 30 MINUTES
   • AVEC REPAS : alcoolémie maximale en 1-2 HEURES
   • La nourriture ralentit absorption
   • Très important pour prévoir les effets

📊 L'ALCOOLÉMIE : DÉFINITION ET MESURE

🔬 C'est la concentration d'alcool dans le sang :
   • Unité : grammes par litre de sang (g/l)
   • Exemple : 0,5 g/l = 0,5 gramme d'alcool par litre de sang
   • Mesure directe : prise de sang

💨 MESURE INDIRECTE (Alcotest) :
   • Alcool expiré dans l'air
   • Unité : milligrammes par litre d'air expiré (mg/l)
   • Rapport : 1 g/l sang ≈ 0,5 mg/l air expiré
   • Plus pratique pour contrôle routier

💡 Lorsque vous glissez à droite (consommation augmente), observez la courbe d'alcoolémie se modifier.`
    },
    {
      lessonNumber: 3,
      title: 'Absorption et élimination de l\'alcool',
      content: `Page 3/5

COMPRENDRE LE VOYAGE DE L'ALCOOL DANS VOTRE CORPS

📍 PHASE 1 : ABSORPTION (La montée)

Quand vous buvez une boisson alcoolisée :

⏱️ CHRONOLOGIE :
• À JEUN : l'alcool atteint son maximum en 30 MINUTES
• AVEC REPAS : l'alcool atteint son maximum en 1-2 HEURES
• La nourriture dans l'estomac ralentit beaucoup l'absorption

🔍 PROCESSUS :
1. L'alcool est absorbé par l'estomac (20%)
2. L'alcool est absorbé par l'intestin grêle (80%) - absorption majeure
3. L'alcool rentre dans la circulation sanguine
4. Se distribue dans les organes, notamment le cerveau
5. Plus grande concentration = plus d'effets

📍 PHASE 2 : ÉLIMINATION (La descente)

Une fois absorbé, l'alcool doit être éliminé. Mais COMMENT ?

🫀 ÉLIMINATION PAR LE FOIE (90% de l'alcool)
   • Le foie métabolise l'alcool de façon chimique
   • Conversion en acétaldéhyde (très toxique)
   • Puis en acétate (moins toxique)
   • Puis CO₂ et eau
   • Processus lent et régulier

💨 ÉLIMINATION PAR LES POUMONS (5-10%)
   • L'alcool s'évapore partiellement en respirant
   • Raison du souffle alcoolisé
   • C'est sur ce principe que fonctionne l'alcotest
   • Part mineure du total

🫧 ÉLIMINATION PAR LES REINS (trace)
   • Un peu d'alcool dans l'urine
   • Part très mineure (< 1%)

🫀 ÉLIMINATION PAR LA PEAU (trace)
   • Transpiration alcoolisée
   • Part très mineure

⏱️ VITESSE D'ÉLIMINATION (CRITIQUE) :

« IL FAUT 1 À 2 HEURES PAR VERRE POUR ÉLIMINER L'ALCOOL »

Cette vitesse est CONSTANTE et NE PEUT PAS ÊTRE ACCÉLÉRÉE !

Exemples :
• 1 verre → 1 à 2 heures
• 2 verres → 2 à 4 heures
• 3 verres → 3 à 6 heures
• 4 verres → 4 à 8 heures
• 5 verres → 5 à 10 heures (ou plus !)

💡 POINT CRUCIAL : Cette élimination est LINÉAIRE

Cela signifie :
• Votre foie traite l'alcool à une vitesse fixe
• Rien ne peut l'accélérer (voir page suivante)
• Vous devez attendre
• C'est une question de biologie, pas de volonté`
    },
    {
      lessonNumber: 4,
      title: 'Effets à différents niveaux d\'alcoolémie',
      content: `Page 4/5

L'ALCOOL AFFECTE VOTRE CAPACITÉ À CONDUIRE DE FAÇON PROGRESSIVE

📋 LIMITES LÉGALES EN TUNISIE :

🚨 LIMITE LÉGALE POUR CONDUIRE :
• CONDUCTEUR : 0,5 g/l de sang ou 0,25 mg/l d'air expiré
• CONDUCTEUR NOVICE (< 3 ans permis) : 0,0 g/l (zéro tolérante)
• PROFESSIONNEL : 0,0 g/l

⚠️ ATTENTION : MÊME LE PREMIER VERRE EST DANGEREUX !

🍷 EFFETS PAR NIVEAU D'ALCOOLÉMIE :

⬜ 0,2-0,5 g/l (1 verre - sous la limite légale)
Effets : IMPERCEPTIBLES mais PRÉSENTS
✗ Légère relaxation
✗ Baisse très légère des réflexes
✗ Jugement légèrement altéré
✗ Sentiment faux de confiance
✓ Risque d'accident DÉJÀ AUGMENTÉ de 20-30%

🟡 0,5-0,8 g/l (1-2 verres - limite légale atteinte)
Effets : IMPORTANTS ET VISIBLES
✗ Euphorie
✗ Ralentissement des réflexes (40-50%)
✗ Temps de réaction augmenté
✗ Diminution des inhibitions
✗ Vision légèrement réduite
✗ Concentration réduite
✓ Risque d'accident MULTIPLIÉ PAR 3-5

🟠 0,8-1,0 g/l (2-3 verres)
Effets : SIGNIFICATIFS ET DANGEREUX
✗ Perte partelle de coordination
✗ Vision réduite périphériquement (20% de vision perdue)
✗ Temps de réaction doublé-triplé
✗ Mauvaise jugement des distances
✗ Cauchemar des autres usagers
✓ Risque d'accident MULTIPLIÉ PAR 7-10

🔴 1,0-1,5 g/l (3-4 verres)
Effets : TRÈS DANGEREUX
✗ Désorientation marquée
✗ Équilibre compromis
✗ Vision fortement réduite
✗ Agitation ou calme trompeur
✗ Misjudgement complet des situations
✗ Manque de coordination manifeste
✓ Risque d'accident MULTIPLIÉ PAR 15-30
✓ CONDUIRE EST QUASI IMPOSSIBLE

🔴 1,5+ g/l (4+ verres)
Effets : TRÈS GRAVE
✗ État décrit comme "fortement intoxiqué"
✗ Perte d'équilibre
✗ Parole indistincte
✗ Nausées
✗ INCAPACITÉ À CONDUIRE
✓ RISQUE D'ACCIDENT EXTRÊME
✓ CONDUIRE C'EST TUER

💡 CE QU'IL FAUT RETENIR :

1. MÊME 0,2 g/l (un verre léger) AUGMENTE LES RISQUES
   • Le conducteur en est rarement conscient
   • Sentiment de confiance faux
   • Les réflexes SONT ralentis même si pas perceptible

2. 0,5 g/l (LIMITE LÉGALE) EST JUSTE LE POINT DE RUPTURE
   • Pas sa limite prudente
   • C'est la limite légale, pas la limite de sécurité
   • Risque d'accident déjà 3-5x supérieur

3. FAITES VARIER L'ALCOOLÉMIE (Simulation interactive)
   • En déplaçant le curseur violet
   • Observez l'évolution des risques
   • Remarquez : pas de seuil "sûr"
   • Risque augmente graduellement dès le premier verre

⚠️ CONSTAT ALARMANT :

« Les conducteurs alcoolisés SE SENTENT GÉNÉRALEMENT PLUS EN CONFIANCE »

C'est l'inverse exact de la réalité !
• Plus on boit → plus on pense qu'on peut conduire
• C'est un effet neurologique direct
• Le jugement s'altère QUAND MÊME si on ne le réalise pas
• Beaucoup d'accidents impliquent des conducteurs "sûrs" de pouvoir conduire`
    },
    {
      lessonNumber: 5,
      title: 'Conclusion : Il n\'existe aucune solution miracle',
      content: `Page 5/5

🎯 RÉPONSE CLAIRE À LA QUESTION :

« Comment éliminer les effets de l'alcool ? »

❌ MYTHES À REJETER (ne marchent ABSOLUMENT PAS) :

« Boire un café »
✗ Le café stimule vous réveille mais NE vous désalcoolise pas
✗ Vous êtes simplement une personne ÉVEILLÉE et soûle
✗ Les réflexes restent ralentis
✗ La conduite reste 5x plus dangereuse
✗ Danger ACCRU : vous vous croyez vigilant

« Prendre une douche froide »
✗ Vous êtes réveillé mais votre sang n'est pas plus clair
✗ L'alcool circule toujours dans votre corps
✗ Les réflexes ne sont pas améliorés
✗ Fausse sensation de forme

« Avaler une cuillère d'huile »
✗ Aucune base scientifique
✗ Peut causer nausée
✗ L'alcool a déjà été absorbé
✗ Trop tard pour l'arrêter

« Dormir 1 heure »
✗ En une heure vous n'avez pas éliminé l'alcool
✗ Vous êtes simplement inconscient mais votre sang n'est pas plus clair
✗ Vous vous réveillez encore alcoolisé
✗ Très dangereux de "vous reposer" puis de conduire

« Energy drinks ou sucre »
✗ Stimule mais ne désalcoolise pas
✗ Donne fausse impression de contrôle
✗ Alcool persiste dans le sang
✗ Dangereux

« Respiration profonde »
✗ Seulement 5-10% élimination par poumons
✗ 90% doit être métabolisé par le foie
✗ Respirer toute la nuit ne suffit pas

✅ LA SEULE VRAIE SOLUTION :

⏱️ ATTENDRE LE TEMPS NÉCESSAIRE

C'est simple mais difficile à accepter :
• 1 verre → 1 à 2 heures
• 2 verres → 2 à 4 heures
• 3 verres → 3 à 6 heures
• etc.

Votre foie travaille à son rythme.
Rien ne peut l'accélérer.
C'est de la chimie, pas de la volonté.

🚗 POUR LA SÉCURITÉ ROUTIÈRE :

LA MEILLEURE STRATÉGIE EST LA PRÉVENTION :

1️⃣ AVANT LA SOIRÉE OU LE REPAS :
   ✓ DÉSIGNEZ UN CONDUCTEUR SOBRE
   ✓ Cela doit être entendu AVANT de boire
   ✓ Cette personne NE BOIT AUCUN ALCOOL
   ✓ Elle ramène tout le monde en sécurité
   ✓ C'est LA meilleure solution

2️⃣ ALTERNATIVE :
   ✓ Taxi ou VTC (Uber, etc)
   ✓ Transports en commun (bus, train)
   ✓ Rester sur place et dormir
   ✓ Appel à un ami/famille sobre

3️⃣ À TOUT PRIX ÉVITER :
   ✗ Ne vous faites JAMAIS reconduire par quelqu'un qui a bu
   ✗ Même s'il "se sent bien"
   ✗ Même s'il "a l'habitude"
   ✗ Même s'il vous connaître depuis longtemps
   ✗ L'alcool affecte TOUT LE MONDE

💡 RESPONSABILITÉ COLLECTIVE :

• En tant que conducteur sobre : refusez de conduire si vous buvez
• En tant que passager : n'acceptez jamais de monter avec quelqu'un d'alcoolisé
• En tant que ami : aidez à organiser transport pour une soirée
• En tant que parent : parlez à vos enfants de ces risques

📊 STATISTIQUES ALARMANTES :

• 30% des morts sur route impliquent l'alcool
• L'alcool est impliqué dans 50% des accidents mortels la nuit
• Chez les jeunes : leading cause of death
• Beaucoup de victimes ne buvaient pas (hit par quelqu'un de soûl)

🎯 MESSAGE FINAL :

Il n'existe pas de raccourci magique pour éliminer l'alcool.
La seule solution est d'éviter de conduire après avoir bu.

Un conducteur sobre = Tous les usagers de route sauvés.
Un conducteur soûl = Tueur potentiel.

Le choix est simple.
Faites-le avant de fêter.`
    }
  ]
};
