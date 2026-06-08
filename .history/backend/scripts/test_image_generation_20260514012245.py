#!/usr/bin/env python3
"""
Quick test - just check the image generation function works.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.qcm_generator import _generate_image_description

def test_image_descriptions():
    """Test image description generation."""
    
    print("🧪 Testing Image Description Generation\n")
    print("=" * 60)
    
    test_questions = [
        "Quel est l'effet de l'alcool sur la distance de réaction d'un conducteur ?",
        "Que signifie un feu rouge à un carrefour ?",
        "Quelle est la vitesse maximale en zone résidentielle en Tunisie ?",
        "Que faire en cas d'accident de la route ?",
        "Comment utiliser correctement la ceinture de sécurité ?",
    ]
    
    for i, question in enumerate(test_questions, 1):
        desc = _generate_image_description(question, "fr")
        print(f"\nQ{i}: {question[:50]}...")
        print(f"     Description: {desc}")
    
    print("\n" + "=" * 60)
    print("✅ Test complete!")

if __name__ == "__main__":
    test_image_descriptions()
