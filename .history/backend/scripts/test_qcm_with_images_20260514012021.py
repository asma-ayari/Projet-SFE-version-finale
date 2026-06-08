#!/usr/bin/env python3
"""
Test script to verify QCM generation with image descriptions.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.qcm_generator import generate_qcm_from_docs
import json

def test_qcm_generation():
    """Test QCM generation with image support."""
    
    print("🧪 Testing QCM Generation with Images\n")
    print("=" * 60)
    
    try:
        # Generate a small QCM
        result = generate_qcm_from_docs(
            language="fr",
            mode="general",
            theme=None,
            question_count=2,  # Just 2 questions for testing
            difficulty="facile",
            existing_questions=[]
        )
        
        print(f"\n📊 Generated QCM:")
        print(f"   Title: {result.get('title')}")
        print(f"   Description: {result.get('description')}")
        print(f"   Questions: {len(result.get('questions', []))}")
        
        print("\n📋 Question Details:")
        for i, q in enumerate(result.get('questions', []), 1):
            print(f"\n   Q{i}: {q.get('text', '')[:60]}...")
            print(f"       - Has image_url: {'✅' if q.get('image_url') else '❌'}")
            if q.get('image_url'):
                print(f"       - Image: {q.get('image_url')[:80]}...")
            print(f"       - Has image_description: {'✅' if q.get('image_description') else '❌'}")
            print(f"       - Answers: {len(q.get('answers', []))}")
        
        print("\n" + "=" * 60)
        print("✅ Test complete!\n")
        
        # Print full JSON for inspection
        print("📄 Full JSON Response:")
        print(json.dumps(result, indent=2, ensure_ascii=False)[:2000])
        
    except Exception as e:
        print(f"\n❌ Error during generation: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_qcm_generation()
