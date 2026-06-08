#!/usr/bin/env python3
"""
Test script para verificar que el servicio Unsplash funciona correctamente.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.unsplash_service import UnsplashService

def test_unsplash():
    """Test Unsplash service with various queries."""
    
    test_queries = [
        "road safety warning sign Tunisia",
        "car seatbelt driving rules",
        "traffic light red car",
        "speed limit sign highway",
        "pedestrian crossing street"
    ]
    
    print("🧪 Testing Unsplash Service\n")
    print("=" * 60)
    
    for query in test_queries:
        print(f"\n📝 Query: {query}")
        
        # Test with verification
        image_url = UnsplashService.search_image(query)
        if image_url:
            print(f"✅ Verified: {image_url}")
        else:
            print("⚠️  Verification failed, trying fallback...")
            
            # Test fallback
            image_url = UnsplashService.search_image_fallback(query)
            if image_url:
                print(f"✅ Fallback: {image_url}")
            else:
                print("❌ Both methods failed")
    
    print("\n" + "=" * 60)
    print("✅ Test complete!")

if __name__ == "__main__":
    test_unsplash()
