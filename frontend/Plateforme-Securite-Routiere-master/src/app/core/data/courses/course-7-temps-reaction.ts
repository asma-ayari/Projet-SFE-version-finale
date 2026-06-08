import { CourseContent } from '../../../core/services/course-content.service';

export const COURSE_7_TEMPS_REACTION: CourseContent = {
  id: 7,
  title: 'Temps de réaction',
  icon: '⚡',
  category: 'Physique',
  duration: '45 min',
  description: 'Comprendre le délai entre la perception du danger et la réaction pendant la conduite',
  totalPages: 10,
  lessons: [
    {
      lessonNumber: 1,
      title: 'Combien de temps faut-il pour réagir ?',
      content: `Page 1/10

C'est une question fondamentale pour la sécurité routière.

Lorsque vous voyez soudain un obstacle ou un danger sur la route, vous pensez peut-être que vous réagirez "immédiatement".

Mais la réalité est différente.

Entre le moment où vous voyez le danger et le moment où votre pied appuie sur le frein :
⏱️ Le temps passe
⏱️ Pendant ce temps, votre véhicule continue d'avancer
⏱️ À haute vitesse, cela représente une distance énorme

Cette leçon vous dira exactement combien de temps il faut pour réagir et pourquoi c'est crucial pour la sécurité routière.

Préparez-vous à être surpris par vos résultats !`
    },
    {
      lessonNumber: 2,
      title: 'Test de calcul mental',
      content: `Page 2/10

Testez votre temps de réaction sous charge mentale.

📋 La procédure :

1️⃣ Vous devez résoudre des opérations mathématiques simples qui s'affichent à l'écran.
   ➜ Saisissez la réponse et validez rapidement.

2️⃣ Le test commencera après un compte à rebours initial de 10 secondes.

3️⃣ Les tentatives suivantes démarreront automatiquement après des intervalles spécifiques (2s, 1s, 4s, 2s).

4️⃣ Répétez 5 fois pour voir vos résultats.`
    },
    {
      lessonNumber: 3,
      title: 'Test 1 : Stimulus visuel simple',
      content: `Page 3/10

Premier test : réaction à un stimulus visuel simple

Le concept :
✓ Testez votre temps de réaction pur
✓ Sans complexité de décision
✓ Juste percevoir et réagir

📋 La procédure :

1️⃣ Lorsque vous voyez un rectangle apparaître sur l'écran
   ➜ Appuyez sur la touche espace immédiatement

2️⃣ Pour commencer le test
   ➜ Appuyez sur la touche Entrée

3️⃣ Répétez 5 fois
   ➜ Fin des 5 tentatives
   ➜ Vous obtiendrez vos résultats

💡 Ce que cela mesure :

• Votre capacité de réponse de base
• Sans aucune décision à prendre
• Juste : voir + appuyer
• Réaction pure

🎯 Résultat attendu :

La plupart des gens réagissent en moins d'une seconde.

Habituellement : 0,15 - 0,40 seconde

Cette vitesse qui semble excellente est trompeuse : elle est plus rapide que la réalité de la route !

Pourquoi ? Vous le verrez dans les tests suivants et sur la route.`
    },
    {
      lessonNumber: 4,
      title: 'Test 2 : Stimulus auditif simple',
      content: `Page 4/10

Deuxième test : réaction à un stimulus auditif simple

Le concept :
✓ Testez votre réaction au son
✓ Pas de stimulus visuel
✓ Juste réaction au bruit

📋 La procédure :

1️⃣ Lorsque vous entendez un son se jouer
   ➜ Appuyez sur la touche espace immédiatement

2️⃣ Pour commencer le test
   ➜ Appuyez sur la touche Entrée

3️⃣ Répétez 5 fois
   ➜ Fin des 5 tentatives
   ➜ Vous obtiendrez vos résultats

💡 Ce que cela mesure :

• Réaction au son (comme le klaxon de voiture)
• Temps nécessaire pour traiter le stimulus auditif
• Différence par rapport au stimulus visuel
• Complexité des différents canaux sensoriels

🎯 Résultat attendu :

La plupart des gens réagissent en moins d'une seconde.

Habituellement : 0,15 - 0,30 seconde

💡 Comparaison intéressante :

Les réactions auditives sont souvent plus rapides que les visuelles (le son se propage partout, pas besoin de concentration visuelle).

Sur la route : le klaxon = réaction plus rapide que voir un obstacle`
    },
    {
      lessonNumber: 5,
      title: 'Test 3 : Stimulus avec choix (couleurs)',
      content: `Page 5/10

Troisième test : réaction avec décision (stimulus visuel)

Le concept :
✓ Plus complexe que les deux premiers tests
✓ Vous devez identifier et choisir
✓ Nécessite un traitement cérébral supplémentaire

📋 La procédure :

1️⃣ Vous obtiendrez des rectangles de différentes couleurs
   • Rectangle rouge apparaît → appuyez sur la touche R
   • Rectangle vert apparaît → appuyez sur la touche V

2️⃣ Vous devez :
   - Voir le rectangle
   - Identifier la couleur
   - Appuyer sur la bonne touche
   - Tout cela sans erreurs

3️⃣ Pour commencer le test
   ➜ Appuyez sur la touche Entrée

4️⃣ Répétez 5 fois
   ➜ Fin des 5 tentatives
   ➜ Vous obtiendrez vos résultats

💡 Ce que cela mesure :

• Temps de décision (pas seulement réaction)
• Capacité d'identification et de discrimination
• Traitement cognitif = ralentissement
• Plus réaliste sur la route

🎯 Résultat attendu :

Les résultats seront plus lents que les tests 1 et 2.

Habituellement : 0,30 - 0,60 seconde (ou plus)

💡 Note importante :

Les temps augmentent considérablement !

La raison : l'ajout d'une décision ralentit la réaction.
Cela se rapproche vraiment de la réalité de la route.`
    },
    {
      lessonNumber: 6,
      title: 'Test 4 : Stimulus complexe objets multiples',
      content: `Page 6/10

Quatrième test : réaction avec décision complexe

Le concept :
✓ Le plus proche de la réalité de la route
✓ Plusieurs objets sur l'écran
✓ Vous devez chercher et identifier

📋 La procédure :

1️⃣ Les objets apparaîtront sur l'écran
   • Formes différentes
   • Couleurs différentes

2️⃣ En haut de l'écran :
   • La forme et la couleur cible (ce que vous cherchez)
   • Exemple : "carré rouge" ou "triangle bleu"

3️⃣ Vous devez :
   - Scanner les objets qui passent
   - Identifier ce qui correspond
   - Cliquer dessus
   - Parmi beaucoup d'autres

4️⃣ Pour commencer le test
   ➜ Appuyez sur la touche Entrée

5️⃣ Répétez 5 fois
   ➜ Fin des 5 tentatives
   ➜ Vous obtiendrez vos résultats

💡 Ce que cela mesure :

• Attention sélective
• Discrimination parmi plusieurs stimuli
• Recherche visuelle
• Très proche de la condition réelle de la route
• Vous devez chercher le danger, pas seulement le voir

🎯 Résultat attendu :

Les temps seront beaucoup plus longs.

Habituellement : 0,60 - 2+ secondes

💡 Note importante :

Cette fois, les résultats se rapprochent vraiment du temps réel sur la route (plus d'une seconde).

La complexité de la recherche et de l'identification ralentit considérablement la réaction !`
    },
    {
      lessonNumber: 7,
      title: 'Résultats des tests',
      content: `Page 7/10

Analyse des résultats de tous les tests

🎯 Résumé : augmentation de la complexité

Test 1 - Stimulus visuel simple :
• Résultat : 0,15 - 0,40 seconde (très rapide)
• Tâche : voir + appuyer
• Complexité : minimale

Test 2 - Stimulus auditif simple :
• Résultat : 0,15 - 0,30 seconde (très rapide)
• Tâche : écouter + appuyer
• Complexité : minimale

Test 3 - Choix de couleur :
• Résultat : 0,30 - 0,60 seconde (rapide mais plus lent)
• Tâche : voir + identifier + choisir la bonne touche
• Complexité : augmentation (décision)

Test 4 - Objets complexes :
• Résultat : 0,60 - 2+ secondes (plus long)
• Tâche : recherche parmi plusieurs choix + identification + clic
• Complexité : élevée (similaire à la route)

📊 Modèle observé :

« Plus la complexité de la tâche augmente, plus le temps de réaction est long »

Taux d'augmentation :
• Simple → avec choix : ×2 plus long
• Simple → complexe : ×4-10 plus long

💡 Ce que cela signifie :

Votre temps de réaction dépend de la situation.

Il n'est pas constant !

Il varie considérablement selon :
✓ La complexité du stimulus
✓ Le nombre de choix possibles
✓ La difficulté de discrimination
✓ Votre niveau d'attention

⚠️ Implications pour la route :

Les obstacles sur la route ne sont jamais comme les tests 1 ou 2.

Ils sont toujours comme le test 4 (ou plus complexe) :
- Vous avez plusieurs objets sur l'écran (autres voitures, bus, piétons)
- Vous devez identifier le danger spécifique
- Et prendre une décision sur comment réagir

C'est toujours complexe !
C'est toujours long (minimum une seconde)

Cette complexité sert de base aux pages suivantes.`
    },
    {
      lessonNumber: 8,
      title: 'Analyse des étapes du temps de réaction',
      content: `Page 8/10

Comprendre les étapes du temps de réaction

Le temps de réaction n'est pas instantané.

Il se divise en plusieurs étapes - chacune prend du temps.

📋 Les trois étapes principales :

1️⃣ Perception (capture du stimulus)
   ⏱️ Durée : 0,1 - 0,3 seconde
   
   Ce qui se passe :
   • Nos yeux et oreilles capturent le stimulus
   • La lumière ou le son atteint la rétine ou l'oreille
   • Le signal est transmis via le nerf optique ou auditif
   • Un message est envoyé au cerveau
   
   Exemple sur la route :
   ✓ Vous voyez un piéton apparaître
   ✓ La lumière frappe votre rétine
   ✓ Le signal est envoyé au cerveau

2️⃣ Reconnaissance et décision (traitement cérébral)
   ⏱️ Durée : 0,3 - 0,7 seconde
   
   Ce qui se passe :
   • Le cerveau reçoit le message
   • Reconnaît ce qui a été vu ou entendu
   • Analyse la situation
   • Décide de la réponse appropriée
   • Transmet les ordres pour réagir
   
   Exemple sur la route :
   ✓ Le cerveau reconnaît : "c'est un piéton"
   ✓ Analyse : "il traverse la route"
   ✓ Décision : "je dois freiner"
   ✓ Ordre : "pose ton pied sur le frein et appuie fort"

3️⃣ Action motrice (exécution du mouvement)
   ⏱️ Durée : 0,1 - 0,3 seconde
   
   Ce qui se passe :
   • Le cerveau envoie des ordres aux muscles
   • Le signal moteur voyage via les nerfs
   • Atteint les muscles appropriés
   • Les muscles se contractent
   • Le mouvement physique commence
   
   Exemple sur la route :
   ✓ Le pied se déplace vers le frein
   ✓ La pression sur le frein commence
   ✓ Le système de freinage hydraulique démarre

📊 Total = 0,5 - 1,3 seconde minimum

Et c'est dans des conditions optimales (stimuli simples, conducteur attentif).

🧠 Schéma simplifié du traitement cérébral :

Stimulus → Perception → Reconnaissance → Décision → Ordre moteur → Exécution

À chaque étape : le temps passe

Plus la complexité du stimulus augmente :
- La reconnaissance prend plus de temps
- La décision prend plus de temps
- Le total devient plus long

💡 Pourquoi ces étapes sont importantes à comprendre :

Chaque étape peut être ralentie par différents facteurs :

L'étape 1 (Perception) ralentit à cause de :
✗ Mauvaise vision (pluie, brouillard, nuit)
✗ Vision floue (fatigue, mauvaise vue)
✗ Éblouissement

L'étape 2 (Décision) ralentit à cause de :
✗ Alcool (ralentit la perception)
✗ Fatigue (ralentit l'analyse mentale)
✗ Distraction (contexte distrayant)
✗ Stimulus complexe (nécessite plus d'analyse)

L'étape 3 (Action) ralentit à cause de :
✗ Réactions lentes (âge, alcool, fatigue)
✗ Système de freinage usé
✗ Articulations raides

🎯 Le message principal :

Le temps de réaction n'est pas juste un chiffre.

C'est le résultat de 3 étapes en série, chacune pouvant ralentir.

Comprendre ces étapes aide à comprendre pourquoi la sécurité sur la route dépend de tous ces facteurs.`
    },
    {
      lessonNumber: 9,
      title: 'Pourquoi le temps de réaction est plus long sur la route',
      content: `POURQUOI LE TEMPS DE RÉACTION EST PLUS LONG SUR LA ROUTE :

Les tests étaient :
✓ Un seul stimulus clair
✓ Aucune distraction
✓ Conditions contrôlées
✓ Vous focu à 100%
✓ Aucune fatigue/alcool

La route est :
✗ Multiples stimuli en même temps
✗ Stimuli complexes (pas juste forme/couleur)
✗ Environnement chaotique
✗ Vous partagez attention (passagers, musique, pensées)
✗ Stress, fatigue, alcool possiblement présents

⏱️ RÉSULTATS RÉELS SUR LA ROUTE :

« Les tests précédents étaient relativement simples. Vous aviez réagi en moyenne en moins d'une seconde. »

« Sur la route, les informations à interpréter sont plus nombreuses et plus complexes. Le temps de réaction est au minimum d'une seconde. »

Cela signifie :
✗ Au minimum 1 seconde
✗ Souvent 1,5-2 secondes
✗ Peut être beaucoup plus long

🎯 FACTEURS QUI ALLONGENT LE TEMPS DE RÉACTION SUR LA ROUTE :

1️⃣ FATIGUE
• Réduit focus et vigilance
• Ralentit traitement cérébral
• Affecte coordination motrice
RÉSULTAT : +0,5-2 secondes

2️⃣ ALCOOL
• Ralentit cognition directement
• Réduit focus visuel
• Ralentit réflexes
RÉSULTAT : +0,5-3 secondes

3️⃣ TÉLÉPHONE/DISTRACTION
• Détourne attention de la route
• Ralentit détection stimulus
• "Temps de retour" même après arrêt
RÉSULTAT : +1-5+ secondes

4️⃣ ÂGE
• Réflexes naturellement plus lents
• Vision moins bonne
RÉSULTAT : +0,5-1,5 secondes

5️⃣ STRESS/PANIQUE
• Surcharge cognitive
• Réaction irrationnelle
• Mal calculée
RÉSULTAT : +1-3 secondes

⚠️ « Mais ce délai augmente avec la fatigue, l'alcool, … et n'a pas de limite ! »

Cela signifie :
✗ Il n'y a PAS de limite supérieure
✗ Quelqu'un de très fatigué peut réagir en 5+ secondes
✗ Très alcoolisé : 5-10+ secondes possible (ou pas du tout)
✗ Distance parcourue pendant ce temps = catastrophe à haute vitesse

📊 EXPÉRIENCE INTERACTIVE : VISUALISER LA DISTANCE

« Faites varier le temps de réaction (pointeur jaune) et observez les distances parcourues »

À différentes vitesses et temps de réaction :

À 50 km/h :
• Temps 0,5 sec = 7 mètres
• Temps 1,0 sec = 14 mètres
• Temps 2,0 sec = 28 m (catastrophe !)

À 90 km/h :
• Temps 0,5 sec = 12,5 mètres
• Temps 1,0 sec = 25 mètres
• Temps 2,0 sec = 50 m (très dangereux)

À 110 km/h :
• Temps 0,5 sec = 15 mètres
• Temps 1,0 sec = 30 mètres
• Temps 2,0 sec = 60 m (extrêmement dangereux)

À 130 km/h :
• Temps 0,5 sec = 18 mètres
• Temps 1,0 sec = 36 mètres
• Temps 2,0 sec = 72 m (FATAL)

💡 OBSERVATION HORRIFIANTE :

À temps de réaction doublé (de 1 à 2 secondes) :
→ La distance DOUBLE aussi
→ À 130 km/h : 36 m → 72 m
→ C'est 40 mètres DE PLUS où vous êtes AVEUGLE

Cette différence = différence entre survie et mort.

🎯 MESSAGE FINAL DE CETTE PAGE :

Sur la route :
✓ Minimum 1 seconde = réalité
✓ Souvent 2+ secondes en réalité
✓ Fatigue/alcool = 3-5+ secondes
✓ À vitesse, cela se traduit en DIZAINES de mètres

C'est quoi faut-il considérer pour les distances de sécurité.`
    },
    {
      lessonNumber: 10,
      title: 'Conclusion : Le temps critique de réaction',
      content: `Page 10/10

RÉPONSE FINALE À LA QUESTION INITIALE :

« Quel temps faut-il pour agir ? »

🎯 RÉPONSE SIMPLE :

« Le temps pris pour analyser un message perçu, l'interpréter et réagir en conséquence est sur la route d'une seconde au minimum. »

Cela veut dire :
✓ MINIMUM 1 seconde (c'est le BASE)
✓ Rarement moins que 1 seconde sur vraie route
✓ Souvent beaucoup PLUS que 1 seconde
✓ Jamais instantané

⏱️ MAIS POURQUOI 1 SECONDE C'EST LONG SUR LA ROUTE ?

« Or, sur la route, une seconde, c'est déjà long. »

Exemple à 90 km/h :
✓ 1 seconde = 25 mètres parcourus
✓ 25 mètres, c'est une bonne maison de profondeur
✓ Pendant que vous avancez ces 25 m vous voyez le danger MAIS vous ne pouvez rien faire

À 110 km/h :
✓ 1 seconde = 30 mètres
✓ À 2 secondes = 60 mètres
✓ C'est énorme !

À 130 km/h :
✓ 1 seconde = 36 mètres
✓ À 2 secondes = 72 mètres
✓ Vous êtes incontrôlable

💡 POURQUOI C'EST DRAMATIQUE :

« Et tout ce qui allonge encore le temps de réaction (alcool, fatigue, téléphone, …) peut avoir des conséquences dramatiques. »

Cela signifie littéralement :

Facteur qui ralentit réaction → Distance supplémentaire parcourue → Accident plus grave ou inévitable

Exemples de conséquences :

Alcool (+1 seconde réaction) :
• À 90 km/h +1 sec = 25m supplémentaires = collision plutôt qu'évitement
• Enfant de 8 ans meurt plutôt que survit

Téléphone (+3 secondes) :
• À 110 km/h +3 sec = 90m supplémentaires
• Vous ne voyez même pas l'obstacle jusqu'à collision
• IMPOSSIBLE à esquiver

Fatigue (+2 secondes) :
• À 130 km/h +2 sec = 72m supplémentaires
• Vous êtes complètement vulnérable
• Autoroute devient extrêmement dangereuse

Combinaisons (alcool + fatigue + téléphone) :
• +5-10 secondes possibles
• À vitesse = parcourir 150-300 mètres
• Pendant ce temps : INCONSCIENT DU DANGER

📊 SYNTHÈSE COMPLÈTE :

ÉTAPE 1 : Perception (0,1-0,3s) → Vous voyez
ÉTAPE 2 : Décision (0,3-0,7s) → Votre cerveau réfléchit
ÉTAPE 3 : Action (0,1-0,3s) → Vous agissez

TOTAL = 0,5-1,5 secondes EN CONDITION OPTIMALE

TOTAL = 1-3 secondes EN RÉALITÉ
TOTAL = 3-5+ secondes AVEC FACTEURS DE RISQUE

DISTANCE À CETTE VITESSE À CETTE DURÉE = VIE OU MORT

🎯 RESPONSABILITÉ PERSONNELLE :

Chaque seconde compte. Littéralement.

Ce que vous pouvez faire :

1️⃣ COMPRENDRE VOTRE TEMPS DE RÉACTION
   ✓ Sachez qu'il n'est jamais < 1 seconde sur route
   ✓ Acceptez les limites humaines
   ✓ Ne vous crovez pas surhumain

2️⃣ ÉLIMINER LES RALENTISSEURS
   ✓ Jamais d'alcool avant conduite
   ✓ Jamais de téléphone
   ✓ Ne pas conduire fatigué
   ✓ Pas de distraction

3️⃣ ADAPTER VOTRE CONDUITE
   ✓ Réduire vitesse (moins de distance par seconde)
   ✓ Augmenter distance de sécurité
   ✓ Être de plus en plus vigilant
   ✓ Anticiper les dangers

4️⃣ ACCEPTER QUE L'URGENCE EST RÉELLE
   ✓ Chaque seconde = des mètres
   ✓ Quelques cas de mètres supplémentaires = différence life/death
   ✓ Alcool/fatigue/téléphone n'est pas "petit risque" = risque mortel

💡 VÉRITÉ INÉVITABLE :

Vous n'êtes pas plus rapide que les lois de la physique.

1 seconde de temps de réaction + vitesse = distance inévitable parcourue.

Rien ne change cela.

Aucune expérience, aucune pratique ne rend l'humain instant dans la réaction.

La seule stratégie est :
✓ Respecter cette limite
✓ Adapter votre conduite à ce fait
✓ Ne jamais la défier

Soyez responsable. Comprenez votre temps de réaction et conduisez en conséquence.

C'est votre vie. C'est celle d'autrui.`
    }
  ]
};
