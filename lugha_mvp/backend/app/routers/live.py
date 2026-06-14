import asyncio
import json
from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Contribution, User, Country, Language
from ..schemas import LiveFeedItem
from ..live_hub import subscribe, unsubscribe

router = APIRouter()


def _feed_item(c: Contribution) -> LiveFeedItem:
    country = ""
    flag = ""
    if c.user and c.user.country:
        country = c.user.country.name
        flag = c.user.country.flag_emoji or ""
    return LiveFeedItem(
        id=c.id,
        user_name=c.user.name if c.user else "Guardian",
        avatar_initial=c.user.avatar_initial if c.user else "A",
        word=c.word,
        language=c.language.name if c.language else "Language",
        content_type=getattr(c, "content_type", None) or "word",
        country=country,
        flag_emoji=flag,
        created_at=c.created_at,
    )


@router.get("/recent", response_model=List[LiveFeedItem])
def recent_feed(limit: int = 40, db: Session = Depends(get_db)):
    rows = (
        db.query(Contribution)
        .options(
            joinedload(Contribution.user).joinedload(User.country),
            joinedload(Contribution.language),
        )
        .order_by(Contribution.created_at.desc())
        .limit(limit)
        .all()
    )
    return [_feed_item(c) for c in rows]


@router.get("/stats")
def live_stats(db: Session = Depends(get_db)):
    since = datetime.utcnow() - timedelta(hours=24)
    today_words = (
        db.query(Contribution).filter(Contribution.created_at >= since).count()
    )
    active = (
        db.query(Contribution.user_id)
        .filter(Contribution.created_at >= since)
        .distinct()
        .count()
    )
    return {"words_today": today_words, "active_contributors": active}


@router.get("/stream")
async def live_stream():
    async def generator():
        q = subscribe()
        try:
            yield ": connected\n\n"
            while True:
                try:
                    event = await asyncio.wait_for(q.get(), timeout=8.0)
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    yield ": heartbeat\n\n"
        finally:
            unsubscribe(q)

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
