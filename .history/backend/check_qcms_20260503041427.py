from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

engine = create_engine("mysql+pymysql://root:@localhost:3306/securite_routiere_db")

with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT id, title, is_published, published_at 
        FROM qcms 
        LIMIT 5
    """))
    
    print("QCMs dans la base:")
    for row in result:
        print(f"  ID {row[0]}: {row[1]}")
        print(f"    is_published: {row[2]}, published_at: {row[3]}")
