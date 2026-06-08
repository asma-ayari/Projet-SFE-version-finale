from sqlalchemy import inspect, create_engine

engine = create_engine("mysql+pymysql://root:@localhost:3306/securite_routiere_db")
inspector = inspect(engine)
columns = inspector.get_columns('qcms')

print("Colonnes de la table qcms:")
for col in columns:
    print(f"  {col['name']}: {col['type']}")
    
# Vérifier si published_at existe
col_names = [col['name'] for col in columns]
if 'published_at' in col_names:
    print("\n✅ published_at EXISTS")
else:
    print("\n❌ published_at MISSING - Nécessite migration")
