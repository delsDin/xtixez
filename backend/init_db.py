import os
from sqlalchemy import text
from database import engine, Base
import models

def init_db():
    """
    Initialise la base de données en exécutant le fichier schema.sql.
    Cela crée toutes les tables sans nécessiter alembic ou metadata.create_all() pour le moment.
    """
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    
    if not os.path.exists(schema_path):
        print(f"Erreur : Le fichier {schema_path} est introuvable.")
        return
        
    print("Lecture de schema.sql...")
    with open(schema_path, "r", encoding="utf-8") as f:
        sql_commands = f.read()
        
    print("Exécution des requêtes SQL...")
    with engine.begin() as conn:
        conn.execute(text(sql_commands))
        
    print("✅ Base de données initialisée avec succès à partir de schema.sql !")

if __name__ == "__main__":
    init_db()
