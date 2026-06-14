from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Contribution, Badge, UserBadge
from ..schemas import LeaderboardEntry, LeaderboardMe, BadgeOut
from ..auth import get_current_user
from ..models import User as UserModel

router = APIRouter()


@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def leaderboard(db: Session = Depends(get_db)):
    rows = (
        db.query(User, func.count(Contribution.id).label("n"))
        .outerjoin(Contribution, Contribution.user_id == User.id)
        .group_by(User.id)
        .order_by(desc(User.points), desc("n"))
        .limit(50)
        .all()
    )
    # preload badges
    badge_map: dict[int, list[str]] = {}
    for ub, b in db.query(UserBadge, Badge).join(Badge, Badge.id == UserBadge.badge_id).all():
        badge_map.setdefault(ub.user_id, []).append(f"{b.icon} {b.name}")

    out = []
    for i, (u, n) in enumerate(rows, start=1):
        out.append(LeaderboardEntry(
            rank=i, user_id=u.id, name=u.name, avatar_initial=u.avatar_initial,
            points=u.points or 0, contributions=int(n or 0),
            badges=badge_map.get(u.id, []),
        ))
    return out


@router.get("/leaderboard/me", response_model=LeaderboardMe)
def my_rank(user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(User, func.count(Contribution.id).label("n"))
        .outerjoin(Contribution, Contribution.user_id == User.id)
        .group_by(User.id)
        .order_by(desc(User.points), desc("n"))
        .all()
    )
    for i, (u, n) in enumerate(rows, start=1):
        if u.id == user.id:
            return LeaderboardMe(rank=i, points=u.points or 0, contributions=int(n or 0))
    return LeaderboardMe(rank=len(rows) + 1, points=user.points or 0, contributions=0)


@router.get("/badges", response_model=List[BadgeOut])
def all_badges(db: Session = Depends(get_db)):
    return [
        BadgeOut(code=b.code, name=b.name, icon=b.icon, description=b.description)
        for b in db.query(Badge).order_by(Badge.id).all()
    ]
