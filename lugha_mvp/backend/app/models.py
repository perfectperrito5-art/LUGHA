from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Enum, BigInteger, SmallInteger, Float
)
from sqlalchemy.orm import relationship
from .database import Base


class Country(Base):
    __tablename__ = "countries"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), unique=True, nullable=False)
    iso_code = Column(String(2), unique=True, nullable=False)
    flag_emoji = Column(String(8), default="")
    region = Column(String(40), default="")
    languages = relationship("Language", back_populates="country")


class Language(Base):
    __tablename__ = "languages"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), unique=True, nullable=False)
    iso_code = Column(String(8), nullable=False)
    family = Column(String(60), default="")
    speakers = Column(BigInteger, default=0)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=True)
    is_endangered = Column(SmallInteger, default=0)
    description = Column(Text)
    country = relationship("Country", back_populates="languages")
    contributions = relationship("Contribution", back_populates="language")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), nullable=False)
    username = Column(String(40), unique=True, nullable=False, index=True)
    email = Column(String(160), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=True)
    avatar_initial = Column(String(1), default="A")
    points = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    country = relationship("Country")
    contributions = relationship("Contribution", back_populates="user")
    user_languages = relationship("UserLanguage", back_populates="user")


class UserLanguage(Base):
    __tablename__ = "user_languages"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    language_id = Column(Integer, ForeignKey("languages.id"), primary_key=True)
    role = Column(Enum("speaks", "learning"), primary_key=True)
    user = relationship("User", back_populates="user_languages")
    language = relationship("Language")


class Contribution(Base):
    __tablename__ = "contributions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    language_id = Column(Integer, ForeignKey("languages.id"), nullable=False)
    word = Column(String(160), nullable=False)
    meaning = Column(String(255), nullable=False)
    example = Column(Text)
    part_of_speech = Column(String(40), default="noun")
    content_type = Column(String(40), default="word")
    region = Column(String(80), default="")
    audio_url = Column(Text)
    upvotes = Column(Integer, default=0)
    flag_count = Column(Integer, default=0)
    voter_count = Column(Integer, default=0)
    confidence_score = Column(Float, default=42.0)
    verification_status = Column(String(24), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="contributions")
    language = relationship("Language", back_populates="contributions")
    votes = relationship("ContributionVote", back_populates="contribution")


class ContributionVote(Base):
    __tablename__ = "contribution_votes"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    contribution_id = Column(Integer, ForeignKey("contributions.id"), primary_key=True)
    vote = Column(Enum("confirm", "differ", name="vote_type"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User")
    contribution = relationship("Contribution", back_populates="votes")


class GameRound(Base):
    __tablename__ = "game_rounds"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    game_type = Column(String(40), nullable=False)
    contribution_id = Column(Integer, ForeignKey("contributions.id"), nullable=True)
    prompt_json = Column(Text)
    response_json = Column(Text)
    correct = Column(SmallInteger, nullable=True)
    points_awarded = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Translation(Base):
    __tablename__ = "translations"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    source_lang = Column(String(80), nullable=False)
    target_lang = Column(String(80), nullable=False)
    source_text = Column(Text, nullable=False)
    translated = Column(Text, nullable=False)
    provider = Column(String(40), default="mock")
    created_at = Column(DateTime, default=datetime.utcnow)


class Badge(Base):
    __tablename__ = "badges"
    id = Column(Integer, primary_key=True)
    code = Column(String(40), unique=True, nullable=False)
    name = Column(String(80), nullable=False)
    icon = Column(String(8), nullable=False)
    description = Column(String(255), nullable=False)


class UserBadge(Base):
    __tablename__ = "user_badges"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    badge_id = Column(Integer, ForeignKey("badges.id"), primary_key=True)
    awarded_at = Column(DateTime, default=datetime.utcnow)
