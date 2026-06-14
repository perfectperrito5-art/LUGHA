from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
load_dotenv()

from .database import Base, engine
from .migrations import run_migrations
from .routers import auth, languages, contributions, translations, leaderboard, live, partners, knowledge, games, api_meta

Base.metadata.create_all(bind=engine)
run_migrations()

app = FastAPI(
    title="Lugha API",
    description=(
        "African linguistic intelligence infrastructure — "
        "community-verified knowledge graph, contributions, translation, and cultural data games."
    ),
    version="1.0.0",
)

_cors = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost,http://127.0.0.1",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_meta.router,       prefix="/api",               tags=["api"])
app.include_router(knowledge.router,      prefix="/api/v1/knowledge",  tags=["knowledge"])
app.include_router(games.router,          prefix="/api/v1/games",      tags=["games"])
app.include_router(auth.router,          prefix="/api/auth",          tags=["auth"])
app.include_router(languages.router,     prefix="/api/languages",     tags=["languages"])
app.include_router(contributions.router, prefix="/api/contributions", tags=["contributions"])
app.include_router(translations.router,  prefix="/api/translate",     tags=["translate"])
app.include_router(leaderboard.router,   prefix="/api",               tags=["leaderboard"])
app.include_router(live.router,          prefix="/api/live-feed",     tags=["live"])
app.include_router(partners.router,      prefix="/api/partners",      tags=["partners"])


@app.get("/")
def root():
    return {"name": "Lugha API", "status": "ok", "docs": "/docs"}
