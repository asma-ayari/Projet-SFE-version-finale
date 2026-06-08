"""
Service de detection des panneaux de signalisation dans les reponses du chatbot.
Associe les panneaux mentionnes a leurs images correspondantes.
"""
from typing import List, Dict


# ========================================================================
# Base de donnees des panneaux de signalisation routiere (Tunisie / norme internationale)
# Chaque panneau a : id, nom FR, nom AR, mots-cles FR, mots-cles AR, categorie, image
# ========================================================================

SIGNS_DATABASE: List[Dict] = [
    # ===================== PANNEAUX D'INTERDICTION (cercle rouge) =====================
    {
        "id": "interdit_circuler",
        "name_fr": "Interdiction de circuler",
        "name_ar": "\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u0645\u0631\u0648\u0631",
        "category": "interdiction",
        "image": "interdit_circuler.svg",
        "keywords_fr": ["interdiction de circuler", "interdit de circuler", "circulation interdite", "acces interdit"],
        "keywords_ar": ["\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u0645\u0631\u0648\u0631", "\u062d\u0638\u0631 \u0627\u0644\u0645\u0631\u0648\u0631"],
    },
    {
        "id": "sens_interdit",
        "name_fr": "Sens interdit",
        "name_ar": "\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u062f\u062e\u0648\u0644",
        "category": "interdiction",
        "image": "sens_interdit.svg",
        "keywords_fr": ["sens interdit", "entree interdite", "acces interdit"],
        "keywords_ar": ["\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u062f\u062e\u0648\u0644", "\u0627\u062a\u062c\u0627\u0647 \u0645\u0645\u0646\u0648\u0639"],
    },
    {
        "id": "stop",
        "name_fr": "Stop - Arret obligatoire",
        "name_ar": "\u0642\u0641 - \u062a\u0648\u0642\u0641 \u0625\u062c\u0628\u0627\u0631\u064a",
        "category": "interdiction",
        "image": "stop.svg",
        "keywords_fr": ["stop", "arret obligatoire", "panneau stop", "marquer l'arret"],
        "keywords_ar": ["\u0642\u0641", "\u062a\u0648\u0642\u0641 \u0625\u062c\u0628\u0627\u0631\u064a", "\u0639\u0644\u0627\u0645\u0629 \u0642\u0641"],
    },
    {
        "id": "interdit_depasser",
        "name_fr": "Interdiction de depasser",
        "name_ar": "\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u062a\u062c\u0627\u0648\u0632",
        "category": "interdiction",
        "image": "interdit_depasser.svg",
        "keywords_fr": ["interdiction de depasser", "interdit de depasser", "depassement interdit", "ne pas depasser"],
        "keywords_ar": ["\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u062a\u062c\u0627\u0648\u0632", "\u062d\u0638\u0631 \u0627\u0644\u062a\u062c\u0627\u0648\u0632"],
    },
    {
        "id": "interdit_stationner",
        "name_fr": "Interdiction de stationner",
        "name_ar": "\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u0648\u0642\u0648\u0641",
        "category": "interdiction",
        "image": "interdit_stationner.svg",
        "keywords_fr": ["interdiction de stationner", "stationnement interdit", "interdit de stationner", "defense de stationner"],
        "keywords_ar": ["\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u0648\u0642\u0648\u0641", "\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u062a\u0648\u0642\u0641", "\u062d\u0638\u0631 \u0627\u0644\u0648\u0642\u0648\u0641"],
    },
    {
        "id": "interdit_tourner_gauche",
        "name_fr": "Interdiction de tourner a gauche",
        "name_ar": "\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u0627\u0646\u0639\u0637\u0627\u0641 \u064a\u0633\u0627\u0631\u0627\u064b",
        "category": "interdiction",
        "image": "interdit_tourner_gauche.svg",
        "keywords_fr": ["interdit de tourner a gauche", "interdiction de tourner a gauche"],
        "keywords_ar": ["\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u0627\u0646\u0639\u0637\u0627\u0641 \u064a\u0633\u0627\u0631\u0627\u064b", "\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u062f\u0648\u0631\u0627\u0646 \u064a\u0633\u0627\u0631\u0627\u064b"],
    },
    {
        "id": "interdit_tourner_droite",
        "name_fr": "Interdiction de tourner a droite",
        "name_ar": "\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u0627\u0646\u0639\u0637\u0627\u0641 \u064a\u0645\u064a\u0646\u0627\u064b",
        "category": "interdiction",
        "image": "interdit_tourner_droite.svg",
        "keywords_fr": ["interdit de tourner a droite", "interdiction de tourner a droite"],
        "keywords_ar": ["\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u0627\u0646\u0639\u0637\u0627\u0641 \u064a\u0645\u064a\u0646\u0627\u064b", "\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u062f\u0648\u0631\u0627\u0646 \u064a\u0645\u064a\u0646\u0627\u064b"],
    },
    {
        "id": "interdit_demi_tour",
        "name_fr": "Interdiction de faire demi-tour",
        "name_ar": "\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u0627\u0644\u062a\u0641\u0627\u0641",
        "category": "interdiction",
        "image": "interdit_demi_tour.svg",
        "keywords_fr": ["demi-tour interdit", "interdit de faire demi-tour", "interdiction de demi-tour"],
        "keywords_ar": ["\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u0627\u0644\u062a\u0641\u0627\u0641", "\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u062f\u0648\u0631\u0627\u0646"],
    },
    {
        "id": "interdit_klaxonner",
        "name_fr": "Interdiction de klaxonner",
        "name_ar": "\u0645\u0645\u0646\u0648\u0639 \u0627\u0633\u062a\u0639\u0645\u0627\u0644 \u0627\u0644\u0645\u0646\u0628\u0647",
        "category": "interdiction",
        "image": "interdit_klaxonner.svg",
        "keywords_fr": ["interdit de klaxonner", "klaxon interdit", "avertisseur sonore interdit"],
        "keywords_ar": ["\u0645\u0645\u0646\u0648\u0639 \u0627\u0633\u062a\u0639\u0645\u0627\u0644 \u0627\u0644\u0645\u0646\u0628\u0647", "\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u062a\u0632\u0645\u064a\u0631"],
    },
    {
        "id": "interdit_pietons",
        "name_fr": "Interdit aux pietons",
        "name_ar": "\u0645\u0645\u0646\u0648\u0639 \u0645\u0631\u0648\u0631 \u0627\u0644\u0645\u0634\u0627\u0629",
        "category": "interdiction",
        "image": "interdit_pietons.svg",
        "keywords_fr": ["interdit aux pietons", "pietons interdits"],
        "keywords_ar": ["\u0645\u0645\u0646\u0648\u0639 \u0645\u0631\u0648\u0631 \u0627\u0644\u0645\u0634\u0627\u0629", "\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u0645\u0634\u064a"],
    },
    {
        "id": "interdit_camions",
        "name_fr": "Interdiction aux poids lourds",
        "name_ar": "\u0645\u0645\u0646\u0648\u0639 \u0645\u0631\u0648\u0631 \u0627\u0644\u0634\u0627\u062d\u0646\u0627\u062a",
        "category": "interdiction",
        "image": "interdit_camions.svg",
        "keywords_fr": ["interdit aux camions", "interdit aux poids lourds", "interdiction aux poids lourds", "vehicule de transport de marchandises", "vehicules de transport de marchandises", "interdiction de circulation aux vehicules", "camions interdit", "poids lourds interdit"],
        "keywords_ar": ["\u0645\u0645\u0646\u0648\u0639 \u0645\u0631\u0648\u0631 \u0627\u0644\u0634\u0627\u062d\u0646\u0627\u062a", "\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u0634\u0627\u062d\u0646\u0627\u062a", "\u0645\u0645\u0646\u0648\u0639 \u0645\u0631\u0648\u0631 \u0627\u0644\u0628\u0636\u0627\u0626\u0639"],
    },

    # ===================== LIMITATION DE VITESSE =====================
    {
        "id": "limite_30",
        "name_fr": "Limitation de vitesse 30 km/h",
        "name_ar": "\u062a\u062d\u062f\u064a\u062f \u0627\u0644\u0633\u0631\u0639\u0629 30 \u0643\u0645/\u0633",
        "category": "interdiction",
        "image": "limite_30.svg",
        "keywords_fr": ["30 km/h", "30 kilometres", "limitation 30", "vitesse 30"],
        "keywords_ar": ["30 \u0643\u0645", "\u0633\u0631\u0639\u0629 30"],
    },
    {
        "id": "limite_50",
        "name_fr": "Limitation de vitesse 50 km/h",
        "name_ar": "\u062a\u062d\u062f\u064a\u062f \u0627\u0644\u0633\u0631\u0639\u0629 50 \u0643\u0645/\u0633",
        "category": "interdiction",
        "image": "limite_50.svg",
        "keywords_fr": ["50 km/h", "50 kilometres", "limitation 50", "vitesse 50", "en agglomeration", "en ville"],
        "keywords_ar": ["50 \u0643\u0645", "\u0633\u0631\u0639\u0629 50", "\u062f\u0627\u062e\u0644 \u0627\u0644\u0645\u062f\u064a\u0646\u0629"],
    },
    {
        "id": "limite_70",
        "name_fr": "Limitation de vitesse 70 km/h",
        "name_ar": "\u062a\u062d\u062f\u064a\u062f \u0627\u0644\u0633\u0631\u0639\u0629 70 \u0643\u0645/\u0633",
        "category": "interdiction",
        "image": "limite_70.svg",
        "keywords_fr": ["70 km/h", "70 kilometres", "limitation 70", "vitesse 70"],
        "keywords_ar": ["70 \u0643\u0645", "\u0633\u0631\u0639\u0629 70"],
    },
    {
        "id": "limite_90",
        "name_fr": "Limitation de vitesse 90 km/h",
        "name_ar": "\u062a\u062d\u062f\u064a\u062f \u0627\u0644\u0633\u0631\u0639\u0629 90 \u0643\u0645/\u0633",
        "category": "interdiction",
        "image": "limite_90.svg",
        "keywords_fr": ["90 km/h", "90 kilometres", "limitation 90", "vitesse 90", "hors agglomeration", "route nationale"],
        "keywords_ar": ["90 \u0643\u0645", "\u0633\u0631\u0639\u0629 90", "\u062e\u0627\u0631\u062c \u0627\u0644\u0645\u062f\u064a\u0646\u0629"],
    },
    {
        "id": "limite_110",
        "name_fr": "Limitation de vitesse 110 km/h",
        "name_ar": "\u062a\u062d\u062f\u064a\u062f \u0627\u0644\u0633\u0631\u0639\u0629 110 \u0643\u0645/\u0633",
        "category": "interdiction",
        "image": "limite_110.svg",
        "keywords_fr": ["110 km/h", "110 kilometres", "limitation 110", "vitesse 110", "voie express"],
        "keywords_ar": ["110 \u0643\u0645", "\u0633\u0631\u0639\u0629 110", "\u0627\u0644\u0637\u0631\u064a\u0642 \u0627\u0644\u0633\u0631\u064a\u0639\u0629"],
    },
    {
        "id": "limite_120",
        "name_fr": "Limitation de vitesse 120 km/h",
        "name_ar": "\u062a\u062d\u062f\u064a\u062f \u0627\u0644\u0633\u0631\u0639\u0629 120 \u0643\u0645/\u0633",
        "category": "interdiction",
        "image": "limite_120.svg",
        "keywords_fr": ["120 km/h", "120 kilometres", "limitation 120", "vitesse 120", "autoroute"],
        "keywords_ar": ["120 \u0643\u0645", "\u0633\u0631\u0639\u0629 120", "\u0627\u0644\u0637\u0631\u064a\u0642 \u0627\u0644\u0633\u064a\u0627\u0631\u0629"],
    },

    # ===================== PANNEAUX DE DANGER (triangle rouge) =====================
    {
        "id": "virage_dangereux",
        "name_fr": "Virage dangereux",
        "name_ar": "\u0645\u0646\u0639\u0631\u062c \u062e\u0637\u064a\u0631",
        "category": "danger",
        "image": "virage_dangereux.svg",
        "keywords_fr": ["virage dangereux", "virage serre", "courbe dangereuse"],
        "keywords_ar": ["\u0645\u0646\u0639\u0631\u062c \u062e\u0637\u064a\u0631", "\u0645\u0646\u062d\u0646\u0649 \u062e\u0637\u064a\u0631"],
    },
    {
        "id": "chaussee_glissante",
        "name_fr": "Chaussee glissante",
        "name_ar": "\u0637\u0631\u064a\u0642 \u0645\u0646\u0632\u0644\u0642\u0629",
        "category": "danger",
        "image": "chaussee_glissante.svg",
        "keywords_fr": ["chaussee glissante", "route glissante", "risque de derapage"],
        "keywords_ar": ["\u0637\u0631\u064a\u0642 \u0645\u0646\u0632\u0644\u0642\u0629", "\u062e\u0637\u0631 \u0627\u0644\u0627\u0646\u0632\u0644\u0627\u0642"],
    },
    {
        "id": "travaux",
        "name_fr": "Travaux",
        "name_ar": "\u0623\u0634\u063a\u0627\u0644",
        "category": "danger",
        "image": "travaux.svg",
        "keywords_fr": ["travaux", "chantier", "zone de travaux"],
        "keywords_ar": ["\u0623\u0634\u063a\u0627\u0644", "\u0645\u0646\u0637\u0642\u0629 \u0623\u0634\u063a\u0627\u0644"],
    },
    {
        "id": "passage_pietons_danger",
        "name_fr": "Passage pour pietons",
        "name_ar": "\u0645\u0645\u0631 \u0627\u0644\u0631\u0627\u062c\u0644\u064a\u0646",
        "category": "danger",
        "image": "passage_pietons.svg",
        "keywords_fr": ["passage pietons", "passage pour pietons", "passage cloute", "traversee pietons"],
        "keywords_ar": ["\u0645\u0645\u0631 \u0627\u0644\u0631\u0627\u062c\u0644\u064a\u0646", "\u0645\u0645\u0631 \u0627\u0644\u0645\u0634\u0627\u0629", "\u0639\u0628\u0648\u0631 \u0627\u0644\u0645\u0634\u0627\u0629"],
    },
    {
        "id": "enfants",
        "name_fr": "Attention enfants (ecole)",
        "name_ar": "\u0627\u0646\u062a\u0628\u0627\u0647 \u0623\u0637\u0641\u0627\u0644 (\u0645\u062f\u0631\u0633\u0629)",
        "category": "danger",
        "image": "enfants.svg",
        "keywords_fr": ["attention enfants", "zone scolaire", "ecole", "sortie d'ecole", "enfants"],
        "keywords_ar": ["\u0627\u0646\u062a\u0628\u0627\u0647 \u0623\u0637\u0641\u0627\u0644", "\u0645\u0646\u0637\u0642\u0629 \u0645\u062f\u0631\u0633\u064a\u0629", "\u0645\u062f\u0631\u0633\u0629"],
    },
    {
        "id": "dos_ane",
        "name_fr": "Ralentisseur / Dos d'ane",
        "name_ar": "\u0645\u0637\u0628 \u0627\u0635\u0637\u0646\u0627\u0639\u064a",
        "category": "danger",
        "image": "dos_ane.svg",
        "keywords_fr": ["dos d'ane", "ralentisseur", "cassis"],
        "keywords_ar": ["\u0645\u0637\u0628", "\u0645\u0637\u0628 \u0627\u0635\u0637\u0646\u0627\u0639\u064a"],
    },
    {
        "id": "intersection",
        "name_fr": "Intersection",
        "name_ar": "\u062a\u0642\u0627\u0637\u0639 \u0637\u0631\u0642",
        "category": "danger",
        "image": "intersection.svg",
        "keywords_fr": ["intersection", "croisement", "carrefour"],
        "keywords_ar": ["\u062a\u0642\u0627\u0637\u0639", "\u0645\u0641\u062a\u0631\u0642 \u0637\u0631\u0642"],
    },
    {
        "id": "priorite_droite",
        "name_fr": "Priorite a droite",
        "name_ar": "\u0623\u0648\u0644\u0648\u064a\u0629 \u0644\u0644\u064a\u0645\u064a\u0646",
        "category": "danger",
        "image": "priorite_droite.svg",
        "keywords_fr": ["priorite a droite", "ceder le passage a droite"],
        "keywords_ar": ["\u0623\u0648\u0644\u0648\u064a\u0629 \u0644\u0644\u064a\u0645\u064a\u0646", "\u0623\u0633\u0628\u0642\u064a\u0629 \u0644\u0644\u064a\u0645\u064a\u0646"],
    },
    {
        "id": "signal_lumineux",
        "name_fr": "Feux de signalisation",
        "name_ar": "\u0625\u0634\u0627\u0631\u0629 \u0636\u0648\u0626\u064a\u0629",
        "category": "danger",
        "image": "signal_lumineux.svg",
        "keywords_fr": ["feux de signalisation", "feu rouge", "feu tricolore", "feu de circulation", "feux tricolores"],
        "keywords_ar": ["\u0625\u0634\u0627\u0631\u0629 \u0636\u0648\u0626\u064a\u0629", "\u0625\u0634\u0627\u0631\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", "\u0627\u0644\u0636\u0648\u0621 \u0627\u0644\u0623\u062d\u0645\u0631"],
    },
    {
        "id": "passage_niveau",
        "name_fr": "Passage a niveau",
        "name_ar": "\u0645\u0645\u0631 \u0633\u0643\u0629 \u062d\u062f\u064a\u062f\u064a\u0629",
        "category": "danger",
        "image": "passage_niveau.svg",
        "keywords_fr": ["passage a niveau", "voie ferree", "chemin de fer"],
        "keywords_ar": ["\u0645\u0645\u0631 \u0633\u0643\u0629 \u062d\u062f\u064a\u062f\u064a\u0629", "\u0633\u0643\u0629 \u062d\u062f\u064a\u062f\u064a\u0629"],
    },
    {
        "id": "animaux",
        "name_fr": "Traversee d'animaux",
        "name_ar": "\u0639\u0628\u0648\u0631 \u062d\u064a\u0648\u0627\u0646\u0627\u062a",
        "category": "danger",
        "image": "animaux.svg",
        "keywords_fr": ["traversee d'animaux", "animaux", "betail"],
        "keywords_ar": ["\u0639\u0628\u0648\u0631 \u062d\u064a\u0648\u0627\u0646\u0627\u062a", "\u062d\u064a\u0648\u0627\u0646\u0627\u062a"],
    },

    # ===================== PANNEAUX D'OBLIGATION (cercle bleu) =====================
    {
        "id": "tout_droit",
        "name_fr": "Direction obligatoire tout droit",
        "name_ar": "\u0627\u062a\u062c\u0627\u0647 \u0625\u062c\u0628\u0627\u0631\u064a \u0625\u0644\u0649 \u0627\u0644\u0623\u0645\u0627\u0645",
        "category": "obligation",
        "image": "tout_droit.svg",
        "keywords_fr": ["tout droit obligatoire", "direction obligatoire tout droit", "aller tout droit"],
        "keywords_ar": ["\u0627\u062a\u062c\u0627\u0647 \u0625\u062c\u0628\u0627\u0631\u064a \u0625\u0644\u0649 \u0627\u0644\u0623\u0645\u0627\u0645"],
    },
    {
        "id": "tourner_droite",
        "name_fr": "Obligation de tourner a droite",
        "name_ar": "\u0627\u0646\u0639\u0637\u0627\u0641 \u0625\u062c\u0628\u0627\u0631\u064a \u064a\u0645\u064a\u0646\u0627\u064b",
        "category": "obligation",
        "image": "tourner_droite.svg",
        "keywords_fr": ["tourner a droite obligatoire", "obligation de tourner a droite"],
        "keywords_ar": ["\u0627\u0646\u0639\u0637\u0627\u0641 \u0625\u062c\u0628\u0627\u0631\u064a \u064a\u0645\u064a\u0646\u0627\u064b"],
    },
    {
        "id": "tourner_gauche",
        "name_fr": "Obligation de tourner a gauche",
        "name_ar": "\u0627\u0646\u0639\u0637\u0627\u0641 \u0625\u062c\u0628\u0627\u0631\u064a \u064a\u0633\u0627\u0631\u0627\u064b",
        "category": "obligation",
        "image": "tourner_gauche.svg",
        "keywords_fr": ["tourner a gauche obligatoire", "obligation de tourner a gauche"],
        "keywords_ar": ["\u0627\u0646\u0639\u0637\u0627\u0641 \u0625\u062c\u0628\u0627\u0631\u064a \u064a\u0633\u0627\u0631\u0627\u064b"],
    },
    {
        "id": "rond_point",
        "name_fr": "Sens giratoire obligatoire",
        "name_ar": "\u062f\u0648\u0651\u0627\u0631 \u0625\u062c\u0628\u0627\u0631\u064a",
        "category": "obligation",
        "image": "rond_point.svg",
        "keywords_fr": ["rond-point", "giratoire", "sens giratoire", "carrefour giratoire"],
        "keywords_ar": ["\u062f\u0648\u0651\u0627\u0631", "\u0645\u0633\u062a\u062f\u064a\u0631\u0629", "\u062f\u0648\u0627\u0631"],
    },
    {
        "id": "ceinture",
        "name_fr": "Port de la ceinture obligatoire",
        "name_ar": "\u062d\u0632\u0627\u0645 \u0627\u0644\u0623\u0645\u0627\u0646 \u0625\u062c\u0628\u0627\u0631\u064a",
        "category": "obligation",
        "image": "ceinture.svg",
        "keywords_fr": ["ceinture de securite", "port de la ceinture", "ceinture obligatoire", "attacher la ceinture"],
        "keywords_ar": ["\u062d\u0632\u0627\u0645 \u0627\u0644\u0623\u0645\u0627\u0646", "\u0631\u0628\u0637 \u0627\u0644\u062d\u0632\u0627\u0645"],
    },
    {
        "id": "piste_cyclable",
        "name_fr": "Piste cyclable obligatoire",
        "name_ar": "\u0645\u0633\u0644\u0643 \u0625\u062c\u0628\u0627\u0631\u064a \u0644\u0644\u062f\u0631\u0627\u062c\u0627\u062a",
        "category": "obligation",
        "image": "piste_cyclable.svg",
        "keywords_fr": ["piste cyclable", "voie cyclable", "velo obligatoire"],
        "keywords_ar": ["\u0645\u0633\u0644\u0643 \u062f\u0631\u0627\u062c\u0627\u062a", "\u062f\u0631\u0627\u062c\u0627\u062a"],
    },
    {
        "id": "chemin_pietons",
        "name_fr": "Chemin obligatoire pour pietons",
        "name_ar": "\u0645\u0645\u0631 \u0625\u062c\u0628\u0627\u0631\u064a \u0644\u0644\u0645\u0634\u0627\u0629",
        "category": "obligation",
        "image": "chemin_pietons.svg",
        "keywords_fr": ["chemin pietons", "passage obligatoire pietons", "trottoir obligatoire"],
        "keywords_ar": ["\u0645\u0645\u0631 \u0627\u0644\u0645\u0634\u0627\u0629", "\u0631\u0635\u064a\u0641 \u0625\u062c\u0628\u0627\u0631\u064a"],
    },

    # ===================== PANNEAUX D'INDICATION (carre bleu) =====================
    {
        "id": "parking",
        "name_fr": "Parking",
        "name_ar": "\u0645\u0648\u0642\u0641 \u0633\u064a\u0627\u0631\u0627\u062a",
        "category": "indication",
        "image": "parking.svg",
        "keywords_fr": ["parking", "stationnement autorise", "zone de stationnement", "parc de stationnement"],
        "keywords_ar": ["\u0645\u0648\u0642\u0641 \u0633\u064a\u0627\u0631\u0627\u062a", "\u0645\u0648\u0642\u0641"],
    },
    {
        "id": "hopital",
        "name_fr": "Hopital",
        "name_ar": "\u0645\u0633\u062a\u0634\u0641\u0649",
        "category": "indication",
        "image": "hopital.svg",
        "keywords_fr": ["hopital", "urgences", "centre hospitalier"],
        "keywords_ar": ["\u0645\u0633\u062a\u0634\u0641\u0649", "\u0637\u0648\u0627\u0631\u0626"],
    },
    {
        "id": "poste_essence",
        "name_fr": "Station-service",
        "name_ar": "\u0645\u062d\u0637\u0629 \u0648\u0642\u0648\u062f",
        "category": "indication",
        "image": "poste_essence.svg",
        "keywords_fr": ["station-service", "station essence", "poste d'essence", "carburant"],
        "keywords_ar": ["\u0645\u062d\u0637\u0629 \u0648\u0642\u0648\u062f", "\u0645\u062d\u0637\u0629 \u0628\u0646\u0632\u064a\u0646"],
    },
    {
        "id": "cedez_passage",
        "name_fr": "Cedez le passage",
        "name_ar": "\u0623\u0639\u0637 \u0627\u0644\u0623\u0648\u0644\u0648\u064a\u0629",
        "category": "indication",
        "image": "cedez_passage.svg",
        "keywords_fr": ["cedez le passage", "ceder le passage", "priorite"],
        "keywords_ar": ["\u0623\u0639\u0637 \u0627\u0644\u0623\u0648\u0644\u0648\u064a\u0629", "\u0623\u0633\u0628\u0642\u064a\u0629"],
    },
    {
        "id": "route_prioritaire",
        "name_fr": "Route prioritaire",
        "name_ar": "\u0637\u0631\u064a\u0642 \u0630\u0648 \u0623\u0648\u0644\u0648\u064a\u0629",
        "category": "indication",
        "image": "route_prioritaire.svg",
        "keywords_fr": ["route prioritaire", "voie prioritaire"],
        "keywords_ar": ["\u0637\u0631\u064a\u0642 \u0630\u0648 \u0623\u0648\u0644\u0648\u064a\u0629"],
    },
    {
        "id": "autoroute",
        "name_fr": "Autoroute",
        "name_ar": "\u0637\u0631\u064a\u0642 \u0633\u064a\u0627\u0631\u0629",
        "category": "indication",
        "image": "autoroute.svg",
        "keywords_fr": ["autoroute", "voie rapide", "entree autoroute"],
        "keywords_ar": ["\u0637\u0631\u064a\u0642 \u0633\u064a\u0627\u0631\u0629", "\u0637\u0631\u064a\u0642 \u0633\u0631\u064a\u0639"],
    },
]

