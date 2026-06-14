"""Shared serializers for contributions → knowledge graph entries."""
from ..models import Contribution
from ..services.confidence import compute_confidence, status_from_confidence


def enrich_contribution(c: Contribution) -> dict:
    up = c.upvotes or 0
    voters = getattr(c, "voter_count", 0) or 0
    flags = getattr(c, "flag_count", 0) or 0
    conf = getattr(c, "confidence_score", None)
    if conf is None:
        conf = compute_confidence(up, voters, flags)
    status = getattr(c, "verification_status", None) or status_from_confidence(conf, up)
    return {
        "id": c.id,
        "word": c.word,
        "meaning": c.meaning,
        "example": c.example,
        "part_of_speech": c.part_of_speech,
        "content_type": getattr(c, "content_type", None) or "word",
        "region": c.region or "",
        "upvotes": up,
        "voter_count": voters,
        "confidence_score": conf,
        "verification_status": status,
        "created_at": c.created_at,
        "language": c.language,
        "user_name": c.user.name if c.user else "Anonymous",
    }
