"""
Script pour générer les fichiers SVG des panneaux de signalisation.
Exécuter une seule fois : python scripts/generate_signs.py
"""
import os

SIGNS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "signs")
os.makedirs(SIGNS_DIR, exist_ok=True)

def save_svg(filename, content):
    path = os.path.join(SIGNS_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  ✅ {filename}")

# ================= INTERDICTION (cercle rouge, fond blanc) =================

def circle_interdit(inner_svg, filename):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="95" fill="white" stroke="#cc0000" stroke-width="10"/>
  {inner_svg}
</svg>'''
    save_svg(filename, svg)

# Interdit de circuler
circle_interdit(
    '<circle cx="100" cy="100" r="70" fill="#cc0000"/>',
    "interdit_circuler.png.svg"
)

# Sens interdit
save_svg("sens_interdit.png.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="95" fill="#cc0000"/>
  <rect x="30" y="85" width="140" height="30" rx="5" fill="white"/>
</svg>''')

# Stop
save_svg("stop.png.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <polygon points="100,5 175,40 195,115 160,185 40,185 5,115 25,40" fill="#cc0000" stroke="white" stroke-width="6"/>
  <text x="100" y="115" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="52" font-weight="bold" fill="white">STOP</text>
</svg>''')

# Interdit de dépasser
circle_interdit(
    '''<g>
    <line x1="40" y1="160" x2="160" y2="40" stroke="#cc0000" stroke-width="12"/>
    <rect x="55" y="65" width="30" height="55" rx="10" fill="black"/>
    <rect x="115" y="65" width="30" height="55" rx="10" fill="#cc0000"/>
  </g>''',
    "interdit_depasser.png.svg"
)

# Interdit de stationner
circle_interdit(
    '''<line x1="35" y1="165" x2="165" y2="35" stroke="#cc0000" stroke-width="12"/>
  <circle cx="100" cy="100" r="60" fill="none" stroke="#3366cc" stroke-width="8"/>
  <line x1="55" y1="155" x2="145" y2="45" stroke="#cc0000" stroke-width="10"/>''',
    "interdit_stationner.png.svg"
)

# Interdit tourner gauche
circle_interdit(
    '''<line x1="35" y1="165" x2="165" y2="35" stroke="#cc0000" stroke-width="12"/>
  <path d="M120,140 L120,80 Q120,55 95,55 L70,55" fill="none" stroke="black" stroke-width="10" stroke-linecap="round"/>
  <polygon points="80,40 60,55 80,70" fill="black"/>''',
    "interdit_tourner_gauche.png.svg"
)

# Interdit tourner droite
circle_interdit(
    '''<line x1="35" y1="165" x2="165" y2="35" stroke="#cc0000" stroke-width="12"/>
  <path d="M80,140 L80,80 Q80,55 105,55 L130,55" fill="none" stroke="black" stroke-width="10" stroke-linecap="round"/>
  <polygon points="120,40 140,55 120,70" fill="black"/>''',
    "interdit_tourner_droite.png.svg"
)

# Interdit demi-tour
circle_interdit(
    '''<line x1="35" y1="165" x2="165" y2="35" stroke="#cc0000" stroke-width="12"/>
  <path d="M130,130 L130,80 Q130,50 100,50 Q70,50 70,80 L70,95" fill="none" stroke="black" stroke-width="10" stroke-linecap="round"/>
  <polygon points="55,85 70,105 85,85" fill="black"/>''',
    "interdit_demi_tour.png.svg"
)

# Interdit klaxonner
circle_interdit(
    '''<line x1="35" y1="165" x2="165" y2="35" stroke="#cc0000" stroke-width="12"/>
  <path d="M70,110 Q70,70 100,70 Q130,70 130,110" fill="none" stroke="black" stroke-width="8"/>
  <circle cx="100" cy="110" r="8" fill="black"/>
  <line x1="140" y1="65" x2="155" y2="55" stroke="black" stroke-width="4"/>
  <line x1="145" y1="80" x2="162" y2="78" stroke="black" stroke-width="4"/>''',
    "interdit_klaxonner.png.svg"
)

# Interdit piétons
circle_interdit(
    '''<line x1="35" y1="165" x2="165" y2="35" stroke="#cc0000" stroke-width="12"/>
  <circle cx="100" cy="55" r="12" fill="black"/>
  <line x1="100" y1="67" x2="100" y2="115" stroke="black" stroke-width="8" stroke-linecap="round"/>
  <line x1="100" y1="80" x2="75" y2="100" stroke="black" stroke-width="7" stroke-linecap="round"/>
  <line x1="100" y1="80" x2="125" y2="100" stroke="black" stroke-width="7" stroke-linecap="round"/>
  <line x1="100" y1="115" x2="78" y2="150" stroke="black" stroke-width="7" stroke-linecap="round"/>
  <line x1="100" y1="115" x2="122" y2="150" stroke="black" stroke-width="7" stroke-linecap="round"/>''',
    "interdit_pietons.png.svg"
)

# ================= Limitations de vitesse =================
for speed in [30, 50, 70, 90, 110, 120]:
    save_svg(f"limite_{speed}.png.svg", f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="95" fill="white" stroke="#cc0000" stroke-width="10"/>
  <text x="100" y="118" text-anchor="middle" font-family="Arial, sans-serif" font-size="{"62" if speed < 100 else "52"}" font-weight="bold" fill="black">{speed}</text>
</svg>''')

