from sqlalchemy import create_engine, text

engine = create_engine("mysql+pymysql://root:@localhost:3306/securite_routiere_db")

with engine.connect() as conn:
    # Mettre à jour tous les QCMs publiés sans date de publication
    result = conn.execute(text("""
        UPDATE qcms 
        SET published_at = created_at 
        WHERE is_published = 1 AND published_at IS NULL
    """))
    
    conn.commit()
    print(f"✅ {result.rowcount} QCMs mis à jour avec published_at = created_at")
    
    # Vérifier le résultat
    result = conn.execute(text("""
        SELECT id, title, is_published, published_at 
        FROM qcms 
        WHERE is_published = 1
        LIMIT 5
    """))
    
    print("\nQCMs publiés après mise à jour:")
    for row in result:
        print(f"  ID {row[0]}: {row[1]}")
        print(f"    published_at: {row[3]}")
