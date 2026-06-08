from app.database import engine
from sqlalchemy import text

print("🔄 Test de connexion à MySQL...")

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("✅ Connexion MySQL réussie !")
        print(f"✅ Résultat du test : {result.fetchone()}")
        
        # Tester la base de données
        result = connection.execute(text("SELECT DATABASE()"))
        db_name = result.fetchone()[0]
        print(f"✅ Base de données active : {db_name}")
        
except Exception as e:
    print(f"❌ Erreur de connexion : {e}")
    print("\n💡 Vérifiez que :")
    print("   1. XAMPP MySQL est démarré")
    print("   2. La base 'securite_routiere_db' existe")
    print("   3. Le fichier .env contient la bonne DATABASE_URL")