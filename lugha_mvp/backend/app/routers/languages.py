from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Language, Country
from ..schemas import LanguageOut, CountryOut

router = APIRouter()


@router.get("/", response_model=List[LanguageOut])
def list_languages(db: Session = Depends(get_db)):
    return db.query(Language).options(joinedload(Language.country)).order_by(Language.speakers.desc()).all()


@router.get("/search", response_model=List[LanguageOut])
def search_languages(
    q: Optional[str] = None,
    limit: int = Query(8, le=20),
    db: Session = Depends(get_db),
):
    query = db.query(Language).options(joinedload(Language.country))
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(Language.name.like(like))
    return query.order_by(Language.speakers.desc(), Language.name).limit(limit).all()


@router.get("/countries", response_model=List[CountryOut])
def list_countries(db: Session = Depends(get_db)):
    return db.query(Country).order_by(Country.name).all()
