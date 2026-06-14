from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Contribution, Language, User, Country, UserLanguage, Badge, UserBadge
from ..schemas import ContributionCreate, ContributionOut, HeatmapPoint, UserStatsOut
from ..auth import get_current_user
from ..live_hub import publish
from ..services.knowledge import enrich_contribution

router = APIRouter()


def _to_out(c: Contribution) -> dict:
    return enrich_contribution(c)


async def _broadcast_contribution(c: Contribution, user: User):
    country = user.country.name if user.country else ""
    flag = user.country.flag_emoji if user.country else ""
    await publish({
        "event_type": "contribution.created",
        "payload": {
            "id": c.id,
            "user_name": user.name,
            "avatar_initial": user.avatar_initial,
            "word": c.word,
            "language": c.language.name if c.language else "",
            "content_type": getattr(c, "content_type", None) or "word",
            "country": country,
            "flag_emoji": flag,
            "created_at": c.created_at.isoformat(),
        },
    })


@router.post("", response_model=ContributionOut)
def create_contribution(
    payload: ContributionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    lang = db.query(Language).get(payload.language_id)
    if not lang:
        raise HTTPException(404, "Language not found")
    heritage = {"proverb", "folktale", "song", "story", "riddle"}
    pos = (payload.part_of_speech or "noun").lower()
    ctype = (payload.content_type or pos).lower()
    if ctype in heritage or pos in heritage:
        ctype = pos if pos in heritage else ctype
    elif ctype in ("noun", "verb", "adj", "adv", "interj", "phrase"):
        ctype = "phrase" if ctype == "phrase" else "word"
    c = Contribution(
        user_id=user.id,
        language_id=lang.id,
        word=payload.word.strip(),
        meaning=payload.meaning.strip(),
        example=payload.example,
        part_of_speech=payload.part_of_speech or "noun",
        content_type=ctype,
        region=payload.region or "",
        audio_url=payload.audio_url,
        confidence_score=48.0,
        verification_status="pending",
    )
    db.add(c)
    user.points = (user.points or 0) + 10
    db.commit()
    db.refresh(c)
    c.language = lang
    c.user = user
    background_tasks.add_task(_broadcast_contribution, c, user)
    return _to_out(c)


@router.get("", response_model=List[ContributionOut])
def list_contributions(
    language_id: Optional[int] = None,
    content_type: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    q = db.query(Contribution).options(
        joinedload(Contribution.language), joinedload(Contribution.user)
    )
    if language_id:
        q = q.filter(Contribution.language_id == language_id)
    if content_type:
        if content_type == "word":
            q = q.filter(Contribution.content_type.in_(["word", "noun", "verb"]))
        else:
            q = q.filter(Contribution.content_type == content_type)
    if search:
        like = f"%{search}%"
        q = q.filter((Contribution.word.like(like)) | (Contribution.meaning.like(like)))
    rows = q.order_by(Contribution.created_at.desc()).limit(limit).all()
    return [_to_out(c) for c in rows]


@router.get("/heatmap", response_model=List[HeatmapPoint])
def heatmap(db: Session = Depends(get_db)):
    rows = (
        db.query(
            Country.name,
            Country.iso_code,
            Country.flag_emoji,
            func.count(Contribution.id).label("n"),
        )
        .join(Language, Language.country_id == Country.id)
        .join(Contribution, Contribution.language_id == Language.id)
        .group_by(Country.id)
        .order_by(func.count(Contribution.id).desc())
        .all()
    )
    return [
        HeatmapPoint(country=r[0], iso_code=r[1], flag_emoji=r[2], contributions=r[3])
        for r in rows
    ]


@router.get("/stats")
def stats(db: Session = Depends(get_db)):
    return {
        "total_words": db.query(func.count(Contribution.id)).scalar() or 0,
        "total_languages": db.query(func.count(func.distinct(Contribution.language_id))).scalar() or 0,
        "total_contributors": db.query(func.count(func.distinct(Contribution.user_id))).scalar() or 0,
        "heritage_stories": db.query(func.count(Contribution.id))
        .filter(Contribution.content_type.in_(["proverb", "folktale", "song", "story", "riddle"]))
        .scalar()
        or 0,
    }


@router.get("/me/stats", response_model=UserStatsOut)
def my_stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    words = db.query(func.count(Contribution.id)).filter(Contribution.user_id == user.id).scalar() or 0

    # Streak: consecutive days with at least one contribution
    dates = (
        db.query(func.date(Contribution.created_at))
        .filter(Contribution.user_id == user.id)
        .distinct()
        .order_by(func.date(Contribution.created_at).desc())
        .all()
    )
    day_set = {d[0] for d in dates if d[0]}
    streak = 0
    day = datetime.utcnow().date()
    while day in day_set:
        streak += 1
        day -= timedelta(days=1)

    rank_rows = (
        db.query(User.id)
        .order_by(User.points.desc())
        .all()
    )
    rank_ids = [row[0] if isinstance(row, tuple) else int(row) for row in rank_rows]
    rank = next((i for i, uid in enumerate(rank_ids, 1) if uid == user.id), len(rank_ids) + 1)

    speaks = [
        l.name
        for _, l in db.query(UserLanguage, Language)
        .join(Language, Language.id == UserLanguage.language_id)
        .filter(UserLanguage.user_id == user.id, UserLanguage.role == "speaks")
        .all()
    ]
    learning = [
        l.name
        for _, l in db.query(UserLanguage, Language)
        .join(Language, Language.id == UserLanguage.language_id)
        .filter(UserLanguage.user_id == user.id, UserLanguage.role == "learning")
        .all()
    ]
    badges = [
        f"{b.icon} {b.name}"
        for _, b in db.query(UserBadge, Badge)
        .join(Badge, Badge.id == UserBadge.badge_id)
        .filter(UserBadge.user_id == user.id)
        .all()
    ]

    return UserStatsOut(
        points=user.points or 0,
        words_contributed=words,
        streak_days=streak,
        rank=rank,
        speaks=speaks,
        learning=learning,
        badges=badges,
    )