# ================= DANGER (triangle rouge) =================

def triangle_danger(inner_svg, filename):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <polygon points="100,10 190,180 10,180" fill="white" stroke="#cc0000" stroke-width="10" stroke-linejoin="round"/>
  {inner_svg}
</svg>'''
    save_svg(filename, svg)

# Virage dangereux
triangle_danger(
    '<path d="M70,140 Q70,90 110,90 Q140,90 140,120" fill="none" stroke="black" stroke-width="10" stroke-linecap="round"/><polygon points="130,108 150,120 130,132" fill="black"/>',
    "virage_dangereux.png.svg"
)

# Chaussée glissante
triangle_danger(
    '<path d="M85,140 Q90,110 105,100 Q120,90 110,70" fill="none" stroke="black" stroke-width="10" stroke-linecap="round"/>',
    "chaussee_glissante.png.svg"
)

# Travaux
triangle_danger(
    '''<g transform="translate(100,100)">
    <rect x="-8" y="-40" width="16" height="60" rx="2" fill="black" transform="rotate(-20)"/>
    <rect x="-8" y="-40" width="16" height="60" rx="2" fill="black" transform="rotate(20)"/>
    <rect x="-18" y="15" width="36" height="12" rx="2" fill="#cc0000"/>
  </g>''',
    "travaux.png.svg"
)

# Passage piétons (danger)
triangle_danger(
    '''<circle cx="100" cy="60" r="10" fill="black"/>
  <line x1="100" y1="70" x2="100" y2="110" stroke="black" stroke-width="7" stroke-linecap="round"/>
  <line x1="100" y1="82" x2="80" y2="100" stroke="black" stroke-width="6" stroke-linecap="round"/>
  <line x1="100" y1="82" x2="120" y2="100" stroke="black" stroke-width="6" stroke-linecap="round"/>
  <line x1="100" y1="110" x2="82" y2="145" stroke="black" stroke-width="6" stroke-linecap="round"/>
  <line x1="100" y1="110" x2="118" y2="145" stroke="black" stroke-width="6" stroke-linecap="round"/>
  <rect x="60" y="148" width="80" height="6" rx="3" fill="#3366cc"/>''',
    "passage_pietons.png.svg"
)

# Enfants / école
triangle_danger(
    '''<circle cx="88" cy="62" r="8" fill="black"/>
  <line x1="88" y1="70" x2="88" y2="105" stroke="black" stroke-width="6" stroke-linecap="round"/>
  <line x1="88" y1="80" x2="72" y2="95" stroke="black" stroke-width="5" stroke-linecap="round"/>
  <line x1="88" y1="105" x2="75" y2="140" stroke="black" stroke-width="5" stroke-linecap="round"/>
  <line x1="88" y1="105" x2="101" y2="140" stroke="black" stroke-width="5" stroke-linecap="round"/>
  <circle cx="112" cy="70" r="7" fill="black"/>
  <line x1="112" y1="77" x2="112" y2="108" stroke="black" stroke-width="5" stroke-linecap="round"/>
  <line x1="112" y1="108" x2="102" y2="140" stroke="black" stroke-width="5" stroke-linecap="round"/>
  <line x1="112" y1="108" x2="122" y2="140" stroke="black" stroke-width="5" stroke-linecap="round"/>
  <line x1="88" y1="80" x2="112" y2="86" stroke="black" stroke-width="5" stroke-linecap="round"/>''',
    "enfants.png.svg"
)

# Dos d'âne
triangle_danger(
    '<path d="M60,135 Q100,80 140,135" fill="none" stroke="black" stroke-width="10" stroke-linecap="round"/>',
    "dos_ane.png.svg"
)

# Intersection
triangle_danger(
    '''<line x1="100" y1="55" x2="100" y2="155" stroke="black" stroke-width="10" stroke-linecap="round"/>
  <line x1="65" y1="105" x2="135" y2="105" stroke="black" stroke-width="10" stroke-linecap="round"/>''',
    "intersection.png.svg"
)

# Priorité à droite
triangle_danger(
    '''<line x1="100" y1="55" x2="100" y2="155" stroke="black" stroke-width="10" stroke-linecap="round"/>
  <line x1="100" y1="105" x2="140" y2="105" stroke="black" stroke-width="10" stroke-linecap="round"/>''',
    "priorite_droite.png.svg"
)

# Feux de signalisation
triangle_danger(
    '''<rect x="85" y="50" width="30" height="90" rx="5" fill="black"/>
  <circle cx="100" cy="67" r="10" fill="#cc0000"/>
  <circle cx="100" cy="95" r="10" fill="#f1c40f"/>
  <circle cx="100" cy="123" r="10" fill="#2ecc71"/>''',
    "signal_lumineux.png.svg"
)

# Passage à niveau
triangle_danger(
    '''<rect x="60" y="85" width="80" height="18" rx="3" fill="#cc0000"/>
  <rect x="60" y="85" width="16" height="18" fill="white"/>
  <rect x="92" y="85" width="16" height="18" fill="white"/>
  <rect x="124" y="85" width="16" height="18" fill="white"/>
  <rect x="94" y="55" width="12" height="90" rx="2" fill="black" opacity="0.3"/>''',
    "passage_niveau.png.svg"
)

# Animaux
triangle_danger(
    '''<g transform="translate(100,105) scale(0.6)">
    <ellipse cx="0" cy="0" rx="35" ry="20" fill="black"/>
    <ellipse cx="-30" cy="-15" rx="12" ry="18" fill="black"/>
    <line x1="-25" y1="15" x2="-25" y2="38" stroke="black" stroke-width="7" stroke-linecap="round"/>
    <line x1="-10" y1="15" x2="-10" y2="38" stroke="black" stroke-width="7" stroke-linecap="round"/>
    <line x1="15" y1="15" x2="15" y2="38" stroke="black" stroke-width="7" stroke-linecap="round"/>
    <line x1="30" y1="15" x2="30" y2="38" stroke="black" stroke-width="7" stroke-linecap="round"/>
  </g>''',
    "animaux.png.svg"
)

# ================= OBLIGATION (cercle bleu) =================

def circle_obligation(inner_svg, filename):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="95" fill="#3366cc"/>
  {inner_svg}
</svg>'''
    save_svg(filename, svg)

