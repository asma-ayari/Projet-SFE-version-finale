#!/usr/bin/env python3
"""
Test script to verify videos API endpoint
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.database import engine
from app.models.video import Video
from app.schemas.video import VideoListResponse
import json

db = Session(bind=engine)

try:
    # Import all models to ensure relationships
    from app.models.conversation import Conversation
    from app.models.qcm import QCM
    from app.models.course import Course
    from app.models.feedback import Feedback
    from app.models.user import User
    
    # Query published videos
    videos = db.query(Video).filter(Video.is_published == True).order_by(Video.created_at.desc()).limit(100).all()
    
    print(f"Found {len(videos)} published videos\n")
    
    # Convert to schema and display as JSON
    responses = [VideoListResponse.model_validate(v) for v in videos]
    
    for resp in responses:
        print(json.dumps(resp.model_dump(), indent=2, default=str))
        print()
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
