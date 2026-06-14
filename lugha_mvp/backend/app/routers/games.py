"""Cultural playground — games that generate linguistic data without feeling like work."""
import json
import random
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Contribution, ContributionVote, GameRound, User, Language
from ..schemas import GameAnswerIn, GameAnswerOut, GameOption, GameRoundOut, GameSessionOut
from ..auth import get_current_user
from ..services.confidence import apply_vote

router = APIRouter()

GAME_META = {
    "word_roots": {
        "title": "Word Roots",
        "tagline": "Recognise a word from the mother tongue",
        "icon": "🌱",
        "points_per_round": 4,
    },
    "proverb_circle": {
        "title": "Proverb Circle",
        "tagline": "Complete the wisdom of elders",
        "icon": "🪘",
        "points_per_round": 5,
    },
    "guardian_ear": {
        "title": "Guardian's Ear",
        "tagline": "Confirm what your community still speaks",
        "icon": "👂",
        "points_per_round": 3,
    },
}


def _session_points_today(db: Session, user_id: int) -> int:
    since = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    return (
        db.query(func.coalesce(func.sum(GameRound.points_awarded), 0))
        .filter(GameRound.user_id == user_id, GameRound.created_at >= since)
        .scalar()
        or 0
    )


def _games_today(db: Session, user_id: int) -> int:
    since = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    return (
        db.query(func.count(GameRound.id))
        .filter(GameRound.user_id == user_id, GameRound.created_at >= since)
        .scalar()
        or 0
    )


def _pick_contribution(db: Session, *, content_types: list[str], exclude_ids: set[int] | None = None):
    q = (
        db.query(Contribution)
        .options(
            joinedload(Contribution.language).joinedload(Language.country),
            joinedload(Contribution.user),
        )
        .filter(Contribution.content_type.in_(content_types))
    )
    if exclude_ids:
        q = q.filter(~Contribution.id.in_(exclude_ids))
    rows = q.all()
    return random.choice(rows) if rows else None


def _decoy_meanings(db: Session, lang_id: int, correct_id: int, n: int = 3) -> list[str]:
    rows = (
        db.query(Contribution.meaning)
        .filter(Contribution.language_id == lang_id, Contribution.id != correct_id)
        .limit(60)
        .all()
    )
    pool = []
    seen = set()
    for row in rows:
        text = (row[0] if isinstance(row, tuple) else row) or ""
        text = text.strip()
        if text and text not in seen:
            seen.add(text)
            pool.append(text)
    if len(pool) < n:
        extra = (
            db.query(Contribution.meaning)
            .filter(Contribution.id != correct_id, Contribution.language_id != lang_id)
            .limit(40)
            .all()
        )
        for row in extra:
            text = (row[0] if isinstance(row, tuple) else row) or ""
            text = text.strip()
            if text and text not in seen:
                seen.add(text)
                pool.append(text)
            if len(pool) >= n:
                break
    random.shuffle(pool)
    fallbacks = [
        "A greeting among friends",
        "A word for family and home",
        "Something shared at celebrations",
    ]
    while len(pool) < n:
        fb = fallbacks[len(pool) % len(fallbacks)]
        if fb not in seen:
            pool.append(fb)
            seen.add(fb)
        else:
            pool.append(f"{fb} ({len(pool)})")
    return pool[:n]