# Categories avec leurs emojis et couleurs
SIGN_CATEGORIES = {
    "interdiction": {"emoji": "\U0001f6ab", "color": "#e74c3c", "label_fr": "Interdiction", "label_ar": "\u0645\u0646\u0639"},
    "danger": {"emoji": "\u26a0\ufe0f", "color": "#f39c12", "label_fr": "Danger", "label_ar": "\u062e\u0637\u0631"},
    "obligation": {"emoji": "\U0001f535", "color": "#3498db", "label_fr": "Obligation", "label_ar": "\u0625\u062c\u0628\u0627\u0631"},
    "indication": {"emoji": "\u2139\ufe0f", "color": "#2ecc71", "label_fr": "Indication", "label_ar": "\u0625\u0631\u0634\u0627\u062f"},
}


def detect_signs_in_text(text: str, language: str = "fr") -> list:
    """
    Detecte les panneaux de signalisation mentionnes dans un texte.

    Args:
        text: Le texte de la reponse du bot
        language: La langue de la reponse ('fr' ou 'ar')

    Returns:
        Liste de panneaux detectes avec leurs infos
    """
    text_lower = text.lower()
    detected = []
    seen_ids = set()

    for sign in SIGNS_DATABASE:
        if sign["id"] in seen_ids:
            continue

        # Chercher dans les mots-cles de la langue appropriee
        keywords = sign.get(f"keywords_{language}", sign.get("keywords_fr", []))
        # Chercher aussi dans l'autre langue
        keywords_other = sign.get("keywords_ar" if language == "fr" else "keywords_fr", [])

        found = False
        for kw in keywords:
            if kw.lower() in text_lower:
                found = True
                break

        if not found:
            for kw in keywords_other:
                if kw.lower() in text_lower:
                    found = True
                    break

        if found:
            seen_ids.add(sign["id"])
            cat = SIGN_CATEGORIES.get(sign["category"], {})
            detected.append({
                "id": sign["id"],
                "name": sign.get(f"name_{language}", sign["name_fr"]),
                "name_fr": sign["name_fr"],
                "name_ar": sign["name_ar"],
                "category": sign["category"],
                "category_label": cat.get(f"label_{language}", cat.get("label_fr", "")),
                "category_emoji": cat.get("emoji", ""),
                "category_color": cat.get("color", "#666"),
                "image": f"/static/signs/{sign['image']}",
            })

    return detected