# Tout droit
circle_obligation(
    '<polygon points="100,35 130,90 115,90 115,160 85,160 85,90 70,90" fill="white"/>',
    "tout_droit.png.svg"
)

# Tourner à droite
circle_obligation(
    '<path d="M90,155 L90,90 Q90,60 120,60 L140,60" fill="none" stroke="white" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/><polygon points="130,38 160,60 130,82" fill="white"/>',
    "tourner_droite.png.svg"
)

# Tourner à gauche
circle_obligation(
    '<path d="M110,155 L110,90 Q110,60 80,60 L60,60" fill="none" stroke="white" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/><polygon points="70,38 40,60 70,82" fill="white"/>',
    "tourner_gauche.png.svg"
)

# Rond-point
circle_obligation(
    '''<circle cx="100" cy="100" r="40" fill="none" stroke="white" stroke-width="16"/>
  <polygon points="130,60 145,75 118,72" fill="white"/>''',
    "rond_point.png.svg"
)

# Ceinture de sécurité
circle_obligation(
    '''<circle cx="100" cy="55" r="15" fill="none" stroke="white" stroke-width="6"/>
  <line x1="100" y1="70" x2="100" y2="130" stroke="white" stroke-width="8" stroke-linecap="round"/>
  <path d="M75,80 L100,130 L125,80" fill="none" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>''',
    "ceinture.png.svg"
)

