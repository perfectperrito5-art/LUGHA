from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


class CountryOut(BaseModel):
    id: int
    name: str
    iso_code: str
    flag_emoji: str
    region: str
    class Config: from_attributes = True


class LanguageOut(BaseModel):
    id: int
    name: str
    iso_code: str
    family: str
    speakers: int
    is_endangered: int
    description: Optional[str] = None
    country: Optional[CountryOut] = None
    class Config: from_attributes = True


class UserRegister(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    username: str = Field(min_length=3, max_length=40, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    country_id: Optional[int] = None
    speaks: List[int] = []
    learning: List[int] = []


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    username: str
    email: EmailStr
    avatar_initial: str
    points: int
    country: Optional[CountryOut] = None
    class Config: from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ContributionCreate(BaseModel):
    language_id: int
    word: str = Field(min_length=1, max_length=160)
    meaning: str = Field(min_length=1, max_length=255)
    example: Optional[str] = None
    part_of_speech: Optional[str] = "noun"
    content_type: Optional[str] = "word"
    region: Optional[str] = ""
    audio_url: Optional[str] = None


class ContributionOut(BaseModel):
    id: int
    word: str
    meaning: str
    example: Optional[str]
    part_of_speech: str
    content_type: str = "word"
    region: str
    upvotes: int
    voter_count: int = 0
    confidence_score: float = 42.0
    verification_status: str = "pending"
    created_at: datetime
    language: LanguageOut
    user_name: str
    class Config: from_attributes = True


class KnowledgeEntryOut(BaseModel):
    """Public linguistic intelligence object — API-first knowledge graph node."""
    id: int
    term: str
    gloss: str
    example: Optional[str] = None
    content_type: str
    part_of_speech: str
    region: str
    language: str
    language_iso: str = ""
    confidence_score: float
    verification_status: str
    upvotes: int
    voter_count: int
    contributor: str
    created_at: datetime


class KnowledgeListOut(BaseModel):
    items: List[KnowledgeEntryOut]
    total: int
    limit: int
    offset: int


class VoteRequest(BaseModel):
    verdict: str = Field(pattern=r"^(confirm|differ)$")


class VoteOut(BaseModel):
    contribution_id: int
    confidence_score: float
    verification_status: str
    upvotes: int
    voter_count: int
    message: str


class GameOption(BaseModel):
    id: str
    text: str


class GameRoundOut(BaseModel):
    round_id: int
    game_type: str
    prompt: str
    sub_prompt: Optional[str] = None
    language: str
    language_flag: str = ""
    options: List[GameOption] = []
    meta: dict = {}


class GameAnswerIn(BaseModel):
    round_id: int
    selected_id: Optional[str] = None
    verdict: Optional[str] = None


class GameAnswerOut(BaseModel):
    correct: Optional[bool] = None
    points_awarded: int
    message: str
    reveal: Optional[str] = None
    confidence_score: Optional[float] = None
    session_points: int = 0


class GameSessionOut(BaseModel):
    games_played_today: int
    session_points: int
    available: List[dict]


class ApiManifestOut(BaseModel):
    name: str
    version: str
    description: str
    docs_url: str
    openapi_url: str
    endpoints: List[dict]


class LiveFeedItem(BaseModel):
    id: int
    user_name: str
    avatar_initial: str
    word: str
    language: str
    content_type: str
    country: str = ""
    flag_emoji: str = ""
    created_at: datetime


class PartnerOut(BaseModel):
    user_id: int
    name: str
    avatar_initial: str
    country: str
    flag_emoji: str
    points: int
    match_score: int
    languages: List[str]
    reason: str


class UserStatsOut(BaseModel):
    points: int
    words_contributed: int
    streak_days: int
    rank: int
    speaks: List[str] = []
    learning: List[str] = []
    badges: List[str] = []


class BadgeOut(BaseModel):
    code: str
    name: str
    icon: str
    description: str


class LeaderboardMe(BaseModel):
    rank: int
    points: int
    contributions: int


class TranslateRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2000)
    source_lang: str
    target_lang: str


class TranslateResponse(BaseModel):
    translated: str
    provider: str
    source_lang: str
    target_lang: str


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    name: str
    avatar_initial: str
    points: int
    contributions: int
    badges: List[str] = []


class HeatmapPoint(BaseModel):
    country: str
    iso_code: str
    contributions: int
    flag_emoji: str
