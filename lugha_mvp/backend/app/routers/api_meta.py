"""API manifest — discoverable infrastructure surface."""
from fastapi import APIRouter
from ..schemas import ApiManifestOut

router = APIRouter()


@router.get("", response_model=ApiManifestOut)
def api_manifest():
    return ApiManifestOut(
        name="Lugha Linguistic Intelligence API",
        version="1.0.0",
        description=(
            "Community-verified African language knowledge graph. "
            "Every endpoint produces or surfaces linguistic assets for future AI systems."
        ),
        docs_url="/docs",
        openapi_url="/openapi.json",
        endpoints=[
            {
                "group": "Knowledge Graph (v1)",
                "base": "/api/v1/knowledge",
                "routes": [
                    "GET /entries — search linguistic assets with confidence scores",
                    "GET /entries/{id} — single knowledge node",
                    "POST /entries/{id}/verify — community verification (auth)",
                ],
            },
            {
                "group": "Contributions",
                "base": "/api/contributions",
                "routes": [
                    "POST / — contribute words & heritage (auth)",
                    "GET / — list with filters",
                    "GET /stats — global totals",
                ],
            },
            {
                "group": "Languages",
                "base": "/api/languages",
                "routes": ["GET /", "GET /search", "GET /countries"],
            },
            {
                "group": "Cultural Playground",
                "base": "/api/v1/games",
                "routes": [
                    "GET /session — today's play stats (auth)",
                    "GET /word-roots/round — vocabulary game (auth)",
                    "GET /proverb-circle/round — proverb game (auth)",
                    "GET /guardian-ear/round — verification game (auth)",
                    "POST /answer — submit round (auth)",
                ],
            },
            {
                "group": "Live & Community",
                "base": "/api/live-feed",
                "routes": ["GET /recent", "GET /stream (SSE)"],
            },
        ],
    )
