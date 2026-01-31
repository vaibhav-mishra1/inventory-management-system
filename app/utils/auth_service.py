from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.refresh_token import RefreshToken


def save_refresh_token(
    db: Session,
    *,
    user_id: int,
    jti: str,
    expires_at: datetime,
) -> RefreshToken:
    token = RefreshToken(
        user_id=user_id,
        jti=jti,
        expires_at=expires_at,
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return token


def get_refresh_token_by_jti(db: Session, jti: str) -> RefreshToken | None:
    return db.query(RefreshToken).filter(RefreshToken.jti == jti).first()


def revoke_refresh_token(
    db: Session,
    jti: str,
    *,
    replaced_by: str | None = None,
) -> bool:
    row = db.query(RefreshToken).filter(RefreshToken.jti == jti).first()
    if not row:
        return False
    row.revoked = True # type: ignore
    if replaced_by is not None:
        row.replaced_by = replaced_by # type: ignore
    db.commit()
    return True


def validate_refresh_token(db: Session, jti: str) -> RefreshToken | None:
    """Return the RefreshToken row if it exists, is not revoked, and not expired."""
    row = db.query(RefreshToken).filter(RefreshToken.jti == jti).first()
    if not row:
        return None
    if row.revoked: # type: ignore
        return None
    now = datetime.now(timezone.utc)
    if row.expires_at < now: # type: ignore
        return None
    return row