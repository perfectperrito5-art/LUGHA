"""Lightweight schema migrations — safe to run on every startup."""
from sqlalchemy import inspect, text

from .database import SessionLocal, engine


def _column_names(table: str) -> set[str]:
    insp = inspect(engine)
    if not insp.has_table(table):
        return set()
    return {c["name"] for c in insp.get_columns(table)}


def run_migrations() -> None:
    with engine.begin() as conn:
        user_cols = _column_names("users")
        if user_cols and "username" not in user_cols:
            conn.execute(text(
                "ALTER TABLE users ADD COLUMN username VARCHAR(40) NULL AFTER name"
            ))

        contrib_cols = _column_names("contributions")
        if contrib_cols and "content_type" not in contrib_cols:
            conn.execute(text(
                "ALTER TABLE contributions ADD COLUMN content_type VARCHAR(40) DEFAULT 'word'"
            ))
        for col, ddl in [
            ("flag_count", "ALTER TABLE contributions ADD COLUMN flag_count INT NOT NULL DEFAULT 0"),
            ("voter_count", "ALTER TABLE contributions ADD COLUMN voter_count INT NOT NULL DEFAULT 0"),
            ("confidence_score", "ALTER TABLE contributions ADD COLUMN confidence_score FLOAT NOT NULL DEFAULT 42"),
            ("verification_status", "ALTER TABLE contributions ADD COLUMN verification_status VARCHAR(24) NOT NULL DEFAULT 'pending'"),
        ]:
            if contrib_cols and col not in contrib_cols:
                conn.execute(text(ddl))

        if contrib_cols and "audio_url" in contrib_cols:
            try:
                conn.execute(text(
                    "ALTER TABLE contributions MODIFY COLUMN audio_url MEDIUMTEXT NULL"
                ))
            except Exception:
                pass

        vote_cols = _column_names("contribution_votes")
        if vote_cols and "vote" not in vote_cols:
            conn.execute(text(
                "ALTER TABLE contribution_votes ADD COLUMN vote ENUM('confirm','differ') NOT NULL DEFAULT 'confirm'"
            ))
        if vote_cols and "created_at" not in vote_cols:
            conn.execute(text(
                "ALTER TABLE contribution_votes ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"
            ))

    _backfill_usernames()
    _backfill_confidence()
    _ensure_game_rounds_table()


def _ensure_game_rounds_table() -> None:
    insp = inspect(engine)
    if insp.has_table("game_rounds"):
        return
    with engine.begin() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS game_rounds (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              game_type VARCHAR(40) NOT NULL,
              contribution_id INT NULL,
              prompt_json TEXT,
              response_json TEXT,
              correct TINYINT NULL,
              points_awarded INT NOT NULL DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
              FOREIGN KEY (contribution_id) REFERENCES contributions(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """))


def _backfill_confidence() -> None:
    from .models import Contribution
    from .services.confidence import compute_confidence, status_from_confidence

    db = SessionLocal()
    try:
        rows = db.query(Contribution).all()
        changed = False
        for c in rows:
            conf = compute_confidence(c.upvotes or 0, getattr(c, "voter_count", 0) or 0, getattr(c, "flag_count", 0) or 0)
            status = status_from_confidence(conf, c.upvotes or 0)
            if getattr(c, "confidence_score", None) != conf or getattr(c, "verification_status", None) != status:
                c.confidence_score = conf
                c.verification_status = status
                changed = True
        if changed:
            db.commit()
    finally:
        db.close()


def _backfill_usernames() -> None:
    from .models import User

    db = SessionLocal()
    try:
        missing = db.query(User).filter(
            (User.username == None) | (User.username == "")  # noqa: E711
        ).all()
        if not missing:
            return

        for u in missing:
            base = (
                u.email.split("@")[0] if u.email else u.name
            ).lower().replace(".", "_").replace("-", "_")[:30]
            base = base or "user"
            candidate = base
            n = 1
            while db.query(User).filter(
                User.username == candidate, User.id != u.id
            ).first():
                candidate = f"{base}{n}"
                n += 1
            u.username = candidate
        db.commit()
    finally:
        db.close()
