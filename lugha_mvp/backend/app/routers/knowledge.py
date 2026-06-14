"""API-first linguistic knowledge graph — public infrastructure layer."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Contribution, ContributionVote, User
from ..schemas import KnowledgeEntryOut, KnowledgeListOut, VoteOut, VoteRequest
from ..auth import get_current_user
from ..services.knowledge import enrich_contribution
from ..services.confidence import apply_vote

router = APIRouter()


def _entry(c: Contribution) -> KnowledgeEntryOut:
    d = enrich_contribution(c)
    lang = c.language
    return KnowledgeEntryOut(
        id=d["id"],
        term=d["word"],
        gloss=d["meaning"],
        example=d.get("example"),
        content_type=d["content_type"],
        part_of_speech=d["part_of_speech"],
        region=d["region"],
        language=lang.name if lang else "",
        language_iso=lang.iso_code if lang else "",
        confidence_score=d["confidence_score"],
        verification_status=d["verification_status"],
        upvotes=d["upvotes"],
        voter_count=d["voter_count"],
        contributor=d["user_name"],
        created_at=d["created_at"],
    )


@router.get("/entries", response_model=KnowledgeListOut)
def list_entries(
    language: Optional[str] = Query(None, description="Language name contains"),
    language_id: Optional[int] = None,
    content_type: Optional[str] = None,
    min_confidence: Optional[float] = Query(None, ge=0, le=100),
    region: Optional[str] = None,
    q: Optional[str] = Query(None, description="Search term or gloss"),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    qry = db.query(Contribution).options(
        joinedload(Contribution.language), joinedload(Contribution.user)
    )
    if language_id:
        qry = qry.filter(Contribution.language_id == language_id)
    if content_type:
        qry = qry.filter(Contribution.content_type == content_type)
    if min_confidence is not None:
        qry = qry.filter(Contribution.confidence_score >= min_confidence)
    if region:
        qry = qry.filter(Contribution.region.like(f"%{region}%"))
    if language:
        from ..models import Language as LangModel
        qry = qry.join(Contribution.language).filter(LangModel.name.like(f"%{language}%"))
    if q:
        like = f"%{q}%"
        qry = qry.filter((Contribution.word.like(like)) | (Contribution.meaning.like(like)))
    total = qry.count()
    rows = qry.order_by(Contribution.confidence_score.desc(), Contribution.created_at.desc()).offset(offset).limit(limit).all()
    return KnowledgeListOut(
        items=[_entry(c) for c in rows],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/entries/{entry_id}", response_model=KnowledgeEntryOut)
def get_entry(entry_id: int, db: Session = Depends(get_db)):
    c = (
        db.query(Contribution)
        .options(joinedload(Contribution.language), joinedload(Contribution.user))
        .filter(Contribution.id == entry_id)
        .first()
    )
    if not c:
        raise HTTPException(404, "Knowledge entry not found")
    return _entry(c)


@router.post("/entries/{entry_id}/verify", response_model=VoteOut)
def verify_entry(
    entry_id: int,
    payload: VoteRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    c = db.query(Contribution).filter(Contribution.id == entry_id).first()
    if not c:
        raise HTTPException(404, "Knowledge entry not found")
    existing = (
        db.query(ContributionVote)
        .filter(ContributionVote.user_id == user.id, ContributionVote.contribution_id == entry_id)
        .first()
    )
    if existing:
        raise HTTPException(400, "You already shared your view on this entry")
    confirm = payload.verdict == "confirm"
    db.add(ContributionVote(user_id=user.id, contribution_id=entry_id, vote=payload.verdict))
    apply_vote(c, confirm=confirm)
    user.points = (user.points or 0) + (3 if confirm else 1)
    db.commit()
    db.refresh(c)
    msg = (
        "Thank you — this entry grows stronger in the knowledge graph."
        if confirm
        else "Noted — regional variation helps our confidence model."
    )
    return VoteOut(
        contribution_id=c.id,
        confidence_score=c.confidence_score,
        verification_status=c.verification_status,
        upvotes=c.upvotes,
        voter_count=c.voter_count,
        message=msg,
    )