@router.get("/session", response_model=GameSessionOut)
def game_session(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return GameSessionOut(
        games_played_today=_games_today(db, user.id),
        session_points=_session_points_today(db, user.id),
        available=[{"id": k, **v} for k, v in GAME_META.items()],
    )


@router.get("/word-roots/round", response_model=GameRoundOut)
def word_roots_round(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = _pick_contribution(db, content_types=["word", "noun", "verb", "phrase", "interj"])
    if not c:
        raise HTTPException(404, "Not enough words yet — teach AI a few first!")
    decoys = _decoy_meanings(db, c.language_id, c.id)
    options = [{"id": "correct", "text": c.meaning}] + [
        {"id": f"d{i}", "text": t} for i, t in enumerate(decoys[:3])
    ]
    random.shuffle(options)
    prompt = {
        "correct_id": "correct",
        "options": options,
        "word": c.word,
    }
    rnd = GameRound(
        user_id=user.id,
        game_type="word_roots",
        contribution_id=c.id,
        prompt_json=json.dumps(prompt),
    )
    db.add(rnd)
    db.commit()
    db.refresh(rnd)
    flag = c.language.country.flag_emoji if c.language and c.language.country else ""
    return GameRoundOut(
        round_id=rnd.id,
        game_type="word_roots",
        prompt=c.word,
        sub_prompt=f"What does this mean in {c.language.name}?",
        language=c.language.name,
        language_flag=flag,
        options=[GameOption(**o) for o in options],
        meta={"hint": "No rush — this is cultural curiosity, not a test."},
    )


@router.get("/proverb-circle/round", response_model=GameRoundOut)
def proverb_round(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = _pick_contribution(db, content_types=["proverb", "riddle", "story"])
    if not c:
        raise HTTPException(404, "No proverbs in the library yet — add one in Heritage!")
    decoys = _decoy_meanings(db, c.language_id, c.id)
    while len(decoys) < 3:
        decoys.append("A lesson about patience and community")
    options = [{"id": "correct", "text": c.meaning[:120]}] + [
        {"id": f"d{i}", "text": (t[:120] if t else "Wisdom passed orally")} for i, t in enumerate(decoys[:3])
    ]
    random.shuffle(options)
    prompt = {"correct_id": "correct", "options": options}
    rnd = GameRound(
        user_id=user.id,
        game_type="proverb_circle",
        contribution_id=c.id,
        prompt_json=json.dumps(prompt),
    )
    db.add(rnd)
    db.commit()
    db.refresh(rnd)
    return GameRoundOut(
        round_id=rnd.id,
        game_type="proverb_circle",
        prompt=c.word,
        sub_prompt="What wisdom does this carry?",
        language=c.language.name,
        options=[GameOption(**o) for o in options],
        meta={"tone": "elders"},
    )


@router.get("/guardian-ear/round", response_model=GameRoundOut)
def guardian_round(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    voted_ids = {
        r[0]
        for r in db.query(ContributionVote.contribution_id)
        .filter(ContributionVote.user_id == user.id)
        .all()
    }
    c = _pick_contribution(db, content_types=["word", "noun", "verb", "phrase", "proverb"], exclude_ids=voted_ids)
    if not c:
        raise HTTPException(404, "You've reviewed everything for now — check back soon!")
    rnd = GameRound(
        user_id=user.id,
        game_type="guardian_ear",
        contribution_id=c.id,
        prompt_json=json.dumps({"contribution_id": c.id}),
    )
    db.add(rnd)
    db.commit()
    db.refresh(rnd)
    region = c.region or (c.language.country.name if c.language and c.language.country else "")
    return GameRoundOut(
        round_id=rnd.id,
        game_type="guardian_ear",
        prompt=c.word,
        sub_prompt=c.meaning,
        language=c.language.name,
        options=[
            GameOption(id="confirm", text="Yes — we say this"),
            GameOption(id="differ", text="Not quite in my region"),
            GameOption(id="skip", text="Skip for now"),
        ],
        meta={"region": region, "example": c.example or ""},
    )


@router.post("/answer", response_model=GameAnswerOut)
def submit_answer(
    payload: GameAnswerIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rnd = db.query(GameRound).filter(GameRound.id == payload.round_id, GameRound.user_id == user.id).first()
    if not rnd:
        raise HTTPException(404, "Round not found")
    if rnd.response_json:
        raise HTTPException(400, "Round already completed")

    meta = GAME_META.get(rnd.game_type, {})
    base_pts = meta.get("points_per_round", 3)
    points = 0
    correct = None
    reveal = None
    conf = None

    if rnd.game_type == "guardian_ear":
        verdict = payload.verdict or payload.selected_id
        if verdict == "skip":
            rnd.response_json = json.dumps({"verdict": "skip"})
            rnd.correct = None
            rnd.points_awarded = 0
            db.commit()
            return GameAnswerOut(
                points_awarded=0,
                message="No problem — play at your own pace.",
                session_points=_session_points_today(db, user.id),
            )
        if verdict not in ("confirm", "differ"):
            raise HTTPException(400, "Choose confirm, differ, or skip")
        c = db.query(Contribution).filter(Contribution.id == rnd.contribution_id).first()
        if not c:
            raise HTTPException(404, "Entry missing")
        existing = (
            db.query(ContributionVote)
            .filter(ContributionVote.user_id == user.id, ContributionVote.contribution_id == c.id)
            .first()
        )
        if not existing:
            db.add(ContributionVote(user_id=user.id, contribution_id=c.id, vote=verdict))
            apply_vote(c, confirm=(verdict == "confirm"))
            conf = c.confidence_score
        points = base_pts
        user.points = (user.points or 0) + points
        msg = (
            "Asante — you strengthened the knowledge graph."
            if verdict == "confirm"
            else "Thank you — regional nuance makes our data richer."
        )
        rnd.response_json = json.dumps({"verdict": verdict})
        rnd.correct = 1 if verdict == "confirm" else 0
        rnd.points_awarded = points
        db.commit()
        return GameAnswerOut(
            correct=verdict == "confirm",
            points_awarded=points,
            message=msg,
            confidence_score=conf,
            session_points=_session_points_today(db, user.id) + points,
        )

    # word_roots / proverb_circle
    prompt = json.loads(rnd.prompt_json or "{}")
    selected = payload.selected_id
    is_correct = selected == prompt.get("correct_id")
    correct = is_correct
    points = base_pts + (2 if is_correct else 1)
    user.points = (user.points or 0) + points
    c = db.query(Contribution).filter(Contribution.id == rnd.contribution_id).first()
    reveal = c.meaning if c else None
    rnd.response_json = json.dumps({"selected_id": selected, "correct": is_correct})
    rnd.correct = 1 if is_correct else 0
    rnd.points_awarded = points
    db.commit()
    msg = (
        "Beautiful — your roots run deep."
        if is_correct
        else f"Almost — the community shares: “{reveal}”"
    )
    return GameAnswerOut(
        correct=is_correct,
        points_awarded=points,
        message=msg,
        reveal=reveal if not is_correct else None,
        session_points=_session_points_today(db, user.id),
    )
