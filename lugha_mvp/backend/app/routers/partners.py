from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import User, UserLanguage, Language, Country
from ..schemas import PartnerOut
from ..auth import get_current_user

router = APIRouter()


@router.get("", response_model=List[PartnerOut])
def find_partners(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Match users who speak languages you're learning (and vice versa)."""
    my_learning = {
        ul.language_id
        for ul in db.query(UserLanguage).filter_by(user_id=user.id, role="learning")
    }
    my_speaks = {
        ul.language_id
        for ul in db.query(UserLanguage).filter_by(user_id=user.id, role="speaks")
    }

    candidates = (
        db.query(User)
        .options(joinedload(User.country))
        .filter(User.id != user.id)
        .limit(80)
        .all()
    )

    out: list[PartnerOut] = []
    for u in candidates:
        speaks = {
            ul.language_id
            for ul in db.query(UserLanguage).filter_by(user_id=u.id, role="speaks")
        }
        learning = {
            ul.language_id
            for ul in db.query(UserLanguage).filter_by(user_id=u.id, role="learning")
        }
        # They speak what I want; I speak what they want
        match_for_me = speaks & my_learning
        match_for_them = my_speaks & learning
        score = len(match_for_me) * 2 + len(match_for_them)
        if score == 0 and not my_learning:
            # No learning prefs — show speakers of endangered langs
            score = 1 if speaks else 0
        if score == 0:
            continue

        lang_ids = match_for_me | match_for_them | speaks
        langs = db.query(Language).filter(Language.id.in_(lang_ids)).all() if lang_ids else []
        lang_names = [l.name for l in langs[:4]]

        out.append(
            PartnerOut(
                user_id=u.id,
                name=u.name,
                avatar_initial=u.avatar_initial,
                country=u.country.name if u.country else "Africa",
                flag_emoji=u.country.flag_emoji if u.country else "🌍",
                points=u.points or 0,
                match_score=score,
                languages=lang_names,
                reason=_reason(match_for_me, match_for_them, db),
            )
        )

    out.sort(key=lambda p: p.match_score, reverse=True)
    return out[:12]


def _reason(for_me: set, for_them: set, db: Session) -> str:
    if for_me and for_them:
        return "Mutual language exchange"
    if for_me:
        names = [l.name for l in db.query(Language).filter(Language.id.in_(for_me)).limit(2)]
        return f"Speaks {', '.join(names)} — your target language"
    return "Wants to learn a language you speak"
