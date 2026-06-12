from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models as models # Import des modèles pour qu'ils soient connus de SQLAlchemy
from routers import api_router

app = FastAPI(
    title="Portfolio Backend API",
    description="Backend FastAPI avec PostgreSQL/Supabase et SQLAlchemy",
    version="1.0.0"
)

# Configuration CORS pour autoriser le frontend (React/Vite) à communiquer avec l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre aux URLs de prod plus tard
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API du Portfolio ! Le backend est opérationnel 🚀"}

# Inclusion de toutes les routes de l'API
app.include_router(api_router)
