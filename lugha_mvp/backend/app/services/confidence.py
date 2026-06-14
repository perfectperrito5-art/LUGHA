"""Confidence scoring for the linguistic knowledge graph."""
import math

VERIFICATION_PENDING = "pending"
VERIFICATION_COMMUNITY = "community"
VERIFICATION_VERIFIED = "verified"


def compute_confidence(upvotes: int, voter_count: int, flag_count: int = 0) -> float:
    """Community-weighted trust score (0–99.9). Not absolute truth."""
    base = 42.0
    vote_boost = min(45.0, upvotes * 6.5)
    diversity = min(12.0, math.log1p(voter_count) * 4.5)
    penalty = min(25.0, flag_count * 8.0)
    return round(min(99.9, max(8.0, base + vote_boost + diversity - penalty)), 1)


def status_from_confidence(confidence: float, upvotes: int) -> str:
    if confidence >= 85 and upvotes >= 5:
        return VERIFICATION_VERIFIED
    if upvotes >= 1:
        return VERIFICATION_COMMUNITY
    return VERIFICATION_PENDING


def apply_vote(contribution, *, confirm: bool) -> None:
    if confirm:
        contribution.upvotes = (contribution.upvotes or 0) + 1
    else:
        contribution.flag_count = (getattr(contribution, "flag_count", 0) or 0) + 1
    voter_count = getattr(contribution, "voter_count", 0) or 0
    contribution.voter_count = voter_count + 1
    contribution.confidence_score = compute_confidence(
        contribution.upvotes or 0,
        contribution.voter_count,
        getattr(contribution, "flag_count", 0) or 0,
    )
    contribution.verification_status = status_from_confidence(
        contribution.confidence_score,
        contribution.upvotes or 0,
    )
