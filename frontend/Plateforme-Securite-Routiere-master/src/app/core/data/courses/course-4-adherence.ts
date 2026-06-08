import { CourseContent } from '../../../core/services/course-content.service';

export const COURSE_4_ADHERENCE: CourseContent = {
  id: 4,
  title: 'Adhérence',
  icon: '🛑',
  category: 'Physique',
  duration: '40 min',
  description: 'Comprenez comment l\'adhérence des pneus affecte votre freinage et votre sécurité routière en toutes conditions',
  totalPages: 6,
  lessons: [
    {
      lessonNumber: 1,
      title: 'Quelle incidence la pluie a-t-elle sur le freinage ?',
      content: `Page 1/6

L'adhérence est la friction entre vos pneus et la surface de la chaussée. Elle est le facteur déterminant de votre capacité à freiner efficacement.

Par temps de pluie, la présence d'eau sur la route modifie considérablement cette adhérence. Cela devrait susciter une réflexion importante sur la modification de votre comportement lors de précipitations.

Cette leçon vous aidera à comprendre:
✓ Comment l'adhérence affecte le freinage
✓ L'impact de la pluie sur les distances d'arrêt
✓ Les risques associés aux conditions mouillées
✓ Comment adapter votre conduite`
    },
    {
      lessonNumber: 2,
      title: 'Test d\'arrêt d\'urgence à 70 km/h',
      content: `Page 2/6

Scénario : Vous roulez à 70 km/h sur une route bien entretenue. Vous êtes attentif et concentré.

Soudain, vous apercevez un obstacle sur la route et freinez en urgence. Où va s'arrêter votre véhicule ?

Cela dépend de plusieurs facteurs :
- État des pneumatiques (neufs, usés, pression)
- Conditions climatiques (sec, mouillé, détrempé)
- État de la chaussée (pneus adhèrent différemment selon la surface)

📊 Les résultats seront très différents selon ces conditions !

Vous apprendrez à estimer votre distance d'arrêt réelle en fonction des conditions rencontrées sur la route.`
    },
    {
      lessonNumber: 3,
      title: 'Décomposition : Réaction vs Freinage',
      content: `Page 3/6

La distance d'arrêt reste composée de deux éléments comme auparavant :

1️⃣ DISTANCE DE RÉACTION
- Reste identique quels que soient la chaussée et l'état du véhicule
- C'est toujours ≈ 1 seconde entre l'obstacle et le début du freinage
- À 70 km/h → environ 20 mètres

2️⃣ DISTANCE DE FREINAGE
- DÉPEND de la vitesse ET de l'adhérence des pneumatiques
- C'est le facteur variable selon les conditions !

EXEMPLE AVEC PNEUS NEUFS À 70 km/h :

❌ Par temps sec :
• Réaction : 0 à ≈ 20 mètres
• Freinage : ≈ 20 à ≈ 44 mètres
• Total : ≈ 44 mètres

⚠️ Par temps de pluie :
• Réaction : 0 à ≈ 20 mètres
• Freinage : ≈ 20 à ≈ 68 mètres
• Total : ≈ 68 mètres

💡 La distance de freinage a DOUBLÉ malgré les pneus neufs !`
    },
    {
      lessonNumber: 4,
      title: 'Coefficient d\'adhérence et Aquaplanage',
      content: `Page 4/6

L'adhérence se mesure par un coefficient appelé μ (mu).

📊 COEFFICIENT D'ADHÉRENCE PAR CONDITIONS :

✓ CHAUSSÉE SÈCHE
- Coefficient μ ≈ 0,8
- Les pneus adhèrent correctement à la surface
- Meilleure performance de freinage

⚠️ CHAUSSÉE MOUILLÉE
- Coefficient μ ≈ 0,3 (à 90 km/h)
- L'eau est partiellement évacuée par les rainures du pneu
- Distance de freinage augmente significativement

❌ RISQUE D'AQUAPLANAGE
- En cas de fortes pluies ET pneumatiques usés
- Au-dessus d'une certaine vitesse, l'eau n'est plus évacuée
- Le véhicule "flotte" sur la chaussée
- Le pneu perd tout contact avec la route
- ADHÉRENCE = 0 → Véhicule incontrôlable
- Impossibilité de freiner ou tourner

🛑 L'AQUAPLANAGE EST EXTRÊMEMENT DANGEREUX !

Prévention :
✓ Vérifier régulièrement l'usure des pneus
✓ Réduire la vitesse par temps de pluie
✓ Maintenir une bonne pression des pneus`
    },
    {
      lessonNumber: 5,
      title: 'Comparaison des distances par conditions',
      content: `Page 5/6

Voici un tableau complet comparant les distances de freinage selon l'état de la chaussée et la vitesse :

📍 CHAUSSÉE SÈCHE (μ ≈ 0,8)
• 30 km/h : Réaction 9,5m + Freinage 14m = 23,5m
• 40 km/h : Réaction 12,1m + Freinage 20m = 32,1m
• 50 km/h : Réaction 15m + Freinage 27,2m = 42,2m
• 60 km/h : Réaction 17,9m + Freinage 35,5m = 53,4m
• 70 km/h : Réaction 20,5m + Freinage 44,8m = 65,3m
• 80 km/h : Réaction 23,4m + Freinage 55m = 78,4m
• 90 km/h : Réaction 26m + Freinage 66m = 92m
• 100 km/h : Réaction 28,9m + Freinage 78m = 106,9m
• 110 km/h : Réaction 31,5m + Freinage 91m = 122,5m

🌧️ CHAUSSÉE MOUILLÉE (μ ≈ 0,3)
• 30 km/h : Réaction 9,5m + Freinage 14,2m = 23,7m
• 40 km/h : Réaction 12,1m + Freinage 22,9m = 35m
• 50 km/h : Réaction 15m + Freinage 31,2m = 46,2m
• 60 km/h : Réaction 17,9m + Freinage 41,1m = 59m
• 70 km/h : Réaction 20,5m + Freinage 52,9m = 73,4m
• 80 km/h : Réaction 23,4m + Freinage 65,3m = 88,7m
• 90 km/h : Réaction 26m + Freinage 79m = 105m
• 100 km/h : Réaction 28,9m + Freinage 84,3m = 113,2m
• 110 km/h : Réaction 31,5m + Freinage 111m = 142,5m

⛈️ CHAUSSÉE DÉTREMPÉE (pluies torrentielles)
• 30 km/h : Réaction 9,5m + Freinage 18m = 27,5m
• 40 km/h : Réaction 12,1m + Freinage 28m = 40,1m
• 50 km/h : Réaction 15m + Freinage 39,5m = 54,5m
• 60 km/h : Réaction 17,9m + Freinage 53m = 70,9m
• 70 km/h : Réaction 20,5m + Freinage 68,9m = 89,4m
• 80 km/h : Réaction 23,4m + Freinage 86m = 109,4m
• 90 km/h : Réaction 26m + Freinage 105,8m = 131,8m
• 100 km/h : Réaction 28,9m + Freinage 127m = 155,9m
• 110 km/h : Réaction 31,5m + Freinage 150,5m = 182m

⚡ CONSTAT ALARMANT :
À 110 km/h, la distance d'arrêt passe de 122,5m (sec) à 182m (détrempé) = +49% !`
    },
    {
      lessonNumber: 6,
      title: 'Conclusion : Impact de la pluie sur le freinage',
      content: `Page 6/6

🎯 RÉSUMÉ ESSENTIEL

LA PLUIE AUGMENTE SIGNIFICATIVEMENT LA DISTANCE DE FREINAGE :

Comparaison à 70 km/h :
• Chaussée sèche : 65,3 mètres
• Chaussée mouillée : 73,4 mètres (+12%)
• Chaussée détrempée : 89,4 mètres (+37%)

⚠️ L'AUGMENTATION EST ENCORE PLUS IMPORTANTE AVEC DES PNEUS USÉS

Raisons scientifiques :
✓ L'eau sur la chaussée réduit le coefficient d'adhérence
✓ Les rainures du pneu ne peuvent plus évacuer l'eau efficacement
✓ Le risque d'aquaplanage augmente
✓ Le pneu usé ne peut pas adhérer correctement

💡 RECOMMANDATIONS PAR TEMPS DE PLUIE :

1️⃣ RÉDUISEZ VOTRE VITESSE
   - Réduction de 10-15% sur route mouillée
   - Plus importante par fortes pluies
   - Beaucoup plus importante sur routes détrempées

2️⃣ AUGMENTEZ LA DISTANCE DE SÉCURITÉ
   - Distance standard : 2 secondes
   - Par temps de pluie : 4-5 secondes minimum
   - Au moins doubler votre distance habituelle

3️⃣ VÉRIFIEZ VOS PNEUS RÉGULIÈREMENT
   - Profondeur des rainures (min. 1,6mm, idéalement 3-4mm)
   - Pression correcte
   - Pas de défauts

4️⃣ ADAPREZ VOTRE CONDUITE
   - Évitez manœuvres brusques
   - Freinage progressif et mesuré
   - Prudence accrue en virage

📊 TABLEAU RAPIDE DE RETENUES :
La pluie peut augmenter la distance d'arrêt de 50%, voire plus !

Soyez prudent, réduisez votre vitesse et augmentez vos distances de sécurité par temps de pluie.`
    }
  ]
};
