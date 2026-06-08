#!/usr/bin/env python3
"""
Script pour créer des vidéos de test et les publier.
"""
import sys
from pathlib import Path

# Ajouter le répertoire backend au path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.database import engine, Base, get_db
from app.models.video import Video, VideoCategory
from app.models.user import User, UserRole
# Import all models to ensure relationships are properly initialized
from app.models.conversation import Conversation
from app.models.qcm import QCM
from app.models.course import Course
from app.models.feedback import Feedback
from datetime import datetime

def create_sample_videos():
    """Create sample videos for testing"""
    Base.metadata.create_all(bind=engine)
    
    db = Session(bind=engine)
    
    try:
        # Check if videos already exist
        all_videos = db.query(Video).all()
        published_videos = db.query(Video).filter(Video.is_published == True).all()
        
        print(f"Total videos in DB: {len(all_videos)}")
        print(f"Published videos in DB: {len(published_videos)}")
        
        if all_videos:
            print("\nExisting videos:")
            for v in all_videos:
                print(f"  - {v.id}: {v.title} (published={v.is_published})")
        
        # If no published videos, publish them all
        if len(published_videos) == 0 and len(all_videos) > 0:
            print("\n⚠️  No published videos found. Publishing all videos...")
            for video in all_videos:
                video.is_published = True
            db.commit()
            print(f"✅ Published {len(all_videos)} videos")
        elif len(published_videos) > 0:
            print(f"\n✅ {len(published_videos)} videos are already published")
        
        db.close()
        return
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_videos()
