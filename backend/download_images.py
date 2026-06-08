"""Télécharge toutes les images de panneaux routiers en local.
Usage: python download_images.py
"""
import os
import requests

# Dossier où stocker les images (relatif au dossier backend/)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static", "question_images")
os.makedirs(STATIC_DIR, exist_ok=True)

# Mapping mot-clé → URL Wikimedia
_IMAGE_SOURCES = {
    "panneau_stop":               "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/MUTCD_R1-1.svg/240px-MUTCD_R1-1.svg.png",
    "panneau_priorite":           "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Zeichen_301.svg/240px-Zeichen_301.svg.png",
    "cedez_passage":              "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Zeichen_205.svg/240px-Zeichen_205.svg.png",
    "limite_50":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Zeichen_274-50.svg/240px-Zeichen_274-50.svg.png",
    "limite_30":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Zeichen_274-30.svg/240px-Zeichen_274-30.svg.png",
    "limite_90":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Zeichen_274-90.svg/240px-Zeichen_274-90.svg.png",
    "feu_rouge":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Red_Light.jpg/120px-Red_Light.jpg",
    "feu_orange":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Yellow_Light.jpg/120px-Yellow_Light.jpg",
    "feu_vert":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Green_Light.jpg/120px-Green_Light.jpg",
    "panneau_virage":             "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Zeichen_105.svg/240px-Zeichen_105.svg.png",
    "panneau_carrefour":          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Zeichen_102.svg/240px-Zeichen_102.svg.png",
    "panneau_chaussee_glissante": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Zeichen_114.svg/240px-Zeichen_114.svg.png",
    "interdit_depasser":          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Zeichen_276.svg/240px-Zeichen_276.svg.png",
    "interdit_acces":             "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Zeichen_267.svg/240px-Zeichen_267.svg.png",
    "stationnement_interdit":     "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Zeichen_283.svg/240px-Zeichen_283.svg.png",
    "obligation_droite":          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Zeichen_211.svg/240px-Zeichen_211.svg.png",
    "voie_cyclable":              "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Zeichen_237.svg/240px-Zeichen_237.svg.png",
    "passage_pieton":             "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Zeichen_293.svg/240px-Zeichen_293.svg.png",
    "sens_interdit":              "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Zeichen_267.svg/240px-Zeichen_267.svg.png",
    "rond_point":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Zeichen_215.svg/240px-Zeichen_215.svg.png",
    "passage_a_niveau":           "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Zeichen_201.svg/240px-Zeichen_201.svg.png",
    "travaux":                    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Zeichen_123.svg/240px-Zeichen_123.svg.png",
    "school_zone":                "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Zeichen_136.svg/240px-Zeichen_136.svg.png",
    "hospital":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Zeichen_224.svg/240px-Zeichen_224.svg.png",
}


def download_all():
    headers = {
        "User-Agent": "Mozilla/5.0 (Education-QCM-App)"
    }
    downloaded = 0
    skipped = 0
    failed = 0

    print("=" * 60)
    print("  Téléchargement des images de sécurité routière")
    print("=" * 60)

    for keyword, url in _IMAGE_SOURCES.items():
        # Déterminer l'extension
        ext = url.split(".")[-1].split("/")[0].lower()
        if ext not in ("png", "jpg", "jpeg", "svg", "gif", "webp"):
            ext = "png"

        filename = f"{keyword}.{ext}"
        filepath = os.path.join(STATIC_DIR, filename)

        # Si déjà présent, on saute
        if os.path.exists(filepath):
            size_kb = os.path.getsize(filepath) / 1024
            print(f"  [SKIP] {filename:<40} ({size_kb:.1f} KB)")
            skipped += 1
            continue

        # Télécharger
        try:
            print(f"  [DOWN] {filename:<40} ...", end=" ", flush=True)
            r = requests.get(url, headers=headers, timeout=30)
            if r.status_code == 200:
                with open(filepath, "wb") as f:
                    f.write(r.content)
                size_kb = len(r.content) / 1024
                print(f"OK ({size_kb:.1f} KB)")
                downloaded += 1
            else:
                print(f"ERREUR HTTP {r.status_code}")
                failed += 1
        except Exception as e:
            print(f"ERREUR: {str(e)[:50]}")
            failed += 1

    print("=" * 60)
    print(f"  Terminé ! {downloaded} téléchargées, {skipped} déjà présentes, {failed} échecs")
    print(f"  Dossier: {STATIC_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    download_all()