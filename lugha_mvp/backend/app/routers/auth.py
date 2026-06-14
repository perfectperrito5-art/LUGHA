from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, UserLanguage
from ..schemas import UserRegister, TokenOut, UserOut
from ..auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()


@router.post("/register", response_model=TokenOut)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(400, "Email already registered")
    uname = payload.username.strip().lower()
    if db.query(User).filter(User.username == uname).first():
        raise HTTPException(400, "Username already taken")
    user = User(
        name=payload.name.strip(),
        username=uname,
        email=payload.email,
        password_hash=hash_password(payload.password),
        country_id=payload.country_id,
        avatar_initial=(payload.name.strip()[:1] or "A").upper(),
    )
    db.add(user); db.flush()
    for lid in payload.speaks:
        db.add(UserLanguage(user_id=user.id, language_id=lid, role="speaks"))
    for lid in payload.learning:
        db.add(UserLanguage(user_id=user.id, language_id=lid, role="learning"))
    db.commit(); db.refresh(user)
    return TokenOut(access_token=create_access_token(user.id), user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenOut)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # form.username carries the email (OAuth2 standard)
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    return TokenOut(access_token=create_access_token(user.id), user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
