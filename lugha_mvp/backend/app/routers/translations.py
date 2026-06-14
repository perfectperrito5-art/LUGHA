from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Translation, User
from ..schemas import TranslateRequest, TranslateResponse
from ..auth import get_optional_user
from ..ai import translate as ai_translate

router = APIRouter()


@router.post("", response_model=TranslateResponse)
async def do_translate(
    payload: TranslateRequest,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    text, provider = await ai_translate(payload.text, payload.source_lang, payload.target_lang)
    db.add(Translation(
        user_id=user.id if user else None,
        source_lang=payload.source_lang, target_lang=payload.target_lang,
        source_text=payload.text, translated=text, provider=provider,
    ))
    db.commit()
    return TranslateResponse(
        translated=text, provider=provider,
        source_lang=payload.source_lang, target_lang=payload.target_lang,
    )