# Piste cyclable
circle_obligation(
    '''<circle cx="85" cy="130" r="22" fill="none" stroke="white" stroke-width="6"/>
  <circle cx="130" cy="130" r="22" fill="none" stroke="white" stroke-width="6"/>
  <path d="M85,130 L95,80 L115,80" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="105" cy="65" r="8" fill="white"/>
  <line x1="95" y1="80" x2="130" y2="130" stroke="white" stroke-width="6" stroke-linecap="round"/>''',
    "piste_cyclable.png.svg"
)

# Chemin piétons
circle_obligation(
    '''<circle cx="100" cy="48" r="14" fill="white"/>
  <line x1="100" y1="62" x2="100" y2="115" stroke="white" stroke-width="9" stroke-linecap="round"/>
  <line x1="100" y1="78" x2="75" y2="100" stroke="white" stroke-width="8" stroke-linecap="round"/>
  <line x1="100" y1="78" x2="125" y2="100" stroke="white" stroke-width="8" stroke-linecap="round"/>
  <line x1="100" y1="115" x2="78" y2="155" stroke="white" stroke-width="8" stroke-linecap="round"/>
  <line x1="100" y1="115" x2="122" y2="155" stroke="white" stroke-width="8" stroke-linecap="round"/>''',
    "chemin_pietons.png.svg"
)

# ================= INDICATION (carré bleu) =================

def square_indication(inner_svg, filename):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect x="5" y="5" width="190" height="190" rx="15" fill="#3366cc"/>
  {inner_svg}
</svg>'''
    save_svg(filename, svg)

# Parking
square_indication(
    '<text x="100" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="110" font-weight="bold" fill="white">P</text>',
    "parking.png.svg"
)

# Hôpital
square_indication(
    '''<rect x="55" y="55" width="90" height="90" rx="10" fill="white"/>
  <rect x="90" y="65" width="20" height="70" rx="3" fill="#cc0000"/>
  <rect x="65" y="90" width="70" height="20" rx="3" fill="#cc0000"/>''',
    "hopital.png.svg"
)

# Station essence
square_indication(
    '''<rect x="55" y="45" width="50" height="100" rx="5" fill="white"/>
  <rect x="60" y="50" width="40" height="25" rx="3" fill="#333"/>
  <path d="M115,55 L130,55 L130,120 Q130,135 115,135 L110,135" fill="none" stroke="white" stroke-width="6" stroke-linecap="round"/>
  <circle cx="125" cy="55" r="6" fill="white"/>''',
    "poste_essence.png.svg"
)

# Cédez le passage (triangle inversé)
save_svg("cedez_passage.png.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <polygon points="100,185 10,25 190,25" fill="white" stroke="#cc0000" stroke-width="10" stroke-linejoin="round"/>
</svg>''')

# Route prioritaire (losange jaune)
save_svg("route_prioritaire.png.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect x="40" y="40" width="120" height="120" rx="5" fill="#f1c40f" stroke="white" stroke-width="8" transform="rotate(45 100 100)"/>
</svg>''')

# Autoroute
save_svg("autoroute.png.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect x="5" y="5" width="190" height="190" rx="15" fill="#3366cc"/>
  <path d="M55,160 L55,70 Q55,40 85,40 L100,40 Q100,40 100,60 L100,160" fill="none" stroke="white" stroke-width="8"/>
  <path d="M145,160 L145,70 Q145,40 115,40 L100,40" fill="none" stroke="white" stroke-width="8"/>
  <line x1="100" y1="70" x2="100" y2="80" stroke="white" stroke-width="4"/>
  <line x1="100" y1="90" x2="100" y2="100" stroke="white" stroke-width="4"/>
  <line x1="100" y1="110" x2="100" y2="120" stroke="white" stroke-width="4"/>
  <line x1="100" y1="130" x2="100" y2="140" stroke="white" stroke-width="4"/>
</svg>''')

print(f"\n🎉 Tous les panneaux ont été générés dans : {os.path.abspath(SIGNS_DIR)}")
