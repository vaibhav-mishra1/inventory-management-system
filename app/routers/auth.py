from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import REFRESH_TOKEN_EXPIRE_DAYS
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import RefreshTokenRequest, TokenResponse
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.utils.auth_service import (
    revoke_refresh_token,
    save_refresh_token,
    validate_refresh_token,
)

router = APIRouter(prefix="/auth", tags=["Auth"])

# Use a PBKDF2-based scheme to avoid direct bcrypt dependency issues and
# the 72-byte password length limit. For a college project this is
# perfectly acceptable and keeps the implementation simple.
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto",
)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

@router.post("/login", response_model=TokenResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):  # type: ignore
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    # creating access token
    access_token = create_access_token(
        subject=str(db_user.id),
        role=str(db_user.role)
    )

    # create refresh token
    refresh_token, jti = create_refresh_token(user_id=db_user.id) # type: ignore

    # save refresh token in DB
    save_refresh_token(
        db,
        user_id=db_user.id, # type: ignore
        jti=jti,
        expires_at=datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    )
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=TokenResponse)
def refresh_tokens(body: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Exchange a valid refresh token for new access + refresh tokens (rotation)."""
    payload = decode_refresh_token(body.refresh_token)
    jti = payload.get("jti")
    user_id_str = payload.get("sub")
    if not jti or not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token payload",
        )

    token_row = validate_refresh_token(db, jti)
    if not token_row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired or revoked",
        )

    user_id = int(user_id_str)
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    # Revoke old refresh token (rotation)
    revoke_refresh_token(db, jti)

    # Issue new access + refresh tokens
    new_access_token = create_access_token(
        subject=str(db_user.id),
        role=str(db_user.role),
    )
    new_refresh_token, new_jti = create_refresh_token(user_id=db_user.id) # type: ignore

    save_refresh_token(
        db,
        user_id=db_user.id, # type: ignore
        jti=new_jti,
        expires_at=datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    )

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
    }


@router.post("/logout")
def logout(body: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Revoke the given refresh token so it cannot be used again."""
    try:
        payload = decode_refresh_token(body.refresh_token)
        jti = payload.get("jti")
        if jti:
            revoke_refresh_token(db, jti)
    except HTTPException:
        # Invalid/expired token - still return 200 so client can clear storage
        pass
    return {"message": "Logged out successfully"}


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    #  Check if username already exists
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already registered")

    # Hash the password
    hashed_password = get_password_hash(user.password)

    # Create the new user object
    new_user = User(
        username=user.username,
        password_hash=hashed_password,
        role="staff"  # Default role for new signups
    )

    # Save to PostgreSQL
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user