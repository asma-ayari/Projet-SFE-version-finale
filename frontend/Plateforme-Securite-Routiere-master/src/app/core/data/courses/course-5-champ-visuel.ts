import { CourseContent } from '../../../core/services/course-content.service';

export const COURSE_5_CHAMP_VISUEL: CourseContent = {
  id: 5,
  title: 'Champ visuel',
  icon: '👀',
  category: 'Sécurité',
  duration: '35 min',
  description: 'Comprendre comment notre vision change selon la vitesse et son impact sur la sécurité routière',
  totalPages: 6,
  lessons: [
    {
      lessonNumber: 1,
      title: 'Comment voyons-nous lorsque nous conduisons ?',
      content: `Page 1/6

C'est une question simple, mais la réponse affecte directement votre sécurité routière.

Lorsque vous conduisez, votre vision n'est pas fixe. Elle change constamment selon :
✓ Votre vitesse
✓ Vos émotions (peur, tension)
✓ La fatigue
✓ L'attention
✓ Les conditions extérieures

Et ces changements peuvent être dangereux.

Ce cours explique comment vos yeux et votre cerveau perçoivent la route, et pourquoi la vitesse est très importante.

Préparez-vous à découvrir des choses étonnantes sur votre propre vision !`
    },
    {
      lessonNumber: 2,
      title: 'Expérience 1 : Vision centrale vs Vision périphérique',
      content: `Page 2/6

Comprendre les deux types de vision

L'œil fonctionne selon deux systèmes différents :

🎯 Vision centrale
Qu'est-ce que c'est ?
- La zone au centre de votre champ visuel
- Récepteurs très concentrés (cônes)
- Permet de voir les détails avec précision

Caractéristiques :
✓ Très claire et nette
✓ Haute précision
✓ Permet de lire les panneaux et détecter les obstacles
✓ Zone de vision la plus nette
✓ Couvre environ 45°

Exemple pratique :
- Lire un panneau stop
- Voir un feu de signalisation
- Lire la distance sur la route
- Détails du visage

👁️ Vision périphérique
Qu'est-ce que c'est ?
- Les zones à droite et à gauche du centre
- Récepteurs moins concentrés (bâtonnets)
- Moins de détails mais sensible aux mouvements

Caractéristiques :
✓ Moins claire mais beaucoup plus large
✓ Sensible aux mouvements
✓ Aide à percevoir l'environnement général
✓ Révèle les dangers potentiels
✓ Couvre environ 200° chez l'humain

Exemple pratique :
- Voir une voiture approcher sur le côté
- Détecter un piéton sur le trottoir
- Remarquer un animal entrer sur la route
- Voir d'autres véhicules sur les côtés

Expérience pratique illustrative :

Tentative 1 : Placez un signe + à l'intérieur du cercle (au centre)
❓ Qu'avez-vous vu d'autre ?
✓ Difficile à déterminer ! Presque rien dans la vision centrale

Tentative 2 : Refaites la même chose
❓ Qu'avez-vous vu cette fois ?
✓ Vous auriez dû remarquer une image de voiture

💡 Pourquoi y a-t-il une différence ?
- Dans la deuxième tentative, vous vous y attendiez
- Vous aviez une attention périphérique prête
- La vision périphérique a capté le mouvement
- Votre cerveau a traité l'information mieux

🎯 Conclusion importante :

Vous avez vu la voiture mieux dans la deuxième tentative parce que :
1. Elle est apparue dans votre champ de vision centrale (meilleurs détails)
2. Vous vous y attendiez (cerveau prêt)
3. Votre attention périphérique était active

La vision centrale et périphérique travaillent ensemble pour former une compréhension complète de la route !`
    },
    {
      lessonNumber: 3,
      title: 'Expérience 2 : Effet de la vitesse sur la perception',
      content: `Page 3/6

Pourquoi la vitesse affecte ce que vous voyez

Expérience illustrative : Comptez les voitures

Tâche : Observez bien et comptez le nombre de voitures affichées.

À basse vitesse (par exemple en passant lentement) :
✓ Vous voyez chaque voiture facilement
✓ Vous pouvez compter avec précision
✓ Vous remarquez les détails (couleur, type)
✓ Vision claire et stable

À vitesse moyenne :
⚠️ Vous commencez à en manquer certaines
⚠️ Le mouvement devient confus
⚠️ Il devient difficile de compter avec précision
⚠️ La vision devient légèrement floue

À haute vitesse :
❌ Vous ne voyez pas toutes les voitures
❌ Il est difficile d'estimer le nombre
❌ La vision devient très perturbée
❌ Les détails disparaissent avec la vitesse

💡 Note scientifique :

« Comme vous l'avez remarqué, la vitesse trouble notre perception visuelle. »

Cela signifie :
✗ Plus la vitesse augmente, moins votre vision est claire
✗ Plus la vitesse augmente, moins votre capacité à traiter l'information est grande
✗ Plus la vitesse augmente, moins votre attention aux détails est grande
✗ Plus la vitesse augmente, plus les dangers deviennent cachés

🔍 Interprétation neurologique :

Votre cerveau reçoit les images, mais ne peut pas les traiter à la même vitesse.

À 50 km/h :
• Vous avez assez de temps pour traiter chaque détail
• Chaque danger a une chance d'être vu
• Une réponse appropriée devient possible

À 90 km/h :
• Les images changent très rapidement
• Le cerveau saute certains détails
• Certains dangers passent inaperçus

À 130 km/h :
• Les images sont à peine enregistrées
• Vous voyez la direction mais pas les détails
• Beaucoup de dangers deviennent invisibles

📊 Résultat effrayant :

À une certaine vitesse, votre capacité à voir et traiter les informations visuelles diminue considérablement.

Cela explique les accidents :
• À 90 km/h : les dangers sont manqués
• À 110 km/h : vous ne les voyez presque pas
• À 130 km/h : vous devenez presque aveugle aux détails`
    },
    {
      lessonNumber: 4,
      title: 'Structure du champ visuel et ses limites',
      content: `Page 4/6

Anatomie de votre vision pendant la conduite

📐 L'étendue totale du champ visuel

Notre champ visuel couvre un angle d'environ 180°.

C'est plus que ce que nous pensons habituellement :
✓ Directement devant vous : 90°
✓ Vers la gauche : 60-70°
✓ Vers la droite : 60-70°
✓ Légèrement vers le bas : 70°

Total = environ 180° théoriquement

Mais en réalité...

🔴 Vision centrale vs Vision périphérique

Vision centrale :
✓ Très nette et claire
✓ Environ 45° seulement
✓ Permet de percevoir les détails
✓ Réactions visuelles rapides

Vision périphérique :
✓ Moins claire mais beaucoup plus large (~135° supplémentaires)
✓ Particulièrement sensible aux mouvements
✓ Aide à percevoir l'environnement
✓ Alerte sur les dangers potentiels

💡 Pourquoi c'est important pour la sécurité :

Vision centrale = Ce que vous lisez (panneaux, signaux)
Vision périphérique = Ce qui peut vous tuer (dangers latéraux)

Si vous n'avez que la vision centrale, vous êtes aveugle sur les côtés !

⚠️ Le problème : La vision périphérique devient moins claire avec la vitesse

C'est le problème crucial pour la sécurité routière :

Vision périphérique à 50 km/h :
✓ Reste relativement claire
✓ Capte bien les mouvements
✓ Vous alerte sur les dangers
✓ Vous voyez les piétons sur le trottoir

Vision périphérique à 70 km/h :
⚠️ Commence à s'assombrir
⚠️ Perçoit les mouvements moins clairement
⚠️ Certains détails latéraux deviennent invisibles
⚠️ Vous pouvez manquer les piétons

Vision périphérique à 100+ km/h :
❌ Devient très floue
❌ Presque inutile
❌ Les dangers latéraux sont souvent invisibles
❌ Vous devenez aveugle à ce qui se passe sur les côtés

🎯 Résultat direct :

« La vision périphérique nous aide à percevoir l'environnement et nous alerte sur les dangers potentiels, mais attention, elle devient moins claire avec la vitesse. »

Cela signifie :
✗ À basse vitesse : vous voyez les dangers
✗ À vitesse moyenne : vous les voyez moins bien
✗ À haute vitesse : vous ne les voyez pas

C'est pourquoi les zones à 50 km/h (les villes) sont beaucoup plus sûres que nous ne le pensons. À cette vitesse, vous voyez vraiment les dangers !`
    },
    {
      lessonNumber: 5,
      title: 'Vision et vitesse : Présentation visuelle',
      content: `Page 5/6

Observation directe : Comment votre champ visuel change

Expérience interactive : Choisissez une vitesse et observez

À 30 km/h :
✓ Champ visuel large et très clair
✓ Vision périphérique nette
✓ Vous voyez les détails sur les côtés
✓ Tous les dangers sont visibles
✓ Temps d'adaptation aux changements : rapide

À 50 km/h :
✓ Le champ visuel reste bon
✓ La vision périphérique reste claire
✓ Les détails latéraux sont visibles
✓ La plupart des dangers restent visibles
✓ Mais il y a une légère diminution périphérique

À 70 km/h (route nationale) :
⚠️ Le champ visuel commence à se rétrécir
⚠️ La vision périphérique devient moins claire
⚠️ Les détails latéraux sont moins nets
⚠️ Certains dangers deviennent difficiles à voir
⚠️ La concentration visuelle vers l'avant augmente

À 90 km/h (limite maximale sur route nationale) :
⚠️ Le champ visuel diminue de manière notable
⚠️ La vision périphérique devient floue
⚠️ Les détails sur les côtés sont à peine visibles
⚓ Beaucoup de dangers latéraux passent inaperçus
⚠️ Votre regard devient dirigé presque uniquement vers l'avant

À 110 km/h (limite minimale sur autoroute) :
❌ Champ visuel très rétréci
❌ Vision périphérique très floue
❌ Presque aucun détail latéral n'apparaît
❌ Les dangers latéraux sont presque invisibles
❌ Comme si vous conduisiez dans un tunnel

À 130 km/h (limite maximale sur autoroute) :
❌ Champ visuel très limité
❌ Vision périphérique très floue
❌ Aucun détail latéral visible
❌ Les dangers latéraux sont totalement invisibles
❌ Vision tunnel complète

💡 Le modèle observé :

Plus la vitesse augmente :
→ Le champ visuel se rétrécit
→ La vision périphérique s'estompe
→ Votre regard se concentre loin devant vous
→ Les côtés deviennent invisibles

Comme si vous conduisiez avec des lunettes de soleil sur les côtés !

📊 Effets sur la sécurité :

À basse vitesse (50 km/h) :
✓ Vous voyez les piétons sur le trottoir
✓ Vous voyez les cyclistes à côté de vous
✓ Vous voyez les voitures venant des côtés
✓ Vous avez assez de temps pour réagir

À haute vitesse (110+ km/h) :
✗ Vous ne voyez pas les piétons
✗ Vous ne voyez pas le cycliste
✗ Vous ne voyez pas la voiture latérale
✗ Il n'y a pas assez de temps pour réagir

⚠️ Cette présentation explique :

Pourquoi les autoroutes (130 km/h) ont moins d'accidents que les zones urbaines (50 km/h) :
- Il n'y a pas de piétons, vélos ou animaux traversant l'autoroute
- Sur l'autoroute, nous nous concentrons uniquement sur la route (vision tunnel = normal)
- Dans les zones urbaines, nous devons voir les côtés (mais nous ne les voyons pas à haute vitesse)

C'est pourquoi conduire à 70 km/h dans une zone limitée à 50 km/h est dangereux :
- À 70 km/h, vous voyez mal les côtés (où il y a des piétons et vélos)
- À 50 km/h légal, vous les voyez clairement
- La limite n'est pas arbitraire, elle est liée à votre capacité visuelle !`
    },
    {
      lessonNumber: 6,
      title: 'Conclusion : La vitesse affecte la vision et la sécurité',
      content: `Page 6/6

La réponse finale à la première question :

« Comment voyons-nous lorsque nous conduisons ? »

La réponse dépend entièrement de votre vitesse.

📊 Une réalité scientifique inévitable :

« Lorsque nous nous déplaçons rapidement, notre perception visuelle devient moins claire sur les côtés et les dangers deviennent moins perceptibles. »

Cela signifie littéralement :
✗ Les dangers existent mais vous ne les voyez pas
✗ Non pas parce que le danger n'existe pas
✗ Mais parce que votre vision le cache
✗ Et vous vous dirigez vers lui sans vous en rendre compte

🎯 Implication directe sur les limites de vitesse :

« C'est l'une des raisons pour lesquelles le respect des limites de vitesse est important. »

Mais pourquoi exactement ?

Parce que les limites de vitesse sont déterminées selon la complexité de l'environnement :

🚗 Zones 50 km/h (zones urbaines)
Environnement :
• Beaucoup de piétons
• Enfants sur les trottoirs
• Vélos dans la circulation
• Stationnements
• Passages clairement marqués
• Intersections
• Entrées de magasins

Pourquoi 50 km/h ?
✓ À cette vitesse, vous voyez les piétons et les cyclistes
✓ Vous avez assez de temps pour réagir
✓ Les côtés restent visibles
✓ Les dangers latéraux peuvent être perçus
✓ C'est la seule vitesse sûre pour cette complexité

Résultat : Conduire à 70 km/h dans une zone à 50 ?
✗ Vous ne verrez pas l'enfant qui traverse
✗ Vous ne verrez pas le cycliste à côté de vous
✗ La vision périphérique devient très floue
✗ Collision inévitable

🛣️ Routes nationales à 90 km/h
Environnement :
• Moins de piétons
• Moins d'intersections
• Circulation plus linéaire
• Mais il y a encore des entrées et sorties

Pourquoi 90 km/h ?
✓ À cette vitesse (limite raisonnable), vous voyez encore les dangers importants
✓ À 110 km/h, la vision devient très étroite pour cette zone

⌛ Autoroutes à 110-130 km/h
Environnement :
• Pas de piétons
• Pas de vélos
• Circulation à sens unique
• Pas d'interruption

Pourquoi 130 km/h ?
✓ À cette vitesse, il n'y a que d'autres véhicules comme danger
✓ Vision tunnel = normal sur l'autoroute (pas de côtés à surveiller)
✓ L'augmentation de la vitesse réduit le temps d'urgence mais est acceptable sur l'autoroute car les variables sont moins nombreuses

💡 La grande vérité :

Les limites de vitesse ne sont pas arbitraires !

Elles correspondent à :
1. La capacité visuelle humaine selon la vitesse
2. Le type de dangers présents dans chaque zone
3. La correspondance entre vitesse et environnement

Un enfant qui traverse à 50 km/h = susceptible de vous voir et de s'arrêter
Un enfant qui traverse à 70 km/h dans une zone à 50 km/h = vous ne le verrez qu'au moment de l'impact

⚠️ Le message final :

Respecter les limites de vitesse, c'est respecter les limites de votre vision.

C'est pourquoi :
✓ 50 km/h en ville est la vitesse correcte (vous voyez les dangers)
✓ 90 km/h sur la route est la vitesse correcte (vous voyez assez)
✓ 130 km/h sur l'autoroute est la vitesse correcte (pas de côtés à surveiller)

Dépasser ces limites = cécité aux dangers qu'elles régulent.

Chaque limite de vitesse est une limite de sécurité visuelle.

🎯 Responsabilité personnelle :

En tant que conducteur, vous devez accepter que :
• Non, vous n'êtes pas assez vigilant à haute vitesse
• Non, vos réflexes ne compensent pas la perte de vision
• Non, l'expérience ne change pas la façon dont l'œil fonctionne
• Non, l'anatomie humaine ne change pas

Respectez les vitesses = respectez les limites de la vision humaine.

C'est la science. C'est la sécurité. C'est votre vie et celle des autres.`
    }
  ]
};
