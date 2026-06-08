import { CourseContent } from '../../../core/services/course-content.service';

export const COURSE_11_PREMIERS_SECOURS: CourseContent = {
  id: 11,
  title: 'Premiers secours',
  icon: '🏥',
  category: 'Sécurité',
  duration: '50 min',
  description: 'Les gestes et procédures essentiels pour réagir correctement en cas d\'accident',
  totalPages: 7,
  lessons: [
    {
      lessonNumber: 1,
      title: 'Comment réagir en cas d\'accident ?',
      content: `Page 1/7

Vous circulez sur une route et soudain vous arrivez sur les lieux d'un accident qui vient de se produire.

Votre réaction dans les premières minutes est CRITIQUE.

Vos actions peuvent :
✓ Sauver des vies
✓ Prévenir un suraccident (nouvelle collision)
✓ Permettre aux secours d'intervenir efficacement

La procédure à suivre est simple et s'appelle PAS :
🔴 PROTÉGER - les lieux de l'accident
🟠 ALERTER - les services d'urgence
🟡 AIDER/SECOURIR - les victimes

Problème : Vous avez protégé, alerté, aidé.
Résultat : Grâce à vous, les secours sont là !`
    },
    {
      lessonNumber: 2,
      title: 'Page 2/7 : Visualisation de l\'accident',
      content: `Page 2/7

En arrivant sur les lieux d'un accident, plusieurs objets et actions sont nécessaires pour réagir correctement :

📍 Les équipements à placer aux bons endroits :

• TRIANGLES DE DANGER
  ➜ À placer à 30 m devant et derrière l'accident (jour)
  ➜ À 100 m la nuit pour meilleure visibilité
  ➜ Avertissent les autres usagers du danger

• GILET DE SÉCURITÉ FLUORESCENT
  ➜ À porter vous-même pour être visible
  ➜ Rend vous visible aux autres conducteurs
  ➜ Permet assistance plus facile

• VÉHICULE EN SÉCURITÉ
  ➜ Feux d'urgence allumés
  ➜ Garé en sécurité hors du flux de circulation
  ➜ Moteur éteint

• TÉLÉPHONE
  ➜ Pour appeler les secours
  ➜ À proximité pour communication rapide

Ces éléments, correctement placés, protègent la zone et les victimes de nouveaux accidents.`
    },
    {
      lessonNumber: 3,
      title: 'Étape 1 : PROTÉGER les lieux',
      content: `Page 3/7

En cas d'accident, il vous faut d'abord PROTÉGER pour éviter un suraccident (nouvelle collision).

⚠️ LE SURACCIDENT EST TRÈS COURANT

Un autre véhicule roulant trop vite peut percuter :
• Votre véhicule stationné
• Les véhicules accidentés
• Les secours en intervention
• Les victimes

📋 PROCÉDURE DE PROTECTION :

1️⃣ METTEZ-VOUS EN SÉCURITÉ (VOUS ET VOS PASSAGERS)
   ✓ Sortez du véhicule si possible
   ✓ Éloignez-vous de la route
   ✓ Portez gilet fluorescent en étant visible
   ✓ Ne restez pas près du trafic actif

2️⃣ ALERTEZ LES AUTRES USAGERS
   ✓ Allumez les feux d'urgence du véhicule
   ✓ Placez les triangles de danger :
     • À 30 mètres avant l'accident (en amont du trafic)
     • À 30 mètres après l'accident
     • Distance doublée la nuit (100m) pour meilleure visibilité
   ✓ Sur autoroute : 4 triangles si possible
   ✓ En côte : plus grande distance

3️⃣ ÉVITEZ L'INCENDIE
   ✓ Moteurs éteints
   ✓ Ne pas fumer
   ✓ Vérifier fuites (carburant)
   ✓ Préparez extincteur si nécessaire

4️⃣ IMMOBILISEZ LES VÉHICULES
   ✓ Frein à main engagé
   ✓ Cale si véhicule sur pente
   ✓ Coupez moteur des véhicules

💡 RÉSULTAT : La zone est sécurisée, les autres usagers avertis, suraccident évité.`
    },
    {
      lessonNumber: 4,
      title: 'Étape 2 : ALERTER les secours',
      content: `Page 4/7

Après avoir sécurisé la zone, vous devez alerter les secours RAPIDEMENT.

📞 COMMENT APPELER ?

Options d'appel d'urgence EN TUNISIE :
• NUMÉRO UNIQUE : 112 (fonctionne depuis tout téléphone)
• Pompiers : 198
• Police : 197
• Ambulance/Urgences : 193 / 201

💡 POUR LES AUTOROUTES :
• Bornes d'appel d'urgence (tous les 2km)
• Appel gratuit et direct aux secours
• GPS automatique de votre position
• Opérateur reste en ligne

📋 INFORMATIONS À DONNER :

1. LOCALISATION EXACTE
   • Route/autoroute et numéro
   • Sens de circulation
   • Repères visibles (sortie, pont, ville)
   • Kilomètre exact si autoroute
   • "À côté du restaurant" ou "avant le virage"

2. TYPE D'ACCIDENT
   • Nombre de véhicules impliqués
   • Types de véhicules (voiture, camion, bus)
   • Véhicules renversés ?
   • Matières dangereuses ?

3. BLESSÉS
   • Nombre approximatif
   • Personnes conscientes ou inconscientes ?
   • Blessures visibles (saignements importants)
   • Personnes emprisonnées (coincer)
   • Enfants impliqués ?

4. DANGERS IMMÉDIATS
   • Incendie ou fuite de carburant ?
   • Débris éparpillés sur la route ?
   • Zone à haut trafic ?
   • Conditions météorologiques difficiles ?

5. VOTRE STATUT
   • "Je suis témoin" ou "Je suis impliqué"
   • Numéro de téléphone de rappel
   • Restez en ligne jusqu'à confirmation

⚠️ NE RACCROCHEZ PAS immédiatement - le dispatcher peut avoir d'autres questions !`
    },
    {
      lessonNumber: 5,
      title: 'Étape 3 : AIDER les blessés',
      content: `Page 5/7

En attendant l'arrivée des secours, vous devez aider les blessés au mieux de vos capacités.

🚨 IMPORTANT : Ne vous fiez pas aux apparences !

Ce qui est grave n'est pas toujours spectaculaire :
• Une légère bosse peut cacher une commotion cérébrale
• Pas de saignement visible ne signifie pas perte interne
• L'absence de cri ne signifie pas absence de douleur
• Un blessé "conscient et calme" peut avoir des blessures graves

💡 PRINCIPE FONDAMENTAL :
Tous les blessés de l'accident doivent être évalués par les secours médicaux !

📋 GESTES D'AIDE DE BASE (sans formation spéciale) :

1. ÉVALUATION RAPIDE
   • Personne consciente ?
   • Respire ?
   • Saignements importants ?
   • Position stable ?

2. SI CONSCIENT ET STABLE
   ✓ Maintenez-le au calme
   ✓ Ne le déplacez pas inutilement
   ✓ Parlez-lui régulièrement (rassure et maintient conscience)
   ✓ Couvrez-le avec couverture de survie
   ✓ Donnez à boire SI conscient et stable
   ✓ Notez ses symptômes pour les secours

3. SI INCONSCIENT MAIS RESPIRE
   ✓ Position latérale de sécurité (si formation)
   ✓ Sinon : allongé sur le côté (libère voies respiratoires)
   ✓ Vérifiez respiration régulièrement
   ✓ Attendez les secours

4. SI INCONSCIENT ET NE RESPIRE PAS
   ⚠️ NÉCESSITE FORMATION SPÉCIALE !
   • Massage cardiaque : coordination bras/thorax
   • Ventilation artificielle : bouche-à-bouche ou masque
   • Ces gestes mal faits peuvent aggraver

⚡ DÉGÂTS IMPORTANTS VISIBLES :

• Saignement abondant → Compressez avec tissu propre
• Plaie à la tête → Ne pas toucher (risque contamination)
• Fracture évidente → Immobilisez le membre
• Brûlure → Rafraîchissez avec eau froide
• Poisoning/substance → Notez type exact pour secours

⚠️ ATTENTION : Certains gestes requièrent une formation :
✗ Ventilation artificielle
✗ Massage cardiaque
✗ Mise en position latérale (risque colonne vertébrale)
✗ Retrait de casque (motard blessé)

Sans formation, ne faites QUE ce que vous savez maîtriser vraiment.

💡 VOTRE RÔLE PRINCIPAL : Rassurer et attendre les secours professionnels.`
    },
    {
      lessonNumber: 6,
      title: 'Équipement de sécurité à avoir',
      content: `Page 6/7

Afin d'être le plus efficace possible en cas d'accident, il est recommandé d'avoir certains équipements dans sa voiture.

✅ ÉQUIPEMENTS OBLIGATOIRES EN TUNISIE :

🔴 TRIANGLES DE DANGER (2 minimum recommandés)
   • Couleur : rouge fluorescent
   • Fonction : avertir autres usagers
   • Placement : 30m avant et arrière (jour), 100m (nuit)
   • Législation : au moins 1 obligatoire, mieux 2
   • Zone autoroute : 4 recommandées

🔴 GILET DE SÉCURITÉ FLUORESCENT
   • Couleur : orange/jaune avec bandes réfléchissantes
   • Fonction : vous rendre visible
   • Taille : doit convenir à la personne
   • Législation : 1 par passager recommandé, au moins 1 obligatoire
   • Usage : portez-le immédiatement après arrêt

✅ ÉQUIPEMENTS FORTEMENT RECOMMANDÉS :

📦 TROUSSE DE PREMIERS SECOURS
   • Bandages stériles (plusieurs tailles)
   • Gaze stérile
   • Pansements adhésifs
   • Antiseptique
   • Gants stériles latex
   • Ciseaux
   • Pince à échardes
   • Paracétamol/Ibuprofène
   • Antiacide
   • Antihistaminique (allergie)

🌡️ COUVERTURE D'URGENCE THERMIQUE
   • Aluminium réfléchissant
   • Maintient chaleur corporelle
   • Très efficace mais fragile
   • Peu coûteuse
   • Indispensable en hiver

💡 LAMPE/TORCHE
   • Eclairage pour intervention de nuit
   • Batterie de secours
   • Lampe frontale mieux

🔧 OUTILS DE BASE
   • Pince-à-mors (démontage pièces)
   • Tournevis multifonctions
   • Clé anglaise
   • Cutter de sécurité
   • Cordon de remorquage

🧯 EXTINCTEUR
   • Capacité : 1 kg minimum
   • Type : approprié (feu de moteur)
   • Très utile pour feu de carburant
   • Obligatoire pour certains transport

📝 DOCUMENTS À GARDER
   • Assurance (photocopie)
   • Numéro d'urgence
   • Informations complètes du propriétaire
   • Numéros de urgence en français/anglais/arabe

💼 ÉQUIPEMENT COMPLÉMENTAIRE
   • Appareil photo jetable (accident)
   • Stylo et papier (noter infos)
   • Eau minérale (boire/rincer)
   • Mouchoirs
   • Sac poubelle (débris)
   • Gants de travail

🎯 CES ÉQUIPEMENTS PERMETTENT :
✓ Sécuriser la zone rapidement
✓ Intervenir efficacement
✓ Éviter un suraccident
✓ Aider les victimes de base
✓ Documenter l'accident
✓ Coopérer avec les secours`
    },
    {
      lessonNumber: 7,
      title: 'Conclusion : Réagir correctement sauve des vies',
      content: `Page 7/7

RÉSUMÉ : COMMENT RÉAGIR EN CAS D'ACCIDENT

🎯 DES GESTES SIMPLES PEUVENT SAUVER DES VIES

Le protocole PAS est simple mais CRITIQUE :

1️⃣ PROTÉGER
   ✓ Vous d'abord (puis autres)
   ✓ Triangles de danger
   ✓ Gilet de sécurité
   ✓ Feux d'urgence
   ✓ Zone sécurisée
   ✓ Éviter suraccident

2️⃣ ALERTER
   ✓ Appel d'urgence : 112
   ✓ Informations complètes
   ✓ Restez en ligne
   ✓ Suivez instructions

3️⃣ AIDER
   ✓ Rassurer les victimes
   ✓ Gestes de base simples
   ✓ Attendre secours pros
   ✓ Ne pas aggraver

⚠️ ÉLÉMENTS CRUCIAUX À RETENIR :

• Les premières minutes sont déterminantes
• La protection de la zone prévient d'autres accidents
• L'alerte rapide peut sauver une vie
• Vous n'êtes pas responsable de "guérir" - juste d'aider
• Les secours professionnels feront le reste

💡 RECOMMANDATION FORTE :

Pour être encore plus efficace en cas d'accident, nous vous conseillons VIVEMENT d'acquérir des notions de secourisme en suivant une formation :

✓ Formation officielle (croix rouge, pompiers)
✓ Reconnaître les urgences réelles
✓ Gestes d'urgence (RCP, mise stable)
✓ Gérer stress et situation chaotique
✓ Ces formations sont courtes (1-2 jours) et essentielles
✓ Beaucoup d'accidents attendent les "bons gestes"

Votre formation + équipement corrects = maximum de survie pour les victimes`
    }
  ]
};
