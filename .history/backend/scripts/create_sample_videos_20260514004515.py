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
        existing_videos = db.query(Video).first()
        if existing_videos:
            print("✓ Videos already exist in database")
            db.close()
            return
        
        # Get or create a formateur user
        formateur = db.query(User).filter(User.role == UserRole.formateur).first()
        
        if not formateur:
            print("❌ No formateur found in database. Creating admin user first.")
            admin = User(
                username="formateur_test",
                email="formateur@test.com",
                full_name="Formateur Test",
                is_active=True,
                role=UserRole.formateur,
                auth_provider="local"
            )
            admin.set_password("password123")
            db.add(admin)
            db.commit()
            formateur = admin
            print(f"✓ Created test formateur: {formateur.username}")
        else:
            print(f"✓ Using existing formateur: {formateur.username}")
        
        # Sample videos data
        sample_videos = [
            {
                "title": "Introduction à la sécurité routière",
                "description": "Tutoriel complet sur les bases de la sécurité routière en Tunisie",
                "category": VideoCategory.securite,
                "file_path": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                "duration": 600,
            },
            {
                "title": "Techniques de conduite défensive",
                "description": "Apprenez les meilleures pratiques pour une conduite sécurisée",
                "category": VideoCategory.conduite,
                "file_path": "https://www.youtube.com/embed/9bZkp7q19f0",
                "duration": 720,
            },
            {
                "title": "Signalisation routière - Panneaux importants",
                "description": "Comprendre les panneaux de signalisation routière",
                "category": VideoCategory.signalisation,
                "file_path": "https://www.youtube.com/embed/jNQXAC9IVRw",
                "duration": 480,
            },
            {
                "title": "Premiers secours en cas d'accident",
                "description": "Procédures essentielles pour aider en cas d'accident",
                "category": VideoCategory.secours,
                "file_path": "https://www.youtube.com/embed/aqz-KE-bpKQ",
                "duration": 900,
            },
            {
                "title": "Code de la route - Généralités",
                "description": "Vue d'ensemble du code de la route tunisien",
                "category": VideoCategory.general,
                "file_path": "https://www.youtube.com/embed/ZQyv7dbYX3w",
                "duration": 540,
            },
        ]
        
        # Create videos
        for video_data in sample_videos:
            video = Video(
                title=video_data["title"],
                description=video_data["description"],
                category=video_data["category"],
                file_path=video_data["file_path"],
                duration=video_data.get("duration"),
                is_published=True,  # Publish immediately
                formateur_id=formateur.id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(video)
            print(f"✓ Created video: {video.title}")
        
        db.commit()
        
        # Verify
        total_videos = db.query(Video).count()
        published_videos = db.query(Video).filter(Video.is_published == True).count()
        
        print(f"\n✅ Success!")
        print(f"   Total videos: {total_videos}")
        print(f"   Published videos: {published_videos}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_videos()
