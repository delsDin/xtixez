from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

# Création du moteur SQLAlchemy
engine = create_engine(settings.DATABASE_URL)

# Création du générateur de sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe de base pour les modèles ORM
Base = declarative_base()

# Dépendance pour obtenir une session de base de données dans FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
